// ConditionParser.js
// Parsing + mapping utilities for condition JSON (Blockly-like).
// Returns both array-form (productIds/productNames) and single-first (productId/productName) for compatibility.

// DEBUG: default false. To enable runtime debugging in browser console:
// window.CONDITION_PARSER_DEBUG = true;
const DEBUG = (typeof window !== 'undefined' && !!window.CONDITION_PARSER_DEBUG) || false;

/* -----------------------
   Utilities
   ----------------------- */
export function mapOpToComparator(op){
  if(!op) return '';
  try { op = String(op).toUpperCase(); } catch(e){ return ''; }
  if (DEBUG) console.log('[CP] mapOpToComparator input:', op);
  switch(op){
    case 'EQ': case 'EQUAL': case 'EQUALS': case '==': case '=': return '=';
    case 'NEQ': case 'NOT_EQ': case 'NOT_EQUAL': case '!=': return '≠';
    case 'GT': case '>': return '>';
    case 'GTE': case 'GTEQ': case 'GREATER_THAN_OR_EQUAL': case '>=': return '≥';
    case 'LT': case '<': return '<';
    case 'LTE': case 'LTEQ': case 'LESS_THAN_OR_EQUAL': case '<=': return '≤';
    default:
      try {
        const s = String(op);
        if(s.indexOf('!=') !== -1) return '≠';
        if(s.indexOf('>=') !== -1) return '≥';
        if(s.indexOf('<=') !== -1) return '≤';
        if(s.indexOf('=') !== -1) return '=';
        if(s.indexOf('>') !== -1) return '>';
        if(s.indexOf('<') !== -1) return '<';
      } catch(e){}
      return op;
  }
}

function firstDefined(obj, keys, fallback = '') {
  if (!obj || !keys || !Array.isArray(keys)) return fallback;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return fallback;
}

function asString(v){
  if(v === undefined || v === null) return '';
  return String(v);
}

function toArrayOfStrings(maybe){
  if(maybe === undefined || maybe === null) return [];
  if (Array.isArray(maybe)) return maybe.map(x => String(x));
  if (typeof maybe === 'string') {
    if (maybe.includes(',')) return maybe.split(',').map(s => s.trim()).filter(Boolean);
    if (maybe.trim() === '') return [];
    return [maybe];
  }
  return [String(maybe)];
}

/* -----------------------
   Helpers: extract product ids / names from many shapes
   ----------------------- */
function extractProductIdsFromNode(node){
  if(!node) return [];
  // compiled shapes
  if(Array.isArray(node.product_ids) && node.product_ids.length) return node.product_ids.map(asString);
  if(Array.isArray(node.productIds) && node.productIds.length) return node.productIds.map(asString);
  if(node.product !== undefined && node.product !== null && String(node.product) !== '') return [String(node.product)];
  if(node.product_id !== undefined && node.product_id !== null) return toArrayOfStrings(node.product_id);

  // fields variants
  const f = node.fields || {};
  if(Array.isArray(f.PRODUCT_IDS) && f.PRODUCT_IDS.length) return f.PRODUCT_IDS.map(asString);
  if(Array.isArray(f.PRODUCT_ID) && f.PRODUCT_ID.length) return f.PRODUCT_ID.map(asString);
  if(f.PRODUCT_SELECT) return toArrayOfStrings(f.PRODUCT_SELECT);
  if(f.PRODUCT_ID !== undefined && f.PRODUCT_ID !== null) return toArrayOfStrings(f.PRODUCT_ID);

  // nested PRODUCT_INPUT / ITEM_INPUT
  if(node.inputs){
    const pi = node.inputs.PRODUCT_INPUT || node.inputs.ITEM_INPUT || node.inputs.PRODUCT || node.inputs.ITEM;
    if(pi && pi.block){
      return extractProductIdsFromNode(pi.block);
    }
  }

  // fallback direct keys
  if(Array.isArray(node.PRODUCT_IDS) && node.PRODUCT_IDS.length) return node.PRODUCT_IDS.map(asString);
  if(node.PRODUCT_ID !== undefined && node.PRODUCT_ID !== null) return toArrayOfStrings(node.PRODUCT_ID);

  return [];
}

