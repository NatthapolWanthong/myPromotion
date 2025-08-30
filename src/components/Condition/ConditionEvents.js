// ConditionEvents.js
// Responsible for: Open/Hide overlay, load list (API), render table, delete, pagination, search, tab switch.

import { $, el, eHtml, debounce, trap, release, cleanBootstrapBackdrops } from './ConditionHelpers.js';
import { initTemplates } from './ConditionTemplates.js';
import { initFormHandlers } from './ConditionForm.js';
import { API } from '/myPromotion/src/assets/js/api.js';
import { parseBlocklyJsonToConditionItems } from './ConditionParser.js';

let overlay, listView, editView, tbodyEl, badgeEl, noEl, paginationInfo;
let btnPrev, btnNext, perPageSelect, searchInput;
let pageState = { page: 1, per_page: 20, total_pages: 1, q: '' };
let promoId = null;
let currentConditions = [];

/* ---------------------------
   UI helpers
   --------------------------- */
function setCreateButtonMode(mode){
  const btn = el('btn-create-condition');
  if(!btn) return;
  if(mode === 'back'){
    btn.dataset.mode = 'back'; btn.textContent = 'ย้อนกลับ'; btn.classList.add('btn-back-mode');
  } else {
    btn.dataset.mode = 'create'; btn.textContent = 'สร้างเงื่อนไข'; btn.classList.remove('btn-back-mode');
  }
}

