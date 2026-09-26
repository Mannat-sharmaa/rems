/* ============================================================
   REMS - Agent Dashboard Controller: agent.js
   KPI Metrics, Assigned Properties, 5-Step Property Wizard,
   Visits Management, Bookings, Sales & Commission Calculation
   ============================================================ */

let wizardCurrentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'Agent') {
    showToast('Agent access only. Please login with an agent account.', 'warning');
    setTimeout(() => { window.location.href = '/login.html'; }, 800);
    return;
  }

  document.getElementById('dash-agent-name').textContent = user.name;
  document.getElementById('dash-agent-avatar').textContent = user.name.charAt(0);
  document.getElementById('dash-greeting').textContent = `Agent Workspace — ${user.name.split(' ')[0]} 💼`;

  setupTabNavigation();
  setupPropertyWizard();
  loadAgentDashboardStats();
  loadAgentProperties();
  loadAgentVisits();
  loadAgentBookings();
  loadAgentSalesAndCommission();

  const editForm = document.getElementById('form-edit-property');
  if (editForm) {
    editForm.addEventListener('submit', handleEditPropertySubmit);
  }
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
}

// 1. Load Agent Overview Stats
async function loadAgentDashboardStats() {
  try {
    const data = await apiFetch('/agent/dashboard');
    if (!data.success) return;

    const s = data.stats;
    document.getElementById('stat-my-properties').textContent = s.totalProperties;
    document.getElementById('stat-upcoming-visits').textContent = s.upcomingVisits;
    document.getElementById('stat-active-bookings').textContent = s.activeBookings;
    document.getElementById('stat-closed-sales').textContent = s.completedSales;
    document.getElementById('stat-total-commission').textContent = formatINR(s.totalCommission, true);

    // Upcoming visits preview table
    const upcomingTbody = document.getElementById('upcoming-visits-tbody');
    if (upcomingTbody && data.upcomingVisits) {
      if (data.upcomingVisits.length === 0) {
        upcomingTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No upcoming visits scheduled today.</td></tr>`;
      } else {
        upcomingTbody.innerHTML = data.upcomingVisits.map(v => `
          <tr>
            <td><strong>${v.property_title}</strong><div style="font-size: 0.78rem; color: var(--text-muted);">${v.city}</div></td>
            <td>${v.customer_name}<div style="font-size: 0.78rem; color: var(--text-muted);">${v.customer_phone}</div></td>
            <td><strong>${formatDate(v.visit_date)}</strong></td>
            <td>${formatTime(v.visit_time)}</td>
            <td>
              <button onclick="updateVisitStatus(${v.visit_id}, 'Completed')" class="btn btn-sm btn-success" style="font-size: 0.75rem;">
                ✓ Complete
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load agent dashboard:', err);
  }
}

// 2. Load Assigned Properties
async function loadAgentProperties() {
  const container = document.getElementById('agent-properties-grid');
  if (!container) return;

  try {
    const data = await apiFetch('/agent/properties');
    if (!data.success || data.properties.length === 0) {
      container.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1;">No properties assigned to your account yet.</p>';
      return;
    }

    container.innerHTML = data.properties.map(p => `
      <div class="property-card" style="box-shadow: var(--shadow-sm);">
        <div class="property-card-img-wrap" style="height: 180px;">
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}" class="property-card-img">
          <span class="property-badge-type">${p.property_type}</span>
          <span class="property-badge-status status-${p.property_status.toLowerCase()}">${p.property_status}</span>
        </div>
        <div class="property-card-body" style="padding: 18px;">
          <div class="property-price" style="font-size: 1.3rem;">${formatINR(p.price)}</div>
          <h4 class="property-card-title">${p.title}</h4>
          <div class="property-card-location">📍 ${p.address}, ${p.city}</div>
          <div class="property-features" style="margin-bottom: 12px; padding: 10px 0;">
            <span>🛏 ${p.bedrooms} BHK</span>
            <span>🛁 ${p.bathrooms} Baths</span>
            <span>📐 ${p.area_sqft} sqft</span>
          </div>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px;">
            Owner: <strong>${p.owner_name}</strong> (${p.owner_phone})
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="/property-details.html?id=${p.property_id}" class="btn btn-outline btn-sm" style="flex: 1;">Preview</a>
            <button type="button" onclick="openEditPropertyModal(${p.property_id})" class="btn btn-secondary btn-sm" style="flex: 1;">✏️ Edit</button>
            <button type="button" onclick="deleteAgentProperty(${p.property_id}, '${p.title.replace(/'/g, "\\'")}')" class="btn btn-danger btn-sm" style="padding: 6px 12px;" title="Delete Property">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p class="text-danger">Failed to load properties: ${err.message}</p>`;
  }
}

// Delete Property Action (Agent)
async function deleteAgentProperty(propertyId, title) {
  if (!confirm(`Are you sure you want to permanently delete "${title}" (#${propertyId}) from the database?`)) return;

  try {
    const res = await apiFetch(`/properties/${propertyId}`, { method: 'DELETE' });
    showToast(res.message || '✓ Property deleted successfully.', 'success');
    loadAgentProperties();
    loadAgentDashboardStats();
  } catch (err) {
    if (confirm(`${err.message}\n\nDo you want to permanently delete this property and all its test records from MySQL?`)) {
      try {
        const forceRes = await apiFetch(`/properties/${propertyId}?force=true`, { method: 'DELETE' });
        showToast(forceRes.message || '✓ Property deleted successfully.', 'success');
        loadAgentProperties();
        loadAgentDashboardStats();
      } catch (fErr) {
        showToast(fErr.message, 'error');
      }
    } else {
      showToast(err.message, 'warning');
    }
  }
}

// Open Edit Property Modal
async function openEditPropertyModal(propertyId) {
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

// Handle Edit Property Submit
async function handleEditPropertySubmit(e) {
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
    loadAgentProperties();
    loadAgentDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}

// 3. Multi-Step Add Property Wizard
function setupPropertyWizard() {
  const nextBtns = document.querySelectorAll('.wizard-next-btn');
  const prevBtns = document.querySelectorAll('.wizard-prev-btn');

  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateWizardStep(wizardCurrentStep)) {
        goToWizardStep(wizardCurrentStep + 1);
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      goToWizardStep(wizardCurrentStep - 1);
    });
  });

  const form = document.getElementById('form-add-property');
  if (form) {
    form.addEventListener('submit', handleAddPropertySubmit);
  }
}

