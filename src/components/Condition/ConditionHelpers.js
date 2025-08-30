// ConditionHelpers.js
// Small reusable utilities for modal-condition module.
// Exports lightweight DOM helpers and small UI helpers.

export const $ = sel => document.querySelector(sel);
export const $$ = sel => Array.from(document.querySelectorAll(sel));
export const el = id => document.getElementById(id);

export function eHtml(s){
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"'`=\/]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
  }[c]));
}

export function genId(prefix='id'){
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
}

export function debounce(fn, wait=350){
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}

/**
 * setProductInputsState(nameInput, idInput, show)
 * - nameInput: visible input element for product name
 * - idInput: hidden input element for product id
 * - show: boolean - show/require when true, hide/disable when false
 */
export function setProductInputsState(nameInput, idInput, show){
  if(!nameInput || !idInput) return;
  try{
    const container = (nameInput.closest && (nameInput.closest('.condition-product-block') || nameInput.closest('.reward-product-block'))) || nameInput.parentElement;
    const btn = container ? container.querySelector('.btn-open-product-modal') : (nameInput.parentElement?.querySelector('.btn-open-product-modal') || null);

    if(show){
      if(container) container.classList.remove('d-none');
      try{ nameInput.removeAttribute('disabled'); nameInput.setAttribute('required','required'); }catch(e){}
      try{ idInput.removeAttribute('disabled'); idInput.setAttribute('required','required'); }catch(e){}
      if(btn) btn.classList.remove('d-none');
    } else {
      try{ nameInput.value = ''; }catch(e){}
      try{ idInput.value = ''; }catch(e){}
      try{ nameInput.setAttribute('disabled','disabled'); nameInput.removeAttribute('required'); }catch(e){}
      try{ idInput.setAttribute('disabled','disabled'); idInput.removeAttribute('required'); }catch(e){}
      if(btn) btn.classList.add('d-none');
      if(container) container.classList.add('d-none');
    }
  }catch(err){
    console.warn('setProductInputsState error', err);
  }
}

/* -------------------------
  Focus trap helpers (for overlay)
   - trap(container) to enable
   - release(container) to disable
   Keep minimal and robust
   ------------------------- */
const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
export function trap(container){
  if(!container) return;
  try{
    const list = Array.from(container.querySelectorAll(focusableSelector)).filter(x => x.offsetParent !== null);
    if(!list.length) return;
    const first = list[0], last = list[list.length-1];
    container._trap = e => {
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    container.addEventListener('keydown', container._trap);
    setTimeout(()=>{ try{ first.focus(); }catch(e){} }, 0);
  }catch(e){ console.warn('trap', e); }
}
export function release(container){
  try{
    if(container && container._trap){ container.removeEventListener('keydown', container._trap); delete container._trap; }
  }catch(e){ console.warn('release trap', e); }
}

/* small helper to remove stray bootstrap backdrops if present */
export function cleanBootstrapBackdrops(){
  try{
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
  }catch(e){ /* swallow */ }
}