/* ================================================================
   KITHTHA GRAND — SPA Router  (History API)
   js/router.js

   URL structure:
     /              → home
     /products      → products grid
     /product/UUID  → product detail
     /about         → about
     /cart          → cart
     /login         → login
     … etc.
================================================================ */

/* ── Clean OAuth error params from URL ── */
if (location.search && location.search.includes('error=')) {
  history.replaceState(null, '', location.pathname);
}

/* ── Page registry ── */
const pages = {
  'home':        () => import('./pages/home.js').catch(()=>({})),
  'products':    () => import('./pages/products.js').catch(()=>({})),
  'product':     () => import('./pages/product.js').catch(()=>({})),
  'cart':        () => import('./pages/cart.js').catch(()=>({})),
  'checkout':    () => import('./pages/checkout.js').catch(()=>({})),
  'success':     () => import('./pages/success.js').catch(()=>({})),
  'profile':     () => import('./pages/profile.js').catch(()=>({})),
  'settings':    () => import('./pages/settings.js').catch(()=>({})),
  'wishlist':    () => import('./pages/wishlist.js').catch(()=>({})),
  'orders':      () => import('./pages/orders.js').catch(()=>({})),
  'bulk-orders': () => import('./pages/bulk-orders.js').catch(()=>({})),
  'about':       () => import('./pages/about.js').catch(()=>({})),
  'contact':     () => import('./pages/contact.js').catch(()=>({})),
  'login':       () => import('./pages/login.js').catch(()=>({})),
  'admin':       () => import('./pages/admin.js').catch(()=>({})),
};

/* ── Parse a pathname into { page, params } ── */
function parsePath(pathname) {
  var parts  = pathname.replace(/^\//, '').split('/').filter(Boolean);
  var page   = parts[0] || 'home';
  var params = {};
  if (!pages[page]) page = 'home';
  if (parts[1])     params.id = decodeURIComponent(parts[1]);
  return { page: page, params: params };
}

/* ── Build a clean URL from page + params ── */
function buildUrl(page, params) {
  var url = (page === 'home') ? '/' : '/' + page;
  if (params && params.id) url += '/' + encodeURIComponent(params.id);
  return url;
}

/* ── Router ── */
export const router = {
  currentPage: 'home',
  params: {},

  /* Navigate to a page (pushes history entry) */
  async go(page, params) {
    params = params || {};
    if (!pages[page]) { console.warn('[Router] Unknown page:', page); return; }
    this.currentPage = page;
    this.params      = params;
    history.pushState({ page: page, params: params }, '', buildUrl(page, params));
    await this._render(page, params);
  },

  /* Render without pushing a new history entry (used by popstate) */
  async _render(page, params) {
    params = params || {};

    /* Navbar visibility */
    var navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.style.display = (page === 'login' || page === 'admin') ? 'none' : '';
    }

    /* Fade out current page */
    var current = document.querySelector('.page.active');
    if (current) {
      current.style.opacity    = '0';
      current.style.transform  = 'translateY(8px)';
      current.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    }
    await new Promise(function(r) { setTimeout(r, current ? 180 : 0); });

    document.querySelectorAll('.page').forEach(function(p) {
      p.classList.remove('active');
      p.style.opacity   = '';
      p.style.transform = '';
      p.style.transition = '';
    });

    /* Show target page */
    var target = document.getElementById('page-' + page);
    if (!target) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    target.classList.add('active');

    /* Load and run page module */
    try {
      var mod = await pages[page]();
      if (typeof mod.init    === 'function') await mod.init(target, params);
      if (typeof mod.default === 'function') await mod.default(target, params);
    } catch (err) {
      console.error('[Router] Page load error:', err);
      if (!target.innerHTML.trim()) {
        target.innerHTML = ''
          + '<div style="min-height:100vh;display:flex;flex-direction:column;'
          + 'align-items:center;justify-content:center;gap:20px;padding:40px;'
          + 'font-family:var(--font-sub);color:var(--brown-light);text-align:center">'
          + '<span style="font-size:4rem">🌶️</span>'
          + '<h2 style="font-family:var(--font-head);font-size:1.5rem;color:var(--brown)">Coming Soon</h2>'
          + '<p style="font-style:italic">The <strong>' + page + '</strong> page is being crafted with love.</p>'
          + '<button data-page="home" style="margin-top:16px;padding:12px 28px;'
          + 'background:var(--red);color:white;border-radius:99px;'
          + 'font-family:var(--font-sub);font-size:.82rem;letter-spacing:.1em;'
          + 'text-transform:uppercase;cursor:pointer;border:none">'
          + '← Back to Home</button>'
          + '</div>';
        target.querySelector('[data-page]').addEventListener('click', function() {
          router.go('home');
        });
      }
    }

    /* Page title */
    var titles = {
      'home':        'Kiththa Grand — Pure Ceylon Spices',
      'products':    'Shop — Kiththa Grand',
      'product':     'Product — Kiththa Grand',
      'cart':        'Cart — Kiththa Grand',
      'checkout':    'Checkout — Kiththa Grand',
      'profile':     'My Account — Kiththa Grand',
      'login':       'Sign In — Kiththa Grand',
      'about':       'Our Story — Kiththa Grand',
      'contact':     'Contact — Kiththa Grand',
      'bulk-orders': 'Bulk Orders — Kiththa Grand',
      'wishlist':    'Wishlist — Kiththa Grand',
      'orders':      'Orders — Kiththa Grand',
    };
    document.title = titles[page] || 'Kiththa Grand';

    /* Active nav link highlight */
    document.querySelectorAll('.nav-link').forEach(function(l) {
      l.classList.toggle('active', l.dataset.page === page);
    });

    /* Fire event */
    document.dispatchEvent(new CustomEvent('pageChange', { detail: { page: page, params: params } }));
  }
};

/* ── Browser back / forward ── */
window.addEventListener('popstate', function(e) {
  var state = e.state;
  if (state && state.page) {
    router.currentPage = state.page;
    router.params      = state.params || {};
    router._render(state.page, state.params || {});
  } else {
    var parsed = parsePath(location.pathname);
    router._render(parsed.page, parsed.params);
  }
});

/* ── Initial route on page load ── */
(function initRoute() {
  /* GitHub Pages 404 trick: check sessionStorage for saved path */
  var storedPath = sessionStorage.getItem('kg_redirect');
  if (storedPath) {
    sessionStorage.removeItem('kg_redirect');
    var parsed = parsePath(storedPath);
    history.replaceState(
      { page: parsed.page, params: parsed.params },
      '',
      storedPath
    );
    /* Wait for app.js to finish auth check before rendering */
    setTimeout(function() { router.go(parsed.page, parsed.params); }, 2400);
    return;
  }

  /* Normal load — read page from current pathname */
  var parsed = parsePath(location.pathname);
  history.replaceState(
    { page: parsed.page, params: parsed.params },
    '',
    location.pathname
  );
  if (parsed.page !== 'home') {
    setTimeout(function() { router.go(parsed.page, parsed.params); }, 2400);
  }
})();

/* ── Global access ── */
window.router = router;
