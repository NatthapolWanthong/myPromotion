// generateCard.js

import { FormHelper } from "/myPromotion/src/assets/js/formHelper.js";
import { CardEditController } from "./CardEditor.js";
import { MainStatusData } from "/myPromotion/src/config.js";
import { UpdateStatusCount } from "/myPromotion/src/components/status-count/status-count.js";
import { API } from '/myPromotion/src/assets/js/api.js'; // ถูกเรียกใช้ในการดึง/ลบ condition
// jQuery & bootstrap-table expected to be available globally (page already loads them)

/* -------------------------
   Helper: clean leftover modal artifacts
   ------------------------- */
(function installModalCleanup() {
  if (typeof document === 'undefined') return;
  document.addEventListener('hidden.bs.modal', function _onModalHidden(ev) {
    setTimeout(() => {
      try {
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        document.body.classList.remove('modal-open', 'overlay-open');
        document.body.style.paddingRight = '';
      } catch (e) {
        console.warn('modal-cleanup failed', e);
      }
    }, 40);
  });
})();

// ---------- Listen for condition saved event and refresh the specific promo table ----------
window.addEventListener('condition:saved', (ev) => {
  try {
    const pid = Number(ev?.detail?.promotion_id || 0);
    if (!pid) return;

    const selector = `#conditionsListTable-${pid}`;
    const tryRefresh = () => {
      try {
        const $t = window.jQuery ? window.jQuery(selector) : null;
        if ($t && $t.data && $t.data('bootstrap.table')) {
          $t.bootstrapTable('refresh', { silent: true });
          return true;
        }
        return false;
      } catch (e) {
        console.warn('refresh table error', e);
        return false;
      }
    };

    if (!tryRefresh()) {
      let attempts = 0;
      const iv = setInterval(() => {
        attempts++;
        if (tryRefresh() || attempts >= 8) clearInterval(iv);
      }, 250);
    }
  } catch (e) {
    console.warn('condition:saved handler failed', e);
  }
});

/* -------------------------
   makeConditionListHTML - toolbar ABOVE table (bootstrap-table will render search/pagination)
   ------------------------- */
function makeConditionListHTML(promotionId){
  const pid = String(promotionId);
  return `
    <div class="d-flex align-items-center mb-2">
      <h5 id="overlay-title-${pid}" class="m-0 me-2">เงื่อนไข</h5>
      <span id="condition-count-${pid}" class="badge bg-secondary">0</span>
      <small id="paginationInfo-${pid}" class="text-muted ms-3">Page 1 / 1</small>
    </div>

    <div class="promotion-conditions" id="promotion-conditions-${pid}">
      <div id="toolbar-conditions-${pid}" class="promo-toolbar d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-primary btn-sm btn-manage-conditions" data-promotion-id="${pid}">สร้างเงื่อนไข</button>
        </div>
        <div class="d-flex align-items-center gap-2">
          <!-- bootstrap-table will insert search/export here -->
        </div>
      </div>

      <div class="table-responsive mb-2">
        <table 
          class="table table-sm table-bordered promo-conditions-table"
          id="conditionsListTable-${pid}"
          data-unique-id="id"
        >
          <thead>
            <tr>
              <th data-field="id" data-visible="false" data-switchable="false">ID</th>
              <th data-field="index" data-width="56">#</th>
              <th data-field="condition_name">ชื่อเงื่อนไข</th>
              <th data-field="compiled">รายละเอียด</th>
              <th data-field="actions" data-align="center" data-width="180">จัดการ</th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  `;
}

/* -------------------------
   makeCustomerListHTML - same look & feel as condition list (badge + pagination)
   ------------------------- */
function makeCustomerListHTML(promotionId){
  const pid = String(promotionId);
  return `
    <div class="d-flex align-items-center mb-2">
      <h5 id="customer-title-${pid}" class="m-0 me-2">ลูกค้า</h5>
      <span id="customer-count-${pid}" class="badge bg-secondary">0</span>
      <small id="paginationInfoCustomer-${pid}" class="text-muted ms-3">Page 1 / 1</small>
    </div>

    <div class="promotion-customers" id="promotion-customers-${pid}">
      <div id="toolbar-customers-${pid}" class="promo-toolbar d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-outline-secondary btn-sm btn-manage-customers" data-promotion-id="${pid}">จัดการลูกค้า</button>
        </div>
        <div class="d-flex align-items-center gap-2">
          <!-- bootstrap-table will insert search/export here -->
        </div>
      </div>

      <div class="table-responsive mb-2">
        <table 
          class="table table-sm table-bordered promo-conditions-table"
          id="customersTable-${pid}"
          data-unique-id="id"
        >
          <thead>
            <tr>
              <th data-field="id" data-visible="false">ID</th>
              <th data-field="code" data-sortable="true">Code</th>
              <th data-field="customer_name" data-sortable="true">ชื่อลูกค้า</th>
              <th data-field="condition">เงื่อนไข</th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  `;
}

