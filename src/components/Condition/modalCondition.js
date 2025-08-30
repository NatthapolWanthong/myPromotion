// modalCondition.js (REPLACE file content with this)
import { API } from "/myPromotion/src/assets/js/api.js";
import { getOptions } from "/myPromotion/src/assets/js/store/optionsStore.js";
import { FormHelper } from "/myPromotion/src/assets/js/FormHelper.js";
import { ConditionBlockHelper } from "/myPromotion/src/assets/js/ConditionBlockHelper.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';
import { swalConfirm , swalToast , showToast, showAlert } from '/myPromotion/src/assets/js/alertUtil.js';

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const el = id => document.getElementById(id);
const eHtml = s => (s === null || s === undefined) ? '' : String(s)
  .replace(/[&<>"'`=\/]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[c]));
const debounce = (fn, t=350) => { let h; return (...a)=>{ clearTimeout(h); h=setTimeout(()=>fn(...a), t); }; };

let overlay, listView, editView, tbodyEl, badge, noEl, searchInput, perPageSelect, btnPrev, btnNext, paginationInfo, conditionForm;
let conditionsContainer, conditionTemplate, rewardTemplate;

let promoId = null;
let lastFocused = null;
let pageState = { page: 1, per_page: 20, total_pages: 1, q: '' };
let currentConditions = [];
let searchBound = false;

// option HTML caches (will be filled from getOptions())
let comparatorOptionsHTML = `
  <option value="=">=</option>
  <option value=">">&gt;</option>
  <option value="≥">≥</option>
  <option value="<">&lt;</option>
  <option value="≤">≤</option>
`;
let unitOptionsHTML = `
  <option value="1">บาท</option>
  <option value="2">สลึง</option>
  <option value="3">%</option>
  <option value="4">ชิ้น</option>
  <option value="5">โหล</option>
  <option value="6">ลัง</option>
  <option value="7">เมตร</option>
`;

let actionOptionsHTML = `<option value="">--</option>`;
let objectOptionsHTML = `<option value="">--</option>`;
let rewardActionOptionsHTML = `<option value="">--</option>`;
let rewardObjectOptionsHTML = `<option value="">--</option>`;
let rewardUnitOptionsHTML = unitOptionsHTML;

function genId(prefix='id') { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function showListView(){
  editView = editView || $('#condition-edit-view');
  listView = listView || $('#condition-list-view');
  if(editView) editView.classList.add('d-none');
  if(listView) listView.classList.remove('d-none');
  overlay && overlay.classList.remove('mode-edit');
  const t = $('#overlay-title'); if(t) t.textContent='เงื่อนไข';
  refreshConditionsListUI();
  setCreateButtonMode('create');
}

function showEditView(data = null){
  listView = listView || $('#condition-list-view');
  editView = editView || $('#condition-edit-view');
  if(listView) listView.classList.add('d-none');
  if(editView) editView.classList.remove('d-none');
  overlay && overlay.classList.add('mode-edit');
  const t = $('#overlay-title'); if(t) t.textContent = data ? 'แก้ไขเงื่อนไข' : 'สร้างเงื่อนไข';
  resetEditForm();
  if(data) populateFormForEdit(data);
  setCreateButtonMode('back');
}

/* ---------------------------
   Helpers to find product container & toggle state
   --------------------------- */
function findNearestProductContainer(elm) {
  if(!elm) return null;
  let cur = elm;
  for(let i=0;i<8 && cur;i++){
    if(cur.classList && Array.from(cur.classList).some(c=>/selectProduct|selectproduct|condition-product-block|reward-product-block|product|prod|wrapper|col|form-group/i.test(c))) return cur;
    cur = cur.parentElement;
  }
  return elm.parentElement;
}

/**
 * Control display + disabled/required state for product name/id inputs and the open-button.
 * - nameInput: input.form-control (visible text)
 * - idInput: hidden input to store id
 * - show: boolean -> true = show & required, false = hide & disabled
 */
function setProductInputsState(nameInput, idInput, show){
  if(!nameInput || !idInput) return;

  let container = null;
  try {
    container = (nameInput.closest && (nameInput.closest('.condition-product-block') || nameInput.closest('.reward-product-block'))) || null;
  } catch(e) { container = null; }
  if(!container) container = findNearestProductContainer(nameInput) || nameInput.parentElement;

  const btn = container ? container.querySelector('.btn-open-product-modal') : (nameInput.parentElement?.querySelector('.btn-open-product-modal') || null);

  try{
    if(show){
      if(container) container.classList.remove('d-none');

      if(nameInput.tagName === 'INPUT' || nameInput.tagName === 'TEXTAREA'){
        nameInput.removeAttribute('disabled');
        nameInput.setAttribute('required','required');
      }
      if(idInput.tagName === 'INPUT' || idInput.tagName === 'TEXTAREA'){
        idInput.removeAttribute('disabled');
        idInput.setAttribute('required','required');
      }

      if(btn) btn.classList.remove('d-none');

    } else {
      try { if(nameInput.tagName === 'INPUT' || nameInput.tagName === 'TEXTAREA') nameInput.value = ''; } catch(e){}
      try { if(idInput.tagName === 'INPUT' || idInput.tagName === 'TEXTAREA') idInput.value = ''; } catch(e){}

      if(nameInput.tagName === 'INPUT' || nameInput.tagName === 'TEXTAREA'){
        nameInput.setAttribute('disabled','disabled');
        nameInput.removeAttribute('required');
      }
      if(idInput.tagName === 'INPUT' || idInput.tagName === 'TEXTAREA'){
        idInput.setAttribute('disabled','disabled');
        idInput.removeAttribute('required');
      }

      if(btn) btn.classList.add('d-none');

      if(container) container.classList.add('d-none');
    }
  }catch(err){
    console.warn('setProductInputsState error', err);
  }
}

/* ---------------------------
   focus trap helpers
   --------------------------- */
const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
function trap(container){
  try{
    const list = Array.from(container.querySelectorAll(focusable)).filter(x => x.offsetParent !== null);
    if(!list.length) return;
    const first = list[0], last = list[list.length-1];
    container._trap = e => {
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    container.addEventListener('keydown', container._trap);
    setTimeout(()=>first.focus(), 0);
  }catch(err){ console.warn('trap', err); }
}
function release(container){ if(container && container._trap){ container.removeEventListener('keydown', container._trap); delete container._trap; } }

// robust backdrop cleanup (fix lingering backdrop)
function cleanBootstrapBackdrops(){
  try{
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
  }catch(e){ console.warn('cleanup backdrop', e); }
}

/* ---------------------------
   overlay show/hide
   --------------------------- */
function escHandler(e){ if(e.key === 'Escape' || e.key === 'Esc'){ if(editView && !editView.classList.contains('d-none')) showListView(); else hideOverlay(); } }
function enableOverlayMode(){
  if(!document.body.classList.contains('overlay-open')) document.body.classList.add('overlay-open');
  lastFocused = document.activeElement;
  if(overlay) trap(overlay);
  document.addEventListener('keydown', escHandler);
}
function disableOverlayMode(){
  document.body.classList.remove('overlay-open');
  if(overlay) release(overlay);
  if(lastFocused?.focus) lastFocused.focus();
  lastFocused = null;
  document.removeEventListener('keydown', escHandler);
  setTimeout(cleanBootstrapBackdrops, 80);
}
function showOverlay(){ overlay = overlay || $('#condition-overlay'); if(!overlay) return; overlay.classList.remove('d-none'); showListView(); enableOverlayMode(); }
function hideOverlay(){
  overlay = overlay || $('#condition-overlay');
  if(!overlay) return;
  overlay.classList.add('d-none');
  disableOverlayMode();
  const productModal = document.querySelector('#productModal') || document.querySelector('#modalProductList') || document.querySelector('#modalProduct');
  if (productModal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    try { bootstrap.Modal.getOrCreateInstance(productModal).hide(); } catch(e){ }
  }
  setTimeout(cleanBootstrapBackdrops, 50);
}

function setCreateButtonMode(mode){
  const btn = el('btn-create-condition');
  if(!btn) return;
  if(mode === 'back'){
    btn.dataset.mode = 'back';
    btn.textContent = 'ย้อนกลับ';
    btn.classList.add('btn-back-mode');
    btn.setAttribute('aria-label','ย้อนกลับไปยังรายการเงื่อนไข');
  } else {
    btn.dataset.mode = 'create';
    btn.textContent = 'สร้างเงื่อนไข';
    btn.classList.remove('btn-back-mode');
    btn.setAttribute('aria-label','สร้างเงื่อนไขใหม่');
  }
}

/* ---------------------------
   API helper
   --------------------------- */
async function apiGetConditions(params){
  try{
    // Prefer API.getCondition if available
    if (API && typeof API.getCondition === 'function') {
      return await API.getCondition(params);
    }
    if (API && typeof API.fetchData === 'function') {
      return await API.fetchData("/myPromotion/src/connection/condition/getCondition.php", "POST", params);
    }
    const r = await fetch('/myPromotion/src/connection/condition/getCondition.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json; charset=utf-8'},
      body: JSON.stringify(params),
      credentials: 'same-origin'
    });
    return r.ok ? await r.json() : { success:false, error:'http ' + r.status };
  }catch(err){ return { success:false, error:String(err) }; }
}

/* ---------------------------
   load & render
   --------------------------- */
async function loadConditions(opts = {}){ 
  pageState = { ...pageState, ...opts };
  const effective = opts.promotion_id ?? promoId ?? (new URLSearchParams(window.location.search).get('id'));
  if(!effective){ currentConditions = []; refreshConditionsListUI(); return; }
  promoId = Number(effective);

  tbodyEl = tbodyEl || $('#conditionsListTable tbody');
  if(tbodyEl) tbodyEl.innerHTML = `<tr><td colspan="4" class="text-center">กำลังโหลด...</td></tr>`;

  const params = {
    promotion_id: Number(promoId),
    page: pageState.page,
    per_page: Number(pageState.per_page),
    q: pageState.q || '',
    is_active: 1,
    sort_by: 'created_at',
    sort_dir: 'DESC'
  };

  if(!params.promotion_id || params.promotion_id <= 0){ currentConditions = []; refreshConditionsListUI(); return; }

  let res;
  try{
    res = await apiGetConditions(params);
  }catch(err){ console.error('getCondition error', err); res = { success:false, error:String(err) }; }

  if(res && res.success){
    currentConditions = (res.data || []).map(r => {
      const out = { ...r };
      // keep parsed condition_xml if backend provided object
      try{
        out.condition_xml_parsed = (r.condition_xml && typeof r.condition_xml === 'object') ? r.condition_xml : (typeof r.condition_xml === 'string' && r.condition_xml.trim() ? JSON.parse(r.condition_xml) : r.condition_xml);
      }catch(e){ out.condition_xml_parsed = r.condition_xml; }
      out.name = out.condition_name ?? out.name;
      return out;
    });
    pageState.total_pages = res.total_pages || 1;
    badge = badge || $('#condition-count');
    badge && (badge.textContent = String(res.total ?? currentConditions.length));
    refreshConditionsListUI();
  } else {
    currentConditions = [];
    if(tbodyEl) tbodyEl.innerHTML = `<tr><td colspan="4" class="text-center text-danger">โหลดข้อมูลล้มเหลว: ${eHtml(res?.error || 'unknown')}</td></tr>`;
    badge && (badge.textContent = '0');
  }
}

function prettyCondExample(cond){
  try{
    if(!cond) return '-';
    if(typeof cond === 'string') {
      // try to decode JSON string
      try {
        const j = JSON.parse(cond);
        return `<pre class="small mb-0" style="max-height:120px;overflow:auto;">${eHtml(JSON.stringify(j, null, 2))}</pre>`;
      } catch(e){
        return `<pre class="small mb-0" style="max-height:120px;overflow:auto;">${eHtml(cond)}</pre>`;
      }
    }
    // object
    return `<pre class="small mb-0" style="max-height:120px;overflow:auto;">${eHtml(JSON.stringify(cond, null, 2))}</pre>`;
  }catch(e){ return eHtml(String(cond)); }
}

function refreshConditionsListUI(){
  tbodyEl = tbodyEl || $('#conditionsListTable tbody');
  badge = badge || $('#condition-count');
  noEl = noEl || $('#no-conditions');
  paginationInfo = paginationInfo || $('#paginationInfo');

  if(!tbodyEl) return;
  tbodyEl.innerHTML = '';

  if(!currentConditions?.length){
    noEl && noEl.classList.remove('d-none');
    badge && (badge.textContent = '0');
    paginationInfo && (paginationInfo.textContent = `Page ${pageState.page} / ${pageState.total_pages}`);
    return;
  }
  noEl && noEl.classList.add('d-none');

  currentConditions.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${(pageState.page - 1) * pageState.per_page + idx + 1}</td>
      <td>${eHtml(c.condition_name ?? c.name ?? '-')}</td>
      <td>${prettyCondExample(c.condition_xml_parsed ?? c.condition_xml ?? c.conditionBlockJson ?? '-')}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-edit-condition" data-id="${c.id}">แก้ไข</button>
        <button class="btn btn-sm btn-outline-danger btn-delete-condition" data-id="${c.id}">ลบ</button>
      </td>
    `;
    tbodyEl.appendChild(tr);
  });

  tbodyEl.querySelectorAll('.btn-edit-condition').forEach(btn => {
    if (btn._boundEdit) return;
    btn._boundEdit = true;
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const cond = currentConditions.find(x => Number(x.id) === id);
      showEditView(cond);
    });
  });

  tbodyEl.querySelectorAll('.btn-delete-condition').forEach(btn => {
    if (btn._boundDel) return;
    btn._boundDel = true;
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      if(!await swalConfirm({ title: 'ยืนยัน', text: 'ต้องการลบเงื่อนไขนี้ ใช่หรือไม่?' })) return;
      btn.disabled = true;
      try{
        // call API.deleteCondition safely
        let resp = null;
        if (API && typeof API.deleteCondition === 'function') {
          resp = await API.deleteCondition(id);
        } else if (API && API.default && typeof API.default.deleteCondition === 'function') {
          resp = await API.default.deleteCondition(id);
        } else {
          // fallback to fetch
          const r = await fetch('/myPromotion/src/connection/condition/deleteCondition.php', {
            method: 'POST',
            headers: {'Content-Type':'application/json; charset=utf-8'},
            body: JSON.stringify({ id }),
            credentials: 'same-origin'
          });
          resp = r.ok ? await r.json() : { success:false, error:'http ' + r.status };
        }

        if(resp && resp.success){
          badge && (badge.textContent = String(resp.total ?? badge.textContent));
          window.dispatchEvent(new CustomEvent('condition:changed', { detail: { promotion_id: promoId, total: resp.total ?? null } }));
          if(resp.total === 0 && pageState.page > 1) pageState.page = Math.max(1, pageState.page - 1);
          await loadConditions({ page: pageState.page });
          swalToast({ icon: 'success', title: 'ลบเงื่อนไขสำเร็จ' });
        } else throw new Error(resp?.error || 'delete failed');
      }catch(err){ console.error(err); showAlert('ลบล้มเหลว: ' + (err.message || err)); } finally { btn.disabled = false; }
    });
  });

  paginationInfo && (paginationInfo.textContent = `Page ${pageState.page} / ${pageState.total_pages}`);
}

/* ---------------------------
   Form helpers & validation
   --------------------------- */
function resetEditForm(){
  conditionForm = conditionForm || $('#condition-form');
  if(!conditionForm) return;
  conditionForm.reset();

  // clear any default single-form product fields if present
  const idsToClear = [
    'selectedProductName_condition', 'selectedProductId_condition',
    'selectedProductName_reward', 'selectedProductId_reward'
  ];
  idsToClear.forEach(id => {
    const elm = document.getElementById(id);
    if (elm) {
      if (elm.tagName === 'INPUT' || elm.tagName === 'TEXTAREA') {
        try { elm.value = ''; elm.setAttribute('disabled','disabled'); elm.removeAttribute('required'); } catch(e){}
      } else try { elm.textContent = ''; } catch(e){}
    }
  });

  el('conditionBlockJson') && (el('conditionBlockJson').value = '');
  el('savedConditionId') && (el('savedConditionId').value = '');
  conditionForm.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));
  const t = $('#conditionTable tbody'); if(t) t.innerHTML = '';

  // hide any product wrappers (single-form ones if exist)
  const w1 = el('productSelectionWrapper'); if (w1) w1.classList.add('d-none');
  const w2 = el('productSelectionWrapper-reward'); if (w2) w2.classList.add('d-none');

  // remove any existing dynamic condition items (start clean)
  if(conditionsContainer){
    conditionsContainer.innerHTML = '';
  }
}

/* ---------------------------
   Populate form for edit (try Blockly JSON then fallback)
   --------------------------- */
async function populateFormForEdit(data){
  if(!data) return;

  // set name
  el('condition-form-name') && (el('condition-form-name').value = data.name ?? data.condition_name ?? '');

  // prepare conditionJson (try parsed field first)
  let conditionJson = data.condition_xml;
  if (data.condition_xml_parsed) conditionJson = data.condition_xml_parsed;
  else {
    try {
      if (typeof conditionJson === 'string' && conditionJson.trim()) {
        conditionJson = JSON.parse(conditionJson);
      }
    } catch(e){ /* ignore parse error */ }
  }

  // If we have "fields" (legacy flat fields), apply them first so selects/inputs get correct values
  const fields = (conditionJson && typeof conditionJson === 'object' && conditionJson.fields && typeof conditionJson.fields === 'object')
    ? conditionJson.fields
    : (data.fields && typeof data.fields === 'object' ? data.fields : null);

  if (fields) {
    // map basic top-level fields to controls (safe guards)
    try {
      // Action/Object selects (set all existing selects)
      if (fields.ACTION !== undefined) {
        document.querySelectorAll('.condition-form-action').forEach(s => { try { s.value = String(fields.ACTION); } catch(e){} });
      }
      if (fields.OBJECT !== undefined) {
        document.querySelectorAll('.condition-form-object').forEach(s => { try { s.value = String(fields.OBJECT); } catch(e){} });
      }

      // single-form product (backwards compatibility)
      if (fields.PRODUCT_ID || fields.PRODUCT_NAME) {
        const nameEl = el('selectedProductName_condition');
        const idEl = el('selectedProductId_condition');
        if (nameEl && fields.PRODUCT_NAME !== undefined) { nameEl.value = fields.PRODUCT_NAME ?? ''; nameEl.removeAttribute('disabled'); nameEl.setAttribute('required','required'); }
        if (idEl && fields.PRODUCT_ID !== undefined) { idEl.value = fields.PRODUCT_ID ?? ''; idEl.removeAttribute('disabled'); idEl.setAttribute('required','required'); }
        try { const wrapper = findNearestProductContainer(nameEl); const btn = wrapper?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); } catch(e){}
      } else {
        if (el('selectedProductName_condition')) { el('selectedProductName_condition').value = ''; el('selectedProductName_condition').setAttribute('disabled','disabled'); el('selectedProductName_condition').removeAttribute('required'); }
        if (el('selectedProductId_condition')) { el('selectedProductId_condition').value = ''; el('selectedProductId_condition').setAttribute('disabled','disabled'); el('selectedProductId_condition').removeAttribute('required'); }
      }

      // comparator/value/unit
      if (fields.COMPARATOR !== undefined) el('comparatorSelect') && (el('comparatorSelect').value = String(fields.COMPARATOR));
      if (fields.VALUE !== undefined) el('valueInput') && (el('valueInput').value = String(fields.VALUE));
      if (fields.UNIT !== undefined) el('unitSelect') && (el('unitSelect').value = String(fields.UNIT));

      // reward single form (top-level)
      if (fields.REWARD_ACTION !== undefined) document.querySelectorAll('.condition-form-reward-action').forEach(s => { try{ s.value = String(fields.REWARD_ACTION); }catch(e){} });
      if (fields.REWARD_OBJECT !== undefined) document.querySelectorAll('.condition-form-reward-object').forEach(s => { try{ s.value = String(fields.REWARD_OBJECT); }catch(e){} });
      if (fields.REWARD_VALUE !== undefined) el('rewardValueInput') && (el('rewardValueInput').value = String(fields.REWARD_VALUE));
      if (fields.REWARD_UNIT !== undefined) el('rewardUnitSelect') && (el('rewardUnitSelect').value = String(fields.REWARD_UNIT));

      if (fields.REWARD_PRODUCT_ID || fields.REWARD_PRODUCT_NAME) {
        const rnameEl = el('selectedProductName_reward');
        const ridEl = el('selectedProductId_reward');
        if (rnameEl && fields.REWARD_PRODUCT_NAME !== undefined) { rnameEl.value = fields.REWARD_PRODUCT_NAME ?? ''; rnameEl.removeAttribute('disabled'); rnameEl.setAttribute('required','required'); }
        if (ridEl && fields.REWARD_PRODUCT_ID !== undefined) { ridEl.value = fields.REWARD_PRODUCT_ID ?? ''; ridEl.removeAttribute('disabled'); ridEl.setAttribute('required','required'); }
        try { const wrapper = findNearestProductContainer(rnameEl); const btn = wrapper?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); } catch(e){}
      } else {
        if (el('selectedProductName_reward')) { el('selectedProductName_reward').value = ''; el('selectedProductName_reward').setAttribute('disabled','disabled'); el('selectedProductName_reward').removeAttribute('required'); }
        if (el('selectedProductId_reward')) { el('selectedProductId_reward').value = ''; el('selectedProductId_reward').setAttribute('disabled','disabled'); el('selectedProductId_reward').removeAttribute('required'); }
      }

      // set savedConditionId early
      el('savedConditionId') && (el('savedConditionId').value = data.id ?? '');

    } catch(e){ console.warn('populateFormForEdit apply fields failed', e); }
  }

  // If it's a Blockly-like JSON, populate dynamic blocks from it
  if (conditionJson && typeof conditionJson === 'object' && (conditionJson.blocks || (conditionJson.blocks && conditionJson.blocks.blocks) || Array.isArray(conditionJson.blocks))) {
    try {
      // Populate dynamic items (this will create DOM blocks)
      await populateFormFromBlockly(conditionJson);

      // after creating DOM from blocks, re-apply fields to ensure selects/units overwritten by saved fields
      if (fields) {
        try {
          if (fields.ACTION !== undefined) document.querySelectorAll('.condition-form-action').forEach(s => { try{ s.value = String(fields.ACTION); }catch(e){} });
          if (fields.OBJECT !== undefined) document.querySelectorAll('.condition-form-object').forEach(s => { try{ s.value = String(fields.OBJECT); }catch(e){} });

          if (fields.PRODUCT_ID !== undefined) {
            // set product inputs for first block (if any) or top-level
            const firstPid = String(fields.PRODUCT_ID || '');
            const firstPname = String(fields.PRODUCT_NAME || '');
            const firstNameEl = el('selectedProductName_condition');
            const firstIdEl = el('selectedProductId_condition');
            if (firstNameEl && firstPid) { firstNameEl.value = firstPname; firstNameEl.removeAttribute('disabled'); firstNameEl.setAttribute('required','required'); }
            if (firstIdEl && firstPid) { firstIdEl.value = firstPid; firstIdEl.removeAttribute('disabled'); firstIdEl.setAttribute('required','required'); }
          }

          if (fields.COMPARATOR !== undefined) el('comparatorSelect') && (el('comparatorSelect').value = String(fields.COMPARATOR));
          if (fields.VALUE !== undefined) el('valueInput') && (el('valueInput').value = String(fields.VALUE));
          if (fields.UNIT !== undefined) el('unitSelect') && (el('unitSelect').value = String(fields.UNIT));

          if (fields.REWARD_ACTION !== undefined) document.querySelectorAll('.condition-form-reward-action').forEach(s => { try{ s.value = String(fields.REWARD_ACTION); }catch(e){} });
          if (fields.REWARD_OBJECT !== undefined) document.querySelectorAll('.condition-form-reward-object').forEach(s => { try{ s.value = String(fields.REWARD_OBJECT); }catch(e){} });
          if (fields.REWARD_PRODUCT_ID !== undefined) {
            const rname = el('selectedProductName_reward');
            const rid = el('selectedProductId_reward');
            if (rname) { rname.value = String(fields.REWARD_PRODUCT_NAME || ''); rname.removeAttribute('disabled'); rname.setAttribute('required','required'); }
            if (rid) { rid.value = String(fields.REWARD_PRODUCT_ID || ''); rid.removeAttribute('disabled'); rid.setAttribute('required','required'); }
          }
          if (fields.REWARD_VALUE !== undefined) el('rewardValueInput') && (el('rewardValueInput').value = String(fields.REWARD_VALUE));
          if (fields.REWARD_UNIT !== undefined) el('rewardUnitSelect') && (el('rewardUnitSelect').value = String(fields.REWARD_UNIT));
        } catch(e){ console.warn('populateFormForEdit reapply fields failed', e); }
      }

      // Save conditionBlockJson hidden with the parsed object (so submit uses it)
      el('conditionBlockJson') && (el('conditionBlockJson').value = JSON.stringify(conditionJson));
      el('savedConditionId') && (el('savedConditionId').value = data.id ?? '');
      return;
    } catch(e){
      console.warn('populateFormForEdit: populateFromBlockly failed', e);
      // fallthrough to legacy mapping below if populateFromBlockly fails
    }
  }

  // Fallback: previous (legacy) field mapping behavior (if blocks absent or above failed)
  if(data.fields){
    const f = data.fields;
    // existing legacy mapping (unchanged)
    try {
      document.querySelectorAll('.condition-form-action').forEach(s => s.value = f.ACTION ?? '');
      document.querySelectorAll('.condition-form-object').forEach(s => s.value = f.OBJECT ?? '');

      if (f.PRODUCT_ID || f.PRODUCT_NAME) {
        const nameEl = el('selectedProductName_condition');
        const idEl = el('selectedProductId_condition');
        if (nameEl) { nameEl.value = f.PRODUCT_NAME ?? ''; nameEl.removeAttribute('disabled'); nameEl.setAttribute('required','required'); }
        if (idEl) { idEl.value = f.PRODUCT_ID ?? ''; idEl.removeAttribute('disabled'); idEl.setAttribute('required','required'); }
        try { const wrapper = findNearestProductContainer(nameEl); const btn = wrapper?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); } catch(e){}
      } else {
        if (el('selectedProductName_condition')) { el('selectedProductName_condition').value = ''; el('selectedProductName_condition').setAttribute('disabled','disabled'); el('selectedProductName_condition').removeAttribute('required'); }
        if (el('selectedProductId_condition')) { el('selectedProductId_condition').value = ''; el('selectedProductId_condition').setAttribute('disabled','disabled'); el('selectedProductId_condition').removeAttribute('required'); }
      }

      el('comparatorSelect') && (el('comparatorSelect').value = f.COMPARATOR ?? '');
      el('valueInput') && (el('valueInput').value = f.VALUE ?? '');
      el('unitSelect') && (el('unitSelect').value = f.UNIT ?? '');

      document.querySelectorAll('.condition-form-reward-action').forEach(s => s.value = f.REWARD_ACTION ?? '');
      document.querySelectorAll('.condition-form-reward-object').forEach(s => s.value = f.REWARD_OBJECT ?? '');

      el('rewardValueInput') && (el('rewardValueInput').value = f.REWARD_VALUE ?? '');
      el('rewardUnitSelect') && (el('rewardUnitSelect').value = f.REWARD_UNIT ?? '');

      if (f.REWARD_PRODUCT_ID || f.REWARD_PRODUCT_NAME) {
        const rnameEl = el('selectedProductName_reward');
        const ridEl = el('selectedProductId_reward');
        if (rnameEl) { rnameEl.value = f.REWARD_PRODUCT_NAME ?? ''; rnameEl.removeAttribute('disabled'); rnameEl.setAttribute('required','required'); }
        if (ridEl) { ridEl.value = f.REWARD_PRODUCT_ID ?? ''; ridEl.removeAttribute('disabled'); ridEl.setAttribute('required','required'); }
        try { const wrapper = findNearestProductContainer(rnameEl); const btn = wrapper?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); } catch(e){}
      } else {
        if (el('selectedProductName_reward')) { el('selectedProductName_reward').value = ''; el('selectedProductName_reward').setAttribute('disabled','disabled'); el('selectedProductName_reward').removeAttribute('required'); }
        if (el('selectedProductId_reward')) { el('selectedProductId_reward').value = ''; el('selectedProductId_reward').setAttribute('disabled','disabled'); el('selectedProductId_reward').removeAttribute('required'); }
      }

      el('savedConditionId') && (el('savedConditionId').value = data.id ?? '');
    } catch(e){
      console.warn('populateFormForEdit legacy fallback failed', e);
    }

    try {
      const blockJson = ConditionBlockHelper.updateHiddenInput(conditionForm);
      if (blockJson && blockJson.fields) {
        blockJson.fields.PRODUCT_ID = blockJson.fields.PRODUCT_ID || (el('selectedProductId_condition')?.value ?? '');
        blockJson.fields.PRODUCT_NAME = blockJson.fields.PRODUCT_NAME || (el('selectedProductName_condition')?.value ?? '');
        blockJson.fields.REWARD_PRODUCT_ID = blockJson.fields.REWARD_PRODUCT_ID || (el('selectedProductId_reward')?.value ?? '');
        blockJson.fields.REWARD_PRODUCT_NAME = blockJson.fields.REWARD_PRODUCT_NAME || (el('selectedProductName_reward')?.value ?? '');
        el('conditionBlockJson') && (el('conditionBlockJson').value = JSON.stringify(blockJson));
      }
      refreshConditionTable({ fields: blockJson?.fields ?? f });
    } catch (e) {
      console.warn('populateFormForEdit update preview error', e);
    }
  }
}


/* ---------------------------
   Preview helper (table) - unchanged
   --------------------------- */
function refreshConditionTable(blockJson){
  const tbody = $('#conditionTable tbody');
  if(!tbody) return;
  tbody.innerHTML = `<tr>
    <td>${blockJson?.fields?.ACTION ?? '-'}</td>
    <td>${blockJson?.fields?.OBJECT ?? '-'}</td>
    <td>${blockJson?.fields?.PRODUCT_NAME ?? '-'}</td>
    <td>${blockJson?.fields?.COMPARATOR ?? '-'}</td>
    <td>${blockJson?.fields?.VALUE ?? '-'}</td>
    <td>${blockJson?.fields?.UNIT ?? '-'}</td>
    <td>${blockJson?.fields?.REWARD_ACTION ?? '-'} ${blockJson?.fields?.REWARD_VALUE ?? ''} ${blockJson?.fields?.REWARD_UNIT ?? ''}</td>
  </tr>`;
}

/* ---------------------------
   Mapping helpers (match block types to option IDs using getOptions)
   --------------------------- */
function findOptionId(optionsArr, matchers = []) {
  if(!Array.isArray(optionsArr) || !optionsArr.length) return '';
  const lowMatchers = matchers.map(m => String(m || '').toLowerCase());

  // helper to read an option's "id" in multiple shapes
  const getOptId = (o) => {
    if(o === null || o === undefined) return '';
    return String(o.id ?? o.value ?? o.key ?? o.keyName ?? '');
  };

  // 1) try exact id match (supporting id/value/key)
  for(const m of matchers){
    if(!m && m !== 0) continue;
    const ms = String(m);
    const byId = optionsArr.find(o => getOptId(o) === ms);
    if(byId) return getOptId(byId);
  }

  // 2) match by name / th_name / label fuzzy (case-insensitive)
  for(const opt of optionsArr){
    const labels = [
      String(opt.th_name ?? opt.name ?? opt.label ?? ''),
      String(opt.name ?? opt.th_name ?? opt.label ?? ''),
      String(opt.label ?? opt.name ?? opt.th_name ?? '')
    ].map(x => x.toLowerCase());
    for(const mk of lowMatchers){
      if(!mk) continue;
      if(labels.some(l => l && (l === mk || l.includes(mk) || mk.includes(l)))) return getOptId(opt);
    }
  }

  // 3) try partial contains (case-insensitive)
  for(const opt of optionsArr){
    const labels = [opt.name, opt.th_name, opt.label].filter(Boolean).map(x => String(x).toLowerCase());
    for(const lbl of labels){
      if(!lbl) continue;
      for(const mk of lowMatchers){
        if(!mk) continue;
        try {
          if(lbl.includes(mk)) return getOptId(opt);
        } catch(e){}
      }
    }
  }

  // fallback: return first option id (but ensure we return the correct key name)
  return getOptId(optionsArr[0]) || '';
}


function mapBlockToObjectId(blockType, options) {
  // prefer to match 'product' / 'customer' / 'promotion' / 'activity'
  if(!blockType) return findOptionId(options.conditionObject, ['product']);
  const t = String(blockType).toLowerCase();
  if(t.includes('product') || t.includes('get_product') || t.includes('getqty') || t.includes('getqty')) return findOptionId(options.conditionObject, ['product']);
  if(t.includes('customer') || t.includes('client')) return findOptionId(options.conditionObject, ['customer']);
  if(t.includes('promotion') || t.includes('order') || t.includes('total')) return findOptionId(options.conditionObject, ['promotion']);
  if(t.includes('activity') || t.includes('activity')) return findOptionId(options.conditionObject, ['activity']);
  return findOptionId(options.conditionObject, ['product']);
}

function mapBlockToActionId(conditionBlockType, options) {
  // heuristics:
  // if conditionBlockType contains promotion/total -> 'accumulate_points' maybe; but default map to 'buy'
  if(!options || !Array.isArray(options.conditionAction)) return '';
  if(!conditionBlockType) return findOptionId(options.conditionAction, ['buy']);
  const t = String(conditionBlockType).toLowerCase();
  if(t.includes('promotion') || t.includes('total') || t.includes('order')) {
    // try to map to accumulate_points first
    const tryAcc = findOptionId(options.conditionAction, ['accumulate_points','สะสม','points']);
    if(tryAcc) return tryAcc;
  }
  // default "buy"
  return findOptionId(options.conditionAction, ['buy','ซื้อ']);
}

function mapBlockToRewardActionId(rewardBlockType, options) {
  if(!options || !Array.isArray(options.conditionRewardAction)) return '';
  if(!rewardBlockType) return findOptionId(options.conditionRewardAction, ['discount']);
  const t = String(rewardBlockType).toLowerCase();
  if(t.includes('percentage') || t.includes('discount')) return findOptionId(options.conditionRewardAction, ['discount','ส่วนลด']);
  if(t.includes('free') || t.includes('give_free') || t.includes('give')) return findOptionId(options.conditionRewardAction, ['free_gift','ของแถม']);
  if(t.includes('point') || t.includes('points') || t.includes('score')) return findOptionId(options.conditionRewardAction, ['points','สะสม']);
  if(t.includes('cashback')) return findOptionId(options.conditionRewardAction, ['Cashback','cashback']);
  // fallback
  return findOptionId(options.conditionRewardAction, ['discount']);
}

function mapRewardObjectId(options) {
  // rewardObject options include PRODUCT, GOLD, CAR etc => default PRODUCT
  return findOptionId(options.conditionRewardObject, ['PRODUCT','สินค้า']);
}

/* ---------------------------
   Parse Blockly-like JSON -> dynamic items
   --------------------------- */

/**
 * Map Blockly OP to comparator symbols
 */
function mapOpToComparator(op){
  if(!op) return '';
  op = String(op).toUpperCase();
  switch(op){
    case 'EQ': return '=';
    case 'GT': return '>';
    case 'GTE':
    case 'GTEQ':
    case 'GREATER_THAN_OR_EQUAL': return '≥';
    case 'LT': return '<';
    case 'LTE':
    case 'LTEQ':
    case 'LESS_THAN_OR_EQUAL': return '≤';
    default:
      if(op.includes('=')) return '=';
      if(op.includes('>=')) return '≥';
      if(op.includes('<=')) return '≤';
      if(op.includes('>')) return '>';
      if(op.includes('<')) return '<';
      return op;
  }
}

/**
 * Given a reward block object, extract reward info
 */
function extractRewardFromBlock(rewBlock){
  if(!rewBlock || typeof rewBlock !== 'object') return null;
  const t = rewBlock.type ?? '';
  const f = rewBlock.fields ?? {};
  // normalize arrays
  const productIds = Array.isArray(f.PRODUCT_IDS) ? f.PRODUCT_IDS : (f.PRODUCT_ID ? (Array.isArray(f.PRODUCT_ID) ? f.PRODUCT_ID : [String(f.PRODUCT_ID)]) : []);
  if (f.PRODUCT_IDS && typeof f.PRODUCT_IDS === 'string') {
    try{ const tmp = JSON.parse(f.PRODUCT_IDS); if(Array.isArray(tmp)) productIds.splice(0,productIds.length, ...tmp); }catch(e){}
  }
  const out = {
    rewardType: t,
    rewardActionType: t,
    rewardProductIds: productIds.slice(),
    rewardProductName: '',
    rewardValue: f.PERCENT ?? f.AMOUNT ?? f.QUANTITY ?? f.NUM ?? f.NUMBER ?? '',
    rewardUnit: f.UNIT ?? f.TARGET ?? ''
  };
  return out;
}

/**
 * Walk a 'next' chain of blocks and collect reward blocks
 */
function collectRewardsChain(startBlock){
  const rewards = [];
  let cur = startBlock;
  while(cur){
    const r = extractRewardFromBlock(cur);
    if(r) rewards.push(r);
    if(cur.next && cur.next.block){
      cur = cur.next.block;
    } else {
      break;
    }
  }
  return rewards;
}

/**
 * Parse Blockly JSON structure into array of condition items:
 * Each condition item will be like:
 * { comparator, value, unit, productIds: [...], productNames: '...', rewards: [ {reward fields...}, ... ], conditionBlockType }
 */
function parseBlocklyJsonToConditionItems(blocklyJson){
  try{
    if(!blocklyJson) return [];
    // blocks array may live in blocklyJson.blocks.blocks or blocklyJson.blocks
    let blocksArr = [];
    if (Array.isArray(blocklyJson.blocks)) blocksArr = blocklyJson.blocks;
    else if (blocklyJson.blocks && Array.isArray(blocklyJson.blocks.blocks)) blocksArr = blocklyJson.blocks.blocks;
    else if (blocklyJson.blocks && Array.isArray(blocklyJson.blocks)) blocksArr = blocklyJson.blocks;

    const items = [];
    for(const b of blocksArr){
      if(!b || b.type !== 'controls_if') continue;
      const ifInputs = b.inputs || {};
      const if0 = ifInputs.IF0?.block || null;
      const do0 = ifInputs.DO0?.block || null;
      let comparator = '';
      let value = '';
      let unit = '';
      let productIds = [];
      let conditionBlockType = null;

      if(if0){
        conditionBlockType = if0.type || null;
        if(if0.type === 'logic_compare' || (if0.fields && if0.fields.OP)){
          comparator = mapOpToComparator(if0.fields?.OP);
          const Ablock = (if0.inputs && if0.inputs.A && if0.inputs.A.block) ? if0.inputs.A.block : null;
          const Bblock = (if0.inputs && if0.inputs.B && if0.inputs.B.block) ? if0.inputs.B.block : null;

          if(Ablock){
            const f = Ablock.fields || {};
            if(Array.isArray(f.PRODUCT_IDS) && f.PRODUCT_IDS.length){
              productIds = f.PRODUCT_IDS.map(String);
            } else if(f.PRODUCT_ID) {
              if(Array.isArray(f.PRODUCT_ID)) productIds = f.PRODUCT_ID.map(String);
              else productIds = [String(f.PRODUCT_ID)];
            }
            // if Ablock itself signals condition type
            conditionBlockType = conditionBlockType || Ablock.type || null;
          }

          if(Bblock){
            const bf = Bblock.fields || {};
            if(bf.NUM !== undefined) value = String(bf.NUM);
            if(bf.NUMBER !== undefined) value = String(bf.NUMBER);
          }
        } else {
          const f = if0.fields || {};
          if(f.OP) comparator = mapOpToComparator(f.OP);
        }
      }

      const rewards = do0 ? collectRewardsChain(do0) : [];

      items.push({
        comparator: comparator || '',
        value: value || '',
        unit: unit || 'baht',
        productIds: productIds.slice(),
        productNames: '',
        rewards,
        conditionBlockType
      });
    }

    return items;
  }catch(e){
    console.warn('parseBlocklyJsonToConditionItems error', e);
    return [];
  }
}

/**
 * Populate dynamic condition-items & rewards from Blockly JSON
 * - tries to get product names (API.getProducts)
 * - maps block types -> option ids using getOptions()
 */
async function populateFormFromBlockly(blocklyJson){
  if(!conditionsContainer || !conditionTemplate || !rewardTemplate) initTemplates();
  if(!conditionsContainer) return;

  // clear existing
  conditionsContainer.innerHTML = '';

  // attempt to lookup products for names
  let productMap = {};
  try {
    if (API && typeof API.getProducts === 'function') {
      const pResp = await API.getProducts();
      if (pResp && pResp.success && Array.isArray(pResp.data)) {
        pResp.data.forEach(pp => { productMap[String(pp.id)] = pp.name_th ?? pp.name ?? pp.title ?? pp.id; });
      } else if (pResp && pResp.Products && Array.isArray(pResp.Products)) {
        pResp.Products.forEach(pp => { productMap[String(pp.id)] = pp.name_th ?? pp.name ?? pp.title ?? pp.id; });
      }
    }
  } catch(e){
    console.warn('populateFormFromBlockly: getProducts failed', e);
  }

  // get options for mapping
  let options = {};
  try {
    options = await getOptions();
  } catch(e){
    console.warn('populateFormFromBlockly: getOptions failed', e);
    options = options || {};
  }

  const items = parseBlocklyJsonToConditionItems(blocklyJson);
  if(!items.length){
    // If no parseable items, keep one empty block for user
    addConditionItem();
    return;
  }

  for(const it of items){
    // map conditionBlockType -> actionId / objectId
    const condBlockType = it.conditionBlockType || '';
    const objectId = mapBlockToObjectId(condBlockType, options);
    const actionId = mapBlockToActionId(condBlockType, options);

    const defaultData = {
      action: actionId || '',
      object: objectId || '',
      productId: (it.productIds && it.productIds.length === 1) ? String(it.productIds[0]) : (it.productIds && it.productIds.length ? String(it.productIds.join(',')) : ''),
      productName: (it.productIds && it.productIds.length) ? it.productIds.map(id => productMap[String(id)] || String(id)).join(', ') : '',
      comparator: it.comparator || '',
      value: it.value || '',
      unit: it.unit || 'baht'
    };

    const wrapper = addConditionItem(defaultData);
    // find rewardsContainer in wrapper
    try{
      const rContainer = wrapper.querySelector('.rewardsContainer');
      if(Array.isArray(it.rewards) && it.rewards.length){
        for(const r of it.rewards){
          const rewardBlockType = r.rewardType || r.rewardActionType || '';
          const rewardActionId = mapBlockToRewardActionId(rewardBlockType, options);
          const rewardObjectId = mapRewardObjectId(options);

          const rDef = {
            rewardAction: rewardActionId || '',
            rewardObject: (r.rewardProductIds && r.rewardProductIds.length) ? String(rewardObjectId) : '',
            rewardProductId: (r.rewardProductIds && r.rewardProductIds.length === 1) ? String(r.rewardProductIds[0]) : (r.rewardProductIds && r.rewardProductIds.length ? String(r.rewardProductIds.join(',')) : ''),
            rewardProductName: (r.rewardProductIds && r.rewardProductIds.length) ? r.rewardProductIds.map(id => productMap[String(id)] || String(id)).join(', ') : '',
            rewardValue: r.rewardValue ?? '',
            rewardUnit: r.rewardUnit ?? ''
          };
          // add reward DOM
          const rEl = addRewardItem(rContainer, rDef);
          // set selects where possible
          try{
            if(rEl && rEl.querySelector('.condition-form-reward-action')) {
              rEl.querySelector('.condition-form-reward-action').value = rewardActionId || '';
            }
            if(rEl && rEl.querySelector('.condition-form-reward-object')) {
              rEl.querySelector('.condition-form-reward-object').value = (r.rewardProductIds && r.rewardProductIds.length) ? String(rewardObjectId) : '';
            }
          }catch(e){}
        }
      }
    }catch(e){}
  }
}

/* ---------------------------
   Form builders & validation (mostly unchanged)
   --------------------------- */
function buildConditionFieldsFromForm(formEl){
  // Try block helper first
  try {
    const blockJson = ConditionBlockHelper.updateHiddenInput(formEl);
    if(blockJson && blockJson.fields && Object.keys(blockJson.fields).length > 0){
      Object.keys(blockJson.fields).forEach(k => { blockJson.fields[k] = (blockJson.fields[k] === null || blockJson.fields[k] === undefined) ? '' : String(blockJson.fields[k]); });
      return blockJson.fields;
    }
  } catch(e){
    console.warn('ConditionBlockHelper.updateHiddenInput failed, fallback to DOM extraction', e);
  }

  // Find the best condition-item (most likely the one user filled)
  const condItems = Array.from(formEl.querySelectorAll('.condition-item'));
  let chosen = null;
  for(const ci of condItems){
    const actionVal = (ci.querySelector('.condition-form-action')?.value ?? '').toString().trim();
    const objectVal = (ci.querySelector('.condition-form-object')?.value ?? '').toString().trim();
    const comparatorVal = (ci.querySelector('.comparatorSelect')?.value ?? '').toString().trim();
    const valueVal = (ci.querySelector('.valueInput')?.value ?? '').toString().trim();
    const pidVal = (ci.querySelector('.selectedProductId_condition')?.value ?? '').toString().trim();
    // pick the first block that has any meaningful value
    if(actionVal || objectVal || comparatorVal || valueVal || pidVal){
      chosen = ci;
      break;
    }
  }
  // fallback to first block if none had values
  if(!chosen && condItems.length) chosen = condItems[0];

  if(chosen){
    const action = (chosen.querySelector('.condition-form-action')?.value ?? '').toString();
    const object = (chosen.querySelector('.condition-form-object')?.value ?? '').toString();
    const productId = (chosen.querySelector('.selectedProductId_condition')?.value ?? '').toString();
    const productName = (chosen.querySelector('.selectedProductName_condition')?.value ?? '').toString();
    const comparator = (chosen.querySelector('.comparatorSelect')?.value ?? '').toString();
    const value = (chosen.querySelector('.valueInput')?.value ?? '').toString();
    const unit = (chosen.querySelector('.unitSelect')?.value ?? '').toString();

    // reward: pick first reward in this block that has something, otherwise fallback to top-level reward
    let rewardAction = '', rewardObject = '', rewardProductId = '', rewardProductName = '', rewardValue = '', rewardUnit = '';
    const rewards = Array.from(chosen.querySelectorAll('.reward-item'));
    let chosenReward = null;
    for(const r of rewards){
      const rAct = (r.querySelector('.condition-form-reward-action')?.value ?? '').toString().trim();
      const rObj = (r.querySelector('.condition-form-reward-object')?.value ?? '').toString().trim();
      const rVal = (r.querySelector('.rewardValueInput')?.value ?? '').toString().trim();
      const rPid = (r.querySelector('.selectedProductId_reward')?.value ?? '').toString().trim();
      if(rAct || rObj || rVal || rPid){
        chosenReward = r;
        break;
      }
    }
    if(!chosenReward && rewards.length) chosenReward = rewards[0];

    if(chosenReward){
      rewardAction = (chosenReward.querySelector('.condition-form-reward-action')?.value ?? '').toString();
      rewardObject = (chosenReward.querySelector('.condition-form-reward-object')?.value ?? '').toString();
      rewardProductId = (chosenReward.querySelector('.selectedProductId_reward')?.value ?? '').toString();
      rewardProductName = (chosenReward.querySelector('.selectedProductName_reward')?.value ?? '').toString();
      rewardValue = (chosenReward.querySelector('.rewardValueInput')?.value ?? '').toString();
      rewardUnit = (chosenReward.querySelector('.rewardUnitSelect')?.value ?? '').toString();
    } else {
      // fallback to top-level reward controls if exist
      rewardAction = (formEl.querySelector('.condition-form-reward-action')?.value ?? '').toString();
      rewardObject = (formEl.querySelector('.condition-form-reward-object')?.value ?? '').toString();
      rewardProductId = (el('selectedProductId_reward')?.value ?? '').toString();
      rewardProductName = (el('selectedProductName_reward')?.value ?? '').toString();
      rewardValue = (el('rewardValueInput')?.value ?? '').toString();
      rewardUnit = (el('rewardUnitSelect')?.value ?? '').toString();
    }

    return {
      ACTION: action,
      OBJECT: object,
      PRODUCT_ID: productId,
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

  // Final fallback: top-level single-form elements
  const condProdId = (el('selectedProductId_condition')?.value ?? '').toString();
  const condProdName = (el('selectedProductName_condition')?.value ?? '').toString();
  const rewardProdId = (el('selectedProductId_reward')?.value ?? '').toString();
  const rewardProdName = (el('selectedProductName_reward')?.value ?? '').toString();

  const fields = {
    ACTION: (document.querySelector('.condition-form-action')?.value ?? '').toString(),
    OBJECT: (document.querySelector('.condition-form-object')?.value ?? '').toString(),
    PRODUCT_ID: condProdId,
    PRODUCT_NAME: condProdName,
    COMPARATOR: (el('comparatorSelect')?.value ?? '').toString(),
    VALUE: (el('valueInput')?.value ?? '').toString(),
    UNIT: (el('unitSelect')?.value ?? '').toString(),
    REWARD_ACTION: (document.querySelector('.condition-form-reward-action')?.value ?? '').toString(),
    REWARD_OBJECT: (document.querySelector('.condition-form-reward-object')?.value ?? '').toString(),
    REWARD_PRODUCT_ID: rewardProdId,
    REWARD_PRODUCT_NAME: rewardProdName,
    REWARD_VALUE: (el('rewardValueInput')?.value ?? '').toString(),
    REWARD_UNIT: (el('rewardUnitSelect')?.value ?? '').toString()
  };
  return fields;
}

/* ---------------------------
   validation (skip disabled elements)
   --------------------------- */
function validateConditionForm(){
  conditionForm = conditionForm || $('#condition-form');
  const missing = [];
  const nameEl = el('condition-form-name');

  // clear previous invalid markers
  conditionForm && conditionForm.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));

  // basic top-level name check
  if(!nameEl || !nameEl.value.trim()){
    missing.push('ชื่อเงื่อนไข');
    nameEl && nameEl.classList.add('is-invalid');
  }

  // If there are dynamic condition items, validate per-item
  const condItems = Array.from(conditionForm.querySelectorAll('.condition-item'));
  if(condItems.length){
    condItems.forEach((ci, idx) => {
      try{
        const actionEl = ci.querySelector('.condition-form-action');
        const objectEl = ci.querySelector('.condition-form-object');

        // Action/Object required per block (skip if control disabled)
        if(actionEl && !actionEl.disabled && !String(actionEl.value).trim()){
          missing.push(`เงื่อนไข ${idx+1}: Action`);
          actionEl.classList.add('is-invalid');
        }
        if(objectEl && !objectEl.disabled && !String(objectEl.value).trim()){
          missing.push(`เงื่อนไข ${idx+1}: Object`);
          objectEl.classList.add('is-invalid');
        }

        // If object requires product (value === '1'), ensure this block has selected product id
        if(objectEl && !objectEl.disabled && String(objectEl.value) === '1'){
          const pid = ci.querySelector('.selectedProductId_condition');
          const pname = ci.querySelector('.selectedProductName_condition');
          if(!pid || !(String(pid.value).trim())){
            missing.push(`สินค้า (เลือกสินค้า) ในเงื่อนไข ${idx+1}`);
            if(pname) pname.classList.add('is-invalid');
            if(pid) pid.classList.add('is-invalid');
          }
        }

        // validate rewards in this block
        const rewards = Array.from(ci.querySelectorAll('.reward-item'));
        rewards.forEach((ri, ridx) => {
          const rAction = ri.querySelector('.condition-form-reward-action');
          const rObject = ri.querySelector('.condition-form-reward-object');

          // check reward action (skip if disabled)
          if(rAction && !rAction.disabled && !String(rAction.value).trim()){
            missing.push(`เงื่อนไข ${idx+1} ผลตอบแทน ${ridx+1}: ประเภทผลตอบแทน`);
            rAction.classList.add('is-invalid');
          }

          // check reward object only if it's not disabled
          if(rObject && !rObject.disabled && !String(rObject.value).trim()){
            missing.push(`เงื่อนไข ${idx+1} ผลตอบแทน ${ridx+1}: รายการผลตอบแทน`);
            rObject.classList.add('is-invalid');
          }

          // If rewardAction === '2' (ของแถม) AND rewardObject === '1' (สินค้า) => require reward product
          // but only enforce when the relevant controls are enabled
          const rActionVal = (rAction && !rAction.disabled) ? String(rAction.value) : '';
          const rObjectVal = (rObject && !rObject.disabled) ? String(rObject.value) : '';
          if(rActionVal === '2' && rObjectVal === '1'){
            const rpid = ri.querySelector('.selectedProductId_reward');
            const rpname = ri.querySelector('.selectedProductName_reward');
            if(!rpid || !(String(rpid.value).trim())){
              missing.push(`สินค้า (ผลตอบแทน) ในเงื่อนไข ${idx+1} ผลตอบแทน ${ridx+1}`);
              if(rpname) rpname.classList.add('is-invalid');
              if(rpid) rpid.classList.add('is-invalid');
            }
          }
        });

      }catch(e){
        console.warn('validateConditionForm item check failed', e);
      }
    });
  } else {
    // Fallback: single-form controls (top-level selects/inputs)
    const actionEl = document.querySelector('.condition-form-action');
    const objectEl = document.querySelector('.condition-form-object');

    if(actionEl && !actionEl.disabled && !actionEl.value){ missing.push('Action'); actionEl.classList.add('is-invalid'); }
    if(objectEl && !objectEl.disabled && !objectEl.value){ missing.push('Object'); objectEl.classList.add('is-invalid'); }

    if(objectEl && !objectEl.disabled && String(objectEl.value) === '1'){
      const pid = el('selectedProductId_condition');
      const pname = el('selectedProductName_condition');
      if(!pid || !(String(pid.value).trim())){
        missing.push('สินค้า (เลือกสินค้า)');
        if(pname) pname.classList.add('is-invalid');
        if(pid) pid.classList.add('is-invalid');
      }
    }

    // top-level reward case
    const rAction = document.querySelector('.condition-form-reward-action');
    const rObject = document.querySelector('.condition-form-reward-object');
    if(rAction && !rAction.disabled && rObject && !rObject.disabled){
      if(!rAction.value){ missing.push('ผลตอบแทน: ประเภท'); rAction.classList.add('is-invalid'); }
      if(!rObject.value){ missing.push('ผลตอบแทน: รายการ'); rObject.classList.add('is-invalid'); }
      if(String(rAction.value) === '2' && String(rObject.value) === '1'){
        const rpid = el('selectedProductId_reward');
        const rpname = el('selectedProductName_reward');
        if(!rpid || !(String(rpid.value).trim())){
          missing.push('สินค้า (ผลตอบแทน)');
          if(rpname) rpname.classList.add('is-invalid');
          if(rpid) rpid.classList.add('is-invalid');
        }
      }
    }
  }

  // Generic required-fields validator (keeps original behavior but skip disabled elements)
  if(conditionForm){
    const reqEls = Array.from(conditionForm.querySelectorAll('[required]'));
    const seen = new Set();
    reqEls.forEach(elm => {
      try{
        if(elm.disabled) return; // skip disabled required controls
        if(elm.type === 'radio'){
          const name = elm.name;
          if(seen.has('radio:' + name)) return;
          seen.add('radio:' + name);
          const checked = conditionForm.querySelectorAll(`input[name="${name}"]:checked`).length;
          if(!checked){
            const lbl = document.querySelector(`label[for="${name}"]`)?.textContent?.trim() || (elm.getAttribute('aria-label') || name);
            missing.push(lbl || 'จำเป็นต้องระบุ');
            conditionForm.querySelectorAll(`input[name="${name}"]`).forEach(r => r.classList.add('is-invalid'));
          }
          return;
        }

        const val = (elm.value ?? '').toString().trim();
        if(val === ''){
          const friendly = (document.querySelector(`label[for="${elm.id}"]`)?.textContent?.trim()) || elm.getAttribute('aria-label') || elm.placeholder || elm.id || 'จำเป็นต้องระบุ';
          if(!seen.has(friendly)){
            seen.add(friendly);
            missing.push(friendly);
          }
          elm.classList.add('is-invalid');
        }
      }catch(e){ /* ignore individual element errors */ }
    });
  }

  // dedupe messages
  const finalMissing = Array.from(new Set(missing));
  return { ok: finalMissing.length === 0, missing: finalMissing };
}

/* ---------------------------
   Populate selects & bind simple events
   --------------------------- */
async function populateConditionForm(){
  try{
    const options = await getOptions();
    // Helper to build options from array returned by getOptions
    const arrayToHtml = (arr, includeDefault=true) => {
      if(!Array.isArray(arr)) return includeDefault ? '<option value="" selected disabled>-- กรุณาเลือก --</option>' : '';
      let out = includeDefault ? '<option value="" selected disabled>-- กรุณาเลือก --</option>' : '';
      arr.forEach(i => {
        const v = i.id ?? i.value ?? i.key ?? '';
        const label = i.th_name ?? i.name ?? i.label ?? v;
        out += `<option value="${eHtml(String(v))}">${eHtml(label)}</option>`;
      });
      return out;
    };

    // build option HTMLs and apply to any existing selects in DOM
    actionOptionsHTML = arrayToHtml(options.conditionAction);
    objectOptionsHTML = arrayToHtml(options.conditionObject);
    rewardActionOptionsHTML = arrayToHtml(options.conditionRewardAction);
    rewardObjectOptionsHTML = arrayToHtml(options.conditionRewardObject ?? []);
    rewardUnitOptionsHTML = unitOptionsHTML;

    // set any existing select elements in DOM now
    document.querySelectorAll('.condition-form-action').forEach(sel => {
      try { sel.innerHTML = `<option value="" selected disabled>-- กรุณาเลือก --</option>` + FormHelper.generateOptions((options.conditionAction||[]).reduce((o,i)=>{o[i.id]=i.th_name??i.name;return o;},{}), sel.value); }catch(e){}
    });
    document.querySelectorAll('.condition-form-object').forEach(sel => {
      try { sel.innerHTML = `<option value="" selected disabled>-- กรุณาเลือก --</option>` + FormHelper.generateOptions((options.conditionObject||[]).reduce((o,i)=>{o[i.id]=i.th_name??i.name;return o;},{}), sel.value); }catch(e){}
    });
    // reward selects (single-form)
    document.querySelectorAll('.condition-form-reward-action').forEach(sel => {
      try { sel.innerHTML = rewardActionOptionsHTML; }catch(e){}
    });
    document.querySelectorAll('.condition-form-reward-object').forEach(sel => {
      try { sel.innerHTML = rewardObjectOptionsHTML; }catch(e){}
    });

    // elements for single-form behavior (if you also use single-form fields)
    const objectSelect = el('objectSelect');
    const rewardActionEl = el('rewardActionSelect');
    const rewardObjectEl = el('rewardObjectSelect');
    const rewardProductWrapper = el('productSelectionWrapper-reward');
    const conditionProductWrapper = el('productSelectionWrapper');

    function updateRewardObjectState(){
      const enabled = rewardActionEl && String(rewardActionEl.value) === '2';
      if (rewardObjectEl) {
        rewardObjectEl.disabled = !enabled;
        if (!enabled) {
          rewardObjectEl.removeAttribute('required');
          try { rewardObjectEl.value = ''; } catch(e){}
        } else {
          rewardObjectEl.setAttribute('required','required');
        }
      }
      if (rewardProductWrapper) {
        const shouldShowProduct = enabled && (rewardObjectEl && String(rewardObjectEl.value) === '1');
        rewardProductWrapper.classList.toggle('d-none', !shouldShowProduct);
        // set state of inputs inside wrapper
        const rname = el('selectedProductName_reward');
        const rid = el('selectedProductId_reward');
        setProductInputsState(rname, rid, shouldShowProduct);
      }
    }

    rewardActionEl && rewardActionEl.addEventListener('change', () => {
      updateRewardObjectState();
      try { const blockJson = ConditionBlockHelper.updateHiddenInput(conditionForm); refreshConditionTable(blockJson); } catch(e){}
    });

    rewardObjectEl && rewardObjectEl.addEventListener('change', () => {
      if (rewardProductWrapper && rewardActionEl) {
        const show = String(rewardActionEl.value) === '2' && String(rewardObjectEl.value) === '1';
        rewardProductWrapper.classList.toggle('d-none', !show);
        // update state on inner inputs
        const rname = el('selectedProductName_reward');
        const rid = el('selectedProductId_reward');
        setProductInputsState(rname, rid, show);
      }
      try { const blockJson = ConditionBlockHelper.updateHiddenInput(conditionForm); refreshConditionTable(blockJson); } catch(e){}
    });

    objectSelect && objectSelect.addEventListener('change', e => {
      const wrapper = conditionProductWrapper;
      const show = e.target.value === "1";
      wrapper && wrapper.classList.toggle('d-none', !show);
      const n = el('selectedProductName_condition');
      const i = el('selectedProductId_condition');
      setProductInputsState(n, i, show);
    });

    updateRewardObjectState();

    // bind product-open buttons (generic) - idempotent
    document.querySelectorAll('.btn-open-product-modal').forEach(btn => {
      if (btn._productPickerBound) return;
      btn._productPickerBound = true;
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        const rawName = btn.dataset?.targetName ?? btn.getAttribute('data-target-name') ?? null;
        const rawId = btn.dataset?.targetId ?? btn.getAttribute('data-target-id') ?? null;
        const normalize = v => {
          if (!v) return null;
          v = v.trim();
          if (v.startsWith('#') || v.startsWith('.')) return v;
          return `#${v}`;
        };
        const nameSel = normalize(rawName);
        const idSel = normalize(rawId);

        if (typeof window.openProductPicker === 'function') {
          try {
            window.openProductPicker({
              targetsName: nameSel ? [nameSel] : [],
              targetsId: idSel ? [idSel] : [],
              multi: btn.dataset?.multi === 'true'
            }).catch(()=>{});
            return;
          } catch(e){
            console.warn('openProductPicker call failed, fallback to bootstrap modal', e);
          }
        }

        const modal = el('modalProductList') || el('productModal') || el('modalProduct');
        if (modal) {
          window.__productPickerActiveTarget = { nameSelector: nameSel, idSelector: idSel };
          if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const inst = bootstrap.Modal.getOrCreateInstance(modal);
            modal.addEventListener('hidden.bs.modal', () => setTimeout(cleanBootstrapBackdrops, 40), { once: true });
            inst.show();
          } else {
            document.dispatchEvent(new CustomEvent('productPicker:open', { detail: { targetsName: [nameSel], targetsId: [idSel] } }));
          }
        } else {
          showAlert('ไม่พบ modal สินค้า (modalProductList หรือ productModal)');
        }
      });
    });

  }catch(err){
    console.warn('populateConditionForm error', err);
  }
}

