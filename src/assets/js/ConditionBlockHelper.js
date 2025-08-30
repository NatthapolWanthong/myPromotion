// src/assets/js/ConditionBlockHelper.js
export class ConditionBlockHelper {
  // --- Helpers internal ---
  static _safeVal(v){ return (v === null || v === undefined) ? '' : v; }
  static _ensureArray(v){
    if(v === null || v === undefined) return [];
    if(Array.isArray(v)) return v;
    return [v];
  }

  /**
   * สร้าง controls_if block จาก object condition เดียว
   * condition: {
   *   ACTION, OBJECT,
   *   PRODUCT_IDS: [], PRODUCT_NAMES: [],
   *   COMPARATOR, VALUE, UNIT,
   *   rewards: [ { rewardAction, rewardObject, rewardProductIds[], rewardValue, rewardUnit } , ... ]
   * }
   */
  static buildIfBlockFromCondition(condition = {}){
    const genId = (prefix='id') => prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);

    // map comparator -> OP (Blockly-ish)
    const opMap = {
      '=': 'EQ', '==':'EQ',
      '>': 'GT', '>=':'GTE', '≥':'GTE',
      '<': 'LT', '<=':'LTE', '≤':'LTE'
    };
    const comparator = String(condition.COMPARATOR ?? condition.comparator ?? '') || '';
    const op = opMap[comparator] || (comparator ? comparator.toString().toUpperCase() : 'EQ');

    // Left: prefer product quantity block with product ids array, else promotion total
    const productIds = this._ensureArray(condition.PRODUCT_IDS ?? condition.PRODUCT_ID ?? []);
    let leftBlock;
    if(productIds.length){
      leftBlock = {
        type: "get_product_quantity",
        id: genId('getqty'),
        fields: { PRODUCT_IDS: productIds.map(String) } // keep array
      };
    } else {
      leftBlock = {
        type: "get_promotion_total",
        id: genId('gettotal'),
        fields: {}
      };
    }

    // Right side: number
    const rightBlock = {
      type: "math_number",
      id: genId('num'),
      fields: { NUM: String(condition.VALUE ?? '') }
    };

    // compare
    const compareBlock = {
      type: "logic_compare",
      id: genId('cmp'),
      fields: { OP: op },
      inputs: {
        A: { block: leftBlock },
        B: { block: rightBlock }
      }
    };

    // build reward blocks chain (DO0) - chain via "next"
    const rewards = Array.isArray(condition.rewards) ? condition.rewards : (condition.rewards ? [condition.rewards] : []);
    let rewardHead = null;
    let last = null;
    if(rewards.length){
      rewards.forEach(r => {
        const rAction = String(r.rewardAction ?? r.REWARD_ACTION ?? '');
        const rObject = String(r.rewardObject ?? r.REWARD_OBJECT ?? '');
        const rProdIds = this._ensureArray(r.rewardProductIds ?? r.REWARD_PRODUCT_IDS ?? r.rewardProductId ?? r.REWARD_PRODUCT_ID ?? []);
        const rVal = this._safeVal(r.rewardValue ?? r.REWARD_VALUE ?? '');
        const rUnit = this._safeVal(r.rewardUnit ?? r.REWARD_UNIT ?? '');

        let block;
        // heuristics:
        // rewardAction '3' or unit percent -> percentage reward
        if ((rUnit && String(rUnit).toLowerCase() === 'percent') || rAction === '3'){
          block = {
            type: "apply_percentage_reward",
            id: genId('reward'),
            fields: {
              PERCENT: String(rVal || '0'),
              PRODUCT_IDS: rProdIds.map(String),
              TARGET: rProdIds.length ? 'product_total' : 'order_total'
            }
          };
        } else if (rAction === '2' && rObject === '1') {
          // free product(s)
          block = {
            type: "give_free_product",
            id: genId('reward'),
            fields: {
              PRODUCT_IDS: rProdIds.map(String),
              QUANTITY: String(rVal || '1')
            }
          };
        } else if (rVal) {
          block = {
            type: "apply_fixed_reward",
            id: genId('reward'),
            fields: {
              AMOUNT: String(rVal),
              UNIT: String(rUnit || '')
            }
          };
        } else {
          block = {
            type: "no_reward",
            id: genId('reward'),
            fields: {}
          };
        }

        if(!rewardHead){ rewardHead = block; last = block; }
        else {
          last.next = { block };
          last = block;
        }
      });
    } else {
      // no reward -> placeholder no_reward
      rewardHead = { type: "no_reward", id: genId('reward'), fields: {} };
    }

