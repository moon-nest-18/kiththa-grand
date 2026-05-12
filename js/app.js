/* ================================================================
   KITHTHA GRAND — Main App
   js/app.js
================================================================ */

import { supabase } from './supabase.js';
import { router }   from './router.js';

/* ────────────────────────────────────────────────────────────────
   STATE
──────────────────────────────────────────────────────────────── */
const state = {
  user:     null,
  cart:     [],
  wishlist: [],
  currency: localStorage.getItem('kg_currency') || 'LKR',
  sound:    localStorage.getItem('kg_sound') !== 'off',
  rates:    { LKR: 1, USD: 0.0033, EUR: 0.003, GBP: 0.0026 }
};

/* ────────────────────────────────────────────────────────────────
   LOADING SCREEN
──────────────────────────────────────────────────────────────── */
function hideLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  screen.classList.add('fade-out');
  document.body.classList.remove('loading');
  setTimeout(function() { screen.remove(); }, 900);
}

document.body.classList.add('loading');
window.addEventListener('load', function() {
  setTimeout(hideLoading, 800);
});

/* ────────────────────────────────────────────────────────────────
   CUSTOM CURSOR
──────────────────────────────────────────────────────────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');

if (window.matchMedia('(pointer:fine)').matches && cursor && cursorTrail) {
  document.addEventListener('mousemove', function(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    cursorTrail.style.left = e.clientX + 'px';
    cursorTrail.style.top  = e.clientY + 'px';
  });
}

/* ────────────────────────────────────────────────────────────────
   NAVBAR
──────────────────────────────────────────────────────────────── */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', function() {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

if (hamburger) {
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    if (mobileMenu) mobileMenu.classList.toggle('open');
  });
}

/* ────────────────────────────────────────────────────────────────
   ROUTING
──────────────────────────────────────────────────────────────── */
document.addEventListener('click', function(e) {
  const el = e.target.closest('[data-page]');
  if (!el) return;
  e.preventDefault();
  const page = el.dataset.page;
  if (hamburger) hamburger.classList.remove('open');
  if (mobileMenu) mobileMenu.classList.remove('open');
  var navParams = {};
  if (el.dataset.cat) navParams.cat = el.dataset.cat;
  router.go(page, navParams);
});

/* ────────────────────────────────────────────────────────────────
   SCROLL REVEAL
──────────────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

function observeReveals() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(function(el) {
    revealObserver.observe(el);
  });
}
observeReveals();

export function initReveals() { observeReveals(); }

/* ────────────────────────────────────────────────────────────────
   CURRENCY
──────────────────────────────────────────────────────────────── */
const currencySelect = document.getElementById('currency-select');
const mobileCurrencySel = document.getElementById('mobile-currency-select');
if (currencySelect) currencySelect.value = state.currency;
if (mobileCurrencySel) mobileCurrencySel.value = state.currency;

function onCurrencyChange(val) {
  state.currency = val;
  localStorage.setItem('kg_currency', val);
  if (currencySelect) currencySelect.value = val;
  if (mobileCurrencySel) mobileCurrencySel.value = val;
  document.dispatchEvent(new CustomEvent('currencyChange', { detail: val }));
}
if (currencySelect) currencySelect.addEventListener('change', function(e) { onCurrencyChange(e.target.value); });
if (mobileCurrencySel) mobileCurrencySel.addEventListener('change', function(e) { onCurrencyChange(e.target.value); });

export function formatPrice(lkrPrice) {
  const rate    = state.rates[state.currency] || 1;
  const converted = (parseFloat(lkrPrice) * rate).toFixed(2);
  const symbols = { LKR: 'Rs.', USD: '$', EUR: 'EUR ', GBP: 'GBP ' };
  return (symbols[state.currency] || 'Rs.') + parseFloat(converted).toLocaleString();
}

/* ────────────────────────────────────────────────────────────────
   BACKGROUND MUSIC
──────────────────────────────────────────────────────────────── */