/* ---------------------------
   bind condition events (preview + product events)
   --------------------------- */
function bindConditionEvents(){
  conditionForm = conditionForm || $('#condition-form');
  if(!conditionForm) return;

  if (!conditionForm._boundPreview) {
    ['input','change'].forEach(evt => conditionForm.addEventListener(evt, () => {
      try{
        const blockJson = ConditionBlockHelper.updateHiddenInput(conditionForm);
        refreshConditionTable(blockJson);
      }catch(e){ /*ignore*/ }
    }));
    conditionForm._boundPreview = true;
  }

  if (!document._productSelectedBound) {
    document._productSelectedBound = true;
    // handle productSelected custom event (if product picker dispatches)
    document.addEventListener('productSelected', (ev) => {
      try {
        const p = ev.detail;
        if (!p) return;

        const nameSel = p.targetNameSelector || p.targetName || null;
        const idSel = p.targetIdSelector || p.targetId || null;

        const norm = s => {
          if (!s) return null;
          if (s.startsWith('#') || s.startsWith('.')) return s;
          return `#${s}`;
        };
        const nameSelector = norm(nameSel);
        const idSelector = norm(idSel);

        if (nameSelector || idSelector) {
          if (nameSelector) {
            const elName = document.querySelector(nameSelector);
            if (elName) { elName.value = p.name_th ?? p.name_en ?? p.name ?? ''; elName.removeAttribute('disabled'); elName.setAttribute('required','required'); }
          }
          if (idSelector) {
            const elId = document.querySelector(idSelector);
            if (elId) { elId.value = p.id ?? ''; elId.removeAttribute('disabled'); elId.setAttribute('required','required'); }
          }
        } else {
          const rewardWrapper = el('productSelectionWrapper-reward');
          const condWrapper = el('productSelectionWrapper');

          if (rewardWrapper && !rewardWrapper.classList.contains('d-none')) {
            const n = el('selectedProductName_reward'); const i = el('selectedProductId_reward');
            if(n){ n.value = p.name_th ?? p.name_en ?? p.name ?? ''; n.removeAttribute('disabled'); n.setAttribute('required','required'); }
            if(i){ i.value = p.id ?? ''; i.removeAttribute('disabled'); i.setAttribute('required','required'); }
            // ensure button visible
            try { const btn = findNearestProductContainer(n)?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); }catch(e){}
          } else if (condWrapper && !condWrapper.classList.contains('d-none')) {
            const n = el('selectedProductName_condition'); const i = el('selectedProductId_condition');
            if(n){ n.value = p.name_th ?? p.name_en ?? p.name ?? ''; n.removeAttribute('disabled'); n.setAttribute('required','required'); }
            if(i){ i.value = p.id ?? ''; i.removeAttribute('disabled'); i.setAttribute('required','required'); }
            try { const btn = findNearestProductContainer(n)?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); }catch(e){}
          } else {
            const n = el('selectedProductName_condition'); const i = el('selectedProductId_condition');
            if(n){ n.value = p.name_th ?? p.name_en ?? p.name ?? ''; n.removeAttribute('disabled'); n.setAttribute('required','required'); }
            if(i){ i.value = p.id ?? ''; i.removeAttribute('disabled'); i.setAttribute('required','required'); }
            try { const btn = findNearestProductContainer(n)?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); }catch(e){}
          }
        }

        try {
          const blockJson = ConditionBlockHelper.updateHiddenInput(conditionForm);
          if (blockJson && blockJson.fields) {
            blockJson.fields.PRODUCT_ID = blockJson.fields.PRODUCT_ID || String(el('selectedProductId_condition')?.value ?? '');
            blockJson.fields.PRODUCT_NAME = blockJson.fields.PRODUCT_NAME || (el('selectedProductName_condition')?.value ?? '');
            if (el('selectedProductId_reward')) {
              blockJson.fields.REWARD_PRODUCT_ID = blockJson.fields.REWARD_PRODUCT_ID || String(el('selectedProductId_reward')?.value ?? '');
              blockJson.fields.REWARD_PRODUCT_NAME = blockJson.fields.REWARD_PRODUCT_NAME || (el('selectedProductName_reward')?.value ?? '');
            }
            el('conditionBlockJson') && (el('conditionBlockJson').value = JSON.stringify(blockJson));
          }
          refreshConditionTable(blockJson);
        } catch (err) { /* ignore */ }

      } catch (err) {
        console.warn('productSelected handler', err);
      }
    });

    // backwards-compatible callback
    window.onProductPicked = function(productId, productName){
      try{
        if (window._productTargetId && window._productTargetName) {
          const inputIdEl = document.getElementById(window._productTargetId);
          const inputNameEl = document.getElementById(window._productTargetName);
          if (inputIdEl) { inputIdEl.value = productId; inputIdEl.removeAttribute('disabled'); inputIdEl.setAttribute('required','required'); }
          if (inputNameEl) { inputNameEl.value = productName; inputNameEl.removeAttribute('disabled'); inputNameEl.setAttribute('required','required'); }
          // show button if present
          try { const btn = findNearestProductContainer(inputNameEl)?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); }catch(e){}
          window._productTargetId = null;
          window._productTargetName = null;
        } else if (window.__productPickerActiveTarget) {
          const t = window.__productPickerActiveTarget;
          const nameSel = t.nameSelector;
          const idSel = t.idSelector;
          if (nameSel) {
            const elName = document.querySelector(nameSel);
            if (elName) { elName.value = productName; elName.removeAttribute('disabled'); elName.setAttribute('required','required'); }
          }
          if (idSel) {
            const elId = document.querySelector(idSel);
            if (elId) { elId.value = productId; elId.removeAttribute('disabled'); elId.setAttribute('required','required'); }
          }
          // show button if present
          try { const elName = document.querySelector(nameSel); const btn = findNearestProductContainer(elName)?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); }catch(e){}
          window.__productPickerActiveTarget = null;
        } else {
          const rewardWrapper = el('productSelectionWrapper-reward');
          const condWrapper = el('productSelectionWrapper');
          if (rewardWrapper && !rewardWrapper.classList.contains('d-none')) {
            const n = el('selectedProductName_reward'); const i = el('selectedProductId_reward');
            if(n){ n.value = productName; n.removeAttribute('disabled'); n.setAttribute('required','required'); }
            if(i){ i.value = productId; i.removeAttribute('disabled'); i.setAttribute('required','required'); }
            try { const btn = findNearestProductContainer(n)?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); }catch(e){}
          } else if (condWrapper && !condWrapper.classList.contains('d-none')) {
            const n = el('selectedProductName_condition'); const i = el('selectedProductId_condition');
            if(n){ n.value = productName; n.removeAttribute('disabled'); n.setAttribute('required','required'); }
            if(i){ i.value = productId; i.removeAttribute('disabled'); i.setAttribute('required','required'); }
            try { const btn = findNearestProductContainer(n)?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); }catch(e){}
          } else {
            const n = el('selectedProductName_condition'); const i = el('selectedProductId_condition');
            if(n){ n.value = productName; n.removeAttribute('disabled'); n.setAttribute('required','required'); }
            if(i){ i.value = productId; i.removeAttribute('disabled'); i.setAttribute('required','required'); }
            try { const btn = findNearestProductContainer(n)?.querySelector('.btn-open-product-modal'); if(btn) btn.classList.remove('d-none'); }catch(e){}
          }
        }

        try {
          const blockJson = ConditionBlockHelper.updateHiddenInput(conditionForm);
          el('conditionBlockJson') && (el('conditionBlockJson').value = JSON.stringify(blockJson));
          refreshConditionTable(blockJson);
        } catch(e){}
      }catch(e){ console.warn('onProductPicked error', e); }
    };
  }
}

