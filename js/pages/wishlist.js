/* ================================================================
   KITHTHA GRAND — Wishlist Page
   js/pages/wishlist.js
================================================================ */

import { supabase } from '../supabase.js';
import { router }   from '../router.js';
import { showToast, initReveals, formatPrice, state, addToCart, loadCart } from '../app.js';

/* ── CSS ── */
function injectStyles() {
  if (document.getElementById('wl-styles')) return;
  var s = document.createElement('style');
  s.id = 'wl-styles';
  s.textContent = [
    '.wl-page{max-width:1200px;margin:0 auto;padding:100px 20px 60px}',
    '.wl-header{margin-bottom:32px}',
    '.wl-title{font-family:var(--font-head);font-size:clamp(1.6rem,3vw,2.4rem);color:var(--brown)}',
    '.wl-subtitle{font-family:var(--font-body);color:var(--brown-light);margin-top:6px;font-style:italic}',
    '.wl-layout{display:grid;grid-template-columns:1fr 340px;gap:32px;align-items:start}',
    /* section label */
    '.wl-label{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:16px}',
    /* grid */
    '.wl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}',
    /* card base */
    '.wcard{background:white;border-radius:16px;border:1px solid var(--cream-dark);overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s}',
    '.wcard:hover{transform:translateY(-3px);border-color:var(--gold);box-shadow:0 8px 24px rgba(200,144,10,.15)}',
    '.wcard.removing{opacity:0;transform:scale(.95);transition:opacity .28s,transform .28s}',
    /* card image */
    '.wc-img-wrap{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--cream)}',
    '.wc-img{width:100%;height:100%;object-fit:cover}',
    '.wc-emoji{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3.5rem}',
    '.wc-badge{position:absolute;top:10px;left:10px;background:var(--gold);color:white;font-family:var(--font-sub);font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:99px}',
    '.wc-remove{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.75rem;color:var(--brown-light);transition:var(--transition)}',
    '.wc-remove:hover{background:var(--red);color:white}',
    '.wc-saved{position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.5);color:white;font-family:var(--font-sub);font-size:.5rem;letter-spacing:.06em;padding:2px 7px;border-radius:99px}',
    /* card body */
    '.wc-body{padding:14px}',
    '.wc-cat{font-family:var(--font-sub);font-size:.55rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:4px}',
    '.wc-name{font-family:Georgia,serif;font-size:.95rem;color:var(--brown);font-weight:bold;line-height:1.3;margin-bottom:2px}',
    '.wc-si{font-family:var(--font-body);font-size:.78rem;color:var(--brown-light);font-style:italic;margin-bottom:10px;min-height:1.2em}',
    '.wc-footer{display:flex;align-items:center;justify-content:space-between;gap:8px}',
    '.wc-price{font-family:Georgia,serif;font-size:1rem;color:var(--red);font-weight:bold}',
    '.wc-atc{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;padding:6px 12px;border-radius:99px;background:var(--red);color:white;border:none;cursor:pointer;transition:var(--transition);white-space:nowrap;flex-shrink:0}',
    '.wc-atc:hover{background:var(--red-dark)}',
    '.wc-atc.added{background:#2a5c3f}',
    /* summary panel */
    '.wl-panel{position:sticky;top:90px}',
    '.wl-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}',
    '.wl-stat{background:white;border:1px solid var(--cream-dark);border-radius:14px;padding:16px;text-align:center}',
    '.wl-stat-n{font-family:Georgia,serif;font-size:1.3rem;color:var(--red);font-weight:bold}',
    '.wl-stat-l{font-family:var(--font-sub);font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown-light);margin-top:4px}',
    /* items list */
    '.wl-items-box{background:white;border:1px solid var(--cream-dark);border-radius:14px;padding:16px;margin-bottom:16px}',
    '.wl-items-title{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}',
    '.wl-items-list{max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}',
    '.wl-item-row{display:flex;align-items:center;gap:10px}',
    '.wl-item-emo{width:36px;height:36px;border-radius:8px;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;overflow:hidden}',
    '.wl-item-emo img{width:100%;height:100%;object-fit:cover}',
    '.wl-item-info{flex:1;min-width:0}',
    '.wl-item-name{font-family:var(--font-sub);font-size:.72rem;color:var(--brown);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.wl-item-price{font-family:Georgia,serif;font-size:.72rem;color:var(--red)}',
    '.wl-item-rm{background:none;border:none;cursor:pointer;color:var(--brown-light);font-size:.75rem;padding:4px;transition:color .2s;flex-shrink:0}',
    '.wl-item-rm:hover{color:var(--red)}',
    /* promo */
    '.wl-promo{background:#1a3d2b;border-radius:14px;padding:18px;margin-bottom:16px;color:white}',
    '.wl-promo-title{font-family:var(--font-sub);font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:#6fcf97;margin-bottom:6px}',
    '.wl-promo-text{font-family:var(--font-body);font-size:.85rem;font-style:italic;margin-bottom:12px}',
    '.wl-code-row{display:flex;align-items:center;gap:8px}',
    '.wl-code{font-family:monospace;font-size:.85rem;background:rgba(255,255,255,.12);padding:6px 12px;border-radius:8px;letter-spacing:.1em;flex:1;text-align:center}',
    '.wl-copy-btn{background:rgba(255,255,255,.15);border:none;color:white;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:.75rem;transition:background .2s;white-space:nowrap}',
    '.wl-copy-btn:hover{background:rgba(255,255,255,.25)}',
    /* actions */
    '.wl-actions{display:flex;flex-direction:column;gap:10px}',
    '.wl-btn{width:100%;padding:14px;border-radius:12px;border:none;cursor:pointer;font-family:var(--font-sub);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;transition:var(--transition)}',
    '.wl-btn-primary{background:var(--red);color:white;box-shadow:0 4px 16px rgba(139,37,0,.25)}',
    '.wl-btn-primary:hover{background:var(--red-dark);transform:translateY(-1px)}',
    '.wl-btn-primary.done{background:#2a5c3f}',
    '.wl-btn-secondary{background:white;color:var(--brown);border:1px solid var(--cream-dark)}',
    '.wl-btn-secondary:hover{border-color:var(--gold);color:var(--red)}',
    '.wl-btn-danger{background:transparent;color:var(--brown-light);border:1px solid var(--cream-dark)}',
    '.wl-btn-danger:hover{border-color:#e53e3e;color:#e53e3e}',
    /* empty */
    '.wl-empty{text-align:center;padding:80px 20px}',
    '.wl-empty-icon{font-size:4rem;margin-bottom:20px}',
    '.wl-empty-title{font-family:var(--font-head);font-size:1.5rem;color:var(--brown);margin-bottom:8px}',
    '.wl-empty-sub{font-family:var(--font-body);color:var(--brown-light);font-style:italic;margin-bottom:28px}',
    /* skeleton */
    '.wl-skeleton-card{background:white;border-radius:16px;overflow:hidden;border:1px solid var(--cream-dark)}',
    '.wl-skel{background:linear-gradient(90deg,var(--cream) 25%,var(--cream-dark) 50%,var(--cream) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:6px}',
    '.wl-skel-img{height:160px;border-radius:0}',
    '.wl-skel-body{padding:14px;display:flex;flex-direction:column;gap:8px}',
    /* responsive */
    '@media(max-width:1024px){',
      '.wl-layout{grid-template-columns:1fr}',
      '.wl-panel{position:static}',
      '.wl-grid{grid-template-columns:repeat(2,1fr)}',
    '}',
    '@media(max-width:520px){',
      '.wl-page{padding:88px 16px 40px}',
      '.wl-grid{grid-template-columns:1fr;gap:12px}',
      '.wcard{display:flex;flex-direction:row;align-items:stretch}',
      '.wc-img-wrap{width:110px;min-width:110px;aspect-ratio:auto;border-radius:0;min-height:110px}',
      '.wc-body{flex:1}',
    '}',
  ].join('');
  document.head.appendChild(s);
}

