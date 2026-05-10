/* ================================================================
   KITHTHA GRAND — Admin Dashboard
   js/pages/admin.js
================================================================ */

import { supabase }               from '../supabase.js';
import { router }                 from '../router.js';
import { showToast, initReveals } from '../app.js';

/* ── CSS ── */
const ADMIN_CSS = [
  '.admin-page{min-height:100vh;background:#0f0a06;display:flex}',
  '.admin-sidebar{width:260px;background:#1a0d04;border-right:1px solid rgba(200,144,10,.1);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100;transition:transform .3s ease}',
  '.admin-sidebar.collapsed{transform:translateX(-260px)}',
  '.sidebar-logo{padding:24px 20px;border-bottom:1px solid rgba(200,144,10,.1);display:flex;align-items:center;gap:12px}',
  '.sidebar-logo img{width:40px;height:40px;border-radius:50%;object-fit:contain;background:white;padding:3px}',
  '.sidebar-logo-text{display:flex;flex-direction:column}',
  '.sidebar-logo-name{font-family:var(--font-head);font-size:.9rem;color:var(--gold-light);line-height:1.2}',
  '.sidebar-logo-sub{font-family:var(--font-sub);font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(200,144,10,.5)}',
  '.sidebar-nav{flex:1;padding:16px 0;overflow-y:auto}',
  '.sidebar-section{padding:8px 20px 4px;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(200,144,10,.35)}',
  '.sidebar-link{display:flex;align-items:center;gap:12px;padding:11px 20px;color:rgba(240,224,192,.5);font-family:var(--font-sub);font-size:.78rem;letter-spacing:.05em;transition:all .2s;cursor:pointer;border:none;background:none;width:100%;text-align:left}',
  '.sidebar-link i{width:18px;text-align:center;font-size:.9rem}',
  '.sidebar-link:hover{color:var(--gold-light);background:rgba(200,144,10,.08)}',
  '.sidebar-link.active{color:var(--gold-light);background:rgba(200,144,10,.12);border-right:3px solid var(--gold)}',
  '.sidebar-link .badge-count{margin-left:auto;background:var(--red);color:white;font-size:.6rem;padding:2px 7px;border-radius:99px}',
  '.sidebar-bottom{padding:16px 20px;border-top:1px solid rgba(200,144,10,.1)}',
  '.sidebar-user{display:flex;align-items:center;gap:10px;padding:10px;background:rgba(200,144,10,.06);border-radius:12px;cursor:pointer}',
  '.sidebar-avatar{width:36px;height:36px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-size:.85rem;color:var(--gold-light);flex-shrink:0}',
  '.sidebar-user-info{flex:1;min-width:0}',
  '.sidebar-user-name{font-family:var(--font-sub);font-size:.75rem;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.sidebar-user-role{font-size:.62rem;color:rgba(200,144,10,.6);text-transform:uppercase;letter-spacing:.1em}',
  '.admin-main{flex:1;margin-left:260px;display:flex;flex-direction:column;min-height:100vh;transition:margin .3s ease}',
  '.admin-main.expanded{margin-left:0}',
  '.admin-topbar{background:#1a0d04;border-bottom:1px solid rgba(200,144,10,.1);padding:16px 32px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:50}',
  '.topbar-toggle{width:36px;height:36px;border-radius:8px;background:rgba(200,144,10,.08);border:1px solid rgba(200,144,10,.15);color:rgba(240,224,192,.6);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}',
  '.topbar-toggle:hover{color:var(--gold-light)}',
  '.topbar-title{font-family:var(--font-head);font-size:1.1rem;color:var(--gold-light);flex:1}',
  '.topbar-actions{display:flex;align-items:center;gap:12px}',
  '.topbar-btn{display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:8px;font-family:var(--font-sub);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;transition:.2s;cursor:pointer;border:none}',
  '.topbar-btn.primary{background:var(--red);color:white}',
  '.topbar-btn.primary:hover{background:var(--red-light)}',
  '.topbar-btn.ghost{background:rgba(200,144,10,.08);border:1px solid rgba(200,144,10,.2);color:rgba(240,224,192,.7)}',
  '.topbar-btn.ghost:hover{background:rgba(200,144,10,.15);color:var(--gold-light)}',
  '.admin-content{flex:1;padding:32px}',
  '.admin-section{display:none}',
  '.admin-section.active{display:block}',
  '.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:32px}',
  '.stat-card{background:#1a0d04;border:1px solid rgba(200,144,10,.12);border-radius:16px;padding:24px;position:relative;overflow:hidden;transition:.2s}',
  '.stat-card:hover{border-color:rgba(200,144,10,.25);transform:translateY(-2px)}',
  '.stat-card-glow{position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;opacity:.06;pointer-events:none}',
  '.stat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin-bottom:16px}',
  '.stat-icon.red{background:rgba(139,37,0,.2)}',
  '.stat-icon.gold{background:rgba(200,144,10,.15)}',
  '.stat-icon.green{background:rgba(42,92,63,.2)}',
  '.stat-icon.blue{background:rgba(59,130,246,.1)}',
  '.stat-num{font-family:var(--font-head);font-size:1.8rem;color:var(--cream);line-height:1;margin-bottom:6px}',
  '.stat-label{font-family:var(--font-sub);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,224,192,.4)}',
  '.stat-change{display:inline-flex;align-items:center;gap:4px;font-size:.7rem;margin-top:8px;padding:3px 8px;border-radius:99px}',
  '.stat-change.up{background:rgba(34,197,94,.1);color:#4ade80}',
  '.stat-change.down{background:rgba(239,68,68,.1);color:#f87171}',
  '.admin-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}',
  '.admin-card{background:#1a0d04;border:1px solid rgba(200,144,10,.12);border-radius:16px;padding:24px}',
  '.admin-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}',
  '.admin-card-title{font-family:var(--font-sub);font-size:.82rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:8px}',
  '.admin-card-action{font-family:var(--font-sub);font-size:.7rem;color:rgba(200,144,10,.6);cursor:pointer;transition:color .2s;background:none;border:none;padding:0}',
  '.admin-card-action:hover{color:var(--gold-light)}',
  '.order-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(200,144,10,.06)}',
  '.order-row:last-child{border-bottom:none}',
  '.order-row-num{font-family:var(--font-sub);font-size:.78rem;color:var(--cream);flex:1}',
  '.order-row-customer{font-size:.75rem;color:rgba(240,224,192,.5);flex:1}',
  '.order-row-amount{font-family:var(--font-head);font-size:.88rem;color:var(--gold-light);flex-shrink:0}',
  '.order-row-status{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:99px;flex-shrink:0}',
  '.order-row-status.pending{background:rgba(254,249,195,.1);color:#fef08a}',
  '.order-row-status.confirmed{background:rgba(59,130,246,.1);color:#93c5fd}',
  '.order-row-status.shipped{background:rgba(139,92,246,.1);color:#c4b5fd}',
  '.order-row-status.delivered{background:rgba(34,197,94,.1);color:#4ade80}',
  '.order-row-status.cancelled{background:rgba(239,68,68,.1);color:#f87171}',
  '.product-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(200,144,10,.06)}',
  '.product-row:last-child{border-bottom:none}',
  '.product-row-img{width:40px;height:40px;border-radius:8px;background:rgba(200,144,10,.08);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}',
  '.product-row-name{flex:1;font-size:.82rem;color:var(--cream)}',
  '.product-row-stock{font-family:var(--font-sub);font-size:.72rem;color:rgba(240,224,192,.5)}',
  '.product-row-price{font-family:var(--font-head);font-size:.85rem;color:var(--gold-light)}',
  '.stock-low{color:#f87171!important}',
  '.admin-table-wrap{overflow-x:auto}',
  '.admin-table{width:100%;border-collapse:collapse}',
  '.admin-table th{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(200,144,10,.5);padding:12px 16px;text-align:left;border-bottom:1px solid rgba(200,144,10,.1)}',
  '.admin-table td{padding:14px 16px;border-bottom:1px solid rgba(200,144,10,.06);font-size:.82rem;color:rgba(240,224,192,.8);vertical-align:middle}',
  '.admin-table tr:hover td{background:rgba(200,144,10,.03)}',
  '.admin-table tr:last-child td{border-bottom:none}',
  '.tbl-actions{display:flex;gap:8px}',
  '.tbl-btn{padding:5px 12px;border-radius:6px;font-family:var(--font-sub);font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
  '.tbl-btn.edit{background:rgba(200,144,10,.12);color:var(--gold-light)}',
  '.tbl-btn.edit:hover{background:rgba(200,144,10,.2)}',
  '.tbl-btn.del{background:rgba(139,37,0,.15);color:#f87171}',
  '.tbl-btn.del:hover{background:rgba(139,37,0,.25)}',
  '.tbl-btn.view{background:rgba(59,130,246,.1);color:#93c5fd}',
  '.tbl-btn.view:hover{background:rgba(59,130,246,.2)}',
  '.admin-search-bar{display:flex;align-items:center;gap:12px;margin-bottom:20px}',
  '.admin-search{flex:1;background:rgba(200,144,10,.06);border:1px solid rgba(200,144,10,.15);border-radius:10px;padding:10px 16px 10px 40px;color:var(--cream);font-family:var(--font-body);font-size:.88rem;outline:none;transition:.2s;position:relative}',
  '.admin-search:focus{border-color:var(--gold);background:rgba(200,144,10,.1)}',
  '.admin-search::placeholder{color:rgba(240,224,192,.25)}',
  '.search-wrap{position:relative;flex:1}',
  '.search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(200,144,10,.4);font-size:.85rem;pointer-events:none}',
  '.admin-filter{background:rgba(200,144,10,.06);border:1px solid rgba(200,144,10,.15);border-radius:10px;padding:10px 14px;color:rgba(240,224,192,.7);font-family:var(--font-sub);font-size:.75rem;cursor:pointer;outline:none}',
  '.admin-filter:focus{border-color:var(--gold)}',
  '.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}',
  '.modal-overlay.hidden{display:none}',
  '.modal{background:#1a0d04;border:1px solid rgba(200,144,10,.2);border-radius:20px;padding:32px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto}',
  '.modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}',
  '.modal-title{font-family:var(--font-head);font-size:1.1rem;color:var(--gold-light)}',
  '.modal-close{width:32px;height:32px;border-radius:8px;background:rgba(200,144,10,.08);color:rgba(240,224,192,.6);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:.2s}',
  '.modal-close:hover{color:var(--cream)}',
  '.mform-group{margin-bottom:16px}',
  '.mform-label{display:block;font-family:var(--font-sub);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(200,144,10,.6);margin-bottom:6px}',
  '.mform-input{width:100%;background:rgba(200,144,10,.06);border:1px solid rgba(200,144,10,.15);border-radius:10px;padding:11px 14px;color:var(--cream);font-family:var(--font-body);font-size:.88rem;outline:none;transition:.2s}',
  '.mform-input:focus{border-color:var(--gold);background:rgba(200,144,10,.1)}',
  '.mform-input::placeholder{color:rgba(240,224,192,.2)}',
  '.mform-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
  '.modal-actions{display:flex;gap:10px;margin-top:24px}',
  '.btn-modal-save{flex:1;padding:12px;background:var(--red);color:white;border-radius:10px;font-family:var(--font-sub);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
  '.btn-modal-save:hover{background:var(--red-light)}',
  '.btn-modal-cancel{padding:12px 20px;color:rgba(240,224,192,.5);font-family:var(--font-sub);font-size:.78rem;cursor:pointer;border:none;background:none;transition:color .2s}',
  '.btn-modal-cancel:hover{color:var(--cream)}',
  '.status-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}',
  '.status-dot.active{background:#4ade80}',
  '.status-dot.inactive{background:#f87171}',
  '.empty-admin{text-align:center;padding:60px 20px;color:rgba(240,224,192,.3);font-style:italic;font-size:.9rem}',
  '.loading-admin{text-align:center;padding:40px;color:rgba(200,144,10,.5);font-style:italic}',
  '@media(max-width:1024px){.stats-grid{grid-template-columns:repeat(2,1fr)}.admin-grid-2{grid-template-columns:1fr}}',
  '@media(max-width:768px){.admin-sidebar{transform:translateX(-260px)}.admin-sidebar.open{transform:translateX(0)}.admin-main{margin-left:0}.stats-grid{grid-template-columns:1fr 1fr}.admin-content{padding:20px}}',
].join('');

