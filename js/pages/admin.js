/* ================================================================
   KITHTHA GRAND — Admin Dashboard v2
   js/pages/admin.js
   Features: Categories CRUD + Image Upload + Product Variants + Better UI
================================================================ */

import { supabase }               from '../supabase.js';
import { router }                 from '../router.js';
import { showToast, initReveals } from '../app.js';

function escapeHtmlAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── CSS ── */
const ADMIN_CSS = [
  '.admin-page{min-height:100vh;background:#1c1008;display:flex;font-family:"Inter",system-ui,-apple-system,sans-serif}',
  '.admin-sidebar{width:260px;background:#241408;border-right:1px solid rgba(200,144,10,.15);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100;transition:transform .3s}',
  '.admin-sidebar.collapsed{transform:translateX(-260px)}',
  '.sidebar-logo{padding:20px;border-bottom:1px solid rgba(200,144,10,.12);display:flex;align-items:center;gap:12px}',
  '.sidebar-logo img{width:42px;height:42px;border-radius:50%;object-fit:contain;background:white;padding:3px}',
  '.sidebar-logo-name{font-family:var(--font-head);font-size:.88rem;color:var(--gold-light);line-height:1.2}',
  '.sidebar-logo-sub{font-family:var(--font-sub);font-size:.55rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(200,144,10,.45)}',
  '.sidebar-nav{flex:1;padding:12px 0;overflow-y:auto}',
  '.sidebar-section{padding:10px 20px 4px;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(200,144,10,.3)}',
  '.sidebar-link{display:flex;align-items:center;gap:12px;padding:10px 20px;color:rgba(240,224,192,.55);font-family:var(--font-sub);font-size:.78rem;letter-spacing:.04em;cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:all .2s;border-left:3px solid transparent}',
  '.sidebar-link i{width:16px;text-align:center;font-size:.88rem}',
  '.sidebar-link:hover{color:rgba(240,224,192,.9);background:rgba(200,144,10,.07)}',
  '.sidebar-link.active{color:var(--gold-light);background:rgba(200,144,10,.1);border-left-color:var(--gold)}',
  '.sidebar-link .badge-count{margin-left:auto;background:var(--red);color:white;font-size:.58rem;padding:2px 7px;border-radius:99px;font-family:var(--font-sub)}',
  '.sidebar-bottom{padding:16px;border-top:1px solid rgba(200,144,10,.1)}',
  '.sidebar-user{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(200,144,10,.07);border-radius:12px;border:1px solid rgba(200,144,10,.1)}',
  '.sidebar-avatar{width:36px;height:36px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-size:.85rem;color:var(--gold-light);flex-shrink:0}',
  '.sidebar-user-name{font-family:var(--font-sub);font-size:.74rem;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.sidebar-user-role{font-size:.6rem;color:rgba(200,144,10,.55);text-transform:uppercase;letter-spacing:.1em}',
  '.admin-logout-btn{margin-left:auto;color:rgba(240,224,192,.3);cursor:pointer;font-size:.85rem;transition:color .2s;background:none;border:none}',
  '.admin-logout-btn:hover{color:#f87171}',
  '.admin-main{flex:1;margin-left:260px;display:flex;flex-direction:column;min-height:100vh;transition:margin .3s}',
  '.admin-main.expanded{margin-left:0}',
  '.admin-topbar{background:#241408;border-bottom:1px solid rgba(200,144,10,.12);padding:14px 28px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:50}',
  '.topbar-toggle{width:34px;height:34px;border-radius:8px;background:rgba(200,144,10,.08);border:1px solid rgba(200,144,10,.15);color:rgba(240,224,192,.6);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;flex-shrink:0}',
  '.topbar-toggle:hover{color:var(--gold-light);background:rgba(200,144,10,.14)}',
  '.topbar-title{font-family:var(--font-head);font-size:1.05rem;color:var(--gold-light);flex:1}',
  '.topbar-actions{display:flex;align-items:center;gap:10px}',
  '.a-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:8px;font-family:var(--font-sub);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
  '.a-btn.primary{background:var(--red);color:white}',
  '.a-btn.primary:hover{background:var(--red-light)}',
  '.a-btn.gold{background:linear-gradient(135deg,var(--gold),var(--gold-light));color:var(--brown);font-weight:600}',
  '.a-btn.ghost{background:rgba(200,144,10,.08);border:1px solid rgba(200,144,10,.2);color:rgba(240,224,192,.75)}',
  '.a-btn.ghost:hover{background:rgba(200,144,10,.15);color:var(--gold-light)}',
  '.a-btn.danger{background:rgba(139,37,0,.2);color:#f87171;border:1px solid rgba(139,37,0,.2)}',
  '.a-btn.danger:hover{background:rgba(139,37,0,.3)}',
  '.a-btn:disabled{opacity:.5;cursor:not-allowed}',
  '.admin-content{flex:1;padding:28px}',
  '.admin-section{display:none}',
  '.admin-section.active{display:block}',

  /* Stats */
  '.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:28px}',
  '.stat-card{background:#2a1a08;border:1px solid rgba(200,144,10,.14);border-radius:16px;padding:22px;position:relative;overflow:hidden;transition:.2s}',
  '.stat-card:hover{border-color:rgba(200,144,10,.28);transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.3)}',
  '.stat-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:14px}',
  '.stat-icon.red{background:rgba(139,37,0,.25);color:#fca5a5}',
  '.stat-icon.gold{background:rgba(200,144,10,.18);color:var(--gold-light)}',
  '.stat-icon.green{background:rgba(42,92,63,.3);color:#86efac}',
  '.stat-icon.blue{background:rgba(59,130,246,.15);color:#93c5fd}',
  '.stat-num{font-family:var(--font-head);font-size:1.7rem;color:var(--cream);line-height:1;margin-bottom:5px}',
  '.stat-label{font-family:var(--font-sub);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,224,192,.4)}',
  '.stat-change{display:inline-flex;align-items:center;gap:4px;font-size:.68rem;margin-top:8px;padding:3px 8px;border-radius:99px;font-family:var(--font-sub)}',
  '.stat-change.up{background:rgba(34,197,94,.12);color:#4ade80}',
  '.stat-change.warn{background:rgba(251,191,36,.12);color:#fbbf24}',

  /* Cards */
  '.a-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-bottom:22px}',
  '.a-card{background:#2a1a08;border:1px solid rgba(200,144,10,.13);border-radius:16px;padding:22px;margin-bottom:22px}',
  '.a-card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}',
  '.a-card-title{font-family:var(--font-sub);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:8px}',

  /* Table */
  '.a-table-wrap{overflow-x:auto}',
  '.a-table{width:100%;border-collapse:collapse}',
  '.a-table th{font-family:var(--font-sub);font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(200,144,10,.45);padding:11px 14px;text-align:left;border-bottom:1px solid rgba(200,144,10,.1)}',
  '.a-table td{padding:13px 14px;border-bottom:1px solid rgba(200,144,10,.06);font-size:.82rem;color:rgba(240,224,192,.82);vertical-align:middle}',
  '.a-table tr:hover td{background:rgba(200,144,10,.04)}',
  '.a-table tr:last-child td{border-bottom:none}',
  '.tbl-actions{display:flex;gap:6px;flex-wrap:wrap}',
  '.tbl-btn{padding:5px 11px;border-radius:6px;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
  '.tbl-btn.edit{background:rgba(200,144,10,.14);color:var(--gold-light)}',
  '.tbl-btn.edit:hover{background:rgba(200,144,10,.25)}',
  '.tbl-btn.del{background:rgba(139,37,0,.18);color:#f87171}',
  '.tbl-btn.del:hover{background:rgba(139,37,0,.3)}',
  '.tbl-btn.view{background:rgba(59,130,246,.12);color:#93c5fd}',
  '.tbl-btn.approve{background:rgba(34,197,94,.12);color:#4ade80}',

  /* Search */
  '.a-search-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}',
  '.a-search-wrap{position:relative;flex:1;min-width:200px}',
  '.a-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:rgba(200,144,10,.4);font-size:.82rem;pointer-events:none}',
  '.a-search{width:100%;background:rgba(200,144,10,.07);border:1px solid rgba(200,144,10,.15);border-radius:9px;padding:9px 14px 9px 36px;color:var(--cream);font-family:var(--font-body);font-size:.86rem;outline:none;transition:.2s}',
  '.a-search:focus{border-color:var(--gold);background:rgba(200,144,10,.11)}',
  '.a-search::placeholder{color:rgba(240,224,192,.22)}',
  '.a-select{background:rgba(200,144,10,.07);border:1px solid rgba(200,144,10,.15);border-radius:9px;padding:9px 12px;color:rgba(240,224,192,.8);font-family:var(--font-sub);font-size:.74rem;cursor:pointer;outline:none}',

  /* Status badges */
  '.s-badge{display:inline-flex;align-items:center;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;padding:3px 10px;border-radius:99px}',
  '.s-badge.pending{background:rgba(251,191,36,.12);color:#fbbf24}',
  '.s-badge.confirmed{background:rgba(59,130,246,.12);color:#93c5fd}',
  '.s-badge.shipped{background:rgba(139,92,246,.12);color:#c4b5fd}',
  '.s-badge.delivered{background:rgba(34,197,94,.12);color:#4ade80}',
  '.s-badge.cancelled{background:rgba(239,68,68,.12);color:#f87171}',
  '.s-badge.paid{background:rgba(34,197,94,.12);color:#4ade80}',
  '.s-badge.active{background:rgba(34,197,94,.12);color:#4ade80}',
  '.s-badge.inactive{background:rgba(239,68,68,.12);color:#f87171}',
  '.s-badge.new{background:rgba(251,191,36,.12);color:#fbbf24}',
  '.s-badge.contacted{background:rgba(59,130,246,.12);color:#93c5fd}',
  '.s-dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px}',
  '.s-dot.green{background:#4ade80}',
  '.s-dot.red{background:#f87171}',

  /* Modal */
  '.m-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}',
  '.m-overlay.hidden{display:none}',
  '.m-box{background:#2a1a08;border:1px solid rgba(200,144,10,.2);border-radius:20px;padding:28px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto}',
  '.m-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}',
  '.m-title{font-family:var(--font-head);font-size:1.05rem;color:var(--gold-light)}',
  '.m-close{width:30px;height:30px;border-radius:8px;background:rgba(200,144,10,.08);color:rgba(240,224,192,.5);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:.2s}',
  '.m-close:hover{color:var(--cream)}',
  '.m-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
  '.m-group{margin-bottom:14px}',
  '.m-label{display:block;font-family:var(--font-sub);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(200,144,10,.55);margin-bottom:5px}',
  '.m-input{width:100%;background:rgba(200,144,10,.07);border:1px solid rgba(200,144,10,.15);border-radius:9px;padding:10px 13px;color:var(--cream);font-family:var(--font-body);font-size:.86rem;outline:none;transition:.2s}',
  '.m-input:focus{border-color:var(--gold);background:rgba(200,144,10,.12)}',
  '.m-input::placeholder{color:rgba(240,224,192,.18)}',
  '.m-actions{display:flex;gap:10px;margin-top:20px}',
  '.m-save{flex:1;padding:11px;background:var(--red);color:white;border-radius:9px;font-family:var(--font-sub);font-size:.76rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
  '.m-save:hover{background:var(--red-light)}',
  '.m-save:disabled{opacity:.5;cursor:not-allowed}',
  '.m-cancel{padding:11px 18px;color:rgba(240,224,192,.45);font-family:var(--font-sub);font-size:.76rem;cursor:pointer;border:none;background:none;transition:color .2s}',
  '.m-cancel:hover{color:var(--cream)}',

  /* Image upload */
  '.img-upload-zone{border:2px dashed rgba(200,144,10,.25);border-radius:12px;padding:28px;text-align:center;cursor:pointer;transition:.2s;position:relative;background:rgba(200,144,10,.04)}',
  '.img-upload-zone:hover{border-color:rgba(200,144,10,.5);background:rgba(200,144,10,.08)}',
  '.img-upload-zone.dragover{border-color:var(--gold);background:rgba(200,144,10,.12)}',
  '.img-upload-icon{font-size:2rem;margin-bottom:10px;opacity:.5}',
  '.img-upload-text{font-size:.82rem;color:rgba(240,224,192,.45);margin-bottom:4px}',
  '.img-upload-hint{font-size:.72rem;color:rgba(240,224,192,.25)}',
  '.img-upload-input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}',
  '.img-preview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}',
  '.img-preview-item{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;border:1px solid rgba(200,144,10,.15)}',
  '.img-preview-item img{width:100%;height:100%;object-fit:cover}',
  '.img-preview-remove{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.7);color:white;display:flex;align-items:center;justify-content:center;font-size:.65rem;cursor:pointer;border:none;transition:.2s}',
  '.img-preview-remove:hover{background:var(--red)}',
  '.img-preview-main{position:absolute;bottom:4px;left:4px;font-size:.55rem;background:var(--gold);color:var(--brown);padding:1px 5px;border-radius:4px;font-family:var(--font-sub);font-weight:700}',

  /* Category grid */
  '.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px}',
  '.cat-item{background:#2a1a08;border:1px solid rgba(200,144,10,.13);border-radius:16px;overflow:hidden;transition:.2s}',
  '.cat-item:hover{border-color:rgba(200,144,10,.28);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.3)}',
  '.cat-img{width:100%;aspect-ratio:4/3;object-fit:cover;background:rgba(200,144,10,.08);display:flex;align-items:center;justify-content:center;font-size:2.5rem}',
  '.cat-img img{width:100%;height:100%;object-fit:cover}',
  '.cat-info{padding:14px}',
  '.cat-name{font-family:var(--font-sub);font-size:.85rem;color:var(--cream);margin-bottom:3px}',
  '.cat-name-si{font-size:.75rem;color:rgba(240,224,192,.45);margin-bottom:10px}',
  '.cat-actions{display:flex;gap:6px}',

  /* Variants */
  '.variant-list{display:flex;flex-direction:column;gap:10px;margin-bottom:12px}',
  '.variant-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:10px;align-items:center;background:rgba(200,144,10,.05);border:1px solid rgba(200,144,10,.1);border-radius:9px;padding:10px 12px}',
  '.variant-label{font-family:var(--font-sub);font-size:.7rem;letter-spacing:.08em;color:rgba(200,144,10,.5);margin-bottom:4px;text-transform:uppercase}',
  '.v-input{width:100%;background:rgba(200,144,10,.07);border:1px solid rgba(200,144,10,.12);border-radius:7px;padding:7px 10px;color:var(--cream);font-family:var(--font-body);font-size:.82rem;outline:none}',
  '.v-input:focus{border-color:var(--gold)}',
  '.v-remove{width:28px;height:28px;border-radius:7px;background:rgba(139,37,0,.2);color:#f87171;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:.2s;flex-shrink:0}',
  '.v-remove:hover{background:rgba(139,37,0,.35)}',
  '.add-variant-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:1px dashed rgba(200,144,10,.3);border-radius:9px;color:rgba(200,144,10,.6);font-family:var(--font-sub);font-size:.72rem;cursor:pointer;background:none;transition:.2s}',
  '.add-variant-btn:hover{border-color:var(--gold);color:var(--gold-light);background:rgba(200,144,10,.06)}',

  /* Product image area */
  '.product-imgs{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}',
  '.product-img-thumb{position:relative;width:80px;height:80px;border-radius:10px;overflow:hidden;border:1px solid rgba(200,144,10,.2)}',
  '.product-img-thumb img{width:100%;height:100%;object-fit:cover}',
  '.product-img-thumb-rm{position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.7);color:white;display:flex;align-items:center;justify-content:center;font-size:.6rem;cursor:pointer;border:none}',
  '.product-img-thumb-rm:hover{background:var(--red)}',

  /* Empty / loading */
  '.a-empty{text-align:center;padding:50px 20px;color:rgba(240,224,192,.3);font-style:italic;font-size:.88rem}',
  '.a-loading{text-align:center;padding:36px;color:rgba(200,144,10,.45);font-style:italic}',
  '.stock-low{color:#fbbf24!important;font-weight:600}',
  '.stock-out{color:#f87171!important;font-weight:600}',

  /* Responsive */
  '@media(max-width:1200px){.stats-grid{grid-template-columns:repeat(2,1fr)}.a-grid-2{grid-template-columns:1fr}}',
  '@media(max-width:768px){.admin-sidebar{transform:translateX(-260px)}.admin-sidebar.open{transform:translateX(0)}.admin-main{margin-left:0}.stats-grid{grid-template-columns:1fr 1fr}.admin-content{padding:18px}.m-row{grid-template-columns:1fr}.variant-row{grid-template-columns:1fr 1fr;grid-template-rows:auto auto}}',
].join('');

