/* ================================================================
   KITHTHA GRAND — Main App
   app.js
================================================================ */

import { supabase } from './supabase.js';
import { router }   from './router.js';

// OAuth redirect hash clean කරන්න
if (location.hash && location.hash.includes('access_token')) {
  history.replaceState(null, '', location.pathname);
}
if (location.hash && location.hash.includes('error=')) {
  history.replaceState(null, '', location.pathname);
}

/* ────────────────────────────────────────────────────────────────
   STATE
──────────────────────────────────────────────────────────────── */
const state = {
  user:      null,
  cart:      [],
  wishlist:  [],
  currency:  localStorage.getItem('kg_currency') || 'LKR',
  sound:     localStorage.getItem('kg_sound') !== 'off',
  rates:     { LKR: 1, USD: 0.0033, EUR: 0.003, GBP: 0.0026 }
};

/* ────────────────────────────────────────────────────────────────
   LOADING SCREEN
──────────────────────────────────────────────────────────────── */
function hideLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  screen.classList.add('fade-out');
  document.body.classList.remove('loading');
  setTimeout(() => screen.remove(), 900);
}

// Show loading until page + Supabase ready
document.body.classList.add('loading');
window.addEventListener('load', () => {
  setTimeout(hideLoading, 2200); // min 2.2s for brand feel
});

/* ────────────────────────────────────────────────────────────────
   CUSTOM CURSOR
──────────────────────────────────────────────────────────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');

if (window.matchMedia('(pointer:fine)').matches) {
  let trailX = 0, trailY = 0;
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    // Trail follows with lag
    trailX += (e.clientX - trailX) * 0.12;
    trailY += (e.clientY - trailY) * 0.12;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';
  });
  // Smooth trail loop
  function animateTrail() {
    requestAnimationFrame(animateTrail);
  }
  animateTrail();
}

/* ────────────────────────────────────────────────────────────────
   NAVBAR — scroll effect + hamburger
──────────────────────────────────────────────────────────────── */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

/* ────────────────────────────────────────────────────────────────
   ROUTING — All [data-page] clicks
──────────────────────────────────────────────────────────────── */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-page]');
  if (!el) return;
  e.preventDefault();
  const page = el.dataset.page;

  // Close mobile menu
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');

  // Navigate
  router.go(page);

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
});

/* ────────────────────────────────────────────────────────────────
   SCROLL REVEAL
──────────────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

function observeReveals() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    revealObserver.observe(el);
  });
}
observeReveals();

// Re-run after page changes
export function initReveals() { observeReveals(); }

/* ────────────────────────────────────────────────────────────────
   CURRENCY
──────────────────────────────────────────────────────────────── */
const currencySelect = document.getElementById('currency-select');
currencySelect.value = state.currency;

currencySelect.addEventListener('change', (e) => {
  state.currency = e.target.value;
  localStorage.setItem('kg_currency', state.currency);
  // Re-render prices across page
  document.dispatchEvent(new CustomEvent('currencyChange', { detail: state.currency }));
});

export function formatPrice(lkrPrice) {
  const rate = state.rates[state.currency];
  const converted = (lkrPrice * rate).toFixed(2);
  const symbols = { LKR: 'Rs.', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[state.currency]}${converted}`;
}

/* ────────────────────────────────────────────────────────────────
   SOUND
──────────────────────────────────────────────────────────────── */
const soundBtn = document.getElementById('sound-toggle');
const sounds = {
  click: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...'), // placeholder
};

soundBtn.addEventListener('click', () => {
  state.sound = !state.sound;
  localStorage.setItem('kg_sound', state.sound ? 'on' : 'off');
  soundBtn.querySelector('i').className = state.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  showToast(state.sound ? 'Sounds on 🔊' : 'Sounds off 🔇');
});

export function playSound(name) {
  if (!state.sound) return;
  // sounds[name]?.play().catch(()=>{});
}

/* ────────────────────────────────────────────────────────────────
   TOAST NOTIFICATIONS
──────────────────────────────────────────────────────────────── */
const toastContainer = document.getElementById('toast-container');

export function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { info: 'ℹ️', success: '✅', error: '❌' };
  toast.innerHTML = `<span>${icons[type] || '🌶️'}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fadeout');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ────────────────────────────────────────────────────────────────
   AUTH STATE
──────────────────────────────────────────────────────────────── */
const authBtn = document.getElementById('auth-btn');

supabase.auth.onAuthStateChange(async (event, session) => {
// Auth UI update function
async function updateAuthUI(user) {
  if (user) {
    authBtn.innerHTML = '<i class="fas fa-user-check"></i><span>Account</span>';
    authBtn.dataset.page = 'profile';
    await loadCart();
    await loadWishlist();
  } else {
    authBtn.innerHTML = '<i class="fas fa-user"></i><span>Sign In</span>';
    authBtn.dataset.page = 'login';
    updateCartBadge(0);
    updateWishlistBadge(0);
  }
}

// Session change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  state.user = session?.user || null;
  await updateAuthUI(state.user);
});

// Page load වෙද්දී session check — OAuth redirect fix
supabase.auth.getSession().then(async ({ data: { session } }) => {
  if (session?.user) {
    state.user = session.user;
    await updateAuthUI(state.user);
  }
});
});


