import { FormHelper } from "/myPromotion/src/assets/js/formHelper.js";
import { CardEditController } from "./CardEditor.js";
import { MainStatusData } from "/myPromotion/src/config.js";
import { UpdateStatusCount } from "/myPromotion/src/components/status-count/status-count.js"
import { API } from '/myPromotion/src/assets/js/api.js';

// ✅ 1. CARD สำหรับ CAMPAIGN
export class CampaignCard {
  constructor(container, options, campaign) {
    this.container = container;
    this.options = options;
    this.originalValuesMap = new Map();
    this.campaign = campaign
    window.statusList = options;
  }

  render(data, total, counts) {
    UpdateStatusCount(total, counts, this.options.status)
    this._renderBase(data, false); // ไม่ใส่ field เฉพาะ promotion    
  }

  _renderBase(data, isPromotion) {
    if (!Array.isArray(data)) return console.error("Data ไม่ใช่ array", data);
    this.container.innerHTML = "";
    console.log(this.options)
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
            ${isPromotion ? `
              <div disabled readonly data-field="form-code" class="id campaign-id editable-text input-class">${this.campaign.code}</div>
            `: ``}
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
            ${isPromotion ? 
              ``
              : 
              `
              <div class="col total m-0">
                จำนวนโปรโมชั่นทั้งหมด : ${item.promotion ?? "0"}
              </div>
              `
            }

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
        <div class="row row-expand-promotion-detail mb-0">     

          <div class="col-12 condition-list-view mb-2" style="margin-bottom: 20px"> <!-- ตรงนี้เป็น list view -->
            <div class="promotion-detail-grid minimal-modal full-width-table">            
              <div class="d-flex align-items-center gap-2">
                <button id="btn-create-condition" class="btn btn-primary">สร้างเงื่อนไข</button>
              </div>
              <div class="mb-3 d-f ex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-0">รายการเงื่อนไข</h6>
                  <small class="text-muted">เงื่อนไขทั้งหมดที่ผูกกับโปรโมชั่นปัจจุบัน</small>
                </div>
              </div>

              <div class="table-responsive mb-3">
                <table class="table table-sm table-bordered" id="conditionsListTable-${item.id}">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>ชื่อเงื่อนไข</th>
                      <th>Data Base</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>

              <div id="no-conditions-${item.id}" class="text-center text-muted my-4 d-none">
                ยังไม่มีเงื่อนไข — กด "สร้างเงื่อนไข" เพื่อเพิ่ม
              </div>
              <!-- Add inside list-view (above table) -->
              <div class="d-flex gap-2 mb-3">
                <input id="conditionSearch-${item.id}" class="form-control form-control-sm" placeholder="ค้นหาเงื่อนไข (ชื่อ)..." />
                <select id="perPageSelect-${item.id}" class="form-select form-select-sm" style="width:120px;">
                  <option value="5" selected>5 / page</option>
                  <option value="10">10 / page</option>
                  <option value="20">20 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>

              <!-- Add pagination bar below table -->
              <div class="d-flex justify-content-between align-items-center mt-2">
                <div>
                  <button id="btn-prev-page-${item.id}" class="btn btn-sm btn-outline-secondary">Prev</button>
                  <button id="btn-next-page-${item.id}" class="btn btn-sm btn-outline-secondary">Next</button>
                </div>
                <div>
                  <small id="paginationInfo-${item.id}">Page 1 / 1</small>
                </div>
              </div>

            </div>
          </div>

          <div class="col-12 customer-list-view">
            <div class="promotion-detail-grid minimal-modal full-width-table">
              <div class="promotion-table-wrap w-100">
                <!-- MAIN TABLE -->
                <promotion-table id="promotion-table-${item.id}" data-minwidth="1400"></promotion-table>
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
                  <!-- เพิ่มรายละเอียดสรุปอื่น ๆ ได้ที่นี่ -->
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

      // --- START: render short condition-list inside card (per-promotion unique) ---
      (async () => {
        try {
          const promoId = Number(item.id);
          // find the table inside card (we changed id in the template above to include item.id)
          const tbody = card.querySelector(`#conditionsListTable-${promoId} tbody`);
          const noEl = card.querySelector(`#no-conditions-${promoId}`);
          const paginationInfoEl = card.querySelector(`#paginationInfo-${promoId}`);

          if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-center">กำลังโหลด...</td></tr>`;

          // fetch first page (few items) for preview
          const res = await API.getCondition({ promotion_id: promoId, page: 1, per_page: 5 });
          if (!res || !res.success || !Array.isArray(res.data) || res.data.length === 0) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">ยังไม่มีเงื่อนไข</td></tr>`;
            if (noEl) noEl.classList.remove('d-none');
            if (paginationInfoEl) paginationInfoEl.textContent = `Page 1 / 1`;
            return;
          }

          // render rows (compact)
          tbody.innerHTML = '';
          (res.data || []).forEach((c, idx) => {
            const parsed = (() => {
              try {
                return (c.condition_xml && typeof c.condition_xml === 'object') ? c.condition_xml :
                      (typeof c.condition_xml === 'string' && c.condition_xml.trim() ? JSON.parse(c.condition_xml) : c.condition_xml);
              } catch (e) { return c.condition_xml; }
            })();

            // compute mode badge
            const mode = (parsed && parsed.mode) ? parsed.mode : (c.mode || 'unknown');
            const modeClass = (mode === 'advance') ? 'info' : 'secondary';
            const savedAt = c.updated_at || c.created_at || (parsed && parsed.saved_at) || '';

            const name = c.condition_name || c.name || `Condition #${c.id || idx+1}`;
            const small = `
              <div style="display:flex;gap:8px;align-items:center;">
                <div style="flex:1">
                  <div style="font-weight:600">${escapeHtml(name)}</div>
                  <div class="small text-muted">${escapeHtml(savedAt)}</div>
                </div>
                <div style="white-space:nowrap;">
                  <span class="badge bg-${modeClass}">${escapeHtml(String(mode))}</span>
                </div>
              </div>
            `;

            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td style="width:36px">${idx+1}</td>
              <td>${small}</td>
              <td style="width:110px; text-align:center;">
                <button class="btn btn-sm btn-outline-primary btn-edit-cond" data-id="${c.id}">แก้ไข</button>
                <button class="btn btn-sm btn-outline-danger btn-del-cond" data-id="${c.id}">ลบ</button>
              </td>
            `;
            tbody.appendChild(tr);
          });

          // update pagination/info if present
          if (paginationInfoEl) paginationInfoEl.textContent = `Page 1 / ${res.total_pages || 1}`;

          // bind edit / delete events (delegation)
          tbody.querySelectorAll('.btn-edit-cond').forEach(btn => {
            if (btn._bound) return; btn._bound = true;
            btn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              const cid = btn.dataset.id;
              // open overlay for editing (existing global from your modal module)
              if (typeof window.OpenConditionOverlay === 'function') {
                window.OpenConditionOverlay(promoId, item.name, card);
                // you may also want to signal which condition to load after overlay open:
                // the overlay's load logic looks for a list + user picks id; to auto-select,
                // you can dispatch an event after overlay open:
                setTimeout(()=> {
                  window.dispatchEvent(new CustomEvent('condition:open-for-edit', { detail: { condition_id: cid, promotion_id: promoId } }));
                }, 250);
              } else {
                console.warn('OpenConditionOverlay not available');
              }
            });
          });

          tbody.querySelectorAll('.btn-del-cond').forEach(btn => {
            if (btn._boundDel) return; btn._boundDel = true;
            btn.addEventListener('click', async (ev) => {
              ev.stopPropagation();
              const cid = Number(btn.dataset.id);
              if (!confirm('ต้องการลบเงื่อนไขนี้ใช่หรือไม่?')) return;
              btn.disabled = true;
              try {
                const d = await API.deleteCondition(cid);
                if (d && d.success) {
                  // update UI: remove row
                  const row = btn.closest('tr');
                  if (row) row.remove();
                  // update modal summary count if exists
                  const countEl = card.querySelector(`#promo-condition-count-modal-${promoId}`);
                  if (countEl) countEl.textContent = String(d.total ?? 0);
                  alert('ลบเงื่อนไขสำเร็จ');
                } else {
                  throw new Error(d?.error || 'delete failed');
                }
              } catch (err) {
                console.error(err);
                alert('ลบล้มเหลว: ' + (err.message || err));
              } finally {
                btn.disabled = false;
              }
            });
          });

        } catch (err) {
          console.warn('renderConditionListForCard error', err);
        }
      })();

      // small helper to escape HTML when injecting strings
      function escapeHtml(s) {
        if (s === null || s === undefined) return '';
        return String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
      // --- END render short condition-list inside card ---


      // ----- wire button to open overlay (no duplicate IDs) -----
      const openBtn = card.querySelector('.btn-open-condition');
      if (openBtn) {
        openBtn.addEventListener('click', (ev) => {
          ev.stopPropagation(); // ป้องกันการ trigger click ที่ขยาย card
          const promoId = Number(openBtn.dataset.promotionId || item.id);
          // call global function exposed by modalCondition.js
          if (typeof window.OpenConditionOverlay === 'function') {
            window.OpenConditionOverlay(promoId, item.name, card);
          } else {
            console.warn('OpenConditionOverlay not available yet');
          }
        });
      }

      // ----- update promo modal summary count immediately (fetch total) -----
      (async () => {
        try {
          // uses your existing API wrapper
          const res = await API.getCondition({ promotion_id: item.id, page: 1, per_page: 1 });
          if (res && res.success) {
            // update modal summary element if exists
            const el = card.querySelector(`#promo-condition-count-modal-${item.id}`);
            if (el) el.textContent = String(res.total ?? 0);
            // optional: also update badge somewhere on the card if you have one
            // e.g., const badge = card.querySelector('.condition-badge'); if(badge) badge.textContent = res.total;
          }
        } catch (err) {
          console.warn('Failed to load condition count for promo', item.id, err);
        }
      })();

      if (isPromotion) {
        // ========== Preview Table ==========
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


        // ========== Main Table ==========
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

        
    
    CardEditController.registerCardEventListeners(this.container, this.originalValuesMap, this.options.status);
    CardEditController.trackCardChanges(this.container);
  }
}


// ✅ 2. CARD สำหรับ PROMOTION (extends จาก CampaignCard)
export class PromotionCard extends CampaignCard {
  render(data, total, counts) {
    UpdateStatusCount(total, counts, this.options.status)
    this._renderBase(data, true); // 🔁 ใช้ของเดิม แต่เปิด flag สำหรับ promotion
  }
}