/* ── SIDEBAR CONFIG ── */
const NAV_ITEMS = [
  { section: 'Overview' },
  { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
  { section: 'Shop' },
  { id: 'orders',   icon: 'fas fa-shopping-bag',    label: 'Orders',   badge: true },
  { id: 'products', icon: 'fas fa-pepper-hot',       label: 'Products' },
  { id: 'categories',icon:'fas fa-tags',             label: 'Categories' },
  { id: 'coupons',  icon: 'fas fa-ticket-alt',       label: 'Coupons' },
  { section: 'Customers' },
  { id: 'customers',icon: 'fas fa-users',            label: 'Customers' },
  { id: 'reviews',  icon: 'fas fa-star',             label: 'Reviews' },
  { id: 'bulk',     icon: 'fas fa-industry',         label: 'Bulk Orders' },
  { section: 'System' },
  { id: 'settings', icon: 'fas fa-cog',              label: 'Settings' },
];

/* ── INIT ── */
export async function init(container) {
  /* Auth check */
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { router.go('login'); return; }

  const { data: profile } = await supabase
    .from('users').select('role,full_name,email').eq('id', user.id).single();

  if (!profile || profile.role !== 'admin') {
    showToast('Access denied. Admins only.', 'error');
    router.go('home');
    return;
  }

  /* CSS */
  if (!document.getElementById('admin-styles')) {
    const s = document.createElement('style');
    s.id = 'admin-styles';
    s.textContent = ADMIN_CSS;
    document.head.appendChild(s);
  }

  /* Render shell */
  container.innerHTML = '';
  container.appendChild(buildShell(profile));

  /* Load dashboard */
  switchSection(container, 'dashboard');
  bindSidebar(container);
  bindTopbar(container);
}

/* ── BUILD SHELL ── */
function buildShell(profile) {
  var initials = (profile.full_name || profile.email || 'A')
    .split(' ').map(function(w){ return w[0]; }).join('').toUpperCase().slice(0,2);

  /* Sidebar links */
  var navHTML = '';
  NAV_ITEMS.forEach(function(item) {
    if (item.section) {
      navHTML += '<p class="sidebar-section">' + item.section + '</p>';
    } else {
      navHTML += '<button class="sidebar-link" data-section="' + item.id + '">'
        + '<i class="' + item.icon + '"></i>'
        + '<span>' + item.label + '</span>'
        + (item.badge ? '<span class="badge-count" id="badge-' + item.id + '">0</span>' : '')
        + '</button>';
    }
  });

  var wrap = document.createElement('div');
  wrap.className = 'admin-page';
  wrap.innerHTML = `
  <aside class="admin-sidebar" id="admin-sidebar">
    <div class="sidebar-logo">
      <img src="images/logo.png" alt="Logo" onerror="this.style.display='none'" />
      <div class="sidebar-logo-text">
        <span class="sidebar-logo-name">Kiththa Grand</span>
        <span class="sidebar-logo-sub">Admin Panel</span>
      </div>
    </div>
    <nav class="sidebar-nav">${navHTML}</nav>
    <div class="sidebar-bottom">
      <div class="sidebar-user">
        <div class="sidebar-avatar">${initials}</div>
        <div class="sidebar-user-info">
          <p class="sidebar-user-name">${profile.full_name || profile.email}</p>
          <p class="sidebar-user-role">Administrator</p>
        </div>
        <i class="fas fa-sign-out-alt" style="color:rgba(240,224,192,.3);cursor:pointer;font-size:.85rem" id="admin-logout"></i>
      </div>
    </div>
  </aside>

  <main class="admin-main" id="admin-main">
    <div class="admin-topbar">
      <button class="topbar-toggle" id="sidebar-toggle">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="topbar-title" id="topbar-title">Dashboard</h1>
      <div class="topbar-actions">
        <button class="topbar-btn ghost" id="topbar-refresh">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
        <button class="topbar-btn primary" onclick="window.open('/', '_blank')">
          <i class="fas fa-external-link-alt"></i> View Site
        </button>
      </div>
    </div>
    <div class="admin-content" id="admin-content">

      <!-- DASHBOARD -->
      <div class="admin-section active" id="section-dashboard"></div>

      <!-- ORDERS -->
      <div class="admin-section" id="section-orders"></div>

      <!-- PRODUCTS -->
      <div class="admin-section" id="section-products"></div>

      <!-- CATEGORIES -->
      <div class="admin-section" id="section-categories"></div>

      <!-- COUPONS -->
      <div class="admin-section" id="section-coupons"></div>

      <!-- CUSTOMERS -->
      <div class="admin-section" id="section-customers"></div>

      <!-- REVIEWS -->
      <div class="admin-section" id="section-reviews"></div>

      <!-- BULK -->
      <div class="admin-section" id="section-bulk"></div>

      <!-- SETTINGS -->
      <div class="admin-section" id="section-settings"></div>

    </div>
  </main>

  <!-- Product Modal -->
  <div class="modal-overlay hidden" id="product-modal">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title" id="product-modal-title">Add Product</h2>
        <button class="modal-close" id="product-modal-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="mform-row">
        <div class="mform-group">
          <label class="mform-label">Product Name</label>
          <input type="text" id="pm-name" class="mform-input" placeholder="Ceylon Cinnamon" />
        </div>
        <div class="mform-group">
          <label class="mform-label">Sinhala Name</label>
          <input type="text" id="pm-name-si" class="mform-input" placeholder="කුරුඳු" />
        </div>
      </div>
      <div class="mform-group">
        <label class="mform-label">Description</label>
        <textarea id="pm-desc" class="mform-input" rows="3" placeholder="Product description..."></textarea>
      </div>
      <div class="mform-row">
        <div class="mform-group">
          <label class="mform-label">Price (LKR)</label>
          <input type="number" id="pm-price" class="mform-input" placeholder="1500" />
        </div>
        <div class="mform-group">
          <label class="mform-label">Weight (grams)</label>
          <input type="number" id="pm-weight" class="mform-input" placeholder="100" />
        </div>
      </div>
      <div class="mform-row">
        <div class="mform-group">
          <label class="mform-label">Stock</label>
          <input type="number" id="pm-stock" class="mform-input" placeholder="50" />
        </div>
        <div class="mform-group">
          <label class="mform-label">Category</label>
          <select id="pm-category" class="mform-input"></select>
        </div>
      </div>
      <div class="mform-row">
        <div class="mform-group">
          <label class="mform-label">Featured</label>
          <select id="pm-featured" class="mform-input">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div class="mform-group">
          <label class="mform-label">Active</label>
          <select id="pm-active" class="mform-input">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-modal-save" id="btn-save-product">Save Product</button>
        <button class="btn-modal-cancel" id="product-modal-cancel">Cancel</button>
      </div>
    </div>
  </div>
  `;

  return wrap;
}

/* ── SECTION SWITCH ── */
var currentSection = 'dashboard';

function switchSection(container, id) {
  currentSection = id;

  /* Active sidebar link */
  container.querySelectorAll('.sidebar-link').forEach(function(l) {
    l.classList.toggle('active', l.dataset.section === id);
  });

  /* Show section */
  container.querySelectorAll('.admin-section').forEach(function(s) {
    s.classList.remove('active');
  });
  var sec = container.querySelector('#section-' + id);
  if (sec) sec.classList.add('active');

  /* Title */
  var titles = {
    dashboard:  'Dashboard',
    orders:     'Orders',
    products:   'Products',
    categories: 'Categories',
    coupons:    'Coupons',
    customers:  'Customers',
    reviews:    'Reviews',
    bulk:       'Bulk Orders',
    settings:   'Settings',
  };
  var titleEl = container.querySelector('#topbar-title');
  if (titleEl) titleEl.textContent = titles[id] || id;

  /* Load content */
  if (id === 'dashboard')  loadDashboard(container);
  if (id === 'orders')     loadOrders(container);
  if (id === 'products')   loadProducts(container);
  if (id === 'customers')  loadCustomers(container);
  if (id === 'reviews')    loadReviews(container);
  if (id === 'bulk')       loadBulkOrders(container);
  if (id === 'categories') loadCategories(container);
  if (id === 'coupons')    loadCoupons(container);
  if (id === 'settings')   loadSettings(container);
}

/* ── BIND SIDEBAR ── */
function bindSidebar(container) {
  container.querySelectorAll('.sidebar-link').forEach(function(link) {
    link.addEventListener('click', function() {
      switchSection(container, link.dataset.section);
      /* Mobile close */
      var sb = container.querySelector('#admin-sidebar');
      if (window.innerWidth < 768 && sb) sb.classList.remove('open');
    });
  });

  var logoutBtn = container.querySelector('#admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      await supabase.auth.signOut();
      router.go('home');
    });
  }
}

