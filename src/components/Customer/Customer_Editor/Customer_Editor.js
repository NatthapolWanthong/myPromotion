// Customer_Editor.js
(function () {
  class CustomerEditorModal {
    constructor(modalId = 'customer-editor-modal') {
      this._el = document.getElementById(modalId);
      this._pid = '';
      this._pname = '';

      // ปุ่มปิด
      this._el.querySelectorAll('[data-role="close"], [data-role="cancel"]')
        .forEach(b => b.addEventListener('click', () => this.close()));

      // ปุ่มเพิ่ม
      this._el.querySelectorAll('[data-role="add"]')
      .forEach(b => b.addEventListener('click', () => this.add()));
      
      // backdrop click
      const backdrop = this._el.querySelector('[data-role="backdrop"]');
      backdrop && backdrop.addEventListener('click', () => this.close());

      // ปุ่มเพิ่มลูกค้า
      const addBtn = this._el.querySelector('#ce-add');
      addBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('customers:open-add', { detail: { promotion_id: this._pid } }));
      });

      this._onKey = (e) => { if (e.key === 'Escape') this.close(); };
    }

    open(pid, pname = '') {
      this._pid = pid;
      this._pname = pname;

      this._el.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      const pidEl = this._el.querySelector('#ce-pid');
      const pnameEl = this._el.querySelector('#ce-pname');
      pidEl && (pidEl.textContent = this._pid);
      pnameEl && (pnameEl.textContent = this._pname ? ` - ${this._pname}` : '');

      const tbody = this._el.querySelector('#ce-tbody');
      tbody && (tbody.innerHTML = '<tr><td colspan="11" class="small text-muted">ยังไม่ได้โหลดข้อมูล</td></tr>');

      document.addEventListener('keydown', this._onKey);
    }

    close() {
      this._el.style.display = 'none';
      document.body.style.overflow = '';
      document.removeEventListener('keydown', this._onKey);
    }

    add() {
      console.log("Add!")
    }
  }

  window.CustomerEditorModal = CustomerEditorModal;
})();