/* ---------------------------
   form submit
   --------------------------- */
function initFormSubmit(){
  conditionForm = conditionForm || $('#condition-form');
  if(!conditionForm) return;
  if (conditionForm._submitBound) return;
  conditionForm._submitBound = true;

  conditionForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const v = validateConditionForm();
    if(!v.ok){
      showAlert('กรุณากรอกข้อมูลที่จำเป็น:\n- ' + v.missing.join('\n- '));
      return;
    }

    // prefer the hidden JSON (Blockly or helper) if present
    let conditionPayloadObj = null;
    try {
      const hiddenVal = el('conditionBlockJson')?.value;
      if (hiddenVal) {
        try {
          const parsed = JSON.parse(hiddenVal);
          conditionPayloadObj = parsed;
        } catch(e) {
          // not JSON (string), ignore
        }
      }
    } catch(e){}

    // If not a Blockly-style object, try ConditionBlockHelper/updateHiddenInput or buildConditionFieldsFromForm
    try {
      if(!conditionPayloadObj || !conditionPayloadObj.blocks){
        // Try block helper first
        const updated = ConditionBlockHelper.updateHiddenInput(conditionForm);
        if(updated && updated.fields && Object.keys(updated.fields).length > 0){
          // wrap into legacy structure
          conditionPayloadObj = updated;
        } else {
          // fallback to simple fields object
          const fields = buildConditionFieldsFromForm(conditionForm);
          conditionPayloadObj = { type: 'promotion_condition', fields: fields };
        }
      }
    } catch(e){
      console.warn('submit: fallback building fields failed', e);
      const fields = buildConditionFieldsFromForm(conditionForm);
      conditionPayloadObj = { type: 'promotion_condition', fields: fields };
    }

    // At this point conditionPayloadObj may be:
    // - Blockly JSON (has .blocks)
    // - legacy { type: 'promotion_condition', fields: {...} }
    const saveBtn = el('btn-save-condition');
    const nameInput = el('condition-form-name');
    const conditionName = nameInput?.value?.trim?.();

    const payload = {
      id: el('savedConditionId')?.value || undefined,
      promotion_id: Number(promoId),
      campaign_id: null,
      condition_name: conditionName,
      // store as JSON string
      condition_xml: (typeof conditionPayloadObj === 'string') ? conditionPayloadObj : JSON.stringify(conditionPayloadObj),
      created_by: 'admin'
    };

    try{
      saveBtn && (saveBtn.disabled = true, saveBtn.textContent = 'กำลังบันทึก...');
      // call API.insertCondition robustly (static preferred)
      let res;
      try {
        if (API && typeof API.insertCondition === 'function') {
          res = await API.insertCondition(payload);
        } else if (API && API.default && typeof API.default.insertCondition === 'function') {
          res = await API.default.insertCondition(payload);
        } else {
          // fallback using fetch
          const r = await fetch('/myPromotion/src/connection/condition/insertCondition.php', {
            method: 'POST',
            headers: {'Content-Type':'application/json; charset=utf-8'},
            body: JSON.stringify(payload),
            credentials: 'same-origin'
          });
          res = r.ok ? await r.json() : { success:false, error:'http ' + r.status };
        }
      } catch(apiErr){
        throw apiErr;
      }

      if(res && res.success){
        badge && (badge.textContent = String(res.total ?? badge.textContent));
        window.dispatchEvent(new CustomEvent('condition:changed', { detail: { promotion_id: promoId, total: res.total ?? null } }));
        pageState.page = 1;
        await loadConditions({ page: 1 });
        showListView();
        swalToast({ icon: 'success', title: 'บันทึกสำเร็จ' });
      } else throw new Error(res?.error || 'save failed');
    }catch(err){
      console.error('saveCondition error', err);
      showAlert('บันทึกล้มเหลว: ' + (err.message || err));
    } finally{
      saveBtn && (saveBtn.disabled = false, saveBtn.textContent = 'บันทึก');
    }
  });
}