function validateWizardStep(step) {
  if (step === 1) {
    const title = document.getElementById('wiz-title').value.trim();
    if (!title) { showToast('Please enter a property title.', 'warning'); return false; }
  } else if (step === 2) {
    const city = document.getElementById('wiz-city').value.trim();
    const addr = document.getElementById('wiz-address').value.trim();
    if (!city || !addr) { showToast('Please enter address and city.', 'warning'); return false; }
  } else if (step === 3) {
    const areaVal = document.getElementById('wiz-area').value;
    const area = parseFloat(areaVal);
    if (!areaVal || isNaN(area) || area <= 0) {
      showToast('Please specify a valid super built-up area in sq.ft.', 'warning');
      return false;
    }
  } else if (step === 4) {
    const priceVal = document.getElementById('wiz-price').value;
    const price = parseFloat(priceVal);
    if (!priceVal || isNaN(price) || price <= 0) {
      showToast('Please specify a valid property price in INR.', 'warning');
      return false;
    }
  }
  return true;
}

function goToWizardStep(step) {
  wizardCurrentStep = step;

  // Update step indicators
  document.querySelectorAll('.wizard-step').forEach((el, idx) => {
    const s = idx + 1;
    el.classList.toggle('active', s === step);
    el.classList.toggle('completed', s < step);
  });

  // Update panes
  document.querySelectorAll('.wizard-pane').forEach((pane, idx) => {
    pane.classList.toggle('active', (idx + 1) === step);
  });

  // If final step (5), populate preview summary
  if (step === 5) {
    document.getElementById('prev-title').textContent = document.getElementById('wiz-title').value;
    document.getElementById('prev-location').textContent = `${document.getElementById('wiz-address').value}, ${document.getElementById('wiz-city').value}`;
    document.getElementById('prev-price').textContent = formatINR(document.getElementById('wiz-price').value);
    document.getElementById('prev-specs').textContent = `${document.getElementById('wiz-bedrooms').value} Beds • ${document.getElementById('wiz-bathrooms').value} Baths • ${document.getElementById('wiz-area').value} sqft`;
  }
}

async function handleAddPropertySubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-publish-property');
  btn.disabled = true;
  btn.textContent = 'Publishing Property to MySQL...';

  const payload = {
    title: document.getElementById('wiz-title').value.trim(),
    description: document.getElementById('wiz-description').value.trim(),
    property_type_id: parseInt(document.getElementById('wiz-type').value, 10),
    listing_type: document.getElementById('wiz-listing-type').value,
    address: document.getElementById('wiz-address').value.trim(),
    city: document.getElementById('wiz-city').value.trim(),
    state: document.getElementById('wiz-state').value.trim(),
    pincode: document.getElementById('wiz-pincode').value.trim(),
    area_sqft: parseFloat(document.getElementById('wiz-area').value),
    bedrooms: parseInt(document.getElementById('wiz-bedrooms').value, 10) || 0,
    bathrooms: parseInt(document.getElementById('wiz-bathrooms').value, 10) || 0,
    floor_number: parseInt(document.getElementById('wiz-floor').value, 10) || 0,
    price: parseFloat(document.getElementById('wiz-price').value),
    owner_id: parseInt(document.getElementById('wiz-owner').value, 10) || 1,
    image_url: document.getElementById('wiz-image-url').value.trim() || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'
  };

  try {
    const res = await apiFetch('/properties', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    showToast('✓ Property published successfully! Status: Available', 'success');
    document.getElementById('form-add-property').reset();
    goToWizardStep(1);

    // Switch to properties tab
    document.querySelector('.sidebar-item[data-tab="properties"]').click();
    loadAgentProperties();
    loadAgentDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Publish Property';
  }
}

