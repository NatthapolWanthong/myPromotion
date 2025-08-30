let savedStatus = []



export function UpdateStatusCount(total, counts, StatusOptions) {
  function isPromotionPage() {
    return window.location.pathname.includes("promotion.php");
  }

  const isPromotion = isPromotionPage()
  // ถ้าไม่ได้ส่งเข้ามา ให้ใช้ savedStatus เดิม
  const statusArray = Array.isArray(StatusOptions) ? StatusOptions : savedStatus

  // เก็บไว้ใช้รอบถัดไป
  savedStatus = statusArray

  console.log(savedStatus)

  const statusSummary = StatusCounts(statusArray, total, counts)

  // อัปเดตจำนวนกิจกรรมทั้งหมด
  document.querySelector(".all-count label").textContent = `${isPromotion ? `โปรโมชั่นทั้งหมด`:`กิจกรรมทั้งหมด`}  ${total} รายการ`;

  // อัปเดตสถานะต่าง ๆ
  document.querySelector(".status-count .act label").textContent = `กำลังเปิดใช้งานอยู่ ${statusSummary.act} รายการ`;
  document.querySelector(".status-count .pnd label").textContent = `กำลังรอดำเนินการอยู่ ${statusSummary.pnd} รายการ`;
  document.querySelector(".status-count .cls label").textContent = `กำลังปิดใช้งานอยู่ ${statusSummary.cls} รายการ`;
  document.querySelector(".status-count .exp label").textContent = `หมดอายุแล้ว ${statusSummary.exp} รายการ`;
  console.log("นับสถานะแล้ว")
}

function StatusCounts(Status, total, counts){
  if (!Array.isArray(Status)) return { act:0, pnd:0, cls:0, exp:0 }
  if (!counts) counts = {}

  const statusSummary = { act:0, pnd:0, cls:0, exp:0 }

  Status.forEach(option => {
    const count = counts[option.id] || 0
    switch(option.id_main) {
      case '1': statusSummary.act += count; break
      case '2': statusSummary.pnd += count; break
      case '3': statusSummary.cls += count; break
      case '4': statusSummary.exp += count; break
    }
  })

  return statusSummary
}
