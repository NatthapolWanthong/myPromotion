// generateCard.js

import { FormHelper } from "/myPromotion/src/assets/js/formHelper.js";
import { CardEditController } from "./CardEditor.js";
import { MainStatusData } from "/myPromotion/src/config.js";
import { UpdateStatusCount } from "/myPromotion/src/components/status-count/status-count.js";
import ConditionIndex, { initConditionModule, initConditionListForCard, OpenConditionForm } from '/myPromotion/src/components/Condition/ConditionIndex.js';
import { API } from '/myPromotion/src/assets/js/api.js'; // ถูกเรียกใช้ในการดึง/ลบ condition

// helper to return per-promotion list-view html (IDs unique by promotionId)
// รวม sample customToolbar เป็น placeholder (commented) ตามคำขอ
function makeConditionListHTML(promotionId){
  const pid = String(promotionId);
  return `
    <div class="promotion-conditions" id="promotion-conditions-${pid}">
      <!-- toolbar: ปุ่มจัดการเงื่อนไข อยู่ด้านบนของตาราง -->
      <div id="toolbar-conditions-${pid}" class="promo-toolbar d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-primary btn-sm btn-manage-conditions" data-promotion-id="${pid}">สร้างเงื่อนไข</button>
          <!-- สามารถเพิ่มปุ่ม/controls อื่นๆ ตรงนี้ได้ -->
        </div>
      </div>

      <div class="table-responsive mb-2">
        <table 
          class="table table-sm table-bordered promo-conditions-table"
          id="conditionsListTable-${pid}"
          data-unique-id="id"
          data-pagination="true"
          data-page-size="25"
          data-search="true"
          data-show-columns="true"
          data-show-export="true"
          data-side-pagination="server"
          data-locale="th-TH"
        >
          <thead>
            <tr>
              <th data-field="id" data-visible="false">ID</th>
              <th data-field="index" data-formatter="indexFormatter" data-width="56">#</th>
              <th data-field="condition_name" data-sortable="true">ชื่อเงื่อนไข</th>
              <th data-field="compiled" data-formatter="compiledFormatter">Data</th>
              <th data-field="actions" data-formatter="actionFormatter" data-align="center" data-width="180">จัดการ</th>
            </tr>
          </thead>
        </table>
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

            <div style="margin-left: 5px; margin-right: 12px;">
              <!-- Insert dynamic list-view HTML for this promotion -->
              <div class="col-12 mt-3">
                ${makeConditionListHTML(item.id)}
              </div>

              <!-- Customer table (placeholder) - เตรียมไว้สำหรับอนาคต -->
              <div class="col-12 mt-3">
                <!-- custom toolbar placeholder for customers -->
                <div id="toolbar-customers-${item.id}" class="d-none"><!-- custom toolbar customers --></div>
                <div class="table-responsive">
                  <table id="customersTable-${item.id}" class="table table-sm table-bordered" data-unique-id="id"></table>
                </div>
              </div>
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
        ` : ``}
      `;

      card.originalCampaignDataMapRef = this.originalValuesMap;
      this.container.appendChild(card);

      // wire manage conditions button for this card -> open modal create/edit
      const manageBtn = card.querySelector('.btn-manage-conditions');
      if(manageBtn){
        manageBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const pid = Number(manageBtn.dataset.promotionId || item.id);
          if (typeof window.OpenConditionForm === 'function') {
            window.OpenConditionForm(pid, item.name, card);
          } else if (typeof OpenConditionForm === 'function') {
            OpenConditionForm(pid, item.name, card);
          }
        });
      }

      // ========== Initialize bootstrap-table for conditions ==========
      try {
        const pid = item.id;
        const $condTable = $(`#conditionsListTable-${pid}`);

        // index formatter (1..n per page)
        window.indexFormatter = function(value, row, index){
          // bootstrap-table passes index on current page; show overall index by using pageNumber/pageSize
          try {
            const opts = $condTable.bootstrapTable('getOptions');
            const page = opts.pageNumber || 1;
            const size = opts.pageSize || 5;
            return (page - 1) * size + index + 1;
          } catch(e){ return index + 1; }
        };

        // compiled data formatter (show small details + collapsible)
        window.compiledFormatter = function(value, row, index) {
          try {
            const parsed = row.condition_xml || row.condition_xml_parsed || row.compiled_dsl || null;
            const txt = parsed ? JSON.stringify(parsed, null, 2) : '-';
            return `<details class="condition-raw"><summary class="small">รายละเอียด JSON (คลิก)</summary><pre style="max-height:240px;overflow:auto;">${$('<div>').text(txt).html()}</pre></details>`;
          } catch(e){ return '-'; }
        };

        // actions formatter (edit / delete buttons)
        window.actionFormatter = function(value, row, index){
          return `
            <button class="btn btn-sm btn-outline-primary btn-edit-condition" data-id="${row.id}" data-promotion="${pid}">แก้ไข</button>
            <button class="btn btn-sm btn-outline-danger btn-delete-condition ms-1" data-id="${row.id}" data-promotion="${pid}">ลบ</button>
          `;
        };

        // initialize bootstrap-table (server-side) for conditions
        $condTable.bootstrapTable({
          toolbar: `#toolbar-conditions-${pid}`,
          pagination: true,
          sidePagination: 'server',
          search: true,
          showExport: true,
          exportOptions: {}, // plugin-specific options if any
          exportTypes: ['csv', 'excel'],
          pageSize: 5, // default per requirement for condition
          pageList: [5,10,20,50],
          uniqueId: 'id',
          ajax: function (params) {
            // params.data contains offset, limit, search, sort, order
            const data = params.data || {};
            const limit = Number(data.limit || 5);
            const offset = Number(data.offset || 0);
            const page = Math.floor(offset / limit) + 1;
            const q = data.search || '';
            API.getCondition({ promotion_id: pid, page, per_page: limit, q })
              .then(res => {
                if(res && res.success){
                  // bootstrap-table expects { total, rows }
                  params.success({ total: res.total || 0, rows: res.data || [] });
                  // update paginationInfo small element
                  const pi = document.querySelector(`#paginationInfo-${pid}`);
                  if(pi) pi.textContent = `Page ${page} / ${res.total_pages || 1}`;
                  // update promo condition count modal if exists
                  const badgeEl = document.querySelector(`#promo-condition-count-modal-${pid}`);
                  if(badgeEl) badgeEl.textContent = String(res.total ?? 0);
                } else {
                  params.error(res?.error || 'fetch failed');
                }
              })
              .catch(err => { params.error(err); });
          }
        });

        // delegated handlers (works even after table refresh)
        $(`#conditionsListTable-${pid}`).off('click', '.btn-edit-condition').on('click', '.btn-edit-condition', function(ev){
          ev.stopPropagation();
          const id = $(this).data('id');
          const $t = $(`#conditionsListTable-${pid}`);
          // get row by uniqueId
          const row = $t.bootstrapTable('getRowByUniqueId', id) || ( ($t.bootstrapTable('getData') || []).find(r => String(r.id) === String(id)) );
          if(!row){
            // fallback: open modal and let populate fetch
            if (typeof window.OpenConditionForm === 'function') window.OpenConditionForm(pid, item.name, card, { id });
            return;
          }
          if (typeof window.OpenConditionForm === 'function') {
            window.OpenConditionForm(pid, row.condition_name || '', card, row);
          } else {
            // fallback: dispatch populate and show overlay
            if (typeof OpenConditionForm === 'function') OpenConditionForm(pid, row.condition_name || '', card, row);
          }
        });

        $(`#conditionsListTable-${pid}`).off('click', '.btn-delete-condition').on('click', '.btn-delete-condition', function(ev){
          ev.stopPropagation();
          const id = $(this).data('id');
          if(!confirm('ต้องการลบเงื่อนไขนี้ ใช่หรือไม่?')) return;
          $(this).prop('disabled', true);
          API.deleteCondition({ id }).then(res => {
            if(res && res.success){
              // refresh table after delete
              $condTable.bootstrapTable('refresh');
              try { alert('ลบเงื่อนไขสำเร็จ'); } catch(e){}
            } else {
              throw new Error(res?.error || 'delete failed');
            }
          }).catch(err => {
            console.error('delete error', err);
            alert('ลบล้มเหลว: ' + (err.message || err));
          }).finally(()=> { $(this).prop('disabled', false); });
        });

      } catch(e){
        console.warn('init bootstrap-table for conditions failed', e);
      }

      // ========== Initialize bootstrap-table for customers (placeholder) ==========
      try {
        const pid = item.id;
        const $custTable = $(`#customersTable-${pid}`);

        // sample columns for customers; replace/extend when real API available
        const customerColumns = [
          { field: 'id', title: 'ID', visible: false },
          { field: 'code', title: 'Code' },
          { field: 'customer_name', title: 'ชื่อลูกค้า' },
          { field: 'condition', title: 'เงื่อนไข' }
        ];

        // init customers table with client-side empty data (pageSize 10 default)
        $custTable.bootstrapTable({
          toolbar: `#toolbar-customers-${pid}`,
          pagination: true,
          sidePagination: 'client',
          search: true,
          showExport: true,
          exportTypes: ['csv','excel'],
          pageSize: 10, // default per requirement for customer table
          pageList: [10,25,50],
          columns: customerColumns,
          data: [] // start empty; in future you can call $custTable.bootstrapTable('refreshOptions', { ajax: ... }) or load data via $custTable.bootstrapTable('load', data)
        });

        // NOTE: when you have API for customers, change to server-side similar to conditions:
        // $custTable.bootstrapTable({ sidePagination: 'server', ajax: function(params){ API.getCustomers(...).then(...params.success({...})) }});
      } catch(e){
        console.warn('init customers table failed', e);
      }

      // initialize flatpickr for date fields inside card (if any)
      try {
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
      } catch(e){}

      CardEditController.registerCardEventListeners(this.container, this.originalValuesMap, this.options.status);
      CardEditController.trackCardChanges(this.container);
    });
  }
}

export class PromotionCard extends CampaignCard {
  render(data, total, counts) {
    UpdateStatusCount(total, counts, this.options.status)
    this._renderBase(data, true);
  }
}
