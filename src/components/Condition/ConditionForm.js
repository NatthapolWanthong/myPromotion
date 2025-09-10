// ConditionForm.js

import { el } from './ConditionHelpers.js';
import { parseBlocklyJsonToConditionItems, parseCompiledDslToFormDefaults } from './ConditionParser.js';
import { API } from '/myPromotion/src/assets/js/api.js';
import { addConditionItem, addRewardItem, initTemplates, getCachedFormOptions } from './ConditionTemplates.js';
import { ensureProductsLoaded } from '/myPromotion/src/components/modal/modalProductList/modalProductList.js';
import { basicFormToAdvanceWorkspace } from '/myPromotion/src/components/Condition/modalConditionAdvance/advanceCondition.js';


const BlockHelper = (typeof window !== 'undefined' && window.ConditionBlockHelper) ? window.ConditionBlockHelper : ( (typeof ConditionBlockHelper !== 'undefined') ? ConditionBlockHelper : null );


let _populateHandlerRef = null;
let _basicLoadHandlerRef = null;
let _basicSaveHandlerRef = null;
let _createHandlerRef = null;
let _submitBound = false;

function safeParseJSON(s) {
  try { return typeof s === 'string' && s.trim() ? JSON.parse(s) : (typeof s === 'object' ? s : null); } catch(e){ return null; }
}

function normalizeToArrayOrCsv(v) {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.join(',');
  return String(v);
}


function parseIdsFromRaw(raw) {
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) return raw.map(String).map(s => s.trim()).filter(Boolean);
  let s = String(raw).trim();
  if (!s) return [];
  // try JSON parse (handles '["1","2"]' or [1,2])
  if ((s.startsWith('[') && s.endsWith(']')) || s.startsWith('{"')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map(String).map(x => x.trim()).filter(Boolean);
      // object fallback - nothing useful
    } catch(e){ /* ignore parse fail */ }
  }
  // split on comma/semicolon/pipe/whitespace
  const parts = s.split(/[,\s;|]+/).map(p => p.trim()).filter(Boolean);
  return parts;
}


function createConditionItemFromDefault(def, item = null) {
  const container = document.getElementById('conditionsContainer');
  if(!container) return null;
  if(!item) item = container.lastElementChild || null;
  if(!item) return null;

  try {
    if(def.action && item.querySelector('.condition-form-action')) item.querySelector('.condition-form-action').value = def.action;
    if(def.object && item.querySelector('.condition-form-object')) item.querySelector('.condition-form-object').value = def.object;
    if(def.comparator && item.querySelector('.comparatorSelect')) item.querySelector('.comparatorSelect').value = def.comparator;
    if(def.value !== undefined && item.querySelector('.valueInput')) item.querySelector('.valueInput').value = def.value;
    if(def.unit && item.querySelector('.unitSelect')) item.querySelector('.unitSelect').value = def.unit;

    const pidEl = item.querySelector('.selectedProductId_condition');
    const pnameEl = item.querySelector('.selectedProductName_condition');
    if(pidEl) {
      if(Array.isArray(def.productId)) pidEl.value = def.productId.join(',');
      else pidEl.value = def.productId ?? '';
    }
    if(pnameEl) pnameEl.value = def.productName ?? '';

    // rewards
    const rewardsContainer = item.querySelector('.rewardsContainer');
    if(Array.isArray(def.rewards) && def.rewards.length){
      // clear existing
      (rewardsContainer ? Array.from(rewardsContainer.children) : []).forEach(c => c.remove());
      def.rewards.forEach(r => {
        const rEl = addRewardItem(rewardsContainer, {
          rewardAction: r.rewardAction || r.rewardActionType || r.rewardType || '',
          rewardObject: r.rewardObject || r.target || '',
          // support array for reward products
          rewardProductId: Array.isArray(r.rewardProductIds) ? r.rewardProductIds.join(',') : (r.rewardProductId || (Array.isArray(r.rewardProductIds) ? r.rewardProductIds[0] || '' : '')),
          rewardProductIds: Array.isArray(r.rewardProductIds) ? r.rewardProductIds : (r.rewardProductId && String(r.rewardProductId).includes(',') ? String(r.rewardProductId).split(',').map(s=>s.trim()).filter(Boolean) : (r.rewardProductId ? [String(r.rewardProductId)] : [])),
          rewardProductName: r.rewardProductName || '',
          rewardValue: r.rewardValue ?? r.value ?? r.points ?? '',
          rewardUnit: r.rewardUnit ?? r.unit ?? ''
        });
        try {
          if(rEl && rEl.querySelector('.condition-form-reward-action')) rEl.querySelector('.condition-form-reward-action').value = r.rewardAction || r.rewardActionType || r.subtype || '';
          if(rEl && rEl.querySelector('.condition-form-reward-object')) rEl.querySelector('.condition-form-reward-object').value = r.rewardObject || r.target || '';
          if(rEl && rEl.querySelector('.selectedProductId_reward')) {
            // set full CSV if array present
            const rp = Array.isArray(r.rewardProductIds) ? r.rewardProductIds.join(',') : (r.rewardProductId ?? '');
            rEl.querySelector('.selectedProductId_reward').value = rp;
          }
          if(rEl && rEl.querySelector('.selectedProductName_reward')) rEl.querySelector('.selectedProductName_reward').value = r.rewardProductName || '';
          if(rEl && rEl.querySelector('.rewardValueInput')) rEl.querySelector('.rewardValueInput').value = r.rewardValue ?? r.value ?? '';
          if(rEl && rEl.querySelector('.rewardUnitSelect')) rEl.querySelector('.rewardUnitSelect').value = r.rewardUnit ?? r.unit ?? '';
        }catch(e){}
      });
    }
  }catch(e){
    console.warn('createConditionItemFromDefault failed', e);
  }

  return item;
}

