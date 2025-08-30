// /myPromotion/src/components/Condition/ConditionService.js
// Central service for Condition CRUD (normalize payload + call API)
// Export: default ConditionService and named ConditionService
import { API } from "/myPromotion/src/assets/js/api.js";

function normalizePayload(input = {}) {
  const {
    id = null,
    promotion_id,
    condition_name,
    condition_xml,
    condition_code = "",
    code_lang = "json",
    version = "1",
    created_by = (window?.currentUser || "admin"),
    mode = "basic",
    tags = [],
    note = ""
  } = input;

  // If condition_xml is object -> stringify for DB; otherwise keep string
  const xmlData = (typeof condition_xml === "object") ? JSON.stringify(condition_xml) : (condition_xml || "");

  let condition_code_local = String(condition_code || '');
  // try to populate code from xmlData if missing
  if(!condition_code_local || condition_code_local === '') {
    try {
      let parsed = null;
      if(typeof condition_xml === 'string' && condition_xml.trim()){
        parsed = JSON.parse(condition_xml);
      } else if(typeof condition_xml === 'object' && condition_xml !== null){
        parsed = condition_xml;
      }
      if(parsed){
        const codeObj = parsed.compiled_dsl || (parsed.rules ? parsed : null);
        if(codeObj) condition_code_local = JSON.stringify(codeObj);
      }
    } catch(e){}
  }


  return {
    id,
    promotion_id: Number(promotion_id || 0),
    condition_name: String(condition_name || "").trim(),
    condition_xml: xmlData,
    condition_code: condition_code_local,
    code_lang,
    version,
    created_by,
    mode,
    tags,
    note
  };
}

export const ConditionService = {
  async insert(input = {}) {
    const payload = normalizePayload(input);
    if (!payload.promotion_id) return { success: false, error: "promotion_id required" };
    if (!payload.condition_name) return { success: false, error: "condition_name required" };

    try {
      const res = await API.insertCondition(payload);
      return res;
    } catch (err) {
      return { success: false, error: String(err?.message || err) };
    }
  },

  async getList(options = {}) {
    try {
      const res = await API.getCondition(options);
      return res;
    } catch (err) {
      return { success: false, error: String(err?.message || err) };
    }
  },

  async getById(id, promotion_id = 0) {
    if (!id) return { success: false, error: "id required" };
    try {
      const res = await this.getList({ promotion_id: Number(promotion_id || 0), page: 1, per_page: 200 });
      if (!res?.success) return { success: false, error: res?.error || "fetch failed" };
      const found = (res.data || []).find(x => String(x.id) === String(id));
      return found ? { success: true, data: found } : { success: false, error: "not found" };
    } catch (err) {
      return { success: false, error: String(err?.message || err) };
    }
  },

  async delete(id) {
    if (!id) return { success: false, error: "id required" };
    try {
      const res = await API.deleteCondition({ id });
      return res;
    } catch (err) {
      return { success: false, error: String(err?.message || err) };
    }
  }
};

export default ConditionService;