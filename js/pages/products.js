/* ================================================================
   KITHTHA GRAND — Products Page
   js/pages/products.js
   Features: Category filter · Price sort · Search · Grid view
================================================================ */

import { supabase }                                         from '../supabase.js';
import { router }                                           from '../router.js';
import { showToast, formatPrice, initReveals,
         addToCart, toggleWishlist, state }                 from '../app.js';

/* ── CSS ── */
const PRODUCTS_CSS = [
  /* Page wrapper */
  '.products-page{min-height:100vh;background:var(--cream)}',

  /* Hero banner */
  '.products-hero{background:#0a0502;padding:72px 0 28px;position:relative;overflow:hidden}',
  '.products-hero-bg{position:absolute;inset:0;background:'
    + 'radial-gradient(ellipse at 30% 50%,rgba(139,37,0,.85) 0%,rgba(61,28,2,.95) 60%,#0a0502 100%)}',
  '.products-hero-overlay{position:absolute;inset:0;background-image:'
    + 'repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(200,144,10,.03) 40px,rgba(200,144,10,.03) 80px)}',
  '.products-hero .container{position:relative;z-index:1}',
  '.products-hero-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.24em;',
    'text-transform:uppercase;color:var(--gold);margin-bottom:12px}',
  '.products-hero h1{font-family:var(--font-head);font-size:clamp(1.7rem,4vw,3rem);',
    'color:var(--cream);margin-bottom:8px;line-height:1.2}',
  '.products-hero p{font-size:.9rem;color:rgba(253,243,227,.55);font-style:italic}',

  /* Sticky toolbar */
  '.products-toolbar{background:white;border-bottom:1px solid var(--cream-dark);',
    'padding:14px 0;position:sticky;top:72px;z-index:40;',
    'box-shadow:0 2px 16px rgba(61,28,2,.07)}',
  '.toolbar-inner{display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
  '.toolbar-search{flex:1;min-width:180px;position:relative}',
  '.toolbar-search input{width:100%;padding:9px 14px 9px 38px;',
    'border:1.5px solid var(--cream-dark);border-radius:99px;',
    'font-family:var(--font-body);font-size:.88rem;',
    'background:var(--cream);color:var(--brown);transition:.2s;outline:none}',
  '.toolbar-search input:focus{border-color:var(--gold);background:white}',
  '.toolbar-search i{position:absolute;left:13px;top:50%;transform:translateY(-50%);',
    'color:var(--brown-light);font-size:.8rem;pointer-events:none}',
  '.toolbar-sort select{padding:9px 14px;border:1.5px solid var(--cream-dark);',
    'border-radius:99px;font-family:var(--font-sub);font-size:.73rem;',
    'letter-spacing:.06em;background:var(--cream);color:var(--brown);',
    'cursor:pointer;outline:none;transition:.2s}',
  '.toolbar-sort select:focus{border-color:var(--gold)}',
  '.toolbar-count{font-family:var(--font-sub);font-size:.68rem;letter-spacing:.1em;',
    'color:var(--brown-light);white-space:nowrap;padding:0 4px}',

  /* Category pills row */
  '.cat-pills-wrap{background:white;border-bottom:1px solid var(--cream-dark);padding:0}',
  '.cat-pills-inner{overflow-x:auto;scrollbar-width:none;padding:12px 0}',
  '.cat-pills-inner::-webkit-scrollbar{display:none}',
  '.cat-pills-track{display:flex;gap:8px;width:max-content;padding:0 var(--container-pad,16px)}',
  '.cat-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 18px;',
    'border-radius:99px;font-family:var(--font-sub);font-size:.7rem;',
    'letter-spacing:.08em;text-transform:uppercase;cursor:pointer;',
    'border:1.5px solid var(--cream-dark);background:white;',
    'color:var(--brown-light);transition:.2s;white-space:nowrap}',
  '.cat-pill:hover{border-color:var(--gold);color:var(--brown)}',
  '.cat-pill.active{background:var(--red);border-color:var(--red);color:white}',

  /* Products area */
  '.products-area{padding:36px 0 72px}',
  '.products-result-bar{display:flex;align-items:center;justify-content:space-between;',
    'margin-bottom:24px}',
  '.products-result-label{font-family:var(--font-sub);font-size:.72rem;',
    'letter-spacing:.1em;color:var(--brown-light)}',
  '.products-result-label strong{color:var(--red)}',

  /* Empty state */
  '.products-empty{text-align:center;padding:80px 20px;grid-column:1/-1}',
  '.products-empty .ei{font-size:4rem;margin-bottom:20px}',
  '.products-empty h3{font-family:var(--font-sub);font-size:1rem;',
    'color:var(--brown);margin-bottom:10px;letter-spacing:.06em}',
  '.products-empty p{font-size:.88rem;color:var(--brown-light);font-style:italic}',

  /* Out of stock badge override */
  '.badge-oos{background:rgba(61,28,2,.75) !important;color:var(--cream-dark) !important;',
    'left:auto !important;right:50px !important}',

  /* Load more */
  '.products-load-more{text-align:center;margin-top:48px;grid-column:1/-1}',
  '.btn-load-more{display:inline-flex;align-items:center;gap:10px;padding:13px 38px;',
    'border:2px solid var(--red);color:var(--red);border-radius:99px;',
    'font-family:var(--font-sub);font-size:.76rem;letter-spacing:.13em;',
    'text-transform:uppercase;cursor:pointer;transition:.2s;background:transparent}',
  '.btn-load-more:hover{background:var(--red);color:white}',
  '.btn-load-more:disabled{opacity:.5;cursor:not-allowed}',

  /* Responsive */
  '@media(max-width:768px){',
    '.products-hero{padding:88px 0 36px}',
    '.products-toolbar{top:64px}',
    '.toolbar-inner{gap:8px}',
  '}',
  '@media(max-width:480px){',
    '.toolbar-search{min-width:100%;order:-1}',
    '.products-hero h1{font-size:1.55rem}',
  '}',
].join('');