/* ---------------------------
   Templates & dynamic blocks
   --------------------------- */
function initTemplates(){
  conditionsContainer = document.getElementById('conditionsContainer');
  conditionTemplate = document.getElementById('condition-template');
  rewardTemplate = document.getElementById('reward-template');

  if(!conditionsContainer || !conditionTemplate || !rewardTemplate) return;

  const comparatorEl = el('comparatorSelect');
  const unitEl = el('unitSelect');
  comparatorOptionsHTML = comparatorEl ? comparatorEl.innerHTML : comparatorOptionsHTML;
  unitOptionsHTML = unitEl ? unitEl.innerHTML : unitOptionsHTML;

  const addCondBtn = el('btn-add-condition');
  if(addCondBtn && !addCondBtn._boundAdd){
    addCondBtn._boundAdd = true;
    addCondBtn.addEventListener('click', () => addConditionItem());
  }

  if (conditionsContainer.children.length === 0) addConditionItem();
}

function addConditionItem(defaultData = null) {
  if(!conditionTemplate || !conditionsContainer) return null;
  const tpl = conditionTemplate.content.cloneNode(true);
  const wrapper = tpl.querySelector('.condition-item');
  if(!wrapper) return null;

  const actionSel = wrapper.querySelector('.condition-form-action');
  const objectSel = wrapper.querySelector('.condition-form-object');
  const comparatorSel = wrapper.querySelector('.comparatorSelect');
  const unitSel = wrapper.querySelector('.unitSelect');

  if(actionSel) actionSel.innerHTML = actionOptionsHTML;
  if(objectSel) objectSel.innerHTML = objectOptionsHTML;
  if(comparatorSel) comparatorSel.innerHTML = comparatorOptionsHTML;
  if(unitSel) unitSel.innerHTML = unitOptionsHTML;

  // product inputs unique ids
  const pidName = genId('productName_cond');
  const pidId = genId('productId_cond');
  const btnOpen = wrapper.querySelector('.btn-open-product-modal');
  const nameInput = wrapper.querySelector('.selectedProductName_condition');
  const idInput = wrapper.querySelector('.selectedProductId_condition');
  if(nameInput) nameInput.id = pidName;
  if(idInput) idInput.id = pidId;
  if(btnOpen){
    btnOpen.setAttribute('data-target-name', pidName);
    btnOpen.setAttribute('data-target-id', pidId);
  }

  // per-block product toggle + required/disabled handling
  if(nameInput && idInput && objectSel){
    const updateCondProduct = (val) => {
      const show = String(val) === '1';
      setProductInputsState(nameInput, idInput, show);
    };
    updateCondProduct(objectSel.value);
    objectSel.addEventListener('change', e => updateCondProduct(e.target.value));
  }

  // add reward button for this block
  const addRewardBtn = wrapper.querySelector('.btn-add-reward');
  const rewardsContainer = wrapper.querySelector('.rewardsContainer');
  if(addRewardBtn && rewardsContainer){
    addRewardBtn.addEventListener('click', () => addRewardItem(rewardsContainer));
  }

  // remove condition
  const removeBtn = wrapper.querySelector('.btn-remove-condition');
  if(removeBtn){
    removeBtn.addEventListener('click', () => wrapper.remove());
  }

  // fill defaults if provided
  if(defaultData){
    try{
      if(defaultData.action) actionSel && (actionSel.value = defaultData.action);
      if(defaultData.object) objectSel && (objectSel.value = defaultData.object);
      if(defaultData.productId) idInput && (idInput.value = defaultData.productId);
      if(defaultData.productName) nameInput && (nameInput.value = defaultData.productName);
      if(defaultData.comparator) comparatorSel && (comparatorSel.value = defaultData.comparator);
      if(defaultData.value) wrapper.querySelector('.valueInput') && (wrapper.querySelector('.valueInput').value = defaultData.value);
      if(defaultData.unit) unitSel && (unitSel.value = defaultData.unit);
      if(Array.isArray(defaultData.rewards) && defaultData.rewards.length){
        defaultData.rewards.forEach(r => {
          const rEl = addRewardItem(rewardsContainer, r);
          try{
            rEl.querySelector('.condition-form-reward-action') && (rEl.querySelector('.condition-form-reward-action').value = r.rewardAction ?? '');
            rEl.querySelector('.condition-form-reward-object') && (rEl.querySelector('.condition-form-reward-object').value = r.rewardObject ?? '');
            rEl.querySelector('.selectedProductId_reward') && (rEl.querySelector('.selectedProductId_reward').value = r.rewardProductId ?? '');
            rEl.querySelector('.selectedProductName_reward') && (rEl.querySelector('.selectedProductName_reward').value = r.rewardProductName ?? '');
            rEl.querySelector('.rewardValueInput') && (rEl.querySelector('.rewardValueInput').value = r.rewardValue ?? '');
            rEl.querySelector('.rewardUnitSelect') && (rEl.querySelector('.rewardUnitSelect').value = r.rewardUnit ?? '');
          }catch(e){}
        });
      }
    }catch(e){}
    try{
      if(objectSel && nameInput && idInput){
        const show = String(objectSel.value) === '1';
        setProductInputsState(nameInput, idInput, show);
      }
    }catch(e){}
  }

  conditionsContainer.appendChild(wrapper);
  try { wrapper.querySelector('.condition-form-action')?.focus(); } catch(e){}
  return wrapper;


  try{
    if(objectSel && nameInput && idInput){
      const show = String(objectSel.value) === '1';
      setProductInputsState(nameInput, idInput, show);
    }
  }catch(e){}

  return wrapper;
}

