// advanceCondition.js
// ================ advanceCondition.js Part1 ================

import ConditionService from "/myPromotion/src/components/Condition/ConditionService.js";
import { hideOverlay } from '/myPromotion/src/components/Condition/ConditionEvents.js';


/* -----------------------
   Helpers
   ----------------------- */
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function getPromotionId() {
  if (window?.promoId && Number(window.promoId) > 0) return Number(window.promoId);
  const overlay = document.getElementById('condition-overlay');
  if (overlay && overlay.dataset && overlay.dataset.promotionId) {
    const v = Number(overlay.dataset.promotionId || 0);
    if (v > 0) return v;
  }
  const idFromWindow = window?.promotionId || window?.promo_id;
  if (idFromWindow && Number(idFromWindow) > 0) return Number(idFromWindow);
  const qs = new URLSearchParams(window.location.search);
  const fromQs = qs.get('promotion_id') || qs.get('id') || '';
  return Number(fromQs || 0);
}


/* -----------------------
   Blockly toolbox & blocks
   ----------------------- */
const toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "Action",
      "colour": "#5C81A6",
      "contents": [
        { "kind": "block", "type": "action_buy" },
        { "kind": "block", "type": "action_cheer" },
        { "kind": "block", "type": "action_display" },
        { "kind": "block", "type": "action_join" },
        { "kind": "block", "type": "action_accumulate" }
      ]
    },
    {
      "kind": "category",
      "name": "Object",
      "colour": "#5CA65C",
      "contents": [
        { "kind": "block", "type": "object_product" },
        { "kind": "block", "type": "object_customer" },
        { "kind": "block", "type": "object_promotion" },
        { "kind": "block", "type": "object_event" }
      ]
    },
    {
      "kind": "category",
      "name": "Reward",
      "colour": "#A65C81",
      "contents": [
        { "kind": "block", "type": "reward_block" },
        { "kind": "block", "type": "reward_discount" },
        { "kind": "block", "type": "reward_gift" },
        { "kind": "block", "type": "reward_point" }
      ]
    },
    {
      "kind": "category",
      "name": "Logic",
      "colour": "#5C68A6",
      "contents": [
        { "kind": "block", "type": "controls_if" },
        { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "logic_operation" },
        { "kind": "block", "type": "logic_negate" } // เพิ่ม "not" เข้ามาด้วยก็จะดี
      ]
    },
    {
      "kind": "category",
      "name": "Math",
      "colour": "#5CA6A6",
      "contents": [
        { "kind": "block", "type": "math_number" },
        { "kind": "block", "type": "math_arithmetic" },
        { "kind": "block", "type": "Value_Unit" }
      ]
    },
    {
      "kind": "category",
      "name": "Text",
      "colour": "#5CA6D6",
      "contents": [
        { "kind": "block", "type": "text" },
        { "kind": "block", "type": "text_join" }
      ]
    },
    {
      "kind": "category",
      "name": "Variables",
      "custom": Blockly.VARIABLE_CATEGORY_NAME
    },
    {
      "kind": "category",
      "name": "Tools",
      "contents": [
        { "kind": "button", "text": "Validate", "callbackKey": "validateRules" },
        { "kind": "button", "text": "Preview JSON", "callbackKey": "previewDSL" }
      ]
    }
  ]
};

