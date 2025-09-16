// ConditionEvents.js (REFACOTRED for per-card lists + modal form)
/* Responsibilities:
   - Provide per-card condition list UI (pagination/search) via initConditionListForCard
   - Provide modal form opening via OpenConditionForm (keeps edit view modal)
   - Reuse existing API.getCondition / deleteCondition
*/

import { $, el, eHtml, debounce, trap, release, cleanBootstrapBackdrops } from './ConditionHelpers.js';
import { initTemplates } from './ConditionTemplates.js';
import { initFormHandlers } from './ConditionForm.js';
import { API } from '/myPromotion/src/assets/js/api.js';
import { parseBlocklyJsonToConditionItems } from './ConditionParser.js';

// per-card UI state map: promotionId -> { page, per_page, total_pages, q, currentConditions, elements... }
const perCardState = new Map();

// overlay/edit modal references (shared)
let overlay = null;
let editView = null;

/* ---------------------------
   Modal (edit) helpers (shared)
   --------------------------- */
function showOverlay(){
  overlay = overlay || $('#condition-overlay');
  if(!overlay) return;
  overlay.classList.remove('d-none');
  if(!document.body.classList.contains('overlay-open')) document.body.classList.add('overlay-open');
  if(overlay) trap(overlay);
  document.addEventListener('keydown', escHandler);
}

function hideOverlay(){
  overlay = overlay || $('#condition-overlay');
  if(!overlay) return;
  overlay.classList.add('d-none');
  if(overlay) release(overlay);
  try{ document.body.classList.remove('overlay-open'); }catch(e){}
  document.removeEventListener('keydown', escHandler);
  setTimeout(cleanBootstrapBackdrops, 80);
}

function escHandler(e){ if(e.key === 'Escape' || e.key === 'Esc'){ const ev = editView || $('#condition-edit-view'); if(ev && !ev.classList.contains('d-none')) { showOverlay(); showEditView(null); } else hideOverlay(); } }

function showEditView(data = null){
  // show edit view portion of modal and hide others (list removed)
  editView = editView || $('#condition-edit-view');
  if(!editView) return;
  document.querySelectorAll('#conditionTab .nav-link').forEach(t => t.classList.remove('active'));
  const bas = document.querySelector('#conditionTab .nav-link[data-target="#basic-content"]');
  if(bas) bas.classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(c => c.style.display = 'none');
  const basEl = document.querySelector('#basic-content');
  if(basEl) basEl.style.display = 'flex';

  // parse data.condition_xml if string
  let cond = data?.condition_xml ?? null;
  if (typeof cond === 'string' && cond.trim()) {
    try { cond = JSON.parse(cond); } catch(e){ /* ignore */ }
  }

  // dispatch populate event for form to handle
  window.dispatchEvent(new CustomEvent('condition:populate', { detail: { row: data || {}, condition_xml: cond || null, mode: (data && data.mode) || null } }));
}

/* ---------------------------
   Per-card: helpers to query elements
   --------------------------- */
function resolveCardElements(promotionId, cardEl = null){
  const pid = String(promotionId);
  // if cardEl passed, search within, otherwise global document
  const scope = cardEl || document;
  const tbody = scope.querySelector(`#conditionsListTable-${pid} tbody`);
  const elSearch = scope.querySelector(`#conditionSearch-${pid}`);
  const elPerPage = scope.querySelector(`#perPageSelect-${pid}`);
  const btnPrev = scope.querySelector(`#btn-prev-page-${pid}`);
  const btnNext = scope.querySelector(`#btn-next-page-${pid}`);
  const paginationInfo = scope.querySelector(`#paginationInfo-${pid}`);
  return { tbody, elSearch, elPerPage, btnPrev, btnNext, paginationInfo, scope };
}

/* ---------------------------
   loadConditionsForCard(promotionId, opts)
   - fetch conditions via API.getCondition and render into table scoped to card
   --------------------------- */
export async function loadConditionsForCard(promotionId, opts = {}, cardEl = null){
  const pid = Number(promotionId);
  if(!pid) return;

  // initialize state
  const existing = perCardState.get(pid) || { page:1, per_page:10, total_pages:1, q: '' };
  const state = { ...existing, ...opts };
  perCardState.set(pid, state);

  // resolve elements
  const els = resolveCardElements(pid, cardEl);
  if(!els.tbody){
    // nothing to render into
    return;
  }

  // show loading row
  els.tbody.innerHTML = `<tr><td colspan="4" class="text-center">กำลังโหลด...</td></tr>`;

  const params = {
    promotion_id: pid,
    page: Number(state.page || 1),
    per_page: Number(state.per_page || 10),
    q: state.q || ''
  };

  let res;
  try {
    res = await API.getCondition(params);
  } catch(err) {
    console.error('getCondition error', err);
    res = { success:false, error: String(err) };
  }

  if(res && res.success){
    const data = (res.data || []).map(r => {
      const out = { ...r };
      try { out.condition_xml_parsed = (r.condition_xml && typeof r.condition_xml === 'object') ? r.condition_xml : (typeof r.condition_xml === 'string' && r.condition_xml.trim() ? JSON.parse(r.condition_xml) : r.condition_xml); } catch(e){ out.condition_xml_parsed = r.condition_xml; }
      out.name = out.condition_name ?? out.name;
      return out;
    });
    state.total_pages = res.total_pages || 1;
    state.total = res.total ?? data.length;
    state.currentConditions = data;
    perCardState.set(pid, state);
    renderListForCard(pid, els.scope, data, state);
  } else {
    // error
    els.tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">โหลดข้อมูลล้มเหลว: ${eHtml(res?.error || 'unknown')}</td></tr>`;
  }
}