/* ── BIND TOPBAR ── */
function bindTopbar(container) {
  var toggle = container.querySelector('#sidebar-toggle');
  var sb     = container.querySelector('#admin-sidebar');
  var main   = container.querySelector('#admin-main');

  if (toggle) {
    toggle.addEventListener('click', function() {
      if (window.innerWidth < 768) {
        sb.classList.toggle('open');
      } else {
        sb.classList.toggle('collapsed');
        main.classList.toggle('expanded');
      }
    });
  }

  var refreshBtn = container.querySelector('#topbar-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      switchSection(container, currentSection);
    });
  }
}

/* ── DASHBOARD ── */
async function loadDashboard(container) {
  var sec = container.querySelector('#section-dashboard');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading dashboard...</div>';

  var [ordersRes, usersRes, productsRes, revenueRes] = await Promise.all([
    supabase.from('orders').select('id, status, total, created_at').order('created_at', { ascending: false }),
    supabase.from('users').select('id, created_at').eq('role', 'customer'),
    supabase.from('products').select('id, name, stock, price_lkr, is_active'),
    supabase.from('orders').select('total').eq('payment_status', 'paid'),
  ]);

  var orders   = ordersRes.data   || [];
  var users    = usersRes.data    || [];
  var products = productsRes.data || [];
  var paid     = revenueRes.data  || [];

  var totalRevenue = paid.reduce(function(sum, o) { return sum + (parseFloat(o.total) || 0); }, 0);
  var pendingOrders = orders.filter(function(o) { return o.status === 'pending'; }).length;
  var lowStock = products.filter(function(p) { return p.stock < 10; }).length;

  /* Pending badge */
  var badge = container.querySelector('#badge-orders');
  if (badge) badge.textContent = pendingOrders || '';

  /* Recent orders for table */
  var recentOrders = orders.slice(0, 6);
  var recentHTML = '';
  recentOrders.forEach(function(o) {
    var dt = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    recentHTML += '<tr>'
      + '<td style="color:var(--gold-light);font-family:var(--font-sub);font-size:.78rem">' + o.id.slice(0,8) + '...</td>'
      + '<td>' + dt + '</td>'
      + '<td><span class="order-row-status ' + o.status + '">' + o.status + '</span></td>'
      + '<td style="font-family:var(--font-head);color:var(--gold-light)">Rs.' + parseFloat(o.total).toLocaleString() + '</td>'
      + '<td><button class="tbl-btn view" onclick="alert(\'Order detail page coming soon!\')"><i class="fas fa-eye"></i></button></td>'
      + '</tr>';
  });

  /* Low stock products */
  var lowHTML = '';
  products.filter(function(p){ return p.stock < 10; }).slice(0,5).forEach(function(p) {
    lowHTML += '<div class="product-row">'
      + '<div class="product-row-img">🌶️</div>'
      + '<div class="product-row-name">' + p.name + '</div>'
      + '<div class="product-row-stock stock-low">' + p.stock + ' left</div>'
      + '</div>';
  });
  if (!lowHTML) lowHTML = '<div class="empty-admin">All products are well stocked!</div>';

  sec.innerHTML = `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-card-glow" style="background:var(--gold)"></div>
      <div class="stat-icon gold"><i class="fas fa-coins"></i></div>
      <div class="stat-num">Rs.${totalRevenue.toLocaleString()}</div>
      <div class="stat-label">Total Revenue</div>
      <span class="stat-change up"><i class="fas fa-arrow-up"></i> This month</span>
    </div>
    <div class="stat-card">
      <div class="stat-card-glow" style="background:var(--red)"></div>
      <div class="stat-icon red"><i class="fas fa-shopping-bag"></i></div>
      <div class="stat-num">${orders.length}</div>
      <div class="stat-label">Total Orders</div>
      <span class="stat-change up"><i class="fas fa-arrow-up"></i> ${pendingOrders} pending</span>
    </div>
    <div class="stat-card">
      <div class="stat-card-glow" style="background:var(--green)"></div>
      <div class="stat-icon green"><i class="fas fa-users"></i></div>
      <div class="stat-num">${users.length}</div>
      <div class="stat-label">Customers</div>
      <span class="stat-change up"><i class="fas fa-arrow-up"></i> Growing</span>
    </div>
    <div class="stat-card">
      <div class="stat-card-glow" style="background:#3b82f6"></div>
      <div class="stat-icon blue"><i class="fas fa-pepper-hot"></i></div>
      <div class="stat-num">${products.length}</div>
      <div class="stat-label">Products</div>
      ${lowStock > 0 ? '<span class="stat-change down"><i class="fas fa-exclamation-triangle"></i> ' + lowStock + ' low stock</span>' : '<span class="stat-change up">All stocked</span>'}
    </div>
  </div>

  <div class="admin-grid-2">
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title"><i class="fas fa-shopping-bag"></i> Recent Orders</span>
        <button class="admin-card-action" data-section="orders">View all</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr>
            <th>Order ID</th><th>Date</th><th>Status</th><th>Amount</th><th></th>
          </tr></thead>
          <tbody>${recentHTML || '<tr><td colspan="5" class="empty-admin">No orders yet</td></tr>'}</tbody>
        </table>
      </div>
    </div>
    <div class="admin-card">
      <div class="admin-card-header">
        <span class="admin-card-title"><i class="fas fa-exclamation-triangle"></i> Low Stock Alert</span>
        <button class="admin-card-action" data-section="products">Manage</button>
      </div>
      ${lowHTML}
    </div>
  </div>
  `;

  /* Section switch from dashboard cards */
  sec.querySelectorAll('[data-section]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      switchSection(container, btn.dataset.section);
    });
  });
}

