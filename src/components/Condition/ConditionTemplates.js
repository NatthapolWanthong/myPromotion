// ConditionTemplates.js
// NOTE: content is JS (ES module). If you prefer .js extension, rename file.
// Responsibilities:
// - initTemplates(): cache template nodes
// - addConditionItem(defaultData): create a condition block DOM and return wrapper
// - addRewardItem(container, defaultData): create reward DOM and return wrapper

import { genId, setProductInputsState, $ } from './ConditionHelpers.js';
import { API } from '/myPromotion/src/assets/js/api.js';

let conditionsContainer = null;
let conditionTemplate = null;
let rewardTemplate = null;

// Simple cache for form options to avoid repeated network calls
let FORM_OPTIONS_CACHE = null;
async function getCachedFormOptions() {
  if (FORM_OPTIONS_CACHE) return FORM_OPTIONS_CACHE;
  try {
    const res = await API.getFormOptions();
    FORM_OPTIONS_CACHE = res || {};
    return FORM_OPTIONS_CACHE;
  } catch (e) {
    FORM_OPTIONS_CACHE = {};
    throw e;
  }
}

// --- place this near top of ConditionTemplates.js (after imports) ---
// Mapping: key = rewardAction value (string). You can edit these keys to match actual action IDs/values your API returns.
// Also mapping supports fallback by matching action label text (thai/en) if key not found.
const REWARD_OBJECT_OPTIONS_BY_ACTION = {
  '1': [
    { value: 'product', label: 'สินค้า' },
    { value: 'total',   label: 'ยอดรวม' },
    { value: 'shipping',label: 'ค่าจัดส่ง' }
  ],
  '2': [
    { value: 'product', label: 'สินค้า' },
    { value: 'gold',    label: 'ทอง' },
    { value: 'car',     label: 'รถ' }
  ],
  'discount': [
    { value: 'product', label: 'สินค้า' },
    { value: 'total',   label: 'ยอดรวม' },
    { value: 'shipping',label: 'ค่าจัดส่ง' }
  ],
  'gift': [
    { value: 'product', label: 'สินค้า' },
    { value: 'gold',    label: 'ทอง' },
    { value: 'car',     label: 'รถ' }
  ]
};

function getRewardObjectOptionsForAction(actionValOrLabel){
  const raw = String(actionValOrLabel ?? '').trim();
  if(raw === '') return [];
  if(REWARD_OBJECT_OPTIONS_BY_ACTION.hasOwnProperty(raw)) return REWARD_OBJECT_OPTIONS_BY_ACTION[raw];
  const low = raw.toLowerCase();
  if(low.includes('แถม') || low.includes('ของแถม') || low.includes('gift')) {
    return REWARD_OBJECT_OPTIONS_BY_ACTION['2'] || REWARD_OBJECT_OPTIONS_BY_ACTION['gift'] || [];
  }
  if(low.includes('ส่วนลด') || low.includes('discount')) {
    return REWARD_OBJECT_OPTIONS_BY_ACTION['1'] || REWARD_OBJECT_OPTIONS_BY_ACTION['discount'] || [];
  }
  const num = raw.replace(/[^\d]/g, '');
  if(num && REWARD_OBJECT_OPTIONS_BY_ACTION.hasOwnProperty(num)) return REWARD_OBJECT_OPTIONS_BY_ACTION[num];
  return [];
}


export function initTemplates(){
  conditionsContainer = document.getElementById('conditionsContainer');
  conditionTemplate = document.getElementById('condition-template');
  rewardTemplate = document.getElementById('reward-template');

  if(!conditionsContainer || !conditionTemplate || !rewardTemplate) {
    return;
  }

  // bind add condition button (id btn-add-condition)
  const addBtn = document.getElementById('btn-add-condition');
  if(addBtn && !addBtn._bound){
    addBtn._bound = true;
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addConditionItem();
    });
  }

  // ensure at least one item for UX
  if(conditionsContainer.children.length === 0) addConditionItem();
}


/**
 * addConditionItem(defaultData)
 * defaultData: { action, object, productId, productName, comparator, value, unit, rewards: [] }
 *
 * NOTE: returns wrapper synchronously, but sets wrapper._ready to a Promise that resolves once async options are loaded and defaults applied.
 */
