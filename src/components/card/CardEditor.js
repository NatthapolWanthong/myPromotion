import { API } from "/myPromotion/src/assets/js/api.js";
import { updateCardAppearance } from "/myPromotion/src/assets/js/cardUtils.js";
import { goToPromotionPage } from "/myPromotion/src/assets/js/navigationUtils.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';
import { swalConfirm , swalToast , showToast, showAlert} from '/myPromotion/src/assets/js/alertUtil.js'
import { UpdateStatusCount } from "/myPromotion/src/components/status-count/status-count.js"



export const CardEditController = {
  expandCardForEditing,
  registerCardEventListeners,
  trackCardChanges,
  toggleActionButtons,
};

// const swalWithBootstrapButtons = Swal.mixin({
//       customClass: {
//         confirmButton: "btn btn-danger me-2",
//         cancelButton: "btn btn-secondary"
//       },
//       buttonsStyling: false
//     });

// const Toast = Swal.mixin({
//   toast: true,
//   position: 'top-end', // เปลี่ยนตำแหน่งได้: 'top', 'top-start', 'bottom-end' ฯลฯ
//   showConfirmButton: false,
//   timer: 3000,
//   timerProgressBar: true,
//   customClass: {
//     popup: 'colored-toast' // เพิ่มคลาสแต่งเองได้
//   },
//   didOpen: (toast) => {
//     toast.addEventListener('mouseenter', Swal.stopTimer)
//     toast.addEventListener('mouseleave', Swal.resumeTimer)
//   }
// })

// ขยาด card ที่ถูก click
function expandCardForEditing(clickedCard) {
  const allCards = document.querySelectorAll(".cards , .campaignEditorContainer");

  allCards.forEach((card) => {
    const inputs = card.querySelectorAll("input, select, textarea");
    const statusText = card.querySelector(".status-text");
    const dateTimeInputs = card.querySelectorAll("input[data-datetime]");
    if (card === clickedCard) {
      card.classList.add("expanded");
      inputs.forEach((i) => (i.disabled = false)); // เปิดให้แก้ไข
      if (statusText) statusText.textContent = statusText.getAttribute("data-full");
      // dateTimeInputs.forEach((input)=> {
      //   input.type = "datetime-local";
      // })
    } else if(!card.classList.contains("campaignEditorContainer")) {
      card.classList.remove("expanded");
      inputs.forEach((i) => (i.disabled = true)); // ปิดให้แก้ไข
      if (statusText) statusText.textContent = statusText.getAttribute("data-short");
    }
  });
}

// ปุ่ม Edit , Delete , History , Cancel , Save
function registerCardEventListeners(container, originalMap, statusList) {
  // เปลี่ยน Dev เป็น Input
  container.querySelectorAll(".editable-text").forEach((el) => {
    el.addEventListener("click", () => {
      if (el.querySelector("input")) return;

      const currentValue = el.textContent.trim();
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentValue;
      input.className = "form-control form-control-sm";
      input.style = "font-size: 14px; padding: 0.2rem; height: auto;";

      el.innerHTML = "";
      el.appendChild(input);
      input.focus();

      // เปลี่ยนกลับเป็น dev
      function saveChange() {
        const newValue = input.value.trim();
        el.innerHTML = newValue;

        const field = el.dataset.field;
        const card = el.closest(".cards , .campaignEditorContainer");
        if (field && card && card.dataset.index !== undefined) {
          const index = parseInt(card.dataset.index);
          if (!isNaN(index)) {
            data[index][field] = newValue;
          }
        }
      }

      input.addEventListener("blur", saveChange);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveChange();
        }
      });
    });
  });

  // ปุ่ม History
  container.querySelectorAll(".btn-history").forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("History button got passed")
    });
  });

  // ปุ่ม Delete