    // controls_if block
    const ifBlock = {
      type: "controls_if",
      id: genId('if'),
      x: 10,
      y: 10,
      extraState: {},
      inputs: {
        IF0: { block: compareBlock },
        DO0: { block: rewardHead }
      }
    };

    return ifBlock;
  }

  /**
   * สร้าง Blockly-like JSON จาก array ของ condition objects (จากฟอร์มหลายเงื่อนไข)
   * returns { blocks: { languageVersion:0, blocks: [ ... ] }, variables: [] }
   */
  static buildBlocklyFromConditionsArray(conds = []){
    const blocksArr = [];
    if(Array.isArray(conds) && conds.length){
      conds.forEach(c => {
        const ifB = this.buildIfBlockFromCondition(c);
        blocksArr.push(ifB);
      });
    }
    return {
      blocks: {
        languageVersion: 0,
        blocks: blocksArr
      },
      variables: []
    };
  }

  /**
   * แปลง Blockly JSON (หรือ structure ที่คล้ายกัน) -> array of condition objects
   * Each condition: { ACTION, OBJECT, PRODUCT_IDS:[], PRODUCT_NAMES:[], COMPARATOR, VALUE, UNIT, rewards: [ { ... } ] }
   */
  static parseBlocklyToConditionArray(parsed){
    try {
      if(!parsed) return [];
      const blkList = parsed.blocks?.blocks ?? parsed.blocks ?? []; // tolerate nested shapes
      const out = [];

      // helper to read number/value safely
      const readNum = v => (v === null || v === undefined) ? '' : String(v);

      // traverse next-chain for DO blocks into rewards array
      const parseRewardChain = (startBlock) => {
        const rewards = [];
        let cur = startBlock;
        while(cur){
          const type = cur.type ?? '';
          const fields = cur.fields ?? {};
          if(type === 'apply_percentage_reward'){
            rewards.push({
              rewardAction: '3',
              rewardObject: fields.PRODUCT_IDS ? '1' : '',
              rewardProductIds: Array.isArray(fields.PRODUCT_IDS) ? fields.PRODUCT_IDS.map(String) : (fields.PRODUCT_ID ? [String(fields.PRODUCT_ID)] : []),
              rewardValue: readNum(fields.PERCENT ?? fields.NUM ?? ''),
              rewardUnit: 'percent'
            });
          } else if(type === 'give_free_product'){
            rewards.push({
              rewardAction: '2',
              rewardObject: '1',
              rewardProductIds: Array.isArray(fields.PRODUCT_IDS) ? fields.PRODUCT_IDS.map(String) : (fields.PRODUCT_ID ? [String(fields.PRODUCT_ID)] : []),
              rewardValue: readNum(fields.QUANTITY ?? fields.NUM ?? ''),
              rewardUnit: ''
            });
          } else if(type === 'apply_fixed_reward'){
            rewards.push({
              rewardAction: '', // unknown mapping
              rewardObject: fields.PRODUCT_ID ? '1' : '',
              rewardProductIds: Array.isArray(fields.PRODUCT_IDS) ? fields.PRODUCT_IDS.map(String) : (fields.PRODUCT_ID ? [String(fields.PRODUCT_ID)] : []),
              rewardValue: readNum(fields.AMOUNT ?? ''),
              rewardUnit: fields.UNIT ?? ''
            });
          } else if(type === 'no_reward'){
            // skip
          } else {
            // unknown block type -> store generically
            rewards.push({
              rewardAction: '',
              rewardObject: '',
              rewardProductIds: Array.isArray(fields.PRODUCT_IDS) ? fields.PRODUCT_IDS.map(String) : (fields.PRODUCT_ID ? [String(fields.PRODUCT_ID)] : []),
              rewardValue: JSON.stringify(fields ?? {}),
              rewardUnit: ''
            });
          }
          cur = cur.next?.block ?? null;
        }
        return rewards;
      };

      // For each top-level block: if controls_if -> parse
      // If blocks are chained via "next" at top level (as in sample), we need to walk top-level chain too.
      const topLevelBlocks = [];
      // flatten top-level chain: some JSON uses a single 'blocks' array with 'next' linking subsequent 'controls_if'
      // We will follow each starting block in parsed.blocks.blocks
      const visited = new Set();
      const pushBlockRecursive = (b) => {
        if(!b || !b.id || visited.has(b.id)) return;
        visited.add(b.id);
        topLevelBlocks.push(b);
        if(b.next && b.next.block) pushBlockRecursive(b.next.block);
      };
      (blkList || []).forEach(b => pushBlockRecursive(b));

      topLevelBlocks.forEach(b => {
        if((b.type ?? '') !== 'controls_if') return;
        const condObj = {};
        condObj.ACTION = b.fields?.ACTION ?? '';
        condObj.OBJECT = b.fields?.OBJECT ?? '';
        condObj.UNIT = b.fields?.UNIT ?? '';

        // read compare block
        const compare = b.inputs?.IF0?.block ?? null;
        let comparator = '';
        let value = '';
        let productIds = [];
        if(compare){
          comparator = compare.fields?.OP ?? '';
          // left block may be get_product_quantity or get_promotion_total
          const left = compare.inputs?.A?.block ?? null;
          const right = compare.inputs?.B?.block ?? null;
          if(right){
            value = right.fields?.NUM ?? right.fields?.VALUE ?? '';
          }
          if(left){
            // product ids array or single PRODUCT_ID
            if(Array.isArray(left.fields?.PRODUCT_IDS) && left.fields.PRODUCT_IDS.length){
              productIds = left.fields.PRODUCT_IDS.map(String);
            } else if (left.fields?.PRODUCT_ID){
              productIds = [String(left.fields.PRODUCT_ID)];
            } else {
              productIds = [];
            }
          }
        }
        condObj.COMPARATOR = comparator || '';
        condObj.VALUE = value || '';
        condObj.PRODUCT_IDS = productIds;

        // parse DO0 reward chain
        const doBlock = b.inputs?.DO0?.block ?? null;
        condObj.rewards = parseRewardChain(doBlock);

        out.push(condObj);
      });

      return out;
    } catch(err){
      console.warn('parseBlocklyToConditionArray error', err);
      return [];
    }
  }

    /**
   * Try to read values from dynamic condition items (preferred), otherwise fallback.
   * Returns the Blockly-like JSON and writes it into #conditionBlockJson hidden input when present.
   *
   * Accepts either form element or (if omitted) #condition-form.
   *
   * NOTE: This version returns BOTH { blocks: ..., fields: { ... } }
   * so legacy code that expects blockJson.fields will work.
   */
  static updateHiddenInput(formEl) {
    try {
      if (!formEl || !(formEl instanceof Element)) {
        formEl = document.querySelector('#condition-form') || document.querySelector('form');
      }
      const condItems = Array.from(formEl.querySelectorAll('.condition-item'));
      const conds = [];

      // read form items (existing logic; tolerant)
      if (condItems.length) {
        condItems.forEach(ci => {
          try {
            const action = (ci.querySelector('.condition-form-action')?.value ?? '').toString();
            const object = (ci.querySelector('.condition-form-object')?.value ?? '').toString();

            // product ids (CSV hidden)
            const pidEl = ci.querySelector('.selectedProductId_condition');
            const productIds = [];
            if (pidEl) {
              const raw = (pidEl.value ?? '').toString().trim();
              if (raw) raw.split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>productIds.push(x));
            }

            const comparator = (ci.querySelector('.comparatorSelect')?.value ?? '').toString();
            const value = (ci.querySelector('.valueInput')?.value ?? '').toString();
            const unit = (ci.querySelector('.unitSelect')?.value ?? '').toString();

            // rewards per condition (multiple)
            const rewardsEls = Array.from(ci.querySelectorAll('.reward-item'));
            const rewards = [];
            rewardsEls.forEach(re => {
              try {
                const rAction = (re.querySelector('.condition-form-reward-action')?.value ?? '').toString();
                const rObject = (re.querySelector('.condition-form-reward-object')?.value ?? '').toString();
                const rPidEl = re.querySelector('.selectedProductId_reward');
                const rProdIds = [];
                if (rPidEl) {
                  const raw = (rPidEl.value ?? '').toString().trim();
                  if (raw) raw.split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>rProdIds.push(x));
                }
                const rValue = (re.querySelector('.rewardValueInput')?.value ?? '').toString();
                const rUnit = (re.querySelector('.rewardUnitSelect')?.value ?? '').toString();
                rewards.push({
                  rewardAction: rAction,
                  rewardObject: rObject,
                  rewardProductIds: rProdIds,
                  rewardValue: rValue,
                  rewardUnit: rUnit
                });
              } catch(e){ /* ignore per reward */ }
            });

            conds.push({
              ACTION: action,
              OBJECT: object,
              PRODUCT_IDS: productIds,
              COMPARATOR: comparator,
              VALUE: value,
              UNIT: unit,
              rewards: rewards
            });
          } catch(e){ console.warn('read cond item failed', e); }
        });
      } else {
        // fallback single-condition (previous fallback behavior)
        const action = (formEl.querySelector('.condition-form-action')?.value ?? '').toString();
        const object = (formEl.querySelector('.condition-form-object')?.value ?? '').toString();
        const pidEl = formEl.querySelector('#selectedProductId_condition') || formEl.querySelector('.selectedProductId_condition');
        const productIds = [];
        if (pidEl) {
          const raw = (pidEl.value ?? '').toString().trim();
          if (raw) raw.split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>productIds.push(x));
        }
        const comparator = (formEl.querySelector('.comparatorSelect')?.value ?? '').toString();
        const value = (formEl.querySelector('.valueInput')?.value ?? '').toString();
        const unit = (formEl.querySelector('.unitSelect')?.value ?? '').toString();

        // top-level reward fallback
        const rewards = [];
        const rAction = (formEl.querySelector('.condition-form-reward-action')?.value ?? '').toString();
        const rObject = (formEl.querySelector('.condition-form-reward-object')?.value ?? '').toString();
        const rPidEl = formEl.querySelector('#selectedProductId_reward') || formEl.querySelector('.selectedProductId_reward');
        const rProdIds = [];
        if (rPidEl) {
          const raw = (rPidEl.value ?? '').toString().trim();
          if (raw) raw.split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>rProdIds.push(x));
        }
        const rValue = (formEl.querySelector('.rewardValueInput')?.value ?? '').toString();
        const rUnit = (formEl.querySelector('.rewardUnitSelect')?.value ?? '').toString();
        if (rAction || rObject || rProdIds.length || rValue) {
          rewards.push({
            rewardAction: rAction,
            rewardObject: rObject,
            rewardProductIds: rProdIds,
            rewardValue: rValue,
            rewardUnit: rUnit
          });
        }

        conds.push({
          ACTION: action,
          OBJECT: object,
          PRODUCT_IDS: productIds,
          COMPARATOR: comparator,
          VALUE: value,
          UNIT: unit,
          rewards
        });
      }

      // --- Build workspace (Blockly-like) ---
      const workspace = this.buildBlocklyFromConditionsArray(conds); // returns { blocks: { languageVersion:0, blocks: [...] }, variables: [] }

      // --- Build compiled_dsl in IF/branches shape (one IF per condition) ---
          // --- Build compiled_dsl in IF/branches shape (one IF per condition) ---
    const compiledRules = conds.map(c => {
      const condNode = {
        type: "COMPARE",
        op: String(c.COMPARATOR || '').toUpperCase() || '',
        A: {
          type: "ACTION",
          action: String(c.ACTION || ''),
          object: {
            type: "OBJECT",
            kind: String(c.OBJECT || ''),
            product: Array.isArray(c.PRODUCT_IDS) && c.PRODUCT_IDS.length ? String(c.PRODUCT_IDS[0]) : ''
          }
        },
        B: {
          type: "VALUE_UNIT",
          value: (c.VALUE !== undefined && c.VALUE !== null && c.VALUE !== '') ? Number(c.VALUE) : 0,
          unit: String(c.UNIT || '')
        }
      };

      // Build rewards array (preserve all rewards)
      let thenNode = null;
      if (Array.isArray(c.rewards) && c.rewards.length) {
        const compiledRewards = c.rewards.map(r => {
          return {
            left: {
              type: "REWARD",
              subtype: String(r.rewardAction || r.REWARD_ACTION || ''),
              target: String(r.rewardObject || r.REWARD_OBJECT || ''),
              product_ids: Array.isArray(r.rewardProductIds) ? r.rewardProductIds.map(String) : (r.rewardProductId ? [String(r.rewardProductId)] : []),
              product: (Array.isArray(r.rewardProductIds) && r.rewardProductIds.length) ? String(r.rewardProductIds[0]) : (r.rewardProductId ? String(r.rewardProductId) : '')
            },
            right: {
              type: "VALUE_UNIT",
              value: (r.rewardValue !== undefined && r.rewardValue !== null && r.rewardValue !== '') ? Number(r.rewardValue) : 0,
              unit: String(r.rewardUnit || r.REWARD_UNIT || '')
            }
          };
        });
        thenNode = { type: "REWARD_BLOCK", rewards: compiledRewards };
      } else {
        thenNode = null;
      }

      return {
        type: "IF",
        branches: [
          {
            cond: condNode,
            then: thenNode
          }
        ]
      };
    });


      const compiled_dsl = {
        meta: { generated_at: (new Date()).toISOString(), generated_by: "basic-mapper-v1" },
        rules: compiledRules
      };

      // package: mode=advance (structure must match Advance)
      const conditionXml = {
        mode: "advance",
        workspace: workspace,
        compiled_dsl: compiled_dsl,
        saved_at: (new Date()).toISOString()
      };

      // write to hidden input (blockly JSON) — keep legacy field for compatibility if needed
      const hid = formEl.querySelector('#conditionBlockJson');
      if (hid) hid.value = JSON.stringify(conditionXml);

      // also return structure for caller use
      return { conditionXml, blocks: workspace.blocks ?? workspace, compiled_dsl };

    } catch(err) {
      console.warn('ConditionBlockHelper.updateHiddenInput error:', err);
      // fallback minimal shape
      const fallbackWorkspace = this.buildBlocklyFromConditionsArray([]);
      const compiled_dsl = { meta: { generated_at: (new Date()).toISOString(), generated_by: "basic-mapper-v1" }, rules: [] };
      const conditionXml = { mode: "advance", workspace: fallbackWorkspace, compiled_dsl, saved_at: (new Date()).toISOString() };
      const hid = (formEl && formEl.querySelector) ? formEl.querySelector('#conditionBlockJson') : null;
      if (hid) hid.value = JSON.stringify(conditionXml);
      return { conditionXml, blocks: fallbackWorkspace.blocks ?? fallbackWorkspace, compiled_dsl };
    }
  }

}
