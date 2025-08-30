import { API } from "/myPromotion/src/assets/js/api.js";
import { CampaignCard } from "/myPromotion/src/components/card/generateCard.js";
import { modalCampaign } from "/myPromotion/src/components/modal/CreateCampaign/modalCreateCampaign.js";
import { modalPromotion } from "/myPromotion/src/components/modal/CreatePromotion/modalCreatePromotion.js";
import { generateModalSelectStatus } from "/myPromotion/src/components/modal/SelectStatus/generateModalSelectStatus.js";
import { highlightCurrentStatus } from "/myPromotion/src/components/modal/SelectStatus/highlightCurrentStatus.js"; 
import { CardEditController } from "/myPromotion/src/components/card/CardEditor.js";
import { setOptions } from "/myPromotion/src/assets/js/store/optionsStore.js";
import { filterFunction } from "/myPromotion/src/assets/js/filterUtils.js";


function isPromotionPage() {
  return window.location.pathname.includes("promotion");
}

document.addEventListener("DOMContentLoaded", async () => {
  const defaultOptions = {
    enableTime: true,
    dateFormat: "Y-m-d H:i:S", // format ที่ส่งไป DB
    altInput: true, // ช่องแสดงผลอีกช่องให้ user เห็น
    altFormat: "d/m/Y H:i:S น.", // format ที่ user เห็น
    locale: "th",
    time_24hr: true,
    defaultHour: 0,
    enableSeconds: true,
    allowInput: true
  };


  // แก้ไขได้
  flatpickr(".date-picker", defaultOptions);

  // แก้ไขไม่ได้
  flatpickr(".date-picker-disabled", {
    ...defaultOptions,
    clickOpens: false, // ปิดการเปิดปฏิทิน
    allowInput: false  // ห้ามพิมพ์
  });

  try {
    const container = document.querySelector(".card-container");
    const options = await API.getFormOptions();
    const campaignData = await API.getCampaigns();



    const modalSelectStatus = new generateModalSelectStatus(options.status);
    // const updateCardAppearance = new updateCardAppearance(options.status);
    let modalCreate;
    if (isPromotionPage()) {
      const urlParams = new URLSearchParams(window.location.search);
      const campaignId = urlParams.get('id');
      if (document.getElementById("btn-create-promotion")) {
        modalCreate = new modalPromotion(options.promotionType, options.promotionTarget, campaignId);
      }
    } else if (!isPromotionPage()) {
      if (document.getElementById("btn-create-campaign")) {
        modalCreate = new modalCampaign(options.type, options.target);
      }
    }

if (modalCreate) {
  modalCreate.putOption();
  modalCreate.bindEvents();
}

    modalSelectStatus.generateButton(options.status);

    setOptions(options);
    // Event modal status
    document.getElementById("statusModal").addEventListener("show.bs.modal", () => {
      highlightCurrentStatus(options.status);
    });
  } catch (err) {
    console.error("โหลดข้อมูลล้มเหลว:", err);
  }
});