Blockly.defineBlocksWithJsonArray([
  { "type": "action_buy", "message0": "ซื้อ %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "ValueUnit", "colour": 160 },
  { "type": "action_cheer", "message0": "เชียร์ %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "Number", "colour": 160 },
  { "type": "action_display", "message0": "จัดแสดง %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "Number", "colour": 160 },
  { "type": "action_join", "message0": "เข้าร่วม %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "Number", "colour": 160 },
  { "type": "action_accumulate", "message0": "สะสมยอด %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "Number", "colour": 160 },

  {
    "type": "object_product",
    "message0": "%1 %2",
    "args0": [
      { "type": "field_label_serializable", "text": "สินค้า", "name": "LABEL" },
      { "type": "field_dropdown", "name": "PRODUCT_SELECT", "options": [["A","A"],["B","B"]] }
    ],
    "output": "Object",
    "colour": 230
  },

  { "type": "object_customer", "message0": "ลูกค้า", "output": "Object", "colour": 230 },
  { "type": "object_promotion", "message0": "โปรโมชั่น", "output": "Object", "colour": 230 },
  { "type": "object_event", "message0": "กิจกรรม", "output": "Object", "colour": 230 },

  // reward_discount: target dropdown + optional product input when target === PRODUCT
  {
    "type": "reward_discount",
    "message0": "ส่วนลด: %1",
    "args0": [
      { "type": "field_dropdown", "name": "TARGET", "options": [["สินค้า","PRODUCT"],["ยอดรวม","TOTAL"],["ค่าจัดส่ง","SHIPPING"]] }
    ],
    "output": "RewardType",
    "colour": 290,
    "mutator": "reward_discount_mutator",
    "inputsInline": true
  },

  // reward_gift: target dropdown + optional item input when target === PRODUCT
  {
    "type": "reward_gift",
    "message0": "ของแถม: %1",
    "args0": [
      { "type": "field_dropdown", "name": "TARGET", "options": [["สินค้า","PRODUCT"],["ทอง","GOLD"],["รถ","CAR"]] }
    ],
    "output": "RewardType",
    "colour": 290,
    "mutator": "reward_gift_mutator",
    "inputsInline": true
  },

  { "type": "reward_point", "message0": "คะแนน %1", "args0": [{ "type": "input_value", "name": "POINTS", "check": "Number" }], "output": "RewardType", "colour": 290 },

  // Math / value
  { "type": "math_number", "message0": "%1", "args0":[{ "type":"field_number","name":"NUM","value":0 }], "output":"Number", "colour":230 },

  // Text
  { "type": "text", "message0": "%1", "args0":[{ "type":"field_input","name":"TEXT","text":"" }], "output":"String", "colour":160 },
  { "type": "text_join", "message0": "%1", "args0":[{ "type":"input_value","name":"ADD0" }], "output":"String", "colour":160 }
]);

/* -----------------------
   Define Value_Unit as JS block (multi-output: Number + ValueUnit)
   Reason: allow connecting to logic_compare (Number) but keep unit info for compiler.
   ----------------------- */
Blockly.Blocks['Value_Unit'] = {
  init: function() {
    // numeric field + unit dropdown as a single row
    this.appendDummyInput()
      .appendField(new Blockly.FieldNumber(0), 'Value')
      .appendField(new Blockly.FieldDropdown([['บาท','1'], ['%','2'], ['ชิ้น','3'], ['ลัง','4'], ['โหล','5'], ['สลึง','6'], ['เมตร','7']]), 'Unit');
    // Allow both Number (so it can connect to logic_compare) and ValueUnit (to keep unit info)
    this.setOutput(true, ['Number', 'ValueUnit']);
    this.setColour(225);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};


/* -----------------------
   Replace reward_block with new inline "ให้ผลตอบแทน <left> = <right>" structure
   (user requested format: label input "=" input)
   ----------------------- */
Blockly.defineBlocksWithJsonArray([
  {
    "type": "reward_block",
    "message0": "%1 %2 %3 %4",
    "args0": [
      { "type": "field_label_serializable", "name": "LABEL_LEFT", "text": "ให้ผลตอบแทน" },
      { "type": "input_value", "name": "LEFT" },
      { "type": "field_label_serializable", "name": "LABEL_EQ", "text": "=" },
      { "type": "input_value", "name": "RIGHT" }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "",
    "helpUrl": ""
  }
]);

Blockly.Blocks['reward_point'] = {
  init: function() {
    this.appendDummyInput().appendField('ให้คะแนน');
    this.setOutput(true, ['RewardType', 'Number', 'ValueUnit']);
    this.setColour(290);
  }
};

/* -----------------------
   DSL compiler (BLOCK -> JSON)
   - compileToDSL(workspace) returns { meta: {...}, rules: [...] }
   - Updated to support new reward_block shape (LEFT/RIGHT)
   ----------------------- */
function blockToNode(block) {
  if (!block) return null;
  const t = block.type;
  const inB = (name) => block.getInputTargetBlock(name);

  switch (t) {
    // Actions
    case "action_buy":        return { type: "ACTION", action: "BUY", object: blockToNode(inB("OBJECT")) };
    case "action_cheer":      return { type: "ACTION", action: "CHEER", object: blockToNode(inB("OBJECT")) };
    case "action_display":    return { type: "ACTION", action: "DISPLAY", object: blockToNode(inB("OBJECT")) };
    case "action_join":       return { type: "ACTION", action: "JOIN", object: blockToNode(inB("OBJECT")) };
    case "action_accumulate": return { type: "ACTION", action: "ACCUMULATE", object: blockToNode(inB("OBJECT")) };

    // Objects
    case "object_product": {
      // try PRODUCT_IDS field if present
      const fields = block.fields ?? {};
      const productIds = fields.PRODUCT_IDS || null;
      if (productIds && Array.isArray(productIds) && productIds.length) {
        return { type: "OBJECT", kind: "PRODUCT", product_ids: productIds.map(String), product: String(productIds[0]) };
      }
      return { type: "OBJECT", kind: "PRODUCT", product: block.getFieldValue("PRODUCT_SELECT") || null };
    }
    case "object_customer":  return { type: "OBJECT", kind: "CUSTOMER" };
    case "object_promotion": return { type: "OBJECT", kind: "PROMOTION" };
    case "object_event":     return { type: "OBJECT", kind: "EVENT" };

    // Reward structures
    case "reward_block": {
      // New shape: inline left and right inputs. Left/right may be RewardType, Number, ValueUnit, Object, text, etc.
      const left = blockToNode(inB("LEFT"));
      const right = blockToNode(inB("RIGHT"));
      return {
        type: "REWARD_BLOCK",
        left,
        right
      };
    }

    case "reward_discount": {
      const target = block.getFieldValue("TARGET") || "TOTAL";
      const productNode = blockToNode(inB("PRODUCT_INPUT"));
      const amount = blockToNode(inB("AMOUNT"));
      const out = { type: "REWARD", subtype: "DISCOUNT", target };
      if (productNode) out.product = productNode;
      if (amount) {
        out.amount = amount;
        if (amount.type === 'NUMBER' || amount.type === 'VALUE_UNIT') out.__asNumber = amount;
      }
      return out;
    }

    case "reward_gift": {
      const target = block.getFieldValue("TARGET") || "PRODUCT";
      const itemNode = blockToNode(inB("ITEM_INPUT"));
      const amount = blockToNode(inB("AMOUNT"));
      const out = { type: "REWARD", subtype: "GIFT", target };
      if (itemNode) out.item = itemNode;
      if (amount) {
        out.amount = amount;
        if (amount.type === 'NUMBER' || amount.type === 'VALUE_UNIT') out.__asNumber = amount;
      }
      return out;
    }

    case "reward_point": {
      return {
        type: "REWARD",
        subtype: "POINT"
      };
    }

    // Logic
    case "controls_if": {
      const out = { type: "IF", branches: [] };
      let i = 0;
      while (block.getInput("IF" + i)) {
        out.branches.push({
          cond: blockToNode(block.getInputTargetBlock("IF" + i)),
          then: blockToNode(block.getInputTargetBlock("DO" + i))
        });
        i++;
      }
      if (block.getInput("ELSE")) out.else = blockToNode(block.getInputTargetBlock("ELSE"));
      return out;
    }
    case "logic_compare": {
      const op = block.getFieldValue("OP");
      const A = blockToNode(inB("A"));
      const B = blockToNode(inB("B"));
      return {
        type: "COMPARE",
        op,
        A,
        B
      };
    }

    // Math / value
    case "math_number": return { type: "NUMBER", value: Number(block.getFieldValue("NUM") || 0) };
    case "Value_Unit":
      return { type: "VALUE_UNIT", value: Number(block.getFieldValue("Value") || 0), unit: block.getFieldValue("Unit") };

    // Text
    case "text": return { type: "TEXT", value: String(block.getFieldValue("TEXT") || "") };

    default:
      return { type: "UNKNOWN", blockType: t };
  }
}

function compileToDSL(workspace) {
  const tops = workspace.getTopBlocks(true) || [];
  const rules = tops.map(b => blockToNode(b));
  return {
    meta: {
      generated_at: (new Date()).toISOString(),
      generated_by: "blockly-compiler-v1"
    },
    rules
  };
}

function previewDSL(ws) {
  const d = compileToDSL(ws);
  console.log("Compiled DSL:", d);
  alert("ดู compiled JSON ใน console");
}

/* -----------------------
   Validation rules
   - additional business rules:
     * must have IF and at least one REWARD (basic check)
     ----------------------- */
function validateWorkspace(ws) {
  try {
    const all = ws.getAllBlocks(false);
    const hasIf = all.some(b => b.type === "controls_if");
    const hasReward = all.some(b => b.type && b.type === "reward_block" || (b.type && b.type.startsWith("reward")));
    if (!hasIf || !hasReward) {
      alert("Validation failed ❌ — ต้องมี IF และ Reward อย่างน้อย 1 อย่าง");
      return false;
    }

    // Ensure comparators compare numeric values (or reward nodes that expose __asNumber)
    const compares = all.filter(b => b.type === "logic_compare");
    for (const cmp of compares) {
      const a = cmp.getInputTargetBlock('A');
      const b = cmp.getInputTargetBlock('B');

      const isNumericNode = (blk) => {
        if (!blk) return false;
        const node = blockToNode(blk);
        if (!node) return false;
        if (node.type === 'NUMBER' || node.type === 'VALUE_UNIT') return true;
        if (node.__asNumber) return true;
        return false;
      };
    }

    return true;
  } catch (e) {
    console.warn("validateWorkspace error", e);
    alert("เกิดข้อผิดพลาดขณะตรวจสอบ workspace");
    return false;
  }
}

/* -----------------------
   Blockly workspace & floating buttons
   ----------------------- */
let workspace = null;
function initBlockly() {
  if (workspace) return workspace;

  workspace = Blockly.inject("blocklyDiv", {
    toolbox,
    trashcan: true,
    grid: { spacing: 20, length: 1, colour: "#ddd", snap: true },
    zoom: { controls: true, wheel: true },
    media: "https://unpkg.com/blockly/media/",
    renderer: "zelos",
    theme: Blockly.Themes.Classic
  });

  workspace.registerButtonCallback("validateRules", () => validateWorkspace(workspace));
  workspace.registerButtonCallback("previewDSL", () => previewDSL(workspace));

  ensureFloatingButtons();

  // Try to extend logic_compare (if available) so it accepts Number / ValueUnit / RewardType
  extendLogicCompareWhenReady(() => {
    // update existing logic_compare blocks in this workspace to accept new checks
    try {
      const blocks = workspace.getAllBlocks(false);
      for (const b of blocks) {
        if (b.type === 'logic_compare') {
          const inA = b.getInput('A');
          const inB = b.getInput('B');
          try {
            if (inA && inA.connection) inA.connection.setCheck(['Number','ValueUnit','RewardType']);
            if (inB && inB.connection) inB.connection.setCheck(['Number','ValueUnit','RewardType']);
          } catch (e) { /* ignore per-block set errors */ }
        }
      }
    } catch (e) { console.warn('post-patch update failed', e); }
  });

  return workspace;
}

// เมื่อ ConditionEvents ส่ง event condition:populate มา (ตอนกด Edit) ให้ Advance module โหลด workspace ทันที
window.addEventListener('condition:populate', (ev) => {
  try {
    const det = ev.detail || {};
    const mode = det.mode || (det.row && det.row.mode) || (det.condition_xml && det.condition_xml.mode) || null;
    if (String(mode) !== 'advance') return;

    // ensure view switched (shared UI may already do this but call to be safe)
    try { switchToEditView('advance'); } catch(e){}

    // ensure Blockly exists and init workspace
    try {
      initBlockly(); // safe idempotent - ถ้ามีแล้วจะรีเทิร์น workspace
    } catch(e){ console.warn('initBlockly failed', e); }

    // parse cond/workspace if provided
    const row = det.row || {};
    let cond = det.condition_xml || row.condition_xml || null;
    if (typeof cond === 'string' && cond.trim()) {
      try { cond = JSON.parse(cond); } catch(e){ /* leave as-is */ }
    }

    // small delay to ensure initBlockly completed and workspace variable available
    setTimeout(()=>{
      try {
        if (!workspace) {
          // try init again
          try { initBlockly(); } catch(e){}
        }
        if (cond && cond.workspace && workspace) {
          try {
            workspace.clear();
            Blockly.serialization.workspaces.load(cond.workspace, workspace);
            // force resize/draw
            try { if (Blockly.svgResize) Blockly.svgResize(workspace); } catch(e){}
          } catch (e) {
            console.warn('load workspace failed', e);
          }
        } else if (row && typeof row.condition_xml === 'string' && workspace) {
          // legacy XML case
          try {
            const dom = Blockly.Xml.textToDom(row.condition_xml);
            workspace.clear();
            Blockly.Xml.domToWorkspace(dom, workspace);
            try { if (Blockly.svgResize) Blockly.svgResize(workspace); } catch(e){}
          } catch(e) {
            // not XML or failed - ignore
            console.warn('legacy XML load failed', e);
          }
        }
        // set form name if present
        if (document.getElementById('condition-form-name') && row.condition_name) {
          document.getElementById('condition-form-name').value = row.condition_name;
        }
      } catch(e) { console.warn('condition:populate -> load workspace error', e); }
    }, 150);
  } catch(e) { console.warn('condition:populate handler error', e); }
});


function ensureFloatingButtons() {
  const container = document.getElementById("blocklyContainer") || document.body;
  if (!container) return;
  const st = window.getComputedStyle(container).position;
  if (st === "static" || !st) container.style.position = "relative";

  if (!container.querySelector(".bc-floating-actions")) {
    const wrap = document.createElement("div");
    wrap.className = "bc-floating-actions";
    wrap.innerHTML = `
      <button id="btn-adv-save" class="btn btn-success btn-sm">Save</button>
      <button id="btn-adv-load" class="btn btn-outline-secondary btn-sm">Load</button>
      <button id="btn-adv-validate" class="btn btn-outline-info btn-sm">Validate</button>
      <button id="btn-adv-preview" class="btn btn-outline-dark btn-sm">Preview</button>
    `;
    Object.assign(wrap.style, { position: "absolute", top: "8px", right: "8px", zIndex: 9999, display: "flex", gap: "8px" });
    container.appendChild(wrap);

    wrap.querySelector("#btn-adv-save").addEventListener("click", onSaveAdvance);
    wrap.querySelector("#btn-adv-load").addEventListener("click", onLoadAdvance);
    wrap.querySelector("#btn-adv-validate").addEventListener("click", () => validateWorkspace(workspace));
    wrap.querySelector("#btn-adv-preview").addEventListener("click", () => previewDSL(workspace));
  }
}

/* -----------------------
   Save / Load Advance (no JS generator)
   ----------------------- */
async function onSaveAdvance() {
  try {
    const promoId = getPromotionId();
    if (!promoId) { alert("ไม่พบ promotion id"); return; }

    // name from form (shared)
    let name = (document.getElementById("condition-form-name")?.value || "").trim();
    if (!name) {
      name = window.prompt("ระบุชื่อเงื่อนไข (Condition name):", "");
      if (name === null) return;
      name = (name || "").trim();
      if (!name) { alert("ต้องระบุชื่อเงื่อนไข"); return; }
      if (document.getElementById("condition-form-name")) document.getElementById("condition-form-name").value = name;
    }

    // validate workspace business wise (do not allow save if invalid)
    if (!validateWorkspace(workspace)) {
      return;
    }

    const btn = document.getElementById("btn-adv-save");
    if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }

    let wsState = null;
    try { wsState = Blockly.serialization.workspaces.save(workspace); } catch (e) { console.warn("serialize failed", e); wsState = null; }
    const compiled = compileToDSL(workspace);

    const conditionXml = {
      mode: "advance",
      workspace: wsState || {},
      compiled_dsl: compiled,
      saved_at: (new Date()).toISOString()
    };

    // <-- changed: include id (savedConditionId) so server can update instead of creating new -->
    const savedIdRaw = document.getElementById('savedConditionId')?.value;
    const savedId = (savedIdRaw !== undefined && savedIdRaw !== null && String(savedIdRaw).trim() !== '') ? Number(savedIdRaw) : undefined;

    const payload = {
      id: savedId, // undefined if not present; ConditionService.insert should handle insert/update by id
      promotion_id: Number(promoId),
      condition_name: name,
      condition_xml: conditionXml,
      condition_code: JSON.stringify(compiled),
      code_lang: "dsl-json",
      version: "1",
      created_by: (window.currentUser || "admin"),
      mode: "advance"
    };

    

    const res = await ConditionService.insert(payload);

    if (btn) { btn.disabled = false; btn.textContent = "Save"; }

    if (res && res.success) {
      alert("บันทึกสำเร็จ 🎉");

      // --- notify other modules (generateCard.js) to refresh the table for this promotion ---
      try {
        // try to get saved condition id from response (safe extraction)
        const savedId = (res.data && res.data.id) || res.id || res.saved_id || null;
        window.dispatchEvent(new CustomEvent('condition:saved', {
          detail: { promotion_id: Number(promoId), condition_id: savedId }
        }));
      } catch (e) {
        console.warn('dispatch condition:saved failed', e);
      }

      switchToListView();
      try { await refreshList(); } catch (e) { /* ignore */ }
      hideOverlay()

      const $table = `#conditionsListTable-${Number(promoId)}`
      $table.bootstrapTable('refresh')
    } else {
      alert("บันทึกล้มเหลว: " + (res?.error || "unknown"));
    }

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดขณะบันทึก: " + (err?.message || err));
    try { const btn = document.getElementById("btn-adv-save"); if (btn) { btn.disabled = false; btn.textContent = "Save"; } } catch {}
  }
}


// ================ advanceCondition.js Part2 ================

/* -----------------------
   onLoadAdvance (kept as before, plus set savedConditionId)
   ----------------------- */
async function onLoadAdvance() {
  try {
    const promoId = getPromotionId();
    if (!promoId) { alert("ไม่พบ promotion id"); return; }

    const listRes = await ConditionService.getList({ promotion_id: Number(promoId), page: 1, per_page: 200 });
    if (!listRes || !listRes.success) { alert("โหลดรายการเงื่อนไขล้มเหลว"); return; }
    const items = listRes.data || [];
    if (items.length === 0) { alert("ยังไม่มีเงื่อนไขสำหรับโปรโมชั่นนี้"); return; }

    const pickList = items.map(it => `${it.id}: ${it.condition_name} [${it.mode||"-"}]`).join("\n");
    const pick = window.prompt("เลือก id เงื่อนไข (พิมพ์ id):\n" + pickList, "");
    if (pick === null) return;
    const id = String(pick).trim();
    if (!id) { alert("ต้องระบุ id"); return; }

    const row = items.find(x => String(x.id) === id);
    if (!row) { alert("ไม่พบเงื่อนไข id นี้"); return; }

    let condXml = row.condition_xml ?? row.raw_condition_xml ?? null;
    if (typeof condXml === "string") {
      try { condXml = JSON.parse(condXml); } catch(e) { /* leave as string */ }
    }

    // set savedConditionId so saving will update this record (not create new)
    try { if (document.getElementById('savedConditionId')) document.getElementById('savedConditionId').value = row.id || ''; } catch(e){}

    switchToEditView("advance");
    initBlockly();

    if (condXml && condXml.workspace) {
      workspace.clear();
      Blockly.serialization.workspaces.load(condXml.workspace, workspace);
      alert("โหลด workspace เสร็จ");
      if ($("#condition-form-name") && row.condition_name) $("#condition-form-name").value = row.condition_name;
    } else if (row.condition_xml && typeof row.condition_xml === "string") {
      try {
        const dom = Blockly.Xml.textToDom(row.condition_xml);
        workspace.clear();
        Blockly.Xml.domToWorkspace(dom, workspace);
        alert("โหลด workspace (legacy XML) เสร็จ");
      } catch (e) {
        alert("เงื่อนไขนี้ไม่มี workspace ที่โหลดได้");
      }
    } else {
      alert("เงื่อนไขนี้ไม่มี workspace (อาจมาจาก Basic mode)");
    }
  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาดขณะโหลด: " + (err?.message || err));
  }
}

/* -----------------------
   List view (kept as before, with edit handler changed to dispatch condition:populate + set savedConditionId)
   ----------------------- */
async function refreshList() {
  const promoId = getPromotionId();
  if (!promoId) return;
  const searchText = ($("#conditionSearch")?.value || "").toLowerCase();
  const perPage = Number($("#perPageSelect")?.value || 20);

  const res = await ConditionService.getList({ promotion_id: promoId, page: 1, per_page: 500, q: (searchText || '') });
  const tbody = $("#conditionsListTable tbody");
  const info = $("#paginationInfo");
  const empty = $("#no-conditions");
  if (!tbody) return;

  tbody.innerHTML = "";
  let rows = (res?.data || []).map((c, idx) => ({
    idx: idx + 1,
    id: c.id,
    name: c.condition_name || "-",
    db: (c.mode || "-"),
    raw: c
  }));

  // server-side already filtered by q if provided; we still apply client filter as fallback
  if (searchText) rows = rows.filter(r => String(r.name).toLowerCase().includes(searchText));
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  let page = Number(info?.dataset?.page || 1);
  page = Math.min(Math.max(1, page), totalPages);
  const start = (page - 1) * perPage;
  const pageRows = rows.slice(start, start + perPage);

  pageRows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.idx}</td>
      <td>${r.name}</td>
      <td>${r.db}</td>
      <td>
        <button class="btn btn-sm btn-primary" data-action="edit" data-id="${r.id}">แก้ไข</button>
        <button class="btn btn-sm btn-danger" data-action="del" data-id="${r.id}">ลบ</button>
      </td>`;
    tbody.appendChild(tr);
  });

  if (empty) empty.classList.toggle("d-none", total > 0);
  if (info) { info.textContent = `Page ${page} / ${totalPages}`; info.dataset.page = String(page); }

  // bind actions
  tbody.querySelectorAll("button[data-action='edit']").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = String(e.currentTarget.dataset.id);
      const got = await ConditionService.getById(id, promoId);
      if (!got?.success) return alert(got?.error || "โหลดไม่สำเร็จ");
      const row = got.data;

      // fallback: ถ้า row.mode ไม่มี ให้พยายาม parse จาก condition_xml
      try {
        if (!row.mode && row.condition_xml) {
          let c = row.condition_xml;
          if (typeof c === "string" && c.trim()) {
            try { c = JSON.parse(c); } catch (err) { /* leave as-is if not JSON */ }
          }
          if (c && (c.mode === 'advance' || c.mode === 'basic')) {
            row.mode = c.mode;
          }
        }
      } catch (err) {
        console.warn('infer mode from condition_xml failed', err);
      }

      const useAdvance = String(row.mode) === "advance";

      // ensure savedConditionId is set so subsequent save will UPDATE not INSERT
      try { if (document.getElementById('savedConditionId')) document.getElementById('savedConditionId').value = row.id || ''; } catch(e){}

      // delegate populate to modules via event so both basic/advance flows are consistent
      try {
        const parsedCond = (row.condition_xml && typeof row.condition_xml === 'string') ? (() => { try { return JSON.parse(row.condition_xml); } catch(e) { return row.condition_xml; } })() : row.condition_xml;
        window.dispatchEvent(new CustomEvent('condition:populate', { detail: { row, condition_xml: parsedCond ?? null, mode: useAdvance ? 'advance' : 'basic' } }));
      } catch (err) {
        console.warn('dispatch condition:populate failed, falling back to local load', err);
        // fallback to previous behaviour
        switchToEditView(useAdvance ? "advance" : "basic");

        if (useAdvance) {
          let condXml = row.condition_xml;
          try { if (typeof condXml === "string") condXml = JSON.parse(condXml); } catch (e) {}
          initBlockly();
          try { workspace.clear(); } catch (e) {}
          if (condXml && condXml.workspace) {
            try { Blockly.serialization.workspaces.load(condXml.workspace, workspace); } catch (e) { console.warn('load workspace failed', e); }
            alert("โหลด workspace เสร็จ");
          } else if (typeof row.condition_xml === "string") {
            try {
              const dom = Blockly.Xml.textToDom(row.condition_xml);
              Blockly.Xml.domToWorkspace(dom, workspace);
              alert("โหลด workspace (legacy XML) เสร็จ");
            } catch (e) {
              console.warn('XML->workspace load failed', e);
            }
          } else {
            // ไม่มี workspace ให้แจ้งผู้ใช้ (หรือปล่อยว่างไว้)
            // alert("เงื่อนไขนี้ไม่มี workspace ที่โหลดได้");
          }
          if ($("#condition-form-name") && row.condition_name) $("#condition-form-name").value = row.condition_name;
        } else {
          if ($("#condition-form-name") && row.condition_name) $("#condition-form-name").value = row.condition_name;
          // ให้ Basic module handle การ populate form
          window.dispatchEvent(new CustomEvent("condition:basic:load", { detail: { compiled_dsl: row.condition_xml?.compiled_dsl ?? null, raw: row } }));
        }
      }
    });
  });


  tbody.querySelectorAll("button[data-action='del']").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!confirm("ลบเงื่อนไขนี้?")) return;
      btn.disabled = true;
      try{
        const res = await ConditionService.delete(id);
        if (res && res.success) {
          alert("บันทึกสำเร็จ 🎉");

          // --- ทำให้ refresh เหมือนกรณีลบ: พยายามเรียก loadConditionsForCard (ถ้ามี) แล้ว fallback เป็น bootstrap-table refresh ---
          try {
            // promotion id ที่เราบันทึก
            const promo = Number(promoId);

            // try to extract saved condition id (optional)
            const savedId = (res.data && res.data.id) || res.id || res.saved_id || null;

            // if there's a global helper to reload conditions for a card, prefer that (same as delete flow)
            if (typeof window.loadConditionsForCard === 'function') {
              // third arg: optional card element — we don't have card reference here, pass null
              try { window.loadConditionsForCard(promo, { page: 1 }, null); } catch (e) { console.warn('loadConditionsForCard failed', e); }
            } else if (typeof loadConditionsForCard === 'function') {
              try { loadConditionsForCard(promo, { page: 1 }, null); } catch (e) { console.warn('loadConditionsForCard (local) failed', e); }
            } else {
              // fallback: refresh bootstrap-table directly for that promo (if exists)
              try {
                const $t = window.jQuery && window.jQuery(`#conditionsListTable-${promo}`);
                if ($t && $t.data && $t.data('bootstrap.table')) {
                  $t.bootstrapTable('refresh');
                } else {
                  // If table not init yet, dispatch event so generateCard.js can handle retry/refesh
                  window.dispatchEvent(new CustomEvent('condition:saved', { detail: { promotion_id: promo, condition_id: savedId } }));
                }
              } catch (e) {
                console.warn('direct table refresh failed', e);
                // ensure downstream modules know: dispatch event as last resort
                try {
                  window.dispatchEvent(new CustomEvent('condition:saved', { detail: { promotion_id: promo, condition_id: savedId } }));
                } catch (ee) { console.warn('dispatch fallback failed', ee); }
              }
            }
          } catch (errRefresh) {
            console.warn('post-save refresh error', errRefresh);
          }

          // then continue UI workflow
          switchToListView();
          try { await refreshList(); } catch(e){ /* ignore */ }
          hideOverlay();
        } else {
          alert("บันทึกล้มเหลว: " + (res?.error || "unknown"));
        }

      }catch(err){
        console.error('delete error', err);
        alert('ลบล้มเหลว: ' + (err.message || err));
      } finally { btn.disabled = false; }
    });
  });

  paginationInfo && (paginationInfo.textContent = `Page ${pageState.page} / ${pageState.total_pages}`);
}

