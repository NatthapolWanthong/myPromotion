// modalProductList.js (replace)
// - expose helpers for other modules to reuse loaded products map
import { API } from "/myPromotion/src/assets/js/api.js";

let products = []; // ทั้งหมดจาก API
let categories = []; // categories จาก API
let productsById = new Map(); // map id -> product
let productsByCategory = new Map(); // categoryId -> [product]
let filteredProductIds = new Set(); // ids ที่เป็นผลของการค้นหาแสดงอยู่

let selectedProducts = new Set(); // selected product ids (current modal session)
let selectedCategories = new Set(); // category ids ที่ถูกเลือกทั้งหมวด (current modal session)

let activeTarget = { nameSelector: null, idSelector: null }; // current caller targets
let lastActiveIdSelector = null; // track last opened idSelector
const perTargetSelections = new Map(); // map idSelector -> { products: [...], categories: [...] }

const modalEl = document.getElementById("modalProductList");

// safe DOM selector
const $ = sel => document.querySelector(sel);

// utilities
const isInputElement = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
const escapeHtml = str => String(str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// highlight styles injection (kept from previous)
function ensureHighlightStyles() {
  if (document.getElementById('modal-product-highlight-styles')) return;
  const style = document.createElement('style');
  style.id = 'modal-product-highlight-styles';
  style.innerHTML = `
/* modal product highlight styles */
#modalProductList .product-row.selected {
  background-color: #eaf7ee; /* pale green */
}
/* ... rest as before ... */
#modalProductList .product-row .prod-original {
  color: #dc3545;
}
#modalProductList .product-row .prod-selected {
  color: #198754 !important;
  font-weight: 600;
}
#modalProductList .product-category .cat-name.cat-all {
  text-decoration: underline;
  font-weight: 700;
}
#modalProductList .btn-select-product.btn-selected {
}
`;
  document.head.appendChild(style);
}

// ---------- persistence helpers ----------
function saveSelectionForTarget(idSelector) {
  if (!idSelector) return;
  perTargetSelections.set(String(idSelector), {
    products: Array.from(selectedProducts),
    categories: Array.from(selectedCategories)
  });
}

function loadSelectionForTarget(idSelector) {
  selectedProducts = new Set();
  selectedCategories = new Set();
  if (!idSelector) return false;
  const stored = perTargetSelections.get(String(idSelector));
  if (stored) {
    (stored.products || []).forEach(p => selectedProducts.add(String(p)));
    (stored.categories || []).forEach(c => selectedCategories.add(String(c)));
    return true;
  }
  return false;
}

// ---------- load ----------
async function loadProducts() {
  ensureHighlightStyles();
  try {
    const res = await API.getProducts();
    const pList = Array.isArray(res.Products) ? res.Products : (Array.isArray(res.products) ? res.products : []);
    const cList = Array.isArray(res.ProductsCategories) ? res.ProductsCategories : (Array.isArray(res.productsCategories) ? res.productsCategories : (Array.isArray(res.categories) ? res.categories : []));
    products = pList || [];
    categories = cList || [];

    // build maps
    productsById.clear();
    productsByCategory.clear();
    products.forEach(p => {
      const pid = String(p.id ?? p.product_id ?? p.productId ?? '');
      productsById.set(pid, p);
      const cid = String(p.category_id ?? p.categoryId ?? p.cat_id ?? '');
      if (!productsByCategory.has(cid)) productsByCategory.set(cid, []);
      productsByCategory.get(cid).push(p);
    });

    // normalize categories
    categories = (categories || []).map(c => ({ ...(c || {}), id: c.id ?? c.category_id ?? c.cat_id }));
  } catch (err) {
    console.warn("loadProducts error", err);
    products = [];
    categories = [];
    productsById.clear();
    productsByCategory.clear();
  }
  renderProducts(products);
}

// ---------- UI creation ----------
function createCategoryElement(cat, productsInView, totalCount) {
  const catId = String(cat.id ?? '');
  const wrapper = document.createElement('div');
  wrapper.className = 'list-group-item';

  const header = document.createElement('div');
  header.className = 'product-category d-flex justify-content-between align-items-center';
  header.setAttribute('data-category-id', catId);

  const left = document.createElement('div');
  left.className = 'cat-left d-flex align-items-center gap-2';

  const chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.className = 'cat-checkbox form-check-input';
  chk.setAttribute('data-category-id', catId);

  const title = document.createElement('div');
  title.className = 'cat-title fw-bold';
  const catName = String(cat.name_th ?? cat.name_en ?? cat.name ?? `หมวด ${catId}`);
  title.dataset.catName = catName;
  title.innerHTML = `<span class="cat-name">${escapeHtml(catName)}</span>`;

  const count = document.createElement('small');
  count.className = 'text-muted ms-2 cat-count';
  count.textContent = `(${totalCount})`;

  left.appendChild(chk);
  left.appendChild(title);
  left.appendChild(count);

  const right = document.createElement('div');
  right.className = 'cat-right';
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'btn btn-sm btn-outline-secondary';
  toggleBtn.textContent = 'ย่อ/ขยาย';
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const prodArea = wrapper.querySelector('.cat-products');
    if (prodArea) prodArea.classList.toggle('d-none');
  });

  right.appendChild(toggleBtn);
  header.appendChild(left);
  header.appendChild(right);

  const prodArea = document.createElement('div');
  prodArea.className = 'cat-products mt-2';
  if (!productsInView || productsInView.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-muted small py-2';
    empty.textContent = 'ไม่พบสินค้าในหมวดนี้';
    prodArea.appendChild(empty);
  } else {
    productsInView.forEach(p => {
      const row = document.createElement('div');
      row.className = 'product-row d-flex align-items-center gap-2 py-1';
      row.setAttribute('data-product-id', String(p.id));

      const ch = document.createElement('input');
      ch.type = 'checkbox';
      ch.className = 'product-checkbox form-check-input';
      ch.setAttribute('data-product-id', String(p.id));
      ch.addEventListener('click', e => e.stopPropagation());

      const sku = document.createElement('div');
      sku.className = 'product-sku text-truncate small';
      sku.style.minWidth = '80px';
      sku.textContent = p.sku ?? '';

      const name = document.createElement('div');
      name.className = 'product-name flex-fill';
      const productNameTh = p.name_th ?? '';
      const productNameEn = p.name_en ?? '';
      name.innerHTML = `<div><span class="prod-original">${escapeHtml(productNameTh || productNameEn || '')}</span></div><small class="text-muted">${escapeHtml(productNameEn || '')}</small>`;

      const btnWrap = document.createElement('div');
      btnWrap.style.minWidth = '110px';
      btnWrap.style.textAlign = 'right';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-primary btn-select-product';
      btn.textContent = 'เลือก';

      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        try {
          if (activeTarget.nameSelector) {
            const sel = document.querySelector(activeTarget.nameSelector);
            if (sel) sel.value = productNameTh || productNameEn || '';
          }
          if (activeTarget.idSelector) {
            const idEl = document.querySelector(activeTarget.idSelector);
            if (idEl && isInputElement(idEl)) {
              idEl.value = p.id ?? '';
            } else if (idEl) {
              const hidden = document.createElement('input');
              hidden.type = 'hidden';
              hidden.name = 'product_id[]';
              hidden.value = p.id ?? '';
              hidden.className = 'modal-product-hidden';
              idEl.appendChild(hidden);
            }
          }
          document.dispatchEvent(new CustomEvent("productSelected", {
            detail: {
              id: p.id, sku: p.sku, name_th: p.name_th, name_en: p.name_en,
              targetNameSelector: activeTarget.nameSelector || null,
              targetIdSelector: activeTarget.idSelector || null
            }
          }));
        } catch (e) {
          console.warn('populate error', e);
        } finally {
          try { const m = bootstrap.Modal.getInstance(modalEl); m && m.hide(); } catch (e) {}
        }
      });

      row.addEventListener('click', (ev) => {
        if (ev.target.closest('.btn-select-product')) return;
        if (ev.target.closest('.product-checkbox')) return;
        ch.checked = !ch.checked;
        ch.dispatchEvent(new Event('change', { bubbles: true }));
      });

      ch.addEventListener('change', (ev) => {
        const pid = String(ev.target.getAttribute('data-product-id'));
        const isChecked = !!ev.target.checked;
        toggleProductSelection(pid, isChecked);
      });

      btnWrap.appendChild(btn);
      row.appendChild(ch);
      row.appendChild(sku);
      row.appendChild(name);
      row.appendChild(btnWrap);
      prodArea.appendChild(row);
    });
  }

  chk.addEventListener('click', e => e.stopPropagation());
  chk.addEventListener('change', (ev) => {
    const cid = String(ev.target.getAttribute('data-category-id'));
    const chkState = !!ev.target.checked;
    toggleCategorySelection(cid, chkState);
    updateUISelections();
  });

  title.addEventListener('click', (e) => {
    e.stopPropagation();
    const prodArea = wrapper.querySelector('.cat-products');
    if (prodArea) prodArea.classList.toggle('d-none');
  });

  wrapper.appendChild(header);
  wrapper.appendChild(prodArea);
  return wrapper;
}