/* ── Module-level items state ── */
var currentItems = [];

/* ── Helpers ── */
function daysAgo(str) {
  if (!str) return '';
  var d = Math.floor((Date.now() - new Date(str).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  return d + ' days ago';
}

function imgOrEmoji(images, name) {
  if (images && images.length) {
    return '<img class="wc-img" src="' + images[0] + '" alt="' + (name || '') + '" loading="lazy">';
  }
  return '<div class="wc-emoji">🌶️</div>';
}

function thumbOrEmoji(images, name) {
  if (images && images.length) {
    return '<img src="' + images[0] + '" alt="' + (name || '') + '" loading="lazy">';
  }
  return '🌶️';
}

/* ── Skeleton card ── */
function skelCard() {
  return '<div class="wl-skeleton-card">'
    + '<div class="wl-skel wl-skel-img"></div>'
    + '<div class="wl-skel-body">'
    + '<div class="wl-skel" style="height:9px;width:40%"></div>'
    + '<div class="wl-skel" style="height:13px;width:80%"></div>'
    + '<div class="wl-skel" style="height:9px;width:60%"></div>'
    + '</div>'
    + '</div>';
}

/* ── Data: two-step query (no FK joins) ── */
async function loadData() {
  if (!state.user) return [];

  var savedRes = await supabase
    .from('saved_items')
    .select('id, product_id, created_at')
    .eq('user_id', state.user.id)
    .order('created_at', { ascending: false });

  var saved = savedRes.data || [];
  if (!saved.length) return [];

  var ids = saved.map(function(s) { return s.product_id; });

  var prodsRes = await supabase
    .from('products')
    .select('id, name, name_si, price_lkr, weight_grams, images, is_featured, category_id')
    .in('id', ids);
  var prods = prodsRes.data || [];

  var catIds = [];
  prods.forEach(function(p) {
    if (p.category_id && catIds.indexOf(p.category_id) < 0) catIds.push(p.category_id);
  });

  var catMap = {};
  if (catIds.length) {
    var catsRes = await supabase.from('categories').select('id, name').in('id', catIds);
    (catsRes.data || []).forEach(function(c) { catMap[c.id] = c.name; });
  }

  var prodMap = {};
  prods.forEach(function(p) { prodMap[p.id] = p; });

  return saved
    .map(function(s) {
      var p = prodMap[s.product_id];
      if (!p) return null;
      return {
        id: s.id,
        product_id: s.product_id,
        created_at: s.created_at,
        product: p,
        catName: catMap[p.category_id] || ''
      };
    })
    .filter(function(x) { return x !== null; });
}

/* ── Build product card element ── */
function buildCard(item) {
  var p = item.product;
  var siParts = [];
  if (p.name_si) siParts.push(p.name_si);
  if (p.weight_grams) siParts.push(p.weight_grams + 'g');
  var siLine = siParts.join(' \xB7 ');

  var el = document.createElement('div');
  el.className = 'wcard reveal';
  el.dataset.savedId = item.id;
  el.dataset.productId = item.product_id;

  el.innerHTML = ''
    + '<div class="wc-img-wrap">'
    +   imgOrEmoji(p.images, p.name)
    +   (p.is_featured ? '<span class="wc-badge">Featured</span>' : '')
    +   '<button class="wc-remove" data-remove="' + item.id + '" title="Remove from wishlist" aria-label="Remove">'
    +     '<i class="fas fa-times"></i>'
    +   '</button>'
    +   '<span class="wc-saved">' + daysAgo(item.created_at) + '</span>'
    + '</div>'
    + '<div class="wc-body">'
    +   '<div class="wc-cat">' + (item.catName || 'Spices') + '</div>'
    +   '<div class="wc-name">' + (p.name || '') + '</div>'
    +   '<div class="wc-si">' + siLine + '</div>'
    +   '<div class="wc-footer">'
    +     '<span class="wc-price">' + formatPrice(p.price_lkr || 0) + '</span>'
    +     '<button class="wc-atc" data-atc="' + item.product_id + '">Add to Cart</button>'
    +   '</div>'
    + '</div>';

  return el;
}

/* ── Build summary panel HTML ── */
function buildPanel(items) {
  var total = 0;
  items.forEach(function(item) { total += parseFloat(item.product.price_lkr || 0); });
  var pts = Math.round(total * 0.033);
  var count = items.length;

  var listRows = '';
  items.forEach(function(item) {
    var p = item.product;
    listRows += '<div class="wl-item-row" data-row="' + item.id + '">'
      + '<div class="wl-item-emo">' + thumbOrEmoji(p.images, p.name) + '</div>'
      + '<div class="wl-item-info">'
      +   '<div class="wl-item-name">' + (p.name || '') + '</div>'
      +   '<div class="wl-item-price">' + formatPrice(p.price_lkr || 0) + '</div>'
      + '</div>'
      + '<button class="wl-item-rm" data-remove="' + item.id + '" title="Remove" aria-label="Remove">'
      +   '<i class="fas fa-times"></i>'
      + '</button>'
      + '</div>';
  });

  return ''
    + '<div class="wl-stats">'
    +   '<div class="wl-stat">'
    +     '<div class="wl-stat-n" id="wl-total">' + formatPrice(total) + '</div>'
    +     '<div class="wl-stat-l">Total Value</div>'
    +   '</div>'
    +   '<div class="wl-stat">'
    +     '<div class="wl-stat-n" id="wl-pts">' + pts.toLocaleString() + '</div>'
    +     '<div class="wl-stat-l">Est. Points</div>'
    +   '</div>'
    + '</div>'
    + '<div class="wl-items-box">'
    +   '<div class="wl-items-title">' + count + ' ' + (count === 1 ? 'item' : 'items') + ' saved</div>'
    +   '<div class="wl-items-list" id="wl-list">' + listRows + '</div>'
    + '</div>'
    + '<div class="wl-promo">'
    +   '<div class="wl-promo-title">Members Save More</div>'
    +   '<div class="wl-promo-text">Members get 10% off your first order!</div>'
    +   '<div class="wl-code-row">'
    +     '<div class="wl-code">SPICE10</div>'
    +     '<button class="wl-copy-btn" id="wl-copy">Copy</button>'
    +   '</div>'
    + '</div>'
    + '<div class="wl-actions">'
    +   '<button class="wl-btn wl-btn-primary" id="wl-add-all"><i class="fas fa-cart-plus"></i> Add All to Cart</button>'
    +   '<button class="wl-btn wl-btn-secondary" id="wl-share"><i class="fas fa-share-alt"></i> Share Wishlist</button>'
    +   '<button class="wl-btn wl-btn-danger" id="wl-clear">Clear All</button>'
    + '</div>';
}

/* ── Refresh stats after removal ── */
function refreshStats() {
  var total = 0;
  currentItems.forEach(function(item) { total += parseFloat(item.product.price_lkr || 0); });
  var totalEl = document.getElementById('wl-total');
  var ptsEl   = document.getElementById('wl-pts');
  if (totalEl) totalEl.textContent = formatPrice(total);
  if (ptsEl)   ptsEl.textContent   = Math.round(total * 0.033).toLocaleString();
}

/* ── Remove a single item ── */
async function removeItem(savedId) {
  var sid = String(savedId);

  // Animate card out
  var card = document.querySelector('.wcard[data-saved-id="' + sid + '"]');
  if (card) {
    card.classList.add('removing');
    await new Promise(function(r) { setTimeout(r, 300); });
    card.remove();
  }

  // Remove panel row
  var row = document.querySelector('[data-row="' + sid + '"]');
  if (row) row.remove();

  // DB delete
  await supabase.from('saved_items').delete().eq('id', sid);

  // Update module state + global wishlist state
  var gone = null;
  for (var i = 0; i < currentItems.length; i++) {
    if (String(currentItems[i].id) === sid) { gone = currentItems[i]; break; }
  }
  currentItems = currentItems.filter(function(x) { return String(x.id) !== sid; });
  if (gone && state.wishlist) {
    state.wishlist = state.wishlist.filter(function(id) { return id !== gone.product_id; });
  }

  refreshStats();

  if (!currentItems.length) showEmpty();
}

/* ── Show empty state ── */
function showEmpty() {
  var grid  = document.getElementById('wl-grid');
  var panel = document.getElementById('wl-panel');

  if (grid) {
    grid.innerHTML = '<div class="wl-empty">'
      + '<div class="wl-empty-icon">&#10084;&#65039;</div>'
      + '<div class="wl-empty-title">Your wishlist is empty</div>'
      + '<div class="wl-empty-sub">Browse our spices and save your favourites</div>'
      + '<button class="btn-primary" id="wl-browse"><span>Explore Spices</span>'
      + ' <i class="fas fa-arrow-right"></i></button>'
      + '</div>';
    var btn = document.getElementById('wl-browse');
    if (btn) btn.addEventListener('click', function() { router.go('products'); });
  }

  if (panel) panel.style.display = 'none';
}

/* ── Bind panel button events ── */
function bindPanelEvents() {
  // Copy promo code
  var copyBtn = document.getElementById('wl-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      if (!navigator.clipboard) { showToast('Use code: SPICE10', 'success'); return; }
      navigator.clipboard.writeText('SPICE10').then(function() {
        showToast('Code SPICE10 copied!', 'success');
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy'; }, 2000);
      });
    });
  }

  // Add all to cart
  var addAllBtn = document.getElementById('wl-add-all');
  if (addAllBtn) {
    addAllBtn.addEventListener('click', function() {
      if (!state.user) { router.go('login'); return; }
      addAllBtn.disabled = true;
      addAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

      var tasks = currentItems.map(function(item) {
        return addToCart(item.product_id).catch(function() {});
      });

      Promise.all(tasks).then(function() {
        return loadCart();
      }).then(function() {
        document.querySelectorAll('.wc-atc').forEach(function(b) {
          b.textContent = 'Added ✓';
          b.classList.add('added');
        });
        addAllBtn.innerHTML = '<i class="fas fa-check"></i> All Added!';
        addAllBtn.classList.add('done');
        showToast('All items added to cart!', 'success');
      });
    });
  }

  // Share wishlist
  var shareBtn = document.getElementById('wl-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href)
          .then(function() { showToast('Wishlist link copied!', 'success'); })
          .catch(function() { showToast('Copy the URL from your browser', 'info'); });
      } else {
        showToast('Copy the URL from your browser', 'info');
      }
    });
  }

  // Clear all
  var clearBtn = document.getElementById('wl-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (!confirm('Remove all items from your wishlist?')) return;
      clearBtn.disabled = true;
      supabase.from('saved_items').delete().eq('user_id', state.user.id).then(function() {
        currentItems = [];
        if (state.wishlist) state.wishlist = [];
        showEmpty();
      });
    });
  }

  // Panel item removes (delegated)
  var listEl = document.getElementById('wl-list');
  if (listEl) {
    listEl.addEventListener('click', function(e) {
      var rm = e.target.closest('[data-remove]');
      if (rm) removeItem(rm.dataset.remove);
    });
  }
}