function extractProductNamesFromNode(node){
  if(!node) return [];
  const out = [];
  const f = node.fields || {};
  // try fields first
  if(Array.isArray(f.PRODUCT_NAMES) && f.PRODUCT_NAMES.length) return f.PRODUCT_NAMES.map(asString);
  if(f.PRODUCT_NAME) return toArrayOfStrings(f.PRODUCT_NAME);
  if(f.LABEL) return toArrayOfStrings(f.LABEL);
  if(f.NAME) return toArrayOfStrings(f.NAME);
  if(f.PRODUCT_LABEL) return toArrayOfStrings(f.PRODUCT_LABEL);

  // node-level keys
  if(Array.isArray(node.product_names) && node.product_names.length) return node.product_names.map(asString);
  if(node.product_name) return toArrayOfStrings(node.product_name);
  if(node.label) return toArrayOfStrings(node.label);
  if(node.name) return toArrayOfStrings(node.name);

  // nested input
  if(node.inputs){
    const pi = node.inputs.PRODUCT_INPUT || node.inputs.ITEM_INPUT || node.inputs.PRODUCT || node.inputs.ITEM;
    if(pi && pi.block){
      return extractProductNamesFromNode(pi.block);
    }
  }

  return out;
}

/* -----------------------
   Reward extraction (normalize)
   returns rewardProductIds (array) and rewardProductId (single-first)
   ----------------------- */
export function extractRewardFromBlock(rewBlock){
  if(!rewBlock || typeof rewBlock !== 'object') {
    if (DEBUG) console.log('[CP] extractRewardFromBlock invalid', rewBlock);
    return null;
  }
  if (DEBUG) {
    try { console.log('[CP] extractRewardFromBlock start, raw:', JSON.parse(JSON.stringify(rewBlock))); }
    catch(e){ console.log('[CP] extractRewardFromBlock start (no-serialize):', rewBlock); }
  }

  // Support wrapper shapes: { left, right } or simple node
  let left = rewBlock.left ?? rewBlock.reward ?? rewBlock;
  let right = rewBlock.right ?? rewBlock.amount ?? null;

  // Blockly-style inputs: inputs.LEFT.block and inputs.RIGHT.block, PRODUCT_INPUT nested
  if(left && left.inputs && left.inputs.LEFT && left.inputs.LEFT.block) left = left.inputs.LEFT.block;
  if(rewBlock.inputs && rewBlock.inputs.RIGHT && rewBlock.inputs.RIGHT.block) right = rewBlock.inputs.RIGHT.block;

  const leftFields = (left && (left.fields || left)) ? (left.fields || left) : {};
  const rightFields = (right && (right.fields || right)) ? (right.fields || right) : {};

  // product ids & names
  let rewardProductIds = extractProductIdsFromNode(left);
  let rewardProductNames = extractProductNamesFromNode(left);

  // fallback: sometimes product info was stored under right node (rare)
  if(!rewardProductIds.length && right) {
    const fromRight = extractProductIdsFromNode(right);
    if(fromRight.length) rewardProductIds = fromRight.slice();
    const rn = extractProductNamesFromNode(right);
    if(rn.length && !rewardProductNames.length) rewardProductNames = rn.slice();
  }

  // also try rewBlock.fields.product related keys
  if(!rewardProductIds.length && rewBlock.fields){
    if(rewBlock.fields.PRODUCT_IDS) rewardProductIds = toArrayOfStrings(rewBlock.fields.PRODUCT_IDS);
    else if(rewBlock.fields.PRODUCT_ID) rewardProductIds = toArrayOfStrings(rewBlock.fields.PRODUCT_ID);
  }

  // product category all (if present)
  const rewardProductCategoryAll = Array.isArray(leftFields.PRODUCT_CATEGORY_ALL) ? leftFields.PRODUCT_CATEGORY_ALL.map(String) :
                                   Array.isArray(leftFields.PRODUCT_CATEGORIES) ? leftFields.PRODUCT_CATEGORIES.map(String) : [];

  // action/object
  const rewardAction = asString(left.subtype ?? left.type ?? left.rewardAction ?? leftFields.TARGET ?? leftFields.ACTION ?? '');
  const rewardObject = asString(leftFields.TARGET ?? left.target ?? left.rewardObject ?? leftFields.OBJECT ?? '');

  // numeric value & unit (right preferred)
  const rightValue = firstDefined(rightFields, ['Value','NUM','NUMBER','AMOUNT','VALUE','QUANTITY','PERCENT'], null);
  const rightUnit = firstDefined(rightFields, ['Unit','UNIT','TARGET'], null);
  let rewardValue = '';
  let rewardUnit = '';
  if(rightValue !== null && rightValue !== undefined && rightValue !== '') {
    rewardValue = asString(rightValue);
    rewardUnit = asString(rightUnit || '');
  } else {
    const leftVal = firstDefined(leftFields, ['Value','NUM','NUMBER','AMOUNT','VALUE','QUANTITY','PERCENT'], null);
    const leftUnit = firstDefined(leftFields, ['Unit','UNIT','TARGET'], null);
    if(leftVal !== null && leftVal !== undefined && leftVal !== '') {
      rewardValue = asString(leftVal);
      rewardUnit = asString(leftUnit || '');
    }
  }

  const rewardProductId = rewardProductIds.length ? String(rewardProductIds[0]) : '';
  const rewardProductNamesCsv = rewardProductNames.length ? rewardProductNames.join(', ') : '';

  const res = {
    rewardAction,
    rewardObject,
    rewardProductIds: rewardProductIds.slice(),
    rewardProductId,
    rewardProductNames: rewardProductNames.slice(),
    rewardProductNamesCsv,
    rewardProductCategoryAll,
    rewardProductName: rewardProductNames[0] || '',
    rewardValue: rewardValue === null ? '' : String(rewardValue || ''),
    rewardUnit: rewardUnit === null ? '' : String(rewardUnit || '')
  };

  if (DEBUG) console.log('[CP] extractRewardFromBlock result:', res);
  return res;
}

