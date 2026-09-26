/* ============================================================
   REMS - Authentication Controller: auth.js
   Login, Registration, Role-Based Redirection,
   and Quick Demo Account Selection
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect
  const user = getCurrentUser();
  const currentPath = window.location.pathname;

  if (user && (currentPath.includes('login.html') || currentPath.includes('register.html'))) {
    redirectByRole(user.role);
  }

  // Setup login form
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Setup register form
  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Quick Demo Pills
  setupDemoPills();
});

// Redirect by User Role
function redirectByRole(role) {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');

  if (redirectUrl) {
    window.location.href = redirectUrl;
    return;
  }

  if (role === 'Admin') {
    window.location.href = '/admin/index.html';
  } else if (role === 'Agent') {
    window.location.href = '/agent/index.html';
  } else {
    window.location.href = '/customer/index.html';
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login-submit');

  if (!email || !password) {
    showToast('Please fill in both email and password.', 'warning');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Authenticating...';

  try {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setToken(res.token);
    setCurrentUser(res.user);

    showToast(`Welcome back, ${res.user.name}!`, 'success');

    setTimeout(() => {
      redirectByRole(res.user.role);
    }, 600);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

// Handle Registration (Customer)
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const address = document.getElementById('reg-address').value.trim();
  const btn = document.getElementById('btn-register-submit');

  if (!name || !email || !phone || !password) {
    showToast('Please fill in all mandatory fields.', 'warning');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating Account...';

  try {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, address })
    });

    setToken(res.token);
    setCurrentUser(res.user);

    showToast('✓ Account registered successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = '/customer/index.html';
    }, 700);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

// Setup Demo Account Pills
function setupDemoPills() {
  const pills = document.querySelectorAll('.demo-pill-btn');
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const email = pill.dataset.email;
      const pass = pill.dataset.password;

      const emailField = document.getElementById('login-email');
      const passField = document.getElementById('login-password');

      if (emailField && passField) {
        emailField.value = email;
        passField.value = pass;
        showToast(`Filled credentials for ${pill.dataset.role}. Click Sign In!`, 'info');
      }
    });
  });
}