function addRewardItem(rewardsContainer, defaultData=null) {
  if(!rewardTemplate || !rewardsContainer) return null;
  const tpl = rewardTemplate.content.cloneNode(true);
  const wrapper = tpl.querySelector('.reward-item');
  if(!wrapper) return null;

  const rewAction = wrapper.querySelector('.condition-form-reward-action');
  const rewObject = wrapper.querySelector('.condition-form-reward-object');
  const rewUnit = wrapper.querySelector('.rewardUnitSelect');
  if(rewAction) rewAction.innerHTML = rewardActionOptionsHTML;
  if(rewObject) rewObject.innerHTML = rewardObjectOptionsHTML;
  if(rewUnit) rewUnit.innerHTML = rewardUnitOptionsHTML;

  // product ids
  const pidName = genId('productName_rew');
  const pidId = genId('productId_rew');
  const btnOpen = wrapper.querySelector('.btn-open-product-modal');
  const nameInput = wrapper.querySelector('.selectedProductName_reward');
  const idInput = wrapper.querySelector('.selectedProductId_reward');
  if(nameInput) nameInput.id = pidName;
  if(idInput) idInput.id = pidId;
  if(btnOpen){
    btnOpen.setAttribute('data-target-name', pidName);
    btnOpen.setAttribute('data-target-id', pidId);
  }

  // per-reward product toggling + required/disabled handling
  if(nameInput && idInput){
    const updateVisibility = () => {
      // Enable reward-object only if reward-action === '2'
      const actVal = rewAction ? String(rewAction.value) : '';
      if(rewObject){
        if(actVal === '2'){
          rewObject.disabled = false;
          rewObject.setAttribute('required','required');
        } else {
          rewObject.disabled = true;
          rewObject.removeAttribute('required');
          try { rewObject.value = ''; } catch(e){}
        }
      }
      const objVal = rewObject ? String(rewObject.value) : '';
      const show = (actVal === '2' && objVal === '1');
      setProductInputsState(nameInput, idInput, show);
    };
    rewAction && rewAction.addEventListener('change', updateVisibility);
    rewObject && rewObject.addEventListener('change', updateVisibility);
    try { updateVisibility(); } catch(e){}
  }

  const removeBtn = wrapper.querySelector('.btn-remove-reward');
  if(removeBtn) removeBtn.addEventListener('click', () => wrapper.remove());

  // defaults
  if(defaultData){
    try{
      if(defaultData.rewardAction) rewAction && (rewAction.value = defaultData.rewardAction);
      if(defaultData.rewardObject) rewObject && (rewObject.value = defaultData.rewardObject);
      if(defaultData.rewardProductId) idInput && (idInput.value = defaultData.rewardProductId);
      if(defaultData.rewardProductName) nameInput && (nameInput.value = defaultData.rewardProductName);
      if(defaultData.rewardValue) wrapper.querySelector('.rewardValueInput') && (wrapper.querySelector('.rewardValueInput').value = defaultData.rewardValue);
      if(defaultData.rewardUnit) rewUnit && (rewUnit.value = defaultData.rewardUnit);
    }catch(e){}
    try { if(nameInput && idInput){ const actVal = rewAction ? String(rewAction.value) : ''; const objVal = rewObject ? String(rewObject.value) : ''; const show = (actVal === '2' && objVal === '1'); setProductInputsState(nameInput, idInput, show); } }catch(e){}
  }

  rewardsContainer.appendChild(wrapper);
  return wrapper;
}