/* -----------------------
   View switcher + header buttons (kept as before)
   ----------------------- */
function switchToListView() {
  $("#condition-list-view")?.classList.remove("d-none");
  $("#condition-edit-view")?.classList.remove("d-none");
}

function switchToEditView(mode = "advance") {
  $("#condition-list-view")?.classList.add("d-none");
  $("#condition-edit-view")?.classList.remove("d-none");

  $all("#conditionTab .nav-link").forEach(tab => {
    tab.classList.remove("active");
    const target = $(tab.dataset.target);
    if (target) target.style.display = "none";
  });

  const targetTab = $(`#conditionTab .nav-link[data-target="#${mode}-content"]`);
  if (targetTab) {
    targetTab.classList.add("active");
    const el = $(`#${mode}-content`);
    if (el) el.style.display = (mode === "advance" ? "flex" : "block");
    if (mode === "advance") initBlockly();
  }
}

function bindHeaderButtons() {
  $("#btn-create-condition")?.addEventListener("click", () => {
    switchToEditView("basic");   // เปิด BASIC เป็น default
    try { workspace && workspace.clear(); } catch {}
    if ($("#condition-form-name")) $("#condition-form-name").value = "";
  });

  $("#btn-close-condition")?.addEventListener("click", () => {
    $("#condition-overlay")?.classList.add("d-none");
  });

  $("#btn-save-condition")?.addEventListener("click", (e) => {
    console.log("Save advanced")
    // Prevent default form submission so we only run our JS save logic once
    e.preventDefault();

    const advanceVisible = $(`#advance-content`) && $(`#advance-content`).style.display !== "none";
    if (advanceVisible) {
      onSaveAdvance();
    } else {
      // dispatch custom event handled by ConditionForm (submit)
      console.log("ปิด overlay")
    }
  });


  // Tabs click
  $all("#conditionTab .nav-link").forEach(tab => {
    tab.addEventListener("click", (ev) => {
      ev.preventDefault();
      const mode = (tab.dataset.target === "#advance-content") ? "advance" : "basic";
      switchToEditView(mode);
    });
  });

  // Search / paging
  $("#conditionSearch")?.addEventListener("input", refreshList);
  $("#perPageSelect")?.addEventListener("change", () => { $("#paginationInfo").dataset.page = "1"; refreshList(); });
  $("#btn-prev-page")?.addEventListener("click", () => {
    const info = $("#paginationInfo"); if (!info) return; info.dataset.page = String(Math.max(1, Number(info.dataset.page || 1) - 1)); refreshList();
  });
  $("#btn-next-page")?.addEventListener("click", () => {
    const info = $("#paginationInfo"); if (!info) return; info.dataset.page = String(Number(info.dataset.page || 1) + 1); refreshList();
  });
}

