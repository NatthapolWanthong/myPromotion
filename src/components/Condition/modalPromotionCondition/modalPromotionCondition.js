import { API } from "/myPromotion/src/assets/js/api.js";
import { getOptions } from "/myPromotion/src/assets/js/store/optionsStore.js";
import { FormHelper } from "/myPromotion/src/assets/js/FormHelper.js";
import { ConditionBlockHelper } from "/myPromotion/src/assets/js/ConditionBlockHelper.js";


// -------------------------------
// Tab switch
// -------------------------------
document.querySelectorAll('#conditionTab .nonActive').forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const targetId = tab.getAttribute('data-target');

    if (targetId === '#advance-content') {
      const urlParams = new URLSearchParams(window.location.search);
      const promoId = urlParams.get('id');
      const redirectUrl = promoId 
          ? `/mypromotion/src/pages/advanceCondition/advanceCondition.php?id=${promoId}`
          : '/mypromotion/src/pages/advanceCondition/advanceCondition.php';
      window.location.href = redirectUrl;
      return;
    }

    document.querySelectorAll('#conditionTab .nav-link').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    document.querySelectorAll('.tab-content-container').forEach(c => c.classList.add('d-none'));
    const target = document.querySelector(targetId);
    if (target) target.classList.remove('d-none');
  });
});

// -------------------------------
// ปุ่มเปิด/ปิด overlay
// -------------------------------
document.body.addEventListener('click', e => {
  if (e.target.id === 'btn-open-condition') {
    document.getElementById('condition-overlay').classList.remove('d-none');
  }
  if (e.target.id === 'btn-close-condition') {
    document.getElementById('condition-overlay').classList.add('d-none');
  }
});

// -------------------------------
// Populate dropdowns
// -------------------------------
async function populateConditionForm() {
  const options = await getOptions();

  const toObj = (arr) => {
    const obj = {};
    arr.forEach(item => {
      obj[item.id] = item.th_name ?? item.name;
    });
    return obj;
  };

  const map = {
    "condition-form-action": toObj(options.conditionAction),
    "condition-form-object": toObj(options.conditionObject),
    "condition-form-reward-action": toObj(options.conditionRewardAction ?? [])
  };

  Object.entries(map).forEach(([cls, optObj]) => {
    document.querySelectorAll(`.${cls}`).forEach(selectEl => {
      // ใส่ placeholder ก่อน
      selectEl.innerHTML = `<option value="" selected disabled>-- กรุณาเลือก --</option>` 
                          + FormHelper.generateOptions(optObj, selectEl.value);
    });
  });

  // ต่อ event listener หลัง populate
  const objectSelect = document.getElementById("objectSelect");
  objectSelect.addEventListener("change", e => {
    const wrapper = document.getElementById("productSelectionWrapper");
    wrapper.classList.toggle("d-none", e.target.value !== "1");
  });
};


// -------------------------------
// Object = สินค้า → เปิด modal เลือกสินค้า
// -------------------------------
document.getElementById("objectSelect").addEventListener("change", e => {
  const wrapper = document.getElementById("productSelectionWrapper");
  if (e.target.value === "1") {
    wrapper.classList.remove("d-none");
  } else {
    wrapper.classList.add("d-none");
  }
});

document.getElementById("btn-open-product-modal").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("modalProductList"));
  modal.show();
});

// -------------------------------
// รับค่าจาก modalProductList
// -------------------------------
document.addEventListener("productSelected", e => {
  const { id, name } = e.detail;
  document.getElementById("selectedProductName").value = name;
  document.getElementById("selectedProductId").value = id;
});

// init
document.addEventListener("DOMContentLoaded", async() => {
  populateConditionForm();
});




function refreshConditionTable(blockJson) {
  const tbody = document.querySelector("#conditionTable tbody");
  tbody.innerHTML = `
    <tr>
      <td>${blockJson.fields.ACTION}</td>
      <td>${blockJson.fields.OBJECT}</td>
      <td>${blockJson.fields.PRODUCT_NAME || "-"}</td>
      <td>${blockJson.fields.COMPARATOR}</td>
      <td>${blockJson.fields.VALUE}</td>
      <td>${blockJson.fields.UNIT}</td>
      <td>${blockJson.fields.REWARD_ACTION} ${blockJson.fields.REWARD_VALUE} ${blockJson.fields.REWARD_UNIT}</td>
    </tr>
  `;
}

// -------------------------------
// Event binding
// -------------------------------
function bindConditionEvents() {
  const formEl = document.querySelector("#basic-content form");

  ["change", "input"].forEach(evt => {
    formEl.addEventListener(evt, () => {
      const blockJson = ConditionBlockHelper.updateHiddenInput(formEl);
      refreshConditionTable(blockJson);
    });
  });

  document.addEventListener("productSelected", () => {
    const blockJson = ConditionBlockHelper.updateHiddenInput(formEl);
    refreshConditionTable(blockJson);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await populateConditionForm();
  bindConditionEvents();


  // Insert Condition
  const form = document.querySelector("#basic-content form");
  form.addEventListener("submit", async (e) => {
    console.log("Submit Create Condition");

    e.preventDefault();

    const nameInput = document.getElementById("condition-form-name");
    const conditionName = nameInput.value.trim();

    if (!conditionName) {
      // คุณมี bootstrap validation อยู่แล้ว แต่ double-check
      nameInput.classList.add("is-invalid");
      return;
    }

    try {
      // เรียก API ใหม่ที่เราเพิ่ม
      const res = await API.insertCondition({ condition_name: conditionName });
      console.log("insertCondition response:", res);

      if (res && res.success) {
        // ตัวอย่าง: แสดงผล / เก็บ id ลง hidden field / ปิด overlay
        alert("บันทึกเงื่อนไขเรียบร้อย (id: " + res.id + ")");
        // ถ้าต้องการเก็บ id ใน form:
        const hiddenId = document.getElementById("savedConditionId");
        if (hiddenId) hiddenId.value = res.id;

        // ปิด overlay (optional)
        document.getElementById('condition-overlay').classList.add('d-none');
      } else {
        alert("เกิดข้อผิดพลาด: " + (res?.error || 'unknown'));
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถบันทึกได้ โปรดตรวจสอบ console");
    }
  });
});