/* ---------------------------
   product modal delegation (fallback / compatibility)
   --------------------------- */
document.addEventListener('click', function(e){
  const btn = e.target.closest('.btn-open-product-modal');
  if (!btn) return;
  // if the button is hidden (d-none) do nothing
  if(btn.classList.contains('d-none')) return;

  window._productTargetName = btn.getAttribute('data-target-name');
  window._productTargetId = btn.getAttribute('data-target-id');

  if (typeof window.openProductPicker === 'function') {
    try {
      window.openProductPicker({
        targetsName: window._productTargetName ? [window._productTargetName] : [],
        targetsId: window._productTargetId ? [window._productTargetId] : [],
        multi: btn.dataset?.multi === 'true'
      }).catch(()=>{});
      return;
    } catch(e){
      console.warn('openProductPicker call failed', e);
    }
  }

  const modal = document.querySelector('#productModal') || document.querySelector('#modalProductList') || document.querySelector('#modalProduct');
  if (modal) {
    window.__productPickerActiveTarget = { nameSelector: window._productTargetName, idSelector: window._productTargetId };
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const inst = bootstrap.Modal.getOrCreateInstance(modal);
      modal.addEventListener('hidden.bs.modal', () => setTimeout(cleanBootstrapBackdrops, 40), { once: true });
      inst.show();
    } else {
      document.dispatchEvent(new CustomEvent('productPicker:open', { detail: { targetsName: [window._productTargetName], targetsId: [window._productTargetId] } }));
    }
  } else {
    showAlert('ไม่พบ modal สินค้า (id: productModal / modalProductList / modalProduct)');
  }
});