/* -----------------------
   Basic form -> compiled DSL mapper (kept as before but improved product id handling)
   ----------------------- */
// replace basicFormToAdvanceWorkspace with this implementation
export function basicFormToAdvanceWorkspace() {
  const container = document.getElementById("conditionsContainer");
  if (!container) return { mode: "basic", workspace: { blocks: { languageVersion: 0, blocks: [] } }, compiled_dsl: { meta: {}, rules: [] }, saved_at: (new Date()).toISOString() };

  const makeBlock = (type, props = {}) => {
    const b = { type, id: props.id || (type + "_" + Math.random().toString(36).slice(2,8)) };
    if (props.fields) b.fields = props.fields;
    if (props.inputs) b.inputs = props.inputs;
    if (props.next) b.next = props.next;
    return b;
  };

  const items = Array.from(container.querySelectorAll(".condition-item"));
  if (!items.length) return { mode: "basic", workspace: { blocks: { languageVersion: 0, blocks: [] } }, compiled_dsl: { meta: {}, rules: [] }, saved_at: (new Date()).toISOString() };

  const topBlocks = [];
  const compiledRules = [];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const action = it.querySelector(".condition-form-action")?.value || '';
    const objectKind = it.querySelector(".condition-form-object")?.value || '';
    const comparator = it.querySelector(".comparatorSelect")?.value || '';
    const value = it.querySelector(".valueInput")?.value || '';
    const unit = it.querySelector(".unitSelect")?.value || '';

    // product id for condition (may be CSV)
    const productIdRaw = it.querySelector(".selectedProductId_condition")?.value || '';
    const productIds = String(productIdRaw || '').split(',').map(s=>s.trim()).filter(Boolean);
    const productIdFirst = productIds[0] || '';

    // build action/object blocks
    const objectBlockFields = { LABEL: "สินค้า" };
    if (productIds.length > 0) {
      // include array of ids for more fidelity
      objectBlockFields.PRODUCT_IDS = productIds.map(String);
      // also keep PRODUCT_SELECT for backward compatibility (first item)
      objectBlockFields.PRODUCT_SELECT = productIdFirst || objectKind || "";
    } else {
      objectBlockFields.PRODUCT_SELECT = objectKind || "";
    }

    const objectBlock = makeBlock("object_" + (objectKind || "product"), {
      fields: objectBlockFields
    });
    const actionBlock = makeBlock("action_" + (action || "buy"), {
      inputs: { OBJECT: { block: objectBlock } }
    });

    const valueBlock = makeBlock("Value_Unit", { fields: { Value: Number(value || 0), Unit: unit || '' } });

    const compareBlock = makeBlock("logic_compare", {
      fields: { OP: comparator || '' },
      inputs: { A: { block: actionBlock }, B: { block: valueBlock } }
    });

    // process rewards (can be multiple)
    const rewardItems = Array.from(it.querySelectorAll(".reward-item"));
    let rewardChainTop = null;
    let prevRewardBlock = null;
    const compiledRewardsArray = []; // for compiled_dsl.then.rewards

    for (const r of rewardItems) {
      const rAction = r.querySelector(".condition-form-reward-action")?.value || '';
      const rObject = r.querySelector(".condition-form-reward-object")?.value || '';
      const rValue = r.querySelector(".rewardValueInput")?.value || '';
      const rUnit = r.querySelector(".rewardUnitSelect")?.value || '';
      const rProductIdRaw = r.querySelector(".selectedProductId_reward")?.value || '';
      const rProductIds = String(rProductIdRaw || '').split(',').map(s=>s.trim()).filter(Boolean);
      const rProductIdFirst = rProductIds[0] || '';

      // left block (reward metadata)
      const leftBlock = makeBlock("reward_" + (rAction || "discount"), {
        fields: { TARGET: rObject || '' }
      });

      // if reward object indicates product, attach object_product with PRODUCT_IDS when available
      if (rObject && String(rObject).toLowerCase() === 'product' && rProductIds.length) {
        leftBlock.inputs = leftBlock.inputs || {};
        leftBlock.inputs[ (rAction && rAction.toLowerCase().includes('gift')) ? "ITEM_INPUT" : "PRODUCT_INPUT" ] = {
          block: makeBlock("object_product", { fields: { LABEL: "สินค้า", PRODUCT_IDS: rProductIds.map(String), PRODUCT_SELECT: rProductIdFirst } })
        };
      }

      // right side: Value_Unit
      const rightBlock = makeBlock("Value_Unit", { fields: { Value: Number(rValue || 0) || 0, Unit: rUnit || '' } });

      const rewardBlock = makeBlock("reward_block", { inputs: { LEFT: { block: leftBlock }, RIGHT: { block: rightBlock } } });

      if (!rewardChainTop) rewardChainTop = rewardBlock;
      if (prevRewardBlock) prevRewardBlock.next = { block: rewardBlock };
      prevRewardBlock = rewardBlock;

      // compiled representation for this reward
      const compiledLeft = { type: "REWARD", subtype: String(rAction || ''), target: String(rObject || '') };
      if (rProductIds.length) compiledLeft.product_ids = rProductIds.map(String);
      if (rProductIdFirst) compiledLeft.product = String(rProductIdFirst);
      const compiledRight = { type: "VALUE_UNIT", value: Number(rValue || 0) || 0, unit: String(rUnit || '') };
      compiledRewardsArray.push({ left: compiledLeft, right: compiledRight });
    }

    const controlsIf = makeBlock("controls_if", { inputs: { IF0: { block: compareBlock }, DO0: { block: rewardChainTop } } });

    if (topBlocks.length > 0) {
      const prev = topBlocks[topBlocks.length - 1];
      prev.next = { block: controlsIf };
    }
    topBlocks.push(controlsIf);

    // build compiled rule branch
    const branchCond = {
      type: "COMPARE",
      op: comparator || '',
      A: { type: "ACTION", action: String(action || ''), object: { type: "OBJECT", kind: String(objectKind || ''), product_ids: productIds.length ? productIds.map(String) : [], product: productIdFirst || '' } },
      B: { type: "VALUE_UNIT", value: Number(value || 0) || 0, unit: String(unit || '') }
    };

    let thenNode = null;
    if (compiledRewardsArray.length) {
      // normalize into then.rewards array
      thenNode = { type: "REWARD_BLOCK", rewards: compiledRewardsArray.map(rr => ({ left: rr.left, right: rr.right })) };
    } else {
      thenNode = null;
    }

    compiledRules.push({ type: "IF", branches: [ { cond: branchCond, then: thenNode } ] });
  }

  const workspaceJson = { blocks: { languageVersion: 0, blocks: topBlocks } };
  const compiledDsl = { meta: { generated_at: (new Date()).toISOString(), generated_by: "basic-mapper-v1" }, rules: compiledRules };

  return {
    mode: "basic",
    workspace: workspaceJson,
    compiled_dsl: compiledDsl,
    saved_at: (new Date()).toISOString()
  };
}