/* ── ORDERS ── */
async function loadOrders(container) {
  var sec = container.querySelector('#section-orders');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading orders...</div>';

  var { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  orders = orders || [];

  var rowsHTML = '';
  orders.forEach(function(o) {
    var dt = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    rowsHTML += '<tr>'
      + '<td style="font-family:var(--font-sub);font-size:.75rem;color:var(--gold-light)">' + (o.order_number || o.id.slice(0,8)) + '</td>'
      + '<td>' + (o.shipping_name || '--') + '</td>'
      + '<td>' + dt + '</td>'
      + '<td><span class="order-row-status ' + o.status + '">' + o.status + '</span></td>'
      + '<td><span class="order-row-status ' + o.payment_status + '" style="background:rgba(34,197,94,.1);color:#4ade80">' + (o.payment_status || '--') + '</span></td>'
      + '<td style="font-family:var(--font-head);color:var(--gold-light)">Rs.' + parseFloat(o.total || 0).toLocaleString() + '</td>'
      + '<td>'
      + '<div class="tbl-actions">'
      + '<button class="tbl-btn view" data-id="' + o.id + '"><i class="fas fa-eye"></i></button>'
      + '<select class="tbl-btn edit" style="padding:5px" data-order-id="' + o.id + '" data-order-status="' + o.status + '">'
      + '<option value="">Change</option>'
      + '<option value="confirmed">Confirmed</option>'
      + '<option value="packed">Packed</option>'
      + '<option value="shipped">Shipped</option>'
      + '<option value="delivered">Delivered</option>'
      + '<option value="cancelled">Cancelled</option>'
      + '</select>'
      + '</div>'
      + '</td>'
      + '</tr>';
  });

  sec.innerHTML = `
  <div class="admin-search-bar">
    <div class="search-wrap">
      <i class="fas fa-search search-icon"></i>
      <input type="text" class="admin-search" id="orders-search" placeholder="Search by order number or name..." />
    </div>
    <select class="admin-filter" id="orders-filter">
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>
  <div class="admin-card">
    <div class="admin-table-wrap">
      <table class="admin-table" id="orders-table">
        <thead><tr>
          <th>Order #</th><th>Customer</th><th>Date</th><th>Status</th><th>Payment</th><th>Total</th><th>Actions</th>
        </tr></thead>
        <tbody id="orders-tbody">${rowsHTML || '<tr><td colspan="7" class="empty-admin">No orders yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  `;

  /* Status change */
  sec.querySelectorAll('[data-order-id]').forEach(function(sel) {
    sel.addEventListener('change', async function() {
      var newStatus = sel.value;
      if (!newStatus) return;
      var res = await supabase.from('orders').update({ status: newStatus }).eq('id', sel.dataset.orderId);
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Order status updated!', 'success');
      loadOrders(container);
    });
  });
}

/* ── PRODUCTS ── */
async function loadProducts(container) {
  var sec = container.querySelector('#section-products');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading products...</div>';

  var [prodRes, catRes] = await Promise.all([
    supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name'),
  ]);

  var products   = prodRes.data || [];
  var categories = catRes.data  || [];

  /* Populate modal category select */
  var catSel = container.querySelector('#pm-category');
  if (catSel) {
    catSel.innerHTML = categories.map(function(c) {
      return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
  }

  var rowsHTML = '';
  products.forEach(function(p) {
    var stockClass = p.stock < 10 ? 'stock-low' : '';
    rowsHTML += '<tr>'
      + '<td>' + (p.images && p.images[0] ? '<img src="' + p.images[0] + '" style="width:36px;height:36px;border-radius:8px;object-fit:cover" />' : '<span style="font-size:1.4rem">🌶️</span>') + '</td>'
      + '<td style="color:var(--cream)">' + p.name + '</td>'
      + '<td style="color:rgba(240,224,192,.5);font-size:.75rem">' + (p.category ? p.category.name : '--') + '</td>'
      + '<td style="font-family:var(--font-head);color:var(--gold-light)">Rs.' + parseFloat(p.price_lkr).toLocaleString() + '</td>'
      + '<td class="' + stockClass + '">' + p.stock + '</td>'
      + '<td><span class="status-dot ' + (p.is_active ? 'active' : 'inactive') + '"></span>' + (p.is_active ? 'Active' : 'Inactive') + '</td>'
      + '<td><div class="tbl-actions">'
      + '<button class="tbl-btn edit" data-edit-product="' + p.id + '">Edit</button>'
      + '<button class="tbl-btn del" data-del-product="' + p.id + '">Delete</button>'
      + '</div></td>'
      + '</tr>';
  });

  sec.innerHTML = `
  <div class="admin-search-bar">
    <div class="search-wrap">
      <i class="fas fa-search search-icon"></i>
      <input type="text" class="admin-search" placeholder="Search products..." id="products-search" />
    </div>
    <button class="topbar-btn primary" id="btn-add-product">
      <i class="fas fa-plus"></i> Add Product
    </button>
  </div>
  <div class="admin-card">
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr>
          <th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="7" class="empty-admin">No products yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  `;

  /* Add product */
  var addBtn = sec.querySelector('#btn-add-product');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      openProductModal(container, null, categories);
    });
  }

  /* Edit */
  sec.querySelectorAll('[data-edit-product]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var p = products.find(function(x){ return x.id === btn.dataset.editProduct; });
      if (p) openProductModal(container, p, categories);
    });
  });

  /* Delete */
  sec.querySelectorAll('[data-del-product]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      if (!confirm('Delete this product?')) return;
      var res = await supabase.from('products').delete().eq('id', btn.dataset.delProduct);
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Product deleted!', 'success');
      loadProducts(container);
    });
  });
}

