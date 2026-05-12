/* ================================================================
   KITHTHA GRAND — Wishlist Page
   js/pages/wishlist.js
================================================================ */

import { supabase }                                     from '../supabase.js';
import { router }                                       from '../router.js';
import { showToast, formatPrice, loadWishlist,
         toggleWishlist, addToCart, initReveals, state } from '../app.js';

const CSS = [
  '.wish-page{min-height:100vh;background:var(--cream)}',

  /* hero */
  '.wish-hero{background:#0a0502;padding:120px 0 72px;position:relative;overflow:hidden}',
  '.wish-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 40% 50%,rgba(139,37,0,.85) 0%,rgba(61,28,2,.95) 60%,#0a0502 100%)}',
  '.wish-hero-ov{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(200,144,10,.03) 40px,rgba(200,144,10,.03) 80px)}',
  '.wish-hero .container{position:relative;z-index:1}',
  '.wish-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}',
  '.wish-hero h1{font-family:var(--font-head);font-size:clamp(2rem,5vw,3.2rem);color:var(--cream);line-height:1.2;margin-bottom:10px}',
  '.wish-hero-sub{font-size:.9rem;color:rgba(253,243,227,.5);font-style:italic}',

  /* body */
  '.wish-body{padding:48px 0 80px}',
  '.wish-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px}',
  '.wish-bar-left h2{font-family:var(--font-head);font-size:1.2rem;color:var(--brown);margin-bottom:2px}',
  '.wish-bar-left p{font-family:var(--font-sub);font-size:.72rem;letter-spacing:.08em;color:var(--brown-light)}',

  /* grid */
  '.wish-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}',
  '.wish-card{background:white;border-radius:20px;overflow:hidden;border:1px solid var(--cream-dark);transition:.25s;display:flex;flex-direction:column}',
  '.wish-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(61,28,2,.1);border-color:rgba(200,144,10,.25)}',

  /* card image */
  '.wc-img{aspect-ratio:4/3;overflow:hidden;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:4rem;cursor:pointer;position:relative}',
  '.wc-img img{width:100%;height:100%;object-fit:cover;transition:.35s}',
  '.wish-card:hover .wc-img img{transform:scale(1.06)}',
  '.wc-heart{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:var(--red);font-size:.85rem;transition:.2s;touch-action:manipulation;box-shadow:0 2px 8px rgba(0,0,0,.1)}',
  '.wc-heart:hover{background:var(--red);color:white;transform:scale(1.12)}',

  /* card body */
  '.wc-body{padding:18px;flex:1;display:flex;flex-direction:column}',
  '.wc-cat{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:4px}',
  '.wc-name{font-family:var(--font-sub);font-size:.9rem;color:var(--brown);margin-bottom:3px;cursor:pointer;transition:.15s}',
  '.wc-name:hover{color:var(--red)}',
  '.wc-meta{font-size:.74rem;color:var(--brown-light);font-style:italic;flex:1}',
  '.wc-footer{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:14px;border-top:1px solid var(--cream-dark)}',
  '.wc-price{font-family:var(--font-head);font-size:1rem;color:var(--red)}',
  '.wc-add{display:flex;align-items:center;gap:7px;padding:9px 16px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:99px;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;border:none;cursor:pointer;transition:.2s;touch-action:manipulation;white-space:nowrap}',
  '.wc-add:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(139,37,0,.3)}',

  /* empty */
  '.wish-empty{text-align:center;padding:80px 24px}',
  '.wish-empty-ico{font-size:4rem;display:block;margin-bottom:16px}',
  '.wish-empty h2{font-family:var(--font-head);font-size:1.6rem;color:var(--brown);margin-bottom:8px}',
  '.wish-empty p{font-size:.9rem;color:var(--brown-light);font-style:italic;margin-bottom:28px;max-width:380px;margin-left:auto;margin-right:auto;line-height:1.7}',
  '.wish-empty-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:99px;font-family:var(--font-sub);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;border:none;transition:.25s}',
  '.wish-empty-btn:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(139,37,0,.3)}',

  /* responsive */
  '@media(max-width:768px){.wish-grid{grid-template-columns:repeat(2,1fr);gap:16px}}',
  '@media(max-width:480px){',
  '.wish-grid{grid-template-columns:repeat(2,1fr);gap:10px}',
  '.wc-body{padding:12px}',
  '.wc-name{font-size:.82rem}',
  '.wc-add{padding:8px 12px;font-size:.58rem}',
  '}',
].join('');