/* ── NAV CONFIG ── */
const NAV = [
  { section: 'Overview' },
  { id: 'dashboard',  icon: 'fas fa-chart-line',     label: 'Dashboard' },
  { section: 'Catalog' },
  { id: 'products',   icon: 'fas fa-pepper-hot',      label: 'Products' },
  { id: 'categories', icon: 'fas fa-tags',            label: 'Categories' },
  { id: 'coupons',    icon: 'fas fa-ticket-alt',      label: 'Coupons' },
  { section: 'Sales' },
  { id: 'orders',     icon: 'fas fa-shopping-bag',    label: 'Orders',    badge: true },
  { id: 'bulk',       icon: 'fas fa-industry',        label: 'Bulk Orders' },
  { section: 'Community' },
  { id: 'customers',  icon: 'fas fa-users',           label: 'Customers' },
  { id: 'reviews',    icon: 'fas fa-star',            label: 'Reviews' },
  { section: 'Content' },
  { id: 'story',      icon: 'fas fa-book-open',       label: 'Our Story' },
  { section: 'System' },
  { id: 'settings',   icon: 'fas fa-cog',             label: 'Settings' },
];

var currentSection = 'dashboard';
var editingProduct  = null;
var editingCategory = null;
var productImages   = [];
var productVariants = [];

