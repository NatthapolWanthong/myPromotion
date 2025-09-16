// ConditionIndex.js (updated exports)

import { OpenConditionForm, initConditionModule, initConditionListForCard, loadConditionsForCard, refreshConditionsListUI } from './ConditionEvents.js';
import { init as initCondition } from './ConditionInit.js';
import {
  parseBlocklyJsonToConditionItems,
  mapOpToComparator,
  extractRewardFromBlock,
  collectRewardsChain
} from './ConditionParser.js';
import {
  buildConditionFieldsFromForm,
  mapBasicFormToCompiledDSL,
  validateConditionForm,
  initFormSubmit
} from './ConditionForm.js';
import { $, $$, el, genId, eHtml, debounce } from './ConditionHelpers.js';

export { OpenConditionForm, initConditionModule, initConditionListForCard, loadConditionsForCard, refreshConditionsListUI };

/* existing wrappers */
export function parseConditionData(blocklyJson) {
  return parseBlocklyJsonToConditionItems(blocklyJson);
}
export function serializeConditionData(formEl) {
  return mapBasicFormToCompiledDSL(formEl);
}
export function buildFieldsFromForm(formEl) {
  return buildConditionFieldsFromForm(formEl);
}
export function validateForm(formEl) {
  return validateConditionForm(formEl);
}
export function bootFormSubmit(getPromoId) {
  return initFormSubmit({ getPromoId });
}

export const ParserUtils = {
  mapOpToComparator,
  extractRewardFromBlock,
  collectRewardsChain
};

export const Helpers = { $, $$, el, genId, eHtml, debounce };

export default {
  OpenConditionForm,
  initConditionModule,
  initConditionListForCard,
  loadConditionsForCard,
  refreshConditionsListUI,
  initCondition,
  parseConditionData,
  serializeConditionData,
  buildFieldsFromForm,
  validateForm,
  bootFormSubmit,
  ParserUtils,
  Helpers
};

if (typeof window !== 'undefined') {
  try {
    window.OpenConditionForm = OpenConditionForm;
    window.initConditionModule = initConditionModule;
    // keep backward compat for OpenConditionOverlay (original name) if needed
  } catch(e) { console.warn('Expose condition API failed', e); }
}