const soundBtn        = document.getElementById('sound-toggle');
const bgMusic         = document.getElementById('bg-music');
const musicNowPlaying = document.getElementById('music-now-playing');
const mpPlayer        = document.getElementById('music-player');
const mpDisc          = document.getElementById('mp-disc');
const mpPlayBtn       = document.getElementById('mp-playbtn');
const mpMuteBtn       = document.getElementById('mp-mutebtn');
const mpBar           = document.getElementById('mp-bar');
const mpBarFill       = document.getElementById('mp-bar-fill');
const mpCurTime       = document.getElementById('mp-cur-time');
const mpDurTime       = document.getElementById('mp-dur-time');
const mpClose         = document.getElementById('mp-close');
var musicStarted = false;

if (bgMusic) bgMusic.volume = 0.3;

function fmtTime(sec) {
  if (!sec || !isFinite(sec)) return '--:--';
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function showMusicPill(show) {
  if (!musicNowPlaying) return;
  musicNowPlaying.classList.toggle('visible', show);
  musicNowPlaying.classList.toggle('player-open', show && mpPlayer && mpPlayer.classList.contains('visible'));
}

function showMusicPlayer(show) {
  if (!mpPlayer) return;
  mpPlayer.style.display = show ? 'flex' : 'none';
  /* pill hide when full player is visible — player shows song info already */
  if (musicNowPlaying) musicNowPlaying.style.display = show ? 'none' : '';
  /* push page content above player bar */
  var barH = window.innerWidth <= 600 ? '60px' : '68px';
  document.body.style.paddingBottom = show ? barH : '';
}

function syncPlayerUI() {
  if (!bgMusic) return;
  var playing = !bgMusic.paused;
  if (mpPlayBtn) mpPlayBtn.querySelector('i').className = playing ? 'fas fa-pause' : 'fas fa-play';
  if (mpDisc)    mpDisc.classList.toggle('spinning', playing);
  if (mpMuteBtn) mpMuteBtn.querySelector('i').className = state.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

if (bgMusic) {
  bgMusic.addEventListener('timeupdate', function() {
    if (!bgMusic.duration) return;
    var pct = (bgMusic.currentTime / bgMusic.duration) * 100;
    if (mpBarFill) mpBarFill.style.width = pct + '%';
    if (mpCurTime) mpCurTime.textContent = fmtTime(bgMusic.currentTime);
    if (mpDurTime) mpDurTime.textContent = fmtTime(bgMusic.duration);
  });
  bgMusic.addEventListener('play',  syncPlayerUI);
  bgMusic.addEventListener('pause', syncPlayerUI);
}

if (mpPlayBtn) {
  mpPlayBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!bgMusic) return;
    if (bgMusic.paused) {
      bgMusic.play().then(function() { musicStarted = true; syncPlayerUI(); }).catch(function(){});
    } else {
      bgMusic.pause();
    }
  });
}

if (mpBar) {
  mpBar.addEventListener('click', function(e) {
    if (!bgMusic || !bgMusic.duration) return;
    var rect = mpBar.getBoundingClientRect();
    bgMusic.currentTime = ((e.clientX - rect.left) / rect.width) * bgMusic.duration;
  });
}

if (mpMuteBtn) {
  mpMuteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    state.sound = !state.sound;
    localStorage.setItem('kg_sound', state.sound ? 'on' : 'off');
    syncSoundIcon();
    syncPlayerUI();
    if (bgMusic) {
      if (state.sound) {
        bgMusic.play().then(function() { musicStarted = true; }).catch(function(){});
      } else {
        bgMusic.pause();
      }
    }
  });
}

if (mpClose) {
  mpClose.addEventListener('click', function(e) {
    e.stopPropagation();
    if (bgMusic) bgMusic.pause();
    showMusicPlayer(false);
    showMusicPill(false);
  });
}