/* -----------------------
   Collect reward chain
   ----------------------- */
export function collectRewardsChain(startBlock){
  if (DEBUG) console.log('[CP] collectRewardsChain start block:', startBlock && (startBlock.type || '(object)'));
  const rewards = [];
  let cur = startBlock;
  let safety = 0;
  while(cur && safety < 1000){
    try {
      const extracted = extractRewardFromBlock(cur);
      if(extracted) rewards.push(extracted);
    } catch(e) {
      if (DEBUG) console.warn('[CP] collectRewardsChain extract failed', e);
    }

    // advance patterns
    if(cur.next && cur.next.block) cur = cur.next.block;
    else if(cur.next && typeof cur.next === 'object' && cur.next.block) cur = cur.next.block;
    else if(cur.next && cur.next.connection && cur.next.connection.block) cur = cur.next.connection.block;
    else if(cur.inputs && cur.inputs.RIGHT && cur.inputs.RIGHT.block && cur.inputs.RIGHT.block.next && cur.inputs.RIGHT.block.next.block) cur = cur.inputs.RIGHT.block.next.block;
    else if(cur.right && cur.right.next && cur.right.next.block) cur = cur.right.next.block;
    else break;

    safety++;
  }
  if (DEBUG) console.log('[CP] collectRewardsChain finished, total=', rewards.length);
  return rewards;
}

/* -----------------------
   parseBlocklyJsonToConditionItems
   returns items with productIds (array) AND productId (single), productNames and rewards[].rewardProductIds
   ----------------------- */