// ---------- render ----------
function renderProducts(list) {
  const container = document.getElementById('product-list-body');
  if (!container) return;

  container.innerHTML = '';
  filteredProductIds.clear();

  const visibleByCategory = new Map();
  (list || []).forEach(p => {
    const cid = String(p.category_id ?? p.categoryId ?? p.cat_id ?? '');
    if (!visibleByCategory.has(cid)) visibleByCategory.set(cid, []);
    visibleByCategory.get(cid).push(p);
    filteredProductIds.add(String(p.id));
  });

  const catOrder = categories.length ? categories : [];
  const seenCats = new Set();

  if (catOrder && catOrder.length) {
    catOrder.forEach(cat => {
      const cid = String(cat.id ?? '');
      const totalCount = (productsByCategory.get(cid) || []).length;
      const productsInView = visibleByCategory.get(cid) || [];
      if (productsInView.length === 0) return;
      const catEl = createCategoryElement(cat, productsInView, totalCount);
      container.appendChild(catEl);
      seenCats.add(cid);
    });
  }

  visibleByCategory.forEach((plist, cid) => {
    if (seenCats.has(cid)) return;
    const fakeCat = { id: cid, name_th: `หมวด ${cid}`, name_en: `Cat ${cid}` };
    const catEl = createCategoryElement(fakeCat, plist, (productsByCategory.get(cid) || []).length);
    container.appendChild(catEl);
  });

  updateUISelections();
}

