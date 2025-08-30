import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';



export const swalConfirm = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-danger me-2",
        cancelButton: "btn btn-secondary"
      },
      buttonsStyling: true
    });



export const swalToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  showCloseButton: true, // ✅ ปุ่มปิด
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'colored-toast',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})



/**
 * @param {string} message - ข้อความที่จะแสดง
 * @param {'success'|'error'|'warning'|'info'|'question'} type - ประเภท toast
 */
export function showToast(message, type = 'info') {
  swalToast.fire({
    icon: type,
    title: message
  })
}



/**
 * แสดง alert
 * @param {string} message - ข้อความที่จะแสดง
 * @param {"success" | "danger" | "warning" | "info" | "primary"} type - ประเภท alert
 * @param {number} duration - เวลาที่ alert หายอัตโนมัติ (ms)
 */
export function showAlert(message, type = "success", duration = 5000  ) {
  const containerId = "toast-container";
  let container = document.getElementById(containerId);

  // สร้าง container ถ้ายังไม่มี
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.className = "position-fixed bottom-0 start-50 translate-middle-x mb-4 d-flex flex-column-reverse align-items-center gap-2";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  // สร้าง toast element
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show toast-custom`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toast); // เพิ่มไปล่างสุดของ stack

  // ลบอัตโนมัติหลัง timeout
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}