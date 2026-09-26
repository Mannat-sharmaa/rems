/* ============================================================
   REMS - Admin Central Controller: admin.js
   Full system analytics, Chart.js integrations, Entity CRUD,
   12 Analytical Reports, and Interactive DBMS SQL Console
   ============================================================ */

let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'Admin') {
    showToast('Administrator access only. Please login as Admin.', 'warning');
    setTimeout(() => { window.location.href = '/login.html'; }, 800);
    return;
  }

  setupAdminTabs();
  loadAdminOverview();
  loadAdminProperties();
  loadAdminUsers();
  loadAdminBookings();
  loadAdminPayments();
  loadAdminSales();
  loadAdminRentals();
  loadAdminReviews();
  setupReportsSelector();
  setupSqlConsole();

  const editForm = document.getElementById('form-edit-property');
  if (editForm) {
    editForm.addEventListener('submit', handleAdminEditPropertySubmit);
  }
});

// Tab Navigation
function setupAdminTabs() {
  const navItems = document.querySelectorAll('.sidebar-item[data-tab]');
  const panes = document.querySelectorAll('.tab-pane');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.dataset.tab;

      navItems.forEach(i => i.classList.remove('active'));
      panes.forEach(p => p.style.display = 'none');

      item.classList.add('active');
      const targetPane = document.getElementById(`tab-pane-${tabId}`);
      if (targetPane) targetPane.style.display = 'block';
    });
  });
}

// 1. Load Admin Overview (KPIs & Charts)
async function loadAdminOverview() {
  try {
    const data = await apiFetch('/admin/dashboard');
    if (!data.success) return;

    const s = data.stats;
    document.getElementById('kpi-total-properties').textContent = s.totalProperties;
    document.getElementById('kpi-available-properties').textContent = s.availableProperties;
    document.getElementById('kpi-booked-properties').textContent = s.bookedProperties;
    document.getElementById('kpi-sold-properties').textContent = s.soldProperties;
    document.getElementById('kpi-rented-properties').textContent = s.rentedProperties;
    document.getElementById('kpi-total-customers').textContent = s.totalCustomers;
    document.getElementById('kpi-total-agents').textContent = s.totalAgents;
    document.getElementById('kpi-total-owners').textContent = s.totalOwners;
    document.getElementById('kpi-total-bookings').textContent = s.totalBookings;
    document.getElementById('kpi-total-sales').textContent = s.totalSales;
    document.getElementById('kpi-total-revenue').textContent = formatINR(s.totalRevenue, true);
    document.getElementById('kpi-pending-payments').textContent = s.pendingPaymentsCount;

    // Initialize Chart.js Data Visualizations
    renderAdminCharts(data.charts);
  } catch (err) {
    console.error('Failed to load admin overview:', err);
  }
}