// ---------- selection logic ----------
function toggleProductSelection(productId, checked) {
  productId = String(productId);
  if (checked) selectedProducts.add(productId);
  else selectedProducts.delete(productId);
  updateSelectedCategoriesFromProducts();
  updateSelectedCount();
  updateUISelections();
}

function toggleCategorySelection(categoryId, checked) {
  categoryId = String(categoryId);
  const allProductsInCat = (productsByCategory.get(categoryId) || []).map(p => String(p.id));
  if (checked) {
    selectedCategories.add(categoryId);
    allProductsInCat.forEach(id => selectedProducts.add(id));
  } else {
    selectedCategories.delete(categoryId);
    allProductsInCat.forEach(id => selectedProducts.delete(id));
  }
  updateSelectedCount();
  updateUISelections();
}

function updateSelectedCategoriesFromProducts() {
  selectedCategories.clear();
  productsByCategory.forEach((plist, cid) => {
    const allIds = plist.map(p => String(p.id));
    if (allIds.length === 0) return;
    const allSelected = allIds.every(id => selectedProducts.has(String(id)));
    if (allSelected) selectedCategories.add(String(cid));
  });
}

function updateUISelections() {
  document.querySelectorAll('.product-row').forEach(row => {
    const pid = row.getAttribute('data-product-id');
    const checkbox = row.querySelector('.product-checkbox');
    const btn = row.querySelector('.btn-select-product');
    const nameSpan = row.querySelector('.product-name .prod-original');

    if (selectedProducts.has(String(pid))) {
      row.classList.add('selected');
      if (checkbox) checkbox.checked = true;
      if (btn) {
        btn.classList.add('btn-selected', 'btn-primary');
        btn.classList.remove('btn-outline-primary');
        btn.textContent = 'เลือกแล้ว';
      }
      if (nameSpan) nameSpan.classList.add('prod-selected');
    } else {
      row.classList.remove('selected');
      if (checkbox) checkbox.checked = false;
      if (btn) {
        btn.classList.remove('btn-selected', 'btn-primary');
        btn.classList.add('btn-outline-primary');
        btn.textContent = 'เลือก';
      }
      if (nameSpan) nameSpan.classList.remove('prod-selected');
    }
  });

  document.querySelectorAll('.product-category').forEach(catEl => {
    const cid = String(catEl.getAttribute('data-category-id'));
    const chk = catEl.querySelector('.cat-checkbox');
    const title = catEl.querySelector('.cat-title');
    const nameSpan = title ? title.querySelector('.cat-name') : null;
    const countEl = catEl.querySelector('.cat-count');
    const allInCat = (productsByCategory.get(cid) || []).map(p => String(p.id));
    const totalCount = allInCat.length;

    if (!chk || !title) return;

    if (allInCat.length === 0) {
      chk.checked = false;
      chk.indeterminate = false;
      const orig = title.dataset.catName || title.textContent.replace(/\(.*\)/, '').trim();
      if (nameSpan) nameSpan.textContent = orig;
      nameSpan && nameSpan.classList.remove('cat-all');
      if (countEl) countEl.textContent = `(0)`;
      return;
    }

    const selectedInCat = allInCat.filter(id => selectedProducts.has(String(id))).length;
    if (selectedInCat === 0) {
      chk.checked = false;
      chk.indeterminate = false;
      selectedCategories.delete(cid);
      const orig = title.dataset.catName || title.textContent.replace(/\(.*\)/, '').trim();
      if (nameSpan) nameSpan.textContent = orig;
      nameSpan && nameSpan.classList.remove('cat-all');
    } else if (selectedInCat === allInCat.length) {
      chk.checked = true;
      chk.indeterminate = false;
      selectedCategories.add(cid);
      const orig = title.dataset.catName || title.textContent.replace(/\(.*\)/, '').trim();
      if (nameSpan) nameSpan.textContent = `${orig}(ทั้งหมด)`;
      nameSpan && nameSpan.classList.remove('cat-all');
    }

    if (countEl) countEl.textContent = `(${totalCount})`;
  });

  updateSelectedCount();
}