/* ---------------------------
   renderListForCard: render rows into table within given scope (card or document)
   --------------------------- */
function renderListForCard(promotionId, scope, data, state){
  const pid = String(promotionId);
  const tbody = scope.querySelector(`#conditionsListTable-${pid} tbody`);
  const paginationInfo = scope.querySelector(`#paginationInfo-${pid}`);
  const badge = scope.querySelector(`#condition-count`) || document.querySelector('#condition-count'); // keep badge global fallback
  const noEl = null;

  if(!tbody) return;
  tbody.innerHTML = '';

  if(!data || !data.length){
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">ยังไม่มีเงื่อนไข</td></tr>`;
    if(badge) badge.textContent = String(state.total ?? 0);
    if(paginationInfo) paginationInfo.textContent = `Page ${state.page} / ${state.total_pages}`;
    return;
  }

  // bind buttons scoped to this table (to avoid duplicate binding across cards)
  tbody.querySelectorAll('.btn-edit-condition').forEach(btn => {
    if (btn._bound) return;
    btn._bound = true;
    btn.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      const id = String(btn.dataset.id);
      const promo = Number(btn.dataset.promotion || promotionId);
      let row = (perCardState.get(promo) && perCardState.get(promo).currentConditions) ? perCardState.get(promo).currentConditions.find(x => String(x.id) === id) : null;
      if (!row) {
        try {
          const res = await API.getCondition({ promotion_id: promo, page: 1, per_page: 200 });
          if (res && res.success) row = (res.data || []).find(x => String(x.id) === id);
        } catch (err) { console.error('getCondition (on edit) failed', err); }
      }
      if (!row) { alert('ไม่พบเงื่อนไข id นี้'); return; }
      // open modal with row populated
      if (typeof window.OpenConditionForm === 'function') {
        window.OpenConditionForm(promo, row.condition_name || '', btn.closest('.cards') || null, row);
      } else {
        // fallback: dispatch populate event and show overlay
        showOverlay();
        showEditView(row);
      }
    });
  });

  tbody.querySelectorAll('.btn-delete-condition').forEach(btn => {
    if (btn._boundDel) return;
    btn._boundDel = true;
    btn.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      const id = Number(btn.dataset.id);
      const promo = Number(btn.dataset.promotion || promotionId);
      if(!confirm('ต้องการลบเงื่อนไขนี้ ใช่หรือไม่?')) return;
      btn.disabled = true;
      try{
        const res = await API.deleteCondition({ id });
        if(res && res.success){
          // reload this card's list
          await loadConditionsForCard(promo, { page: 1 });
          try { alert('ลบเงื่อนไขสำเร็จ'); } catch(e){}
        } else {
          throw new Error(res?.error || 'delete failed');
        }
      }catch(err){
        console.error('delete error', err);
        alert('ลบล้มเหลว: ' + (err.message || err));
      } finally { btn.disabled = false; }
    });
  });

  // update pagination info & badge (badge global fallback)
  if(paginationInfo) paginationInfo.textContent = `Page ${state.page} / ${state.total_pages}`;
  if(badge) badge.textContent = String(state.total ?? 0);
}

/* ---------------------------
   initConditionListForCard(promotionId, cardElement)
   - bind search / page-size / prev/next for that specific card
   - call loadConditionsForCard initially
   --------------------------- */
export function initConditionListForCard(promotionId, cardElement){
  const pid = Number(promotionId);
  if(!pid || !cardElement) return;
  // ensure DOM exists (table etc)
  const els = resolveCardElements(pid, cardElement);
  if(!els.tbody) return;

  // init default state if missing
  if(!perCardState.has(pid)){
    perCardState.set(pid, { page:1, per_page: Number(els.elPerPage?.value || 10), total_pages:1, q:'', currentConditions: [] });
  }

  const state = perCardState.get(pid);

  // bind search (debounced)
  if(els.elSearch && !els.elSearch._bound){
    els.elSearch._bound = true;
    els.elSearch.addEventListener('input', debounce(()=> {
      state.q = els.elSearch.value.trim();
      state.page = 1;
      perCardState.set(pid, state);
      loadConditionsForCard(pid, { page:1, q: state.q }, cardElement);
    }, 350));
  }

  // bind per-page select
  if(els.elPerPage && !els.elPerPage._bound){
    els.elPerPage._bound = true;
    els.elPerPage.addEventListener('change', () => {
      state.per_page = Number(els.elPerPage.value || 10);
      state.page = 1;
      perCardState.set(pid, state);
      loadConditionsForCard(pid, { page:1, per_page: state.per_page }, cardElement);
    });
  }

  // bind prev/next
  if(els.btnPrev && !els.btnPrev._bound){
    els.btnPrev._bound = true;
    els.btnPrev.addEventListener('click', ()=> {
      if(state.page > 1){ state.page--; perCardState.set(pid, state); loadConditionsForCard(pid, { page: state.page }, cardElement); }
    });
  }
  if(els.btnNext && !els.btnNext._bound){
    els.btnNext._bound = true;
    els.btnNext.addEventListener('click', ()=> {
      if(state.page < state.total_pages){ state.page++; perCardState.set(pid, state); loadConditionsForCard(pid, { page: state.page }, cardElement); }
    });
  }

  // initial load
  loadConditionsForCard(pid, { page: state.page, per_page: state.per_page, q: state.q }, cardElement);
}