/* ── Page-level state ── */
var activeCategory = 'all';
var activeSort     = 'default';
var searchQuery    = '';
var pageOffset     = 0;
var pageLimit      = 12;
var totalCount     = 0;
var allCats        = [];

/* ── Shell HTML ── */
function buildShell() {
  return '<div class="products-page">'

    /* Hero */
    + '<div class="products-hero">'
    + '<div class="products-hero-bg"></div>'
    + '<div class="products-hero-overlay"></div>'
    + '<div class="container">'
    + '<p class="products-hero-eyebrow">Pure Ceylon Collection</p>'
    + '<h1>Our Spices</h1>'
    + '<p>Hand-picked from the highlands &middot; Delivered worldwide</p>'
    + '</div>'
    + '</div>'

    /* Toolbar */
    + '<div class="products-toolbar">'
    + '<div class="container">'
    + '<div class="toolbar-inner">'
    + '<div class="toolbar-search">'
    + '<i class="fas fa-search"></i>'
    + '<input type="text" id="prod-search" placeholder="Search spices..." autocomplete="off" />'
    + '</div>'
    + '<div class="toolbar-sort">'
    + '<select id="prod-sort">'
    + '<option value="default">Sort: Featured</option>'
    + '<option value="price_asc">Price: Low to High</option>'
    + '<option value="price_desc">Price: High to Low</option>'
    + '<option value="name_asc">Name: A to Z</option>'
    + '<option value="name_desc">Name: Z to A</option>'
    + '</select>'
    + '</div>'
    + '<span class="toolbar-count" id="prod-count">Loading...</span>'
    + '</div>'
    + '</div>'
    + '</div>'

    /* Category pills */
    + '<div class="cat-pills-wrap">'
    + '<div class="container">'
    + '<div class="cat-pills-inner">'
    + '<div class="cat-pills-track" id="cat-pills-track"></div>'
    + '</div>'
    + '</div>'
    + '</div>'

    /* Products grid */
    + '<div class="container">'
    + '<div class="products-area">'
    + '<div class="products-result-bar">'
    + '<span class="products-result-label" id="prod-result-label">&nbsp;</span>'
    + '</div>'
    + '<div id="products-grid" class="products-grid">'
    + buildSkeletons(6)
    + '</div>'
    + '</div>'
    + '</div>'

    + '</div>';
}

function buildSkeletons(n) {
  var html = '';
  for (var i = 0; i < n; i++) html += '<div class="product-skeleton"></div>';
  return html;
}

/* ── Category pills ── */
function renderCatPills(container) {
  var track = container.querySelector('#cat-pills-track');
  if (!track) return;

  var html = '<button class="cat-pill' + (activeCategory === 'all' ? ' active' : '')
    + '" data-cat="all">All Spices</button>';

  for (var i = 0; i < allCats.length; i++) {
    var c = allCats[i];
    html += '<button class="cat-pill'
      + (activeCategory === c.slug ? ' active' : '')
      + '" data-cat="' + c.slug + '">'
      + c.name
      + '</button>';
  }

  track.innerHTML = html;
}