async function renderBody(container) {
  var bodyEl = container.querySelector('#wish-body');
  if (!bodyEl) return;

  /* not logged in */
  if (!state.user) {
    bodyEl.innerHTML = (
      '<div class="wish-empty">'
        + '<span class="wish-empty-ico">&#128150;</span>'
        + '<h2>Sign In to View Your Wishlist</h2>'
        + '<p>Your saved items are kept in your account. Sign in to see your favourites.</p>'
        + '<button class="wish-empty-btn js-login"><i class="fas fa-user"></i> Sign In</button>'
      + '</div>'
    );
    bodyEl.querySelector('.js-login').addEventListener('click', function() { router.go('login'); });
    return;
  }

  await loadWishlist();

  /* empty wishlist */
  if (!state.wishlist || !state.wishlist.length) {
    bodyEl.innerHTML = (
      '<div class="wish-empty">'
        + '<span class="wish-empty-ico">&#128149;</span>'
        + '<h2>No Saved Items Yet</h2>'
        + '<p>Browse our collection and tap the heart icon on any product to save it here for later.</p>'
        + '<button class="wish-empty-btn js-shop"><i class="fas fa-leaf"></i> Explore Spices</button>'
      + '</div>'
    );
    bodyEl.querySelector('.js-shop').addEventListener('click', function() { router.go('products'); });
    return;
  }

  /* load full product data */
  var result = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .in('id', state.wishlist)
    .eq('is_active', true);

  var products = result.data;

  if (!products || !products.length) {
    bodyEl.innerHTML = '<p style="text-align:center;padding:60px;color:var(--brown-light);font-style:italic;">Could not load saved items. Please try again.</p>';
    return;
  }

  var cardsHTML = '';
  products.forEach(function(p) {
    var img = p.images && p.images[0]
      ? '<img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy" />'
      : '&#127798;';
    cardsHTML += (
      '<div class="wish-card reveal">'
        + '<div class="wc-img js-pd" data-id="' + p.id + '">'
          + img
          + '<button class="wc-heart js-unwish" data-id="' + p.id + '" title="Remove from wishlist"><i class="fas fa-heart"></i></button>'
        + '</div>'
        + '<div class="wc-body">'
          + '<p class="wc-cat">' + (p.category ? p.category.name : 'Spices') + '</p>'
          + '<p class="wc-name js-pd" data-id="' + p.id + '">' + p.name + '</p>'
          + '<p class="wc-meta">' + (p.weight_grams || '') + 'g &middot; ' + (p.origin || 'Sri Lanka') + '</p>'
          + '<div class="wc-footer">'
            + '<span class="wc-price" data-lkr="' + p.price_lkr + '">' + formatPrice(p.price_lkr) + '</span>'
            + '<button class="wc-add js-add" data-id="' + p.id + '"><i class="fas fa-shopping-cart"></i> Add to Cart</button>'
          + '</div>'
        + '</div>'
      + '</div>'
    );
  });

  bodyEl.innerHTML = (
    '<div class="wish-bar">'
      + '<div class="wish-bar-left">'
        + '<h2>Saved Items</h2>'
        + '<p>' + products.length + ' item' + (products.length !== 1 ? 's' : '') + '</p>'
      + '</div>'
    + '</div>'
    + '<div class="wish-grid">' + cardsHTML + '</div>'
  );

  /* events */
  bodyEl.querySelectorAll('.js-pd').forEach(function(el) {
    el.addEventListener('click', function() { router.go('product', { id: el.dataset.id }); });
  });

  bodyEl.querySelectorAll('.js-add').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      addToCart(btn.dataset.id);
    });
  });

  bodyEl.querySelectorAll('.js-unwish').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleWishlist(btn.dataset.id).then(function() { renderBody(container); });
    });
  });

  initReveals();
}

/* ── Init ── */
export async function init(container) {
  if (!document.getElementById('wish-css')) {
    var s = document.createElement('style');
    s.id = 'wish-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  container.innerHTML = (
    '<div class="wish-page">'
      + '<section class="wish-hero">'
        + '<div class="wish-hero-bg"></div>'
        + '<div class="wish-hero-ov"></div>'
        + '<div class="container">'
          + '<p class="wish-eyebrow">My Wishlist</p>'
          + '<h1>Saved Spices</h1>'
          + '<p class="wish-hero-sub">Your hand-picked Ceylon favourites, saved for later</p>'
        + '</div>'
      + '</section>'
      + '<section class="wish-body"><div class="container">'
        + '<div id="wish-body" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="color:var(--gold);font-size:1.5rem"></i></div>'
      + '</div></section>'
    + '</div>'
  );

  await renderBody(container);
}

export default init;