// Handler to save basic form as Advance-structured condition (calls ConditionService.insert)
export async function onBasicSaveAsAdvance() {
  // Keep for backward compatibility but prefer form submit (ConditionForm will handle validation and save)
  // If called directly, we emulate form submit to ensure validation happens.
  const f = document.getElementById('condition-form');
  if (f) {
    if (typeof f.requestSubmit === 'function') f.requestSubmit();
    else f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return;
  }

  // else fallback to old behavior (not recommended)
  alert('Cannot save: form not found');
}

/* -----------------------
   List view (kept as before)
   ----------------------- */
let pageState = { page: 1, per_page: 20, total_pages: 1, q: '' };
async function refreshListPublic() {
  await refreshList();
}
export { refreshListPublic as refreshList };

/* -----------------------
   View switcher + header bindings export
   ----------------------- */
export function initAdvanceCondition() {
  switchToListView();
  refreshList();
  bindHeaderButtons();
}

// auto-init when DOM ready if modal exists
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("condition-overlay")) {
    try { initAdvanceCondition(); } catch (e) { console.warn("initAdvanceCondition failed:", e); }
  }
});

/* -----------------------
   Mutator: reward_discount (fixed)
   ----------------------- */
Blockly.Extensions.registerMutator(
  'reward_discount_mutator',
  {
    mutationToDom: function() {
      const container = Blockly.utils.xml.createElement('mutation');
      const target = this.getFieldValue('TARGET');
      container.setAttribute('target', target);
      return container;
    },
    domToMutation: function(xmlElement) {
      const target = xmlElement.getAttribute('target');
      this.updateShape_(target);
    },
    updateShape_: function(target) {
      // Ensure inputs are inline
      try { this.setInputsInline(true); } catch (e) { /* ignore */ }

      if (this.getInput('PRODUCT_INPUT')) {
        this.removeInput('PRODUCT_INPUT');
      }
      if (target === 'PRODUCT') {
        // append inline product input (label + value)
        this.appendValueInput('PRODUCT_INPUT')
          .setCheck('Object')
          .appendField('เป็นสินค้า');
        try { this.setInputsInline(true); } catch (e) {}
      }
    }
  },
  function() {
    try { this.setInputsInline(true); } catch (e) {}
    const field = this.getField('TARGET');
    if (field) {
      field.setValidator((option) => {
        try { this.updateShape_(option); } catch (e) { /* ignore */ }
        return option;
      });
      try { this.updateShape_(this.getFieldValue('TARGET')); } catch (e) {}
    }
  }
);

