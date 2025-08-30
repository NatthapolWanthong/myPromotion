// -------------------------------
// Tab switch: Basic / Advance
// -------------------------------
document.querySelectorAll('#conditionTab .nonActive').forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const targetId = tab.getAttribute('data-target');

    if (targetId === '#basic-content') {
      // ดึง id ของโปรโมชั่นจาก URL ปัจจุบัน
      const urlParams = new URLSearchParams(window.location.search);
      const promoId = urlParams.get('id');

      // ถ้ามี promoId ให้ต่อ id และบอกให้เปิด overlay
      const redirectUrl = promoId
        ? `http://localhost/mypromotion/src/pages/promotion/promotion.php?id=${promoId}&showOverlay=1`
        : `http://localhost/mypromotion/src/pages/promotion/promotion.php?showOverlay=1`;

      window.location.href = redirectUrl;
      return;
    }
  });
});

// -------------------------------
// ปุ่มปิด
// -------------------------------
const closeBtn = document.getElementById('btn-close-condition');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    // ดึง id ของโปรโมชั่นจาก URL ปัจจุบัน
    const urlParams = new URLSearchParams(window.location.search);
    const promoId = urlParams.get('id');

    // กลับไปหน้า promotion หลัก พร้อม id
    const redirectUrl = promoId
      ? `http://localhost/mypromotion/src/pages/promotion/promotion.php?id=${promoId}`
      : 'http://localhost/mypromotion/src/pages/promotion/promotion.php';

    window.location.href = redirectUrl;
  });
}

