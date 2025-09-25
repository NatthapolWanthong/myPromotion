// Customer_Editor.js (patched, full file)
import { API } from '../../../assets/js/api.js';

(function () {
  'use strict';

  const dom = {
    qs(selector, root = document) { return (root || document).querySelector(selector); },
    qsa(selector, root = document) { return Array.from((root || document).querySelectorAll(selector)); },
    create(tag, attrs = {}) {
      const el = document.createElement(tag);
      Object.keys(attrs).forEach(k => {
        if (k === 'class') el.className = attrs[k];
        else if (k === 'text') el.textContent = attrs[k];
        else el.setAttribute(k, attrs[k]);
      });
      return el;
    }
  };

  class CustomerEditorModal {
    constructor(modalId = 'customer-editor-modal') {
      this._el = dom.qs(`#${modalId}`);
      if (!this._el) throw new Error(`Modal element not found: ${modalId}`);

      // state
      this.groupName = '';
      this.dateStart = null;
      this.dateEnd = null;
      this.conditionId = null;
      this.customerIds = [];     // authoritative ids list (from Customer_Add)
      this.promotionId = null;
      this.campaignId = null;

      // table instance flag
      this._tableInitialized = false;
      this._tableSelector = '#ce-table';

      // bind UI
      this._bindUIListeners();

      // init condition select (select2) control reference
      this._initConditionSelect();

      // keyboard close
      this._onKey = (e) => { if (e.key === 'Escape') this.close(); };

      // Listen to the global event that Customer_Add dispatches when user saves selection
      document.addEventListener('customer:add:submitted', (ev) => {
        try {
          const detail = (ev && ev.detail) ? ev.detail : {};
          const ids = Array.isArray(detail.selected_ids) ? detail.selected_ids : [];
          // Save promotion id if provided
          if (detail.promotion_id !== undefined && detail.promotion_id !== null && detail.promotion_id !== '') {
            this.promotionId = detail.promotion_id;
            const pidEl = dom.qs('#ce-pid', this._el);
            const pnameEl = dom.qs('#ce-pname', this._el);
            if (pidEl) pidEl.textContent = this.promotionId;
            if (pnameEl) pnameEl.textContent = detail.name ? ` - ${detail.name}` : '';
            // load conditions for this promotion
            this._loadConditions(this.promotionId).catch(err => console.warn('loadConditions failed', err));
          } else {
            // if no promotion_id, clear/disable select
            this._setConditionSelectDisabled(true);
          }
          // store ids and load customers
          this.setCustomerIds(ids);
          // open editor so user sees the results
          this.open(this.promotionId, detail.name ?? '');
        } catch (e) {
          console.error('customer:add:submitted handler failed', e);
        }
      });
    }

    _bindUIListeners() {
      dom.qsa('[data-role="close"], [data-role="cancel"]', this._el)
        .forEach(b => b.addEventListener('click', () => this.close()));
      dom.qsa('[data-role="add"]', this._el)
        .forEach(b => b.addEventListener('click', () => this.add()));
      const backdrop = dom.qs('[data-role="backdrop"]', this._el);
      backdrop && backdrop.addEventListener('click', () => this.close());

      const addBtn = dom.qs('#ce-add', this._el);
      addBtn && addBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('customers:open-add', { detail: { promotion_id: this._pid, customerIds: this.getCustomerIds() } }));
      });
    }

    _initConditionSelect() {
      this._conditionSelect = dom.qs('select[data-field="Customer-Editor-Condition"]', this._el);
      if (!this._conditionSelect) return;
      this._setConditionSelectDisabled(true);
      if (window.jQuery && typeof window.jQuery(this._conditionSelect).select2 === 'function') {
        window.jQuery(this._conditionSelect).select2({
          theme: 'bootstrap-5', placeholder: 'เลือกเงื่อนไข', allowClear: true, width: 'resolve', dropdownParent: window.jQuery(document.body)
        });
        window.jQuery(this._conditionSelect).on('change', () => {
          const val = window.jQuery(this._conditionSelect).val();
          this.conditionId = (val === null || val === undefined || val === '') ? null : (isFinite(val) ? Number(val) : val);
        });
      } else {
        this._conditionSelect.addEventListener('change', () => {
          const val = this._conditionSelect.value;
          this.conditionId = (val === '') ? null : (isFinite(val) ? Number(val) : val);
        });
      }
    }

    _setConditionSelectDisabled(disabled = true) {
      if (!this._conditionSelect) return;
      this._conditionSelect.disabled = !!disabled;
      if (window.jQuery && window.jQuery(this._conditionSelect).data('select2')) {
        window.jQuery(this._conditionSelect).trigger('change.select2');
      }
    }

    async _loadConditions(promotionId) {
      if (!this._conditionSelect) return;
      if (!promotionId) { this._clearConditionOptions(); this._setConditionSelectDisabled(true); return; }
      try {
        this._setConditionSelectDisabled(true);
        const res = await API.getCondition({ promotion_id: promotionId, page: 1, per_page: 1000, q: '', sortBy: 'id', order: 'ASC' });
        const arr = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
        this._clearConditionOptions();
        const placeholderOpt = document.createElement('option'); placeholderOpt.value = ''; placeholderOpt.textContent = ''; this._conditionSelect.appendChild(placeholderOpt);
        arr.forEach(item => {
          const id = (item.id !== undefined && item.id !== null) ? item.id : (item.condition_id ?? item.conditionId ?? null);
          const text = item.condition_name ?? item.name ?? item.conditionName ?? String(id ?? '');
          if (id === null || id === undefined) return;
          const opt = document.createElement('option'); opt.value = String(id); opt.textContent = text; this._conditionSelect.appendChild(opt);
        });
        this._setConditionSelectDisabled(false);
        if (window.jQuery && window.jQuery(this._conditionSelect).data('select2')) {
          window.jQuery(this._conditionSelect).trigger('change.select2');
        }
      } catch (err) {
        console.error('Failed to load conditions', err); this._clearConditionOptions(); this._setConditionSelectDisabled(true);
      }
    }

    _clearConditionOptions() {
      if (!this._conditionSelect) return;
      while (this._conditionSelect.firstChild) this._conditionSelect.removeChild(this._conditionSelect.firstChild);
      this.conditionId = null;
      if (window.jQuery && window.jQuery(this._conditionSelect).data('select2')) {
        window.jQuery(this._conditionSelect).val(null).trigger('change');
      } else { this._conditionSelect.value = ''; }
    }

    /* public API */
    getCustomerIds() { return Array.isArray(this.customerIds) ? this.customerIds.slice() : []; }

    setCustomerIds(ids = []) {
      this.customerIds = Array.isArray(ids) ? ids.map(i => Number(i)).filter(n => !Number.isNaN(n)) : [];
      if (this.customerIds.length === 0) { this._destroyTable(); this._renderEmptyState(); }
      else {
        if (this._tableInitialized) this._refreshTable(true);
        else { this._initTable(); this._refreshTable(true); }
      }
    }

    open(pid = '', pname = '') {
      this._pid = pid ?? ''; this._pname = pname ?? ''; if (this._pid) this.promotionId = this._pid;
      this._el.style.display = 'flex'; document.body.style.overflow = 'hidden';
      dom.qs('#ce-pid', this._el) && (dom.qs('#ce-pid', this._el).textContent = this._pid);
      dom.qs('#ce-pname', this._el) && (dom.qs('#ce-pname', this._el).textContent = this._pname ? ` - ${this._pname}` : '');
      if (this._pid) this._loadConditions(this._pid).catch(err => console.warn('loadConditions on open failed', err));
      if (Array.isArray(this.customerIds) && this.customerIds.length > 0) {
        if (typeof window.responseHandler !== 'function') window.responseHandler = (res) => res;
        this._initTable();
        this._refreshTable(true);
      } else {
        this._destroyTable(); this._renderEmptyState();
      }
      document.addEventListener('keydown', this._onKey);
    }

    close() {
      this._el.style.display = 'none'; document.body.style.overflow = ''; document.removeEventListener('keydown', this._onKey);
    }

    add() {
      document.dispatchEvent(new CustomEvent('customer-editor:add-clicked', { detail: { promotion_id: this.promotionId, customerIds: this.getCustomerIds() } }));
    }

    _renderEmptyState() {
      const tbody = dom.qs('#ce-tbody', this._el);
      if (tbody) tbody.innerHTML = '<tr><td colspan="12" class="small text-muted">ยังไม่มีลูกค้าที่ถูกเลือก</td></tr>';
      else {
        const table = dom.qs(this._tableSelector, this._el);
        if (table) table.innerHTML = '<tbody><tr><td colspan="12" class="small text-muted">ยังไม่มีลูกค้าที่ถูกเลือก</td></tr></tbody>';
      }
    }

    _initTable() {
      const self = this;
      const tableEl = dom.qs(this._tableSelector, this._el);
      console.debug('CustomerEditorModal._initTable() called', { tableElExists: !!tableEl, jquery: !!window.jQuery, bootstrapTableFn: !!(window.jQuery && window.jQuery.fn && window.jQuery.fn.bootstrapTable) });
      if (!tableEl) { console.warn('ce-table element not found'); return; }
      if (this._tableInitialized) return;

      try {
        // defensive: ensure bootstrap-table won't escape our HTML
        try {
          if (window.jQuery && window.jQuery.fn && window.jQuery.fn.bootstrapTable && window.jQuery.fn.bootstrapTable.defaults) {
            window.jQuery.fn.bootstrapTable.defaults.escape = false;
          }
        } catch (e) { /* ignore */ }

        const $tOld = window.jQuery && window.jQuery(tableEl);
        if ($tOld && $tOld.data && $tOld.data('bootstrap.table')) {
          try { $tOld.bootstrapTable('destroy'); } catch (e) { /* ignore */ }
        }

        const columns = [
          { checkbox: true },
          { field: 'id', visible: false, switchable: false },
          { field: 'code', title: 'รหัสลูกค้า', sortable: true },
          { field: 'name', title: 'ชื่อลูกค้า', sortable: true },
          { field: 'type_area', title: 'กลุ่มเขต', sortable: true },
          { field: 'area_name', title: 'เขต', sortable: true },
          { field: 'segment', title: 'กลุ่มลูกค้า', sortable: true },
          { field: 'grade', title: 'เกรด', sortable: true },
          { field: 'size', title: 'ขนาด', sortable: true },
          { field: 'province', title: 'จังหวัด', sortable: true },
          { field: 'district', title: 'อำเภอ', sortable: true },
          {
            field: 'select_all',
            title: 'ทุกรหัส',
            align: 'center',
            escape: false,
            cellStyle: function (value, row, index) {
              return { classes: 'td-select-all' };
            },
            formatter: function (value, row, index) {
              // value อาจเป็น true/false หรือ '1'/'0' หรือ string
              const checked = value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
              // data-row-id ให้ใช้ id ของ row
              const rid = row && (row.id ?? row.ID ?? row.uniqueId) ? String(row.id ?? row.ID ?? row.uniqueId) : '';
              // unique input id เพื่อ accessibility (ไม่จำเป็นแต่ดี)
              const inputId = `ce-select-${rid}-${index}`;
              return `<div class="form-check" style="display:flex; justify-content:center; align-items:center; height:100%;">
      <input class="form-check-input ce-input-selectall" type="checkbox" data-row-id="${rowId}" ${checked}>
    </div>`;
            }
          }

        ];

        // init table (we control init: ensure HTML doesn't auto-init)
        $(tableEl).bootstrapTable({
          url: '/myPromotion/src/connection/Customer/getCustomer.php',
          method: 'post',
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
          pagination: true,
          sidePagination: 'server',
          pageNumber: 1,
          pageSize: 10,
          pageList: [10, 25, 50, 100],
          search: true,
          showRefresh: true,
          showColumns: true,
          sortName: 'id',
          sortOrder: 'ASC',
          clickToSelect: true,
          uniqueId: 'id',
          columns: columns,
          queryParams(params) {
            const page = params.pageNumber || (params.offset ? (Math.floor(params.offset / params.limit) + 1) : 1);
            const per_page = params.pageSize || params.limit || 10;
            const q = params.searchText ?? params.search ?? '';
            const sortByRaw = params.sortName ?? params.sort ?? params.sortField ?? '';
            const sortBy = (typeof sortByRaw === 'string' && sortByRaw.length) ? sortByRaw : 'id';
            const orderRaw = params.sortOrder ?? params.order ?? params.orderBy ?? '';
            const order = (typeof orderRaw === 'string' && orderRaw.length) ? String(orderRaw).toUpperCase() : 'ASC';
            const filters = {};
            const payload = { page, per_page, q, sortBy, order, filters };
            if (Array.isArray(self.customerIds) && self.customerIds.length) payload.ids = self.customerIds;
            return payload;
          },
          responseHandler(res) { return res; }
        });

        // Delegated input handler
        $(tableEl).off('change.ce-input-selectall').on('change', '.ce-input-selectall', function () {
          try {
            const $el = $(this);
            const rowId = $el.data('row-id');
            const checked = $el.prop('checked') ? 1 : 0; // store as 1/0 or boolean ตามต้องการ
            console.debug('ce-input-selectall change', { rowId, checked });

            // update bootstrap-table cache via unique id
            try {
              $(tableEl).bootstrapTable('updateByUniqueId', { id: rowId, row: { select_all: checked } });
            } catch (err) {
              console.warn('updateByUniqueId failed', err);
            }

            // (optional) If you want to persist immediately, call API here:
            // API.saveCustomerSelectAll({ id: rowId, select_all: checked }).catch(err => console.error('save failed', err));
          } catch (e) {
            console.error('ce-input-selectall change handler failed', e);
          }
        });


        // post-body: ensure inputs exist (defensive against escape/sanitizer/auto-renders)
        $(tableEl).off('post-body.bs.table.ensureInputs').on('post-body.bs.table.ensureInputs', function () {
          try {
            const headerThs = tableEl.querySelectorAll('thead th');
            const expectedCells = headerThs.length;
            const rows = tableEl.querySelectorAll('tbody tr');

            // find index of select_all header (best effort)
            let selectIndex = -1;
            Array.from(headerThs).forEach((th, idx) => {
              const df = th.getAttribute('data-field') || th.dataset.field;
              if (df === 'select_all') selectIndex = idx;
            });
            // fallback to last column if not found
            if (selectIndex === -1) selectIndex = expectedCells - 1;

            rows.forEach((tr, idx) => {
              const currCells = tr.children.length;
              // ensure enough TDs
              if (currCells < expectedCells) {
                for (let i = currCells; i < expectedCells; i++) {
                  const td = document.createElement('td');
                  tr.appendChild(td);
                }
              }
              const tdSelect = tr.children[selectIndex];
              if (!tdSelect) return;

              // if checkbox already present skip
              if (tdSelect.querySelector('.ce-input-selectall')) return;

              // detect existing value in row data cell (if server returned select_all in row object,
              // bootstrap-table may have printed it elsewhere; fallback: unchecked)
              let rowId = tr.getAttribute('data-uniqueid') || tr.dataset.uniqueid || '';
              // try to extract select_all from bootstrap-table row cache if possible
              let val = '';
              try {
                const rowObj = $(tableEl).bootstrapTable('getRowByUniqueId', rowId);
                if (rowObj && rowObj.select_all !== undefined) val = rowObj.select_all;
              } catch (e) { /* ignore */ }

              const checked = (val === true || val === 1 || String(val).toLowerCase() === 'true' || String(val) === '1');

              // create checkbox element
              const inputId = `ce-select-${rowId}-${idx}`;
              tdSelect.innerHTML = `<div class="form-check" style="display:flex; justify-content:center; align-items:center; height:100%;">
      <input class="form-check-input ce-input-selectall" type="checkbox" data-row-id="${rowId}" ${checked}>
    </div>`;
            });

            console.debug('post-body.ensureInputs: ensured checkboxes count =', tableEl.querySelectorAll('.ce-input-selectall').length);
          } catch (e) {
            console.error('post-body.ensureInputs failed', e);
          }
        });


        // when rows are loaded: ensure selection sync & update badge
        $(tableEl).on('load-success.bs.table', function (e, data) {
          try {
            // preserve your existing selection sync + badge logic
            if (Array.isArray(self.customerIds) && self.customerIds.length) {
              try { $(tableEl).bootstrapTable('checkBy', { field: 'id', values: self.customerIds }); } catch (err) { /* ignore */ }
            }
            const total = (data && data.total) ? data.total : ($(tableEl).bootstrapTable('getOptions').totalRows || 0);
            const opts = $(tableEl).bootstrapTable('getOptions') || {};
            const page = opts.pageNumber || 1;
            const pageSize = opts.pageSize || 10;
            const totalPages = Math.max(1, Math.ceil((data && data.total ? data.total : 0) / pageSize));
            const pi = document.querySelector(`#paginationInfoCustomer-${self._pid ?? ''}`);
            if (pi) pi.textContent = `Page ${page} / ${totalPages}`;
            const badge = document.querySelector(`#customer-count-${self._pid ?? ''}`);
            if (badge) badge.textContent = String(total ?? 0);

            // --- START: ensure select_all TD + input exist ---
            const headerThs = tableEl.querySelectorAll('thead th');
            const expectedCells = headerThs.length;
            const rows = tableEl.querySelectorAll('tbody tr');

            rows.forEach(tr => {
              const currCells = tr.children.length;
              if (currCells < expectedCells) {
                for (let i = currCells; i < expectedCells; i++) {
                  const td = document.createElement('td');
                  // if this is the select_all column (last th has data-field="select_all")
                  // safer: check header data-field at this index
                  const th = headerThs[i];
                  const field = th ? (th.getAttribute('data-field') || th.dataset.field) : null;
                  if (field === 'select_all' || i === expectedCells - 1) {
                    const id = tr.getAttribute('data-uniqueid') || tr.dataset.uniqueid || '';
                    td.innerHTML = `<input type="text" class="form-control form-control-sm ce-input-selectall" data-row-id="${id}" value="">`;
                  } else {
                    td.textContent = '';
                  }
                  tr.appendChild(td);
                }
              } else {
                // if enough cells exist but select_all cell is empty or missing input, ensure input is present
                const thIndex = Array.from(headerThs).findIndex(t => (t.getAttribute('data-field') || t.dataset.field) === 'select_all');
                if (thIndex >= 0) {
                  const td = tr.children[thIndex];
                  if (td && !td.querySelector('.ce-input-selectall')) {
                    const id = tr.getAttribute('data-uniqueid') || tr.dataset.uniqueid || '';
                    // replace content
                    td.innerHTML = `<input type="text" class="form-control form-control-sm ce-input-selectall" data-row-id="${id}" value="${td.textContent.trim() || ''}">`;
                  }
                }
              }
            });
            // --- END: ensure select_all TD + input exist ---

          } catch (e) {
            console.error('load-success handler failed', e);
          }
        });


        // keep authoritative this.customerIds in sync with user selection
        $(tableEl).on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
          try {
            const selected = $(tableEl).bootstrapTable('getSelections') || [];
            const ids = selected.map(r => Number(r.id));
            self.customerIds = ids;
          } catch (e) { /* ignore */ }
        });

        this._tableInitialized = true;
      } catch (e) {
        console.error('init ce-table failed', e);
        this._tableInitialized = false;
      }
    }

    _destroyTable() {
      try {
        const tableEl = dom.qs(this._tableSelector, this._el);
        if (!tableEl) return;
        const $t = window.jQuery && window.jQuery(tableEl);
        if ($t && $t.data && $t.data('bootstrap.table')) {
          try { $t.bootstrapTable('destroy'); } catch (e) { /* ignore */ }
        }
        this._tableInitialized = false;
      } catch (e) {
        console.warn('destroy ce-table failed', e);
        this._tableInitialized = false;
      }
    }

    _refreshTable(forceQuery = false) {
      try {
        const tableEl = dom.qs(this._tableSelector, this._el);
        if (!tableEl) return;
        const $t = window.jQuery && window.jQuery(tableEl);
        if ($t && $t.data && $t.data('bootstrap.table')) {
          const opts = $t.bootstrapTable('getOptions') || {};
          const pageSize = opts.pageSize || 10;
          const sortBy = opts.sortName || 'id';
          const order = (opts.sortOrder || 'ASC').toUpperCase();
          const query = { page: 1, per_page: pageSize, q: '', sortBy, order, filters: {} };
          if (Array.isArray(this.customerIds) && this.customerIds.length) query.ids = this.customerIds;
          if (forceQuery) $t.bootstrapTable('refresh', { silent: false, query });
          else $t.bootstrapTable('refresh', { silent: false });
        } else {
          this._initTable();
        }
      } catch (e) {
        console.warn('refresh ce-table failed', e);
      }
    }

    async loadCustomersByIds(ids = []) {
      this.setCustomerIds(ids);
      if (this.customerIds.length > 0) this._refreshTable(true);
    }
  }

  // expose globally
  window.CustomerEditorModal = CustomerEditorModal;
})();