/* ── INIT ── */
export async function init(container) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { router.go('login'); return; }

  const { data: profile } = await supabase
    .from('users').select('role,full_name,email').eq('id', user.id).single();

  if (!profile || profile.role !== 'admin') {
    showToast('Access denied. Admins only.', 'error');
    router.go('home');
    return;
  }

  if (!document.getElementById('admin-font')) {
    const f = document.createElement('link');
    f.id = 'admin-font'; f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(f);
  }
  if (!document.getElementById('admin-styles')) {
    const s = document.createElement('style');
    s.id = 'admin-styles'; s.textContent = ADMIN_CSS;
    document.head.appendChild(s);
  }

  container.innerHTML = '';
  container.appendChild(buildShell(profile));
  switchSection(container, 'dashboard');
  bindSidebar(container);
  bindTopbar(container);
}

/* ── SHELL ── */
function buildShell(profile) {
  var initials = (profile.full_name || profile.email || 'A')
    .split(' ').map(function(w){ return w[0]; }).join('').toUpperCase().slice(0,2);

  var navHTML = '';
  NAV.forEach(function(item) {
    if (item.section) {
      navHTML += '<p class="sidebar-section">' + item.section + '</p>';
    } else {
      navHTML += '<button class="sidebar-link" data-section="' + item.id + '">'
        + '<i class="' + item.icon + '"></i><span>' + item.label + '</span>'
        + (item.badge ? '<span class="badge-count" id="badge-' + item.id + '"></span>' : '')
        + '</button>';
    }
  });

  var wrap = document.createElement('div');
  wrap.className = 'admin-page';
  wrap.innerHTML = `
  <aside class="admin-sidebar" id="admin-sidebar">
    <div class="sidebar-logo">
      <img src="/images/kiththa LOGO (4).png" alt="Kiththa Grand" onerror="this.style.display='none'" />
      <div>
        <div class="sidebar-logo-name">Kiththa Grand</div>
        <div class="sidebar-logo-sub">Admin Panel</div>
      </div>
    </div>
    <nav class="sidebar-nav">${navHTML}</nav>
    <div class="sidebar-bottom">
      <div class="sidebar-user">
        <div class="sidebar-avatar">${initials}</div>
        <div style="flex:1;min-width:0">
          <div class="sidebar-user-name">${profile.full_name || profile.email}</div>
          <div class="sidebar-user-role">Administrator</div>
        </div>
        <button class="admin-logout-btn" id="admin-logout"><i class="fas fa-sign-out-alt"></i></button>
      </div>
    </div>
  </aside>

  <main class="admin-main" id="admin-main">
    <div class="admin-topbar">
      <button class="topbar-toggle" id="sidebar-toggle"><i class="fas fa-bars"></i></button>
      <h1 class="topbar-title" id="topbar-title">Dashboard</h1>
      <div class="topbar-actions">
        <button class="a-btn ghost" id="topbar-refresh"><i class="fas fa-sync-alt"></i> Refresh</button>
        <button class="a-btn primary" onclick="window.open('/','_blank')"><i class="fas fa-external-link-alt"></i> View Site</button>
      </div>
    </div>
    <div class="admin-content" id="admin-content">
      <div class="admin-section active" id="section-dashboard"></div>
      <div class="admin-section" id="section-products"></div>
      <div class="admin-section" id="section-categories"></div>
      <div class="admin-section" id="section-coupons"></div>
      <div class="admin-section" id="section-orders"></div>
      <div class="admin-section" id="section-bulk"></div>
      <div class="admin-section" id="section-customers"></div>
      <div class="admin-section" id="section-reviews"></div>
      <div class="admin-section" id="section-story"></div>
      <div class="admin-section" id="section-settings"></div>
    </div>
  </main>

  <!-- Product Modal -->
  <div class="m-overlay hidden" id="modal-product">
    <div class="m-box">
      <div class="m-hdr">
        <h2 class="m-title" id="modal-product-title">Add Product</h2>
        <button class="m-close" id="modal-product-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="m-row">
        <div class="m-group">
          <label class="m-label">Product Name *</label>
          <input type="text" id="pm-name" class="m-input" placeholder="Ceylon Cinnamon" />
        </div>
        <div class="m-group">
          <label class="m-label">Sinhala Name</label>
          <input type="text" id="pm-name-si" class="m-input" placeholder="කුරුඳු" />
        </div>
      </div>
      <div class="m-group">
        <label class="m-label">Description</label>
        <textarea id="pm-desc" class="m-input" rows="3" placeholder="Product description..."></textarea>
      </div>
      <div class="m-group">
        <label class="m-label">Product Story</label>
        <textarea id="pm-story" class="m-input" rows="2" placeholder="The story behind this spice..."></textarea>
      </div>
      <div class="m-row">
        <div class="m-group">
          <label class="m-label">Price (LKR) *</label>
          <input type="number" id="pm-price-lkr" class="m-input" placeholder="1500" />
        </div>
        <div class="m-group">
          <label class="m-label">Price (USD)</label>
          <input type="number" id="pm-price-usd" class="m-input" placeholder="4.99" step="0.01" />
        </div>
      </div>
      <div class="m-row">
        <div class="m-group">
          <label class="m-label">Weight (grams) *</label>
          <input type="number" id="pm-weight" class="m-input" placeholder="100" />
        </div>
        <div class="m-group">
          <label class="m-label">Stock *</label>
          <input type="number" id="pm-stock" class="m-input" placeholder="50" />
        </div>
      </div>
      <div class="m-row">
        <div class="m-group">
          <label class="m-label">Category</label>
          <select id="pm-category" class="m-input"></select>
        </div>
        <div class="m-group">
          <label class="m-label">Origin</label>
          <input type="text" id="pm-origin" class="m-input" value="Sri Lanka" />
        </div>
      </div>
      <div class="m-row">
        <div class="m-group">
          <label class="m-label">Featured</label>
          <select id="pm-featured" class="m-input">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div class="m-group">
          <label class="m-label">Active</label>
          <select id="pm-active" class="m-input">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <!-- Product Images -->
      <div class="m-group">
        <label class="m-label">Product Images</label>
        <div class="img-upload-zone" id="pm-img-zone">
          <input type="file" class="img-upload-input" id="pm-img-input" multiple accept="image/*" />
          <div class="img-upload-icon">📷</div>
          <div class="img-upload-text">Click or drag images here</div>
          <div class="img-upload-hint">JPG, PNG, WEBP · Max 2MB each · First image = main</div>
        </div>
        <div class="img-preview-grid" id="pm-img-preview"></div>
      </div>

      <!-- Stock Variants -->
      <div class="m-group">
        <label class="m-label">Stock Variants <span style="opacity:.5;font-size:.65rem">(optional — e.g. 50g, 100g, 250g)</span></label>
        <div class="variant-list" id="pm-variants"></div>
        <button class="add-variant-btn" id="pm-add-variant">
          <i class="fas fa-plus"></i> Add Variant
        </button>
      </div>

      <div class="m-actions">
        <button class="m-save" id="btn-save-product">Save Product</button>
        <button class="m-cancel" id="modal-product-cancel">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Category Modal -->
  <div class="m-overlay hidden" id="modal-category">
    <div class="m-box">
      <div class="m-hdr">
        <h2 class="m-title" id="modal-cat-title">Add Category</h2>
        <button class="m-close" id="modal-cat-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="m-row">
        <div class="m-group">
          <label class="m-label">Name (English) *</label>
          <input type="text" id="cm-name" class="m-input" placeholder="Whole Spices" />
        </div>
        <div class="m-group">
          <label class="m-label">Name (Sinhala)</label>
          <input type="text" id="cm-name-si" class="m-input" placeholder="සම්පූර්ණ කුළුබඩු" />
        </div>
      </div>
      <div class="m-row">
        <div class="m-group">
          <label class="m-label">Slug *</label>
          <input type="text" id="cm-slug" class="m-input" placeholder="whole-spices" />
        </div>
        <div class="m-group">
          <label class="m-label">Sort Order</label>
          <input type="number" id="cm-order" class="m-input" placeholder="1" value="1" />
        </div>
      </div>
      <div class="m-group">
        <label class="m-label">Active</label>
        <select id="cm-active" class="m-input">
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div class="m-group">
        <label class="m-label">Category Image</label>
        <div class="img-upload-zone" id="cm-img-zone">
          <input type="file" class="img-upload-input" id="cm-img-input" accept="image/*" />
          <div class="img-upload-icon">🖼️</div>
          <div class="img-upload-text">Click or drag image here</div>
          <div class="img-upload-hint">JPG, PNG, WEBP · Max 2MB</div>
        </div>
        <div id="cm-img-preview" style="margin-top:10px"></div>
      </div>
      <div class="m-actions">
        <button class="m-save" id="btn-save-category">Save Category</button>
        <button class="m-cancel" id="modal-cat-cancel">Cancel</button>
      </div>
    </div>
  </div>
  `;

  return wrap;
}

