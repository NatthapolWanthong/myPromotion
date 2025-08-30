// ================ ไฟล์นี้จะเก็บรวม Functions สำหรับการกรองข้อมูล FIlter/ Search/ Sort... ================


// ================================ Functions Search Input ================================
// วิธีเพิ่ม 
// 1. ให้ใส่ data-target="ชื่อ" ลงใน Atribute ของ input ที่ใช้สำหรับค้นหา)
// 2. เพิ่ม id="ชื่อ" ลงใน Elements ที่ต้องการค้นหา
// *หมายเหตุ : items ใน Element จะต้องเป้น <li> 
// <Element>
//   <li><li>
//   <li><li>
//   <li><li>
//   <li><li>
//   <li><li>
// </Element>
// 

document.querySelectorAll('input[data-target]').forEach(input => {
  input.addEventListener("input", () => {
    const targetId = input.dataset.target;
    filterFunction(input, targetId);
  });
});


export function filterFunction(inputElement, dropdownId) {
  const filter = inputElement.value.toUpperCase();
  const dropdown = document.getElementById(dropdownId);
  const items = dropdown.getElementsByTagName("li" , "Option");

  if (items){
    for (let i = 0; i < items.length; i++) {
    const txtValue = items[i].textContent || items[i].innerText;
    items[i].style.display = txtValue.toUpperCase().includes(filter) ? "" : "none";
  }
  }else {
    console.warn("No items found in dropdown with ID:", dropdownId);
  }
  
}
// ==========================================================================================