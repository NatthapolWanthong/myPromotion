// generateCard.js

import { FormHelper } from "/myPromotion/src/assets/js/formHelper.js";
import { CardEditController } from "./CardEditor.js";
import { MainStatusData } from "/myPromotion/src/config.js";
import { UpdateStatusCount } from "/myPromotion/src/components/status-count/status-count.js";
import ConditionIndex, { initConditionModule, initConditionListForCard, OpenConditionForm } from '/myPromotion/src/components/Condition/ConditionIndex.js';

// helper to return per-promotion list-view html (IDs unique by promotionId)
function makeConditionListHTML(promotionId){
  const pid = String(promotionId);
  return `
    <div class="promotion-conditions" id="promotion-conditions-${pid}">
      <div class="d-flex gap-2 mb-2 align-items-center">
        <input id="conditionSearch-${pid}" class="form-control form-control-sm promo-condition-search" placeholder="ค้นหาเงื่อนไข (ชื่อ)..." />
        <select id="perPageSelect-${pid}" class="form-select form-select-sm promo-condition-pagesize" style="width:120px;">
          <option value="5">5 / page</option>
          <option value="10" selected>10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>

      <div class="table-responsive mb-2">
        <table class="table table-sm table-bordered promo-conditions-table" id="conditionsListTable-${pid}">
          <thead>
            <tr>
              <th style="width:56px">#</th>
              <th>ชื่อเงื่อนไข</th>
              <th>Data</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <div>
          <button id="btn-prev-page-${pid}" class="btn btn-sm btn-outline-secondary promo-prev">Prev</button>
          <button id="btn-next-page-${pid}" class="btn btn-sm btn-outline-secondary promo-next">Next</button>
        </div>
        <small id="paginationInfo-${pid}" class="promo-pagination-info">Page 1 / 1</small>
      </div>
    </div>
  `;
}

export class CampaignCard {
  constructor(container, options, campaign) {
    this.container = container;
    this.options = options;
    this.originalValuesMap = new Map();
    this.campaign = campaign;
    window.statusList = options;
  }

  render(data, total, counts) {
    UpdateStatusCount(total, counts, this.options.status)
    this._renderBase(data, false);
  }