/* -----------------------
   Mutator: reward_gift (fixed)
   ----------------------- */
Blockly.Extensions.registerMutator(
  'reward_gift_mutator',
  {
    mutationToDom: function() {
      const container = Blockly.utils.xml.createElement('mutation');
      const target = this.getFieldValue('TARGET');
      container.setAttribute('target', target);
      return container;
    },
    domToMutation: function(xmlElement) {
      const target = xmlElement.getAttribute('target');
      this.updateShape_(target);
    },
    updateShape_: function(target) {
      try { this.setInputsInline(true); } catch (e) { /* ignore */ }

      if (this.getInput('ITEM_INPUT')) {
        this.removeInput('ITEM_INPUT');
      }
      if (target === 'PRODUCT') {
        this.appendValueInput('ITEM_INPUT')
          .setCheck('Object')
          .appendField('คือสินค้า');
        try { this.setInputsInline(true); } catch (e) {}
      }
    }
  },
  function() {
    try { this.setInputsInline(true); } catch (e) {}
    const field = this.getField('TARGET');
    if (field) {
      field.setValidator((option) => {
        try { this.updateShape_(option); } catch (e) { /* ignore */ }
        return option;
      });
      try { this.updateShape_(this.getFieldValue('TARGET')); } catch (e) {}
    }
  }
);

