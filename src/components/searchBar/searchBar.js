// ✅ searchBar.js - ควบคุมการทำงานรวมของ filter + sort + search + pagination แบบ Server-side
import { API } from '/myPromotion/src/assets/js/api.js';
import { getOptions } from '/myPromotion/src/assets/js/store/optionsStore.js';
import { CampaignCard , PromotionCard } from "/myPromotion/src/components/card/generateCard.js";
import './filter/filter.js';
import './sort/sort.js';
import './search/search.js';

const searchInput = document.getElementById("campaignSearchInput");
const searchBtn = document.getElementById("campaignSearchButton");
const cardContainer = document.getElementById("searchInputCards");
const paginationContainer = document.querySelector(".pagination");


// ===================== Config =====================

const getDataPath = isPromotionPage()
  ? "/myPromotion/src/connection/getPromotion.php"
  : "/myPromotion/src/connection/getCampaign.php";

// ==================================================


const campaignId = new URLSearchParams(window.location.search).get('id');

// ===================== State =====================
let queryState = {
  keyword: "",
  type: [],
  target: [],
  status: [],
  sortBy: "edit_date",
  sortOrder: "desc", // desc หรือ asc
  page: 1,
  pageSize: 10,
  campaign_id: campaignId ? campaignId : null
};

let cardGenerator;

// ===================== INIT =====================
async function initSearchBar(options) {
  const formOptions = await API.getFormOptions();
  
  const { type, target, status } = formOptions;
  if (isPromotionPage()) {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('id');
    const campaign = await API.getCampaignById(campaignId);
    cardGenerator = new PromotionCard(cardContainer, options, campaign);
  } else{
    cardGenerator = new CampaignCard(cardContainer, options);
  }
  fetchData(getDataPath);
}

document.addEventListener("DOMContentLoaded", async () => {
  const options = await getOptions();
  initSearchBar(options);
});

// ===================== Fetch + Render =====================

let previousQuery = null;

function fetchData(path) {
  const currentQuery = { ...queryState };
  if (!isQueryChanged(currentQuery)) {
    console.warn("🔁 ข้อมูล query ไม่เปลี่ยน");
    return;
  }

    previousQuery = currentQuery;


  API.fetchData(path, "POST", queryState).then((res) => {
  if (!res || !Array.isArray(res.data)) throw new Error("รูปแบบข้อมูลผิด");
  cardGenerator.render(res.data,res.total,res.statusCounts);
  console.log(res)
  renderPagination(res.total, queryState.pageSize);
}).catch(err => alert("โหลดข้อมูลล้มเหลว: " + err));

}

function renderPagination(totalItems, pageSize) {
  updateQueryStateFromUI();
  const totalPages = Math.ceil(totalItems / pageSize);
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", () => {
      queryState.page = i;
      fetchData(getDataPath);
    });
    paginationContainer.appendChild(li);
  }
}

function updateQueryStateFromUI() {
  // Search
  queryState.keyword = searchInput.value.trim();

  // Filter
  queryState.type = [...document.querySelectorAll('.typeOptionFilter input:checked')].map(i => i.value);
  queryState.target = [...document.querySelectorAll('.targetOptionFilter input:checked')].map(i => i.value);
  queryState.status = [...document.querySelectorAll('.statusOptionFilter input:checked')].map(i => i.value);

  // Sort (ใช้จาก active-dot)
  const activeSort = document.querySelector('.sort-option.active-dot');
  const activeOrder = document.querySelector('.order-option.active-dot');
  if (activeSort) queryState.sortBy = activeSort.dataset.field;
  if (activeOrder) queryState.sortOrder = activeOrder.dataset.order;

  // page ถูกเซตตอนกด pagination อยู่แล้ว
}

// เช็คว่าใช่หน้า promotion ไหม
function isPromotionPage() {
  return window.location.pathname.includes("promotion.php");
}

function isQueryChanged(currentQuery) {
  return JSON.stringify(currentQuery) !== JSON.stringify(previousQuery);
}