container.querySelectorAll(".btn-delete").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const card = btn.closest(".cards , .campaignEditorContainer");
    const id = card.dataset.id;
    const title = card.querySelector(".title")?.innerText || "กิจกรรม";

    const result = await swalConfirm.fire({
      title: `ลบ "${title}" ?`,
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        let response;
        if (card.classList.contains("cardPromotion")) {
          response = await API.deletePromotion(id);
        } else {
          response = await API.deleteCampaign(id);
        }

        if (response.success) {
          card.remove();
          
          UpdateStatusCount(response.total, response.statusCounts)
          const promotionCount = document.querySelector(".promotion-total")
          console.log(promotionCount.textContent)
          if (promotionCount) {

            promotionCount.textContent = `จำนวนโปรโมชั่นทั้งหมด : ${response.total}`;
          }

          // อยู่ในหน้าเดียวกับแคมเปญที่เพิ่งลบ
          const currentPage = window.location.pathname;
          const currentId = new URLSearchParams(window.location.search).get("id");

          if (currentPage.includes("promotion.php") && currentId == id) {
            await Swal.fire({
              icon: 'success',
              title: 'ลบกิจกรรมสำเร็จ',
              text: 'กำลังกลับไปหน้าแรก...',
              timer: 2500,
              showConfirmButton: false
            });
            window.location.href = "/mypromotion/src/index.php";
          } else {
            await Swal.fire({
              icon: "success",
              title: "ลบแล้ว!",
              text: "กิจกรรมถูกลบเรียบร้อย",
              confirmButtonText: "รับทราบ",
              customClass: {
                confirmButton: "btn btn-success"
              },
              buttonsStyling: false
            });
          }
        } else {
          showAlert("ลบไม่สำเร็จ: " + response.message, "danger");
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาด:", err);
        showAlert("เกิดข้อผิดพลาดระหว่างการลบข้อมูล", "danger");
      }
      }
    });
  });


  // ปุ่ม Edit
  container.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Edit button had Clicked");
      const card = btn.closest(".cards , .campaignEditorContainer");
      const id = card.dataset.id;
      goToPromotionPage(id);
    });
  });

  // ปุ่ม Cancel
  container.querySelectorAll(".btn-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".cards , .campaignEditorContainer");
      const originalCampaignDataMap = card.originalCampaignDataMapRef;
      console.log(originalCampaignDataMap);
      const id = Number(card.dataset.id);
      const original = originalCampaignDataMap?.get(id);
      if (original) {
        card.querySelector(".title").textContent = original.name;
        card.querySelector(".id").textContent = original.code;
        const textareas = card.querySelectorAll("textarea");
        if (textareas.length > 0) textareas[0].value = original.description;
        if (textareas.length > 1) textareas[1].value = original.note;
        const selects = card.querySelectorAll("select");
        if (selects.length > 0) selects[0].value = original.type;
        if (selects.length > 1) selects[1].value = original.target;
        const beginInput = card.querySelector(".form-begin");
        if (beginInput && beginInput._flatpickr) {
          beginInput._flatpickr.setDate(original.start_date, true); 
        }
        const endInput = card.querySelector(".form-end");
        if (endInput && endInput._flatpickr) {
          endInput._flatpickr.setDate(original.end_date, true); 
        }
        const location = card.querySelectorAll(".form-location");
        if (location.length > 0) location[0].value = original.location;
        
        card.dataset.status = original.status;
        updateCardAppearance(card, statusList[original.status-1], original.status-1);
        
        
      }else {
        showAlert("ไม่พบ originalMap", "danger")
      }
      card.querySelectorAll("input, select, textarea").forEach((el) => el.disabled = true);
      toggleActionButtons(card, false);
      expandCardForEditing(card);
    });
  });

  // ปุ่ม Save
  container.querySelectorAll(".btn-save").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const card = btn.closest(".cards , .campaignEditorContainer");
      const id = card.dataset.id;

      const payload = {
        id,
        name: card.querySelector(".title").textContent.trim(),
        code: card.querySelector(".id").textContent.trim(),
        status: card.dataset.status,
        description: card.querySelectorAll("textarea")[0].value,
        type: card.querySelectorAll("select")[0].value,
        target: card.querySelectorAll("select")[1].value,
        begin: card.querySelectorAll(".form-begin")[0].value,
        end: card.querySelectorAll(".form-end")[0].value,
        location: card.querySelector(".form-location").value,
        note: card.querySelectorAll("textarea")[1].value,
        campaign_id: card.dataset.campaign_id,
      };
      console.log(payload)
      
      let result;
      if (card.classList.contains("cardPromotion")) {
        result = await API.insertPromotion(payload);
      } else {
        result = await API.insertCampaign(payload);
      }


      if (result.success) {
        showAlert("บันทึกเรียบร้อยแล้ว!", "success")    
        UpdateStatusCount(result.total, result.statusCounts)
      
      // อัปเดตข้อมูลใน originalMap
      const idNum = Number(id);
      const originalCampaignDataMap = card.originalCampaignDataMapRef;
      if (originalCampaignDataMap && !isNaN(idNum)) {
        originalCampaignDataMap.set(idNum, {
          id,
          name: payload.name,
          code: payload.code,
          status: payload.status,
          description: payload.description,
          type: payload.type,
          target: payload.target,
          start_date: payload.begin,
          end_date: payload.end,
          location: payload.location,
          note: payload.note,
        });
      }

      // ปิดการแก้ไข + ปิดปุ่ม
      card.querySelectorAll("input, select, textarea").forEach((el) => el.disabled = true);
      toggleActionButtons(card, false);
      expandCardForEditing(card);
    }else {
      showAlert("บันทึกข้อมูลไม่สำเร็จ", "error");
    }
    });
  });
}

// เพิ่ม Edit mode ลงใน Card ที่แก้ไข
function trackCardChanges(container) {
  container.querySelectorAll("input, textarea, select, div").forEach((item) => {
    item.addEventListener("input", () => {
      const card = item.closest(".cards , .campaignEditorContainer");
      if (!card.classList.contains("edit-mode")) {
        toggleActionButtons(card, true);
        card.classList.add("edit-mode");
      }
    });
  });
}

// แสดงปุ่ม Save/Edit 
function toggleActionButtons(card, isEditMode){  
  card.querySelector(".btn-edit").classList.toggle("d-none", isEditMode);
  card.querySelector(".btn-delete").classList.toggle("d-none", isEditMode);
  card.querySelector(".btn-history").classList.toggle("d-none", isEditMode);
  card.querySelector(".btn-save").classList.toggle("d-none", !isEditMode);
  card.querySelector(".btn-cancel").classList.toggle("d-none", !isEditMode);
  if (!isEditMode) card.classList.remove("edit-mode");
}