// Render Chart.js Visualizations
function renderAdminCharts(chartData) {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Properties by Type (Donut)
  const ctxType = document.getElementById('chart-properties-type')?.getContext('2d');
  if (ctxType) {
    if (charts.typeChart) charts.typeChart.destroy();
    charts.typeChart = new Chart(ctxType, {
      type: 'doughnut',
      data: {
        labels: chartData.byType.map(t => t.type_name),
        datasets: [{
          data: chartData.byType.map(t => t.count),
          backgroundColor: ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Chart 2: Properties by City (Bar)
  const ctxCity = document.getElementById('chart-properties-city')?.getContext('2d');
  if (ctxCity) {
    if (charts.cityChart) charts.cityChart.destroy();
    charts.cityChart = new Chart(ctxCity, {
      type: 'bar',
      data: {
        labels: chartData.byCity.map(c => c.city),
        datasets: [{
          label: 'Total Properties',
          data: chartData.byCity.map(c => c.count),
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  }

  // Chart 3: Monthly Sales Revenue (Line)
  const ctxMonthly = document.getElementById('chart-monthly-sales')?.getContext('2d');
  if (ctxMonthly && chartData.monthlySales) {
    if (charts.monthlyChart) charts.monthlyChart.destroy();
    charts.monthlyChart = new Chart(ctxMonthly, {
      type: 'line',
      data: {
        labels: chartData.monthlySales.map(m => m.month_label),
        datasets: [{
          label: 'Sales Revenue (₹)',
          data: chartData.monthlySales.map(m => m.revenue),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

// 2. Load Properties (Admin Management)
async function loadAdminProperties() {
  const tbody = document.getElementById('admin-properties-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/properties?limit=50&status=All');
    if (!data.success || data.properties.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px;">No properties listed.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.properties.map(p => `
      <tr>
        <td><strong>#P${p.property_id}</strong></td>
        <td>
          <a href="/property-details.html?id=${p.property_id}" target="_blank" style="color: var(--primary); font-weight: 600;">
            ${p.title}
          </a>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${p.address}, ${p.city}</div>
        </td>
        <td>${p.property_type}</td>
        <td><strong>${formatINR(p.price)}</strong></td>
        <td><span class="badge status-${p.property_status.toLowerCase()}">${p.property_status}</span></td>
        <td>${p.agent_name || 'Unassigned'}</td>
        <td>
          <div class="action-btn-group">
            <a href="/property-details.html?id=${p.property_id}" target="_blank" class="btn btn-sm btn-outline">View</a>
            <button onclick="openAdminEditPropertyModal(${p.property_id})" class="btn btn-sm btn-secondary">✏️ Edit</button>
            <button onclick="deleteProperty(${p.property_id})" class="btn btn-sm btn-danger">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Failed to load: ${err.message}</td></tr>`;
  }
}

// Open Edit Property Modal (Admin)
async function openAdminEditPropertyModal(propertyId) {
  try {
    const data = await apiFetch(`/properties/${propertyId}`);
    if (!data.success || !data.property) {
      showToast('Property details not found.', 'error');
      return;
    }
    const p = data.property;

    document.getElementById('edit-property-id').value = p.property_id;
    document.getElementById('edit-title').value = p.title || '';
    document.getElementById('edit-price').value = p.price || '';
    document.getElementById('edit-status').value = p.property_status || 'Available';
    document.getElementById('edit-listing-type').value = p.listing_type || 'Sale';
    document.getElementById('edit-area').value = p.area_sqft || '';
    document.getElementById('edit-bedrooms').value = p.bedrooms !== undefined ? p.bedrooms : 0;
    document.getElementById('edit-bathrooms').value = p.bathrooms !== undefined ? p.bathrooms : 0;
    document.getElementById('edit-floor').value = p.floor_number !== undefined ? p.floor_number : 0;
    document.getElementById('edit-address').value = p.address || '';
    document.getElementById('edit-city').value = p.city || '';
    document.getElementById('edit-state').value = p.state || '';
    document.getElementById('edit-pincode').value = p.pincode || '';
    document.getElementById('edit-image-url').value = p.image_url || '';
    document.getElementById('edit-description').value = p.description || '';

    const preview = document.getElementById('edit-image-preview');
    if (preview) {
      preview.src = p.image_url || '';
      preview.style.display = p.image_url ? 'block' : 'none';
    }

    openModal('modal-edit-property');
  } catch (err) {
    showToast('Failed to load property details: ' + err.message, 'error');
  }
}

// Handle Edit Property Submit (Admin)
async function handleAdminEditPropertySubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-property-id').value;
  const btn = document.getElementById('btn-save-property-edit');
  btn.disabled = true;
  btn.textContent = 'Saving to MySQL...';

  const payload = {
    title: document.getElementById('edit-title').value.trim(),
    price: parseFloat(document.getElementById('edit-price').value),
    property_status: document.getElementById('edit-status').value,
    listing_type: document.getElementById('edit-listing-type').value,
    area_sqft: parseFloat(document.getElementById('edit-area').value),
    bedrooms: parseInt(document.getElementById('edit-bedrooms').value, 10) || 0,
    bathrooms: parseInt(document.getElementById('edit-bathrooms').value, 10) || 0,
    floor_number: parseInt(document.getElementById('edit-floor').value, 10) || 0,
    address: document.getElementById('edit-address').value.trim(),
    city: document.getElementById('edit-city').value.trim(),
    state: document.getElementById('edit-state').value.trim(),
    pincode: document.getElementById('edit-pincode').value.trim(),
    image_url: document.getElementById('edit-image-url').value.trim(),
    description: document.getElementById('edit-description').value.trim()
  };

  try {
    await apiFetch(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    showToast(`✓ Property #${id} updated successfully in MySQL!`, 'success');
    closeModal('modal-edit-property');
    loadAdminProperties();
    loadAdminOverview();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}

async function deleteProperty(id) {
  if (!confirm(`Are you sure you want to permanently delete Property #P${id}?`)) return;

  try {
    await apiFetch(`/properties/${id}`, { method: 'DELETE' });
    showToast('✓ Property deleted successfully.', 'success');
    loadAdminProperties();
    loadAdminOverview();
  } catch (err) {
    if (confirm(`${err.message}\n\nDo you want to permanently delete Property #P${id} and all its linked records from MySQL?`)) {
      try {
        const forceRes = await apiFetch(`/properties/${id}?force=true`, { method: 'DELETE' });
        showToast(forceRes.message || '✓ Property deleted successfully.', 'success');
        loadAdminProperties();
        loadAdminOverview();
      } catch (fErr) {
        showToast(fErr.message, 'error');
      }
    } else {
      showToast(err.message, 'warning');
    }
  }
}

// 3. Load Users Management
async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/admin/users');
    if (!data.success) return;

    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td><strong>#U${u.user_id}</strong></td>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td><span class="badge ${u.role === 'Admin' ? 'badge-danger' : (u.role === 'Agent' ? 'badge-info' : 'badge-neutral')}">${u.role}</span></td>
        <td>${formatDate(u.created_at)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// 4. Load Bookings
async function loadAdminBookings() {
  const tbody = document.getElementById('admin-bookings-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/bookings');
    if (!data.success) return;

    tbody.innerHTML = data.bookings.map(b => `
      <tr>
        <td><strong>#B${b.booking_id}</strong></td>
        <td>${b.property_title}<div style="font-size: 0.78rem; color: var(--text-muted);">${b.city}</div></td>
        <td>${b.customer_name}</td>
        <td>${b.agent_name}</td>
        <td><strong>${formatINR(b.booking_amount)}</strong></td>
        <td><span class="badge status-${b.booking_status.toLowerCase()}">${b.booking_status}</span></td>
        <td><span class="badge badge-success">${b.payment_status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// 5. Load Payments
async function loadAdminPayments() {
  const tbody = document.getElementById('admin-payments-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/payments');
    if (!data.success) return;

    tbody.innerHTML = data.payments.map(p => `
      <tr>
        <td><strong>${p.transaction_id}</strong></td>
        <td>${p.property_title}</td>
        <td>${p.customer_name}</td>
        <td>${formatDate(p.payment_date)}</td>
        <td>${p.payment_method}</td>
        <td><strong>${formatINR(p.amount)}</strong></td>
        <td><span class="badge ${p.payment_status === 'Completed' ? 'badge-success' : 'badge-warning'}">${p.payment_status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// 6. Load Sales
async function loadAdminSales() {
  const tbody = document.getElementById('admin-sales-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/sales');
    if (!data.success) return;

    tbody.innerHTML = data.sales.map(s => `
      <tr>
        <td><strong>#S${s.sale_id}</strong></td>
        <td>${s.property_title}</td>
        <td>${s.buyer_name || s.customer_name}</td>
        <td>${s.agent_name}</td>
        <td>${formatDate(s.sale_date)}</td>
        <td><strong>${formatINR(s.sale_price)}</strong></td>
        <td style="color: var(--success); font-weight: 700;">${formatINR(s.commission_amount)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// 7. Load Rentals
async function loadAdminRentals() {
  const tbody = document.getElementById('admin-rentals-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/rentals');
    if (!data.success) return;

    tbody.innerHTML = data.rentals.map(r => `
      <tr>
        <td><strong>#R${r.rental_id}</strong></td>
        <td>${r.property_title}</td>
        <td>${r.tenant_name || r.customer_name}</td>
        <td>${r.agent_name}</td>
        <td>${formatDate(r.start_date)} - ${formatDate(r.end_date)}</td>
        <td><strong>${formatINR(r.monthly_rent)}/mo</strong></td>
        <td><span class="badge badge-info">${r.rental_status}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// 8. Load Reviews
async function loadAdminReviews() {
  const tbody = document.getElementById('admin-reviews-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/reviews');
    if (!data.success) return;

    tbody.innerHTML = data.reviews.map(r => `
      <tr>
        <td><strong>#RV${r.review_id}</strong></td>
        <td>${r.property_title}</td>
        <td>${r.customer_name}</td>
        <td style="color: #f59e0b;">${'★'.repeat(r.rating)}</td>
        <td style="max-width: 320px;">${r.comment}</td>
        <td>
          <button onclick="deleteReview(${r.review_id})" class="btn btn-sm btn-outline" style="color: var(--danger);">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

async function deleteReview(id) {
  if (!confirm(`Delete review #${id}?`)) return;
  try {
    await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
    showToast('Review removed.', 'success');
    loadAdminReviews();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 9. Setup 12 Analytical Reports
function setupReportsSelector() {
  const select = document.getElementById('report-type-select');
  if (!select) return;

  select.addEventListener('change', () => {
    fetchSelectedReport(select.value);
  });

  fetchSelectedReport(select.value);
}

async function fetchSelectedReport(reportEndpoint) {
  const titleEl = document.getElementById('report-title-display');
  const countEl = document.getElementById('report-count-badge');
  const thead = document.getElementById('report-table-thead');
  const tbody = document.getElementById('report-table-tbody');

  tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 24px;">Generating analytical report...</td></tr>`;

  try {
    const res = await apiFetch(`/reports/${reportEndpoint}`);
    if (!res.success) throw new Error(res.message);

    titleEl.textContent = res.title;
    countEl.textContent = `${res.count} Records`;

    if (res.data.length === 0) {
      thead.innerHTML = '';
      tbody.innerHTML = `<tr><td style="text-align: center; padding: 24px;">No records found for this report.</td></tr>`;
      return;
    }

    const columns = Object.keys(res.data[0]);

    // Render Headers
    thead.innerHTML = `<tr>${columns.map(c => `<th>${c.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}</tr>`;

    // Render Rows
    tbody.innerHTML = res.data.map(row => `
      <tr>
        ${columns.map(c => {
          let val = row[c];
          if (typeof val === 'number' && (c.includes('price') || c.includes('amount') || c.includes('revenue') || c.includes('commission') || c.includes('rent') || c.includes('spent'))) {
            val = formatINR(val);
          }
          return `<td>${val !== null && val !== undefined ? val : '—'}</td>`;
        }).join('')}
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td class="text-danger" style="text-align: center; padding: 24px;">Failed to generate report: ${err.message}</td></tr>`;
  }
}

// 10. Interactive DBMS SQL Console (Live Execution of 32 Queries)
async function setupSqlConsole() {
  const select = document.getElementById('sql-catalog-select');
  const editor = document.getElementById('sql-editor-textarea');
  const runBtn = document.getElementById('btn-run-sql');

  if (!select || !editor || !runBtn) return;

  try {
    const res = await apiFetch('/sql/catalog');
    if (res.success && res.queries) {
      select.innerHTML = res.queries.map(q => `
        <option value="${q.id}">[Q${q.id}] ${q.category}: ${q.title}</option>
      `).join('');

      // On select change, update editor
      select.addEventListener('change', () => {
        const selectedQuery = res.queries.find(q => q.id === parseInt(select.value, 10));
        if (selectedQuery) {
          editor.value = selectedQuery.sql;
        }
      });

      // Populate first query
      if (res.queries[0]) {
        editor.value = res.queries[0].sql;
      }
    }
  } catch (err) {
    console.error('Failed to load SQL catalog:', err);
  }

  runBtn.addEventListener('click', async () => {
    const sql = editor.value.trim();
    const timingBadge = document.getElementById('sql-execution-time');
    const rowsBadge = document.getElementById('sql-row-count');
    const thead = document.getElementById('sql-result-thead');
    const tbody = document.getElementById('sql-result-tbody');

    runBtn.disabled = true;
    runBtn.textContent = 'Executing...';
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 20px;">Running query on MySQL...</td></tr>`;

    try {
      const res = await apiFetch('/sql/execute-custom', {
        method: 'POST',
        body: JSON.stringify({ sql })
      });

      timingBadge.textContent = `⏱ Execution Time: ${res.durationMs}ms`;
      rowsBadge.textContent = `📊 Rows: ${res.rowCount}`;

      if (res.rows.length === 0) {
        thead.innerHTML = '';
        tbody.innerHTML = `<tr><td style="text-align: center; padding: 20px; color: var(--text-muted);">Query executed successfully. 0 rows returned.</td></tr>`;
        return;
      }

      // Render Dynamic Columns & Rows
      thead.innerHTML = `<tr>${res.columns.map(c => `<th>${c}</th>`).join('')}</tr>`;
      tbody.innerHTML = res.rows.map(row => `
        <tr>
          ${res.columns.map(col => `<td>${row[col] !== null && row[col] !== undefined ? row[col] : 'NULL'}</td>`).join('')}
        </tr>
      `).join('');
    } catch (err) {
      timingBadge.textContent = 'Execution Error';
      tbody.innerHTML = `<tr><td class="text-danger" style="padding: 20px;">SQL Error: ${err.message}</td></tr>`;
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = '▶ Execute SQL';
    }
  });
}
