/* ============================================================
   REMS - Property Details Controller: property-details.js
   Full property details, Gallery, Schedule Visit Modal,
   Atomic Booking Transaction & Review Submission
   ============================================================ */

let currentProperty = null;
let currentPropertyId = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentPropertyId = urlParams.get('id') || 101;

  fetchPropertyDetails(currentPropertyId);
  setupStarRatingPicker();

  // If URL has action=visit, open modal directly
  if (urlParams.get('action') === 'visit') {
    setTimeout(openScheduleVisitModal, 600);
  } else if (urlParams.get('action') === 'book') {
    setTimeout(openBookingModal, 600);
  }
});

// Fetch Property Details
async function fetchPropertyDetails(id) {
  try {
    const data = await apiFetch(`/properties/${id}`);
    if (!data.success) {
      showToast('Property not found.', 'error');
      return;
    }

    currentProperty = data.property;
    renderPropertyData(data.property, data.reviews);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Render Data on UI
function renderPropertyData(p, reviews) {
  document.title = `${p.title} — REMS`;
  document.getElementById('breadcrumb-title').textContent = p.title;
  document.getElementById('details-title').textContent = p.title;
  document.getElementById('details-location').textContent = `📍 ${p.address}, ${p.city}, ${p.state} - ${p.pincode}`;
  document.getElementById('details-description').textContent = p.description || 'Premium residential property in high-demand locality.';

  // Image Gallery
  const mainImg = document.getElementById('details-main-img');
  if (mainImg) mainImg.src = p.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

  // Badges
  document.getElementById('details-type-badge').textContent = p.property_type;
  document.getElementById('details-status-badge').textContent = p.property_status;
  document.getElementById('details-status-badge').className = `badge status-${p.property_status.toLowerCase()}`;
  document.getElementById('details-listing-badge').textContent = p.listing_type === 'Sale' ? 'For Sale' : 'For Rent';

  // Rating
  document.getElementById('details-avg-rating').textContent = Number(p.avg_rating).toFixed(1);
  document.getElementById('details-reviews-count').textContent = `(${p.total_reviews} Reviews)`;

  // Specs
  document.getElementById('spec-bedrooms').textContent = p.bedrooms > 0 ? `${p.bedrooms} BHK` : 'Studio';
  document.getElementById('spec-bathrooms').textContent = `${p.bathrooms} Baths`;
  document.getElementById('spec-area').textContent = `${Number(p.area_sqft).toLocaleString('en-IN')} sq.ft`;
  document.getElementById('spec-floor').textContent = p.floor_number > 0 ? `${p.floor_number}th Floor` : 'Ground Floor';

  // Pricing Sidebar
  const priceDisplay = formatINR(p.price);
  document.getElementById('sidebar-price').textContent = p.listing_type === 'Rent' ? `${priceDisplay}/mo` : priceDisplay;

  // Booking token calculation: 10% or minimum 5 Lakhs for luxury
  let tokenAmount = Math.min(500000, Math.round(p.price * 0.1));
  if (p.listing_type === 'Rent') tokenAmount = p.price * 2; // Security deposit
  document.getElementById('sidebar-token-amount').textContent = formatINR(tokenAmount);

  // Disable Booking button if already Sold, Rented or Booked
  const bookBtn = document.getElementById('btn-book-now');
  if (p.property_status !== 'Available') {
    bookBtn.disabled = true;
    bookBtn.textContent = `Property is ${p.property_status}`;
    bookBtn.style.opacity = '0.6';
    bookBtn.style.cursor = 'not-allowed';
  } else {
    bookBtn.disabled = false;
    bookBtn.textContent = '⚡ Book Property Now';
    bookBtn.style.opacity = '1';
    bookBtn.style.cursor = 'pointer';
  }

  // Agent Details
  document.getElementById('agent-name').textContent = p.agent_name || 'Rahul Sharma';
  document.getElementById('agent-avatar').textContent = p.agent_name ? p.agent_name.charAt(0) : 'A';
  document.getElementById('agent-exp').textContent = `${p.agent_experience || 5} Years Experience • Licensed Real Estate Advisor`;
  document.getElementById('btn-call-agent').href = `tel:${p.agent_phone || '+919876511001'}`;

  // Reviews List
  renderReviewsList(reviews);
}

// Render Reviews List
function renderReviewsList(reviews) {
  const container = document.getElementById('reviews-list-container');
  if (!container) return;

  if (!reviews || reviews.length === 0) {
    container.innerHTML = `
      <div style="background: var(--bg-card); border: 1px dashed var(--border); padding: 24px; border-radius: var(--radius-sm); text-align: center; color: var(--text-muted);">
        No customer reviews yet. Be the first customer to share your thoughts on this property!
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map(r => `
    <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="property-agent-avatar">${r.customer_name ? r.customer_name.charAt(0) : 'C'}</div>
          <strong>${r.customer_name}</strong>
        </div>
        <div style="color: #f59e0b; font-size: 0.95rem;">
          ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
        </div>
      </div>
      <p style="color: var(--text-muted); font-size: 0.92rem; line-height: 1.5; margin-bottom: 6px;">
        ${r.comment}
      </p>
      <div style="font-size: 0.78rem; color: var(--text-light);">
        ${formatDate(r.review_date)}
      </div>
    </div>
  `).join('');
}

// Modal Controllers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Open Schedule Visit Modal
function openScheduleVisitModal() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in as a customer to schedule a visit.', 'warning');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1000);
    return;
  }

  // Set min date to tomorrow
  const dateInput = document.getElementById('visit-date-input');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().slice(0, 10);
    dateInput.value = tomorrow.toISOString().slice(0, 10);
  }

  openModal('modal-schedule-visit');
}

// Handle Schedule Visit Form Submit
async function handleScheduleVisitSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('visit-date-input').value;
  const time = document.getElementById('visit-time-input').value;
  const remarks = document.getElementById('visit-remarks-input').value;
  const btn = document.getElementById('btn-submit-visit');

  btn.disabled = true;
  btn.textContent = 'Scheduling Appointment...';

  try {
    const res = await apiFetch('/visits', {
      method: 'POST',
      body: JSON.stringify({
        property_id: currentPropertyId,
        visit_date: date,
        visit_time: time,
        remarks
      })
    });

    closeModal('modal-schedule-visit');
    showToast('✓ Visit scheduled successfully! Agent has been notified.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirm Appointment';
  }
}

// Open Booking Modal
function openBookingModal() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to book this property.', 'warning');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1000);
    return;
  }

  if (!currentProperty || currentProperty.property_status !== 'Available') {
    showToast('This property is no longer available.', 'warning');
    return;
  }

  // Populate booking modal details
  document.getElementById('booking-modal-prop-title').textContent = currentProperty.title;
  document.getElementById('booking-modal-prop-city').textContent = `${currentProperty.address}, ${currentProperty.city}`;
  document.getElementById('booking-modal-prop-price').textContent = formatINR(currentProperty.price);

  let tokenAmount = Math.min(500000, Math.round(currentProperty.price * 0.1));
  if (currentProperty.listing_type === 'Rent') tokenAmount = currentProperty.price * 2;
  document.getElementById('booking-modal-token-amount').textContent = formatINR(tokenAmount);

  // Reset steps
  document.getElementById('booking-step-summary').style.display = 'block';
  document.getElementById('booking-step-processing').style.display = 'none';
  document.getElementById('booking-step-success').style.display = 'none';

  openModal('modal-booking-payment');
}

// Execute Payment Booking Transaction
async function executePaymentBooking() {
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'UPI';
  const simulateFailure = document.getElementById('chk-simulate-failure')?.checked || false;

  let tokenAmount = Math.min(500000, Math.round(currentProperty.price * 0.1));
  if (currentProperty.listing_type === 'Rent') tokenAmount = currentProperty.price * 2;

  // Show processing state
  document.getElementById('booking-step-summary').style.display = 'none';
  document.getElementById('booking-step-processing').style.display = 'block';

  try {
    const res = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        property_id: currentPropertyId,
        booking_amount: tokenAmount,
        payment_method: selectedMethod,
        simulate_failure: simulateFailure
      })
    });

    // Success State
    document.getElementById('booking-step-processing').style.display = 'none';
    document.getElementById('booking-step-success').style.display = 'block';

    document.getElementById('receipt-booking-id').textContent = `#B${res.booking.bookingId}`;
    document.getElementById('receipt-txn-id').textContent = res.booking.transactionId;
    document.getElementById('receipt-amount').textContent = formatINR(res.booking.bookingAmount);

    showToast('✓ Transaction committed! Property is now Booked.', 'success');
  } catch (err) {
    document.getElementById('booking-step-processing').style.display = 'none';
    document.getElementById('booking-step-summary').style.display = 'block';
    showToast(`Payment Failed: ${err.message}`, 'error');
  }
}

// Star Rating Picker Setup
function setupStarRatingPicker() {
  const stars = document.querySelectorAll('#star-picker span');
  const valInput = document.getElementById('review-rating-val');

  function updateStars(num) {
    stars.forEach((s, idx) => {
      s.style.color = idx < num ? '#f59e0b' : '#cbd5e1';
    });
  }

  stars.forEach(s => {
    s.addEventListener('click', () => {
      const starVal = parseInt(s.dataset.star, 10);
      valInput.value = starVal;
      updateStars(starVal);
    });

    s.addEventListener('mouseenter', () => {
      updateStars(parseInt(s.dataset.star, 10));
    });
  });

  const picker = document.getElementById('star-picker');
  if (picker) {
    picker.addEventListener('mouseleave', () => {
      updateStars(parseInt(valInput.value, 10));
    });
  }
  updateStars(5);
}

// Open Review Modal
function openReviewModal() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to write a review.', 'warning');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1000);
    return;
  }
  openModal('modal-review');
}

// Handle Review Submit
async function handleReviewSubmit(e) {
  e.preventDefault();
  const rating = document.getElementById('review-rating-val').value;
  const comment = document.getElementById('review-comment-input').value;
  const btn = document.getElementById('btn-submit-review');

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    await apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        property_id: currentPropertyId,
        rating: parseInt(rating, 10),
        comment
      })
    });

    closeModal('modal-review');
    showToast('✓ Review submitted successfully!', 'success');
    fetchPropertyDetails(currentPropertyId);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Review';
  }
}
