import { API } from "/myPromotion/src/assets/js/api.js";
import { CampaignCard } from "/myPromotion/src/components/card/generateCard.js";


import { generateModalSelectStatus } from "/myPromotion/src/components/modal/SelectStatus/generateModalSelectStatus.js";
import { highlightCurrentStatus } from "/myPromotion/src/components/modal/SelectStatus/highlightCurrentStatus.js"; 
import { CardEditController } from "/myPromotion/src/components/card/CardEditor.js";
import { setOptions } from "/myPromotion/src/assets/js/store/optionsStore.js";
import { setCampaignData } from "/myPromotion/src/assets/js/store/campaignDataStore.js";
import { filterFunction } from "/myPromotion/src/assets/js/filterUtils.js";


function isPromotionPage() {
  return window.location.pathname.includes("promotion");
}

let container = null
let options = null
let campaignData = null

document.addEventListener("DOMContentLoaded", async () => {
  const defaultOptions = {
    enableTime: true,
    dateFormat: "Y-m-d H:i:S",
    altInput: true,
    altFormat: "d/m/Y H:i:S น.",
    locale: "th",
    time_24hr: true,
    defaultHour: 0,
    enableSeconds: true,
    allowInput: true
  };
  flatpickr(".date-picker", defaultOptions);
  flatpickr(".date-picker-disabled", { ...defaultOptions, clickOpens: false, allowInput: false });


  try {
    container = document.querySelector(".card-container");
    options = await API.getFormOptions();
    campaignData = await API.getCampaigns();



    const modalSelectStatus = new generateModalSelectStatus(options.status);
    // const updateCardAppearance = new updateCardAppearance(options.status);
    // let modalCreate;
    // if (isPromotionPage()) {
    //   const urlParams = new URLSearchParams(window.location.search);
    //   const campaignId = urlParams.get('id');
    //   if (document.getElementById("btn-create-promotion")) {
    //     import { modalPromotion } from "/myPromotion/src/components/modal/CreatePromotion/modalCreatePromotion.js";
    //     modalCreate = new modalPromotion(options.promotionType, options.promotionTarget, campaignId);
    //     if (modalCreate) {
    //       modalCreate.putOption();
    //       modalCreate.bindEvents();
    //     }
    //   }
    // } else if (!isPromotionPage()) {
    //   if (document.getElementById("btn-create-campaign")) {
    //     import { modalCampaign } from "/myPromotion/src/components/modal/CreateCampaign/modalCreateCampaign.js";
    //     modalCreate = new modalCampaign(options.type, options.target);
    //     if (modalCreate) {
    //       modalCreate.putOption();
    //       modalCreate.bindEvents();
    //     }
    //   }
    // }

    modalSelectStatus.generateButton(options.status);

    setOptions(options);
    setCampaignData(campaignData);
    // Event modal status
    document.getElementById("statusModal").addEventListener("show.bs.modal", () => {
      highlightCurrentStatus(options.status);
    });
  } catch (err) {
    console.error("โหลดข้อมูลล้มเหลว:", err);
  }
  
});