export function buildConditionFieldsFromForm(formEl){
  if(!formEl) formEl = el('condition-form');

  // 1) Hidden JSON (`#conditionBlockJson`) takes highest priority
  try {
    const hidden = el('conditionBlockJson')?.value;
    const parsedHidden = safeParseJSON(hidden);
    if (parsedHidden) {
      // If parsedHidden contains compiled_dsl or rules, try to extract first-rule fields
      const compiled = parsedHidden.compiled_dsl ?? parsedHidden;
      if (compiled && (Array.isArray(compiled.rules) && compiled.rules.length)) {
        const defaults = parseCompiledDslToFormDefaults(compiled);
        if (Array.isArray(defaults) && defaults.length) {
          const d = defaults[0];
          return {
            ACTION: d.action ?? '',
            OBJECT: d.object ?? '',
            PRODUCT_ID: Array.isArray(d.productId) ? d.productId.join(',') : (d.productId ?? ''),
            PRODUCT_NAME: d.productName ?? '',
            COMPARATOR: d.comparator ?? '',
            VALUE: d.value ?? '',
            UNIT: d.unit ?? '',
            REWARD_ACTION: (d.rewards && d.rewards[0] && (d.rewards[0].rewardAction || d.rewards[0].rewardType)) ? (d.rewards[0].rewardAction || d.rewards[0].rewardType) : '',
            REWARD_OBJECT: (d.rewards && d.rewards[0] && (d.rewards[0].rewardObject || d.rewards[0].target)) ? (d.rewards[0].rewardObject || d.rewards[0].target) : '',
            REWARD_PRODUCT_ID: (d.rewards && d.rewards[0] && Array.isArray(d.rewards[0].rewardProductIds)) ? d.rewards[0].rewardProductIds.join(',') : ((d.rewards && d.rewards[0] && d.rewards[0].rewardProductId) ? d.rewards[0].rewardProductId : ''),
            REWARD_VALUE: (d.rewards && d.rewards[0] && (d.rewards[0].rewardValue || d.rewards[0].value)) ? (d.rewards[0].rewardValue || d.rewards[0].value) : '',
            REWARD_UNIT: (d.rewards && d.rewards[0] && (d.rewards[0].rewardUnit || d.rewards[0].unit)) ? (d.rewards[0].rewardUnit || d.rewards[0].unit) : ''
          };
        }
      }
    }
  } catch(e){ /* ignore */ }

  try {
    if (BlockHelper && typeof BlockHelper.updateHiddenInput === 'function') {
      const out = BlockHelper.updateHiddenInput(formEl);
      if (out) {
        // if BlockHelper returned `fields` directly, use them
        if (out.fields && Object.keys(out.fields).length) {
          const f = out.fields;
          return {
            ACTION: f.ACTION ?? f.action ?? '',
            OBJECT: f.OBJECT ?? f.object ?? '',
            PRODUCT_ID: (Array.isArray(f.PRODUCT_ID) ? f.PRODUCT_ID.join(',') : (f.PRODUCT_ID ?? '')),
            PRODUCT_NAME: f.PRODUCT_NAME ?? f.productName ?? '',
            COMPARATOR: f.COMPARATOR ?? f.comparator ?? '',
            VALUE: f.VALUE ?? f.value ?? '',
            UNIT: f.UNIT ?? f.unit ?? '',
            REWARD_ACTION: f.REWARD_ACTION ?? '',
            REWARD_OBJECT: f.REWARD_OBJECT ?? '',
            REWARD_PRODUCT_ID: (Array.isArray(f.REWARD_PRODUCT_ID) ? f.REWARD_PRODUCT_ID.join(',') : (f.REWARD_PRODUCT_ID ?? '')),
            REWARD_VALUE: f.REWARD_VALUE ?? f.rewardValue ?? f.value ?? '',
            REWARD_UNIT: f.REWARD_UNIT ?? f.rewardUnit ?? ''
          };
        }


        const compiledCandidate = out.compiled_dsl ?? out.conditionXml ?? out;
        if (compiledCandidate && (Array.isArray(compiledCandidate.rules) && compiledCandidate.rules.length)) {
          const defaults = parseCompiledDslToFormDefaults(compiledCandidate);
          if (Array.isArray(defaults) && defaults.length) {
            const d = defaults[0];
            return {
              ACTION: d.action ?? '',
              OBJECT: d.object ?? '',
              PRODUCT_ID: Array.isArray(d.productId) ? d.productId.join(',') : (d.productId ?? ''),
              PRODUCT_NAME: d.productName ?? '',
              COMPARATOR: d.comparator ?? '',
              VALUE: d.value ?? '',
              UNIT: d.unit ?? '',
              REWARD_ACTION: (d.rewards && d.rewards[0] && (d.rewards[0].rewardAction || d.rewards[0].rewardType)) ? (d.rewards[0].rewardAction || d.rewards[0].rewardType) : '',
              REWARD_OBJECT: (d.rewards && d.rewards[0] && (d.rewards[0].rewardObject || d.rewards[0].target)) ? (d.rewards[0].rewardObject || d.rewards[0].target) : '',
              REWARD_PRODUCT_ID: (d.rewards && d.rewards[0] && Array.isArray(d.rewards[0].rewardProductIds)) ? d.rewards[0].rewardProductIds.join(',') : ((d.rewards && d.rewards[0] && d.rewards[0].rewardProductId) ? d.rewards[0].rewardProductId : ''),
              REWARD_VALUE: (d.rewards && d.rewards[0] && (d.rewards[0].rewardValue || d.rewards[0].value)) ? (d.rewards[0].rewardValue || d.rewards[0].value) : '',
              REWARD_UNIT: (d.rewards && d.rewards[0] && (d.rewards[0].rewardUnit || d.rewards[0].unit)) ? (d.rewards[0].rewardUnit || d.rewards[0].unit) : ''
            };
          }
        }
      }
    }
  } catch(e){ /* ignore */ }

  try {
    const form = formEl;
    const condItems = Array.from(form.querySelectorAll('.condition-item'));
    let chosen = null;
    for (const ci of condItems) {
      const actionVal = (ci.querySelector('.condition-form-action')?.value ?? '').toString().trim();
      const objectVal = (ci.querySelector('.condition-form-object')?.value ?? '').toString().trim();
      const comparatorVal = (ci.querySelector('.comparatorSelect')?.value ?? '').toString().trim();
      const valueVal = (ci.querySelector('.valueInput')?.value ?? '').toString().trim();
      const pidVal = (ci.querySelector('.selectedProductId_condition')?.value ?? '').toString().trim();
      if (actionVal || objectVal || comparatorVal || valueVal || pidVal) { chosen = ci; break; }
    }
    if (!chosen && condItems.length) chosen = condItems[0];

    if (chosen) {
      const action = (chosen.querySelector('.condition-form-action')?.value ?? '').toString();
      const object = (chosen.querySelector('.condition-form-object')?.value ?? '').toString();
      const productId = (chosen.querySelector('.selectedProductId_condition')?.value ?? '').toString();
      const productName = (chosen.querySelector('.selectedProductName_condition')?.value ?? '').toString();
      const comparator = (chosen.querySelector('.comparatorSelect')?.value ?? '').toString();
      const value = (chosen.querySelector('.valueInput')?.value ?? '').toString();
      const unit = (chosen.querySelector('.unitSelect')?.value ?? '').toString();

      // reward
      const rewards = Array.from(chosen.querySelectorAll('.reward-item'));
      let chosenReward = null;
      for (const r of rewards) {
        const rAct = (r.querySelector('.condition-form-reward-action')?.value ?? '').toString().trim();
        const rObj = (r.querySelector('.condition-form-reward-object')?.value ?? '').toString().trim();
        const rVal = (r.querySelector('.rewardValueInput')?.value ?? '').toString().trim();
        const rPid = (r.querySelector('.selectedProductId_reward')?.value ?? '').toString().trim();
        if (rAct || rObj || rVal || rPid) { chosenReward = r; break; }
      }
      if (!chosenReward && rewards.length) chosenReward = rewards[0];

      let rewardAction = '', rewardObject = '', rewardProductId = '', rewardProductName = '', rewardValue = '', rewardUnit = '';
      if (chosenReward) {
        rewardAction = (chosenReward.querySelector('.condition-form-reward-action')?.value ?? '').toString();
        rewardObject = (chosenReward.querySelector('.condition-form-reward-object')?.value ?? '').toString();
        rewardProductId = (chosenReward.querySelector('.selectedProductId_reward')?.value ?? '').toString();
        rewardProductName = (chosenReward.querySelector('.selectedProductName_reward')?.value ?? '').toString();
        rewardValue = (chosenReward.querySelector('.rewardValueInput')?.value ?? '').toString();
        rewardUnit = (chosenReward.querySelector('.rewardUnitSelect')?.value ?? '').toString();
      }

      return {
        ACTION: action,
        OBJECT: object,
        PRODUCT_ID: (productId && productId.includes(',')) ? productId.split(',').map(s=>s.trim()).filter(Boolean) : productId,
        PRODUCT_NAME: productName,
        COMPARATOR: comparator,
        VALUE: value,
        UNIT: unit,
        REWARD_ACTION: rewardAction,
        REWARD_OBJECT: rewardObject,
        REWARD_PRODUCT_ID: rewardProductId,
        REWARD_PRODUCT_NAME: rewardProductName,
        REWARD_VALUE: rewardValue,
        REWARD_UNIT: rewardUnit
      };
    }
  } catch(e){ console.warn('buildConditionFieldsFromForm DOM fallback error', e); }

  // final top-level fallback
  return {
    ACTION: (formEl.querySelector('.condition-form-action')?.value ?? '').toString(),
    OBJECT: (formEl.querySelector('.condition-form-object')?.value ?? '').toString(),
    PRODUCT_ID: (el('selectedProductId_condition')?.value ?? '').toString(),
    PRODUCT_NAME: (el('selectedProductName_condition')?.value ?? '').toString(),
    COMPARATOR: (el('comparatorSelect')?.value ?? '').toString(),
    VALUE: (el('valueInput')?.value ?? '').toString(),
    UNIT: (el('unitSelect')?.value ?? '').toString(),
    REWARD_ACTION: (formEl.querySelector('.condition-form-reward-action')?.value ?? '').toString(),
    REWARD_OBJECT: (formEl.querySelector('.condition-form-reward-object')?.value ?? '').toString(),
    REWARD_PRODUCT_ID: (el('selectedProductId_reward')?.value ?? '').toString(),
    REWARD_PRODUCT_NAME: (el('selectedProductName_reward')?.value ?? '').toString(),
    REWARD_VALUE: (el('rewardValueInput')?.value ?? '').toString(),
    REWARD_UNIT: (el('rewardUnitSelect')?.value ?? '').toString()
  };
}