/* Update icon based on current state */
function syncSoundIcon() {
  if (!soundBtn) return;
  soundBtn.querySelector('i').className = state.sound
    ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

/* Try to play music (must be called after a user gesture) */
function tryPlayMusic() {
  if (!bgMusic || !state.sound || musicStarted) return;
  bgMusic.play().then(function() {
    musicStarted = true;
    showMusicPill(true);
    showMusicPlayer(true);
    syncPlayerUI();
  }).catch(function() {});
}

/* Start on first interaction — keep listener until music actually starts */
document.addEventListener('click', function() {
  if (!musicStarted && state.sound) tryPlayMusic();
});

/* Sound toggle button */
if (soundBtn) {
  syncSoundIcon();
  soundBtn.addEventListener('click', function() {
    state.sound = !state.sound;
    localStorage.setItem('kg_sound', state.sound ? 'on' : 'off');
    syncSoundIcon();
    if (bgMusic) {
      if (state.sound) {
        bgMusic.play().then(function() {
          musicStarted = true;
          showMusicPill(true);
          showMusicPlayer(true);
          syncPlayerUI();
        }).catch(function() {});
      } else {
        bgMusic.pause();
        showMusicPill(false);
        showMusicPlayer(false);
      }
    }
    showToast(state.sound ? 'Music on' : 'Music off');
  });
}

export function playSound(name) {}

/* ────────────────────────────────────────────────────────────────
   TOAST
──────────────────────────────────────────────────────────────── */
const toastContainer = document.getElementById('toast-container');

export function showToast(message, type, duration) {
  if (!toastContainer) return;
  if (!type)     type     = 'info';
  if (!duration) duration = 3000;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icons = { info: 'ℹ️', success: '✅', error: '❌' };
  toast.innerHTML = '<span>' + (icons[type] || '🌶️') + '</span><span>' + message + '</span>';
  toastContainer.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('fadeout');
    setTimeout(function() { toast.remove(); }, 400);
  }, duration);
}

/* ────────────────────────────────────────────────────────────────
   AUTH
──────────────────────────────────────────────────────────────── */
const authBtn = document.getElementById('auth-btn');

function updateAuthUI(user) {
  if (!authBtn) return;
  var mobAuthBtn = document.getElementById('mob-auth-btn');
  if (user) {
    authBtn.innerHTML = '<i class="fas fa-user-check"></i><span>Account</span>';
    authBtn.dataset.page = 'profile';
    if (mobAuthBtn) { mobAuthBtn.innerHTML = '<i class="fas fa-user-check"></i> Account'; mobAuthBtn.dataset.page = 'profile'; }
    state.user = user;
    loadCart();
    loadWishlist();
  } else {
    authBtn.innerHTML = '<i class="fas fa-user"></i><span>Sign In</span>';
    authBtn.dataset.page = 'login';
    if (mobAuthBtn) { mobAuthBtn.innerHTML = '<i class="fas fa-user"></i> Sign In'; mobAuthBtn.dataset.page = 'login'; }
    state.user = null;
    updateCartBadge(0);
    updateWishlistBadge(0);
  }
  // Admin link show/hide
const adminLink = document.getElementById('admin-nav-link');
if (adminLink) {
  supabase.from('users').select('role').eq('id', user.id).single()
    .then(function({ data }) {
      adminLink.style.display = data && data.role === 'admin' ? 'block' : 'none';
    });
}
}

/* Page load වෙද්දී existing session check */
(async function() {
  try {
    const { data } = await supabase.auth.getSession();
    if (data && data.session && data.session.user) {
      console.log('[Auth] Session found:', data.session.user.email);
      updateAuthUI(data.session.user);
    } else {
      console.log('[Auth] No session');
      updateAuthUI(null);
    }
  } catch (err) {
    console.error('[Auth] getSession error:', err);
  }
})();

/* Auth state change listener */
supabase.auth.onAuthStateChange(function(event, session) {
  console.log('[Auth] Event:', event, session ? session.user.email : 'no user');
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
    updateAuthUI(session ? session.user : null);
    /* Login page නම් home redirect */
    const loginPage = document.getElementById('page-login');
    if (loginPage && loginPage.classList.contains('active')) {
      showToast('Welcome back! 🌶️', 'success');
      setTimeout(function() { router.go('home'); }, 600);
    }
  }
  if (event === 'SIGNED_OUT') {
    updateAuthUI(null);
  }
});

