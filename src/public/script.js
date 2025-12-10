// ====== CONFIG ======
const API_BASE_URL = 'http://localhost:3000'; // backend origin

// --------- Simple "store" using localStorage (for compare & cart ONLY for now) ---------

const COMPARE_KEY = "nfs_compare_items_v1";
const CART_KEY = "nfs_cart_items_v1";

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Compare helpers
function getCompareItems() {
  return readJson(COMPARE_KEY);
}

function setCompareItems(items) {
  writeJson(COMPARE_KEY, items);
}

// Cart helpers – basic stub
function getCartItems() {
  return readJson(CART_KEY);
}

function setCartItems(items) {
  writeJson(CART_KEY, items);
}

// --------- NAV HIGHLIGHTING ---------

function highlightActiveNav() {
  const links = document.querySelectorAll(".nav-link");
  const current = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const file = href.split("/").pop();
    if (file === current) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// --------- COMPARE BAR UI ---------

function renderCompareBar() {
  const bar = document.getElementById("compareBar");
  const list = document.getElementById("compareList");
  const items = getCompareItems();

  if (!bar || !list) return;

  if (!items.length) {
    bar.style.display = "none";
    list.innerHTML = "";
    return;
  }

  bar.style.display = "flex";
  list.innerHTML = "";

  items.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "compare-chip";
    chip.textContent = `${item.name} • ${item.type}`;
    list.appendChild(chip);
  });
}

function openCompareModal() {
  const backdrop = document.getElementById("compareBackdrop");
  const tableBody = document.getElementById("compareTableBody");
  const items = getCompareItems();

  if (!backdrop || !tableBody) return;

  tableBody.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.type}</td>
      <td>${item.power || "-"}</td>
      <td>${item.priceDisplay || "-"}</td>
    `;
    tableBody.appendChild(row);
  });

  backdrop.style.display = items.length ? "flex" : "none";
}

function closeCompareModal() {
  const backdrop = document.getElementById("compareBackdrop");
  if (backdrop) {
    backdrop.style.display = "none";
  }
}

// Toggle compare for a card
function toggleCompareForCard(cardEl) {
  const id = cardEl.dataset.productId;
  const name = cardEl.dataset.productName;
  const type = cardEl.dataset.productType || "Car";
  const power = cardEl.dataset.productPower || "";
  const priceDisplay = cardEl.dataset.productPriceDisplay || "";

  if (!id || !name) return;

  let items = getCompareItems();
  const existingIndex = items.findIndex((x) => x.id === id);

  if (existingIndex >= 0) {
    items.splice(existingIndex, 1);
  } else {
    items.push({ id, name, type, power, priceDisplay });
  }

  setCompareItems(items);
  renderCompareBar();
}

// --------- CART (front-end stub for now) ---------

function addToCartFromCard(cardEl) {
  const id = cardEl.dataset.productId;
  const name = cardEl.dataset.productName;
  const type = cardEl.dataset.productType || "Car";
  const priceDisplay = cardEl.dataset.productPriceDisplay || "";

  if (!id || !name) return;

  let items = getCartItems();
  items.push({ id, name, type, priceDisplay });
  setCartItems(items);

  // For now just show a simple message – backend cart can replace this later
  alert(`Added to cart: ${name}. Cart integration will be handled by the backend.`);
}

// --------- DYNAMIC CARS LOADING ---------

async function fetchCars() {
  const res = await fetch(`${API_BASE_URL}/cars`);
  if (!res.ok) {
    console.error('Failed to fetch cars', res.status);
    return [];
  }
  return res.json();
}

function renderCars(cars) {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  // Clear any hardcoded cards
  grid.innerHTML = '';

  cars.forEach((car) => {
    // Adjust field names if your backend returns different keys
    const id = car.carsid || car.product_id || car.id; // fallback options
    const name = car.name;
    const type = car.type;
    const power = car.power || '';
    const priceDisplay = car.price_display || car.priceDisplay || '';
    const description = car.description || '';

    const cardHtml = `
      <article
        class="product-card"
        data-product-id="${id}"
        data-product-name="${name}"
        data-product-type="${type}"
        data-product-power="${power}"
        data-product-price-display="${priceDisplay}"
      >
        <div class="product-tag">${type}</div>
        <div class="product-name">${name}</div>
        <div class="product-meta">
          ${description}
        </div>
        <div class="product-price-row">
          <span class="product-price">${priceDisplay}</span>
          <span class="text-muted">${power ? `Est. ${power}` : ''}</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-ghost" type="button" data-compare-toggle>
            Compare
          </button>
          <button class="btn btn-primary" type="button" data-add-cart>
            Add to Cart
          </button>
        </div>
      </article>
    `;

    grid.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// Wire compare/add-cart buttons for dynamically created cards
function wireCardButtons() {
  document.querySelectorAll("[data-compare-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      toggleCompareForCard(card);
    });
  });

  document.querySelectorAll("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      addToCartFromCard(card);
    });
  });
}

// --------- FILTERS (our own wiring so filters work with dynamic cards) ---------

function setupFilters() {
  const pills = document.querySelectorAll('.filters-bar .filter-pill');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (pill.classList.contains('active')) return;

      // Remove active from all pills, add to clicked
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.textContent.trim();
      const products = document.querySelectorAll('.product-grid .product-card');

      if (filter.toLowerCase() === 'all') {
        products.forEach(p => p.style.display = '');
      } else {
        products.forEach(p => {
          const type = p.dataset.productType;
          p.style.display = type === filter ? '' : 'none';
        });
      }
    });
  });
}

// --------- PAGE WIRING ---------

document.addEventListener("DOMContentLoaded", async () => {
  highlightActiveNav();

  // Compare bar / modal actions
  const compareBarButton = document.getElementById("compareNowButton");
  if (compareBarButton) {
    compareBarButton.addEventListener("click", openCompareModal);
  }

  const compareCloseButton = document.getElementById("compareCloseButton");
  if (compareCloseButton) {
    compareCloseButton.addEventListener("click", closeCompareModal);
  }

  const compareBackdrop = document.getElementById("compareBackdrop");
  if (compareBackdrop) {
    compareBackdrop.addEventListener("click", (e) => {
      if (e.target === compareBackdrop) closeCompareModal();
    });
  }

  renderCompareBar();

  // 🔥 Load cars from backend + render cards
  const cars = await fetchCars();
  await renderCars(cars);

  // Wire buttons on the newly rendered cards
  wireCardButtons();

  // Setup filters AFTER cards exist
  setupFilters();
});