function updateSelectedCount() {
  const el = document.getElementById('selected-count');
  if (!el) return;
  el.textContent = `เลือกแล้ว ${selectedProducts.size} รายการ`;
}

// ---------- search & footer ----------
let _searchBound = false;
let _footerBound = false;

function bindSearch() {
  if (_searchBound) return;
  _searchBound = true;
  const input = document.getElementById("product-search-input");
  if (!input) return;
  input.addEventListener("input", (e) => {
    const q = (e.target.value || '').toLowerCase().trim();
    const filtered = products.filter(p => {
      return (String(p.name_th || '').toLowerCase().includes(q)) ||
             (String(p.name_en || '').toLowerCase().includes(q)) ||
             (String(p.sku || '').toLowerCase().includes(q));
    });
    renderProducts(filtered);
  });
}

function bindFooterButtons() {
  if (_footerBound) return;
  _footerBound = true;

  const btnVisible = document.getElementById('btn-select-visible');
  const btnClear = document.getElementById('btn-clear-selection');
  const btnConfirm = document.getElementById('btn-confirm-selection');

  if (btnVisible) {
    btnVisible.addEventListener('click', () => {
      filteredProductIds.forEach(pid => selectedProducts.add(String(pid)));
      updateSelectedCategoriesFromProducts();
      updateUISelections();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      selectedProducts.clear();
      selectedCategories.clear();
      updateUISelections();
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      // save selection to cache for this target so highlight persists when reopening
      if (activeTarget.idSelector) saveSelectionForTarget(activeTarget.idSelector);
      confirmSelectionAndClose();
    });
  }
}