/* ────────────────────────────────────────────────────────────────
   CART
──────────────────────────────────────────────────────────────── */
export async function loadCart() {
  if (!state.user) return;
  var { data: items } = await supabase
    .from('cart')
    .select('id, product_id, quantity, user_id')
    .eq('user_id', state.user.id);
  if (!items || !items.length) { state.cart = []; updateCartBadge(0); return; }
  var ids = items.map(function(c) { return c.product_id; });
  var { data: prods } = await supabase.from('products').select('*').in('id', ids);
  var map = {};
  (prods || []).forEach(function(p) { map[p.id] = p; });
  state.cart = items.map(function(c) {
    return { id: c.id, user_id: c.user_id, product_id: c.product_id, quantity: c.quantity, product: map[c.product_id] || null };
  });
  updateCartBadge(state.cart.length);
}

export async function addToCart(productId) {
  if (!state.user) {
    showToast('Please sign in to add to cart', 'error');
    router.go('login');
    return;
  }
  var existing = state.cart.find(function(c) { return c.product_id === productId; });
  var newQty   = existing ? (existing.quantity + 1) : 1;
  const { error } = await supabase.from('cart').upsert({
    user_id:    state.user.id,
    product_id: productId,
    quantity:   newQty
  }, { onConflict: 'user_id,product_id' });
  if (!error) {
    await loadCart();
    showToast('Added to cart!', 'success');
    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.classList.remove('pulse');
      void badge.offsetWidth;
      badge.classList.add('pulse');
    }
  }
}

export async function removeFromCart(productId) {
  if (!state.user) return;
  await supabase.from('cart').delete()
    .eq('user_id', state.user.id)
    .eq('product_id', productId);
  await loadCart();
}

export async function setCartQuantity(productId, qty) {
  if (!state.user) return;
  if (qty <= 0) { await removeFromCart(productId); return; }
  await supabase.from('cart').upsert({
    user_id:    state.user.id,
    product_id: productId,
    quantity:   qty
  }, { onConflict: 'user_id,product_id' });
  await loadCart();
}

function updateCartBadge(count) {
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count > 0 ? count : '';
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
  state.wishlist = (data || []).map(function(d) { return d.product_id; });
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
  if (el) el.textContent = count > 0 ? count : '';
}

/* ── CATEGORIES ── */
const CAT_EMOJIS  = {
  'whole-spices':  '🌶️',
  'ground-spices': '🟡',
  'spice-blends':  '🫙',
  'gift-sets':     '🎁',
};
const CAT_COLORS = {
  'whole-spices':  'linear-gradient(160deg,#4a0e00 0%,#8B2500 100%)',
  'ground-spices': 'linear-gradient(160deg,#3D1C02 0%,#7A3010 100%)',
  'spice-blends':  'linear-gradient(160deg,#1a2a1a 0%,#2A5C3F 100%)',
  'gift-sets':     'linear-gradient(160deg,#1a1a2e 0%,#2a1a5e 100%)',
};
const CAT_SUBS = {
  'whole-spices':  'Hand-picked',
  'ground-spices': 'Stone-ground',
  'spice-blends':  'Secret recipes',
  'gift-sets':     'Handcrafted',
};