/* -------------------------
   Main class
   ------------------------- */
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
        <div class="check-edit-mode">
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
        </div>
        ${isPromotion ? `
          <div style="row-table margin-left: 5px; margin-right: 12px;">
            <!-- divider between tables -->
            <hr class="promo-divider my-3" />

            <div class="col-12 mt-3">
              ${makeConditionListHTML(item.id)}
            </div>

            <hr class="promo-divider my-3" />

            <div class="col-12 mt-3">
              ${makeCustomerListHTML(item.id)}
            </div>

          </div>

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
          window.OpenConditionForm(pid, item.name, card);
        });
      }

      // ========== Initialize bootstrap-table for conditions ==========
      try {
        const pid = item.id;
        const $condTable = $(`#conditionsListTable-${pid}`);

        const columns = [
          { field: 'id', visible: false },
          { field: 'index', title: '#', formatter: function(value, row, index){
              try {
                const opts = $condTable.bootstrapTable('getOptions');
                const page = opts.pageNumber || 1;
                const size = opts.pageSize || 5;
                return (page - 1) * size + index + 1;
              } catch(e){ return index + 1; }
            }, width: 56
          },
          { field: 'condition_name', title: 'ชื่อเงื่อนไข'},
          { field: 'compiled', title: 'รายละเอียด', formatter: function(value, row, index){
              try {
                const parsed = row.condition_xml || row.condition_xml_parsed || row.compiled_dsl || null;
                const txt = parsed ? JSON.stringify(parsed, null, 2) : '-';
                const $d = $('<div>').text(txt);
                return `<details class="condition-raw"><summary class="small">รายละเอียด JSON</summary><pre style="max-height:240px;overflow:auto;">${$d.html()}</pre></details>`;
              } catch(e){ return '-'; }
            }
          },
          { field: 'actions', title: 'จัดการ', align: 'center', width: 180, formatter: function(val, row, idx){
              return `
                <button class="btn btn-sm btn-outline-primary btn-edit-condition" data-id="${row.id}" data-promotion="${pid}">แก้ไข</button>
                <button class="btn btn-sm btn-outline-danger btn-delete-condition ms-1" data-id="${row.id}" data-promotion="${pid}">ลบ</button>
              `;
            }
          }
        ];

        $condTable.bootstrapTable({
          id: `ConditionTable-${pid}`,
          toolbar: `#toolbar-conditions-${pid}`,
          pagination: true,
          sidePagination: 'server',
          search: true,            // <-- เปิดให้ bootstrap-table สร้าง search box และส่ง search param
          showColumns: true,
          data_local: "th-TH",
          showExport: true,
          exportTypes: ['csv', 'excel'],
          pageSize: 5,
          pageList: [5,10,20,50],
          uniqueId: 'id',
          columns: columns,
          showRefresh: true,
          ajax: function (params) {
            const data = params.data || {};
            const limit = Number(data.limit || 5);
            const offset = Number(data.offset || 0);
            const page = Math.floor(offset / limit) + 1;
            const q = data.search || ''; // <--- bootstrap-table จะใส่ search ลงที่ data.search
            API.getCondition({ promotion_id: pid, page, per_page: limit, q, sortBy: data.sort, order: data.order })
              .then(res => {
                if(res && res.success){
                  params.success({ total: res.total || 0, rows: res.data || [] });
                } else {
                  params.error(res?.error || 'fetch failed');
                }
              })
              .catch(err => { params.error(err); });
          }
        });


        // ensure layout recalculation after render (helps when table created while element was collapsed)
        setTimeout(()=> {
          try {
            if ($condTable && $condTable.length && $condTable.data('bootstrap.table')) {
              $condTable.bootstrapTable('resetView');
            }
          } catch(e){ console.warn('resetView cond table failed', e); }
        }, 80);

        $condTable.on('load-success.bs.table', function (e, data) {
          try {
            const total = (data && data.total) ? data.total : ($condTable.bootstrapTable('getOptions').totalRows || 0);
            const opts = $condTable.bootstrapTable('getOptions');
            const page = opts.pageNumber || 1;
            const pageSize = opts.pageSize || 5;
            const totalPages = Math.max(1, Math.ceil((data && data.total ? data.total : 0) / pageSize));
            const pi = document.querySelector(`#paginationInfo-${pid}`);
            if (pi) pi.textContent = `Page ${page} / ${totalPages}`;
            const badgeEl = document.querySelector(`#promo-condition-count-modal-${pid}`);
            if (badgeEl) badgeEl.textContent = String(total ?? 0);
            // update per-card condition-count badge
            const cardBadge = document.querySelector(`#condition-count-${pid}`);
            if(cardBadge) cardBadge.textContent = String(total ?? 0);
          } catch(e){ /* ignore */ }
        });

        $condTable.off('click', '.btn-edit-condition').on('click', '.btn-edit-condition', function(ev){
          ev.stopPropagation();
          const id = $(this).data('id');
          const row = $condTable.bootstrapTable('getRowByUniqueId', id) || (($condTable.bootstrapTable('getData') || []).find(r => String(r.id) === String(id)));
          if(!row){
            window.OpenConditionForm(pid, item.name, card, { id });
          } else {
            window.OpenConditionForm(pid, row.condition_name || '', card, row);
          }
        });

        $condTable.off('click', '.btn-delete-condition').on('click', '.btn-delete-condition', async function(ev){
          ev.stopPropagation();
          const $btn = $(this);
          const id = Number($btn.data('id'));
          const promo = Number($btn.data('promotion') || pid);

          if (!id) {
            console.warn('delete: id not found on button');
            return;
          }
          if (!confirm('ต้องการลบเงื่อนไขนี้ ใช่หรือไม่?')) return;

          $btn.prop('disabled', true);
          try {
            const res = await API.deleteCondition( id );
            if (res && res.success) {
              try {
                if (typeof window.loadConditionsForCard === 'function') {
                  await window.loadConditionsForCard(promo, { page: 1 }, $btn.closest('.cards')[0] || null);
                } else {
                  $condTable.bootstrapTable('refresh');
                }
              } catch(reloadErr){
                console.warn('reload after delete failed, fallback to bootstrap refresh', reloadErr);
                try { $condTable.bootstrapTable('refresh'); } catch(e){}
              }
              try { alert('ลบเงื่อนไขสำเร็จ'); } catch(e){}
            } else {
              throw new Error(res?.error || 'delete failed');
            }
          } catch(err) {
            console.error('delete error', err);
            alert('ลบล้มเหลว: ' + (err.message || err));
          } finally {
            $btn.prop('disabled', false);
          }
        });

      } catch(e){
        console.warn('init bootstrap-table for conditions failed', e);
      }

      // ========== Initialize bootstrap-table for customers (uses same styling class) ==========
      try {
        const pid = item.id;
        const $custTable = $(`#customersTable-${pid}`);

        const customerColumns = [
          { field: 'id', title: 'ID', visible: false },
          { field: 'code', title: 'Code' },
          { field: 'customer_name', title: 'ชื่อลูกค้า' },
          { field: 'condition', title: 'เงื่อนไข' }
        ];

        $custTable.bootstrapTable({
          toolbar: `#toolbar-customers-${pid}`,
          pagination: true,
          sidePagination: 'client',
          showColumns: true,
          search: true,
          showExport: true,
          exportTypes: ['csv','excel'],
          pageSize: 10,
          pageList: [10,25,50],
          columns: customerColumns,
          showRefresh: true,
          data: [] // load data later (or via ajax if needed)
        });

        // resetView to recalc widths
        setTimeout(()=> {
          try {
            if ($custTable && $custTable.length && $custTable.data('bootstrap.table')) {
              $custTable.bootstrapTable('resetView');
            }
          } catch(e){ console.warn('resetView cust table failed', e); }
        }, 120);

        // if you later load customer data via ajax, update the badge / paginationInfo similarly:
        $custTable.on('load-success.bs.table', function (e, data) {
          try {
            const total = (data && data.total) ? data.total : ($custTable.bootstrapTable('getOptions').totalRows || ($custTable.bootstrapTable('getData') || []).length);
            const opts = $custTable.bootstrapTable('getOptions');
            const page = opts.pageNumber || 1;
            const pageSize = opts.pageSize || 10;
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            const pi = document.querySelector(`#paginationInfoCustomer-${pid}`);
            if (pi) pi.textContent = `Page ${page} / ${totalPages}`;
            const badge = document.querySelector(`#customer-count-${pid}`);
            if (badge) badge.textContent = String(total ?? 0);
          } catch(e){ /* ignore */ }
        });

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

    });
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