/* ── PRODUCT MODAL ── */
function openProductModal(container, product, categories) {
  var modal = container.querySelector('#product-modal');
  var title = container.querySelector('#product-modal-title');
  if (!modal) return;

  title.textContent = product ? 'Edit Product' : 'Add Product';
  container.querySelector('#pm-name').value     = product ? product.name        : '';
  container.querySelector('#pm-name-si').value  = product ? product.name_si     || '' : '';
  container.querySelector('#pm-desc').value     = product ? product.description || '' : '';
  container.querySelector('#pm-price').value    = product ? product.price_lkr   : '';
  container.querySelector('#pm-weight').value   = product ? product.weight_grams: '';
  container.querySelector('#pm-stock').value    = product ? product.stock       : '';
  container.querySelector('#pm-featured').value = product ? String(product.is_featured) : 'false';
  container.querySelector('#pm-active').value   = product ? String(product.is_active) : 'true';
  if (product && product.category_id) {
    container.querySelector('#pm-category').value = product.category_id;
  }

  modal.classList.remove('hidden');

  /* Close */
  var closeModal = function() { modal.classList.add('hidden'); };
  container.querySelector('#product-modal-close').onclick   = closeModal;
  container.querySelector('#product-modal-cancel').onclick  = closeModal;
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });

  /* Save */
  container.querySelector('#btn-save-product').onclick = async function() {
    var data = {
      name:          container.querySelector('#pm-name').value.trim(),
      name_si:       container.querySelector('#pm-name-si').value.trim() || null,
      description:   container.querySelector('#pm-desc').value.trim()    || null,
      price_lkr:     parseFloat(container.querySelector('#pm-price').value)  || 0,
      weight_grams:  parseInt(container.querySelector('#pm-weight').value)   || 0,
      stock:         parseInt(container.querySelector('#pm-stock').value)    || 0,
      category_id:   container.querySelector('#pm-category').value           || null,
      is_featured:   container.querySelector('#pm-featured').value === 'true',
      is_active:     container.querySelector('#pm-active').value   === 'true',
      updated_at:    new Date().toISOString(),
    };
    if (!data.name) { showToast('Product name required', 'error'); return; }

    var res;
    if (product) {
      res = await supabase.from('products').update(data).eq('id', product.id);
    } else {
      res = await supabase.from('products').insert(data);
    }
    if (res.error) { showToast(res.error.message, 'error'); return; }
    showToast(product ? 'Product updated!' : 'Product added!', 'success');
    closeModal();
    loadProducts(container);
  };
}