export function parseBlocklyJsonToConditionItems(blocklyJson){
  if (DEBUG) console.log('[CP] parseBlocklyJsonToConditionItems input summary');
  try{
    if(!blocklyJson) return [];
    let blocksArr = [];

    if (Array.isArray(blocklyJson)) blocksArr = blocklyJson;
    else if (Array.isArray(blocklyJson.blocks)) blocksArr = blocklyJson.blocks;
    else if (blocklyJson.blocks && Array.isArray(blocklyJson.blocks.blocks)) blocksArr = blocklyJson.blocks.blocks;
    else if (blocklyJson.workspace && Array.isArray(blocklyJson.workspace.blocks)) blocksArr = blocklyJson.workspace.blocks;
    else if (blocklyJson.rules && Array.isArray(blocklyJson.rules)){
      if (DEBUG) console.log('[CP] parseBlocklyJsonToConditionItems using rules[] branch');
      return blocklyJson.rules.map(r => {
        const fields = r.fields || {};
        const pids = Array.isArray(fields.PRODUCT_ID) ? fields.PRODUCT_ID.map(String) : (fields.PRODUCT_ID ? toArrayOfStrings(fields.PRODUCT_ID) : []);
        const pnames = Array.isArray(fields.PRODUCT_NAMES) ? fields.PRODUCT_NAMES.map(String) : (fields.PRODUCT_NAME ? toArrayOfStrings(fields.PRODUCT_NAME) : []);
        const rewards = Array.isArray(r.rewards) ? r.rewards.map(rr => {
          const left = rr.left || rr;
          const right = rr.right || rr;
          return extractRewardFromBlock({ left, right });
        }).filter(Boolean) : [];
        return {
          comparator: fields.COMPARATOR ? fields.COMPARATOR : '',
          value: fields.VALUE !== undefined ? String(fields.VALUE) : '',
          unit: fields.UNIT ? fields.UNIT : 'baht',
          productIds: pids,
          productId: pids.length ? String(pids[0]) : '',
          productNames: pnames,
          productNamesCsv: pnames.length ? pnames.join(', ') : '',
          rewards,
          conditionBlockType: r.action || r.type || 'RULE'
        };
      });
    } else {
      return [];
    }

    const items = [];
    for(const b of blocksArr){
      if(!b || !b.type) continue;

      if(b.type === 'controls_if'){
        let idx = 0;
        while(b.inputs && b.inputs['IF'+idx]){
          const ifWrapper = b.inputs['IF'+idx];
          const doWrapper = b.inputs['DO'+idx];
          const ifBlock = ifWrapper && ifWrapper.block ? ifWrapper.block : null;
          const doBlock = doWrapper && doWrapper.block ? doWrapper.block : null;

          let comparator = '', value = '', unit = 'baht', productIds = [], productNames = [], conditionBlockType = ifBlock ? (ifBlock.type || null) : null;

          if(ifBlock){
            if(ifBlock.type === 'logic_compare' || (ifBlock.fields && ifBlock.fields.OP)){
              comparator = mapOpToComparator(ifBlock.fields && ifBlock.fields.OP ? ifBlock.fields.OP : '');
              const Ablock = (ifBlock.inputs && ifBlock.inputs.A && ifBlock.inputs.A.block) ? ifBlock.inputs.A.block : null;
              const Bblock = (ifBlock.inputs && ifBlock.inputs.B && ifBlock.inputs.B.block) ? ifBlock.inputs.B.block : null;
              [Ablock, Bblock].forEach(side => {
                if(!side) return;
                const f = side.fields || {};
                if(Array.isArray(f.PRODUCT_IDS) && f.PRODUCT_IDS.length) productIds = f.PRODUCT_IDS.map(String);
                else if(f.PRODUCT_ID) productIds = Array.isArray(f.PRODUCT_ID) ? f.PRODUCT_ID.map(String) : [String(f.PRODUCT_ID)];
                // also try node-level product keys
                if(!productIds.length){
                  productIds = extractProductIdsFromNode(side);
                }
                // product names if present
                if(!productNames.length) productNames = extractProductNamesFromNode(side);
                if(value === ''){
                  if(f.Value !== undefined) value = String(f.Value);
                  if(f.NUM !== undefined) value = String(f.NUM);
                  if(f.NUMBER !== undefined) value = String(f.NUMBER);
                }
                conditionBlockType = conditionBlockType || side.type || null;
              });
            } else {
              const f = ifBlock.fields || {};
              if(f.OP) comparator = mapOpToComparator(f.OP);
              if(f.PRODUCT_ID) productIds = Array.isArray(f.PRODUCT_ID) ? f.PRODUCT_ID.map(String) : [String(f.PRODUCT_ID)];
              if(!productIds.length) productIds = extractProductIdsFromNode(ifBlock);
              if(!productNames.length) productNames = extractProductNamesFromNode(ifBlock);
              if(f.Value !== undefined) value = String(f.Value);
              if(f.NUM !== undefined) value = String(f.NUM);
              if(f.NUMBER !== undefined) value = String(f.NUMBER);
            }
          }

          const rewards = doBlock ? collectRewardsChain(doBlock) : [];
          items.push({
            comparator: comparator||'',
            value: value||'',
            unit: unit||'baht',
            productIds: productIds.slice(),
            productId: productIds.length ? String(productIds[0]) : '',
            productNames: productNames.slice(),
            productNamesCsv: productNames.length ? productNames.join(', ') : '',
            rewards,
            conditionBlockType
          });
          idx++;
        }
        continue;
      }

      // non-if block
      const f = b.fields || {};
      let productIds = (Array.isArray(f.PRODUCT_IDS) ? f.PRODUCT_IDS.map(String) : (f.PRODUCT_ID ? toArrayOfStrings(f.PRODUCT_ID) : []));
      if(!productIds.length) productIds = extractProductIdsFromNode(b);
      const productNames = extractProductNamesFromNode(b);
      const value = (f.Value !== undefined ? f.Value : (f.NUM !== undefined ? f.NUM : (f.NUMBER !== undefined ? f.NUMBER : (f.AMOUNT !== undefined ? f.AMOUNT : (f.VALUE !== undefined ? f.VALUE : '')))));
      const comparator = (f.OP) ? mapOpToComparator(f.OP) : '';
      const nextBlock = (b.next && b.next.block) ? b.next.block : (b.next ? b.next : null);
      const rewards = collectRewardsChain(nextBlock || b);
      items.push({
        comparator,
        value: String(value || ''),
        unit: 'baht',
        productIds,
        productId: productIds.length ? String(productIds[0]) : '',
        productNames,
        productNamesCsv: productNames.length ? productNames.join(', ') : '',
        rewards,
        conditionBlockType: b.type
      });
    }

    if (DEBUG) console.log('[CP] parseBlocklyJsonToConditionItems result items count=', items.length);
    return items;
  }catch(e){
    if (DEBUG) console.warn('[CP] parseBlocklyJsonToConditionItems error', e);
    return [];
  }
}