/* ---------------------------
   Wiring UI buttons & search/pagination/tabs
   --------------------------- */
function bindOpenButtons(){
  const byId = document.getElementById('btn-open-condition');
  if(byId && !byId._bound){
    byId._bound = true;
    byId.addEventListener('click', (ev) => {
      ev.stopPropagation();
      let promotionId = byId.dataset?.promotionId ?? new URLSearchParams(window.location.search).get('id');
      const promotionName = byId.dataset?.promotionName ?? '';
      if(!promotionId) promotionId = new URLSearchParams(window.location.search).get('id');
      if(!promotionId){ console.warn('OpenConditionOverlay: promotion id not found'); return; }
      OpenConditionOverlay(promotionId, promotionName, byId);
    });
  }

  document.querySelectorAll('.btn-open-condition').forEach(btn => {
    if(btn._boundOpen) return;
    btn._boundOpen = true;
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      let promotionId = btn.dataset?.promotionId ?? new URLSearchParams(window.location.search).get('id');
      const promotionName = btn.dataset?.promotionName ?? btn.getAttribute('data-promotion-name') ?? '';
      if(!promotionId){
        const card = btn.closest?.('.cards');
        if(card) promotionId = card.dataset?.id;
      }
      if(!promotionId) promotionId = new URLSearchParams(window.location.search).get('id');
      if(!promotionId){ console.warn('OpenConditionOverlay: promotion id not found'); return; }
      OpenConditionOverlay(promotionId, promotionName, btn);
    });
  });
}

