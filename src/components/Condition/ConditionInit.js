// ConditionInit.js
// Thin initializer: called on DOMContentLoaded to bootstrap condition module
import { initFormSubmit, initFormHandlers } from './ConditionForm.js';
import { initConditionModule } from './ConditionEvents.js';
import { initTemplates } from './ConditionTemplates.js';

/**
 * init: safe idempotent initialization
 */
export function init(){
  try{
    initTemplates();
  }catch(e){ console.warn('initTemplates failed', e); }

  try{
    initConditionModule();
  }catch(e){ console.warn('initConditionModule failed', e); }

  try{
    // Bind form submit (use getPromoId callback to avoid global dependencies)
    initFormSubmit({ getPromoId: () => (window.promoId || Number(new URLSearchParams(window.location.search).get('id'))) });
    // bind populate/create handlers
    initFormHandlers();
  }catch(e){ console.warn('initFormSubmit failed', e); }
}

// auto-init on DOM ready (safe)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 0);
}

export default { init };