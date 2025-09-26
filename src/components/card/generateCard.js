// generateCard.js

import { FormHelper } from "/myPromotion/src/assets/js/formHelper.js";
import { CardEditController } from "./CardEditor.js";
import { MainStatusData } from "/myPromotion/src/config.js";
import { UpdateStatusCount } from "/myPromotion/src/components/status-count/status-count.js";
import { API } from '/myPromotion/src/assets/js/api.js';

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
          class="table table-sm table-bordered promo-conditions-table promo-table"
          id="conditionsListTable-${pid}"
          data-unique-id="id"
        >
          <thead>
            <tr>
              <th data-field="id" data-visible="false" data-switchable="false">ID</th>
              <th data-field="index" data-width="56">#</th>
              <th data-field="condition_name">ชื่อเงื่อนไข</th>
              <th data-field="compiled" data-visible="false">รายละเอียด</th>
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
          <button type="button" class="btn btn-outline-secondary btn-sm btn-ModalCustomerEditor" data-promotion-id="${pid}" data-toggle="modal" data-target="#my-form2">เพิ่มกลุ่มลูกค้า</button>
        </div>
        <div class="d-flex align-items-center gap-2">
          <!-- bootstrap-table will insert search/export here -->
        </div>
      </div>

      <div class="table-responsive mb-2">
        <table 
          class="table table-sm table-bordered promo-customer-table promo-table"
          id="customersTable-${pid}"
          data-unique-id="id"
        >
          <thead>
            <tr>
              <th data-field="id" data-visible="false" data-switchable="false">id</th>
              <th data-field="index" data-sortable="true">#</th>
              <th data-field="type_area" data-sortable="true">กลุ่มเขต</th>
              <th data-field="area_name" data-sortable="true">เขต</th>
              <th data-field="segment" data-sortable="true" data-visible="false" data-switchable="false">กลุ่มลูกค้า</th>
              <th data-field="name" data-sortable="true">ชื่อกลุ่มลูกค้า</th>
              <th data-field="customer_code" data-sortable="true">รหัสลูกค้า</th>
              <th data-field="condition" data-sortable="true">เงื่อนไข</th>
              <th data-field="start_date" data-sortable="true">เริ่ม</th>
              <th data-field="end_date" data-sortable="true">สิ้นสุด</th>
              <th data-field="manage">จัดการ</th>
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
              <button class="btn btn-outline-primary btn-history d-none">History</button>
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
          search: true,
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
            const q = data.search || ''; 
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

      } catch(e){}

      // --- robust init for customer table: wait for both element AND manager ---
      // --- improved ensureCustomerTableInit: wait for element and manager, queue if needed ---