// --- เพิ่ม getter: ดึงค่าเชิงตัวเลขจาก reward (ใช้ถ้าต้องการแยก semantic) ---
Blockly.Blocks['reward_value_of'] = {
  init: function() {
    this.appendValueInput('REWARD').setCheck('RewardType').appendField('ค่าของ');
    this.setOutput(true, ['Number','ValueUnit']);
    this.setColour(200);
  }
};

/* -----------------------
   Utility: wait for block to exist, then callback
   ----------------------- */
function extendLogicCompareWhenReady(cb) {
  // poll until Blockly.Blocks['logic_compare'] is defined
  let attempts = 0;
  const maxAttempts = 60;
  const iv = setInterval(() => {
    attempts++;
    try {
      if (window.Blockly && Blockly.Blocks && Blockly.Blocks['logic_compare']) {
        clearInterval(iv);
        try { patchLogicCompare(); } catch (e) { console.warn('patchLogicCompare error', e); }
        if (typeof cb === 'function') cb();
      } else if (attempts >= maxAttempts) {
        clearInterval(iv);
        console.warn('extendLogicCompareWhenReady: logic_compare not found after timeout');
        if (typeof cb === 'function') cb(); // still call cb to continue
      }
    } catch (e) {
      clearInterval(iv);
      console.warn('extendLogicCompareWhenReady unexpected error', e);
      if (typeof cb === 'function') cb();
    }
  }, 100);
}

