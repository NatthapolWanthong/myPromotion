import { API } from '../../assets/js/api.js';

(function () {
  'use strict';

  /**
   * CustomerTableManager
   */
  class CustomerTableManager {
    constructor() {
      this._tables = new Map();
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.scanAndInit());
      } else {
        this.scanAndInit();
      }
    }

    scanAndInit() {
      try {
        const tables = Array.from(document.querySelectorAll('table[id^="customersTable-"]'));
        tables.forEach(t => {
          const m = t.id.match(/^customersTable-(\d+)$/);
          if (m) {
            const pid = Number(m[1]);
            if (!this._tables.has(pid)) this.initTableForPid(pid, t);
          }
        });
      } catch (e) {
        console.error('CustomerTableManager.scanAndInit failed', e);
      }
    }

    initTableForPid(promotionId, tableEl) {
      try {
        const pid = Number(promotionId);
        if (!pid || !tableEl) return;
        const $table = window.jQuery ? window.jQuery(tableEl) : null;
        if (!$table || !$table.length) return;

        // destroy existing bootstrap table if any
        if ($table.data('bootstrap.table')) {
          try { $table.bootstrapTable('destroy'); } catch (e) { /* ignore */ }
        }

        const cols = [
          { field: 'id', visible: false },
          {
            field: 'index', title: '#', width: 56,
            formatter: (v, row, idx) => {
              try {
                const opts = $table.bootstrapTable('getOptions');
                const page = opts.pageNumber || 1;
                const size = opts.pageSize || 10;
                return (page - 1) * size + idx + 1;
              } catch (e) { return idx + 1; }
            }
          },
          { field: 'type_area', title: 'กลุ่มเขต' },
          { field: 'area_name', title: 'เขต' },
          { field: 'segment', title: 'กลุ่มลูกค้า' },
          { field: 'name', title: 'ชื่อกลุ่มลูกค้า' },
          {
            field: 'customer_code', title: 'รหัสลูกค้า',
            formatter: (v) => v ? v : '-'
          },
          { field: 'condition', title: 'เงื่อนไข' },
          { field: 'start_date', title: 'เริ่ม' },
          { field: 'end_date', title: 'สิ้นสุด' },
          {
            field: 'manage', title: 'จัดการ', formatter: (v, row) => {
              return `
                <button class="btn btn-sm btn-outline-primary btn-edit-customer" data-group="${row.id}">แก้ไข</button>
                <button class="btn btn-sm btn-outline-danger ms-1 btn-delete-customer" data-group="${row.id}">ลบ</button>
              `;
            }
          }
        ];

        $table.bootstrapTable({
          toolbar: `#toolbar-customers-${pid}`,
          pagination: true,
          sidePagination: 'server',
          search: true,
          showColumns: true,
          showExport: true,
          exportTypes: ['csv', 'excel'],
          pageSize: 10,
          pageList: [10, 25, 50],
          columns: cols,
          uniqueId: 'id',
          showRefresh: true,
          ajax: (params) => this._ajaxHandler(params, pid, $table)
        });

        // event delegation for edit/delete buttons
        $table.off('click', '.btn-edit-customer').on('click', '.btn-edit-customer', (ev) => {
          const btn = ev.currentTarget;
          const gid = Number(btn.getAttribute('data-group'));
          document.dispatchEvent(new CustomEvent('customers:edit', { detail: { group_id: gid, promotion_id: pid } }));
        });

        $table.off('click', '.btn-delete-customer').on('click', '.btn-delete-customer', (ev) => {
          const btn = ev.currentTarget;
          const gid = Number(btn.getAttribute('data-group'));
          document.dispatchEvent(new CustomEvent('customers:delete', { detail: { group_id: gid, promotion_id: pid } }));
        });

        this._tables.set(pid, { el: tableEl, $el: $table });
      } catch (e) {
        console.error('CustomerTableManager.initTableForPid failed', e);
      }
    }

    async _ajaxHandler(params, pid, $table) {
      try {
        const data = params.data || {};
        const limit = Number(data.limit || data.pageSize || 10);
        const offset = Number(data.offset || 0);
        const page = Math.floor(offset / limit) + 1;
        const q = String(data.search || data.searchText || '');

        const res = await API.getCustomerGroup({ promotion_id: pid, page, per_page: limit, q });
        if (!res) return params.error('no response from API');
        if (!res.success) return params.error(res.message || 'API error');

        const total = Number(res.total || 0);
        const rows = Array.isArray(res.rows) ? res.rows : [];

        params.success({ total, rows });
      } catch (err) {
        console.error('customers ajax failed', err);
        params.error(err && err.message ? err.message : String(err));
      }
    }

    refresh(pid) {
      const rec = this._tables.get(Number(pid));
      if (rec && rec.$el && rec.$el.bootstrapTable) rec.$el.bootstrapTable('refresh');
    }
  }

  /* -------------------------
     init module + modal wiring
     ------------------------- */
  async function initCustomerModule() {
    const EditorClass = window.CustomerEditorModal || null;
    const AddClass = window.CustomerAddModal || null;

    let EditorModal = null;
    let AddModal = null;
    try { EditorModal = EditorClass ? new EditorClass() : null; } catch (e) { console.error('EditorModal init failed', e); }
    try { AddModal = AddClass ? new AddClass() : null; } catch (e) { console.error('AddModal init failed', e); }

    if (!window._CustomerTableManager) window._CustomerTableManager = new CustomerTableManager();

    document.addEventListener('click', function (ev) {
      const btn = ev.target.closest && ev.target.closest('.btn-ModalCustomerEditor');
      if (!btn) return;
      const pid = btn.dataset.promotionId || btn.getAttribute('data-promotion-id') || '';
      const pname = btn.dataset.promotionName || btn.getAttribute('data-promotion-name') || '';
      if (EditorModal && typeof EditorModal.open === 'function') EditorModal.open(pid, pname);
    });

    // event to open Add modal
    document.addEventListener('customers:open-add', function (ev) {
      const pid = (ev && ev.detail && ev.detail.promotion_id) ? ev.detail.promotion_id : '';
      const customerIds = (ev && ev.detail && Array.isArray(ev.detail.customerIds)) ? ev.detail.customerIds : [];
      if (AddModal && typeof AddModal.open === 'function') {
        AddModal.open(pid, customerIds);
      }
    });

    // listen to group creation to refresh table
    document.addEventListener('customer:group:created', function (ev) {
      const pid = ev && ev.detail && ev.detail.promotion_id ? ev.detail.promotion_id : null;
      if (pid && window._CustomerTableManager) window._CustomerTableManager.refresh(pid);
    });

    // handle delete (dispatched by CustomerTableManager)
    document.addEventListener('customers:delete', async function(ev){
      try {
        const detail = ev && ev.detail ? ev.detail : {};
        const groupId = Number(detail.group_id || 0);
        const promotionId = Number(detail.promotion_id || 0);
        if (!groupId) return console.warn('customers:delete missing id');

        if (!confirm('ต้องการลบกลุ่มลูกค้านี้ ใช่หรือไม่?')) return;

        // call API
        try {
          const res = await API.deleteCustomerGroup(groupId);
          if (res && res.success) {
            try { alert('ลบกลุ่มลูกค้าสำเร็จ'); } catch(e){}
            if (window._CustomerTableManager) window._CustomerTableManager.refresh(promotionId);
            document.dispatchEvent(new CustomEvent('customer:group:deleted', { detail: { group_id: groupId, promotion_id: promotionId } }));
          } else {
            alert('ลบกลุ่มลูกค้าล้มเหลว: ' + (res && res.message ? res.message : 'Unknown'));
          }
        } catch (apiErr) {
          console.error('deleteCustomerGroup API error', apiErr);
          alert('เกิดข้อผิดพลาดขณะลบกลุ่มลูกค้า');
        }
      } catch (err) {
        console.error('customers:delete handler failed', err);
      }
    });

    document.addEventListener('customers:edit', async function(ev){
      try {
        const detail = ev && ev.detail ? ev.detail : {};
        const groupId = Number(detail.group_id || 0);
        const promotionId = Number(detail.promotion_id || 0);
        if (!groupId) return console.warn('customers:edit missing id');

        // fetch group detail (server branch returns members array when group_id present)
        let res;
        try {
          res = await API.getCustomerGroup({ promotion_id: promotionId, page: 1, per_page: 1, q: '', group_id: groupId });
        } catch (apiErr) {
          console.error('API.getCustomerGroup failed', apiErr);
          alert('เกิดข้อผิดพลาดขณะโหลดข้อมูลกลุ่มลูกค้า');
          return;
        }

        if (res && res.success && Array.isArray(res.rows) && res.rows.length > 0) {
          const row = res.rows[0];
          // ensure editor modal exists
          if (window._customerEditorModal && typeof window._customerEditorModal.loadGroupData === 'function') {
            window._customerEditorModal.loadGroupData(row);
            window._customerEditorModal.open(String(row.promotion_id || promotionId), row.name ?? '');
          } else if (window._customerEditorModal && typeof window._customerEditorModal.open === 'function') {
            // fallback: open and set ids if available
            window._customerEditorModal.open(String(row.promotion_id || promotionId), row.name ?? '');
            if (row.members && Array.isArray(row.members)) {
              const ids = row.members.map(m => Number(m.customer_id));
              if (typeof window._customerEditorModal.setCustomerIds === 'function') window._customerEditorModal.setCustomerIds(ids);
            }
          } else {
            console.warn('CustomerEditorModal not initialized');
          }
        } else {
          alert('ไม่พบข้อมูลกลุ่มลูกค้าที่ต้องการแก้ไข');
        }
      } catch (err) {
        console.error('customers:edit handler failed', err);
        alert('เกิดข้อผิดพลาดขณะโหลดข้อมูลสำหรับแก้ไข');
      }
    });

    document.addEventListener('customer:add:submitted', function (ev) {
      try {
        const pid = ev && ev.detail && ev.detail.promotion_id ? ev.detail.promotion_id : null;
        if (pid && window._CustomerTableManager) {
          window._CustomerTableManager.refresh(pid);
        }
      } catch (e) {
        console.warn('customer:add:submitted refresh handler failed', e);
      }
    });


    try {
      if (typeof API !== 'undefined' && API.getCustomerOptions) {
        const options = await API.getCustomerOptions();
        if (AddModal && typeof AddModal.setOptions === 'function') {
          AddModal.setOptions(options || {});
        }
      }
    } catch (err) {
      console.error('Failed to load customer options:', err);
    }

    window._customerEditorModal = EditorModal;
    window._customerAddModal = AddModal;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomerModule);
  } else {
    initCustomerModule();
  }

})();