(function ensureCustomerTableInit(pid) {
  const selector = `#customersTable-${pid}`;
  const elementTimeoutMs = 10000; // wait up to 10s for the element to appear
  const managerPollIntervalMs = 250;
  const managerPollMaxAttempts = 80; // ~20s max polling for manager when queued

  // ensure global pending queue exists
  window._pendingCustomerInits = window._pendingCustomerInits || [];

  // process pending queue: try to init any entries where both el+manager ready
  function processPendingQueue() {
    if (!window._pendingCustomerInits || !window._pendingCustomerInits.length) return;
    if (!window._CustomerTableManager || typeof window._CustomerTableManager.initTableForPid !== 'function') return;

    const remaining = [];
    window._pendingCustomerInits.forEach(entry => {
      try {
        const el = document.querySelector(entry.selector);
        if (el) {
          try { window._CustomerTableManager.initTableForPid(entry.pid, el); }
          catch (err) { console.warn('initTableForPid threw for pid', entry.pid, err); remaining.push(entry); }
        } else {
          // element still missing -> keep it queued (maybe created later)
          remaining.push(entry);
        }
      } catch (e) {
        remaining.push(entry);
      }
    });
    window._pendingCustomerInits = remaining;
  }

  // allow external side (CustomerTableManager) to tell us it's ready:
  // when manager script initializes, it can: window.dispatchEvent(new Event('CustomerTableManager:ready'))
  // we listen and attempt to process queue immediately.
  if (!ensureCustomerTableInit._listenerInstalled) {
    ensureCustomerTableInit._listenerInstalled = true;
    window.addEventListener('CustomerTableManager:ready', () => {
      try { processPendingQueue(); } catch (e) { /* ignore */ }
    });
  }

  // helper to attempt immediate init if possible
  const tryInitNow = (el) => {
    if (!el) return false;
    if (window._CustomerTableManager && typeof window._CustomerTableManager.initTableForPid === 'function') {
      try {
        window._CustomerTableManager.initTableForPid(pid, el);
        return true;
      } catch (err) {
        console.warn('CustomerTableManager.initTableForPid threw', err);
        return false;
      }
    }
    return false;
  };

  // 1) if element already exists -> try immediate init or queue
  const existingEl = document.querySelector(selector);
  if (existingEl) {
    if (tryInitNow(existingEl)) return;
    // manager not ready -> queue the init
    window._pendingCustomerInits.push({ pid, selector });
    // start light-weight polling for manager to process the queue
    startManagerPollIfNeeded();
    return;
  }

  // 2) element does not exist yet -> observe DOM for its creation (with timeout)
  let mo;
  let done = false;
  const onFoundElement = (el) => {
    if (done) return;
    done = true;
    try { mo && mo.disconnect(); } catch(_) {}
    // try init immediately, else push to queue for manager
    if (!tryInitNow(el)) {
      window._pendingCustomerInits.push({ pid, selector });
      startManagerPollIfNeeded();
    }
  };

  try {
    mo = new MutationObserver((mutations) => {
      try {
        const el = document.querySelector(selector);
        if (el) onFoundElement(el);
      } catch (e) { /* ignore */ }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch (e) {
    // MutationObserver may fail in some envs; fallback to simple polling for element
    const fallbackInterval = setInterval(() => {
      try {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(fallbackInterval);
          onFoundElement(el);
        }
      } catch (e) {}
    }, 150);
    // safety timeout to clear fallback if nothing appears
    setTimeout(() => clearInterval(fallbackInterval), elementTimeoutMs);
  }

  // stop observation after timeout if not found
  setTimeout(() => {
    if (done) return;
    done = true;
    try { mo && mo.disconnect(); } catch(_) {}
    const el = document.querySelector(selector);
    if (el) {
      if (!tryInitNow(el)) {
        window._pendingCustomerInits.push({ pid, selector });
        startManagerPollIfNeeded();
      }
    } else {
      // element never appeared within timeout: push a placeholder to pending so it can be retried later (or removed)
      // we do NOT spam console.warn here to avoid noisy logs; show a debug only
      console.debug(`customersTable element ${selector} not found after ${elementTimeoutMs}ms; queued for later if created.`);
      window._pendingCustomerInits.push({ pid, selector });
      startManagerPollIfNeeded();
    }
  }, elementTimeoutMs);

  // start a short polling that tries to process queue when manager becomes available
  function startManagerPollIfNeeded() {
    if (ensureCustomerTableInit._managerPollRunning) return;
    ensureCustomerTableInit._managerPollRunning = true;
    let attempts = 0;
    const iv = setInterval(() => {
      attempts++;
      try {
        if (window._CustomerTableManager && typeof window._CustomerTableManager.initTableForPid === 'function') {
          try { processPendingQueue(); } catch (e) { console.warn('processPendingQueue error', e); }
        }
        // stop if queue empty or attempts exhausted
        if ((!window._pendingCustomerInits || window._pendingCustomerInits.length === 0) || attempts >= managerPollMaxAttempts) {
          clearInterval(iv);
          ensureCustomerTableInit._managerPollRunning = false;
        }
      } catch (e) {
        clearInterval(iv);
        ensureCustomerTableInit._managerPollRunning = false;
      }
    }, managerPollIntervalMs);
  }

})(item.id);


      // --- initialize flatpickr only for inputs inside THIS card (avoid global selector) ---
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

        // only initialize date-picker elements that belong to the current card we just appended
        const cardDatePickers = card.querySelectorAll('.date-picker');
        cardDatePickers.forEach(el => {
          try {
            // If input has a clearly non-empty and parseable value, pass it; otherwise allowInput true will handle it
            flatpickr(el, defaultOptions);
          } catch (e) {
            // don't spam console for invalid single inputs
            console.debug('flatpickr init failed for one input (ignored)', e);
          }
        });

        const cardDisabledPickers = card.querySelectorAll('.date-picker-disabled');
        cardDisabledPickers.forEach(el => {
          try {
            flatpickr(el, { ...defaultOptions, clickOpens: false, allowInput: false });
          } catch (e) {
            console.debug('flatpickr disabled init failed (ignored)', e);
          }
        });
      } catch (e) {
        console.warn('flatpickr per-card init failed', e);
      }


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