// -------------------------------
// Blockly setup
// -------------------------------
const toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "Action Block",
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
      "name": "Object Type Block",
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
      "name": "Reward Object Type Block",
      "colour": "#A65C81",
      "contents": [
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
        { "kind": "block", "type": "logic_negate" },
        { "kind": "block", "type": "logic_boolean" }
      ]
    },
    {
      "kind": "category",
      "name": "Math",
      "colour": "#5CA6A6",
      "contents": [
        { "kind": "block", "type": "math_number" },
        { "kind": "block", "type": "math_arithmetic" },
        { "kind": "block", "type": "math_random_int" },
        { "kind": "block", "type": "math_round" },
        { "kind": "block", "type": "math_conversion" }
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

  // ---------------- Action Blocks ----------------
  {
    "type": "action_buy",
    "message0": "ซื้อ %1",
    "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }],
    "output": "Number",
    "colour": 160
  },
  { "type": "action_cheer", "message0": "เชียร์ %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "Number", "colour": 160 },
  { "type": "action_display", "message0": "จัดแสดง %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "Number", "colour": 160 },
  { "type": "action_join", "message0": "เข้าร่วม %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "Number", "colour": 160 },
  { "type": "action_accumulate", "message0": "สะสมยอด %1", "args0": [{ "type": "input_value", "name": "OBJECT", "check": "Object" }], "output": "Number", "colour": 160 },

  // ---------------- Object Blocks ----------------
  { "type": "object_product", "message0": "สินค้า", "output": "Object", "colour": 230 },
  { "type": "object_customer", "message0": "ลูกค้า", "output": "Object", "colour": 230 },
  { "type": "object_promotion", "message0": "โปรโมชั่น", "output": "Object", "colour": 230 },
  { "type": "object_event", "message0": "กิจกรรม", "output": "Object", "colour": 230 },

  // ---------------- Reward Blocks ----------------
  {
    "type": "reward_block",
    "message0": "ผลตอบแทน %1 จำนวน %2",
    "args0": [
      { "type": "input_value", "name": "REWARD", "check": "RewardType" },
      { "type": "input_value", "name": "AMOUNT", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20
  },
  {
    "type": "reward_discount",
    "message0": "ส่วนลด %1",
    "args0": [{ "type": "input_value", "name": "AMOUNT", "check": "Number" }],
    "output": "RewardType",
    "colour": 290
  },
  {
    "type": "reward_gift",
    "message0": "ของแถม %1",
    "args0": [{ "type": "input_value", "name": "ITEM", "check": "Object" }],
    "output": "RewardType",
    "colour": 290
  },
  {
    "type": "reward_point",
    "message0": "คะแนน %1",
    "args0": [{ "type": "input_value", "name": "POINTS", "check": "Number" }],
    "output": "RewardType",
    "colour": 290
  },
  {
    "type": "math_conversion",
    "message0": "แปลงค่า %1 เป็น %2",
    "args0": [
      { "type": "input_value", "name": "INPUT", "check": "Number" },
      { "type": "field_dropdown", "name": "UNIT", "options": [
          ["บาท → point", "THB_TO_POINT"],
          ["point → บาท", "POINT_TO_THB"]
      ]}
    ],
    "output": "Number",
    "colour": 230
  }
]);


// -------------------------------
// DSL Compiler
// -------------------------------
function compileToDSL(workspace) {
  const result = [];
  const blocks = workspace.getTopBlocks(true);
  blocks.forEach(b => {
    result.push(blockToNode(b));
  });
  return result;
}

function blockToNode(block) {
  if (!block) return null;

  switch (block.type) {
    case "action_buy": return { type: "BUY", object: blockToNode(block.getInputTargetBlock("OBJECT")) };
    case "action_cheer": return { type: "CHEER", object: blockToNode(block.getInputTargetBlock("OBJECT")) };
    case "action_display": return { type: "DISPLAY", object: blockToNode(block.getInputTargetBlock("OBJECT")) };
    case "action_join": return { type: "JOIN", object: blockToNode(block.getInputTargetBlock("OBJECT")) };
    case "action_accumulate": return { type: "ACCUMULATE", object: blockToNode(block.getInputTargetBlock("OBJECT")) };

    case "object_product": return { type: "OBJECT", value: "PRODUCT" };
    case "object_customer": return { type: "OBJECT", value: "CUSTOMER" };
    case "object_promotion": return { type: "OBJECT", value: "PROMOTION" };
    case "object_event": return { type: "OBJECT", value: "EVENT" };

    case "reward_block": return { type: "REWARD", reward: blockToNode(block.getInputTargetBlock("REWARD")), amount: blockToNode(block.getInputTargetBlock("AMOUNT")) };
    case "reward_discount": return { type: "DISCOUNT", amount: blockToNode(block.getInputTargetBlock("AMOUNT")) };
    case "reward_gift": return { type: "GIFT", item: blockToNode(block.getInputTargetBlock("ITEM")) };
    case "reward_point": return { type: "POINT", points: blockToNode(block.getInputTargetBlock("POINTS")) };

    case "controls_if":
      return { type: "IF", condition: blockToNode(block.getInputTargetBlock("IF0")), action: blockToNode(block.getInputTargetBlock("DO0")) };
    case "logic_compare":
      return { type: "COMPARE", op: block.getFieldValue("OP"), A: blockToNode(block.getInputTargetBlock("A")), B: blockToNode(block.getInputTargetBlock("B")) };

    default:
      return null;
  }
}

function previewDSL(workspace) {
  console.log(JSON.stringify(compileToDSL(workspace), null, 2));
}

function validateWorkspace(workspace) {
  const hasIf = workspace.getAllBlocks(false).some(b => b.type === 'controls_if');
  const hasReward = workspace.getAllBlocks(false).some(b => b.type === 'reward_block');
  alert((hasIf && hasReward) ? 'OK' : 'ยังไม่ครบ If + Reward');
}

// SAVE
async function savePromotion(promoId) {
  const state = Blockly.serialization.workspaces.save(workspace);
  const compiled = compileToDSL(workspace);
  await fetch('/api/promo/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promoId, workspace_json: state, compiled_dsl_json: compiled })
  });
}

// LOAD
async function loadPromotion(promoId) {
  const res = await fetch(`/api/promo/${promoId}`);
  const data = await res.json();
  workspace.clear();
  if (data.workspace_json) {
    Blockly.serialization.workspaces.load(data.workspace_json, workspace);
  }
}

const workspace = Blockly.inject('blocklyDiv', {
  toolbox,
  trashcan: true,
  grid: { spacing: 20, length: 1, colour: '#ddd', snap: true },
  zoom: { controls: true, wheel: true },
  media: 'https://unpkg.com/blockly/media/'
});

// ปุ่มใน Toolbox
workspace.registerButtonCallback('validateRules', () => validateWorkspace(workspace));
workspace.registerButtonCallback('previewDSL', () => previewDSL(workspace));
