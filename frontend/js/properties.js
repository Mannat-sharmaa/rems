/* ============================================================
   REMS - Properties Search & Filter Controller: properties.js
   ============================================================ */

let currentPage = 1;
const limit = 12;
let debounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  parseUrlParams();
  setupFilterEventListeners();
  fetchProperties();
});

// Parse Initial URL Query Params (e.g. from Hero Search on index.html)
function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('city')) {
    const citySelect = document.getElementById('filter-city');
    if (citySelect) citySelect.value = urlParams.get('city');
  }

  if (urlParams.has('type')) {
    const typeSelect = document.getElementById('filter-type');
    if (typeSelect) typeSelect.value = urlParams.get('type');
  }

  if (urlParams.has('listingType')) {
    const val = urlParams.get('listingType');
    document.querySelectorAll('#pill-listing-type .pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.val === val);
    });
  }

  if (urlParams.has('maxPrice')) {
    const maxInput = document.getElementById('filter-max-price');
    if (maxInput) maxInput.value = urlParams.get('maxPrice');
  }

  if (urlParams.has('bedrooms')) {
    const val = urlParams.get('bedrooms');
    document.querySelectorAll('#pill-bedrooms .pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.val === val);
    });
  }

  if (urlParams.has('search')) {
    const searchInput = document.getElementById('search-input-main');
    if (searchInput) searchInput.value = urlParams.get('search');
  }
}

// Setup Event Listeners
function setupFilterEventListeners() {
  // Search input debounced
  const searchInput = document.getElementById('search-input-main');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentPage = 1;
        fetchProperties();
      }, 350);
    });
  }

  // Pill buttons for Listing Type
  document.querySelectorAll('#pill-listing-type .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#pill-listing-type .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPage = 1;
      fetchProperties();
    });
  });

  // Pill buttons for Bedrooms
  document.querySelectorAll('#pill-bedrooms .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#pill-bedrooms .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPage = 1;
      fetchProperties();
    });
  });

  // Apply button
  const applyBtn = document.getElementById('btn-apply-filters');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      currentPage = 1;
      fetchProperties();
    });
  }

  // Reset button
  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('filter-city').value = '';
      document.getElementById('filter-type').value = 'All';
      document.getElementById('filter-min-price').value = '';
      document.getElementById('filter-max-price').value = '';
      document.getElementById('filter-status').value = 'Available';
      document.getElementById('search-input-main').value = '';

      document.querySelectorAll('#pill-listing-type .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.val === 'All'));
      document.querySelectorAll('#pill-bedrooms .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.val === '0'));

      currentPage = 1;
      fetchProperties();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentPage = 1;
      fetchProperties();
    });
  }
}

// Fetch Properties from API
async function fetchProperties() {
  const container = document.getElementById('properties-results-grid');
  const countBadge = document.getElementById('results-count-badge');
  if (!container) return;

  // Render Skeleton Skeletons
  container.innerHTML = `
    <div class="property-card skeleton" style="height: 400px;"></div>
    <div class="property-card skeleton" style="height: 400px;"></div>
    <div class="property-card skeleton" style="height: 400px;"></div>
  `;

  const city = document.getElementById('filter-city')?.value || '';
  const type = document.getElementById('filter-type')?.value || 'All';
  const minPrice = document.getElementById('filter-min-price')?.value || '';
  const maxPrice = document.getElementById('filter-max-price')?.value || '';
  const status = document.getElementById('filter-status')?.value || 'Available';
  const search = document.getElementById('search-input-main')?.value || '';
  const sort = document.getElementById('sort-select')?.value || 'newest';

  const activeListingPill = document.querySelector('#pill-listing-type .pill-btn.active');
  const listingType = activeListingPill ? activeListingPill.dataset.val : 'All';

  const activeBedroomsPill = document.querySelector('#pill-bedrooms .pill-btn.active');
  const bedrooms = activeBedroomsPill ? activeBedroomsPill.dataset.val : '0';

  const queryParams = new URLSearchParams({
    city,
    type,
    listingType,
    status,
    minPrice,
    maxPrice,
    bedrooms,
    search,
    sort,
    page: currentPage,
    limit
  });

  try {
    const data = await apiFetch(`/properties?${queryParams.toString()}`);

    if (countBadge) {
      countBadge.textContent = `${data.total} Properties Found`;
    }

    if (!data.success || data.properties.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border);">
          <div style="font-size: 3rem; margin-bottom: 14px;">🏡</div>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">No matching properties found</h3>
          <p style="color: var(--text-muted); max-width: 460px; margin: 0 auto 20px;">
            We couldn't find any properties matching your exact search criteria. Try adjusting your filters or resetting them.
          </p>
          <button onclick="document.getElementById('btn-reset-filters').click()" class="btn btn-outline btn-sm">
            Reset Filters
          </button>
        </div>
      `;
      renderPagination(0);
      return;
    }

    container.innerHTML = data.properties.map(p => `
      <div class="property-card" onclick="window.location.href='/property-details.html?id=${p.property_id}'">
        <div class="property-card-img-wrap">
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'}"
               alt="${p.title}" class="property-card-img" loading="lazy">
          <span class="property-badge-type">${p.property_type}</span>
          <span class="property-badge-status status-${p.property_status.toLowerCase()}">${p.property_status.toUpperCase()}</span>
        </div>
        <div class="property-card-body">
          <div class="property-price">
            ${formatINR(p.price)}
            ${p.listing_type === 'Rent' ? '<span class="property-price-period">/month</span>' : ''}
          </div>
          <h3 class="property-card-title">${p.title}</h3>
          <div class="property-card-location">
            <span>📍</span> ${p.address}, ${p.city}
          </div>
          <div class="property-features">
            <span class="property-feature-item">🛏 ${p.bedrooms > 0 ? p.bedrooms + ' Beds' : 'Studio'}</span>
            <span class="property-feature-item">🛁 ${p.bathrooms} Baths</span>
            <span class="property-feature-item">📐 ${p.area_sqft} sqft</span>
          </div>
          <div class="property-card-footer">
            <div class="property-agent-mini">
              <div class="property-agent-avatar">${p.agent_name ? p.agent_name.charAt(0) : 'A'}</div>
              <span>${p.agent_name || 'Agent'}</span>
            </div>
            <span style="color: var(--primary); font-weight: 700; font-size: 0.88rem;">
              View Details →
            </span>
          </div>
        </div>
      </div>
    `).join('');

    renderPagination(data.totalPages);
  } catch (err) {
    container.innerHTML = `<p class="text-danger" style="grid-column: 1 / -1;">Error loading properties: ${err.message}</p>`;
  }
}

// Render Pagination Controls
function renderPagination(totalPages) {
  const container = document.getElementById('pagination-controls');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <button class="btn btn-outline btn-sm" ${currentPage <= 1 ? 'disabled style="opacity: 0.5;"' : ''} onclick="changePage(${currentPage - 1})">
      ← Prev
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline'}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="btn btn-outline btn-sm" ${currentPage >= totalPages ? 'disabled style="opacity: 0.5;"' : ''} onclick="changePage(${currentPage + 1})">
      Next →
    </button>
  `;

  container.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  fetchProperties();
  window.scrollTo({ top: 120, behavior: 'smooth' });
}