// ---------- confirm & summary ----------
function buildSummaries(productsSelected, categoriesAll) {
  const selByCat = new Map();
  productsSelected.forEach(p => {
    const cid = String(p.category_id ?? p.categoryId ?? p.cat_id ?? '');
    if (!selByCat.has(cid)) selByCat.set(cid, []);
    selByCat.get(cid).push(p);
  });

  const partsText = [];
  const partsHtml = [];

  categoriesAll.forEach(cid => {
    const catObj = categories.find(c => String(c.id) === String(cid));
    const catName = catObj ? (catObj.name_th ?? catObj.name_en ?? catObj.name) : `หมวด ${cid}`;
    const totalCount = (productsByCategory.get(String(cid)) || []).length;
    partsText.push(`${catName}(ทั้งหมด(${totalCount}))`);
    partsHtml.push(`<span class="cat-label" style="color:blue">${escapeHtml(catName)}(ทั้งหมด(${totalCount}))</span>`);
  });

  selByCat.forEach((plist, cid) => {
    if (categoriesAll.includes(String(cid))) return;
    const catObj = categories.find(c => String(c.id) === String(cid));
    const catName = catObj ? (catObj.name_th ?? catObj.name_en ?? catObj.name) : `หมวด ${cid}`;
    const names = plist.map(p => (p.name_th ?? p.name_en ?? p.name)).filter(Boolean);
    partsText.push(`${catName}(${names.join(',')})`);

    const prodHtml = plist.map(p => `<span class="prod-label" style="color:red">${escapeHtml(p.name_th ?? p.name_en ?? p.name)}</span>`).join(',');
    partsHtml.push(`<span class="cat-label" style="color:blue">${escapeHtml(catName)}</span>( ${prodHtml} )`);
  });

  const textSummary = partsText.join(',');
  const htmlSummary = partsHtml.join(', ');
  return { textSummary, htmlSummary };
}

function confirmSelectionAndClose() {
  const productsSelected = Array.from(selectedProducts).map(id => productsById.get(String(id))).filter(Boolean);
  const categoriesAll = Array.from(selectedCategories);

  const { textSummary, htmlSummary } = buildSummaries(productsSelected, categoriesAll);

  // append hidden inputs to target container (or fallback)
  if (activeTarget.idSelector) {
    const targetEl = document.querySelector(activeTarget.idSelector);
    let containerForHidden = null;
    if (targetEl) {
      if (isInputElement(targetEl)) {
        try { targetEl.value = Array.from(selectedProducts).join(','); } catch(e){}
        containerForHidden = targetEl.closest('form') || targetEl.parentElement || document.body;
      } else {
        containerForHidden = targetEl;
      }
    } else {
      containerForHidden = document.body;
    }

    Array.from(containerForHidden.querySelectorAll('.modal-product-hidden')).forEach(el => el.remove());

    Array.from(selectedProducts).forEach(pid => {
      const h = document.createElement('input');
      h.type = 'hidden';
      h.name = 'product_id[]';
      h.value = pid;
      h.className = 'modal-product-hidden';
      containerForHidden.appendChild(h);
    });

    categoriesAll.forEach(cid => {
      const h = document.createElement('input');
      h.type = 'hidden';
      h.name = 'product_category_all[]';
      h.value = cid;
      h.className = 'modal-product-hidden';
      containerForHidden.appendChild(h);
    });
  }

  // write summary only if explicit targetNameSelector provided
  const targetNameEl = activeTarget.nameSelector ? document.querySelector(activeTarget.nameSelector) : null;
  if (targetNameEl) {
    if (isInputElement(targetNameEl)) {
      targetNameEl.value = textSummary;
      targetNameEl.dataset.htmlSummary = htmlSummary;
    } else {
      const prev = targetNameEl.querySelector('.modal-product-summary');
      if (prev) prev.remove();
      const s = document.createElement('input');
      s.type = 'text';
      s.readOnly = true;
      s.className = 'form-control modal-product-summary';
      s.value = textSummary;
      targetNameEl.appendChild(s);
      targetNameEl.dataset.htmlSummary = htmlSummary;
    }
  } else {
    // No explicit name target — do not fallback to any global element (avoids incorrectly overwriting other UI)
    console.warn('modalProductList: no active name selector provided; skipping writing the textual summary into DOM.');
  }

  document.dispatchEvent(new CustomEvent('productsSelected', {
    detail: {
      products: productsSelected,
      categoriesAll: categoriesAll,
      summary: textSummary,
      htmlSummary: htmlSummary,
      targetNameSelector: activeTarget.nameSelector || null,
      targetIdSelector: activeTarget.idSelector || null
    }
  }));

  try { const m = bootstrap.Modal.getInstance(modalEl); m && m.hide(); } catch (e) {}

  // also save current selection into cache for this target
  if (activeTarget.idSelector) saveSelectionForTarget(activeTarget.idSelector);

  updateUISelections();
}