export function addConditionItem(defaultData = null){
  if(!conditionTemplate || !conditionsContainer) return null;
  const tpl = conditionTemplate.content.cloneNode(true);
  const wrapper = tpl.querySelector('.condition-item');
  if(!wrapper) return null;

  // store defaultData onto wrapper so async parts can re-apply reliably
  wrapper.__defaultData = defaultData || null;

  const actionSel = wrapper.querySelector('.condition-form-action');
  const objectSel = wrapper.querySelector('.condition-form-object');
  const comparatorSel = wrapper.querySelector('.comparatorSelect');
  const unitSel = wrapper.querySelector('.unitSelect');
  const rewardsContainer = wrapper.querySelector('.rewardsContainer');

  // product inputs ids
  const pidName = genId('prodName_cond');
  const pidId = genId('prodId_cond');
  const nameInput = wrapper.querySelector('.selectedProductName_condition');
  const idInput = wrapper.querySelector('.selectedProductId_condition');
  const btnOpen = wrapper.querySelector('.btn-open-product-modal');
  if(nameInput) nameInput.id = pidName;
  if(idInput) idInput.id = pidId;
  if(btnOpen){
    if(pidName) btnOpen.setAttribute('data-target-name', pidName);
    if(pidId) btnOpen.setAttribute('data-target-id', pidId);
  }

  // update product visibility helper
  const updateProductVisibility = (val) => {
    try {
      const isProduct = String(val) === '1' || String(val).toLowerCase().includes('สินค้า') || String(val).toLowerCase().includes('product');
      const hasProductValue = Boolean((idInput && String(idInput.value).trim()) || (nameInput && String(nameInput.value).trim()));
      setProductInputsState(nameInput, idInput, isProduct || hasProductValue);
    } catch(e){}
  };

  // bind object change early
  if(objectSel){
    objectSel.addEventListener('change', (ev)=> updateProductVisibility(ev.target.value));
  }

  // add reward button
  const addRewardBtn = wrapper.querySelector('.btn-add-reward');
  if(addRewardBtn && rewardsContainer){
    addRewardBtn.addEventListener('click', ()=> addRewardItem(rewardsContainer));
  }

  // remove condition button
  const removeBtn = wrapper.querySelector('.btn-remove-condition');
  if(removeBtn) removeBtn.addEventListener('click', ()=> wrapper.remove());

  // apply naive defaults synchronously (text/hidden) so fields exist
  if(defaultData){
    try{
      if(defaultData.action && actionSel) actionSel.value = defaultData.action;
      if(defaultData.object && objectSel) objectSel.value = defaultData.object;
      // support array or string for productId
      if(defaultData.productId && idInput) {
        idInput.value = Array.isArray(defaultData.productId) ? defaultData.productId.join(',') : String(defaultData.productId);
      }
      if(defaultData.productName && nameInput) nameInput.value = defaultData.productName;
      if(defaultData.comparator && comparatorSel) comparatorSel.value = defaultData.comparator;
      if(defaultData.value) wrapper.querySelector('.valueInput') && (wrapper.querySelector('.valueInput').value = defaultData.value);
      if(defaultData.unit && unitSel) unitSel.value = defaultData.unit;
      if(Array.isArray(defaultData.rewards) && defaultData.rewards.length){
        (rewardsContainer ? Array.from(rewardsContainer.children) : []).forEach(c => c.remove());
        defaultData.rewards.forEach(r => addRewardItem(rewardsContainer, r));
      }
    }catch(e){}
  }

  // Async: load form options once (cached) then re-apply defaults robustly
  const readyPromise = (async ()=>{
    try{
      const res = await getCachedFormOptions();
      const opts = res || {};
      const build = (arr) => {
        if(!Array.isArray(arr)) return '';
        return arr.map(i => {
          const v = i.id ?? i.value ?? i.key ?? '';
          const label = i.th_name ?? i.name ?? i.label ?? v;
          return `<option value="${String(v)}">${String(label)}</option>`;
        }).join('');
      };

      if(actionSel){
        actionSel.innerHTML = `<option value="" disabled selected>-- กรุณาเลือก --</option>` + build(opts.conditionAction || []);
      }
      if(objectSel){
        objectSel.innerHTML = `<option value="" disabled selected>-- กรุณาเลือก --</option>` + build(opts.conditionObject || []);
      }

      if(comparatorSel && comparatorSel.innerHTML.trim() === ''){
        comparatorSel.innerHTML = `<option value="=">=</option><option value=">">&gt;</option><option value="≥">≥</option><option value="<">&lt;</option><option value="≤">≤</option>`;
      }
      if(unitSel && unitSel.innerHTML.trim() === ''){
        unitSel.innerHTML = `<option value="1">บาท</option><option value="2">%</option><option value="3">ชิ้น</option><option value="4">โหล</option><option value="5">สลึง</option><option value="6">เมตร</option>`;
      }

      // reapply defaults robustly (use wrapper.__defaultData)
      const dd = wrapper.__defaultData;
      if(dd){
        try {
          if(dd.action) actionSel.value = String(dd.action);
          if(dd.object) objectSel.value = String(dd.object);
          if(dd.comparator) comparatorSel.value = String(dd.comparator);
          if(dd.unit) unitSel.value = String(dd.unit);

          // reapply product id + name after options loaded (support arrays)
          if(dd.productId && idInput){
            try {
              idInput.value = Array.isArray(dd.productId) ? dd.productId.join(',') : String(dd.productId);
            } catch(e){}
          }
          if(dd.productName && nameInput){
            try {
              nameInput.value = String(dd.productName);
            } catch(e){}
          }

          // ensure product inputs state (visible/hidden) is correct
          try { updateProductVisibility(objectSel && objectSel.value ? objectSel.value : (dd.object || '')); } catch(e){}
        } catch(e){}
      }
    }catch(e){
      console.warn('getFormOptions failed', e);
    }
  })().catch(()=>{ /* swallow so wrapper._ready won't reject by default */ });

  // attach promise to wrapper for consumers to await
  wrapper._ready = readyPromise;

  conditionsContainer.appendChild(wrapper);

  // ensure product visibility configured after DOM append
  try { updateProductVisibility((objectSel && objectSel.value) || (defaultData && defaultData.object) || ''); } catch(e){}

  return wrapper;
}





