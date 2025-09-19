import { API } from "../../../assets/js/api.js";
import { FormHelper } from "/myPromotion/src/assets/js/formHelper.js";
import { goToPromotionPage } from "/myPromotion/src/assets/js/navigationUtils.js"; 
import { showAlert} from '/myPromotion/src/assets/js/alertUtil.js';
import { getOptions } from '/myPromotion/src/assets/js/store/optionsStore.js';
import { getCampaignData } from "../../../assets/js/store/campaignDataStore.js";

function isPromotionPage() {
  return window.location.pathname.includes("promotion.php");
}

let options = null;

const urlParams = new URLSearchParams(window.location.search);
let campaign_id = urlParams.get('id');

document.addEventListener("DOMContentLoaded", async () => {
  options = await getOptions();

  
  if (options && campaign_id) {
    console.log(options)
    console.log(campaign_id)
    putOption()
    bindEvents()
  }
});

function putOption() {
  const typeSelect = FormHelper.generateOptions(options.promotionType);
  const targetSelect = FormHelper.generateOptions(options.promotionTarget);

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
    placeholder: "เลือกสิทธ์เข้าใช้งาน",
    allowClear: true,
    theme: 'bootstrap-5',
  });

}

function bindEvents() {
  console.log("Promotion bind")

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
  
  // เมื่อปุ่ม สร้างกิจกรรมถูก Click
  document.getElementById("btn-create-promotion").addEventListener("click", () => {
  const formData = {
    name: document.getElementById("form-name").value,
    code: document.getElementById("form-code").value,
    status: "2",
    description: document.getElementById("form-description").value,
    type: document.getElementById("form-type").value,
    target: document.getElementById("form-target").value,
    begin: document.getElementById("form-begin").value,
    end: document.getElementById("form-end").value,
    location: document.getElementById("form-location").value,
    note: document.getElementById("form-note").value,
    campaign_id: campaign_id
  };

  API.insertPromotion(formData)
    .then((res) => {
      if (res.success) {
        showAlert("สร้างกิจกรรมแล้ว ","success");
        if(isPromotionPage()){
          goToPromotionPage(campaign_id)
        }else {
          showAlert("ไม่ได้อยู่ในหน้า promotion.php","danger")
        }
      } else {
        showAlert("ล้มเหลว: " + res.message,"danger");
      }
    })
    .catch((err) => {
      console.error("Error response from PHP:", err);
      showAlert("ล้มเหลว: " + err,"danger");
    });
  });
}

function generateAutoCode() {
  const prefix = "PROMO";
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const rand = Math.floor(Math.random()*10000).toString().padStart(4,"0");
  return `${prefix}-${datePart}-${rand}`;
}
