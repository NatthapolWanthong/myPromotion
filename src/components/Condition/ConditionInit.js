import { initFormSubmit, initFormHandlers } from './ConditionForm.js';
import { initConditionModule } from './ConditionEvents.js';
import { initTemplates } from './ConditionTemplates.js';



export function init(){
  try{
    initTemplates();
  }catch(e){ console.warn('initTemplates failed', e); }

  try{
    initConditionModule();
  }catch(e){ console.warn('initConditionModule failed', e); }

  try{
    initFormSubmit({ getPromoId: () => (window.promoId || Number(new URLSearchParams(window.location.search).get('id'))) });
    initFormHandlers();
  }catch(e){ console.warn('initFormSubmit failed', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 0);
}

export default { init };