/* ── Single product card HTML ── */
function renderCard(p) {
  var imgHTML = (p.images && p.images[0])
    ? '<img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy" />'
    : '<span style="font-size:3.5rem">🌶️</span>';

  var wished = state.wishlist.includes(p.id);
  var oos    = (p.stock !== null && p.stock !== undefined) ? p.stock <= 0 : false;

  var badges = '';
  if (p.is_featured && !oos) badges += '<span class="product-badge">Featured</span>';
  if (oos)                    badges += '<span class="product-badge badge-oos">Out of Stock</span>';

  var addDisabled = oos ? ' disabled style="opacity:.4;cursor:not-allowed"' : '';

  return '<div class="product-card" data-id="' + p.id + '">'
    + '<div class="product-img">'
    + imgHTML
    + badges
    + '<button class="product-wish" data-wish="' + p.id + '" aria-label="Wishlist">'
    + '<i class="' + (wished ? 'fas' : 'far') + ' fa-heart"></i>'
    + '</button>'
    + '</div>'
    + '<div class="product-info">'
    + '<p class="product-cat">' + (p.category ? p.category.name : 'Spices') + '</p>'
    + '<h3 class="product-name">' + p.name + '</h3>'
    + '<p class="product-weight">' + p.weight_grams + 'g &middot; Sri Lanka</p>'
    + '<div class="product-footer">'
    + '<span class="product-price" data-lkr="' + p.price_lkr + '">'
    + formatPrice(p.price_lkr)
    + '</span>'
    + '<button class="product-add" data-add="' + p.id + '" aria-label="Add to cart"' + addDisabled + '>'
    + '<i class="fas fa-plus"></i>'
    + '</button>'
    + '</div>'
    + '</div>'
    + '</div>';
}

/* ── Load & render products ── */
async function loadProducts(container, append) {
  var grid      = container.querySelector('#products-grid');
  var countEl   = container.querySelector('#prod-count');
  var labelEl   = container.querySelector('#prod-result-label');
  if (!grid) return;

  if (!append) {
    grid.innerHTML = buildSkeletons(6);
    pageOffset = 0;
  }

  try {
    var query = supabase
      .from('products')
      .select('id,name,name_si,price_lkr,weight_grams,stock,images,is_featured,category_id,category:categories(name,slug)', { count: 'exact' })
      .eq('is_active', true);

    /* Category filter */
    if (activeCategory !== 'all') {
      var cat = null;
      for (var i = 0; i < allCats.length; i++) {
        if (allCats[i].slug === activeCategory) { cat = allCats[i]; break; }
      }
      if (cat) query = query.eq('category_id', cat.id);
    }

    /* Search */
    if (searchQuery) {
      query = query.ilike('name', '%' + searchQuery + '%');
    }

    /* Sort */
    if      (activeSort === 'price_asc')  query = query.order('price_lkr', { ascending: true });
    else if (activeSort === 'price_desc') query = query.order('price_lkr', { ascending: false });
    else if (activeSort === 'name_asc')   query = query.order('name',      { ascending: true });
    else if (activeSort === 'name_desc')  query = query.order('name',      { ascending: false });
    else                                  query = query.order('is_featured', { ascending: false });

    /* Pagination */
    query = query.range(pageOffset, pageOffset + pageLimit - 1);

    var result   = await query;
    var products = result.data || [];
    totalCount   = result.count || 0;

    if (!append) {
      if (!products.length) {
        grid.innerHTML = '<div class="products-empty">'
          + '<div class="ei">🌶️</div>'
          + '<h3>No spices found</h3>'
          + '<p>Try a different category or search term</p>'
          + '</div>';
      } else {
        var html = '';
        for (var j = 0; j < products.length; j++) html += renderCard(products[j]);
        html += '<div class="products-load-more" id="load-more-wrap" style="display:none">'
          + '<button class="btn-load-more" id="btn-load-more">'
          + '<i class="fas fa-plus"></i> Load More'
          + '</button>'
          + '</div>';
        grid.innerHTML = html;
        wireLoadMore(container);
      }
    } else {
      /* Append mode — insert before load-more wrapper */
      var loadWrap = grid.querySelector('#load-more-wrap');
      var frag = '';
      for (var k = 0; k < products.length; k++) frag += renderCard(products[k]);
      if (loadWrap) {
        loadWrap.insertAdjacentHTML('beforebegin', frag);
      } else {
        grid.insertAdjacentHTML('beforeend', frag);
      }
    }

    /* Update counters */
    pageOffset += products.length;
    if (countEl) {
      countEl.textContent = totalCount + ' product' + (totalCount === 1 ? '' : 's');
    }
    if (labelEl && totalCount > 0) {
      labelEl.innerHTML = 'Showing <strong>' + Math.min(pageOffset, totalCount) + '</strong> of <strong>' + totalCount + '</strong>';
    }

    /* Load more visibility */
    var lw = grid.querySelector('#load-more-wrap');
    if (lw) lw.style.display = (pageOffset < totalCount) ? 'block' : 'none';

    initReveals();

  } catch (err) {
    console.error('[Products] Load error:', err);
    if (!append) {
      grid.innerHTML = '<div class="products-empty">'
        + '<div class="ei">😞</div>'
        + '<h3>Could not load products</h3>'
        + '<p>Please refresh and try again</p>'
        + '</div>';
    }
  }
}