/* ── CUSTOMERS ── */
async function loadCustomers(container) {
  var sec = container.querySelector('#section-customers');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading customers...</div>';

  var { data: customers } = await supabase
    .from('users').select('*').eq('role', 'customer').order('created_at', { ascending: false });

  customers = customers || [];

  var rowsHTML = '';
  customers.forEach(function(u) {
    var dt = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    rowsHTML += '<tr>'
      + '<td style="color:var(--cream)">' + (u.full_name || '--') + '</td>'
      + '<td style="color:rgba(240,224,192,.6);font-size:.78rem">' + u.email + '</td>'
      + '<td style="color:rgba(240,224,192,.5)">' + (u.phone || '--') + '</td>'
      + '<td style="font-family:var(--font-head);color:var(--gold-light)">' + (u.loyalty_points || 0) + ' pts</td>'
      + '<td>' + (u.total_orders || 0) + '</td>'
      + '<td>' + dt + '</td>'
      + '<td><span class="status-dot ' + (u.is_active ? 'active' : 'inactive') + '"></span>' + (u.is_active ? 'Active' : 'Inactive') + '</td>'
      + '</tr>';
  });

  sec.innerHTML = `
  <div class="admin-search-bar">
    <div class="search-wrap">
      <i class="fas fa-search search-icon"></i>
      <input type="text" class="admin-search" placeholder="Search customers..." />
    </div>
  </div>
  <div class="admin-card">
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr>
          <th>Name</th><th>Email</th><th>Phone</th><th>Points</th><th>Orders</th><th>Joined</th><th>Status</th>
        </tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="7" class="empty-admin">No customers yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  `;
}