  _renderBase(data, isPromotion) {
    if (!Array.isArray(data)) return console.error("Data ไม่ใช่ array", data);
    this.container.innerHTML = "";
    data.forEach((item) => {
      const card = document.createElement("li");
      card.className = "cards card-status ";
      card.dataset.id = item.id;
      if (isPromotion){
        card.className += "cardPromotion ";
      }

      card.addEventListener("click", (e) => {
        if (
          e.target.closest("button") ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
        )
          return;
        CardEditController.expandCardForEditing(card);
      });

      const campaignTypeSelect = FormHelper.generateOptions(this.options.type, item.type);
      const campaignTargetSelect = FormHelper.generateOptions(this.options.target, item.target);
      const promotionTypeSelect = FormHelper.generateOptions(this.options.promotionType, item.type);
      const promotionTargetSelect = FormHelper.generateOptions(this.options.promotionTarget, item.target);

      const status = this.options.status[item.status - 1];
      const mainStatus = MainStatusData(status.id_main);

      this.originalValuesMap.set(item.id, JSON.parse(JSON.stringify(item)));

      card.classList.add(mainStatus.CardsStatus);
      card.setAttribute("data-status", item.status0);
      card.dataset.id_main = status.id_main;
      card.dataset.status = item.status
      card.dataset.campaign_id = item.campaign_id

      card.innerHTML = `
        <div class="row row-main m-0 align-item-center justify-content-between">
          <div class="col col1">
            <row>
              <div data-field="form-name" class="title editable-text input-class">${item.name}</div>
            </row>
            <row class="code-row position-relative">
              <div data-field="form-code" class="id editable-text input-class">${item.code}</div>
              ${isPromotion ? `<div disabled readonly data-field="form-code" class="id campaign-id editable-text input-class">${this.campaign.code}</div>` : ``}
            </row>
          </div>
          <div class="col col2">
            <textarea data-field="form-description" disabled class="form-control mb-0" rows="3" placeholder="คำอธิบายเพิ่มเติม" style="resize: none; font-size: 14px;">${item.description ?? ""}</textarea>
          </div>
          <div class="col col3">
            <div class="row-select d-flex">
              <label class="col-3-text">ประเภท :</label>
              <select disabled data-field="form-type" class="form-select input-setting input-small" id="form-type">${isPromotion ? `${promotionTypeSelect}` : `${campaignTypeSelect}`}</select>
            </div>
            <div class="row-select d-flex">
              <label class="col-3-text">${isPromotion ? `สิทธิ์ใช้งาน` : `เป้าหมาย`} :</label>
              <select disabled data-field="form-target" class="form-select input-setting input-small" id="form-target">${isPromotion ? `${promotionTargetSelect}` : `${campaignTargetSelect}`}</select>
            </div>
          </div>
          <div class="col col4">
            <div class="row-select d-flex">
              <label class="col-4-text">เริ่ม :</label>
              <input data-field="form-begin" disabled class="form-control input-setting input-small form-begin date-picker" type="text" value="${item.start_date}">
            </div>
            <div class="row-select d-flex">
              <label class="col-4-text">สิ้นสุด :</label>
              <input data-field="form-end" disabled class="form-control input-setting input-small form-end date-picker" type="text" value="${item.end_date}">
            </div>
          </div>
          <div class="col col5">
            <div class="icon-status">
              <i class="bi bi-${status.icon} icon" style="color: ${mainStatus.main_Color};"></i>
              <div class="status-text kanit-semibold" data-full="${status.name}" data-short="${status.short_name}">${status.short_name}</div>
            </div>
          </div>
        </div>

        <div class="row row-expand m-0">
          <div class="col col-expand col-expand-1">
            <div class="location-form">
              <label>พื้นที่เป้าหมาย :</label>
              <input data-field="form-location" class="form-control input-setting form-location" type="text" value="${item.location}">
            </div>
            <div class="col create-information m-0">
              <div class="create-by d-flex">
                <label>สร้างโดย :</label>
                <input disabled readonly class="form-control input-setting input-small" type="text" value="${item.created_by}">
              </div>
              <div class="create-date d-flex">
                <label>สร้างเมื่อ :</label>
                <input disabled readonly class="form-control input-setting input-small date-picker-disabled" type="datetime-local" value="${item.create_date}">
              </div>
            </div>
            ${isPromotion ? '' : `<div class="col total m-0">จำนวนโปรโมชั่นทั้งหมด : ${item.promotion ?? "0"}</div>`}
          </div>

          <div class="col col-expand col-expand-2 d-flex">
            <div class="note-form d-flex">
              <label>หมายเหตุ : </label>
              <textarea data-field="form-note" class="form-control input-setting form-note" placeholder="หมายเหตุ" rows="3">${item.note ?? ""}</textarea>
            </div>
          </div>

          <div class="col col-expand col-expand-3">
            <div class="d-flex flex-row">
              <div class="status-form d-flex" style="text-wrap:nowrap; justify-content: center; align-items: center;">
                <label>สถานะ : </label>
                <button type="button" class="btn SelectStatus-button" data-bs-toggle="modal" data-bs-target="#statusModal" style="border: 0px;">
                  <i class="bi bi-${status.icon} SelectStatus-icon" style="color: ${mainStatus.main_Color};"></i>
                  <label class="SelectStatus-label" style="color: ${mainStatus.main_Color};">${status.thai_name}</label>
                </button>
              </div>
            </div>
          </div>

          <div class="col col-expand-4">
            <button class="btn btn-outline-primary btn-history">History</button>
            <button class="btn btn-danger btn-delete">Delete</button>
            <button class="btn btn-primary btn-edit ${isPromotion ? `d-none`:``}">Edit</button>
            <button class="btn btn-secondary btn-cancel d-none">Cancel</button>
            <button class="btn btn-success btn-save d-none">Save</button>
          </div>
        </div>

        ${isPromotion ? `
          <div class="row row-expand-promotion-detail m-0">
            <div class="col-12 d-flex justify-content-between align-items-center mb-2 promo-toolbar" id="promo-toolbar-${item.id}">
              <div class="d-flex gap-2 align-items-center">
                <!-- ปุ่มเดิมเปลี่ยน: เราใส่ list-view ลงใน card และปุ่มนี้เปิด modal edit/create -->
                <button type="button" class="btn btn-primary btn-sm btn-manage-conditions" data-promotion-id="${item.id}">สร้างเงื่อนไข</button>
              </div>
              <div class="d-flex gap-2 align-items-center">
                <input type="search" class="form-control form-control-sm promo-search" placeholder="ค้นหา..." data-for="${item.id}" style="min-width:200px">
                <select class="form-select form-select-sm promo-page-size" data-for="${item.id}" style="width:110px">
                  <option value="5">5 / หน้า</option>
                  <option value="10">10 / หน้า</option>
                  <option value="25">25 / หน้า</option>
                </select>
                <button class="btn btn-outline-secondary btn-sm" id="btn-promo-summary-${item.id}" data-bs-toggle="modal" data-bs-target="#promoModal-${item.id}">สรุป</button>
              </div>
            </div>



            

            <!-- Insert dynamic list-view HTML for this promotion -->
            <div class="col-12 mt-3">
              ${makeConditionListHTML(item.id)}
            </div>

            <!-- SUMMARY MODAL (แยกออกไป) -->
            <div class="modal fade" id="promoModal-${item.id}" tabindex="-1" aria-labelledby="promoModalLabel-${item.id}" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content minimal-modal">
                  <div class="modal-header">
                    <h6 class="modal-title" id="promoModalLabel-${item.id}">สรุปโปรโมชั่น: ${item.name}</h6>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body" id="promo-modal-body-${item.id}">
                    <p>จำนวนลูกค้า: <strong id="promo-count-modal-${item.id}">0</strong></p>
                    <p>จำนวนเงื่อนไข: <strong id="promo-condition-count-modal-${item.id}">0</strong></p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">ปิด</button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div class="col-12">
              <div class="promotion-detail-grid minimal-modal full-width-table">
                <div class="promotion-table-wrap w-100">
                  <!-- MAIN TABLE -->
                  <promotion-table id="promotion-table-${item.id}" data-minwidth="1400"></promotion-table>
                </div>
              </div>
            </div>
        ` : ``}
      `;

      card.originalCampaignDataMapRef = this.originalValuesMap;
      this.container.appendChild(card);

      // wire manage conditions button for this card
      const manageBtn = card.querySelector('.btn-manage-conditions');
      if(manageBtn){
        manageBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const pid = Number(manageBtn.dataset.promotionId || item.id);
          // open modal edit/create for this promotion (no preloaded condition)
          if (typeof window.OpenConditionForm === 'function') {
            window.OpenConditionForm(pid, item.name, card);
          } else if (typeof window.OpenConditionForm === 'function') {
            // fallback
            window.OpenConditionForm(pid, item.name, card);
          }
        });
      }

      // initialize per-card condition list UI (will load conditions asynchronously)
      try {
        if (typeof ConditionIndex.initConditionListForCard === 'function') {
          ConditionIndex.initConditionListForCard(item.id, card);
        }
      } catch(e){
        console.warn('initConditionListForCard failed', e);
      }

      // update promo modal summary count immediately (fetch total)
      (async () => {
        try {
          const res = await API.getCondition({ promotion_id: item.id, page: 1, per_page: 1 });
          if (res && res.success) {
            const el = card.querySelector(`#promo-condition-count-modal-${item.id}`);
            if (el) el.textContent = String(res.total ?? 0);
          }
        } catch (err) {
          console.warn('Failed to load condition count for promo', item.id, err);
        }
      })();

      if (isPromotion) {
        // setup preview/main tables as before...
        const previewColumns = [
          { field: 'id', title: '#' },
          { field: 'name', title: 'ชื่อ' },
          { field: 'extra', title: 'เพิ่มเติม' }
        ];

        const previewData = [
          { id: 1, name: 'ซื้อครบ 500', extra: 'ลด 50 บาท' },
          { id: 2, name: 'ซื้อครบ 1000', extra: 'ลด 150 บาท' }
        ];

        const previewComp = card.querySelector(`#promotion-preview-table-${item.id}`);
        const setupPreview = () => {
          if (!previewComp) return;
          if (typeof previewComp.setColumns === 'function') {
            previewComp.setColumns(previewColumns);
            previewComp.setData(previewData);
          } else {
            setTimeout(setupPreview, 60);
          }
        };
        setupPreview();

        const columns = [
          { field: 'state', checkbox: true },
          { field: 'id', title: 'ID' },
          { field: 'code', title: 'Code' },
          { field: 'customer_name', title: 'ชื่อลูกค้า' },
          { field: 'condition', title: 'เงื่อนไข' },
        ];

        const sampleData = [
          { id: 1, code: 'CUST001', customer_name: 'นาย A', condition: '2000' },
          { id: 2, code: 'CUST002', customer_name: 'นาง B', condition: '5' },
          { id: 3, code: 'CUST003', customer_name: 'บริษัท C', condition: '10' },
        ];

        const comp = card.querySelector(`#promotion-table-${item.id}`);
        const trySetup = () => {
          if (!comp) return;
          if (typeof comp.setColumns === 'function') {
            comp.setColumns(columns);
            comp.setData(sampleData);
          } else {
            setTimeout(trySetup, 60);
          }
        };
        trySetup();
      }

    });
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

    CardEditController.registerCardEventListeners(this.container, this.originalValuesMap, this.options.status);
    CardEditController.trackCardChanges(this.container);
  }
}

export class PromotionCard extends CampaignCard {
  render(data, total, counts) {
    UpdateStatusCount(total, counts, this.options.status)
    this._renderBase(data, true);
  }
}
