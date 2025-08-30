/**
 * เปลี่ยน UI ของการ์ดให้ตรงกับสถานะที่กำหนด
 * @param {HTMLElement} card - การ์ดที่ต้องการเปลี่ยน UI
 * @param {Object} statusData - ข้อมูลสถานะที่ถูกเลือก (จาก StatusData.find(...))
 * @param {string} statusId - รหัสสถานะ เช่น '1', '2', ...
 */
export function updateCardAppearance(card, statusData, statusId) {
  const statusMap = {
    "1": { class: "cards-Active", bg: "#d1e7dd", color: "#198754" },
    "2": { class: "cards-Pending", bg: "#e7f1ff", color: "#0d6efd" },
    "3": { class: "cards-Close", bg: "#f8d7da", color: "#dc3545" },
    "4": { class: "cards-Expire", bg: "#f3e3d3", color: "#7b4b2a" },
  };
  const config = statusMap[statusData.id_main];
  if (!config) return;
  
  // อัปเดตคลาสสถานะ
  card.classList.remove("cards-Active", "cards-Pending", "cards-Close", "cards-Expire");
  card.classList.add(config.class);

  // อัปเดตปุ่ม SelectStatus-button
  const btnStatus = card.querySelector(".SelectStatus-button");
  const icon = btnStatus.querySelector("i");
  const label = btnStatus.querySelector("label");

  icon.className = `bi bi-${statusData.icon} SelectStatus-icon`;
  icon.style.color = config.color;
  label.textContent = statusData.thai_name;
  label.style.color = config.color;

  // อัปเดตแถบด้านข้าง
  const cardIcon = card.querySelector(".icon-status i");
  const cardText = card.querySelector(".status-text");

  cardIcon.className = `bi bi-${statusData.icon} icon`;
  cardIcon.style.color = config.color;
  cardText.textContent = statusData.short_name;
  cardText.setAttribute("data-full", statusData.name);
  cardText.setAttribute("data-short", statusData.short_name);
}