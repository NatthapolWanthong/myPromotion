import { API } from '/myPromotion/src/assets/js/api.js';
import { FormHelper } from "/myPromotion/src/assets/js/formHelper.js";
import { MainStatusData } from "/myPromotion/src/config.js";
import { getOptions } from '/myPromotion/src/assets/js/store/optionsStore.js';
import { CardEditController } from '/MyPromotion/src/components/card/CardEditor.js';

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".campaignEditorContainer");
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const options = await getOptions();
  const StatusData = options.status
  let originalValuesMap = new Map();

  if (!campaignId) {
    console.error("No campaign ID found in URL");
    return;
  }

  
  try {
    const campaign = await API.getCampaignById(campaignId);
    console.log("Campaign Data:", campaign);
    const typeOptions = options.type;
    const targetOptions = options.target;
    
    if (campaign) {
      container.dataset.id = campaign.id;
      
      const CampaignStatus = StatusData[campaign.status - 1];
      const MainStatus = MainStatusData(CampaignStatus.id_main);

      console.log(CampaignStatus)
      container.dataset.id_main = CampaignStatus.id_main;
      container.dataset.status = CampaignStatus.id;

      originalValuesMap.set(campaign.id, JSON.parse(JSON.stringify(campaign)));

      // ===================================== Update =====================================
      document.querySelector('[data-field="form-name"]').textContent = campaign.name;
      document.querySelector('[data-field="form-code"]').textContent = campaign.code;
      document.querySelector('[data-field="form-description"]').value = campaign.description || '';

      const typeSelect = FormHelper.generateOptions(typeOptions, campaign.type);
      const targetSelect = FormHelper.generateOptions(targetOptions, campaign.target);
      const typeInput = document.querySelector('[data-field="form-type"]')
      const targetInput = document.querySelector('[data-field="form-target"]')
      typeInput.innerHTML = `
        ${typeSelect}
      `
      targetInput.innerHTML = `
        ${targetSelect}
      `
      console.log(campaign.start_date)
      console.log(campaign.end_date)      

      document.querySelector('[data-field="form-target"]').value = campaign.target;
      document.querySelector('[data-field="form-begin"]').value = campaign.start_date.replace(' ', 'T');
      document.querySelector('[data-field="form-end"]').value = campaign.end_date.replace(' ', 'T');
      const beginInput = document.querySelector('[data-field="form-begin"]')
      if (beginInput && beginInput._flatpickr) {
        beginInput._flatpickr.setDate(campaign.start_date, true); 
      }
      const endInput = document.querySelector('[data-field="form-end"]')
      if (endInput && endInput._flatpickr) {
        endInput._flatpickr.setDate(campaign.end_date, true); 
      }


      document.querySelector('.icon-status').innerHTML = `
      <i class="bi bi-${CampaignStatus.icon} icon" style="color: ${MainStatus.main_Color};"></i>
      <div class="status-text kanit-semibold" data-full="${CampaignStatus.name}" data-short="${CampaignStatus.short_name}">${CampaignStatus.short_name}</div>
      `

      document.querySelector('[data-field="form-location"]').value = campaign.location;
      document.querySelector('.create-by input').value = campaign.created_by;
      document.querySelector('.create-date input').value = campaign.create_date.replace(' ', 'T');
      document.querySelector('.total').textContent = `จำนวนโปรโมชั่นทั้งหมด : ${campaign.promotion ?? '0'}`;
      document.querySelector('[data-field="form-note"]').value = campaign.note || '';

      // อัปเดตสถานะ Icon และข้อความ
      const statusIcon = container.querySelector('.SelectStatus-icon');
      const statusLabel = container.querySelector('.SelectStatus-label');
      statusIcon.className = `bi bi-${CampaignStatus.icon}`;
      statusIcon.style.color = `${MainStatus.main_Color}`;
      statusLabel.textContent = CampaignStatus.thai_name;
      statusLabel.style.color = `${MainStatus.main_Color}`;

      container.querySelector(".icon-status").style.display = "none";
      container.querySelector(".btn-edit").style.display = "none";
      container.style.setProperty('--after-display', 'none');
      // ==================================================================================
    }
    
  } catch (err) {
    console.error("Failed to fetch campaign data:", err);
  }

  container.originalCampaignDataMapRef = originalValuesMap;

  CardEditController.registerCardEventListeners(container, originalValuesMap , StatusData);
  CardEditController.trackCardChanges(container); 
});