/* ── REVIEWS ── */
async function loadReviews(container) {
  var sec = container.querySelector('#section-reviews');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading reviews...</div>';

  var { data: reviews } = await supabase
    .from('reviews')
    .select('*, product:products(name), user:users(full_name, email)')
    .order('created_at', { ascending: false });

  reviews = reviews || [];

  var rowsHTML = '';
  reviews.forEach(function(r) {
    var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    var dt = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    rowsHTML += '<tr>'
      + '<td style="color:var(--cream)">' + (r.user ? r.user.full_name || r.user.email : '--') + '</td>'
      + '<td style="color:rgba(200,144,10,.8);font-size:.75rem">' + (r.product ? r.product.name : '--') + '</td>'
      + '<td style="color:var(--gold-light);letter-spacing:.1em">' + stars + '</td>'
      + '<td style="color:rgba(240,224,192,.6);font-size:.78rem;max-width:200px">' + (r.comment || '--') + '</td>'
      + '<td>' + dt + '</td>'
      + '<td><span class="status-dot ' + (r.is_approved ? 'active' : 'inactive') + '"></span>' + (r.is_approved ? 'Approved' : 'Pending') + '</td>'
      + '<td><div class="tbl-actions">'
      + (!r.is_approved ? '<button class="tbl-btn edit" data-approve="' + r.id + '">Approve</button>' : '')
      + '<button class="tbl-btn del" data-del-review="' + r.id + '">Delete</button>'
      + '</div></td>'
      + '</tr>';
  });

  sec.innerHTML = `
  <div class="admin-card">
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr>
          <th>Customer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Date</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="7" class="empty-admin">No reviews yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  `;

  sec.querySelectorAll('[data-approve]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      await supabase.from('reviews').update({ is_approved: true }).eq('id', btn.dataset.approve);
      showToast('Review approved!', 'success');
      loadReviews(container);
    });
  });

  sec.querySelectorAll('[data-del-review]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      if (!confirm('Delete this review?')) return;
      await supabase.from('reviews').delete().eq('id', btn.dataset.delReview);
      showToast('Review deleted!', 'success');
      loadReviews(container);
    });
  });
}