// --- addRewardItem (แก้เพื่อให้ populate object select หลัง async และ set product defaults) ---
export function addRewardItem(rewardsContainer, defaultData = null){
  if(!rewardTemplate || !rewardsContainer) return null;
  const tpl = rewardTemplate.content.cloneNode(true);
  const wrapper = tpl.querySelector('.reward-item');
  if(!wrapper) return null;

  const rewAction = wrapper.querySelector('.condition-form-reward-action');
  const rewObject = wrapper.querySelector('.condition-form-reward-object');
  const rewUnit = wrapper.querySelector('.rewardUnitSelect');
  const nameInput = wrapper.querySelector('.selectedProductName_reward');
  const idInput = wrapper.querySelector('.selectedProductId_reward');
  const btnOpen = wrapper.querySelector('.btn-open-product-modal');

  // ids for product inputs
  const pidName = genId('prodName_rew');
  const pidId = genId('prodId_rew');
  if(nameInput) nameInput.id = pidName;
  if(idInput) idInput.id = pidId;
  if(btnOpen){
    if(pidName) btnOpen.setAttribute('data-target-name', pidName);
    if(pidId) btnOpen.setAttribute('data-target-id', pidId);
  }

  // helper: populate object select according to action value/label
  const populateObjectOptions = (actionValOrLabel) => {
    if(!rewObject) return;
    const opts = getRewardObjectOptionsForAction(actionValOrLabel) || [];
    // clear existing options
    rewObject.innerHTML = '';
    // add placeholder
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = '-- กรุณาเลือก --';
    rewObject.appendChild(placeholder);

    if(opts.length === 0){
      rewObject.disabled = true;
      rewObject.removeAttribute('required');
      return;
    }
    // append options
    for(const o of opts){
      const opt = document.createElement('option');
      opt.value = String(o.value ?? '');
      opt.textContent = String(o.label ?? o.value ?? '');
      rewObject.appendChild(opt);
    }
    rewObject.disabled = false;
    rewObject.setAttribute('required','required');
  };

  // when action changes -> populate object select accordingly + control product inputs visibility
  const onActionChange = (ev) => {
    const actVal = String(ev?.target?.value ?? rewAction.value ?? '').trim();
    let usedKey = actVal;
    if(!getRewardObjectOptionsForAction(usedKey).length){
      const selText = (rewAction.selectedOptions && rewAction.selectedOptions[0] && rewAction.selectedOptions[0].text) ? rewAction.selectedOptions[0].text : '';
      usedKey = selText;
    }
    populateObjectOptions(usedKey);

    // If default object already present, set it after populating options
    setTimeout(()=> {
      try {
        if(defaultData && (defaultData.rewardObject !== undefined && defaultData.rewardObject !== null)) {
          try { rewObject.value = String(defaultData.rewardObject); } catch(e){}
        }
        // then toggle product inputs
        const v = String(rewObject.value || '');
        setProductInputsState(nameInput, idInput, v === 'product');
      } catch(e){}
    }, 40);
  };

  // when object changes -> toggle product inputs
  const onObjectChange = (ev) => {
    const v = String(ev?.target?.value ?? rewObject.value ?? '');
    const showProduct = (v === 'product');
    setProductInputsState(nameInput, idInput, showProduct);
  };

  // populate reward selects via API.getFormOptions (cached), re-apply defaults AFTER options loaded
  const readyPromise = (async ()=>{
    try{
      const res = await getCachedFormOptions();
      const opts = res || {};
      const build = (arr) => {
        if(!Array.isArray(arr)) return '';
        return arr.map(i => `<option value="${i.id ?? i.value ?? i.key ?? ''}">${i.th_name ?? i.name ?? i.label ?? i.id}</option>`).join('');
      };

      if(rewAction){
        rewAction.innerHTML = `<option value="" disabled selected>-- กรุณาเลือก --</option>` + build(opts.conditionRewardAction || []);
        if(defaultData && defaultData.rewardAction !== undefined && defaultData.rewardAction !== null){
          try{ rewAction.value = String(defaultData.rewardAction); }catch(e){}
        }
      }
      if(rewUnit && rewUnit.innerHTML.trim() === ''){
        rewUnit.innerHTML = `<option value="1">บาท</option><option value="2">%</option><option value="3">ชิ้น</option><option value="4">โหล</option><option value="5">สลึง</option><option value="6">เมตร</option>`;
        if(defaultData && defaultData.rewardUnit) {
          try { rewUnit.value = defaultData.rewardUnit; } catch(e){}
        }
      }

      // If defaultAction present, trigger the action-change logic which will populate rewObject and set default object
      try {
        if(defaultData && defaultData.rewardAction && rewAction){
          const evt = new Event('change', { bubbles: true });
          rewAction.dispatchEvent(evt);
        } else {
          setTimeout(()=> {
            try{
              const init = rewAction && (rewAction.value || (rewAction.selectedOptions && rewAction.selectedOptions[0] && rewAction.selectedOptions[0].value));
              if(init) { onActionChange({ target: { value: init } }); }
            }catch(e){}
          }, 40);
        }
      } catch(e){}
    }catch(e){
      console.warn('getFormOptions failed', e);
    }
  })().catch(()=>{});

  // attach listeners after element exists
  if(rewAction) rewAction.addEventListener('change', onActionChange);
  if(rewObject) rewObject.addEventListener('change', onObjectChange);

  const removeBtn = wrapper.querySelector('.btn-remove-reward');
  if(removeBtn) removeBtn.addEventListener('click', ()=> wrapper.remove());

  // apply defaults if provided (set product inputs / value)
  if(defaultData){
    try{
      // support both rewardProductIds (array) and rewardProductId (string) legacy
      if(defaultData.rewardProductIds && idInput) {
        if(Array.isArray(defaultData.rewardProductIds)) idInput.value = defaultData.rewardProductIds.join(',');
        else idInput.value = String(defaultData.rewardProductIds);
      } else if(defaultData.rewardProductId && idInput) {
        if(Array.isArray(defaultData.rewardProductId)) idInput.value = defaultData.rewardProductId.join(',');
        else idInput.value = String(defaultData.rewardProductId);
      }

      if(defaultData.rewardProductName && nameInput) nameInput.value = defaultData.rewardProductName;
      if(defaultData.rewardValue) wrapper.querySelector('.rewardValueInput') && (wrapper.querySelector('.rewardValueInput').value = defaultData.rewardValue);

      // If rewardObject was provided but options were not loaded yet, ensure we set it after a short delay
      if(defaultData.rewardObject) {
        setTimeout(()=> {
          try {
            if(rewObject && rewObject.options && rewObject.options.length > 0){
              try { rewObject.value = String(defaultData.rewardObject); } catch(e){}
              onObjectChange({ target: rewObject });
            } else {
              try { rewObject.value = String(defaultData.rewardObject); } catch(e){}
              onObjectChange({ target: rewObject });
            }
            // ensure product inputs visibility after setting rewObject
            const v = String(rewObject.value || '');
            setProductInputsState(nameInput, idInput, v === 'product');
          } catch(e){}
        }, 80);
      } else {
        try {
          const showProd = Boolean(defaultData.rewardProductIds || defaultData.rewardProductId || defaultData.rewardProductName);
          setProductInputsState(nameInput, idInput, showProd);
        } catch(e){}
      }
    }catch(e){ console.warn('apply defaultData failed', e); }
  }

  // attach ready promise
  wrapper._ready = readyPromise;

  rewardsContainer.appendChild(wrapper);
  return wrapper;
}

// export cache accessor (optional)
export { getCachedFormOptions };
