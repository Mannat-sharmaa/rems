/* ============================================================
   REMS - Customer Dashboard Controller: customer.js
   Overview, Bookings Ledger, Visits Timeline,
   Payment History, and Purchased/Rented Assets
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'Customer') {
    showToast('Customer access only. Please login as a customer.', 'warning');
    setTimeout(() => { window.location.href = '/login.html'; }, 800);
    return;
  }

  // Populate profile info in sidebar
  document.getElementById('dash-user-name').textContent = user.name;
  document.getElementById('dash-user-avatar').textContent = user.name.charAt(0);
  document.getElementById('dash-greeting').textContent = `Welcome, ${user.name.split(' ')[0]} 👋`;

  setupTabNavigation();
  loadCustomerDashboardStats();
  loadCustomerBookings();
  loadCustomerVisits();
  loadCustomerPayments();
  loadCustomerPurchasedAndRented();
});

// Tab Navigation
function setupTabNavigation() {
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

  // Handle URL query ?tab=bookings
  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get('tab');
  if (activeTab) {
    const targetItem = document.querySelector(`.sidebar-item[data-tab="${activeTab}"]`);
    if (targetItem) targetItem.click();
  }
}

// 1. Load Dashboard Overview Stats
async function loadCustomerDashboardStats() {
  try {
    const data = await apiFetch('/customer/dashboard');
    if (!data.success) return;

    const s = data.stats;
    document.getElementById('stat-bookings-count').textContent = s.totalBookings;
    document.getElementById('stat-visits-count').textContent = s.upcomingVisits;
    document.getElementById('stat-total-spent').textContent = formatINR(s.totalSpent, true);
    document.getElementById('stat-properties-owned').textContent = s.totalPurchased + s.totalRented;

    // Upcoming visit card
    const nextVisitContainer = document.getElementById('dash-next-visit-box');
    if (nextVisitContainer) {
      if (data.nextVisit) {
        const v = data.nextVisit;
        nextVisitContainer.innerHTML = `
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 22px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span class="badge badge-warning">📅 Upcoming Physical Tour</span>
              <strong style="color: var(--primary);">${formatDate(v.visit_date)} at ${formatTime(v.visit_time)}</strong>
            </div>
            <h4 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 6px;">${v.property_title}</h4>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">📍 ${v.address}, ${v.city}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem;">
              <span>Assigned Agent: <strong>${v.agent_name}</strong> (${v.agent_phone})</span>
              <a href="/property-details.html?id=${v.property_id}" class="btn btn-outline btn-sm">View Property</a>
            </div>
          </div>
        `;
      } else {
        nextVisitContainer.innerHTML = `
          <div style="background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-md); padding: 22px; text-align: center; color: var(--text-muted); margin-bottom: 24px;">
            No upcoming physical visits scheduled. <a href="/properties.html" style="color: var(--primary); font-weight: 600;">Browse properties</a> to schedule a visit!
          </div>
        `;
      }
    }

    // Recommended properties grid
    const recContainer = document.getElementById('dash-recommendations-grid');
    if (recContainer && data.recommendations) {
      recContainer.innerHTML = data.recommendations.map(p => `
        <div class="property-card" onclick="window.location.href='/property-details.html?id=${p.property_id}'">
          <div class="property-card-img-wrap" style="height: 160px;">
            <img src="${p.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}" class="property-card-img">
            <span class="property-badge-type">${p.property_type}</span>
          </div>
          <div class="property-card-body" style="padding: 16px;">
            <div class="property-price" style="font-size: 1.2rem;">${formatINR(p.price)}</div>
            <h4 class="property-card-title" style="font-size: 0.98rem;">${p.title}</h4>
            <div class="property-card-location" style="font-size: 0.85rem; margin-bottom: 0;">📍 ${p.city}</div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load dashboard overview:', err);
  }
}

// 2. Load Bookings
async function loadCustomerBookings() {
  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;

  try {
    const data = await apiFetch('/bookings/my');
    if (!data.success || data.bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">No bookings made yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.bookings.map(b => `
      <tr>
        <td><strong>#B${b.booking_id}</strong></td>
        <td>
          <a href="/property-details.html?id=${b.property_id}" style="color: var(--primary); font-weight: 600;">
            ${b.property_title}
          </a>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${b.city}</div>
        </td>
        <td>${formatDate(b.booking_date)}</td>
        <td><strong>${formatINR(b.booking_amount)}</strong></td>
        <td><span class="badge status-${b.booking_status.toLowerCase()}">${b.booking_status}</span></td>
        <td>
          <span class="badge ${b.payment_status === 'Completed' ? 'badge-success' : 'badge-warning'}">
            ${b.payment_status}
          </span>
          <div style="font-size: 0.75rem; color: var(--text-light);">${b.transaction_id || 'N/A'}</div>
        </td>
        <td>
          ${b.booking_status === 'Confirmed' ? `
            <button onclick="cancelBooking(${b.booking_id})" class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger);">
              Cancel
            </button>
          ` : `
            <a href="/property-details.html?id=${b.property_id}" class="btn btn-outline btn-sm">View</a>
          `}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Failed to load bookings: ${err.message}</td></tr>`;
  }
}

// Cancel Booking
async function cancelBooking(bookingId) {
  if (!confirm(`Are you sure you want to cancel booking #B${bookingId}? This will release the property back to Available.`)) return;

  try {
    await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'PATCH' });
    showToast('✓ Booking cancelled successfully. Refund initiated.', 'success');
    loadCustomerBookings();
    loadCustomerDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 3. Load Visits (Timeline Style)
async function loadCustomerVisits() {
  const container = document.getElementById('visits-timeline-container');
  if (!container) return;

  try {
    const data = await apiFetch('/visits/my');
    if (!data.success || data.visits.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">No property visits requested yet.</div>`;
      return;
    }

    container.innerHTML = data.visits.map(v => `
      <div style="display: flex; gap: 20px; margin-bottom: 24px; position: relative;">
        <!-- Timeline node -->
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${v.visit_status === 'Completed' ? 'var(--success)' : (v.visit_status === 'Cancelled' ? 'var(--danger)' : 'var(--primary)')}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700;">
            ${v.visit_status === 'Completed' ? '✓' : (v.visit_status === 'Cancelled' ? '✕' : '●')}
          </div>
          <div style="width: 2px; flex-grow: 1; background: var(--border); margin-top: 6px;"></div>
        </div>

        <!-- Content card -->
        <div style="flex-grow: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="font-size: 1.05rem; font-weight: 700;">${v.property_title}</h4>
            <span class="badge ${v.visit_status === 'Completed' ? 'badge-success' : (v.visit_status === 'Cancelled' ? 'badge-danger' : 'badge-warning')}">
              ${v.visit_status}
            </span>
          </div>

          <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 8px;">
            <span>📍 ${v.address}, ${v.city}</span> • 
            <strong>${formatDate(v.visit_date)} at ${formatTime(v.visit_time)}</strong>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
            <span>Assigned Agent: <strong>${v.agent_name}</strong> (📞 ${v.agent_phone})</span>
            <div style="display: flex; gap: 8px;">
              ${v.visit_status === 'Scheduled' ? `
                <button onclick="cancelVisit(${v.visit_id})" class="btn btn-outline btn-sm" style="color: var(--danger); font-size: 0.78rem;">
                  Cancel Visit
                </button>
              ` : ''}
              <a href="/property-details.html?id=${v.property_id}" class="btn btn-primary btn-sm" style="font-size: 0.78rem;">
                View Property
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="text-danger">Failed to load visits: ${err.message}</p>`;
  }
}

// Cancel Visit
async function cancelVisit(visitId) {
  if (!confirm('Are you sure you want to cancel this scheduled visit?')) return;
  try {
    await apiFetch(`/visits/${visitId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Cancelled', remarks: 'Cancelled by customer' })
    });
    showToast('Visit cancelled.', 'info');
    loadCustomerVisits();
    loadCustomerDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 4. Load Payments
async function loadCustomerPayments() {
  const tbody = document.getElementById('payments-table-body');
  if (!tbody) return;

  try {
    const data = await apiFetch('/payments/my');
    if (!data.success || data.payments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">No payment records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.payments.map(p => `
      <tr>
        <td><strong>${p.transaction_id}</strong></td>
        <td>
          <a href="/property-details.html?id=${p.property_id}" style="color: var(--primary); font-weight: 600;">
            ${p.property_title}
          </a>
        </td>
        <td>${formatDate(p.payment_date)}</td>
        <td>${p.payment_method}</td>
        <td><strong>${formatINR(p.amount)}</strong></td>
        <td>
          <span class="badge ${p.payment_status === 'Completed' ? 'badge-success' : (p.payment_status === 'Pending' ? 'badge-warning' : 'badge-danger')}">
            ${p.payment_status}
          </span>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load payments: ${err.message}</td></tr>`;
  }
}

// 5. Load Purchased & Rented Assets
async function loadCustomerPurchasedAndRented() {
  const salesContainer = document.getElementById('purchased-properties-grid');
  const rentalsContainer = document.getElementById('rented-properties-grid');

  if (salesContainer) {
    try {
      const salesData = await apiFetch('/sales/my');
      if (salesData.sales.length === 0) {
        salesContainer.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1;">No finalized property purchases yet.</p>';
      } else {
        salesContainer.innerHTML = salesData.sales.map(s => `
          <div class="property-card" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="badge badge-success">✓ Purchased (Deed Finalized)</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(s.sale_date)}</span>
            </div>
            <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">${s.property_title}</h4>
            <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">📍 ${s.address}, ${s.city}</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary); margin-bottom: 12px;">
              ${formatINR(s.sale_price)}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 10px;">
              Serviced by Agent: <strong>${s.agent_name}</strong>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (rentalsContainer) {
    try {
      const rentalsData = await apiFetch('/rentals/my');
      if (rentalsData.rentals.length === 0) {
        rentalsContainer.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1;">No active rental contracts.</p>';
      } else {
        rentalsContainer.innerHTML = rentalsData.rentals.map(r => `
          <div class="property-card" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="badge badge-info">Active Lease</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(r.start_date)} - ${formatDate(r.end_date)}</span>
            </div>
            <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">${r.property_title}</h4>
            <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">📍 ${r.address}, ${r.city}</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 12px;">
              ${formatINR(r.monthly_rent)}/month
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 10px;">
              Security Deposit: <strong>${formatINR(r.security_deposit)}</strong>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }
}