/* -----------------------
   Patch logic_compare safely
   - Wrap original init and extend setCheck for inputs A/B
   ----------------------- */
function patchLogicCompare() {
  if (!Blockly || !Blockly.Blocks || !Blockly.Blocks['logic_compare']) return;
  const blk = Blockly.Blocks['logic_compare'];
  if (blk._patchedForReward) return;
  blk._patchedForReward = true;

  const origInit = blk.init;
  blk.init = function() {
    if (typeof origInit === 'function') {
      try { origInit.call(this); } catch (e) { console.warn('origInit call failed', e); }
    }
    // extend allowed checks
    try {
      const allowed = ['Number','ValueUnit','RewardType'];
      const inA = this.getInput('A');
      const inB = this.getInput('B');
      if (inA && inA.connection) inA.connection.setCheck(allowed);
      if (inB && inB.connection) inB.connection.setCheck(allowed);
    } catch (e) { console.warn('patchLogicCompare setCheck failed', e); }
  };
}


// This prevents direct bypass of validation by calling onBasicSaveAsAdvance.
window.addEventListener("condition:basic:save", (ev) => {
  const f = document.getElementById('condition-form');
  if (f) {
    if (typeof f.requestSubmit === 'function') f.requestSubmit();
    else f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  } else {
    try { onBasicSaveAsAdvance(); } catch (e) {}
  }
});