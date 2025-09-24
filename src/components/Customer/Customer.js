// Customer.js

import { API } from '../../assets/js/api.js';

const EditorModal = new (window.CustomerEditorModal || function(){})();
const AddModal = new (window.CustomerAddModal || function(){})();

document.addEventListener('click', function (ev) {
  const btn = ev.target.closest && ev.target.closest('.btn-ModalCustomerEditor');
  if (!btn) return;

  // open modal
  const pid = btn.dataset.promotionId || btn.getAttribute('data-promotion-id') || '';
  const pname = btn.dataset.promotionName || btn.getAttribute('data-promotion-name') || '';
  EditorModal.open(pid, pname);
});

// ปุ่ม 'เพิ่มลูกค้า' ใน CustomerEditorModal
document.addEventListener('customers:open-add', function (ev) {
  const pid = (ev && ev.detail && ev.detail.promotion_id) ? ev.detail.promotion_id : '';
  AddModal.open(pid);
});

const options = await API.getCustomerOptions();

console.log(options)