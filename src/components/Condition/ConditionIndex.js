// ConditionIndex.js
// Central entrypoint for Condition module.
// Re-exports and small shims so external code can import a single module.

import { OpenConditionOverlay, initConditionModule } from './ConditionEvents.js';
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

/**
 * Public re-exports
 * - OpenConditionOverlay: เปิด overlay (จาก ConditionEvents)
 * - initConditionModule: init event listeners (จาก ConditionEvents)
 * - initCondition: bootstrap (จาก ConditionInit)
 */
export { OpenConditionOverlay, initConditionModule, initCondition };

/**
 * Small adapter / helper API for external usage
 */

export function parseConditionData(blocklyJson) {
  // wrapper around parser to keep naming consistent
  return parseBlocklyJsonToConditionItems(blocklyJson);
}

export function serializeConditionData(formEl) {
  // wrapper around form-to-DSL mapper
  return mapBasicFormToCompiledDSL(formEl);
}

export function buildFieldsFromForm(formEl) {
  return buildConditionFieldsFromForm(formEl);
}

export function validateForm(formEl) {
  return validateConditionForm(formEl);
}

export function bootFormSubmit(getPromoId) {
  // convenience wrapper to bind form submit handlers
  return initFormSubmit({ getPromoId });
}

/**
 * Expose some low-level parser utilities for advanced usage/testing
 */
export const ParserUtils = {
  mapOpToComparator,
  extractRewardFromBlock,
  collectRewardsChain
};

/**
 * Expose small DOM helpers (handy for quick integrations)
 */
export const Helpers = { $, $$, el, genId, eHtml, debounce };

/**
 * Default export: aggregated module
 */
export default {
  OpenConditionOverlay,
  initConditionModule,
  initCondition,
  parseConditionData,
  serializeConditionData,
  buildFieldsFromForm,
  validateForm,
  bootFormSubmit,
  ParserUtils,
  Helpers
};

// หลัง export ทั้งหมดแล้ว (ConditionIndex.js)
if (typeof window !== 'undefined') {
  // ช่วยให้โค้ดเก่าที่เรียก window.OpenConditionOverlay ทำงานได้ทันที
  try {
    window.OpenConditionOverlay = OpenConditionOverlay;
    window.initConditionModule = initConditionModule;
    window.initCondition = initCondition;
  } catch(e) { console.warn('Expose condition API failed', e); }
}