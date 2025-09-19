import { API } from "../../../assets/js/api.js";
import { FormHelper } from "/myPromotion/src/assets/js/formHelper.js";
import { goToPromotionPage } from "/myPromotion/src/assets/js/navigationUtils.js"; 
import { showAlert} from '/myPromotion/src/assets/js/alertUtil.js'
import { getOptions } from '/myPromotion/src/assets/js/store/optionsStore.js';


function isPromotionPage() {
  return window.location.pathname.includes("promotion.php");
}

let options = null;

document.addEventListener("DOMContentLoaded", async () => {
  options = await getOptions();
  if (options) {
    console.log(options)
    putOption()
    bindEvents()
  }
});


function putOption() {
  const typeSelect = FormHelper.generateOptions(options.type);
  const targetSelect = FormHelper.generateOptions(options.target);

  const typeEl = document.getElementById("form-type");
  const targetEl = document.getElementById("form-target");

  typeEl.innerHTML = typeSelect;
  targetEl.innerHTML = targetSelect;

  $("#form-type").select2({
    width: '100%',
    dropdownParent: $('#my-form'),
    placeholder: "เลือกประเภท",
    allowClear: true,
    theme: 'bootstrap-5', 
  });

  $("#form-target").select2({
    width: '100%',
    dropdownParent: $('#my-form'),
    placeholder: "เลือกประเภท",
    allowClear: true,
    theme: 'bootstrap-5',
  });

}

function bindEvents() {
  console.log("Campaign bind")

  const codeInput = document.getElementById("form-code");
  const toggle = document.getElementById("auto-code-toggle");

  // --- toggle event ---
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      // ปิด input + generate code
      codeInput.disabled = true;
      codeInput.value = generateAutoCode();
    } else {
      // เปิด input ให้ user กรอกเอง
      codeInput.disabled = false;
      codeInput.value = "";
    }
  });

  // --- submit ---
  document.getElementById("btn-create-campaign").addEventListener("click", () => {
    const formData = {
      name: document.getElementById("form-name").value,
      code: codeInput.value, // ได้ทั้ง manual/auto
      status: "2",
      description: document.getElementById("form-description").value,
      type: document.getElementById("form-type").value,
      target: document.getElementById("form-target").value,
      begin: document.getElementById("form-begin").value,
      end: document.getElementById("form-end").value,
      location: document.getElementById("form-location").value,
      note: document.getElementById("form-note").value,
    };

    API.insertCampaign(formData)
      .then((res) => {
        if (res.success) {
          showAlert("สร้างกิจกรรมแล้ว ", "success");
          if (isPromotionPage()) {
            showAlert("ไม่พบไอดีหรือพบว่ากำลังอยู่ในหน้า promotion.php " + res.message,"danger")
          } else {
            if (res.id) {
              goToPromotionPage(res.id)
              showAlert("สร้างกิจกรรมสำเร็จ","success");
            }
          }
        } else {
          showAlert("เกิดข้อผิดพลาด " + res.message,"danger");
        }
      })
      .catch((err) => {
        console.error("Error response from PHP:", err);
        showAlert("ล้มเหลว: " + err,"danger");
      });
  });
}

function generateAutoCode() {
  const prefix = "CMP"; // หรือ PROMO ก็ได้
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const rand = Math.floor(Math.random()*10000).toString().padStart(4,"0");
  return `${prefix}-${datePart}-${rand}`;
}