/* -----------------------
   parseCompiledDslToFormDefaults
   returns defaults with productIds & productId and rewardProductIds & rewardProductId
   ----------------------- */
export function parseCompiledDslToFormDefaults(compiledDsl) {
  if (DEBUG) console.log('[CP] parseCompiledDslToFormDefaults input summary:', compiledDsl && { rules: compiledDsl.rules ? compiledDsl.rules.length : undefined, workspace: !!compiledDsl.workspace });
  const out = [];
  if(!compiledDsl) return out;

  const normalizeReward = function(leftNode, rightNode) {
    if(!leftNode && !rightNode) return null;
    const left = leftNode || {};
    const right = rightNode || {};

    const rewardProductIds = extractProductIdsFromNode(left);
    const rewardProductNames = extractProductNamesFromNode(left);

    const rewardProductId = rewardProductIds.length ? String(rewardProductIds[0]) : '';
    const rewardProductNamesCsv = rewardProductNames.length ? rewardProductNames.join(', ') : '';

    const rewardAction = asString(left.subtype ?? left.type ?? left.rewardAction ?? left.action ?? left.name ?? left.fields?.ACTION ?? '');
    const rewardObject = asString(left.target ?? left.rewardObject ?? left.fields?.TARGET ?? left.fields?.OBJECT ?? '');

    const rewardValue = (right && right.value !== undefined) ? asString(right.value) : (left && (left.value !== undefined ? asString(left.value) : (left.fields && firstDefined(left.fields, ['Value','NUM','NUMBER','AMOUNT','VALUE','QUANTITY','PERCENT'], '') ? asString(firstDefined(left.fields, ['Value','NUM','NUMBER','AMOUNT','VALUE','QUANTITY','PERCENT'], '')) : '')));
    const rewardUnit = asString(right.unit ?? left.unit ?? left.fields?.Unit ?? left.fields?.UNIT ?? '');

    return {
      rewardAction,
      rewardObject,
      rewardProductIds: rewardProductIds.slice(),
      rewardProductId,
      rewardProductNames,
      rewardProductNamesCsv,
      rewardProductName: rewardProductNames[0] || '',
      rewardValue: rewardValue || '',
      rewardUnit: rewardUnit || ''
    };
  };

  const rules = Array.isArray(compiledDsl.rules) ? compiledDsl.rules : (compiledDsl.workspace && compiledDsl.workspace.blocks && compiledDsl.workspace.blocks.blocks ? compiledDsl.workspace.blocks.blocks : []);

  if(Array.isArray(rules) && rules.length === 0) {
    if (DEBUG) console.log('[CP] parseCompiledDslToFormDefaults: rules empty -> []');
    return out;
  }

  if(Array.isArray(compiledDsl.rules)){
    if (DEBUG) console.log('[CP] parseCompiledDslToFormDefaults: rules len=', compiledDsl.rules.length);
    for(const rule of compiledDsl.rules){
      try{
        if(!rule) continue;
        if(rule.type === 'IF' && Array.isArray(rule.branches)){
          for(const br of rule.branches){
            const cond = br.cond || {};
            let comparator = '', value = '', unit = '', productIds = [], productNames = [], productCategoryAll = [], action = '', objectKind = '';

            // extract action/object from cond.A if present
            try {
              if(cond.A) {
                action = asString(cond.A.action ?? cond.A.fields?.ACTION ?? cond.A.actionType ?? cond.A.action ?? '');
                if (cond.A.object) {
                  const o = cond.A.object;
                  objectKind = asString(o.kind ?? o.type ?? o.fields?.OBJECT ?? o.fields?.PRODUCT_SELECT ?? o.product ?? '');
                  if(Array.isArray(o.product_ids) && o.product_ids.length) productIds = o.product_ids.map(String);
                  else if(o.product !== undefined) productIds = [asString(o.product)];
                  productNames = extractProductNamesFromNode(o);
                } else if (cond.A.fields) {
                  const f = cond.A.fields;
                  objectKind = asString(f.OBJECT ?? f.PRODUCT_SELECT ?? '');
                  if(Array.isArray(f.PRODUCT_IDS) && f.PRODUCT_IDS.length) productIds = f.PRODUCT_IDS.map(String);
                  else if(f.PRODUCT_ID) productIds = toArrayOfStrings(f.PRODUCT_ID);
                  if(f.PRODUCT_NAMES) productNames = toArrayOfStrings(f.PRODUCT_NAMES);
                  else if(f.PRODUCT_NAME) productNames = toArrayOfStrings(f.PRODUCT_NAME);
                  if(Array.isArray(f.PRODUCT_CATEGORY_ALL) && f.PRODUCT_CATEGORY_ALL.length) productCategoryAll = f.PRODUCT_CATEGORY_ALL.map(String);
                }
                if(productIds.length === 0) {
                  const fallbackIds = extractProductIdsFromNode(cond.A);
                  if(fallbackIds.length) productIds = fallbackIds;
                }
                if(productNames.length === 0) {
                  const fallbackN = extractProductNamesFromNode(cond.A);
                  if(fallbackN.length) productNames = fallbackN;
                }
              }
            } catch(e){ if (DEBUG) console.warn('[CP] cond.A extraction error', e); }

            // comparator/value extraction
            if(cond.type === 'COMPARE'){
              comparator = mapOpToComparator(cond.op || '');
              const sides = [cond.A, cond.B];
              for(const side of sides){
                if(!side) continue;
                const candidate = (side.type === 'ACTION' && side.object) ? side.object : side;
                if(candidate && (candidate.type === 'VALUE_UNIT')){
                  value = value || (candidate.value !== undefined ? asString(candidate.value) : '');
                  unit = unit || asString(candidate.unit || '');
                }
                if(candidate && candidate.type === 'OBJECT' && candidate.product !== undefined){
                  if(!productIds.length) productIds = [asString(candidate.product)];
                }
                if(candidate && candidate.fields){
                  const f = candidate.fields;
                  if(!productIds.length && (f.PRODUCT_ID || f.PRODUCT_SELECT || f.PRODUCT_IDS)) {
                    if(Array.isArray(f.PRODUCT_IDS) && f.PRODUCT_IDS.length) productIds = f.PRODUCT_IDS.map(String);
                    else if(f.PRODUCT_ID) productIds = toArrayOfStrings(f.PRODUCT_ID);
                    else productIds = toArrayOfStrings(f.PRODUCT_SELECT || '');
                  }
                  if(!value && firstDefined(f, ['Value','NUMBER','NUM','AMOUNT','VALUE','QUANTITY','PERCENT'], '')) value = asString(firstDefined(f, ['Value','NUMBER','NUM','AMOUNT','VALUE','QUANTITY','PERCENT'], ''));
                  if(!unit && (f.Unit || f.UNIT)) unit = asString(f.Unit || f.UNIT);
                  if(Array.isArray(f.PRODUCT_CATEGORY_ALL) && f.PRODUCT_CATEGORY_ALL.length) productCategoryAll = f.PRODUCT_CATEGORY_ALL.map(String);
                  if(!productNames.length && (f.PRODUCT_NAMES || f.PRODUCT_NAME || f.LABEL)) {
                    productNames = (Array.isArray(f.PRODUCT_NAMES) ? f.PRODUCT_NAMES.map(String) : (f.PRODUCT_NAME ? toArrayOfStrings(f.PRODUCT_NAME) : (f.LABEL ? toArrayOfStrings(f.LABEL) : [])));
                  }
                }
              }
            } else if(cond.fields) {
              const f = cond.fields;
              comparator = comparator || mapOpToComparator(f.OP || '');
              if(f.PRODUCT_ID) productIds = toArrayOfStrings(f.PRODUCT_ID);
              if(firstDefined(f, ['Value','NUMBER','NUM','AMOUNT','VALUE','QUANTITY','PERCENT'], '')) value = asString(firstDefined(f, ['Value','NUMBER','NUM','AMOUNT','VALUE','QUANTITY','PERCENT'], ''));
              if(f.Unit) unit = asString(f.Unit);
              if(Array.isArray(f.PRODUCT_CATEGORY_ALL) && f.PRODUCT_CATEGORY_ALL.length) productCategoryAll = f.PRODUCT_CATEGORY_ALL.map(String);
              if(!productNames.length && (f.PRODUCT_NAMES || f.PRODUCT_NAME || f.LABEL)) {
                productNames = (Array.isArray(f.PRODUCT_NAMES) ? f.PRODUCT_NAMES.map(String) : (f.PRODUCT_NAME ? toArrayOfStrings(f.PRODUCT_NAME) : (f.LABEL ? toArrayOfStrings(f.LABEL) : [])));
              }
            }

            // fallback check extracting from cond object if still empty
            if(!productIds.length && cond.A) {
              const fallback = extractProductIdsFromNode(cond.A);
              if(fallback.length) productIds = fallback;
            }
            if(!productNames.length && cond.A) {
              const fallbackN = extractProductNamesFromNode(cond.A);
              if(fallbackN.length) productNames = fallbackN;
            }

            // collect rewards
            let rewardsArr = [];
            if(br.then && Array.isArray(br.then.rewards) && br.then.rewards.length){
              if (DEBUG) console.log('[CP] br.then.rewards len=', br.then.rewards.length);
              rewardsArr = br.then.rewards.map(rr => {
                const left = rr.left || rr;
                const right = rr.right || rr;
                return normalizeReward(left, right);
              }).filter(Boolean);
            } else if(br.then && br.then.type === 'REWARD_BLOCK'){
              const chain = [];
              let cur = br.then;
              let safety = 0;
              while(cur && safety < 500){
                const left = cur.left || cur.reward || cur;
                const right = cur.right || cur.amount || (cur.inputs && cur.inputs.RIGHT && cur.inputs.RIGHT.block ? cur.inputs.RIGHT.block : null);
                const nr = normalizeReward(left, right);
                if(nr) chain.push(nr);
                if(cur.next && cur.next.block) cur = cur.next.block;
                else if(cur.next) cur = cur.next;
                else break;
                safety++;
              }
              rewardsArr = chain;
            } else if(br.rewards && Array.isArray(br.rewards) && br.rewards.length){
              rewardsArr = br.rewards.map(rr => normalizeReward(rr.left || rr, rr.right || rr.right)).filter(Boolean);
            }

            if (DEBUG) console.log('[CP] pushing rule ->', { action, objectKind, productIds, productNames, comparator, value }, 'rewards=', rewardsArr.length);
            out.push({
              action: action || cond.action || cond.type || '',
              object: objectKind || cond.object || '',
              productIds: productIds.slice(),
              productId: productIds.length ? String(productIds[0]) : '',
              productNames: productNames.slice(),
              productNamesCsv: productNames.length ? productNames.join(', ') : '',
              productCategoryAll: productCategoryAll.slice(),
              productName: productNames[0] || '',
              comparator: comparator || '',
              value: value || '',
              unit: unit || '',
              rewards: rewardsArr
            });
          }
        } else if(rule.fields){
          const f = rule.fields || {};
          const pids = Array.isArray(f.PRODUCT_ID) ? f.PRODUCT_ID.map(String) : (f.PRODUCT_ID ? toArrayOfStrings(f.PRODUCT_ID) : []);
          const pnames = Array.isArray(f.PRODUCT_NAMES) ? f.PRODUCT_NAMES.map(String) : (f.PRODUCT_NAME ? toArrayOfStrings(f.PRODUCT_NAME) : []);
          const productCategoryAll = Array.isArray(f.PRODUCT_CATEGORY_ALL) ? f.PRODUCT_CATEGORY_ALL.map(String) : (Array.isArray(f.PRODUCT_CATEGORIES) ? f.PRODUCT_CATEGORIES.map(String) : []);
          const rewardsArr = Array.isArray(rule.rewards) ? rule.rewards.map(rr => normalizeReward(rr.left || rr, rr.right || rr.right)).filter(Boolean) : [];
          out.push({
            action: f.ACTION || f.action || '',
            object: f.OBJECT || f.object || '',
            productIds: pids,
            productId: pids.length ? String(pids[0]) : '',
            productNames: pnames,
            productNamesCsv: pnames.length ? pnames.join(', ') : '',
            productCategoryAll,
            productName: f.PRODUCT_NAME || '',
            comparator: f.COMPARATOR || f.comparator || '',
            value: f.VALUE !== undefined ? asString(f.VALUE) : '',
            unit: f.UNIT || f.unit || '',
            rewards: rewardsArr
          });
        }
      }catch(e){
        if (DEBUG) console.warn('[CP] per-rule error', e);
        continue;
      }
    }
    if (DEBUG) console.log('[CP] parseCompiledDslToFormDefaults result count=', out.length);
    return out;
  }

  // fallback parse workspace.blocks
  try{
    const blocksArr = compiledDsl.workspace && compiledDsl.workspace.blocks && compiledDsl.workspace.blocks.blocks ? compiledDsl.workspace.blocks.blocks : [];
    if (DEBUG) console.log('[CP] fallback to workspace.blocks count=', blocksArr.length);
    return parseBlocklyJsonToConditionItems({ blocks: blocksArr });
  }catch(e){
    if (DEBUG) console.warn('[CP] fallback error', e);
    return out;
  }
}