// ===================== Event: Search =====================
searchBtn.addEventListener("click", () => {
  queryState.keyword = searchInput.value.trim();
  queryState.page = 1;
  fetchData(getDataPath);
});

searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    queryState.keyword = searchInput.value.trim();
    queryState.page = 1;
    fetchData(getDataPath);
  }
});

searchInput.addEventListener("input", (e) => {
  if (e.target.value.trim() === "") {
    queryState.keyword = "";
    queryState.page = 1;
    fetchData(getDataPath);
  }
});

// ===================== Generate Filter Options =====================
function generateOption(options, containerClass, OptionKeys) {
  const container = document.querySelector(containerClass);
  const data = options[OptionKeys];
  container.innerHTML = '';

  if (Array.isArray(data)) {
    data.forEach(item => {
      container.innerHTML += `
        <li>
          <label class="form-check-label">
            <input class="checkOption form-check-input me-1 checkbox" type="checkbox" value="${item.id}" checked data-group="${OptionKeys}">
            ${item.thai_name}
          </label>
        </li>
      `;
    });
  } else {
    Object.entries(data).forEach(([key, value]) => {
      container.innerHTML += `
        <li>
          <label class="form-check-label">
            <input class="checkOption form-check-input me-1 checkbox" type="checkbox" value="${key}" checked data-group="${OptionKeys}">
            ${value}
          </label>
        </li>
      `;
    });
  }
}

// ===================== Load & Event Setup =====================
document.addEventListener("DOMContentLoaded", async () => {
  const sortButton = document.getElementById("sortButton");
  const sortMenu = document.getElementById("sortMenu");
  const options = await getOptions();
  const applyButton = document.querySelector(".apply-filter");
  const filterCheckboxes = document.querySelectorAll(".subMenuFilter");
  
  generateOption(options, ".targetOptionFilter", "target");
  generateOption(options, ".typeOptionFilter", "type");
  generateOption(options, ".statusOptionFilter", "status");

// ใช้ filter ที่เลือก
  applyButton.addEventListener("click", () => {
    filterCheckboxes.forEach(cb => {
      const input = cb.querySelectorAll('input');
      fetchData(getDataPath)
    });
  });

  // Sort Dropdowns
  let hoverTimer;
  const dropdownGroups = document.querySelectorAll("[data-dropdown]");
  dropdownGroups.forEach((group) => {
    const toggle = group.querySelector("[data-toggle]");
    const submenu = group.querySelector("[data-submenu]");
    if (!toggle || !submenu) return;

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      dropdownGroups.forEach((otherGroup) => {
          if (otherGroup !== group) {
            otherGroup.querySelector("[data-submenu]")?.classList.remove("show");
          }
        });
      submenu.classList.add("show");
    });

    group.addEventListener("mouseenter", () => {
      hoverTimer = setTimeout(() => {
        dropdownGroups.forEach((otherGroup) => {
          if (otherGroup !== group) {
            otherGroup.querySelector("[data-submenu]")?.classList.remove("show");
          }
        });
        submenu.classList.add("show");
      }, 400);
    });
    group.addEventListener("mouseleave", () => clearTimeout(hoverTimer));
  });

  // Sort onClick
  sortButton.addEventListener("click", (e) => {
    e.stopPropagation();
    sortMenu.classList.toggle("show");
  });

  // ปิดเมื่อคลิกข้างนอก
  document.addEventListener("click", (e) => {
    if (!sortButton.contains(e.target) && !sortMenu.contains(e.target)) {
      sortMenu.classList.remove("show");
    }
  });

  // Sort Options (เรียงตาม)
  document.querySelectorAll(".sort-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".sort-option").forEach(o => o.classList.remove("active-dot"));
      opt.classList.add("active-dot");
      queryState.sortBy = opt.dataset.field;
      
      const dropdownGroups = document.querySelectorAll("[data-dropdown]");

      dropdownGroups.forEach((group) => {
      const toggle = group.querySelector("[data-toggle]");
      const submenu = group.querySelector("[data-submenu]");
      if (!toggle || !submenu) return;
      if (!opt.querySelector("[data-toggle]")){
        dropdownGroups.forEach((otherGroup)=>{
          otherGroup.querySelector("[data-submenu]")?.classList.remove("show");
        })
      }
      })
      fetchData(getDataPath)
    });
  });

  // Order Options (ลำดับ)
  document.querySelectorAll(".order-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".order-option").forEach(o => o.classList.remove("active-dot"));
      opt.classList.add("active-dot");
      queryState.sortOrder = opt.dataset.order;
      fetchData(getDataPath)
    });
  });
 
  // Filter Checkbox Handler
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("checkOption")) {
      const group = e.target.dataset.group;
      const checkboxes = document.querySelectorAll(`input[data-group='${group}']:checked`);
      queryState[group] = Array.from(checkboxes).map(cb => cb.value);
      queryState.page = 1;
    }
  });
});

