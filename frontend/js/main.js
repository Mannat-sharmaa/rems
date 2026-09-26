/* ============================================================
   REMS - Public Interactive Engine: main.js
   Smooth scrolling, Custom Cursor, Magnetic Buttons,
   3D Architectural Canvas, and Animated Counters
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initMagneticButtons();
  initScrollProgress();
  initNavbarScroll();
  init3DHeroCanvas();
  initCounterAnimations();
  loadFeaturedProperties();
  loadPopularCities();
});

// 1. Custom Cursor
function initCustomCursor() {
  if (window.innerWidth <= 1024) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  const follower = document.createElement('div');
  follower.className = 'custom-cursor-follower';

  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(renderFollower);
  }
  requestAnimationFrame(renderFollower);

  // Hover triggers
  const interactiveTargets = 'a, button, .property-card, .city-card, .search-select, .search-input';
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveTargets);
    if (target) {
      cursor.classList.add('hover');
      if (target.closest('.property-card')) {
        cursor.textContent = 'VIEW';
      } else {
        cursor.textContent = '';
      }
      follower.style.transform = 'translate(-50%, -50%) scale(1.4)';
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveTargets);
    if (target) {
      cursor.classList.remove('hover');
      cursor.textContent = '';
      follower.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });
}

// 2. Magnetic Buttons
function initMagneticButtons() {
  if (window.innerWidth <= 1024) return;

  const magneticBtns = document.querySelectorAll('.btn-primary, .hero-search-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

// 3. Scroll Progress Bar
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = `${progress}%`;
  });
}

// 4. Navbar Scroll Compact State
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// 5. 3D Architectural Canvas (Hero Abstract Modern Building Wireframe)
function init3DHeroCanvas() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  window.addEventListener('resize', () => {
    if (canvas.parentElement) {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    }
  });

  // Architectural 3D Cube & Grid Nodes
  let angleX = 0.4;
  let angleY = 0.5;
  let targetAngleX = 0.4;
  let targetAngleY = 0.5;

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;
    targetAngleY = 0.5 + normX * 0.6;
    targetAngleX = 0.4 + normY * 0.4;
  });

  // Cube wireframe points
  const points = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
    [-0.5, -1.8, -0.5], [0.5, -1.8, -0.5], [0.5, -1, -0.5], [-0.5, -1, -0.5], // Modern tower spire
    [-0.5, -1.8, 0.5], [0.5, -1.8, 0.5], [0.5, -1, 0.5], [-0.5, -1, 0.5]
  ];

  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
    [8,9],[9,10],[10,11],[11,8],
    [12,13],[13,14],[14,15],[15,12],
    [8,12],[9,13],[10,14],[11,15]
  ];

  function draw() {
    ctx.clearRect(0, 0, width, height);

    angleX += (targetAngleX - angleX) * 0.05;
    angleY += (targetAngleY - angleY) * 0.05;

    const radX = angleX;
    const radY = angleY;
    const scale = Math.min(width, height) * 0.18;
    const cx = width * 0.78;
    const cy = height * 0.45;

    const projected = points.map(p => {
      // Rotate Y
      let x1 = p[0] * Math.cos(radY) + p[2] * Math.sin(radY);
      let y1 = p[1];
      let z1 = -p[0] * Math.sin(radY) + p[2] * Math.cos(radY);

      // Rotate X
      let x2 = x1;
      let y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
      let z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

      const fov = 3.5;
      const factor = fov / (fov + z2);

      return {
        x: cx + x2 * scale * factor,
        y: cy + y2 * scale * factor
      };
    });

    // Draw Edges
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.45)' : 'rgba(37, 99, 235, 0.35)';
    ctx.lineWidth = 1.5;

    edges.forEach(e => {
      const p1 = projected[e[0]];
      const p2 = projected[e[1]];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Draw Node Vertices
    projected.forEach(p => {
      ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// 6. Number Counter Animations on Viewport Intersection
function initCounterAnimations() {
  const counterElements = document.querySelectorAll('.stat-number');
  if (counterElements.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = target % 1 !== 0;

        let start = 0;
        const duration = 1500;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // EaseOutQuart
          const ease = 1 - Math.pow(1 - progress, 4);
          const currentVal = start + (target - start) * ease;

          if (isDecimal) {
            el.textContent = currentVal.toFixed(1) + suffix;
          } else {
            el.textContent = Math.floor(currentVal).toLocaleString() + suffix;
          }

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = isDecimal ? target.toFixed(1) + suffix : target.toLocaleString() + suffix;
          }
        }

        requestAnimationFrame(updateCounter);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.25 });

  counterElements.forEach(el => observer.observe(el));
}

// 7. Load Featured Properties on Homepage
async function loadFeaturedProperties() {
  const container = document.getElementById('featured-properties-grid');
  if (!container) return;

  try {
    const data = await apiFetch('/properties/featured');
    if (!data.success || data.properties.length === 0) {
      container.innerHTML = '<p class="text-muted">No featured properties available at the moment.</p>';
      return;
    }

    container.innerHTML = data.properties.map(p => `
      <div class="property-card" onclick="window.location.href='/property-details.html?id=${p.property_id}'">
        <div class="property-card-img-wrap">
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'}"
               alt="${p.title}" class="property-card-img" loading="lazy">
          <span class="property-badge-type">${p.property_type}</span>
          <span class="property-badge-status status-available">${p.listing_type === 'Sale' ? 'FOR SALE' : 'FOR RENT'}</span>
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
  } catch (err) {
    container.innerHTML = `<p class="text-danger">Failed to load properties. Ensure backend is running.</p>`;
  }
}

// 8. Load Popular Cities
async function loadPopularCities() {
  const container = document.getElementById('popular-cities-grid');
  if (!container) return;

  try {
    const data = await apiFetch('/properties/cities');
    if (!data.success) return;

    container.innerHTML = data.cities.map(c => `
      <div class="city-card" onclick="window.location.href='/properties.html?city=${encodeURIComponent(c.city)}'">
        <div class="city-card-icon">🏙️</div>
        <h4 class="city-name">${c.city}</h4>
        <div class="city-count">${c.available_count} Available Properties</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load cities:', err);
  }
}
