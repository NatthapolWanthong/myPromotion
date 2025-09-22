import { CardEditController } from "/myPromotion/src/components/card/CardEditor.js";
import { updateCardAppearance } from "/myPromotion/src/assets/js/cardUtils.js";
import { getOptions } from "/myPromotion/src/assets/js/store/optionsStore.js";

let statusOption = "";
let currentStatusCard = null;


document.getElementById("statusModal").addEventListener("show.bs.modal", (event) => {
  const triggerButton = event.relatedTarget;
  currentStatusCard = triggerButton?.closest(".cards, .campaignEditorContainer") || null;
});

export class generateModalSelectStatus {
  constructor(status) {
    statusOption = status;
  }

  generateButton(data) {
    const containerMap = {
      1: document.querySelector(".modal-select-status-option-active"),
      2: document.querySelector(".modal-select-status-option-pending"),
      3: document.querySelector(".modal-select-status-option-close"),
    };

    const statusColorMap = {
      1: "btn-outline-success",
      2: "btn-outline-primary",
      3: "btn-outline-danger",
    };

    Object.values(containerMap).forEach((el) => {
      if (el) el.innerHTML = "";
    });

    data.forEach((item) => {
      const button = document.createElement("button");
      button.className = "btn w-100 mb-1 SelectStatus-button";
      button.dataset.statusId = item.id;

      const statusClass = statusColorMap[item.id_main];
      if (statusClass) button.classList.add(statusClass);

      button.innerHTML = `
        <i class="bi bi-${item.icon} SelectStatus-icon"></i>
        <label class="SelectStatus-label">${item.thai_name}</label>
      `;

      button.addEventListener("click", () => {
        const modal = button.closest(".modal-select-status-option");
        modal.querySelectorAll(".SelectStatus-button").forEach((btn) => btn.classList.remove("active-status"));

        button.classList.add("active-status");
      });
      const container = containerMap[item.id_main];
      if (container) container.appendChild(button);
    });
  }
}

document.getElementById("btn-select-status").addEventListener("click", async () => {
  const options = await getOptions();
  if (!currentStatusCard) return;

  const activeStatusBtn = document.querySelector(".SelectStatus-button.active-status");
  if (!activeStatusBtn) return;

  const newStatusId = activeStatusBtn.dataset.statusId;
  const statusData = options.status[newStatusId-1];
  if (!statusData) return;

  currentStatusCard.dataset.status = newStatusId;
  currentStatusCard.dataset.id_main = statusOption[newStatusId - 1].id_main;

  updateCardAppearance(currentStatusCard, statusData, newStatusId);

  const icon = currentStatusCard.querySelector(".SelectStatus-icon");
  const label = currentStatusCard.querySelector(".SelectStatus-label");
  const mainStatus = statusOption[newStatusId - 1];

  if (icon && label) {
    icon.className = `bi bi-${statusData.icon} SelectStatus-icon`;
    icon.style.color = mainStatus.main_Color;
    label.textContent = statusData.thai_name;
    label.style.color = mainStatus.main_Color;
  }

  const topIcon = currentStatusCard.querySelector(".icon-status .icon");
  const topText = currentStatusCard.querySelector(".icon-status .status-text");
  if (topIcon && topText) {
    topIcon.className = `bi bi-${statusData.icon} icon`;
    topIcon.style.color = mainStatus.main_Color;
    topText.textContent = statusData.short_name;
    topText.setAttribute("data-full", statusData.name);
    topText.setAttribute("data-short", statusData.short_name);
  }

  currentStatusCard.classList.add("edit-mode");
  CardEditController.toggleActionButtons(currentStatusCard, true);

  currentStatusCard = null;
});