function bindHeaderButtons(){
  const closeBtn = el('btn-close-condition');
  if(closeBtn && !closeBtn._boundClose){
    closeBtn._boundClose = true;
    closeBtn.addEventListener('click', () => hideOverlay());
  }

  const createBtn = el('btn-create-condition');
  if(createBtn && !createBtn._boundCreate){
    createBtn._boundCreate = true;
    createBtn.dataset.mode = createBtn.dataset.mode || 'create';
    createBtn.addEventListener('click', () => {
      if(String(createBtn.dataset.mode) === 'back'){
        showListView();
      } else {
        showEditView(null);
      }
    });
  }

  const cancelBtn = el('btn-cancel-edit');
  if(cancelBtn && !cancelBtn._boundCancel){
    cancelBtn._boundCancel = true;
    cancelBtn.addEventListener('click', () => showListView());
  }

  const backBtn = el('btn-back-to-list');
  if(backBtn && !backBtn._boundBack){
    backBtn._boundBack = true;
    backBtn.addEventListener('click', () => showListView());
  }
}

function bindPaginationControls(){
  btnPrev = btnPrev || $('#btn-prev-page');
  btnNext = btnNext || $('#btn-next-page');
  perPageSelect = perPageSelect || $('#perPageSelect');

  if(btnPrev && !btnPrev._bound){
    btnPrev._bound = true;
    btnPrev.addEventListener('click', () => { if(pageState.page > 1){ pageState.page--; loadConditions({ page: pageState.page }); }});
  }
  if(btnNext && !btnNext._bound){
    btnNext._bound = true;
    btnNext.addEventListener('click', () => { if(pageState.page < pageState.total_pages){ pageState.page++; loadConditions({ page: pageState.page }); }});
  }
  if(perPageSelect && !perPageSelect._bound){
    perPageSelect._bound = true;
    perPageSelect.addEventListener('change', () => { pageState.per_page = Number(perPageSelect.value); pageState.page = 1; loadConditions({ page:1, per_page: pageState.per_page }); });
  }
}

function bindSearch(){
  searchInput = searchInput || $('#conditionSearch');
  if(!searchInput || searchBound) return;
  searchInput.addEventListener('input', debounce(() => {
    pageState.q = searchInput.value.trim();
    pageState.page = 1;
    loadConditions({ page: 1, q: pageState.q });
  }, 350));
  searchBound = true;
}

function bindTabs(){
  document.querySelectorAll('#conditionTab .nav-link').forEach(tab => {
    if (tab._boundTab) return;
    tab._boundTab = true;
    tab.addEventListener('click', e => {
      e.preventDefault();
      if (tab.classList.contains('active')) return;

      const targetId = tab.getAttribute('data-target');
      document.querySelectorAll('#conditionTab .nav-link').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(c => c.style.display = 'none');
      const targetContent = document.querySelector(targetId);
      if (targetContent) targetContent.style.display = 'flex';
      const overlayEl = el('condition-overlay');
      if (overlayEl) {
        if (targetId === '#advance-content') overlayEl.classList.add('mode-edit');
      }
      if (targetId === '#advance-content') {
        setTimeout(()=> {
          try { if (typeof Blockly !== 'undefined' && Blockly.svgResize) { const ws = Blockly.getMainWorkspace ? Blockly.getMainWorkspace() : (window.workspace || null); if(ws) Blockly.svgResize(ws); } } catch(e){}
        }, 120);
      }
    });
  });
}

// entrypoint
window.OpenConditionOverlay = async function(promotionId, promotionName = '', cardEl = null){
  try{
    promoId = Number(promotionId);
    showOverlay();
    const t = $('#overlay-title'); if(t) t.textContent = promotionName ? `เงื่อนไข: ${promotionName}` : 'เงื่อนไข';
    pageState.page = 1;
    bindPaginationControls();
    bindSearch();
    await loadConditions({ page: 1, per_page: pageState.per_page });
    searchInput = searchInput || $('#conditionSearch');
    searchInput && (searchInput.value = pageState.q || '');
    try{ searchInput?.focus(); }catch(e){}
    setCreateButtonMode('create');
  }catch(err){ console.error('OpenConditionOverlay error', err); showOverlay(); showListView(); }
};

// init
document.addEventListener('DOMContentLoaded', async () => {
  overlay = $('#condition-overlay');
  listView = $('#condition-list-view');
  editView = $('#condition-edit-view');
  tbodyEl = $('#conditionsListTable tbody');
  badge = $('#condition-count');
  noEl = $('#no-conditions');
  searchInput = $('#conditionSearch');
  perPageSelect = $('#perPageSelect');
  btnPrev = $('#btn-prev-page');
  btnNext = $('#btn-next-page');
  paginationInfo = $('#paginationInfo');
  conditionForm = $('#condition-form');

  initTemplates();
  await populateConditionForm();
  bindConditionEvents();
  bindPaginationControls();
  bindSearch();
  initFormSubmit();
  bindOpenButtons();
  bindHeaderButtons();
  bindTabs();

  // cleanup any leftover backdrops on load
  setTimeout(cleanBootstrapBackdrops, 120);
});