export function validateConditionForm(formEl){
  if(!formEl) formEl = el('condition-form');
  const missing = [];
  // clear previous markers
  formEl.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));

  const nameEl = el('condition-form-name');
  if(!nameEl || !nameEl.value.trim()){
    missing.push('ชื่อเงื่อนไข');
    if(nameEl) nameEl.classList.add('is-invalid');
  }

  // validate dynamic items
  const condItems = Array.from(formEl.querySelectorAll('.condition-item'));
  if(condItems.length){
    condItems.forEach((ci, idx)=>{
      try{
        const actionEl = ci.querySelector('.condition-form-action');
        const objectEl = ci.querySelector('.condition-form-object');
        if(actionEl && !actionEl.disabled && !String(actionEl.value).trim()){
          missing.push(`เงื่อนไข ${idx+1}: Action`);
          actionEl.classList.add('is-invalid');
        }
        if(objectEl && !objectEl.disabled && !String(objectEl.value).trim()){
          missing.push(`เงื่อนไข ${idx+1}: Object`);
          objectEl.classList.add('is-invalid');
        }
        if(objectEl && !objectEl.disabled && String(objectEl.value) === '1'){
          const pid = ci.querySelector('.selectedProductId_condition');
          if(!pid || !(String(pid.value).trim())){
            missing.push(`สินค้า ในเงื่อนไข ${idx+1}`);
            const nameI = ci.querySelector('.selectedProductName_condition');
            if(nameI) nameI.classList.add('is-invalid');
            if(pid) pid.classList.add('is-invalid');
          }
        }
        // rewards checks (basic)
        Array.from(ci.querySelectorAll('.reward-item')).forEach((ri, ridx)=>{
          const rAction = ri.querySelector('.condition-form-reward-action');
          if(rAction && !rAction.disabled && !String(rAction.value).trim()){
            missing.push(`เงื่อนไข ${idx+1} ผลตอบแทน ${ridx+1}: ประเภท`);
            rAction.classList.add('is-invalid');
          }
          const rObject = ri.querySelector('.condition-form-reward-object');
          if(rObject && !rObject.disabled && !String(rObject.value).trim()){
            missing.push(`เงื่อนไข ${idx+1} ผลตอบแทน ${ridx+1}: รายการ`);
            rObject.classList.add('is-invalid');
          }
        });
      }catch(e){}
    });
  } else {
    // single-form fallback
    const actionEl = formEl.querySelector('.condition-form-action');
    const objectEl = formEl.querySelector('.condition-form-object');
    if(actionEl && !actionEl.disabled && !actionEl.value){ missing.push('Action'); actionEl.classList.add('is-invalid'); }
    if(objectEl && !objectEl.disabled && !objectEl.value){ missing.push('Object'); objectEl.classList.add('is-invalid'); }
  }

  // generic required elements check (skip disabled)
  const reqEls = Array.from(formEl.querySelectorAll('[required]'));
  for(const r of reqEls){
    try{
      if(r.disabled) continue;
      const val = (r.value ?? '').toString().trim();
      if(val === ''){
        const friendly = (document.querySelector(`label[for="${r.id}"]`)?.textContent) || r.placeholder || r.id || 'จำเป็นต้องระบุ';
        missing.push(friendly);
        r.classList.add('is-invalid');
      }
    }catch(e){}
  }

  const finalMissing = Array.from(new Set(missing));
  return { ok: finalMissing.length === 0, missing: finalMissing };
}