/* ================================================================
   INIT
================================================================ */
export async function init(container) {
  injectStyles();

  if (!state.user) { router.go('login'); return; }

  // Skeleton
  container.innerHTML = '<div class="wl-page">'
    + '<div class="wl-header"><h1 class="wl-title">My Wishlist</h1></div>'
    + '<div class="wl-layout">'
    +   '<div>'
    +     '<div class="wl-label">Saved Spices</div>'
    +     '<div class="wl-grid" id="wl-grid">'
    +       skelCard() + skelCard() + skelCard()
    +       + skelCard() + skelCard() + skelCard()
    +     '</div>'
    +   '</div>'
    +   '<div id="wl-panel">'
    +     '<div class="wl-skel" style="height:90px;border-radius:14px;margin-bottom:16px"></div>'
    +     '<div class="wl-skel" style="height:240px;border-radius:14px"></div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  // Fetch data
  var items = await loadData();
  currentItems = items;

  var grid  = document.getElementById('wl-grid');
  var panel = document.getElementById('wl-panel');

  // Empty state
  if (!items.length) {
    if (grid) grid.innerHTML = '<div class="wl-empty">'
      + '<div class="wl-empty-icon">&#10084;&#65039;</div>'
      + '<div class="wl-empty-title">Your wishlist is empty</div>'
      + '<div class="wl-empty-sub">Browse our spices and save your favourites</div>'
      + '<button class="btn-primary" id="wl-browse"><span>Explore Spices</span>'
      + ' <i class="fas fa-arrow-right"></i></button>'
      + '</div>';
    var br = document.getElementById('wl-browse');
    if (br) br.addEventListener('click', function() { router.go('products'); });
    if (panel) panel.style.display = 'none';
    return;
  }

  // Update header with count
  var header = container.querySelector('.wl-header');
  if (header) header.innerHTML = '<h1 class="wl-title reveal">My Wishlist</h1>'
    + '<p class="wl-subtitle reveal">'
    + items.length + ' ' + (items.length === 1 ? 'spice' : 'spices') + ' saved'
    + '</p>';

  // Render cards
  if (grid) {
    grid.innerHTML = '';
    items.forEach(function(item) { grid.appendChild(buildCard(item)); });

    // Grid events (delegated)
    grid.addEventListener('click', function(e) {
      var rm = e.target.closest('[data-remove]');
      if (rm) { removeItem(rm.dataset.remove); return; }

      var atc = e.target.closest('[data-atc]');
      if (atc && !atc.disabled) {
        atc.disabled = true;
        addToCart(atc.dataset.atc)
          .then(function() {
            atc.textContent = 'Added ✓';
            atc.classList.add('added');
            showToast('Added to cart! 🛒', 'success');
            loadCart();
          })
          .catch(function() { atc.disabled = false; });
      }
    });
  }

  // Render panel
  if (panel) {
    panel.innerHTML = buildPanel(items);
    bindPanelEvents();
  }

  initReveals();
}

export default init;