/* ── Wire load-more button ── */
function wireLoadMore(container) {
  var grid = container.querySelector('#products-grid');
  if (!grid) return;
  grid.addEventListener('click', function(e) {
    var btn = e.target.closest('#btn-load-more');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    loadProducts(container, true).then(function() {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-plus"></i> Load More';
    });
  });
}

/* ── Event delegation for card interactions ── */
function wireGrid(container) {
  var grid = container.querySelector('#products-grid');
  if (!grid) return;

  grid.addEventListener('click', function(e) {
    /* Add to cart */
    var addBtn = e.target.closest('[data-add]');
    if (addBtn && !addBtn.disabled) {
      e.stopPropagation();
      addToCart(addBtn.dataset.add);
      return;
    }

    /* Wishlist toggle */
    var wishBtn = e.target.closest('[data-wish]');
    if (wishBtn) {
      e.stopPropagation();
      var pid = wishBtn.dataset.wish;
      toggleWishlist(pid).then(function() {
        var icon = wishBtn.querySelector('i');
        if (icon) icon.className = state.wishlist.includes(pid) ? 'fas fa-heart' : 'far fa-heart';
      });
      return;
    }

    /* Navigate to product detail */
    var card = e.target.closest('.product-card');
    if (card && card.dataset.id) {
      router.go('product', { id: card.dataset.id });
    }
  });
}

/* ── Init ── */
export async function init(container, params) {
  /* Reset state on each visit */
  activeCategory = (params && params.cat) ? params.cat : 'all';
  activeSort     = 'default';
  searchQuery    = '';
  pageOffset     = 0;
  totalCount     = 0;

  /* Inject CSS once */
  if (!document.getElementById('products-css')) {
    var style       = document.createElement('style');
    style.id        = 'products-css';
    style.textContent = PRODUCTS_CSS;
    document.head.appendChild(style);
  }

  /* Render shell */
  container.innerHTML = buildShell();

  /* Wire grid delegation (once per page render) */
  wireGrid(container);

  /* Fetch categories */
  var catRes = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order');
  allCats = catRes.data || [];

  /* Render pills */
  renderCatPills(container);

  /* Category pill clicks — delegated on the track */
  var track = container.querySelector('#cat-pills-track');
  if (track) {
    track.addEventListener('click', function(e) {
      var pill = e.target.closest('.cat-pill');
      if (!pill) return;
      activeCategory = pill.dataset.cat;
      pageOffset = 0;
      renderCatPills(container);
      loadProducts(container, false);
    });
  }

  /* Sort change */
  var sortEl = container.querySelector('#prod-sort');
  if (sortEl) {
    sortEl.addEventListener('change', function() {
      activeSort = sortEl.value;
      pageOffset = 0;
      loadProducts(container, false);
    });
  }

  /* Search with debounce */
  var searchEl  = container.querySelector('#prod-search');
  var debounceT = null;
  if (searchEl) {
    searchEl.addEventListener('input', function() {
      clearTimeout(debounceT);
      debounceT = setTimeout(function() {
        searchQuery = searchEl.value.trim();
        pageOffset  = 0;
        loadProducts(container, false);
      }, 350);
    });
  }

  /* Initial load */
  await loadProducts(container, false);
}

export default init;
