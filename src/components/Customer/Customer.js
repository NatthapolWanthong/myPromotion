// Customer.js (patched)
import { API } from '../../assets/js/api.js';

(function () {
  'use strict';

  async function initCustomerModule() {
    const EditorClass = window.CustomerEditorModal || null;
    const AddClass = window.CustomerAddModal || null;

    let EditorModal = null;
    let AddModal = null;
    try { EditorModal = EditorClass ? new EditorClass() : null; } catch (e) { console.error('EditorModal init failed', e); }
    try { AddModal = AddClass ? new AddClass() : null; } catch (e) { console.error('AddModal init failed', e); }


    document.addEventListener('click', function (ev) {
      const btn = ev.target.closest && ev.target.closest('.btn-ModalCustomerEditor');
      if (!btn) return;
      const pid = btn.dataset.promotionId || btn.getAttribute('data-promotion-id') || '';
      const pname = btn.dataset.promotionName || btn.getAttribute('data-promotion-name') || '';
      if (EditorModal && typeof EditorModal.open === 'function') EditorModal.open(pid, pname);
    });

    document.addEventListener('customers:open-add', function (ev) {
      const pid = (ev && ev.detail && ev.detail.promotion_id) ? ev.detail.promotion_id : '';
      const customerIds = (ev && ev.detail && Array.isArray(ev.detail.customerIds)) ? ev.detail.customerIds : [];
      if (AddModal && typeof AddModal.open === 'function') {
        AddModal.open(pid, customerIds);
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