export function mapBasicFormToCompiledDSL(formEl){
  if(!formEl) formEl = el('condition-form');

  // 1) Prefer regeneration from DOM via basicFormToAdvanceWorkspace (most faithful: preserves multi-rewards)
  try {
    if (typeof basicFormToAdvanceWorkspace === 'function') {
      try {
        const gen = basicFormToAdvanceWorkspace();
        if (gen && (gen.workspace || (gen.compiled_dsl && Array.isArray(gen.compiled_dsl.rules)))) {
          gen.mode = gen.mode || 'basic';
          gen.saved_at = gen.saved_at || (new Date()).toISOString();
          return gen;
        }
      } catch(e){
        console.warn('basicFormToAdvanceWorkspace failed (ignored):', e);
      }
    }
  } catch(e){ /* ignore */ }

  try {
    if (BlockHelper && typeof BlockHelper.updateHiddenInput === 'function') {
      try {
        const updated = BlockHelper.updateHiddenInput(formEl);
        if (updated) {
          const ws = updated.workspace || updated.blocks || (updated.conditionXml && updated.conditionXml.workspace) || null;
          const compiled = updated.compiled_dsl || updated.compiledDsl || (updated.conditionXml && updated.conditionXml.compiled_dsl) || null;
          if (compiled && Array.isArray(compiled.rules)) {
            return {
              mode: updated.mode || 'basic',
              workspace: ws || null,
              compiled_dsl: compiled,
              saved_at: (new Date()).toISOString()
            };
          }
          if (Array.isArray(updated.rules) && updated.rules.length) {
            return {
              mode: updated.mode || 'basic',
              workspace: ws || null,
              compiled_dsl: { meta: { generated_at: (new Date()).toISOString() }, rules: updated.rules },
              saved_at: (new Date()).toISOString()
            };
          }
        }
      } catch(e){
        console.warn('BlockHelper.updateHiddenInput failed (ignored):', e);
      }
    }
  } catch(e){ /* ignore */ }


  try {
    const hid = el('conditionBlockJson');
    if (hid && hid.value) {
      const parsed = safeParseJSON(hid.value);
      if (parsed) {
        if (parsed.workspace && parsed.compiled_dsl && Array.isArray(parsed.compiled_dsl.rules)) {
          parsed.mode = parsed.mode || 'basic';
          return parsed;
        }
        if (parsed.compiled_dsl && Array.isArray(parsed.compiled_dsl.rules) && parsed.compiled_dsl.rules.length) {
          parsed.mode = parsed.mode || 'basic';
          return { mode: parsed.mode, workspace: parsed.workspace || null, compiled_dsl: parsed.compiled_dsl, saved_at: parsed.saved_at || (new Date()).toISOString() };
        }
      }
    }
  } catch(e){ /* ignore */ }

  // 4) Last resort: empty structure
  return { mode: "basic", workspace: { blocks: { languageVersion: 0, blocks: [] } }, compiled_dsl: { meta:{ generated_at: (new Date()).toISOString() }, rules: [] }, saved_at: (new Date()).toISOString() };
}