/* ── BULK ORDERS ── */
async function loadBulkOrders(container) {
  var sec = container.querySelector('#section-bulk');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading bulk orders...</div>';

  var { data: bulks } = await supabase
    .from('bulk_orders').select('*').order('created_at', { ascending: false });

  bulks = bulks || [];

  var rowsHTML = '';
  bulks.forEach(function(b) {
    var dt = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    rowsHTML += '<tr>'
      + '<td style="color:var(--cream)">' + b.name + '</td>'
      + '<td style="color:rgba(240,224,192,.6);font-size:.78rem">' + b.email + '</td>'
      + '<td>' + (b.company || '--') + '</td>'
      + '<td>' + (b.country || '--') + '</td>'
      + '<td>' + (b.quantity_kg ? b.quantity_kg + ' kg' : '--') + '</td>'
      + '<td><span class="order-row-status ' + b.status + '">' + b.status + '</span></td>'
      + '<td>' + dt + '</td>'
      + '<td>'
      + '<select class="tbl-btn edit" style="padding:5px" data-bulk-id="' + b.id + '">'
      + '<option value="">Update</option>'
      + '<option value="contacted">Contacted</option>'
      + '<option value="quoted">Quoted</option>'
      + '<option value="confirmed">Confirmed</option>'
      + '<option value="cancelled">Cancelled</option>'
      + '</select>'
      + '</td>'
      + '</tr>';
  });

  sec.innerHTML = `
  <div class="admin-card">
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr>
          <th>Name</th><th>Email</th><th>Company</th><th>Country</th><th>Quantity</th><th>Status</th><th>Date</th><th>Action</th>
        </tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="8" class="empty-admin">No bulk orders yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  `;

  sec.querySelectorAll('[data-bulk-id]').forEach(function(sel) {
    sel.addEventListener('change', async function() {
      if (!sel.value) return;
      await supabase.from('bulk_orders').update({ status: sel.value }).eq('id', sel.dataset.bulkId);
      showToast('Status updated!', 'success');
      loadBulkOrders(container);
    });
  });
}

/* ── CATEGORIES ── */
async function loadCategories(container) {
  var sec = container.querySelector('#section-categories');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading categories...</div>';

  var { data: cats } = await supabase.from('categories').select('*').order('sort_order');
  cats = cats || [];

  var rowsHTML = '';
  cats.forEach(function(c) {
    rowsHTML += '<tr>'
      + '<td style="color:var(--cream)">' + c.name + '</td>'
      + '<td style="color:rgba(240,224,192,.5)">' + (c.name_si || '--') + '</td>'
      + '<td style="font-family:var(--font-sub);font-size:.72rem;color:var(--gold)">' + c.slug + '</td>'
      + '<td>' + c.sort_order + '</td>'
      + '<td><span class="status-dot ' + (c.is_active ? 'active' : 'inactive') + '"></span>' + (c.is_active ? 'Active' : 'Inactive') + '</td>'
      + '</tr>';
  });

  sec.innerHTML = `
  <div class="admin-card">
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr>
          <th>Name</th><th>Sinhala</th><th>Slug</th><th>Order</th><th>Status</th>
        </tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="5" class="empty-admin">No categories</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  `;
}

/* ── COUPONS ── */
async function loadCoupons(container) {
  var sec = container.querySelector('#section-coupons');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading coupons...</div>';

  var { data: coupons } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  coupons = coupons || [];

  var rowsHTML = '';
  coupons.forEach(function(c) {
    var exp = c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'No expiry';
    rowsHTML += '<tr>'
      + '<td style="font-family:var(--font-sub);color:var(--gold-light);letter-spacing:.1em">' + c.code + '</td>'
      + '<td>' + c.type + '</td>'
      + '<td style="color:var(--cream)">' + (c.type === 'percent' ? c.discount_value + '%' : 'Rs.' + c.discount_value) + '</td>'
      + '<td>' + (c.min_order ? 'Rs.' + c.min_order : '--') + '</td>'
      + '<td>' + (c.used_count || 0) + ' / ' + (c.max_uses || 'unlimited') + '</td>'
      + '<td>' + exp + '</td>'
      + '<td><span class="status-dot ' + (c.is_active ? 'active' : 'inactive') + '"></span>' + (c.is_active ? 'Active' : 'Inactive') + '</td>'
      + '</tr>';
  });

  sec.innerHTML = `
  <div class="admin-card">
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr>
          <th>Code</th><th>Type</th><th>Discount</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th>
        </tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="7" class="empty-admin">No coupons yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  `;
}

/* ── SETTINGS ── */
async function loadSettings(container) {
  var sec = container.querySelector('#section-settings');
  if (!sec) return;
  sec.innerHTML = '<div class="loading-admin">Loading settings...</div>';

  var { data: settings } = await supabase.from('settings').select('*');
  settings = settings || [];

  var fieldsHTML = '';
  settings.forEach(function(s) {
    fieldsHTML += '<div class="mform-group">'
      + '<label class="mform-label">' + s.key.replace(/_/g, ' ').toUpperCase() + '</label>'
      + '<input type="text" class="mform-input setting-input" data-key="' + s.key + '" value="' + s.value + '" />'
      + '</div>';
  });

  sec.innerHTML = `
  <div class="admin-card">
    <div class="admin-card-header">
      <span class="admin-card-title"><i class="fas fa-cog"></i> Shop Settings</span>
    </div>
    <div class="mform-row" style="grid-template-columns:1fr 1fr">${fieldsHTML}</div>
    <div style="margin-top:16px">
      <button class="btn-modal-save" id="btn-save-settings" style="max-width:200px">
        <i class="fas fa-check"></i> Save Settings
      </button>
    </div>
  </div>
  `;

  var saveBtn = sec.querySelector('#btn-save-settings');
  if (saveBtn) {
    saveBtn.addEventListener('click', async function() {
      var inputs = sec.querySelectorAll('.setting-input');
      var promises = [];
      inputs.forEach(function(inp) {
        promises.push(
          supabase.from('settings').update({ value: inp.value }).eq('key', inp.dataset.key)
        );
      });
      await Promise.all(promises);
      showToast('Settings saved! ✅', 'success');
    });
  }
}

export default init;