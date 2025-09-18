// promotionTable.js (dropdown version)
// Requirements: jQuery + bootstrap-table must be loaded first (global $)

(function () {
  function escAttr(v = '') {
    return String(v).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  class PromotionTable extends HTMLElement {
    constructor() {
      super();
      this._id = 'tbl-' + Math.random().toString(36).slice(2,9);
      this._data = [];
      this._cols = [];
      this._initialized = false;
      this._conditionOptions = [
        // default options (value stored in DB, label shown to user)
        { value: '', label: '-' },
        { value: '5', label: 'จำนวนขั้นต่ำ 5 ชิ้น' },
        { value: '10', label: 'จำนวนขั้นต่ำ 10 ชิ้น' },
        { value: '500', label: 'สะสมแต้ม ≥ 500' },
        { value: '2000', label: 'ซื้อขั้นต่ำ 2,000 บาท' },
      ];
      this._onConditionUpdatedHandler = this._onConditionUpdated.bind(this); // for external events
    }

    connectedCallback() {
      this.classList.add('promotion-table-component');
      const minw = this.getAttribute('data-minwidth') || '1200';
      this.innerHTML = `
        <div class="promotion-table-minimal">
          <div class="table-inner-wrap" style="min-width:${escAttr(minw)}px;">
            <table id="${this._id}" class="table table-hover table-sm"></table>
          </div>
        </div>
      `;
      this._table = this.querySelector(`#${this._id}`);

      // delegated change handler: when .condition-select changes -> update row & dispatch
      this.addEventListener('change', (ev) => {
        const sel = ev.target.closest && ev.target.closest('.condition-select');
        if (!sel) return;
        const rowId = sel.dataset.rowId;
        const newVal = sel.value;
        this._handleConditionChange(rowId, newVal);
      });

      // listen for external updates if needed
      window.addEventListener('condition-updated', this._onConditionUpdatedHandler);

      setTimeout(() => this._initIfReady(), 0);
    }

    disconnectedCallback() {
      window.removeEventListener('condition-updated', this._onConditionUpdatedHandler);
    }

    // API to set dropdown options for condition column
    setConditionOptions(options = []) {
      if (!Array.isArray(options)) return;
      // expect options like [{value:'2000', label:'ซื้อขั้นต่ำ 2,000 บาท'}, ...]
      this._conditionOptions = options.slice();
      // If already initialized, refresh table config (recreate columns to include new option labels)
      if (this._initialized) {
        $(this._table).bootstrapTable('destroy');
        this._initialized = false;
        this._initIfReady();
        // reload data
        $(this._table).bootstrapTable('load', this._data);
      }
    }

    _renderConditionSelectHtml(value, row) {
      const opts = this._conditionOptions.map(o => {
        const sel = String(o.value) === String(value) ? ' selected' : '';
        return `<option value="${escAttr(o.value)}"${sel}>${escAttr(o.label)}</option>`;
      }).join('');
      return `<select class="condition-select form-select form-select-sm" data-row-id="${escAttr(row.id ?? '')}">${opts}</select>`;
    }

    _handleConditionChange(rowId, newVal) {
      // update internal data
      const idx = this._data.findIndex(r => String(r.id) === String(rowId));
      if (idx === -1) return;
      this._data[idx].condition = newVal;
      // optionally add human label field
      const opt = this._conditionOptions.find(o => String(o.value) === String(newVal));
      if (opt) this._data[idx].condition_text = opt.label;
      else this._data[idx].condition_text = String(newVal);

      // update bootstrap-table row using uniqueId
      if (this._initialized && $.fn.bootstrapTable) {
        $(this._table).bootstrapTable('updateByUniqueId', { id: this._data[idx].id, row: this._data[idx] });
      }

      // dispatch global event so other parts can react
      window.dispatchEvent(new CustomEvent('condition-updated', {
        detail: { rowId: this._data[idx].id, condition: newVal, text: this._data[idx].condition_text }
      }));
      // also dispatch local component event
      this.dispatchEvent(new CustomEvent('promo-data-changed', { detail: { count: this._data.length, data: this._data } }));
    }

    _onConditionUpdated(ev) {
      // if some other place dispatches condition-updated, sync this table too
      const d = ev.detail || {};
      const rowId = d.rowId;
      const cond = d.condition;
      if (rowId === undefined || cond === undefined) return;
      const idx = this._data.findIndex(r => String(r.id) === String(rowId));
      if (idx !== -1) {
        this._data[idx].condition = cond;
        this._data[idx].condition_text = d.text ?? String(cond);
        if (this._initialized && $.fn.bootstrapTable) {
          $(this._table).bootstrapTable('updateByUniqueId', { id: this._data[idx].id, row: this._data[idx] });
        }
      }
    }

    _initIfReady() {
      if (this._initialized) return;
      if (!window.jQuery || !$.fn.bootstrapTable) {
        setTimeout(() => this._initIfReady(), 120);
        return;
      }

      // setup default columns if none provided (condition column uses select formatter)
      if (!this._cols || !this._cols.length) {
        this._cols = [
          { field: 'state', checkbox: true },
          { field: 'id', title: 'ID', sortable: true },
          { field: 'code', title: 'Code', sortable: true },
          { field: 'customer_name', title: 'ชื่อลูกค้า', sortable: true },
          {
            field: 'condition',
            title: 'เงื่อนไข',
            sortable: true,
            formatter: (value, row) => {
              return this._renderConditionSelectHtml(value, row);
            }
          }
        ];
      } else {
        // ensure condition column has select formatter
        this._cols = this._cols.map(col => {
          if (col.field === 'condition' && !col.formatter) {
            col.formatter = (value, row) => this._renderConditionSelectHtml(value, row);
          }
          return col;
        });
      }

      $(this._table).bootstrapTable({
        columns: this._cols,
        data: this._data,
        pagination: true,
        pageSize: 5,
        pageList: [5, 10, 25, 'All'],
        search: true,
        sidePagination: 'client',
        classes: 'table table-hover',
        undefinedText: '-',
        uniqueId: 'id'
      });

      this._initialized = true;
    }

    // API methods
    setColumns(cols = []) {
      this._cols = Array.isArray(cols) ? cols : [];
      if (this._initialized) {
        $(this._table).bootstrapTable('destroy');
        this._initialized = false;
      }
      this._initIfReady();
    }

    setData(data = []) {
      this._data = Array.isArray(data) ? data.map((r, i) => ({ id: r.id ?? (i+1), ...r })) : [];
      if (!this._initialized) this._initIfReady();
      if (this._initialized) $(this._table).bootstrapTable('load', this._data);
      this.dispatchEvent(new CustomEvent('promo-data-changed', { detail: { count: this._data.length, data: this._data } }));
    }

    setPageSize(n) {
      if (this._initialized) $(this._table).bootstrapTable('refreshOptions', { pageSize: n });
    }

    search(q = '') {
      if (this._initialized) $(this._table).bootstrapTable('search', q);
    }

    getSelections() {
      return this._initialized ? $(this._table).bootstrapTable('getSelections') : [];
    }

    refresh() {
      if (this._initialized) $(this._table).bootstrapTable('refresh', { silent: true });
    }
  }

  customElements.define('promotion-table', PromotionTable);
})();
