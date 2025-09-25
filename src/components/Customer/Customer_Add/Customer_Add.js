// Customer_Add.js (cleaned, removed unused pieces, fixed small bugs)
// Note: This file exports window.CustomerAddModal (no auto-init here).
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

  /* ---------------------------
     FilterManager
     - Responsible for building filter dropdowns in toolbar
     --------------------------- */
  class FilterManager {
    constructor(config = [], toolbarSelector = '#ca-toolbar') {
      this.config = config.slice();
      this.toolbarSelector = toolbarSelector;
      this._initToolbar();
    }

    _initToolbar() {
      const toolbar = dom.qs(this.toolbarSelector);
      if (!toolbar) return;

      this.config.forEach(cfg => {
        if (dom.qs(`#${cfg.id}-wrapper`)) return; // guard duplicate
        const wrapper = document.createElement('div');
        wrapper.id = `${cfg.id}-wrapper`;
        wrapper.className = 'btn-group filter-group dropdown';
        wrapper.style.minWidth = '140px';
        wrapper.style.maxWidth = '220px';
        wrapper.style.marginRight = '6px';
        wrapper.setAttribute('data-bs-auto-close', 'outside');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-secondary btn-sm dropdown-toggle';
        btn.setAttribute('data-bs-toggle', 'dropdown');
        btn.setAttribute('aria-expanded', 'false');
        btn.id = `${cfg.id}-btn`;
        btn.textContent = cfg.placeholder;

        const menu = document.createElement('div');
        menu.className = 'dropdown-menu p-2';
        menu.style.maxHeight = '260px';
        menu.style.overflow = 'auto';
        menu.style.minWidth = '220px';
        menu.id = `${cfg.id}-menu`;
        menu.setAttribute('aria-labelledby', btn.id);

        // control row: select all / clear
        const ctrlRow = document.createElement('div');
        ctrlRow.style.display = 'flex';
        ctrlRow.style.justifyContent = 'space-between';
        ctrlRow.style.gap = '6px';
        ctrlRow.style.paddingBottom = '6px';

        const selectAllBtn = document.createElement('button');
        selectAllBtn.type = 'button';
        selectAllBtn.className = 'btn btn-link btn-sm p-0';
        selectAllBtn.textContent = 'เลือกทั้งหมด';
        selectAllBtn.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation();
          this._setAllInMenu(cfg.id, true);
          this.applyFilters();
        });

        const clearCtrlBtn = document.createElement('button');
        clearCtrlBtn.type = 'button';
        clearCtrlBtn.className = 'btn btn-link btn-sm p-0';
        clearCtrlBtn.textContent = 'ล้าง';
        clearCtrlBtn.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation();
          this._setAllInMenu(cfg.id, false);
          this.applyFilters();
        });

        ctrlRow.appendChild(selectAllBtn);
        ctrlRow.appendChild(clearCtrlBtn);
        menu.appendChild(ctrlRow);

        // search inside dropdown
        const searchWrap = document.createElement('div');
        searchWrap.style.paddingBottom = '6px';
        const searchInput = document.createElement('input');
        searchInput.type = 'search';
        searchInput.className = 'form-control form-control-sm';
        searchInput.placeholder = 'ค้นหา...';
        searchInput.addEventListener('input', (e) => { e.stopPropagation(); this._filterMenuItems(cfg.id, e.target.value); });
        searchWrap.appendChild(searchInput);
        menu.appendChild(searchWrap);

        wrapper.appendChild(btn);
        wrapper.appendChild(menu);
        toolbar.appendChild(wrapper);

        cfg._btn = btn; cfg._menu = menu; cfg._search = searchInput;
        menu.addEventListener('click', (ev) => ev.stopPropagation());
      });

      // global filter clear button (guarded)
      if (!dom.qs('#ca-filter-clear')) {
        const clearAll = document.createElement('button');
        clearAll.id = 'ca-filter-clear';
        clearAll.type = 'button';
        clearAll.className = 'btn btn-outline-secondary btn-sm';
        clearAll.textContent = 'ล้าง';
        clearAll.addEventListener('click', () => { this.clearSelections(); this.refreshTable(); });
        toolbar.appendChild(clearAll);
      }
    }

    _setAllInMenu(cfgId, checked) {
      const inputs = dom.qsa(`#${cfgId}-menu .filter-checkbox`);
      inputs.forEach(i => i.checked = checked);
      const cfg = this.config.find(c => c.id === cfgId);
      if (cfg) this._refreshButtonLabel(cfg);
    }

    _filterMenuItems(cfgId, query) {
      const q = String(query || '').trim().toLowerCase();
      const menu = dom.qs(`#${cfgId}-menu`);
      if (!menu) return;
      menu.querySelectorAll('.dropdown-item').forEach(item => {
        if (item.querySelector && item.querySelector('.form-check')) {
          const text = item.textContent.trim().toLowerCase();
          item.style.display = q ? (text.includes(q) ? '' : 'none') : '';
        }
      });
    }

    setOptions(options = {}) {
      const map = { type_area: 'TypeAreas', area_name: 'AreaNames', segment: 'Segments', grade: 'Grades', size: 'Sizes' };
      this.config.forEach(cfg => {
        const menu = dom.qs(`#${cfg.id}-menu`); if (!menu) return;
        // remove previous options (keep first two: ctrlRow & search)
        while (menu.children.length > 2) menu.removeChild(menu.lastChild);

        const key = map[cfg.field];
        const arr = Array.isArray(options[key]) ? options[key] : [];
        arr.forEach(item => {
          const labelText = item.name ?? item.code ?? String(item.id ?? '');
          const value = (item.id !== undefined && item.id !== null) ? String(item.id) : (item.code ?? item.name ?? '');
          if (!labelText && !value) return;

          const safeId = encodeURIComponent(cfg.id + '-opt-' + value);
          const itemWrap = document.createElement('div');
          itemWrap.className = 'dropdown-item';
          itemWrap.style.padding = '4px 6px';

          const fc = document.createElement('div');
          fc.className = 'form-check';

          const input = document.createElement('input');
          input.type = 'checkbox';
          input.className = 'form-check-input filter-checkbox';
          input.dataset.field = cfg.field;
          input.dataset.value = String(value);
          input.id = safeId;

          const label = document.createElement('label');
          label.className = 'form-check-label';
          label.htmlFor = input.id;
          label.textContent = labelText;

          input.addEventListener('change', (ev) => { ev.stopPropagation(); this._refreshButtonLabel(cfg); this.applyFilters(); });

          fc.appendChild(input);
          fc.appendChild(label);
          itemWrap.appendChild(fc);
          menu.appendChild(itemWrap);
        });

        this._refreshButtonLabel(cfg);
      });
    }

    _getSelectedValues(field) {
      return Array.from(document.querySelectorAll(`.filter-checkbox[data-field="${field}"]:checked`)).map(i => {
        const v = i.dataset.value;
        return (v !== undefined && v !== null && v !== '') ? (isFinite(v) ? Number(v) : v) : v;
      });
    }

    _getSelectedLabels(field) {
      return Array.from(document.querySelectorAll(`.filter-checkbox[data-field="${field}"]:checked`)).map(i => {
        const labelEl = i.nextElementSibling;
        return labelEl ? labelEl.textContent.trim() : String(i.dataset.value);
      });
    }

    getFilters() {
      const out = {};
      this.config.forEach(cfg => {
        const vals = this._getSelectedValues(cfg.field);
        if (vals.length) out[cfg.field] = vals;
      });
      return out;
    }

    applyFilters() { this.refreshTable(); }

    refreshTable() {
      const $table = window.jQuery && window.jQuery('#ca-table');
      if (!$table || !$table.bootstrapTable) return;
      $table.bootstrapTable('refresh', { silent: true });
    }

    _refreshButtonLabel(cfg) {
      const btn = cfg._btn || dom.qs(`#${cfg.id}-btn`);
      if (!btn) return;
      const labels = this._getSelectedLabels(cfg.field);
      btn.textContent = labels.length === 0 ? cfg.placeholder
        : labels.length === 1 ? labels[0]
        : `${cfg.placeholder} (${labels.length})`;
    }

    clearSelections() {
      document.querySelectorAll('.filter-checkbox').forEach(i => i.checked = false);
      this.config.forEach(cfg => this._refreshButtonLabel(cfg));
    }
  }

  /* ---------------------------
     CustomerAddModal (cleaned)
     --------------------------- */
  class CustomerAddModal {
    constructor(modalId = 'customer-add-modal') {
      this._el = dom.qs(`#${modalId}`);
      if (!this._el) throw new Error('Modal element not found: ' + modalId);

      this._onKey = e => { if (e.key === 'Escape') this.close(); };

      // close handlers
      dom.qsa('[data-role="close"], [data-role="cancel"]', this._el).forEach(b => b.addEventListener('click', () => this.close()));
      const backdrop = dom.qs('[data-role="backdrop"]', this._el); backdrop && backdrop.addEventListener('click', () => this.close());
      dom.qs('#ca-save', this._el)?.addEventListener('click', () => this._onSave());

      const cfg = [
        { id: 'filter-type_area', field: 'type_area', placeholder: 'กลุ่มเขต' },
        { id: 'filter-area_name', field: 'area_name', placeholder: 'เขต' },
        { id: 'filter-segment', field: 'segment', placeholder: 'กลุ่มลูกค้า' },
        { id: 'filter-grade', field: 'grade', placeholder: 'เกรด' },
        { id: 'filter-size', field: 'size', placeholder: 'ขนาด' }
      ];

      this.filterManager = new FilterManager(cfg, '#ca-toolbar');

      // authoritative selected ids across pages
      this.selectedIds = new Set();

      // UI controls
      this._selectedCountEl = null;
      this._clearSelectedBtn = null;
      this._setupSelectedControls();

      // init table and wire selection handlers
      this._initTable();
    }

    /* Public API */
    getSelectedIds() { return Array.from(this.selectedIds); }

    setSelectedIds(ids = []) {
      this.selectedIds.clear();
      (Array.isArray(ids) ? ids : []).forEach(i => {
        if (i !== undefined && i !== null && i !== '') this.selectedIds.add(Number(i));
      });
      this._syncTableChecksToStore();
      this.updateSelectedCount();
    }

    /* UI controls */
    _setupSelectedControls() {
      if (dom.qs('#ca-selected-controls')) return; // guard duplicate

      const toolbar = dom.qs('#ca-toolbar');
      if (!toolbar) return;

      const controlsWrap = dom.create('div', { id: 'ca-selected-controls' });
      controlsWrap.style.marginLeft = 'auto';
      controlsWrap.style.display = 'flex';
      controlsWrap.style.alignItems = 'center';
      controlsWrap.style.gap = '8px';

      const countBtn = dom.create('button', { type: 'button', id: 'ca-selected-count' });
      countBtn.className = 'btn btn-outline-info btn-sm';
      countBtn.textContent = 'เลือกแล้ว: 0';
      countBtn.title = 'จำนวนลูกค้าที่เลือกไว้ (ข้ามหน้า)';

      const clearBtn = dom.create('button', { type: 'button', id: 'ca-clear-selected' });
      clearBtn.className = 'btn btn-outline-danger btn-sm';
      clearBtn.textContent = 'ล้างการเลือก';
      clearBtn.title = 'ล้างการเลือกทั้งหมด';
      clearBtn.addEventListener('click', (e) => { e.preventDefault(); this.clearAllSelected(); });

      controlsWrap.appendChild(countBtn);
      controlsWrap.appendChild(clearBtn);
      toolbar.appendChild(controlsWrap);

      this._selectedCountEl = countBtn;
      this._clearSelectedBtn = clearBtn;
      this.updateSelectedCount();
    }

    updateSelectedCount() {
      const n = this.selectedIds.size;
      if (this._selectedCountEl) this._selectedCountEl.textContent = `เลือกแล้ว: ${n}`;
      if (this._clearSelectedBtn) this._clearSelectedBtn.disabled = (n === 0);
    }

    clearAllSelected() {
      this.selectedIds.clear();

      const $table = window.jQuery && window.jQuery('#ca-table');
      if ($table && $table.length && $table.bootstrapTable) {
        try { $table.bootstrapTable('uncheckAll'); }
        catch (err) { document.querySelectorAll('#ca-table tbody input[type="checkbox"]').forEach(cb => cb.checked = false); }
      }

      this.updateSelectedCount();
    }

    /* Recompute authoritative store from visible table state */
    _recomputeSelectedFromVisible() {
      const $table = window.jQuery && window.jQuery('#ca-table');
      if (!$table || !$table.length || !$table.bootstrapTable) { this.updateSelectedCount(); return; }

      const visibleRows = $table.bootstrapTable('getData') || [];
      const visibleIds = visibleRows.map(r => Number(r.id));
      const selectedRowsOnPage = ($table.bootstrapTable('getSelections') || []).map(r => Number(r.id));

      visibleIds.forEach(id => {
        if (selectedRowsOnPage.includes(id)) this.selectedIds.add(id);
        else this.selectedIds.delete(id);
      });

      this.updateSelectedCount();
    }

    /* Sync visible table checks to match the store */
    _syncTableChecksToStore() {
      const $table = window.jQuery && window.jQuery('#ca-table');
      if (!$table || !$table.length || !$table.bootstrapTable) return;

      const visibleRows = $table.bootstrapTable('getData') || [];
      const visibleIds = visibleRows.map(r => Number(r.id));

      const toCheck = visibleIds.filter(id => this.selectedIds.has(id));
      const toUncheck = visibleIds.filter(id => !this.selectedIds.has(id));

      if (toUncheck.length) {
        try { $table.bootstrapTable('uncheckBy', { field: 'id', values: toUncheck }); } catch (e) { /* ignore */ }
      }
      if (toCheck.length) {
        try { $table.bootstrapTable('checkBy', { field: 'id', values: toCheck }); } catch (e) { /* ignore */ }
      }

      this.updateSelectedCount();
    }

    /* Table init & events */
    _initTable() {
      const self = this;
      const $table = window.jQuery && window.jQuery('#ca-table');
      if (!$table || !$table.length) return;

      if ($table.data('bootstrap.table')) $table.bootstrapTable('destroy');

      $table.bootstrapTable({
        url: '/myPromotion/src/connection/Customer/getCustomer.php',
        method: 'post',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        pagination: true,
        sidePagination: 'server',
        pageSize: 10,
        pageList: [10, 25, 50, 100],
        search: true,
        showRefresh: true,
        showColumns: true,
        sortName: 'id',
        sortOrder: 'ASC',
        clickToSelect: true,
        queryParams(params) {
          const page = params.pageNumber || (params.offset ? (Math.floor(params.offset / params.limit) + 1) : 1);
          const per_page = params.pageSize || params.limit || 10;
          const q = params.searchText ?? params.search ?? '';
          const sortByRaw = params.sortName ?? params.sort ?? params.sortField ?? '';
          const sortBy = (typeof sortByRaw === 'string' && sortByRaw.length) ? sortByRaw : 'id';
          const orderRaw = params.sortOrder ?? params.order ?? params.orderBy ?? '';
          const order = (typeof orderRaw === 'string' && orderRaw.length) ? String(orderRaw).toUpperCase() : 'ASC';
          const filters = self.filterManager.getFilters ? self.filterManager.getFilters() : {};
          return { page, per_page, q, sortBy, order, filters };
        },
        responseHandler(res) { return res; }
      });

      // Use recompute-from-visible strategy on selection events
      ['check.bs.table', 'uncheck.bs.table', 'check-all.bs.table', 'uncheck-all.bs.table'].forEach(evt => {
        $table.on(evt, () => { self._recomputeSelectedFromVisible(); });
      });

      // On load, sync visible checks to store then recompute for safety
      $table.on('load-success.bs.table', () => {
        self._syncTableChecksToStore();
        self._recomputeSelectedFromVisible();
      });
    }

    /* Modal lifecycle */
    setOptions(options = {}) { this.filterManager.setOptions(options); }

    open(pid = '') {
      this._el.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      const pidInput = dom.qs('#ca-promotion-id'); if (pidInput) pidInput.value = pid;
      document.addEventListener('keydown', this._onKey);

      const $table = window.jQuery && window.jQuery('#ca-table');
      if ($table && $table.length) $table.bootstrapTable('refresh', { silent: true });

      this.updateSelectedCount();
    }

    close() {
      this._el.style.display = 'none';
      document.body.style.overflow = '';
      document.removeEventListener('keydown', this._onKey);
      this.filterManager.clearSelections();
    }

    _onSave() {
      const pid = dom.qs('#ca-promotion-id')?.value ?? '';
      const code = dom.qs('#ca-code')?.value ?? '';
      const name = dom.qs('#ca-name')?.value ?? '';
      const payload = { promotion_id: pid, code, name, selected_ids: this.getSelectedIds() };
      document.dispatchEvent(new CustomEvent('customer:add:submitted', { detail: payload }));
      this.close();
    }
  }

  // export class only (no auto-init)
  window.CustomerAddModal = CustomerAddModal;
})();
