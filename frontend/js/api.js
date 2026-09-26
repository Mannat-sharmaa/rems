/* ============================================================
   REMS - Frontend API Client & Global Helpers: api.js
   ============================================================ */

const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

// Token Management
function getToken() {
  return localStorage.getItem('rems_token');
}

function setToken(token) {
  localStorage.setItem('rems_token', token);
}

function removeToken() {
  localStorage.removeItem('rems_token');
  localStorage.removeItem('rems_user');
}

function getCurrentUser() {
  const userStr = localStorage.getItem('rems_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem('rems_user', JSON.stringify(user));
}

function logout() {
  removeToken();
  showToast('You have been logged out.', 'info');
  setTimeout(() => {
    window.location.href = '/login.html';
  }, 400);
}

// Global API Fetcher
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
        // Token expired
        removeToken();
        showToast('Your session has expired. Please log in again.', 'warning');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 800);
      }
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Fetch Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// Indian Rupee (INR) Formatter
function formatINR(amount, compact = false) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0';

  if (compact) {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}k`;
    }
  }

  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });
}

// Date Formatter
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Time Formatter
function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

// Toast Notifications System
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✓';
  if (type === 'error') icon = '⚠️';
  if (type === 'warning') icon = '🔔';

  toast.innerHTML = `
    <span style="font-weight: 700; font-size: 1.1rem;">${icon}</span>
    <span style="flex-grow: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Modal Helpers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Image File Upload Helper
async function handleImageFileUpload(inputEl, targetUrlInputId, previewImgId) {
  const file = inputEl.files[0];
  if (!file) return;

  if (file.size > 20 * 1024 * 1024) {
    showToast('File size must be under 20MB.', 'warning');
    return;
  }

  showToast('Uploading image to server...', 'info');

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;

    // Show immediate preview
    if (previewImgId) {
      const preview = document.getElementById(previewImgId);
      if (preview) {
        preview.src = base64Data;
        preview.style.display = 'block';
      }
    }

    try {
      const res = await apiFetch('/upload', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: base64Data,
          filename: file.name
        })
      });

      if (res.success && res.url) {
        const urlInput = document.getElementById(targetUrlInputId);
        if (urlInput) urlInput.value = res.url;
        showToast('✓ Image uploaded successfully to server!', 'success');
      }
    } catch (err) {
      showToast('Image upload failed: ' + err.message, 'error');
    }
  };
  reader.readAsDataURL(file);
}

function updateImagePreview(targetUrlInputId, previewImgId) {
  const url = document.getElementById(targetUrlInputId)?.value;
  const preview = document.getElementById(previewImgId);
  if (preview && url) {
    preview.src = url;
    preview.style.display = 'block';
  }
}

// Initialize Global Theme
function initTheme() {
  const savedTheme = localStorage.getItem('rems_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('rems_theme', nextTheme);
      toggleBtn.innerHTML = nextTheme === 'dark' ? '☀️' : '🌙';
    });
  }
}

// Dynamic Auth State in Navbar
function updateNavbarAuth() {
  const user = getCurrentUser();
  const navActions = document.getElementById('nav-auth-actions');
  if (!navActions) return;

  if (user) {
    let dashboardLink = '/customer/index.html';
    if (user.role === 'Admin') dashboardLink = '/admin/index.html';
    else if (user.role === 'Agent') dashboardLink = '/agent/index.html';

    navActions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <a href="${dashboardLink}" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
          <span>👤</span> ${user.name.split(' ')[0]} (${user.role})
        </a>
        <button onclick="logout()" class="btn btn-outline btn-sm" title="Logout">
          Logout
        </button>
      </div>
    `;
  } else {
    navActions.innerHTML = `
      <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Get Started</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateNavbarAuth();
});