/* ---------------------------
   refreshConditionsListUI(promotionId)
   - public helper to force reload UI for this card
   --------------------------- */
export function refreshConditionsListUI(promotionId){
  const pid = Number(promotionId);
  const state = perCardState.get(pid);
  const cardEl = document.querySelector(`#promotion-conditions-${pid}`)?.closest('.cards') || null;
  if(!pid) return;
  return loadConditionsForCard(pid, { page: state?.page || 1, per_page: state?.per_page || 10, q: state?.q || '' }, cardEl);
}

/* ---------------------------
   Modal form opening for edit/create
   OpenConditionForm(promotionId, promotionName, triggerEl = null, row=null)
   - Opens modal and shows edit form (populated with row if provided)
   --------------------------- */
export async function OpenConditionForm(promotionId, promotionName = '', triggerEl = null, row = null){
  try{
    // set promoId globally for form operations
    const pid = Number(promotionId || (triggerEl && triggerEl.dataset?.promotionId) || window.promoId || new URLSearchParams(window.location.search).get('id'));
    if(!pid) {
      console.warn('OpenConditionForm: promotion id not found'); 
      return;
    }
    window.promoId = pid;

    overlay = overlay || $('#condition-overlay');
    if(overlay) overlay.dataset.promotionId = String(pid);

    // init templates & form handlers (safe)
    try { initTemplates(); } catch(e){}
    try { initFormHandlers(); } catch(e){}

    showOverlay();
    // ensure edit view visible & dispatch populate/create
    if(row){
      showEditView(row);
    } else {
      // create mode
      try { 
        // reset form fields and fire condition:create
        window.dispatchEvent(new CustomEvent('condition:create', {}));
        // open basic tab
        const basicTab = document.querySelector('#conditionTab .nav-link[data-target="#basic-content"]');
        if(basicTab) basicTab.click();
      } catch(e){}
    }

    const t = $('#overlay-title'); if(t) t.textContent = promotionName ? `เงื่อนไข: ${promotionName}` : 'เงื่อนไข';
  }catch(err){
    console.error('OpenConditionForm error', err);
    showOverlay();
  }
}

/* ---------------------------
   initConditionModule (keeps event listeners for older .btn-open-condition, and global events)
   --------------------------- */
export function initConditionModule(){
  // initTemplates safe
  try { initTemplates(); } catch(e){}

  // global events
  window.addEventListener('condition:requery', (ev) => {
    // optionally accept promotion_id in event.detail
    const pid = ev?.detail?.promotion_id;
    if(pid) refreshConditionsListUI(pid);
    else {
      // refresh all known cards
      perCardState.forEach((_, key) => refreshConditionsListUI(key));
    }
  });

  window.addEventListener('condition:changed', (ev) => {
    const det = ev.detail || {};
    if(det.promotion_id){
      refreshConditionsListUI(Number(det.promotion_id));
    } else {
      perCardState.forEach((_, key) => refreshConditionsListUI(key));
    }
  });

  window.addEventListener('condition:saved', (ev) => {
    const det = ev.detail || {};
    if(det && det.promotion_id) refreshConditionsListUI(Number(det.promotion_id));
  });

  // legacy button selector: if any .btn-open-condition exist (older places), bind to open modal form
  document.querySelectorAll('.btn-open-condition').forEach(b => {
    if(b._boundOpen) return;
    b._boundOpen = true;
    b.addEventListener('click', (ev) => {
      ev.preventDefault();
      const pid = Number(b.dataset?.promotionId || new URLSearchParams(window.location.search).get('id'));
      if(!pid){ console.warn('OpenConditionForm: promotion id not found'); return; }
      OpenConditionForm(pid, b.dataset?.promotionName || '', b);
    });
  });
}

/* ---------------------------
   Exports
   --------------------------- */
export default {
  initConditionModule,
  initConditionListForCard,
  loadConditionsForCard,
  refreshConditionsListUI,
  OpenConditionForm
};

// also expose to window for backward compat
if (typeof window !== 'undefined') {
  try {
    window.OpenConditionForm = OpenConditionForm;
  } catch(e){}
}