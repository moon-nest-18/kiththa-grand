/* ================================================================
   KITHTHA GRAND — SPA Router
   router.js
================================================================ */
// URL error params clean කරන්න
if (location.hash && location.hash.includes('error=')) {
  history.replaceState(null, '', location.pathname);
}
if (location.search && location.search.includes('error=')) {
  history.replaceState(null, '', location.pathname);
}
/* ────────────────────────────────────────────────────────────────
   Page registry — add new pages here as you build them
──────────────────────────────────────────────────────────────── */
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

let currentPage = 'home';

/* ────────────────────────────────────────────────────────────────
   Router
──────────────────────────────────────────────────────────────── */
export const router = {
  currentPage,
  params: {},

  async go(page, params = {}) {
    // Validate
    // Navbar hide/show
const navbar = document.getElementById('navbar');

    document.getElementById('navbar').style.display = (page === 'login' || page === 'admin') ? 'none' : '';
    if (!pages[page]) { console.warn(`[Router] Unknown page: ${page}`); return; }

    this.currentPage = page;
    this.params = params;

    // Hide all pages
    // Fade out current page
const current = document.querySelector('.page.active');
if (current) {
  current.style.opacity = '0';
  current.style.transform = 'translateY(8px)';
  current.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
}
await new Promise(r => setTimeout(r, current ? 180 : 0));
document.querySelectorAll('.page').forEach(p => {
  p.classList.remove('active');
  p.style.opacity = '';
  p.style.transform = '';
  p.style.transition = '';
});

    // Show target page
    const target = document.getElementById(`page-${page}`);
    if (!target) return;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show the page
    target.classList.add('active');

    // Load page module if available
    try {
      const mod = await pages[page]();
      if (typeof mod.init === 'function') {
        await mod.init(target, params);
      }
      if (typeof mod.default === 'function') {
        await mod.default(target, params);
      }
    } catch (err) {
  console.error('[Router] Page error:', err); // ← ADD THIS
      if (!target.innerHTML.trim()) {
        target.innerHTML = `
          <div style="
            min-height:100vh;
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            gap:20px; padding:40px;
            font-family:'Cinzel', serif;
            color:var(--brown-light);
            text-align:center;
          ">
            <span style="font-size:4rem">🌶️</span>
            <h2 style="font-family:'Cinzel Decorative',serif;font-size:1.5rem;color:var(--brown);">
              Coming Soon
            </h2>
            <p style="font-style:italic;color:var(--brown-light);">
              The <strong>${page}</strong> page is being crafted with love.
            </p>
            <button
              data-page="home"
              style="
                margin-top:16px;padding:12px 28px;
                background:var(--red);color:white;
                border-radius:99px;font-family:'Cinzel',serif;
                font-size:0.82rem;letter-spacing:0.1em;
                text-transform:uppercase;cursor:pointer;
              "
            >← Back to Home</button>
          </div>
        `;
      }
    }

    // Update document title
    const titles = {
      'home':        'Kiththa Grand — Pure Ceylon Spices',
      'products':    'Shop — Kiththa Grand',
      'cart':        'Cart — Kiththa Grand',
      'checkout':    'Checkout — Kiththa Grand',
      'profile':     'My Account — Kiththa Grand',
      'login':       'Sign In — Kiththa Grand',
      'about':       'Our Story — Kiththa Grand',
      'contact':     'Contact — Kiththa Grand',
      'bulk-orders': 'Bulk Orders — Kiththa Grand',
    };
    document.title = titles[page] || 'Kiththa Grand';

    // Fire event for other modules
    document.dispatchEvent(new CustomEvent('pageChange', { detail: { page, params } }));
  }
};

// Handle browser back/forward (hash-based)
window.addEventListener('hashchange', () => {
  const page = location.hash.replace('#', '') || 'home';
  router.go(page);
});

// Initial route from hash
const initialPage = location.hash.replace('#', '') || 'home';
if (initialPage !== 'home') {
  setTimeout(() => router.go(initialPage), 2500);
}
// Global access — console + other scripts වලට
window.router = router;
// Global access
window.supabase = supabase;