// <======================================== OnClick ========================================>
// เลือกทั้งหมด
document.querySelectorAll('.select-all-checkbox').forEach(selectAllCheckbox => {
  selectAllCheckbox.addEventListener('change', (e) => {
    const ul = e.target.closest('ul');
    const checkboxes = ul.querySelectorAll('.checkOption');
    const group = e.target.dataset.group;
    checkboxes.forEach(cb => {
      cb.checked = e.target.checked;
    });
    updateQueryStateFromUI()
  });
});

// ปรับปุ่ม 'เลือกทั้งหมด' ให้ปิดเมื่อมีการเปลี่ยนแปลงใน checkbox อื่นๆ
document.addEventListener('change', function (e) {
  if (e.target.classList.contains('checkOption')) {
    const ul = e.target.closest('ul');
    const selectAll = ul.querySelector('.select-all-checkbox');
    const checkboxes = ul.querySelectorAll('.checkOption');
    const group = e.target.dataset.group;
    if (selectAll?.checked) {
      selectAll.checked = false;
    }
    if (checkboxes?.checked){
      selectAll.checked = true;
    }
    updateQueryStateFromUI()
  }
});


document.addEventListener("DOMContentLoaded", async () => {
  const filterMenu = document.getElementById("filterMenu");
  const clearButton = document.querySelector(".clear-filter");
  const filterCheckboxes = document.querySelectorAll(".subMenuFilter");


  const filterButton = document.getElementById("filterButton");

  // Filter onClick
  filterButton.addEventListener("click", (e) => {
    e.stopPropagation();
    filterMenu.classList.toggle("show");
  });

  // ปิดเมื่อคลิกข้างนอก
  document.addEventListener("click", (e) => {
    if (!filterButton.contains(e.target) && !filterMenu.contains(e.target)) {
      filterMenu.classList.remove("show");
    }
  });

  // ล้าง filter
  clearButton.addEventListener("click", () => {
    filterCheckboxes.forEach(cb => {
      const checkboxes = cb.querySelectorAll('input');
      // รีเซ็ต checkbox ทั้งหมดในแต่ละกลุ่ม
      checkboxes.forEach(item => {
        item.checked = false;
      })
    });
    console.log("🧼 ล้าง filter แล้ว");
  }); 


});

document.querySelectorAll('input[data-target]').forEach(input => {
  input.addEventListener("input", () => {
    console.log("searching...", input);
    const targetId = input.dataset.target;
    filterFunction(input, targetId);
  });
});

export function filterFunction(inputElement, dropdownId) {
  const filter = inputElement.value.toUpperCase();
  const dropdown = document.getElementById(dropdownId);
  const items = dropdown.getElementsByTagName("li");

  if (items){
    for (let i = 0; i < items.length; i++) {
    const txtValue = items[i].textContent || items[i].innerText;
    items[i].style.display = txtValue.toUpperCase().includes(filter) ? "" : "none";
  }
  }else {
    console.warn("No items found in dropdown with ID:", dropdownId);
  }
}