/* ── SWITCH SECTION ── */
function switchSection(container, id) {
  currentSection = id;
  container.querySelectorAll('.sidebar-link').forEach(function(l) {
    l.classList.toggle('active', l.dataset.section === id);
  });
  container.querySelectorAll('.admin-section').forEach(function(s) {
    s.classList.remove('active');
  });
  var sec = container.querySelector('#section-' + id);
  if (sec) sec.classList.add('active');

  var titles = { dashboard:'Dashboard', products:'Products', categories:'Categories',
    coupons:'Coupons', orders:'Orders', bulk:'Bulk Orders',
    customers:'Customers', reviews:'Reviews', story:'Our Story', settings:'Settings' };
  var titleEl = container.querySelector('#topbar-title');
  if (titleEl) titleEl.textContent = titles[id] || id;

  if (id === 'dashboard')  loadDashboard(container);
  if (id === 'products')   loadProducts(container);
  if (id === 'categories') loadCategories(container);
  if (id === 'orders')     loadOrders(container);
  if (id === 'customers')  loadCustomers(container);
  if (id === 'reviews')    loadReviews(container);
  if (id === 'bulk')       loadBulkOrders(container);
  if (id === 'coupons')    loadCoupons(container);
  if (id === 'story')      loadStory(container);
  if (id === 'settings')   loadSettings(container);
}

/* ── BIND SIDEBAR ── */
function bindSidebar(container) {
  container.querySelectorAll('.sidebar-link').forEach(function(link) {
    link.addEventListener('click', function() {
      switchSection(container, link.dataset.section);
      if (window.innerWidth < 768) {
        container.querySelector('#admin-sidebar').classList.remove('open');
      }
    });
  });
  container.querySelector('#admin-logout')?.addEventListener('click', async function() {
    await supabase.auth.signOut();
    router.go('home');
  });
}

/* ── BIND TOPBAR ── */
function bindTopbar(container) {
  var toggle = container.querySelector('#sidebar-toggle');
  var sb     = container.querySelector('#admin-sidebar');
  var main   = container.querySelector('#admin-main');
  toggle?.addEventListener('click', function() {
    if (window.innerWidth < 768) {
      sb.classList.toggle('open');
    } else {
      sb.classList.toggle('collapsed');
      main.classList.toggle('expanded');
    }
  });
  container.querySelector('#topbar-refresh')?.addEventListener('click', function() {
    switchSection(container, currentSection);
  });
}