// 4. Load Agent Visits
async function loadAgentVisits() {
  const tbody = document.getElementById('agent-visits-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/visits/agent');
    if (!data.success || data.visits.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No assigned customer visits found.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.visits.map(v => `
      <tr>
        <td><strong>#V${v.visit_id}</strong></td>
        <td>
          <a href="/property-details.html?id=${v.property_id}" style="color: var(--primary); font-weight: 600;">
            ${v.property_title}
          </a>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${v.city}</div>
        </td>
        <td>
          <strong>${v.customer_name}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted);">📞 ${v.customer_phone}</div>
        </td>
        <td>${formatDate(v.visit_date)} at ${formatTime(v.visit_time)}</td>
        <td>
          <span class="badge ${v.visit_status === 'Completed' ? 'badge-success' : (v.visit_status === 'Cancelled' ? 'badge-danger' : 'badge-warning')}">
            ${v.visit_status}
          </span>
        </td>
        <td>
          ${v.visit_status === 'Scheduled' ? `
            <div class="action-btn-group">
              <button onclick="updateVisitStatus(${v.visit_id}, 'Completed')" class="btn btn-sm btn-success">✓ Complete</button>
              <button onclick="updateVisitStatus(${v.visit_id}, 'Cancelled')" class="btn btn-sm btn-outline" style="color: var(--danger);">✕ Cancel</button>
            </div>
          ` : `
            <span style="font-size: 0.85rem; color: var(--text-light);">Archived</span>
          `}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load visits: ${err.message}</td></tr>`;
  }
}

async function updateVisitStatus(visitId, status) {
  try {
    await apiFetch(`/visits/${visitId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showToast(`✓ Visit marked as ${status}.`, 'success');
    loadAgentVisits();
    loadAgentDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 5. Load Bookings (With Finalize Sale Action)
async function loadAgentBookings() {
  const tbody = document.getElementById('agent-bookings-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/bookings/agent');
    if (!data.success || data.bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No customer bookings received yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.bookings.map(b => `
      <tr>
        <td><strong>#B${b.booking_id}</strong></td>
        <td>
          <strong>${b.property_title}</strong>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${b.city} • Total Price: ${formatINR(b.property_price)}</div>
        </td>
        <td>${b.customer_name}<div style="font-size: 0.78rem; color: var(--text-muted);">${b.customer_phone}</div></td>
        <td><strong>${formatINR(b.booking_amount)}</strong></td>
        <td><span class="badge status-${b.booking_status.toLowerCase()}">${b.booking_status}</span></td>
        <td><span class="badge badge-success">${b.payment_status}</span></td>
        <td>
          ${b.booking_status === 'Confirmed' ? `
            <button onclick="finalizePropertySale(${b.booking_id}, '${b.property_title.replace(/'/g, "\\'")}')" class="btn btn-sm btn-primary">
              💼 Finalize Sale & Earn Commission
            </button>
          ` : `
            <span class="badge badge-neutral">${b.booking_status}</span>
          `}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Failed to load bookings: ${err.message}</td></tr>`;
  }
}

// Finalize Sale Action
async function finalizePropertySale(bookingId, propertyTitle) {
  if (!confirm(`Finalize complete sale process for "${propertyTitle}"? This will record the sale in the Sales table, mark property as Sold via database trigger, and credit your agent commission.`)) return;

  try {
    const res = await apiFetch(`/bookings/${bookingId}/complete-sale`, {
      method: 'POST'
    });

    showToast(`🎉 Sale Finalized! Commission Earned: ${formatINR(res.sale.commissionAmount)}`, 'success');
    loadAgentBookings();
    loadAgentDashboardStats();
    loadAgentSalesAndCommission();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 6. Load Completed Sales & Commission Ledger
async function loadAgentSalesAndCommission() {
  const tbody = document.getElementById('agent-sales-tbody');
  if (!tbody) return;

  try {
    const data = await apiFetch('/sales/agent');
    if (!data.success || data.sales.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No finalized sales recorded yet.</td></tr>`;
      return;
    }

    if (data.summary) {
      document.getElementById('comm-total-volume').textContent = formatINR(data.summary.total_volume);
      document.getElementById('comm-total-earned').textContent = formatINR(data.summary.total_commission);
    }

    tbody.innerHTML = data.sales.map(s => `
      <tr>
        <td><strong>#S${s.sale_id}</strong></td>
        <td>${s.property_title}<div style="font-size: 0.78rem; color: var(--text-muted);">${s.city}</div></td>
        <td>${s.customer_name}</td>
        <td>${formatDate(s.sale_date)}</td>
        <td><strong>${formatINR(s.sale_price)}</strong></td>
        <td style="color: var(--success); font-weight: 800;">+${formatINR(s.commission_amount)}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load sales: ${err.message}</td></tr>`;
  }
}