// pre-check existing hidden inputs when opening modal (if any)
function precheckExistingSelection() {
  if (!activeTarget.idSelector) return;
  const container = document.querySelector(activeTarget.idSelector);
  if (!container) return;
  const found = Array.from(container.querySelectorAll('input[name="product_id[]"]')).map(i => String(i.value));
  found.forEach(id => selectedProducts.add(String(id)));
  const catAll = Array.from(container.querySelectorAll('input[name="product_category_all[]"]')).map(i => String(i.value));
  catAll.forEach(cid => selectedCategories.add(String(cid)));
  updateSelectedCategoriesFromProducts();
  updateUISelections();
}

// listen to any button with .btn-open-product-modal
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest && ev.target.closest(".btn-open-product-modal");
  if (!btn) return;
  ev.preventDefault();

  const rawName = btn.dataset?.targetName ?? btn.dataset?.targetname ?? null;
  const rawId = btn.dataset?.targetId ?? btn.dataset?.targetid ?? null;
  const normalize = v => {
    if (!v) return null;
    v = v.trim();
    if (v.startsWith('#') || v.startsWith('.')) return v;
    return `#${v}`;
  };

  const newNameSel = normalize(rawName);
  const newIdSel = normalize(rawId);

  // save current selection for last active target (if any)
  if (lastActiveIdSelector) {
    saveSelectionForTarget(lastActiveIdSelector);
  }

  activeTarget.nameSelector = newNameSel;
  activeTarget.idSelector = newIdSel;

  lastActiveIdSelector = newIdSel;

  if (!modalEl) {
    alert('ไม่พบ modalProductList ใน DOM');
    return;
  }
  (async () => {
    if (!products.length) await loadProducts();

    // try load from cache first; if not present, clear and precheck DOM hidden inputs
    const loaded = loadSelectionForTarget(activeTarget.idSelector);
    if (!loaded) {
      selectedProducts.clear();
      selectedCategories.clear();
      precheckExistingSelection();
    } else {
      renderProducts(products);
      bindSearch();
      bindFooterButtons();
      const bs = bootstrap.Modal.getOrCreateInstance(modalEl);
      bs.show();
      setTimeout(() => {
        const si = document.getElementById('product-search-input');
        si && si.focus();
      }, 50);
      return;
    }

    renderProducts(products);
    bindSearch();
    bindFooterButtons();
    const bs = bootstrap.Modal.getOrCreateInstance(modalEl);
    bs.show();
    setTimeout(() => {
      const si = document.getElementById('product-search-input');
      si && si.focus();
    }, 50);
  })();
});

// init on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  try { await loadProducts(); } catch(e){ console.warn(e); }
  bindSearch();
  bindFooterButtons();
});

// Exports — helpers for other modules
export async function ensureProductsLoaded() {
  // if already loaded, just return existing map
  if (products.length && productsById.size) return { products, productsById, categories };
  await loadProducts();
  return { products, productsById, categories };
}

export function getProductsMap() {
  return productsById;
}

export function findProductNameById(id) {
  if (id === undefined || id === null) return null;
  const p = productsById.get(String(id));
  if (!p) return null;
  return p.name_th || p.name_en || p.name || String(id);
}