/* ════════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════════ */
async function loadDashboard(container) {
  var sec = container.querySelector('#section-dashboard');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var [oRes, uRes, pRes, rRes] = await Promise.all([
    supabase.from('orders').select('id,status,total,created_at').order('created_at',{ascending:false}),
    supabase.from('users').select('id,created_at').eq('role','customer'),
    supabase.from('products').select('id,name,stock,price_lkr,is_active'),
    supabase.from('orders').select('total').eq('payment_status','paid'),
  ]);

  var orders   = oRes.data || [];
  var users    = uRes.data || [];
  var products = pRes.data || [];
  var paid     = rRes.data || [];

  var revenue  = paid.reduce(function(s,o){ return s + (parseFloat(o.total)||0); }, 0);
  var pending  = orders.filter(function(o){ return o.status === 'pending'; }).length;
  var lowStock = products.filter(function(p){ return p.stock < 10; });

  var badge = container.querySelector('#badge-orders');
  if (badge) badge.textContent = pending || '';

  var recentHTML = orders.slice(0,6).map(function(o) {
    var dt = new Date(o.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'});
    return '<tr>'
      + '<td style="font-family:var(--font-sub);font-size:.74rem;color:var(--gold-light)">' + o.id.slice(0,8) + '...</td>'
      + '<td>' + dt + '</td>'
      + '<td><span class="s-badge ' + o.status + '">' + o.status + '</span></td>'
      + '<td style="font-family:var(--font-head);color:var(--gold-light)">Rs.' + parseFloat(o.total||0).toLocaleString() + '</td>'
      + '</tr>';
  }).join('');

  var lowHTML = lowStock.slice(0,5).map(function(p) {
    var cls = p.stock === 0 ? 'stock-out' : 'stock-low';
    return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(200,144,10,.06)">'
      + '<div style="width:38px;height:38px;border-radius:9px;background:rgba(200,144,10,.08);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">🌶️</div>'
      + '<div style="flex:1;font-size:.82rem;color:var(--cream)">' + p.name + '</div>'
      + '<div class="' + cls + '">' + p.stock + ' left</div>'
      + '</div>';
  }).join('') || '<div class="a-empty">All products well stocked!</div>';

  sec.innerHTML = `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon gold"><i class="fas fa-coins"></i></div>
      <div class="stat-num">Rs.${revenue.toLocaleString()}</div>
      <div class="stat-label">Total Revenue</div>
      <span class="stat-change up"><i class="fas fa-check-circle"></i> Paid orders</span>
    </div>
    <div class="stat-card">
      <div class="stat-icon red"><i class="fas fa-shopping-bag"></i></div>
      <div class="stat-num">${orders.length}</div>
      <div class="stat-label">Total Orders</div>
      <span class="stat-change ${pending > 0 ? 'warn' : 'up'}"><i class="fas fa-clock"></i> ${pending} pending</span>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i class="fas fa-users"></i></div>
      <div class="stat-num">${users.length}</div>
      <div class="stat-label">Customers</div>
      <span class="stat-change up"><i class="fas fa-arrow-up"></i> Growing</span>
    </div>
    <div class="stat-card">
      <div class="stat-icon blue"><i class="fas fa-pepper-hot"></i></div>
      <div class="stat-num">${products.length}</div>
      <div class="stat-label">Products</div>
      <span class="stat-change ${lowStock.length > 0 ? 'warn' : 'up'}">
        <i class="fas fa-${lowStock.length > 0 ? 'exclamation-triangle' : 'check'}"></i>
        ${lowStock.length > 0 ? lowStock.length + ' low stock' : 'All stocked'}
      </span>
    </div>
  </div>
  <div class="a-grid-2">
    <div class="a-card">
      <div class="a-card-hdr">
        <span class="a-card-title"><i class="fas fa-shopping-bag"></i> Recent Orders</span>
        <button class="a-btn ghost" style="font-size:.65rem;padding:5px 10px" data-section="orders">View All</button>
      </div>
      <div class="a-table-wrap">
        <table class="a-table">
          <thead><tr><th>ID</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>${recentHTML || '<tr><td colspan="4" class="a-empty">No orders yet</td></tr>'}</tbody>
        </table>
      </div>
    </div>
    <div class="a-card">
      <div class="a-card-hdr">
        <span class="a-card-title"><i class="fas fa-exclamation-triangle"></i> Low Stock Alert</span>
        <button class="a-btn ghost" style="font-size:.65rem;padding:5px 10px" data-section="products">Manage</button>
      </div>
      ${lowHTML}
    </div>
  </div>`;

  sec.querySelectorAll('[data-section]').forEach(function(btn) {
    btn.addEventListener('click', function() { switchSection(container, btn.dataset.section); });
  });
}

/* ════════════════════════════════════════════════════════════════
   PRODUCTS
════════════════════════════════════════════════════════════════ */
async function loadProducts(container) {
  var sec = container.querySelector('#section-products');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var [pRes, cRes] = await Promise.all([
    supabase.from('products').select('*,category:categories(name)').order('created_at',{ascending:false}),
    supabase.from('categories').select('id,name'),
  ]);

  var products   = pRes.data || [];
  var categories = cRes.data || [];

  /* Populate category select in modal */
  var catSel = container.querySelector('#pm-category');
  if (catSel) {
    catSel.innerHTML = '<option value="">-- Select --</option>'
      + categories.map(function(c){ return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('');
  }

  var rowsHTML = products.map(function(p) {
    var stockCls = p.stock === 0 ? 'stock-out' : p.stock < 10 ? 'stock-low' : '';
    var imgHTML  = p.images && p.images[0]
      ? '<img src="' + p.images[0] + '" style="width:38px;height:38px;border-radius:8px;object-fit:cover;border:1px solid rgba(200,144,10,.15)" />'
      : '<span style="font-size:1.5rem">🌶️</span>';
    return '<tr>'
      + '<td>' + imgHTML + '</td>'
      + '<td style="color:var(--cream);font-size:.84rem">' + p.name + (p.name_si ? '<br><span style="color:rgba(240,224,192,.4);font-size:.72rem">' + p.name_si + '</span>' : '') + '</td>'
      + '<td style="color:rgba(200,144,10,.7);font-size:.75rem">' + (p.category ? p.category.name : '--') + '</td>'
      + '<td style="font-family:var(--font-head);color:var(--gold-light)">Rs.' + parseFloat(p.price_lkr||0).toLocaleString() + '</td>'
      + '<td class="' + stockCls + '">' + p.stock + '</td>'
      + '<td>' + p.weight_grams + 'g</td>'
      + '<td><span class="s-badge ' + (p.is_active ? 'active' : 'inactive') + '">'
      + '<span class="s-dot ' + (p.is_active ? 'green' : 'red') + '"></span>'
      + (p.is_active ? 'Active' : 'Draft') + '</span></td>'
      + '<td><div class="tbl-actions">'
      + '<button class="tbl-btn edit" data-edit-p="' + p.id + '">Edit</button>'
      + '<button class="tbl-btn del" data-del-p="' + p.id + '">Delete</button>'
      + '</div></td>'
      + '</tr>';
  }).join('');

  sec.innerHTML = `
  <div class="a-search-bar">
    <div class="a-search-wrap">
      <i class="fas fa-search a-search-icon"></i>
      <input type="text" class="a-search" id="p-search" placeholder="Search products..." />
    </div>
    <select class="a-select" id="p-cat-filter">
      <option value="">All Categories</option>
      ${categories.map(function(c){ return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('')}
    </select>
    <button class="a-btn gold" id="btn-add-product"><i class="fas fa-plus"></i> Add Product</button>
  </div>
  <div class="a-card">
    <div class="a-table-wrap">
      <table class="a-table" id="products-table">
        <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Weight</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="products-tbody">${rowsHTML || '<tr><td colspan="8" class="a-empty">No products yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;

  /* Search */
  sec.querySelector('#p-search')?.addEventListener('input', function() {
    var q = this.value.toLowerCase();
    sec.querySelectorAll('#products-tbody tr').forEach(function(tr) {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  /* Add product */
  sec.querySelector('#btn-add-product')?.addEventListener('click', function() {
    openProductModal(container, null, categories);
  });

  /* Edit */
  sec.querySelectorAll('[data-edit-p]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var p = products.find(function(x){ return x.id === btn.dataset.editP; });
      if (p) openProductModal(container, p, categories);
    });
  });

  /* Delete */
  sec.querySelectorAll('[data-del-p]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      if (!confirm('Delete this product?')) return;
      var res = await supabase.from('products').delete().eq('id', btn.dataset.delP);
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Product deleted!', 'success');
      loadProducts(container);
    });
  });
}

/* ── PRODUCT MODAL ── */
function openProductModal(container, product, categories) {
  var modal = container.querySelector('#modal-product');
  if (!modal) return;

  editingProduct  = product;
  productImages   = product && product.images ? [...product.images] : [];
  productVariants = [];

  /* Parse existing variants from description or a custom field */
  if (product && product.story && product.story.startsWith('[VARIANTS]')) {
    try {
      productVariants = JSON.parse(product.story.replace('[VARIANTS]',''));
    } catch(e) { productVariants = []; }
  }

  container.querySelector('#modal-product-title').textContent = product ? 'Edit Product' : 'Add Product';
  container.querySelector('#pm-name').value       = product ? product.name          || '' : '';
  container.querySelector('#pm-name-si').value    = product ? product.name_si       || '' : '';
  container.querySelector('#pm-desc').value       = product ? product.description   || '' : '';
  container.querySelector('#pm-story').value      = product ? (productVariants.length ? '' : (product.story || '')) : '';
  container.querySelector('#pm-price-lkr').value  = product ? product.price_lkr     || '' : '';
  container.querySelector('#pm-price-usd').value  = product ? product.price_usd     || '' : '';
  container.querySelector('#pm-weight').value     = product ? product.weight_grams  || '' : '';
  container.querySelector('#pm-stock').value      = product ? product.stock         || '' : '';
  container.querySelector('#pm-origin').value     = product ? product.origin        || 'Sri Lanka' : 'Sri Lanka';
  container.querySelector('#pm-featured').value   = product ? String(product.is_featured) : 'false';
  container.querySelector('#pm-active').value     = product ? String(product.is_active)   : 'true';
  if (product && product.category_id) {
    container.querySelector('#pm-category').value = product.category_id;
  } else {
    container.querySelector('#pm-category').value = '';
  }

  renderProductImages(container);
  renderVariants(container);
  modal.classList.remove('hidden');

  /* Image upload */
  var imgInput = container.querySelector('#pm-img-input');
  var imgZone  = container.querySelector('#pm-img-zone');

  imgInput.onchange = function() { handleImageFiles(container, imgInput.files); };
  imgZone.ondragover = function(e) { e.preventDefault(); imgZone.classList.add('dragover'); };
  imgZone.ondragleave = function() { imgZone.classList.remove('dragover'); };
  imgZone.ondrop = function(e) {
    e.preventDefault();
    imgZone.classList.remove('dragover');
    handleImageFiles(container, e.dataTransfer.files);
  };

  /* Add variant */
  container.querySelector('#pm-add-variant').onclick = function() {
    productVariants.push({ name: '', weight: '', price: '', stock: '' });
    renderVariants(container);
  };

  /* Close */
  var closeModal = function() { modal.classList.add('hidden'); editingProduct = null; };
  container.querySelector('#modal-product-close').onclick  = closeModal;
  container.querySelector('#modal-product-cancel').onclick = closeModal;

  /* Save */
  container.querySelector('#btn-save-product').onclick = async function() {
    var btn = container.querySelector('#btn-save-product');
    var name = container.querySelector('#pm-name').value.trim();
    if (!name) { showToast('Product name required', 'error'); return; }

    btn.disabled = true; btn.textContent = 'Saving...';

    /* Upload new images to Cloudinary */
    var uploadedUrls = [];
    for (var i = 0; i < productImages.length; i++) {
      var img = productImages[i];
      if (img.startsWith('data:') || img.startsWith('blob:')) {
        btn.textContent = 'Uploading image ' + (i + 1) + '/' + productImages.length + '...';
        var url = await uploadImage(img, 'products');
        if (url) uploadedUrls.push(url);
      } else {
        uploadedUrls.push(img);
      }
    }

    var story = container.querySelector('#pm-story').value.trim();
    if (productVariants.length > 0) {
      story = '[VARIANTS]' + JSON.stringify(productVariants);
    }

    var data = {
      name:          name,
      name_si:       container.querySelector('#pm-name-si').value.trim() || null,
      description:   container.querySelector('#pm-desc').value.trim()    || null,
      story:         story || null,
      price_lkr:     parseFloat(container.querySelector('#pm-price-lkr').value)  || 0,
      price_usd:     parseFloat(container.querySelector('#pm-price-usd').value)  || null,
      weight_grams:  parseInt(container.querySelector('#pm-weight').value)        || 0,
      stock:         parseInt(container.querySelector('#pm-stock').value)         || 0,
      origin:        container.querySelector('#pm-origin').value.trim() || 'Sri Lanka',
      category_id:   container.querySelector('#pm-category').value || null,
      is_featured:   container.querySelector('#pm-featured').value === 'true',
      is_active:     container.querySelector('#pm-active').value   === 'true',
      images:        uploadedUrls,
      updated_at:    new Date().toISOString(),
    };

    var res = editingProduct
      ? await supabase.from('products').update(data).eq('id', editingProduct.id)
      : await supabase.from('products').insert(data);

    btn.disabled = false; btn.textContent = 'Save Product';

    if (res.error) { showToast(res.error.message, 'error'); return; }
    showToast(editingProduct ? 'Product updated!' : 'Product added!', 'success');
    closeModal();
    loadProducts(container);
  };
}

function renderProductImages(container) {
  var preview = container.querySelector('#pm-img-preview');
  if (!preview) return;
  preview.innerHTML = productImages.map(function(src, i) {
    return '<div class="img-preview-item">'
      + '<img src="' + src + '" onerror="this.src=\'\'" />'
      + (i === 0 ? '<span class="img-preview-main">Main</span>' : '')
      + '<button class="img-preview-remove" data-img-idx="' + i + '"><i class="fas fa-times"></i></button>'
      + '</div>';
  }).join('');
  preview.querySelectorAll('[data-img-idx]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      productImages.splice(parseInt(btn.dataset.imgIdx), 1);
      renderProductImages(container);
    });
  });
}

function handleImageFiles(container, files) {
  Array.from(files).forEach(function(file) {
    if (!file.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      productImages.push(e.target.result);
      renderProductImages(container);
    };
    reader.readAsDataURL(file);
  });
}

function renderVariants(container) {
  var list = container.querySelector('#pm-variants');
  if (!list) return;
  list.innerHTML = productVariants.map(function(v, i) {
    return '<div class="variant-row">'
      + '<div><div class="variant-label">Variant Name</div>'
      + '<input type="text" class="v-input" placeholder="e.g. 100g Pack" value="' + (v.name||'') + '" data-vi="' + i + '" data-vf="name" /></div>'
      + '<div><div class="variant-label">Weight (g)</div>'
      + '<input type="number" class="v-input" placeholder="100" value="' + (v.weight||'') + '" data-vi="' + i + '" data-vf="weight" /></div>'
      + '<div><div class="variant-label">Price (LKR)</div>'
      + '<input type="number" class="v-input" placeholder="1500" value="' + (v.price||'') + '" data-vi="' + i + '" data-vf="price" /></div>'
      + '<div><div class="variant-label">Stock</div>'
      + '<input type="number" class="v-input" placeholder="50" value="' + (v.stock||'') + '" data-vi="' + i + '" data-vf="stock" /></div>'
      + '<button class="v-remove" data-vrem="' + i + '"><i class="fas fa-trash"></i></button>'
      + '</div>';
  }).join('');

  list.querySelectorAll('.v-input').forEach(function(inp) {
    inp.addEventListener('input', function() {
      var idx = parseInt(inp.dataset.vi);
      var field = inp.dataset.vf;
      if (productVariants[idx]) productVariants[idx][field] = inp.value;
    });
  });
  list.querySelectorAll('[data-vrem]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      productVariants.splice(parseInt(btn.dataset.vrem), 1);
      renderVariants(container);
    });
  });
}

/* ── IMAGE UPLOAD to Cloudinary ── */
async function uploadImage(dataUrl, folder) {
  try {
    var res = await supabase.functions.invoke('upload-image', {
      body: { image: dataUrl, folder: folder },
    });
    if (res.error || !res.data || !res.data.url) {
      var msg = (res.data && res.data.error) || (res.error && res.error.message) || 'Image upload failed';
      showToast(msg, 'error');
      return null;
    }
    return res.data.url;
  } catch (e) {
    showToast('Image upload error', 'error');
    return null;
  }
}

/* ════════════════════════════════════════════════════════════════
   CATEGORIES
════════════════════════════════════════════════════════════════ */
async function loadCategories(container) {
  var sec = container.querySelector('#section-categories');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var { data: cats } = await supabase.from('categories').select('*').order('sort_order');
  cats = cats || [];

  var catsHTML = cats.map(function(c) {
    return '<div class="cat-item">'
      + '<div class="cat-img">'
      + (c.image_url ? '<img src="' + c.image_url + '" alt="' + c.name + '" />' : '<span>' + (c.name === 'Whole Spices' ? '🌶️' : c.name === 'Ground Spices' ? '🟡' : c.name === 'Spice Blends' ? '🫙' : '🎁') + '</span>')
      + '</div>'
      + '<div class="cat-info">'
      + '<div class="cat-name">' + c.name + '</div>'
      + '<div class="cat-name-si">' + (c.name_si || '--') + '</div>'
      + '<div class="cat-actions">'
      + '<button class="tbl-btn edit" data-edit-c="' + c.id + '">Edit</button>'
      + '<button class="tbl-btn del" data-del-c="' + c.id + '">Delete</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  sec.innerHTML = (
    '<div class="a-search-bar">'
      + '<div style="flex:1"></div>'
      + '<button class="a-btn gold" id="btn-add-cat"><i class="fas fa-plus"></i> Add Category</button>'
    + '</div>'
    + '<div class="cat-grid">' + (catsHTML || '<div class="a-empty">No categories yet</div>') + '</div>'
  );

  sec.querySelector('#btn-add-cat')?.addEventListener('click', function() {
    openCategoryModal(container, null);
  });
  sec.querySelectorAll('[data-edit-c]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var c = cats.find(function(x){ return x.id === btn.dataset.editC; });
      if (c) openCategoryModal(container, c);
    });
  });
  sec.querySelectorAll('[data-del-c]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      var catId = btn.dataset.delC;
      var countRes = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', catId);
      if (countRes.error) { showToast(countRes.error.message, 'error'); return; }
      var n = countRes.count || 0;
      if (n > 0) {
        if (!confirm(n + ' product(s) use this category. Delete it anyway? They will become Uncategorized.')) return;
        var unassignRes = await supabase.from('products').update({ category_id: null }).eq('category_id', catId);
        if (unassignRes.error) { showToast(unassignRes.error.message, 'error'); return; }
      } else {
        if (!confirm('Delete this category?')) return;
      }
      var res = await supabase.from('categories').delete().eq('id', catId);
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Category deleted!', 'success');
      loadCategories(container);
    });
  });
}

/* ── CATEGORY MODAL ── */
function openCategoryModal(container, category) {
  var modal = container.querySelector('#modal-category');
  if (!modal) return;
  editingCategory = category;
  var catImageUrl = category ? (category.image_url || '') : '';

  container.querySelector('#modal-cat-title').textContent = category ? 'Edit Category' : 'Add Category';
  container.querySelector('#cm-name').value     = category ? category.name       || '' : '';
  container.querySelector('#cm-name-si').value  = category ? category.name_si    || '' : '';
  container.querySelector('#cm-slug').value     = category ? category.slug        || '' : '';
  container.querySelector('#cm-order').value    = category ? category.sort_order  || 1 : 1;
  container.querySelector('#cm-active').value   = category ? String(category.is_active) : 'true';

  var preview = container.querySelector('#cm-img-preview');
  preview.innerHTML = catImageUrl
    ? '<img src="' + catImageUrl + '" style="width:100%;max-height:120px;object-fit:cover;border-radius:10px;border:1px solid rgba(200,144,10,.2)" />'
    : '';

  modal.classList.remove('hidden');

  /* Auto slug */
  container.querySelector('#cm-name').oninput = function() {
    var slug = this.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    container.querySelector('#cm-slug').value = slug;
  };

  /* Image upload */
  var imgInput = container.querySelector('#cm-img-input');
  imgInput.onchange = function() {
    if (!imgInput.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      catImageUrl = e.target.result;
      preview.innerHTML = '<img src="' + catImageUrl + '" style="width:100%;max-height:120px;object-fit:cover;border-radius:10px;border:1px solid rgba(200,144,10,.2)" />';
    };
    reader.readAsDataURL(imgInput.files[0]);
  };

  var closeModal = function() { modal.classList.add('hidden'); editingCategory = null; };
  container.querySelector('#modal-cat-close').onclick  = closeModal;
  container.querySelector('#modal-cat-cancel').onclick = closeModal;

  container.querySelector('#btn-save-category').onclick = async function() {
    var btn  = container.querySelector('#btn-save-category');
    var name = container.querySelector('#cm-name').value.trim();
    var slug = container.querySelector('#cm-slug').value.trim();
    if (!name || !slug) { showToast('Name and slug required', 'error'); return; }

    btn.disabled = true; btn.textContent = 'Saving...';

    var imageUrl = catImageUrl;
    if (catImageUrl && catImageUrl.startsWith('data:')) {
      imageUrl = await uploadImage(catImageUrl, 'categories');
    }

    var data = {
      name:        name,
      name_si:     container.querySelector('#cm-name-si').value.trim() || null,
      slug:        slug,
      sort_order:  parseInt(container.querySelector('#cm-order').value) || 1,
      is_active:   container.querySelector('#cm-active').value === 'true',
      image_url:   imageUrl || null,
    };

    var res = editingCategory
      ? await supabase.from('categories').update(data).eq('id', editingCategory.id)
      : await supabase.from('categories').insert(data);

    btn.disabled = false; btn.textContent = 'Save Category';

    if (res.error) { showToast(res.error.message, 'error'); return; }
    showToast(editingCategory ? 'Category updated!' : 'Category added!', 'success');
    closeModal();
    loadCategories(container);
  };
}

/* ════════════════════════════════════════════════════════════════
   ORDERS
════════════════════════════════════════════════════════════════ */
async function loadOrders(container) {
  var sec = container.querySelector('#section-orders');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var { data: orders } = await supabase.from('orders').select('*').order('created_at',{ascending:false});
  orders = orders || [];

  var rowsHTML = orders.map(function(o) {
    var dt = new Date(o.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    return '<tr>'
      + '<td style="font-family:var(--font-sub);font-size:.74rem;color:var(--gold-light)">' + (o.order_number || o.id.slice(0,8)) + '</td>'
      + '<td>' + (o.shipping_name || '--') + '</td>'
      + '<td style="font-size:.75rem;color:rgba(240,224,192,.5)">' + dt + '</td>'
      + '<td><span class="s-badge ' + o.status + '">' + o.status + '</span></td>'
      + '<td><span class="s-badge paid">' + (o.payment_status||'--') + '</span></td>'
      + '<td style="font-family:var(--font-head);color:var(--gold-light)">Rs.' + parseFloat(o.total||0).toLocaleString() + '</td>'
      + '<td><select class="tbl-btn edit" style="padding:5px 8px" data-order-id="' + o.id + '">'
      + '<option value="">Change Status</option>'
      + '<option value="confirmed">Confirmed</option>'
      + '<option value="packed">Packed</option>'
      + '<option value="shipped">Shipped</option>'
      + '<option value="delivered">Delivered</option>'
      + '<option value="cancelled">Cancelled</option>'
      + '</select></td>'
      + '</tr>';
  }).join('');

  sec.innerHTML = `
  <div class="a-search-bar">
    <div class="a-search-wrap">
      <i class="fas fa-search a-search-icon"></i>
      <input type="text" class="a-search" id="o-search" placeholder="Search orders..." />
    </div>
    <select class="a-select" id="o-filter">
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>
  <div class="a-card">
    <div class="a-table-wrap">
      <table class="a-table">
        <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Status</th><th>Payment</th><th>Total</th><th>Action</th></tr></thead>
        <tbody id="o-tbody">${rowsHTML || '<tr><td colspan="7" class="a-empty">No orders yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;

  sec.querySelector('#o-search')?.addEventListener('input', function() {
    var q = this.value.toLowerCase();
    sec.querySelectorAll('#o-tbody tr').forEach(function(tr) {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
  sec.querySelector('#o-filter')?.addEventListener('change', function() {
    var v = this.value;
    sec.querySelectorAll('#o-tbody tr').forEach(function(tr) {
      tr.style.display = (!v || tr.textContent.includes(v)) ? '' : 'none';
    });
  });
  sec.querySelectorAll('[data-order-id]').forEach(function(sel) {
    sel.addEventListener('change', async function() {
      if (!sel.value) return;
      var res = await supabase.from('orders').update({ status: sel.value }).eq('id', sel.dataset.orderId);
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Status updated!', 'success');
      loadOrders(container);
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   CUSTOMERS
════════════════════════════════════════════════════════════════ */
async function loadCustomers(container) {
  var sec = container.querySelector('#section-customers');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var { data: customers } = await supabase.from('users').select('*').eq('role','customer').order('created_at',{ascending:false});
  customers = customers || [];

  var rowsHTML = customers.map(function(u) {
    var dt = new Date(u.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    return '<tr>'
      + '<td style="color:var(--cream)">' + (u.full_name||'--') + '</td>'
      + '<td style="color:rgba(240,224,192,.6);font-size:.78rem">' + u.email + '</td>'
      + '<td>' + (u.phone||'--') + '</td>'
      + '<td style="font-family:var(--font-head);color:var(--gold-light)">' + (u.loyalty_points||0) + '</td>'
      + '<td>' + (u.total_orders||0) + '</td>'
      + '<td style="color:rgba(240,224,192,.5);font-size:.75rem">' + dt + '</td>'
      + '<td><span class="s-badge ' + (u.is_active ? 'active' : 'inactive') + '">'
      + '<span class="s-dot ' + (u.is_active ? 'green' : 'red') + '"></span>'
      + (u.is_active ? 'Active' : 'Inactive') + '</span></td>'
      + '</tr>';
  }).join('');

  sec.innerHTML = `
  <div class="a-search-bar">
    <div class="a-search-wrap">
      <i class="fas fa-search a-search-icon"></i>
      <input type="text" class="a-search" id="c-search" placeholder="Search customers..." />
    </div>
    <div style="color:rgba(200,144,10,.6);font-family:var(--font-sub);font-size:.74rem">${customers.length} total</div>
  </div>
  <div class="a-card">
    <div class="a-table-wrap">
      <table class="a-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Points</th><th>Orders</th><th>Joined</th><th>Status</th></tr></thead>
        <tbody id="c-tbody">${rowsHTML || '<tr><td colspan="7" class="a-empty">No customers yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;

  sec.querySelector('#c-search')?.addEventListener('input', function() {
    var q = this.value.toLowerCase();
    sec.querySelectorAll('#c-tbody tr').forEach(function(tr) {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   REVIEWS
════════════════════════════════════════════════════════════════ */
async function loadReviews(container) {
  var sec = container.querySelector('#section-reviews');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var { data: reviews } = await supabase.from('reviews')
    .select('*,product:products(name),user:users(full_name,email)')
    .order('created_at',{ascending:false});
  reviews = reviews || [];

  var rowsHTML = reviews.map(function(r) {
    var stars = '★'.repeat(r.rating) + '☆'.repeat(5-r.rating);
    var dt = new Date(r.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'});
    return '<tr>'
      + '<td style="color:var(--cream)">' + (r.user ? (r.user.full_name||r.user.email) : '--') + '</td>'
      + '<td style="color:rgba(200,144,10,.75);font-size:.75rem">' + (r.product ? r.product.name : '--') + '</td>'
      + '<td style="color:var(--gold-light);letter-spacing:.05em">' + stars + '</td>'
      + '<td style="color:rgba(240,224,192,.6);font-size:.78rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (r.comment||'--') + '</td>'
      + '<td>' + dt + '</td>'
      + '<td><span class="s-badge ' + (r.is_approved ? 'active' : 'pending') + '">' + (r.is_approved ? 'Approved' : 'Pending') + '</span></td>'
      + '<td><div class="tbl-actions">'
      + (!r.is_approved ? '<button class="tbl-btn approve" data-approve="' + r.id + '">Approve</button>' : '')
      + '<button class="tbl-btn del" data-del-r="' + r.id + '">Delete</button>'
      + '</div></td>'
      + '</tr>';
  }).join('');

  sec.innerHTML = `
  <div class="a-card">
    <div class="a-table-wrap">
      <table class="a-table">
        <thead><tr><th>Customer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="7" class="a-empty">No reviews yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;

  sec.querySelectorAll('[data-approve]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      var res = await supabase.from('reviews').update({is_approved:true}).eq('id',btn.dataset.approve);
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Review approved!', 'success');
      loadReviews(container);
    });
  });
  sec.querySelectorAll('[data-del-r]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      if (!confirm('Delete this review?')) return;
      var res = await supabase.from('reviews').delete().eq('id',btn.dataset.delR);
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Review deleted!', 'success');
      loadReviews(container);
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   BULK ORDERS
════════════════════════════════════════════════════════════════ */
async function loadBulkOrders(container) {
  var sec = container.querySelector('#section-bulk');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var { data: bulks } = await supabase.from('bulk_orders').select('*').order('created_at',{ascending:false});
  bulks = bulks || [];

  var rowsHTML = bulks.map(function(b) {
    var dt = new Date(b.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    return '<tr>'
      + '<td style="color:var(--cream)">' + b.name + '</td>'
      + '<td style="color:rgba(240,224,192,.6);font-size:.78rem">' + b.email + '</td>'
      + '<td>' + (b.company||'--') + '</td>'
      + '<td>' + (b.country||'--') + '</td>'
      + '<td>' + (b.quantity_kg ? b.quantity_kg + ' kg' : '--') + '</td>'
      + '<td><span class="s-badge ' + b.status + '">' + b.status + '</span></td>'
      + '<td style="font-size:.75rem;color:rgba(240,224,192,.45)">' + dt + '</td>'
      + '<td><select class="tbl-btn edit" style="padding:5px 8px" data-bulk-id="' + b.id + '">'
      + '<option value="">Update</option>'
      + '<option value="contacted">Contacted</option>'
      + '<option value="quoted">Quoted</option>'
      + '<option value="confirmed">Confirmed</option>'
      + '<option value="cancelled">Cancelled</option>'
      + '</select></td>'
      + '</tr>';
  }).join('');

  sec.innerHTML = `
  <div class="a-card">
    <div class="a-table-wrap">
      <table class="a-table">
        <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Country</th><th>Qty</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="8" class="a-empty">No bulk orders yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;

  sec.querySelectorAll('[data-bulk-id]').forEach(function(sel) {
    sel.addEventListener('change', async function() {
      if (!sel.value) return;
      var res = await supabase.from('bulk_orders').update({status:sel.value}).eq('id',sel.dataset.bulkId);
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Status updated!', 'success');
      loadBulkOrders(container);
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   COUPONS
════════════════════════════════════════════════════════════════ */
async function loadCoupons(container) {
  var sec = container.querySelector('#section-coupons');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var { data: coupons } = await supabase.from('coupons').select('*').order('created_at',{ascending:false});
  coupons = coupons || [];

  var rowsHTML = coupons.map(function(c) {
    var exp = c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'No expiry';
    return '<tr>'
      + '<td style="font-family:var(--font-sub);color:var(--gold-light);letter-spacing:.1em">' + c.code + '</td>'
      + '<td>' + c.type + '</td>'
      + '<td style="color:var(--cream)">' + (c.type === 'percent' ? c.discount_value + '%' : 'Rs.' + c.discount_value) + '</td>'
      + '<td>' + (c.min_order ? 'Rs.' + c.min_order : '--') + '</td>'
      + '<td>' + (c.used_count||0) + ' / ' + (c.max_uses||'unlimited') + '</td>'
      + '<td style="font-size:.75rem;color:rgba(240,224,192,.5)">' + exp + '</td>'
      + '<td><span class="s-badge ' + (c.is_active ? 'active' : 'inactive') + '">'
      + '<span class="s-dot ' + (c.is_active ? 'green' : 'red') + '"></span>'
      + (c.is_active ? 'Active' : 'Inactive') + '</span></td>'
      + '</tr>';
  }).join('');

  sec.innerHTML = `
  <div class="a-card">
    <div class="a-table-wrap">
      <table class="a-table">
        <thead><tr><th>Code</th><th>Type</th><th>Discount</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th></tr></thead>
        <tbody>${rowsHTML || '<tr><td colspan="7" class="a-empty">No coupons yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════════
   OUR STORY (About page content)
════════════════════════════════════════════════════════════════ */
var DEFAULT_STORY = {
  heroTitle: 'From the Spice Gardens of Ceylon',
  heroSub: 'For generations, the highlands of Sri Lanka have gifted the world with the finest spices. Kiththa Grand was born from a deep love for this heritage — to carry the purity of Ceylon spices to every kitchen on earth.',
  originTitle: 'Where Every Spice Tells a Story',
  originParagraphs: ['', '', ''],
  quote: 'The spice trade built empires. We bring that same precious cargo — directly from the island of serendipity — to your table.',
  quoteAttr: 'Kiththa Grand',
  images: [],
};
var storyImages = [];

async function loadStory(container) {
  var sec = container.querySelector('#section-story');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var { data: row } = await supabase.from('settings').select('*').eq('key', 'about_content').maybeSingle();
  var story = DEFAULT_STORY;
  if (row && row.value) {
    try { story = Object.assign({}, DEFAULT_STORY, JSON.parse(row.value)); } catch (e) {}
  }
  storyImages = (story.images || []).slice();

  sec.innerHTML = (
    '<div class="a-card">'
      + '<div class="a-card-hdr"><span class="a-card-title"><i class="fas fa-book-open"></i> Hero</span></div>'
      + '<div class="m-group"><label class="m-label">Hero Title</label><input type="text" class="m-input" id="st-hero-title" value="' + escapeHtmlAttr(story.heroTitle) + '" /></div>'
      + '<div class="m-group"><label class="m-label">Hero Subtitle</label><textarea class="m-input" id="st-hero-sub" rows="3">' + escapeHtmlAttr(story.heroSub) + '</textarea></div>'
    + '</div>'
    + '<div class="a-card" style="margin-top:18px">'
      + '<div class="a-card-hdr"><span class="a-card-title"><i class="fas fa-scroll"></i> Origin Story</span></div>'
      + '<div class="m-group"><label class="m-label">Section Title</label><input type="text" class="m-input" id="st-origin-title" value="' + escapeHtmlAttr(story.originTitle) + '" /></div>'
      + '<div class="m-group"><label class="m-label">Paragraph 1</label><textarea class="m-input" id="st-p1" rows="3">' + escapeHtmlAttr(story.originParagraphs[0] || '') + '</textarea></div>'
      + '<div class="m-group"><label class="m-label">Paragraph 2</label><textarea class="m-input" id="st-p2" rows="3">' + escapeHtmlAttr(story.originParagraphs[1] || '') + '</textarea></div>'
      + '<div class="m-group"><label class="m-label">Paragraph 3</label><textarea class="m-input" id="st-p3" rows="3">' + escapeHtmlAttr(story.originParagraphs[2] || '') + '</textarea></div>'
      + '<div class="m-group"><label class="m-label">Quote</label><textarea class="m-input" id="st-quote" rows="2">' + escapeHtmlAttr(story.quote) + '</textarea></div>'
      + '<div class="m-group"><label class="m-label">Quote Attribution</label><input type="text" class="m-input" id="st-quote-attr" value="' + escapeHtmlAttr(story.quoteAttr) + '" /></div>'
    + '</div>'
    + '<div class="a-card" style="margin-top:18px">'
      + '<div class="a-card-hdr"><span class="a-card-title"><i class="fas fa-images"></i> Story Images</span></div>'
      + '<div class="img-upload-zone" id="st-img-zone">'
        + '<input type="file" class="img-upload-input" id="st-img-input" multiple accept="image/*" />'
        + '<p>Click or drop images here</p>'
      + '</div>'
      + '<div class="img-preview-grid" id="st-img-preview"></div>'
    + '</div>'
    + '<div style="margin-top:18px">'
      + '<button class="a-btn gold" id="btn-save-story"><i class="fas fa-check"></i> Save Story</button>'
    + '</div>'
  );

  function renderStoryImages() {
    var grid = sec.querySelector('#st-img-preview');
    grid.innerHTML = storyImages.map(function(url, i) {
      return '<div class="img-preview-item" style="position:relative;display:inline-block;margin:6px">'
        + '<img src="' + url + '" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:1px solid rgba(200,144,10,.2)" />'
        + '<button type="button" data-rm-img="' + i + '" style="position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:#c0392b;color:white;border:none;cursor:pointer">&times;</button>'
      + '</div>';
    }).join('');
    grid.querySelectorAll('[data-rm-img]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        storyImages.splice(Number(btn.dataset.rmImg), 1);
        renderStoryImages();
      });
    });
  }
  renderStoryImages();

  sec.querySelector('#st-img-input').onchange = function(e) {
    Array.prototype.forEach.call(e.target.files, function(file) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        storyImages.push(ev.target.result);
        renderStoryImages();
      };
      reader.readAsDataURL(file);
    });
  };

  sec.querySelector('#btn-save-story').addEventListener('click', async function() {
    var btn = sec.querySelector('#btn-save-story');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    try {
      var uploadedImages = [];
      for (var i = 0; i < storyImages.length; i++) {
        var img = storyImages[i];
        if (img.indexOf('data:') === 0) {
          var url = await uploadImage(img, 'site');
          if (url) uploadedImages.push(url);
        } else {
          uploadedImages.push(img);
        }
      }
      storyImages = uploadedImages;

      var newStory = {
        heroTitle: sec.querySelector('#st-hero-title').value.trim(),
        heroSub: sec.querySelector('#st-hero-sub').value.trim(),
        originTitle: sec.querySelector('#st-origin-title').value.trim(),
        originParagraphs: [
          sec.querySelector('#st-p1').value.trim(),
          sec.querySelector('#st-p2').value.trim(),
          sec.querySelector('#st-p3').value.trim(),
        ],
        quote: sec.querySelector('#st-quote').value.trim(),
        quoteAttr: sec.querySelector('#st-quote-attr').value.trim(),
        images: uploadedImages,
      };

      var res = await supabase.from('settings').update({ value: JSON.stringify(newStory) }).eq('key', 'about_content');
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Story saved!', 'success');
      renderStoryImages();
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Save Story';
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   SETTINGS
════════════════════════════════════════════════════════════════ */
async function loadSettings(container) {
  var sec = container.querySelector('#section-settings');
  if (!sec) return;
  sec.innerHTML = '<div class="a-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  var { data: settings } = await supabase.from('settings').select('*');
  settings = settings || [];
  settings = settings.filter(function(s) { return s.key.indexOf('about_') !== 0; });

  var fieldsHTML = settings.map(function(s) {
    return '<div class="m-group">'
      + '<label class="m-label">' + s.key.replace(/_/g,' ').toUpperCase() + '</label>'
      + '<input type="text" class="m-input setting-input" data-key="' + s.key + '" value="' + escapeHtmlAttr(s.value || '') + '" />'
      + '</div>';
  }).join('');

  sec.innerHTML = (
    '<div class="a-card">'
      + '<div class="a-card-hdr">'
        + '<span class="a-card-title"><i class="fas fa-cog"></i> Shop Settings</span>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' + fieldsHTML + '</div>'
      + '<div style="margin-top:18px">'
        + '<button class="a-btn gold" id="btn-save-settings"><i class="fas fa-check"></i> Save All Settings</button>'
      + '</div>'
    + '</div>'
  );

  sec.querySelector('#btn-save-settings')?.addEventListener('click', async function() {
    var btn = sec.querySelector('#btn-save-settings');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    var inputs = sec.querySelectorAll('.setting-input');
    var promises = [];
    inputs.forEach(function(inp) {
      promises.push(supabase.from('settings').update({value:inp.value}).eq('key',inp.dataset.key));
    });
    await Promise.all(promises);
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Save All Settings';
    showToast('Settings saved! ✅', 'success');
  });
}

export default init;