export function initFormSubmit({ getPromoId } = {}) {
  const form = document.getElementById('condition-form');
  if(!form) return;
  if(_submitBound) return;
  _submitBound = true;

  // ensure save button calls form.submit (legacy compatibility)
  const saveBtn = document.getElementById('btn-save-condition');
  if (saveBtn && !saveBtn._boundClick) {
    saveBtn._boundClick = true;
    saveBtn.addEventListener('click', (e) => {
      const f = document.getElementById('condition-form');
      if (!f) return;
      if (typeof f.requestSubmit === 'function') f.requestSubmit();
      else f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (window._conditionSaving) {
      console.warn('save already in progress, ignoring duplicate submit');
      return;
    }
    window._conditionSaving = true;

    try {
      // validate early
      const v = validateConditionForm(form);
      if (!v.ok) {
        alert('กรุณากรอกข้อมูลที่จำเป็น:\n- ' + v.missing.join('\n- '));
        window._conditionSaving = false;
        return;
      }

      // produce standardized compiled object (workspace + compiled_dsl)
      let normalized = null;
      try {
        console.log('Before generate compiled_dsl. DOM condition items:', document.querySelectorAll('.condition-item').length);
        normalized = mapBasicFormToCompiledDSL(form);
      } catch(e) {
        console.warn('mapBasicFormToCompiledDSL failed', e);
        normalized = null;
      }

      if (!normalized) {
        alert('ไม่สามารถสร้างเงื่อนไขได้ (failed to generate compiled structure)');
        window._conditionSaving = false;
        return;
      }

      if (!normalized.compiled_dsl) {
        if (normalized.rules && Array.isArray(normalized.rules)) {
          normalized = { mode: normalized.mode || 'basic', workspace: normalized.workspace || { blocks: { languageVersion: 0, blocks: [] } }, compiled_dsl: { meta: { origin: 'wrapped-rules', generated_at: (new Date()).toISOString() }, rules: normalized.rules }, saved_at: normalized.saved_at || (new Date()).toISOString() };
        } else {
          normalized.compiled_dsl = { meta: { generated_at: (new Date()).toISOString() }, rules: [] };
        }
      }

      // ensure mode
      normalized.mode = normalized.mode || 'basic';
      normalized.saved_at = normalized.saved_at || (new Date()).toISOString();

      try {
        const rules = Array.isArray(normalized.compiled_dsl.rules) ? normalized.compiled_dsl.rules : [];
        for (const r of rules) {
          if (r && r.fields) {
            if (typeof r.fields.PRODUCT_ID === 'string' && r.fields.PRODUCT_ID.includes(',')) {
              r.fields.PRODUCT_ID = r.fields.PRODUCT_ID.split(',').map(s=>s.trim()).filter(Boolean);
            }
            if (typeof r.fields.REWARD_PRODUCT_ID === 'string' && r.fields.REWARD_PRODUCT_ID.includes(',')) {
              r.fields.REWARD_PRODUCT_ID = r.fields.REWARD_PRODUCT_ID.split(',').map(s=>s.trim()).filter(Boolean);
            }
          }
        }
      } catch(e){/* ignore */ }

      let codeForStore = '';
      try {
        if (normalized && normalized.compiled_dsl) codeForStore = JSON.stringify(normalized.compiled_dsl);
        else codeForStore = JSON.stringify(normalized);
      } catch(e){ codeForStore = ''; }

      const promoId = Number(typeof getPromoId === 'function' ? getPromoId() : (window.promoId || new URLSearchParams(window.location.search).get('id')));
      const payload = {
        id: el('savedConditionId')?.value || undefined,
        promotion_id: promoId,
        campaign_id: null,
        condition_name: (el('condition-form-name')?.value || '').trim(),
        condition_xml: normalized,
        condition_code: codeForStore,
        created_by: (window.currentUser || 'admin'),
        mode: normalized.mode || 'basic'
      };

      const btn = el('btn-save-condition');
      if (btn) { btn.disabled = true; btn.textContent = 'กำลังบันทึก...'; }

      // call API
      const res = await API.insertCondition(payload);

      if (res && res.success) {
        // dispatch events for other modules (advance/list)
        window.dispatchEvent(new CustomEvent('condition:changed', { detail: { promotion_id: promoId, total: res.total ?? null } }));
        window.dispatchEvent(new CustomEvent('condition:requery', {}));
        window.dispatchEvent(new CustomEvent('condition:saved', { detail: res }));
        try { alert('บันทึกสำเร็จ'); } catch(e){}
      } else {
        throw new Error(res?.error || 'save failed');
      }
    } catch(err) {
      console.error('save error', err);
      try { alert('บันทึกล้มเหลว: ' + (err.message || err)); } catch(e){}
    } finally {
      window._conditionSaving = false;
      try { if (el('btn-save-condition')) { el('btn-save-condition').disabled = false; el('btn-save-condition').textContent = 'บันทึก'; } } catch(e){}
    }
  });
}

export async function populateConditionForm(row = {}, parsedConditionXml = null) {
  const formEl = el('condition-form');
  const container = document.getElementById('conditionsContainer');
  if (!formEl || !container) return;

  try { initTemplates(); } catch(e){}

  container.innerHTML = '';

  try { if (el('condition-form-name')) el('condition-form-name').value = row.condition_name || ''; } catch(e){}
  try { if (el('savedConditionId')) el('savedConditionId').value = row.id || ''; } catch(e){}

  let cond = parsedConditionXml ?? row.condition_xml ?? null;
  if (typeof cond === 'string' && cond.trim()) {
    try { cond = JSON.parse(cond); } catch(e){ /* leave as-is */ }
  }

  // helper to create items from 'defaults' array
  const createItemsFromDefaults = async (defaults) => {
    const created = [];
    for (const d of defaults) {
      // create the DOM item (synchronously returns wrapper)
      const item = addConditionItem(d);

      // wait for this specific item's async initialization (options loaded + any re-apply)
      if (item && item._ready) {
        try { await item._ready; } catch(e){ /* ignore per-item failure */ }
      }

      // now apply defaults explicitly to the created item
      try { createConditionItemFromDefault(d, item); } catch(e){ console.warn('apply default failed', e); }

      created.push(item);
    }
    return created;
  };

  // try compiled_dsl path first
  let compiled = null;
  if (cond && typeof cond === 'object') {
    compiled = cond.compiled_dsl ?? (cond.rules ? cond : null);
  }

  const tryParseCompiledToDefaults = (compiledObj) => {
    try {
      if (!compiledObj) return null;
      if (typeof parseCompiledDslToFormDefaults === 'function') {
        return parseCompiledDslToFormDefaults(compiledObj);
      }
      return null;
    } catch(e){ return null; }
  };

  // 1) compiled_dsl route
  try {
    const defs = tryParseCompiledToDefaults(compiled);
    if (Array.isArray(defs) && defs.length) {
      await createItemsFromDefaults(defs);
      try {
        const loaded = await ensureProductsLoaded();
        const productsMap = loaded && loaded.productsById ? loaded.productsById : (loaded && loaded.products ? new Map((loaded.products||[]).map(p => [String(p.id), p])) : new Map());
        container.querySelectorAll('.condition-item').forEach(ci => {
          try {
            const pidEl = ci.querySelector('.selectedProductId_condition');
            const nameEl = ci.querySelector('.selectedProductName_condition');
            if (pidEl && nameEl) {
              const raw = String(pidEl.value || '').trim();
              const ids = parseIdsFromRaw(raw);
              if (ids.length) {
                const names = ids.map(id => {
                  const p = productsMap.get(String(id));
                  return p ? (p.name_th || p.name_en || p.name) : id;
                }).filter(Boolean);
                nameEl.value = names.join(', ');
                // try to use helper to toggle product inputs (if available)
                try { if (typeof window.setProductInputsState === 'function') window.setProductInputsState(nameEl, pidEl, names.length > 0); } catch(e){}
              }
            }
            // rewards inside this condition
            ci.querySelectorAll('.reward-item').forEach(ri => {
              try {
                const rpid = ri.querySelector('.selectedProductId_reward');
                const rname = ri.querySelector('.selectedProductName_reward');
                if (rpid && rname) {
                  const rawr = String(rpid.value || '').trim();
                  const rids = parseIdsFromRaw(rawr);
                  if (rids.length) {
                    const names = rids.map(id => {
                      const p = productsMap.get(String(id));
                      return p ? (p.name_th || p.name_en || p.name) : id;
                    }).filter(Boolean);
                    rname.value = names.join(', ');
                    try { if (typeof window.setProductInputsState === 'function') window.setProductInputsState(rname, rpid, names.length > 0); } catch(e){}
                  }
                }
              } catch(e){}
            });
          } catch(e){}
        });
      } catch(e){ console.warn('post-fill product names failed', e); }
      return;
    }
  } catch(e){ console.warn('compiled_dsl populate failed', e); }

  // 2) workspace parse route
  try {
    const workspace = cond && cond.workspace ? cond.workspace : (row && row.condition_xml && row.condition_xml.workspace ? row.condition_xml.workspace : null);
    if (workspace && typeof parseBlocklyJsonToConditionItems === 'function') {
      const items = parseBlocklyJsonToConditionItems(workspace);
      if (Array.isArray(items) && items.length) {
        // convert items -> defaults and create
        const defs = items.map(it => {
          const productIds = Array.isArray(it.productIds) ? it.productIds : (it.productId ? (Array.isArray(it.productId) ? it.productId : [it.productId]) : []);
          return {
            action: it.conditionBlockType || '',
            object: it.objectKind || '',
            productId: productIds,
            productName: '', // fill later
            comparator: it.comparator || '',
            value: it.value !== undefined ? it.value : '',
            unit: it.unit || '',
            rewards: (it.rewards || []).map(r => {
              const rProdIds = Array.isArray(r.rewardProductIds) ? r.rewardProductIds : (r.rewardProductId ? (Array.isArray(r.rewardProductId) ? r.rewardProductId : [r.rewardProductId]) : []);
              return {
                rewardAction: r.rewardType || r.rewardAction || '',
                rewardObject: r.rewardObject || r.target || '',
                rewardProductIds: rProdIds,
                rewardProductName: '',
                rewardValue: r.rewardValue || r.value || '',
                rewardUnit: r.rewardUnit || r.unit || ''
              };
            })
          };
        });
        await createItemsFromDefaults(defs);
        // post-process: map ids->names same as above
        try {
          const loaded = await ensureProductsLoaded();
          const productsMap = loaded && loaded.productsById ? loaded.productsById : (loaded && loaded.products ? new Map((loaded.products||[]).map(p => [String(p.id), p])) : new Map());
          container.querySelectorAll('.condition-item').forEach(ci => {
            const pidEl = ci.querySelector('.selectedProductId_condition');
            const nameEl = ci.querySelector('.selectedProductName_condition');
            if (pidEl && nameEl) {
              const raw = String(pidEl.value || '').trim();
              const ids = parseIdsFromRaw(raw);
              if (ids.length) {
                const names = ids.map(id => {
                  const p = productsMap.get(String(id));
                  return p ? (p.name_th || p.name_en || p.name) : id;
                }).filter(Boolean);
                nameEl.value = names.join(', ');
                try { if (typeof window.setProductInputsState === 'function') window.setProductInputsState(nameEl, pidEl, names.length > 0); } catch(e){}
              }
            }
            ci.querySelectorAll('.reward-item').forEach(ri => {
              const rpid = ri.querySelector('.selectedProductId_reward');
              const rname = ri.querySelector('.selectedProductName_reward');
              if (rpid && rname) {
                const rawr = String(rpid.value || '').trim();
                const rids = parseIdsFromRaw(rawr);
                if (rids.length) {
                  const names = rids.map(id => {
                    const p = productsMap.get(String(id));
                    return p ? (p.name_th || p.name_en || p.name) : id;
                  }).filter(Boolean);
                  rname.value = names.join(', ');
                  try { if (typeof window.setProductInputsState === 'function') window.setProductInputsState(rname, rpid, names.length > 0); } catch(e){}
                }
              }
            });
          });
        } catch(e){ console.warn('post-fill product names failed', e); }
        return;
      }
    }
  } catch(e){ console.warn('workspace->items populate failed', e); }

  // 3) fallback: if row.condition_xml contains compiled_dsl.rules as object
  try {
    if (row && row.condition_xml && typeof row.condition_xml === 'object' && row.condition_xml.rules && row.condition_xml.rules.length) {
      const defs = tryParseCompiledToDefaults(row.condition_xml);
      if (Array.isArray(defs) && defs.length) {
        await createItemsFromDefaults(defs);
        // post fill names as above
        try {
          const loaded = await ensureProductsLoaded();
          const productsMap = loaded && loaded.productsById ? loaded.productsById : (loaded && loaded.products ? new Map((loaded.products||[]).map(p => [String(p.id), p])) : new Map());
          container.querySelectorAll('.condition-item').forEach(ci => {
            const pidEl = ci.querySelector('.selectedProductId_condition');
            const nameEl = ci.querySelector('.selectedProductName_condition');
            if (pidEl && nameEl) {
              const raw = String(pidEl.value || '').trim();
              const ids = parseIdsFromRaw(raw);
              if (ids.length) {
                const names = ids.map(id => {
                  const p = productsMap.get(String(id));
                  return p ? (p.name_th || p.name_en || p.name) : id;
                }).filter(Boolean);
                nameEl.value = names.join(', ');
                try { if (typeof window.setProductInputsState === 'function') window.setProductInputsState(nameEl, pidEl, names.length > 0); } catch(e){}
              }
            }
            ci.querySelectorAll('.reward-item').forEach(ri => {
              const rpid = ri.querySelector('.selectedProductId_reward');
              const rname = ri.querySelector('.selectedProductName_reward');
              if (rpid && rname) {
                const rawr = String(rpid.value || '').trim();
                const rids = parseIdsFromRaw(rawr);
                if (rids.length) {
                  const names = rids.map(id => {
                    const p = productsMap.get(String(id));
                    return p ? (p.name_th || p.name_en || p.name) : id;
                  }).filter(Boolean);
                  rname.value = names.join(', ');
                  try { if (typeof window.setProductInputsState === 'function') window.setProductInputsState(rname, rpid, names.length > 0); } catch(e){}
                }
              }
            });
          });
        } catch(e){ console.warn('post-fill product names failed', e); }
        return;
      }
    }
  } catch(e){ console.warn('fallback compiled populate failed', e); }
  const emptyItem = addConditionItem();
  if (emptyItem && emptyItem._ready) await emptyItem._ready.catch(()=>{});
}

export function initFormHandlers() {
  // bind submit if not already
  initFormSubmit({ getPromoId: () => (window.promoId || new URLSearchParams(window.location.search).get('id')) });

  // condition:basic:save -> submit form
  if (!_basicSaveHandlerRef) {
    _basicSaveHandlerRef = () => {
      try {
        const f = document.getElementById('condition-form');
        if (!f) return;
        if (typeof f.requestSubmit === 'function') f.requestSubmit();
        else f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      } catch (e) {
        console.warn('condition:basic:save handler failed', e);
      }
    };
  }

  if (!_populateHandlerRef) {
    _populateHandlerRef = (ev) => {
      try {
        const det = ev.detail || {};
        const row = det.row || {};
        let cond = det.condition_xml ?? row.condition_xml ?? null;
        if (typeof cond === 'string' && cond.trim()) {
          try { cond = JSON.parse(cond); } catch(e){ cond = det.condition_xml ?? row.condition_xml ?? cond; }
        }
        try { initTemplates(); } catch(e){}
        populateConditionForm(row, cond || null);
      } catch (e) {
        console.warn('condition:populate -> populateConditionForm failed', e);
      }
    };
    window.addEventListener('condition:populate', _populateHandlerRef);
  }

  if (!_basicLoadHandlerRef) {
    _basicLoadHandlerRef = (ev) => {
      const det = ev.detail || {};
      populateConditionForm(det.raw || {}, det.compiled_dsl || null);
    };
    window.addEventListener('condition:basic:load', _basicLoadHandlerRef);
  }

  if (!_createHandlerRef) {
    _createHandlerRef = () => {
      const formEl = el('condition-form');
      if(formEl) {
        try { formEl.reset(); } catch(e){}
      }
      const container = document.getElementById('conditionsContainer');
      if(container) container.innerHTML = '';
      addConditionItem();
      try { if(el('savedConditionId')) el('savedConditionId').value = ''; } catch(e){}
    };
    window.addEventListener('condition:create', _createHandlerRef);
  }
}

export { createConditionItemFromDefault };