/* ────────────────────────────────────────────────────────────────
   CART
──────────────────────────────────────────────────────────────── */
export async function loadCart() {
  if (!state.user) return;
  const { data } = await supabase
    .from('cart')
    .select('*, product:products(*)')
    .eq('user_id', state.user.id);
  state.cart = data || [];
  updateCartBadge(state.cart.length);
}

export async function addToCart(productId) {
  if (!state.user) {
    showToast('Please sign in to add to cart', 'error');
    router.go('login');
    return;
  }
  const { error } = await supabase.from('cart').upsert({
    user_id: state.user.id,
    product_id: productId,
    quantity: 1
  }, { onConflict: 'user_id,product_id' });

  if (!error) {
    await loadCart();
    showToast('Added to cart! 🛒', 'success');
    playSound('click');
    // Badge pulse
    const badge = document.getElementById('cart-count');
    badge.classList.remove('pulse');
    void badge.offsetWidth;
    badge.classList.add('pulse');
  }
}

function updateCartBadge(count) {
  const el = document.getElementById('cart-count');
  el.textContent = count > 0 ? count : '';
}

/* ────────────────────────────────────────────────────────────────
   WISHLIST
──────────────────────────────────────────────────────────────── */
export async function loadWishlist() {
  if (!state.user) return;
  const { data } = await supabase
    .from('saved_items')
    .select('product_id')
    .eq('user_id', state.user.id);
  state.wishlist = (data || []).map(d => d.product_id);
  updateWishlistBadge(state.wishlist.length);
}

export async function toggleWishlist(productId) {
  if (!state.user) {
    showToast('Please sign in to save items', 'error');
    return;
  }
  const isWished = state.wishlist.includes(productId);
  if (isWished) {
    await supabase.from('saved_items').delete()
      .eq('user_id', state.user.id).eq('product_id', productId);
    showToast('Removed from wishlist', 'info');
  } else {
    await supabase.from('saved_items').insert({
      user_id: state.user.id, product_id: productId
    });
    showToast('Saved to wishlist ❤️', 'success');
  }
  await loadWishlist();
}

function updateWishlistBadge(count) {
  const el = document.getElementById('wishlist-count');
  el.textContent = count > 0 ? count : '';
}

/* ────────────────────────────────────────────────────────────────
   FEATURED PRODUCTS (Home page)
──────────────────────────────────────────────────────────────── */
export async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-products');
  if (!grid) return;

  const { data: products, error } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(8);

  if (error || !products?.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--brown-light);font-style:italic;">
        🌶️ Products coming soon...
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img">
        ${p.images?.[0]
          ? `<img src="${p.images[0]}" alt="${p.name}" loading="lazy" />`
          : `<span style="font-size:4rem">🌶️</span>`
        }
        ${p.is_featured ? `<span class="product-badge">Featured</span>` : ''}
        <button class="product-wish" data-wish="${p.id}" aria-label="Wishlist">
          <i class="${state.wishlist.includes(p.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <p class="product-cat">${p.category?.name || 'Spices'}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-weight">${p.weight_grams}g · ${p.origin || 'Sri Lanka'}</p>
        <div class="product-footer">
          <span class="product-price" data-lkr="${p.price_lkr}">${formatPrice(p.price_lkr)}</span>
          <button class="product-add" data-add="${p.id}" aria-label="Add to cart">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Events
  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.add);
    });
  });
  grid.querySelectorAll('[data-wish]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(btn.dataset.wish);
    });
  });
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      router.go('product', { id: card.dataset.id });
    });
  });

  // Re-observe reveals
  initReveals();
}

// Update prices when currency changes
document.addEventListener('currencyChange', () => {
  document.querySelectorAll('[data-lkr]').forEach(el => {
    el.textContent = formatPrice(parseFloat(el.dataset.lkr));
  });
});

/* ────────────────────────────────────────────────────────────────
   CONFETTI (for order success)
──────────────────────────────────────────────────────────────── */
export function launchConfetti() {
  const colors = ['#8B2500','#C8900A','#F0B429','#2A5C3F','#FDF3E3'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      animation-delay: ${Math.random() * 1.5}s;
      animation-duration: ${2 + Math.random() * 2}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

/* ────────────────────────────────────────────────────────────────
   INIT
──────────────────────────────────────────────────────────────── */
// Load featured products when home page visible
const homeObserver = new MutationObserver(() => {
  const homePage = document.getElementById('page-home');
  if (homePage?.classList.contains('active')) {
    loadFeaturedProducts();
  }
});
homeObserver.observe(document.getElementById('app'), { childList: false, attributes: true, subtree: true });

// Initial load
loadFeaturedProducts();

// Export state for other modules
export { state };
// Expose globally
window.router = router;