function showOverlay(){
  overlay = overlay || $('#condition-overlay');
  if(!overlay) return;
  overlay.classList.remove('d-none');
  showListView();
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

function escHandler(e){ if(e.key === 'Escape' || e.key === 'Esc'){ const ev = editView || $('#condition-edit-view'); if(ev && !ev.classList.contains('d-none')) showListView(); else hideOverlay(); } }

function showListView(){
  listView = listView || $('#condition-list-view');
  editView = editView || $('#condition-edit-view');
  if(editView) editView.classList.add('d-none');
  if(listView) listView.classList.remove('d-none');
  overlay && overlay.classList.remove('mode-edit');
  const t = $('#overlay-title'); if(t) t.textContent='เงื่อนไข';
  setCreateButtonMode('create');
}

function showEditView(data = null){
  listView = listView || $('#condition-list-view');
  editView = editView || $('#condition-edit-view');
  if(listView) listView.classList.add('d-none');
  if(editView) editView.classList.remove('d-none');
  overlay && overlay.classList.add('mode-edit');
  const t = $('#overlay-title'); if(t) t.textContent = data ? 'แก้ไขเงื่อนไข' : 'สร้างเงื่อนไข';

  let cond = data?.condition_xml;
  try { cond = (typeof cond === 'string' && cond.trim()) ? JSON.parse(cond) : cond; } catch(e){}

  const mode = (data && (data.mode === 'advance' || data.mode === 'basic')) ? data.mode : null;

  if(mode === 'advance'){
    document.querySelectorAll('#conditionTab .nav-link').forEach(t => t.classList.remove('active'));
    const adv = document.querySelector('#conditionTab .nav-link[data-target="#advance-content"]');
    if(adv) adv.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(c => c.style.display = 'none');
    const advEl = document.querySelector('#advance-content');
    if(advEl) advEl.style.display = 'flex';
    setTimeout(()=>{ try { if(typeof Blockly !== 'undefined' && Blockly.svgResize){ const ws = Blockly.getMainWorkspace ? Blockly.getMainWorkspace() : (window.workspace || null); if(ws) Blockly.svgResize(ws); } }catch(e){} }, 120);
  } else {
    document.querySelectorAll('#conditionTab .nav-link').forEach(t => t.classList.remove('active'));
    const bas = document.querySelector('#conditionTab .nav-link[data-target="#basic-content"]');
    if(bas) bas.classList.add('active');
    document.querySelectorAll('.tab-pane').forEach(c => c.style.display = 'none');
    const basEl = document.querySelector('#basic-content');
    if(basEl) basEl.style.display = 'flex';
  }

  // delegate population to listeners (form module or advance module)
  window.dispatchEvent(new CustomEvent('condition:populate', { detail: { row: data, condition_xml: cond, mode } }));

  setCreateButtonMode('back');
}

/* ---------------------------
   Data: load & render
   --------------------------- */
async function loadConditions(opts = {}) {
  pageState = { ...pageState, ...opts };
  const effectivePromo = opts.promotion_id ?? promoId ?? (new URLSearchParams(window.location.search).get('id'));
  if(!effectivePromo){ currentConditions = []; renderList(); return; }
  promoId = Number(effectivePromo);

  tbodyEl = tbodyEl || $('#conditionsListTable tbody');
  badgeEl = badgeEl || $('#condition-count');
  if(tbodyEl) tbodyEl.innerHTML = `<tr><td colspan="4" class="text-center">กำลังโหลด...</td></tr>`;

  const params = {
    promotion_id: Number(promoId),
    page: Number(pageState.page || 1),
    per_page: Number(pageState.per_page || 20),
    q: pageState.q || ''
  };

  let res;
  try {
    res = await API.getCondition(params);
  } catch(err) {
    console.error('getCondition error', err);
    res = { success:false, error: String(err) };
  }

  if(res && res.success){
    currentConditions = (res.data || []).map(r => {
      const out = { ...r };
      try { out.condition_xml_parsed = (r.condition_xml && typeof r.condition_xml === 'object') ? r.condition_xml : (typeof r.condition_xml === 'string' && r.condition_xml.trim() ? JSON.parse(r.condition_xml) : r.condition_xml); } catch(e){ out.condition_xml_parsed = r.condition_xml; }
      out.name = out.condition_name ?? out.name;
      return out;
    });
    pageState.total_pages = res.total_pages || 1;
    badgeEl && (badgeEl.textContent = String(res.total ?? currentConditions.length));
    renderList();
  } else {
    currentConditions = [];
    if(tbodyEl) tbodyEl.innerHTML = `<tr><td colspan="4" class="text-center text-danger">โหลดข้อมูลล้มเหลว: ${eHtml(res?.error || 'unknown')}</td></tr>`;
    badgeEl && (badgeEl.textContent = '0');
  }
}

function renderList(){
  tbodyEl = tbodyEl || $('#conditionsListTable tbody');
  badgeEl = badgeEl || $('#condition-count');
  noEl = noEl || $('#no-conditions');
  paginationInfo = paginationInfo || $('#paginationInfo');

  if(!tbodyEl) return;
  tbodyEl.innerHTML = '';

  if(!currentConditions || !currentConditions.length){
    noEl && noEl.classList.remove('d-none');
    badgeEl && (badgeEl.textContent = '0');
    paginationInfo && (paginationInfo.textContent = `Page ${pageState.page} / ${pageState.total_pages}`);
    return;
  }
  noEl && noEl.classList.add('d-none');

  // helper to compute counts and preview
  function analyzeCondition(c) {
    const parsed = c.condition_xml_parsed ?? c.condition_xml ?? null;
    const compiled = (parsed && parsed.compiled_dsl) ? parsed.compiled_dsl : (parsed && parsed.rules ? parsed : null);
    const rules = (compiled && compiled.rules) ? compiled.rules : (Array.isArray(compiled) ? compiled : []);
    let totalSubConditions = 0;
    let totalRewards = 0;
    try {
      for (const rule of rules) {
        if (rule.type === 'IF' && Array.isArray(rule.branches)) {
          totalSubConditions += rule.branches.length;
          for (const br of rule.branches) {
            if (br && br.then) {
              if (br.then.type === 'REWARD_BLOCK' && Array.isArray(br.then.rewards)) {
                totalRewards += br.then.rewards.length;
              } else if (Array.isArray(br.then.rewards)) {
                totalRewards += br.then.rewards.length;
              } else {
                // fallback: if then is REWARD_BLOCK single
                totalRewards += 0;
              }
            }
          }
        } else {
          // other rule types: count as 1 subcondition (best-effort)
          totalSubConditions += 1;
          if (rule.rewards && Array.isArray(rule.rewards)) totalRewards += rule.rewards.length;
        }
      }
    } catch(e){ console.warn('analyzeCondition failed', e); }
    return { totalSubConditions, totalRewards, compiled, parsed };
  }

  currentConditions.forEach((c, idx) => {
    const an = analyzeCondition(c);
    const mode = (c.condition_xml_parsed && c.condition_xml_parsed.mode) ? c.condition_xml_parsed.mode : (c.mode || 'unknown');
    const modeBadge = `<span class="badge ${mode==='advance'?'bg-info text-dark':'bg-secondary'}">${eHtml(String(mode))}</span>`;

    const detailsHtml = `
      <div class="small mb-1">
        <strong>เงื่อนไขย่อย:</strong> ${an.totalSubConditions} &nbsp; 
        <strong>ผลตอบแทน:</strong> ${an.totalRewards}
      </div>
      <details class="condition-raw"><summary class="small">รายละเอียด JSON (คลิก)</summary>
        <pre style="max-height:240px;overflow:auto;">${eHtml(JSON.stringify(an.parsed || c.condition_xml || '-', null, 2))}</pre>
      </details>
    `;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="vertical-align:top; width:56px">${(pageState.page - 1) * pageState.per_page + idx + 1}</td>
      <td style="vertical-align:top"><div><strong>${eHtml(c.condition_name ?? c.name ?? '-')}</strong> ${modeBadge}</div></td>
      <td style="vertical-align:top">${detailsHtml}</td>
      <td style="vertical-align:top; white-space:nowrap">
        <button class="btn btn-sm btn-outline-primary btn-edit-condition" data-id="${c.id}">แก้ไข</button>
        <button class="btn btn-sm btn-outline-danger btn-delete-condition" data-id="${c.id}">ลบ</button>
      </td>
    `;
    tbodyEl.appendChild(tr);
  });

  // bind edit buttons
  tbodyEl.querySelectorAll('.btn-edit-condition').forEach(btn => {
    if (btn._bound) return;
    btn._bound = true;
    btn.addEventListener('click', async () => {
      const id = String(btn.dataset.id);
      let row = currentConditions.find(x => String(x.id) === id);

      if (!row) {
        try {
          const res = await API.getCondition({ promotion_id: promoId, page: 1, per_page: 200 });
          if (res && res.success) {
            row = (res.data || []).find(x => String(x.id) === id);
          }
        } catch (err) {
          console.error('getCondition (on edit) failed', err);
        }
      }

      if (!row) {
        alert('ไม่พบเงื่อนไข id นี้');
        return;
      }

      try {
        if (!row.mode) {
          const parsed = row.condition_xml_parsed ?? row.condition_xml ?? null;
          if (parsed && (parsed.mode === 'advance' || parsed.mode === 'basic')) row.mode = parsed.mode;
          else if (row.condition_xml && typeof row.condition_xml === 'string' && row.condition_xml.trim()) {
            try { const tmp = JSON.parse(row.condition_xml); if (tmp && (tmp.mode === 'advance' || tmp.mode === 'basic')) row.mode = tmp.mode; } catch(e){}
          }
        }
      } catch (e) { console.warn('infer mode failed', e); }

      showEditView(row);
    });
  });

  // bind delete buttons
  tbodyEl.querySelectorAll('.btn-delete-condition').forEach(btn => {
    if(btn._boundDel) return;
    btn._boundDel = true;
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      if(!confirm('ต้องการลบเงื่อนไขนี้ ใช่หรือไม่?')) return;
      btn.disabled = true;
      try{
        const res = await API.deleteCondition(id);
        if(res && res.success){
          window.dispatchEvent(new CustomEvent('condition:changed', { detail: { promotion_id: promoId, total: res.total ?? null } }));
          await loadConditions({ page: pageState.page });
          try { alert('ลบเงื่อนไขสำเร็จ'); }catch(e){}
        } else {
          throw new Error(res?.error || 'delete failed');
        }
      }catch(err){
        console.error('delete error', err);
        alert('ลบล้มเหลว: ' + (err.message || err));
      } finally { btn.disabled = false; }
    });
  });

  paginationInfo && (paginationInfo.textContent = `Page ${pageState.page} / ${pageState.total_pages}`);
}

/* ---------------------------
   UI bindings: pagination, search, tabs, header
   --------------------------- */
function bindPaginationControls(){
  btnPrev = btnPrev || $('#btn-prev-page');
  btnNext = btnNext || $('#btn-next-page');
  perPageSelect = perPageSelect || $('#perPageSelect');

  if(btnPrev && !btnPrev._bound){
    btnPrev._bound = true;
    btnPrev.addEventListener('click', ()=> { if(pageState.page > 1){ pageState.page--; loadConditions({ page: pageState.page }); }});
  }
  if(btnNext && !btnNext._bound){
    btnNext._bound = true;
    btnNext.addEventListener('click', ()=> { if(pageState.page < pageState.total_pages){ pageState.page++; loadConditions({ page: pageState.page }); }});
  }
  if(perPageSelect && !perPageSelect._bound){
    perPageSelect._bound = true;
    perPageSelect.addEventListener('change', () => { pageState.per_page = Number(perPageSelect.value); pageState.page = 1; loadConditions({ page:1, per_page: pageState.per_page }); });
  }
}

function bindSearch(){
  searchInput = searchInput || $('#conditionSearch');
  if(!searchInput || searchInput._bound) return;
  searchInput._bound = true;
  searchInput.addEventListener('input', debounce(()=> {
    pageState.q = searchInput.value.trim();
    pageState.page = 1;
    loadConditions({ page:1, q: pageState.q });
  }, 350));
}

function bindTabs(){
  document.querySelectorAll('#conditionTab .nav-link').forEach(tab => {
    if(tab._boundTab) return;
    tab._boundTab = true;
    tab.addEventListener('click', e => {
      e.preventDefault();
      if(tab.classList.contains('active')) return;
      document.querySelectorAll('#conditionTab .nav-link').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(c => c.style.display = 'none');
      const target = tab.getAttribute('data-target');
      const targetEl = document.querySelector(target);
      if(targetEl) targetEl.style.display = 'flex';
      const overlayEl = el('condition-overlay'); if(overlayEl && target === '#advance-content') overlayEl.classList.add('mode-edit');
      if(target === '#advance-content'){
        setTimeout(()=>{ try { if(typeof Blockly !== 'undefined' && Blockly.svgResize){ const ws = Blockly.getMainWorkspace ? Blockly.getMainWorkspace() : (window.workspace || null); if(ws) Blockly.svgResize(ws); } }catch(e){} }, 120);
      }
    });
  });
}

function bindHeaderButtons(){
  const closeBtn = el('btn-close-condition');
  if(closeBtn && !closeBtn._boundClose){
    closeBtn._boundClose = true;
    closeBtn.addEventListener('click', ()=> hideOverlay());
  }

  const createBtn = el('btn-create-condition');
  if(createBtn && !createBtn._boundCreate){
    createBtn._boundCreate = true;
    createBtn.dataset.mode = createBtn.dataset.mode || 'create';
    createBtn.addEventListener('click', ()=> {
      if(String(createBtn.dataset.mode) === 'back') {
        showListView();
      } else {
        showEditView(null);
        const basicTab = document.querySelector('#conditionTab .nav-link[data-target="#basic-content"]');
        if(basicTab) basicTab.click();
      }
    })
  }

  const cancelBtn = el('btn-cancel-edit');
  if(cancelBtn && !cancelBtn._boundCancel){
    cancelBtn._boundCancel = true;
    cancelBtn.addEventListener('click', ()=> showListView());
  }
}

/* ---------------------------
   Public entrypoint
   --------------------------- */
export async function OpenConditionOverlay(promotionId, promotionName = '', triggerEl = null){
  if (!promotionId && triggerEl && triggerEl.dataset) {
    const fromTrigger = Number(triggerEl.dataset.promotionId || triggerEl.dataset.id || 0);
    if (fromTrigger > 0) promotionId = fromTrigger;
  }
  try{
    promoId = Number(promotionId || promoId || new URLSearchParams(window.location.search).get('id'));
    if(!promoId){ console.warn('OpenConditionOverlay: promotion id not found'); return; }

    window.promoId = Number(promoId);
    overlay = overlay || $('#condition-overlay');
    if(overlay) overlay.dataset.promotionId = String(promoId); 

    overlay = overlay || $('#condition-overlay');
    listView = listView || $('#condition-list-view');
    editView = editView || $('#condition-edit-view');
    tbodyEl = tbodyEl || $('#conditionsListTable tbody');
    badgeEl = badgeEl || $('#condition-count');
    noEl = noEl || $('#no-conditions');
    paginationInfo = paginationInfo || $('#paginationInfo');

    initTemplates();

    // ensure form handlers bound early
    try { initFormHandlers(); } catch (e) { console.warn('initFormHandlers failed', e); }

    showOverlay();
    const t = $('#overlay-title'); if(t) t.textContent = promotionName ? `เงื่อนไข: ${promotionName}` : 'เงื่อนไข';
    pageState.page = 1;
    bindPaginationControls();
    bindSearch();
    bindTabs();
    bindHeaderButtons();

    await loadConditions({ page:1, per_page: pageState.per_page, promotion_id: promoId });
    try{ searchInput = searchInput || $('#conditionSearch'); searchInput && searchInput.focus(); }catch(e){}
  }catch(err){
    console.error('OpenConditionOverlay error', err);
    showOverlay();
  }
}

/* ---------------------------
   init module
   --------------------------- */
export function initConditionModule(){
  overlay = overlay || $('#condition-overlay');
  listView = listView || $('#condition-list-view');
  editView = editView || $('#condition-edit-view');
  tbodyEl = tbodyEl || $('#conditionsListTable tbody');
  badgeEl = badgeEl || $('#condition-count');
  noEl = noEl || $('#no-conditions');
  paginationInfo = paginationInfo || $('#paginationInfo');

  try { initFormHandlers(); } catch(e){}

  window.addEventListener('condition:requery', () => { loadConditions({ page: 1 }); });
  window.addEventListener('condition:changed', (ev) => {
    const det = ev.detail || {};
    if(det.promotion_id && Number(det.promotion_id) !== promoId) return;
    pageState.page = 1;
    loadConditions({ page:1 });
  });

  window.addEventListener('condition:saved', (ev) => {
    pageState.page = 1;
    loadConditions({ page:1 }).then(()=> showListView()).catch(()=> showListView());
  });

  document.querySelectorAll('.btn-open-condition').forEach(b => {
    if(b._boundOpen) return;
    b._boundOpen = true;
    b.addEventListener('click', (ev) => {
      ev.preventDefault();
      let pid = b.dataset?.promotionId ?? new URLSearchParams(window.location.search).get('id');
      if(!pid){ const card = b.closest?.('.cards'); if(card) pid = card.dataset?.id; }
      if(!pid){ console.warn('OpenConditionOverlay: promotion id not found'); return; }
      OpenConditionOverlay(pid, b.dataset?.promotionName || '');
    });
  });
}