export async function loadCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;

  const { data: cats, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !cats || !cats.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--brown-light);font-style:italic;">Categories coming soon...</div>';
    return;
  }

  grid.innerHTML = cats.map(function(cat, i) {
    var emoji  = CAT_EMOJIS[cat.slug]  || '🌿';
    var color  = CAT_COLORS[cat.slug]  || 'linear-gradient(160deg,var(--brown) 0%,var(--red-dark) 100%)';
    var sub    = CAT_SUBS[cat.slug]    || 'Pure Ceylon';
    var delay  = (i * 0.1).toFixed(1) + 's';
    var imgHTML = cat.image_url
      ? '<img src="' + cat.image_url + '" alt="' + cat.name + '" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0" />'
      : '';

    return '<div class="cat-card reveal" style="--delay:' + delay + '" data-page="products" data-cat="' + cat.slug + '">'
      + '<div class="cat-bg-img" style="background:' + color + '"></div>'
      + imgHTML
      + '<div class="cat-pattern"></div>'
      + '<div class="cat-ring"></div>'
      + (cat.image_url ? '' : '<div class="cat-emoji">' + emoji + '</div>')
      + '<div class="cat-gradient"></div>'
      + '<div class="cat-content">'
      + '<h3 class="cat-name">' + cat.name + '</h3>'
      + '<p class="cat-name-si">' + (cat.name_si || '') + '</p>'
      + '<div class="cat-footer">'
      + '<span class="cat-count">' + sub + '</span>'
      + '<span class="cat-arrow-btn"><i class="fas fa-arrow-right"></i></span>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  observeReveals();
}
/* ────────────────────────────────────────────────────────────────
   FEATURED PRODUCTS
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

  if (error || !products || !products.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--brown-light);font-style:italic;">🌶️ Products coming soon...</div>';
    return;
  }

  grid.innerHTML = products.map(function(p) {
    var imgHTML = p.images && p.images[0]
      ? '<img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy" />'
      : '<span style="font-size:4rem">🌶️</span>';
    var wished = state.wishlist.includes(p.id);
    return '<div class="product-card" data-id="' + p.id + '">'
      + '<div class="product-img">'
      + imgHTML
      + (p.is_featured ? '<span class="product-badge">Featured</span>' : '')
      + '<button class="product-wish" data-wish="' + p.id + '" aria-label="Wishlist">'
      + '<i class="' + (wished ? 'fas' : 'far') + ' fa-heart"></i>'
      + '</button>'
      + '</div>'
      + '<div class="product-info">'
      + '<p class="product-cat">' + (p.category ? p.category.name : 'Spices') + '</p>'
      + '<h3 class="product-name">' + p.name + '</h3>'
      + '<p class="product-weight">' + p.weight_grams + 'g &middot; ' + (p.origin || 'Sri Lanka') + '</p>'
      + '<div class="product-footer">'
      + '<span class="product-price" data-lkr="' + p.price_lkr + '">' + formatPrice(p.price_lkr) + '</span>'
      + '<button class="product-add" data-add="' + p.id + '" aria-label="Add to cart">'
      + '<i class="fas fa-plus"></i>'
      + '</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  grid.querySelectorAll('[data-add]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      addToCart(btn.dataset.add);
    });
  });
  grid.querySelectorAll('[data-wish]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleWishlist(btn.dataset.wish);
    });
  });
  grid.querySelectorAll('.product-card').forEach(function(card) {
    card.addEventListener('click', function() {
      router.go('product', { id: card.dataset.id });
    });
  });

  observeReveals();
}

document.addEventListener('currencyChange', function() {
  document.querySelectorAll('[data-lkr]').forEach(function(el) {
    el.textContent = formatPrice(parseFloat(el.dataset.lkr));
  });
});

/* ────────────────────────────────────────────────────────────────
   CONFETTI
──────────────────────────────────────────────────────────────── */
export function launchConfetti() {
  const colors = ['#8B2500','#C8900A','#F0B429','#2A5C3F','#FDF3E3'];
  for (var i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = 'left:' + (Math.random() * 100) + 'vw;'
      + 'background:' + colors[Math.floor(Math.random() * colors.length)] + ';'
      + 'width:' + (6 + Math.random() * 8) + 'px;'
      + 'height:' + (6 + Math.random() * 8) + 'px;'
      + 'animation-delay:' + (Math.random() * 1.5) + 's;'
      + 'animation-duration:' + (2 + Math.random() * 2) + 's;'
      + 'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';';
    document.body.appendChild(piece);
    setTimeout(function() { piece.remove(); }, 4000);
  }
}

/* ────────────────────────────────────────────────────────────────
   INIT
──────────────────────────────────────────────────────────────── */
/* Home page products */
const appObserver = new MutationObserver(function() {
  const homePage = document.getElementById('page-home');
  if (homePage && homePage.classList.contains('active')) {
    loadFeaturedProducts();
  }
});
appObserver.observe(document.getElementById('app'), {
  childList: false, attributes: true, subtree: true
});
// Initial load

loadCategories();   // ← add
loadFeaturedProducts();

/* Global exports */
export { state };