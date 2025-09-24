// Customer_Add.js
import { API } from '../../../assets/js/api.js';

(function () {
  class FilterManager {
    constructor(config = [], tableSelector = '#ca-table', toolbarSelector = '#ca-toolbar') {
      this.config = config.slice();
      this.tableSelector = tableSelector;
      this.toolbarSelector = toolbarSelector;
      this.originalData = [];
      this._initToolbar();
    }

    _initToolbar() {
      const toolbar = document.querySelector(this.toolbarSelector);
      if (!toolbar) return;

      this.config.forEach(cfg => {
        if (document.getElementById(cfg.id + '-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.id = cfg.id + '-wrapper';
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
        btn.id = cfg.id + '-btn';
        btn.textContent = cfg.placeholder;

        const menu = document.createElement('div');
        menu.className = 'dropdown-menu p-2';
        menu.style.maxHeight = '260px';
        menu.style.overflow = 'auto';
        menu.style.minWidth = '220px';
        menu.setAttribute('aria-labelledby', btn.id);
        menu.id = cfg.id + '-menu';

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
          e.preventDefault(); e.stopPropagation(); this._setAllInMenu(cfg.id, true); this.applyFilters();
        });

        const clearCtrlBtn = document.createElement('button');
        clearCtrlBtn.type = 'button';
        clearCtrlBtn.className = 'btn btn-link btn-sm p-0';
        clearCtrlBtn.textContent = 'ล้าง';
        clearCtrlBtn.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation(); this._setAllInMenu(cfg.id, false); this.applyFilters();
        });

        ctrlRow.appendChild(selectAllBtn);
        ctrlRow.appendChild(clearCtrlBtn);
        menu.appendChild(ctrlRow);

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

      if (!document.getElementById('ca-filter-clear')) {
        const clearAll = document.createElement('button');
        clearAll.id = 'ca-filter-clear';
        clearAll.type = 'button';
        clearAll.className = 'btn btn-outline-secondary btn-sm';
        clearAll.textContent = 'ล้าง';
        clearAll.addEventListener('click', () => { this.clearSelections(); this.restoreTable(); });
        toolbar.appendChild(clearAll);
      }
    }

    _setAllInMenu(cfgId, checked) {
      const inputs = document.querySelectorAll(`#${cfgId}-menu .filter-checkbox`);
      inputs.forEach(i => i.checked = checked);
      const cfg = this.config.find(c => c.id === cfgId);
      if (cfg) this._refreshButtonLabel(cfg);
    }

    _filterMenuItems(cfgId, query) {
      const q = String(query || '').trim().toLowerCase();
      const menu = document.getElementById(cfgId + '-menu'); if (!menu) return;
      menu.querySelectorAll('.dropdown-item').forEach(item => {
        const text = item.textContent.trim().toLowerCase();
        item.style.display = q ? (text.includes(q) ? '' : 'none') : '';
      });
    }

    setOptions(options = {}) {
      const map = { type_area: 'TypeAreas', area_name: 'AreaNames', segment: 'Segments', grade: 'Grades', size: 'Sizes' };
      this.config.forEach(cfg => {
        const menu = document.getElementById(cfg.id + '-menu'); if (!menu) return;
        while (menu.children.length > 2) menu.removeChild(menu.lastChild);
        const key = map[cfg.field]; const arr = Array.isArray(options[key]) ? options[key] : [];
        arr.forEach(item => {
          const text = item.name ?? item.code ?? item.id ?? '';
          const value = item.code ?? item.name ?? item.id ?? '';
          if (!text && !value) return;
          const safeId = encodeURIComponent(cfg.id + '-opt-' + value);
          const itemWrap = document.createElement('div'); itemWrap.className = 'dropdown-item'; itemWrap.style.padding = '4px 6px';
          const fc = document.createElement('div'); fc.className = 'form-check';
          const input = document.createElement('input'); input.type = 'checkbox'; input.className = 'form-check-input filter-checkbox';
          input.dataset.field = cfg.field; input.dataset.value = String(value); input.id = safeId;
          const label = document.createElement('label'); label.className = 'form-check-label'; label.htmlFor = input.id; label.textContent = text;
          input.addEventListener('change', (ev) => { ev.stopPropagation(); this._refreshButtonLabel(cfg); this.applyFilters(); });
          fc.appendChild(input); fc.appendChild(label); itemWrap.appendChild(fc); menu.appendChild(itemWrap);
        });
        this._refreshButtonLabel(cfg);
      });
    }

    _getSelectedValues(field) {
      return Array.from(document.querySelectorAll(`.filter-checkbox[data-field="${field}"]:checked`)).map(i => String(i.dataset.value));
    }

    applyFilters() {
      const $table = window.jQuery && window.jQuery(this.tableSelector);
      if (!$table || !$table.bootstrapTable) return;

      if (!this.originalData.length) this.originalData = $table.bootstrapTable('getData') || [];

      const criteria = {};
      this.config.forEach(cfg => { const vals = this._getSelectedValues(cfg.field); if (vals.length) criteria[cfg.field] = vals.map(v => v.toLowerCase()); });

      if (!Object.keys(criteria).length) { this.restoreTable(); return; }

      const filtered = this.originalData.filter(row => {
        return Object.entries(criteria).every(([f, allowed]) => {
          const v = row[f] !== undefined && row[f] !== null ? String(row[f]).toLowerCase() : '';
          return allowed.includes(v);
        });
      });

      $table.bootstrapTable('load', filtered);
    }

    restoreTable() {
      const $table = window.jQuery && window.jQuery(this.tableSelector);
      if (!$table || !$table.bootstrapTable) return;
      $table.bootstrapTable('load', this.originalData || []);
    }

    _refreshButtonLabel(cfg) {
      const btn = cfg._btn || document.getElementById(cfg.id + '-btn'); if (!btn) return;
      const selected = this._getSelectedValues(cfg.field);
      btn.textContent = selected.length === 0 ? cfg.placeholder
        : selected.length === 1 ? selected[0]
        : `${cfg.placeholder} (${selected.length})`;
    }

    clearSelections() {
      document.querySelectorAll('.filter-checkbox').forEach(i => i.checked = false);
      this.config.forEach(cfg => this._refreshButtonLabel(cfg));
      this.restoreTable();
    }
  }

  class CustomerAddModal {
    constructor(modalId = 'customer-add-modal') {
      this._el = document.getElementById(modalId);
      if (!this._el) throw new Error('Modal element not found: ' + modalId);

      this._el.querySelectorAll('[data-role="close"], [data-role="cancel"]').forEach(b => b.addEventListener('click', () => this.close()));
      const backdrop = this._el.querySelector('[data-role="backdrop"]'); backdrop && backdrop.addEventListener('click', () => this.close());
      const saveBtn = this._el.querySelector('#ca-save'); saveBtn && saveBtn.addEventListener('click', () => this._onSave());
      this._onKey = e => { if (e.key === 'Escape') this.close(); };

      const cfg = [
        { id: 'filter-type_area', field: 'type_area', placeholder: 'กลุ่มเขต' },
        { id: 'filter-area_name', field: 'area_name', placeholder: 'เขต' },
        { id: 'filter-segment', field: 'segment', placeholder: 'กลุ่มลูกค้า' },
        { id: 'filter-grade', field: 'grade', placeholder: 'เกรด' },
        { id: 'filter-size', field: 'size', placeholder: 'ขนาด' }
      ];

      this.filterManager = new FilterManager(cfg, '#ca-table', '#ca-toolbar');

      // refresh table when bootstrap-table loads
      const $table = window.jQuery && window.jQuery('#ca-table');
      if ($table && $table.length) {
        $table.on('load-success.bs.table', () => this.filterManager.restoreTable());
      }
    }

    setOptions(options = {}) { this.filterManager.setOptions(options); }

    open(pid = '') {
      this._el.style.display = 'flex'; document.body.style.overflow = 'hidden';
      const pidInput = this._el.querySelector('#ca-promotion-id'); pidInput && (pidInput.value = pid);
      const codeEl = this._el.querySelector('#ca-code'); const nameEl = this._el.querySelector('#ca-name');
      codeEl && (codeEl.value = ''); nameEl && (nameEl.value = '');
      document.addEventListener('keydown', this._onKey);
    }

    close() {
      this._el.style.display = 'none'; document.body.style.overflow = '';
      document.removeEventListener('keydown', this._onKey);
      this.filterManager.clearSelections();
    }

    _onSave() {
      const pid = this._el.querySelector('#ca-promotion-id').value;
      const code = this._el.querySelector('#ca-code').value;
      const name = this._el.querySelector('#ca-name').value;
      document.dispatchEvent(new CustomEvent('customer:add:submitted', { detail: { promotion_id: pid, code, name } }));
      this.close();
    }
  }

  window.CustomerAddModal = CustomerAddModal;
})();

(async () => {
  const CustomerOptions = await API.getCustomerOptions();
  const modal = new window.CustomerAddModal();
  modal.setOptions(CustomerOptions);
})();
