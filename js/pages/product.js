/* ================================================================
   KITHTHA GRAND — Product Detail Page
   js/pages/product.js
================================================================ */

import { supabase }                              from '../supabase.js';
import { router }                                from '../router.js';
import { showToast, formatPrice, addToCart,
         toggleWishlist, state, initReveals,
         loadCart }                              from '../app.js';

/* ── Category colour + emoji maps ── */
var CAT_BG = {
  'whole-spices':  'linear-gradient(135deg,#4a0e00,#8B2500)',
  'ground-spices': 'linear-gradient(135deg,#3D1C02,#7A3010)',
  'spice-blends':  'linear-gradient(135deg,#1a2a1a,#2A5C3F)',
  'gift-sets':     'linear-gradient(135deg,#1a1a2e,#2a1a5e)',
};
var CAT_EMOJI = {
  'whole-spices':  '🌶️',
  'ground-spices': '⭐',
  'spice-blends':  '🌿',
  'gift-sets':     '🎁',
};

/* ── Module state ── */
var slideCount    = 1;
var slideIndex    = 0;
var selectedQty   = 1;
var selectedVar   = null; /* active variant object */

/* ── CSS ── */
function injectStyles() {
  if (document.getElementById('product-styles')) return;
  var s = document.createElement('style');
  s.id = 'product-styles';
  s.textContent = [
    '.pd-page{min-height:100vh;background:var(--cream)}',
    /* breadcrumb */
    '.pd-breadcrumb{padding:88px 0 0;background:var(--cream)}',
    '.pd-bc-inner{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--brown-light);padding-bottom:20px;flex-wrap:wrap}',
    '.pd-bc-link{color:var(--gold);cursor:pointer;font-family:var(--font-sub);letter-spacing:.05em;font-size:.72rem;background:none;border:none;padding:0;transition:color .2s}',
    '.pd-bc-link:hover{color:var(--brown)}',
    '.pd-bc-sep{color:var(--cream-dark)}',
    '.pd-bc-cur{font-family:var(--font-sub);font-size:.72rem;color:var(--brown-light)}',
    /* hero grid */
    '.pd-hero{display:grid;grid-template-columns:1fr 420px;gap:56px;padding:8px 0 60px;align-items:start}',
    /* gallery */
    '.pd-gallery{position:sticky;top:88px}',
    '.pd-main-wrap{position:relative;border-radius:22px;overflow:hidden;background:var(--cream-dark);aspect-ratio:1/1;box-shadow:var(--shadow-md)}',
    '.pd-track{display:flex;height:100%;transition:transform .45s cubic-bezier(.4,0,.2,1);will-change:transform}',
    '.pd-slide{flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:5rem;overflow:hidden}',
    '.pd-slide img{width:100%;height:100%;object-fit:cover;display:block}',
    '.pd-feat-badge{position:absolute;top:14px;left:14px;background:var(--gold);color:white;font-family:var(--font-sub);font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;padding:4px 12px;border-radius:99px;z-index:2}',
    '.pd-zoom-btn{position:absolute;bottom:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.8);border:none;display:flex;align-items:center;justify-content:center;color:var(--brown-light);font-size:.8rem;cursor:pointer;z-index:2;transition:.2s}',
    '.pd-zoom-btn:hover{background:white;color:var(--brown)}',
    '.pd-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.92);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;z-index:2;box-shadow:0 2px 10px rgba(0,0,0,.14);color:var(--brown)}',
    '.pd-nav:hover{background:white;color:var(--red)}',
    '.pd-prev{left:14px}',
    '.pd-next{right:14px}',
    '.pd-nav.pd-hidden{display:none}',
    '.pd-dots{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:7px;z-index:2}',
    '.pd-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.5);cursor:pointer;transition:.25s;border:none;padding:0}',
    '.pd-dot.active{background:white;transform:scale(1.3)}',
    '.pd-thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}',
    '.pd-thumb{aspect-ratio:1;border-radius:10px;overflow:hidden;cursor:pointer;border:1.5px solid transparent;transition:.2s;background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:1.6rem}',
    '.pd-thumb img{width:100%;height:100%;object-fit:cover}',
    '.pd-thumb.active{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold)}',
    '.pd-thumb:hover:not(.active){border-color:var(--brown-light)}',
    /* info panel */
    '.pd-info{padding-top:2px}',
    '.pd-cat-row{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap}',
    '.pd-cat-badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);background:rgba(200,144,10,.1);padding:5px 13px;border-radius:99px;border:1px solid rgba(200,144,10,.2)}',
    '.pd-origin-pill{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown-light);background:var(--cream-dark);padding:5px 12px;border-radius:99px}',
    '.pd-name{font-family:var(--font-head);font-size:clamp(1.4rem,2.5vw,2.1rem);color:var(--brown);line-height:1.2;margin-bottom:6px}',
    '.pd-name-si{font-size:.9rem;color:var(--brown-light);font-style:italic;margin-bottom:14px}',
    /* rating */
    '.pd-rating{display:flex;align-items:center;gap:9px;margin-bottom:18px;flex-wrap:wrap}',
    '.pd-stars{color:var(--gold-light);font-size:1rem;letter-spacing:.03em}',
    '.pd-rating-count{font-family:var(--font-sub);font-size:.7rem;color:var(--brown-light)}',
    '.pd-rating-link{font-family:var(--font-sub);font-size:.68rem;color:var(--gold);cursor:pointer;text-decoration:underline;background:none;border:none;padding:0}',
    /* price */
    '.pd-price-block{margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid var(--cream-dark)}',
    '.pd-price-row{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:6px}',
    '.pd-price{font-family:var(--font-head);font-size:2.1rem;color:var(--red);line-height:1}',
    '.pd-price-usd{font-family:var(--font-sub);font-size:.78rem;color:var(--brown-light);padding-bottom:4px}',
    '.pd-pts-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(200,144,10,.12);color:var(--gold);border:1px solid rgba(200,144,10,.2);border-radius:99px;padding:3px 10px;font-family:var(--font-sub);font-size:.56rem;letter-spacing:.06em;margin-top:4px}',
    '.pd-price-note{font-size:.73rem;color:var(--brown-light);font-style:italic;margin-top:6px}',
    /* stock */
    '.pd-stock{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-sub);font-size:.72rem;letter-spacing:.08em;margin-bottom:20px;padding:7px 16px;border-radius:99px}',
    '.pd-stock.in{background:rgba(42,92,63,.1);color:var(--green);border:1px solid rgba(42,92,63,.2)}',
    '.pd-stock.low{background:rgba(251,191,36,.1);color:#92400e;border:1px solid rgba(251,191,36,.2)}',
    '.pd-stock.out{background:rgba(139,37,0,.08);color:var(--red);border:1px solid rgba(139,37,0,.15)}',
    '.pd-stock-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:currentColor}',
    /* variants */
    '.pd-variants{margin-bottom:18px}',
    '.pd-variants-label{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brown-light);margin-bottom:10px}',
    '.pd-var-grid{display:flex;flex-wrap:wrap;gap:8px}',
    '.pd-var-btn{padding:8px 16px;border:1.5px solid var(--cream-dark);border-radius:99px;background:white;font-family:var(--font-sub);font-size:.66rem;letter-spacing:.06em;cursor:pointer;transition:.2s;color:var(--brown);white-space:nowrap}',
    '.pd-var-btn:hover:not(.oos){border-color:var(--gold);background:rgba(200,144,10,.06)}',
    '.pd-var-btn.active{border-color:var(--gold);background:rgba(200,144,10,.1);color:var(--brown)}',
    '.pd-var-btn.oos{opacity:.4;text-decoration:line-through;cursor:not-allowed}',
    /* qty */
    '.pd-qty-row{display:flex;align-items:center;gap:14px;margin-bottom:18px}',
    '.pd-qty-label{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brown-light)}',
    '.pd-qty{display:inline-flex;align-items:center;background:var(--cream);border:1.5px solid var(--cream-dark);border-radius:99px;overflow:hidden}',
    '.pd-qbtn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:var(--brown);font-size:.75rem;transition:background .15s}',
    '.pd-qbtn:hover{background:var(--cream-dark)}',
    '.pd-qbtn:disabled{opacity:.35;cursor:not-allowed}',
    '.pd-qval{min-width:36px;text-align:center;font-family:var(--font-sub);font-size:.85rem;color:var(--brown);font-weight:600}',
    /* actions */
    '.pd-actions{display:flex;gap:12px;align-items:center;margin-bottom:24px}',
    '.pd-cart-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;padding:15px 20px;background:var(--red);color:white;border-radius:99px;font-family:var(--font-sub);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
    '.pd-cart-btn:hover:not(:disabled){background:var(--red-light);transform:translateY(-1px);box-shadow:0 6px 20px rgba(139,37,0,.3)}',
    '.pd-cart-btn:disabled{opacity:.5;cursor:not-allowed}',
    '.pd-cart-btn.added{background:#2a5c3f}',
    '.pd-wish-btn{width:52px;height:52px;border-radius:50%;border:1.5px solid var(--cream-dark);background:white;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--brown-light);cursor:pointer;transition:.2s;flex-shrink:0}',
    '.pd-wish-btn:hover{border-color:var(--red);color:var(--red)}',
    '.pd-wish-btn.wished{border-color:var(--red);color:var(--red);background:rgba(139,37,0,.05)}',
    /* guarantees */
    '.pd-guarantees{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.pd-guarantee{display:flex;align-items:center;gap:10px;background:var(--cream);border-radius:10px;padding:12px}',
    '.pd-guar-icon{width:34px;height:34px;border-radius:8px;background:rgba(200,144,10,.12);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:.9rem;flex-shrink:0}',
    '.pd-guar-text{font-family:var(--font-sub);font-size:.58rem;letter-spacing:.05em;color:var(--brown);line-height:1.4}',
    /* story section */
    '.pd-story-section{padding:60px 0}',
    '.pd-story-eyebrow{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:8px}',
    '.pd-story-title{font-family:var(--font-head);font-size:1.6rem;color:var(--brown);margin-bottom:20px}',
    '.pd-story-text{font-family:var(--font-body);font-size:.98rem;color:var(--brown);line-height:1.95;font-style:italic;max-width:720px}',
    /* details grid */
    '.pd-details-section{padding:0 0 60px}',
    '.pd-details-eyebrow{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:8px}',
    '.pd-details-title{font-family:var(--font-head);font-size:1.6rem;color:var(--brown);margin-bottom:20px}',
    '.pd-details-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}',
    '.pd-detail-item{background:white;border-radius:12px;border:.5px solid var(--cream-dark);padding:16px}',
    '.pd-detail-lbl{font-family:var(--font-sub);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brown-light);margin-bottom:5px}',
    '.pd-detail-val{font-family:Georgia,serif;font-size:.95rem;color:var(--brown);font-weight:bold}',
    /* reviews section */
    '.pd-reviews-section{padding:0 0 60px}',
    '.pd-rev-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px}',
    '.pd-rev-eyebrow{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:4px}',
    '.pd-rev-title{font-family:var(--font-head);font-size:1.5rem;color:var(--brown)}',
    '.pd-write-btn{padding:10px 20px;border:1.5px solid var(--cream-dark);border-radius:99px;background:white;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown-light);cursor:pointer;transition:.2s}',
    '.pd-write-btn:hover{border-color:var(--gold);color:var(--gold)}',
    '.pd-rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}',
    '.pd-rev-card{background:white;border:.5px solid var(--cream-dark);border-radius:14px;padding:20px}',
    '.pd-rev-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
    '.pd-rev-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-sub);font-size:.75rem;color:white;flex-shrink:0;font-weight:700}',
    '.pd-rev-meta{flex:1;min-width:0}',
    '.pd-rev-name{font-family:var(--font-sub);font-size:.72rem;color:var(--brown);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.pd-rev-date{font-family:var(--font-sub);font-size:.6rem;color:var(--brown-light);margin-top:1px}',
    '.pd-rev-stars{color:var(--gold-light);font-size:.88rem;margin-bottom:8px;letter-spacing:.04em}',
    '.pd-rev-text{font-family:var(--font-body);font-size:.85rem;color:var(--brown-light);line-height:1.65;margin-bottom:10px}',
    '.pd-verified{display:inline-flex;align-items:center;gap:4px;background:rgba(42,92,63,.1);color:#2a5c3f;border-radius:99px;padding:3px 9px;font-family:var(--font-sub);font-size:.52rem;letter-spacing:.06em}',
    '.pd-rev-empty{font-family:var(--font-body);color:var(--brown-light);font-style:italic;margin-bottom:24px;padding:32px;text-align:center;background:white;border-radius:14px;border:.5px solid var(--cream-dark)}',
    /* review form */
    '.pd-rev-form{background:white;border:.5px solid var(--cream-dark);border-radius:16px;padding:24px}',
    '.pd-rev-form-title{font-family:var(--font-sub);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown);margin-bottom:16px}',
    '.pd-star-picker{display:flex;gap:6px;margin-bottom:14px}',
    '.pd-star-k{font-size:1.8rem;cursor:pointer;border:none;background:none;color:var(--cream-dark);transition:.15s;padding:0;line-height:1}',
    '.pd-star-k.lit{color:var(--gold-light)}',
    '.pd-star-k:hover{transform:scale(1.15)}',
    '.pd-rev-ta{width:100%;padding:12px;border:1.5px solid var(--cream-dark);border-radius:10px;font-family:var(--font-body);font-size:.88rem;background:var(--cream);color:var(--brown);resize:vertical;min-height:90px;outline:none;transition:.2s;box-sizing:border-box}',
    '.pd-rev-ta:focus{border-color:var(--gold);background:white}',
    '.pd-rev-submit{margin-top:12px;padding:11px 28px;background:var(--red);color:white;border-radius:99px;font-family:var(--font-sub);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
    '.pd-rev-submit:hover{background:var(--red-dark)}',
    '.pd-rev-submit:disabled{opacity:.5;cursor:not-allowed}',
    /* related */
    '.pd-related-section{padding:0 0 72px}',
    '.pd-rel-eyebrow{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:8px}',
    '.pd-rel-title{font-family:var(--font-head);font-size:1.5rem;color:var(--brown);margin-bottom:24px}',
    '.pd-rel-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}',
    '.pd-rel-card{background:white;border-radius:14px;border:.5px solid var(--cream-dark);overflow:hidden;cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s}',
    '.pd-rel-card:hover{transform:translateY(-3px);border-color:var(--gold);box-shadow:0 8px 20px rgba(200,144,10,.12)}',
    '.pd-rel-img{aspect-ratio:4/3;overflow:hidden;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:2.5rem}',
    '.pd-rel-img img{width:100%;height:100%;object-fit:cover}',
    '.pd-rel-body{padding:12px}',
    '.pd-rel-cat{font-family:var(--font-sub);font-size:.5rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:3px}',
    '.pd-rel-name{font-family:Georgia,serif;font-size:.85rem;color:var(--brown);font-weight:bold;margin-bottom:6px;line-height:1.3}',
    '.pd-rel-foot{display:flex;align-items:center;justify-content:space-between}',
    '.pd-rel-price{font-family:Georgia,serif;font-size:.9rem;color:var(--red);font-weight:bold}',
    '.pd-rel-add{width:28px;height:28px;border-radius:50%;background:var(--red);border:none;color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.65rem;transition:.2s;flex-shrink:0}',
    '.pd-rel-add:hover{background:var(--red-dark)}',
    /* not found / loading */
    '.pd-not-found{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:40px}',
    '.pd-not-found h2{font-family:var(--font-head);font-size:1.4rem;color:var(--brown)}',
    '.pd-not-found p{color:var(--brown-light);font-style:italic}',
    /* skeleton */
    '.pd-skel{background:linear-gradient(90deg,var(--cream) 25%,var(--cream-dark) 50%,var(--cream) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}',
    '.pd-skel-square{aspect-ratio:1;border-radius:22px}',
    '.pd-skel-lines{display:flex;flex-direction:column;gap:12px;padding-top:8px}',
    /* responsive */
    '@media(max-width:900px){',
      '.pd-hero{grid-template-columns:1fr;gap:0}',
      '.pd-gallery{position:static}',
      '.pd-breadcrumb{padding:72px 0 0}',
      '.pd-rev-grid{grid-template-columns:1fr}',
      '.pd-rel-grid{grid-template-columns:repeat(2,1fr)}',
      '.pd-details-grid{grid-template-columns:repeat(2,1fr)}',
    '}',
    '@media(max-width:600px){',
      '.pd-breadcrumb{padding:68px 0 0}',
      '.pd-bc-sep,.pd-bc-cur{display:none}',
      '.pd-bc-link:not(:first-of-type){display:none}',
      '.pd-bc-link:first-of-type{font-size:.68rem;display:flex;align-items:center;gap:5px;color:var(--brown-light)}',
      '.pd-gallery{margin:0 -16px}',
      '.pd-main-wrap{border-radius:0;aspect-ratio:4/3}',
      '.pd-thumbs{padding:0 16px;margin-top:10px}',
      '.pd-info{background:white;border-radius:20px 20px 0 0;margin:-22px -16px 0;padding:24px 20px 20px;position:relative;z-index:2;box-shadow:0 -2px 20px rgba(61,28,2,.08)}',
      '.pd-hero{padding:0}',
      '.pd-name{font-size:1.45rem}',
      '.pd-price{font-size:1.55rem}',
      '.pd-guarantees{grid-template-columns:1fr}',
      '.pd-rel-grid{grid-template-columns:repeat(2,1fr);gap:10px}',
      '.pd-details-grid{grid-template-columns:repeat(2,1fr)}',
    '}',
  ].join('');
  document.head.appendChild(s);
}

/* ── Helpers ── */
function buildStars(avg) {
  var full = Math.round(avg || 0);
  var h = '';
  for (var i = 1; i <= 5; i++) h += (i <= full ? '★' : '☆');
  return h;
}

function relativeTime(str) {
  if (!str) return '';
  var d = Math.floor((Date.now() - new Date(str).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1 day ago';
  if (d < 7)  return d + ' days ago';
  if (d < 30) return Math.floor(d / 7) + ' weeks ago';
  if (d < 365) return Math.floor(d / 30) + ' months ago';
  return Math.floor(d / 365) + ' years ago';
}

var AV_COLORS = ['#8B2500','#C8900A','#2A5C3F','#1a3d6e','#6B3A2A','#4a1a6e'];
function avatarColor(name) {
  return AV_COLORS[(name.charCodeAt(0) || 0) % AV_COLORS.length];
}

function buildStock(stock) {
  if (!stock || stock <= 0)  return '<div class="pd-stock out"><span class="pd-stock-dot"></span>Out of Stock</div>';
  if (stock < 10)            return '<div class="pd-stock low"><span class="pd-stock-dot"></span>Low Stock &mdash; ' + stock + ' left</div>';
  return '<div class="pd-stock in"><span class="pd-stock-dot"></span>In Stock &middot; ' + stock + ' units left</div>';
}

/* ── Parse variants from story field ── */
function parseVariants(story) {
  if (!story || story.indexOf('[VARIANTS]') !== 0) return null;
  try {
    return JSON.parse(story.replace('[VARIANTS]', ''));
  } catch (e) {
    return null;
  }
}

/* ── Carousel ── */
function initSlides(container) {
  var wrap = container.querySelector('.pd-main-wrap');
  if (!wrap) return;
  var w = wrap.offsetWidth;
  var h = wrap.offsetHeight;
  if (!w) return;
  container.querySelectorAll('.pd-slide').forEach(function(slide) {
    slide.style.width    = w + 'px';
    slide.style.minWidth = w + 'px';
    slide.style.height   = h + 'px';
  });
  var track = container.querySelector('#pd-track');
  if (track) track.style.transform = 'translateX(-' + (slideIndex * w) + 'px)';
}

function goToSlide(n, container) {
  slideIndex = ((n % slideCount) + slideCount) % slideCount;
  var track = container.querySelector('#pd-track');
  var slide = container.querySelector('.pd-slide');
  if (track && slide && slide.offsetWidth) {
    track.style.transform = 'translateX(-' + (slideIndex * slide.offsetWidth) + 'px)';
  }
  container.querySelectorAll('.pd-dot').forEach(function(d, i) {
    d.classList.toggle('active', i === slideIndex);
  });
  container.querySelectorAll('.pd-thumb').forEach(function(t, i) {
    t.classList.toggle('active', i === slideIndex);
  });
}

function buildCarousel(images, catSlug, isFeatured) {
  var imgs = images && images.length ? images : [];
  var catEmoji = CAT_EMOJI[catSlug] || '🌶️';
  var catBg    = CAT_BG[catSlug] || 'linear-gradient(135deg,var(--brown),var(--red-dark))';

  var slidesHTML = '';
  if (!imgs.length) {
    slidesHTML = '<div class="pd-slide" style="background:' + catBg + ';font-size:5rem">' + catEmoji + '</div>';
  } else {
    for (var i = 0; i < imgs.length; i++) {
      slidesHTML += '<div class="pd-slide"><img src="' + imgs[i]
        + '" alt="Product image ' + (i + 1) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '"></div>';
    }
  }

  var dotsHTML   = '';
  var thumbsHTML = '';
  for (var j = 0; j < imgs.length; j++) {
    dotsHTML   += '<button class="pd-dot' + (j === 0 ? ' active' : '') + '" data-dot="' + j + '"></button>';
    thumbsHTML += '<div class="pd-thumb' + (j === 0 ? ' active' : '') + '" data-thumb="' + j + '">'
      + '<img src="' + imgs[j] + '" loading="lazy" alt="thumb ' + (j + 1) + '"></div>';
  }
  if (!imgs.length) {
    for (var k = 0; k < 4; k++) {
      thumbsHTML += '<div class="pd-thumb' + (k === 0 ? ' active' : '') + '" data-thumb="0" style="background:' + catBg + '">' + catEmoji + '</div>';
    }
  }

  var hideClass = imgs.length <= 1 ? ' pd-hidden' : '';

  return '<div class="pd-main-wrap">'
    + '<div class="pd-track" id="pd-track">' + slidesHTML + '</div>'
    + '<button class="pd-nav pd-prev' + hideClass + '" id="pd-prev"><i class="fas fa-chevron-left"></i></button>'
    + '<button class="pd-nav pd-next' + hideClass + '" id="pd-next"><i class="fas fa-chevron-right"></i></button>'
    + (imgs.length > 1 ? '<div class="pd-dots">' + dotsHTML + '</div>' : '')
    + (isFeatured ? '<span class="pd-feat-badge"><i class="fas fa-star"></i> Featured</span>' : '')
    + '<button class="pd-zoom-btn" title="Zoom"><i class="fas fa-search-plus"></i></button>'
    + '</div>'
    + '<div class="pd-thumbs">' + thumbsHTML + '</div>';
}

/* ── Guarantees grid ── */
function buildGuarantees() {
  var items = [
    ['fa-leaf',          '100% Pure Ceylon'],
    ['fa-shipping-fast', 'FedEx Worldwide'],
    ['fa-undo',          'Easy Returns'],
    ['fa-lock',          'Secure Payment'],
  ];
  var html = '<div class="pd-guarantees">';
  items.forEach(function(item) {
    html += '<div class="pd-guarantee">'
      + '<div class="pd-guar-icon"><i class="fas ' + item[0] + '"></i></div>'
      + '<div class="pd-guar-text">' + item[1] + '</div>'
      + '</div>';
  });
  return html + '</div>';
}

/* ── Product details grid ── */
function buildDetailsGrid(product, catName) {
  var year = new Date().getFullYear().toString();
  var fields = [
    ['Weight',     (product.weight_grams ? product.weight_grams + 'g' : 'N/A')],
    ['Origin',     (product.origin || 'Sri Lanka')],
    ['Category',   catName],
    ['Harvest',    year],
    ['Shelf Life', '24 months'],
    ['Packaging',  'Resealable zip'],
  ];
  var html = '';
  fields.forEach(function(f) {
    html += '<div class="pd-detail-item">'
      + '<div class="pd-detail-lbl">' + f[0] + '</div>'
      + '<div class="pd-detail-val">' + f[1] + '</div>'
      + '</div>';
  });
  return html;
}

/* ── Single review card ── */
function buildReviewCard(r) {
  var name = (r.user && r.user.full_name) ? r.user.full_name : 'Customer';
  var init = name.charAt(0).toUpperCase();
  var col  = avatarColor(name);
  return '<div class="pd-rev-card">'
    + '<div class="pd-rev-top">'
    +   '<div class="pd-rev-av" style="background:' + col + '">' + init + '</div>'
    +   '<div class="pd-rev-meta">'
    +     '<div class="pd-rev-name">' + name + '</div>'
    +     '<div class="pd-rev-date">' + relativeTime(r.created_at) + '</div>'
    +   '</div>'
    + '</div>'
    + '<div class="pd-rev-stars">' + buildStars(r.rating) + '</div>'
    + (r.comment ? '<div class="pd-rev-text">' + r.comment + '</div>' : '')
    + '<div class="pd-verified"><i class="fas fa-check-circle"></i> Verified purchase</div>'
    + '</div>';
}

/* ── Related product card ── */
function buildRelatedCard(p, catName) {
  var imgH = (p.images && p.images.length)
    ? '<img src="' + p.images[0] + '" alt="' + (p.name || '') + '" loading="lazy">'
    : '🌶️';
  return '<div class="pd-rel-card" data-rel-id="' + p.id + '">'
    + '<div class="pd-rel-img">' + imgH + '</div>'
    + '<div class="pd-rel-body">'
    +   '<div class="pd-rel-cat">' + (catName || 'Spices') + '</div>'
    +   '<div class="pd-rel-name">' + (p.name || '') + '</div>'
    +   '<div class="pd-rel-foot">'
    +     '<span class="pd-rel-price">' + formatPrice(p.price_lkr || 0) + '</span>'
    +     '<button class="pd-rel-add" data-rel-add="' + p.id + '" title="Add to cart" aria-label="Add to cart">'
    +       '<i class="fas fa-plus"></i>'
    +     '</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
}

/* ── Build full page HTML ── */
function buildPage(product, reviews, related, catName, catSlug) {
  var images   = product.images || [];
  var avgRating = reviews.length
    ? reviews.reduce(function(s, r) { return s + r.rating; }, 0) / reviews.length : 0;
  var wished   = state.wishlist && state.wishlist.indexOf(product.id) > -1;
  var oos      = !product.stock || product.stock <= 0;
  var variants = parseVariants(product.story);

  /* Price + pts */
  var lkrPrice = parseFloat(product.price_lkr || 0);
  var usdEquiv = product.price_usd ? ('~$' + parseFloat(product.price_usd).toFixed(2)) : '';
  var pts      = Math.floor(lkrPrice * 0.033);

  slideCount = images.length || 1;
  slideIndex = 0;
  selectedQty = 1;
  selectedVar = variants ? variants[0] : null;

  /* Variants HTML */
  var variantsHTML = '';
  if (variants && variants.length) {
    var varBtns = '';
    variants.forEach(function(v, idx) {
      var isOos = !v.stock || v.stock <= 0;
      varBtns += '<button class="pd-var-btn' + (idx === 0 ? ' active' : '') + (isOos ? ' oos' : '') + '"'
        + ' data-var-idx="' + idx + '"'
        + (isOos ? ' disabled' : '') + '>'
        + v.name + ' &middot; ' + formatPrice(v.price || lkrPrice)
        + '</button>';
    });
    variantsHTML = '<div class="pd-variants">'
      + '<div class="pd-variants-label">Select Size</div>'
      + '<div class="pd-var-grid">' + varBtns + '</div>'
      + '</div>';
  }

  /* Reviews HTML */
  var revCardsHTML = '';
  if (!reviews.length) {
    revCardsHTML = '<div class="pd-rev-empty">No reviews yet. Be the first to share your experience!</div>';
  } else {
    reviews.slice(0, 3).forEach(function(r) { revCardsHTML += buildReviewCard(r); });
  }

  /* Related HTML */
  var relHTML = '';
  if (related && related.length) {
    related.forEach(function(p) { relHTML += buildRelatedCard(p, catName); });
  }

  /* Story content (only if not variants) */
  var storySection = '';
  if (!variants && product.story && product.story.trim()) {
    storySection = '<section class="pd-story-section"><div class="container">'
      + '<p class="pd-story-eyebrow">Origin &amp; Story</p>'
      + '<h2 class="pd-story-title">The Story</h2>'
      + '<div class="pd-story-text">' + product.story.replace(/\n/g, '<br>') + '</div>'
      + '</div></section>';
  }

  /* Cart button label */
  var cartBtnLabel = oos ? 'Out of Stock' : ('Add to Cart &middot; ' + formatPrice(lkrPrice));

  return '<div class="pd-page">'

    /* breadcrumb */
    + '<div class="pd-breadcrumb"><div class="container"><div class="pd-bc-inner">'
    + '<button class="pd-bc-link" data-page="home">Home</button>'
    + '<span class="pd-bc-sep">/</span>'
    + '<button class="pd-bc-link" data-page="products">Products</button>'
    + (catSlug
        ? '<span class="pd-bc-sep">/</span><button class="pd-bc-link" data-page="products" data-cat="'
          + catSlug + '">' + catName + '</button>'
        : '')
    + '<span class="pd-bc-sep">/</span>'
    + '<span class="pd-bc-cur">' + (product.name || '') + '</span>'
    + '</div></div></div>'

    /* hero */
    + '<div class="container"><div class="pd-hero">'

    /* gallery */
    + '<div class="pd-gallery">'
    + buildCarousel(images, catSlug, product.is_featured)
    + '</div>'

    /* info */
    + '<div class="pd-info">'
    + '<div class="pd-cat-row">'
    +   '<span class="pd-cat-badge"><i class="fas fa-tag"></i> ' + catName + '</span>'
    +   '<span class="pd-origin-pill"><i class="fas fa-map-marker-alt"></i> '
    +     (product.origin || 'Sri Lanka') + '</span>'
    + '</div>'
    + '<h1 class="pd-name">' + (product.name || '') + '</h1>'
    + (product.name_si ? '<p class="pd-name-si">' + product.name_si + '</p>' : '')

    /* rating */
    + '<div class="pd-rating">'
    +   '<span class="pd-stars">' + buildStars(avgRating) + '</span>'
    +   '<span class="pd-rating-count">' + avgRating.toFixed(1) + ' (' + reviews.length
    +     ' review' + (reviews.length !== 1 ? 's' : '') + ')</span>'
    +   '<button class="pd-rating-link" id="pd-read-reviews">Read reviews</button>'
    + '</div>'

    /* price */
    + '<div class="pd-price-block">'
    +   '<div class="pd-price-row">'
    +     '<div class="pd-price" id="pd-price" data-lkr="' + lkrPrice + '">' + formatPrice(lkrPrice) + '</div>'
    +     (usdEquiv ? '<div class="pd-price-usd">' + usdEquiv + '</div>' : '')
    +   '</div>'
    +   '<div class="pd-pts-badge" id="pd-pts"><i class="fas fa-star"></i> +' + pts + ' loyalty points</div>'
    +   '<div class="pd-price-note">Free shipping above $150 USD &middot; Worldwide delivery</div>'
    + '</div>'

    /* stock */
    + buildStock(product.stock)

    /* variants */
    + variantsHTML

    /* qty */
    + '<div class="pd-qty-row">'
    +   '<span class="pd-qty-label">Qty</span>'
    +   '<div class="pd-qty">'
    +     '<button class="pd-qbtn" id="pd-qminus" disabled><i class="fas fa-minus"></i></button>'
    +     '<span class="pd-qval" id="pd-qval">1</span>'
    +     '<button class="pd-qbtn" id="pd-qplus"><i class="fas fa-plus"></i></button>'
    +   '</div>'
    + '</div>'

    /* actions */
    + '<div class="pd-actions">'
    +   '<button class="pd-cart-btn" id="pd-cart-btn"' + (oos ? ' disabled' : '') + '>'
    +     '<i class="fas fa-shopping-basket"></i> '
    +     '<span id="pd-cart-label">' + cartBtnLabel + '</span>'
    +   '</button>'
    +   '<button class="pd-wish-btn' + (wished ? ' wished' : '') + '" id="pd-wish-btn" aria-label="Wishlist">'
    +     '<i class="' + (wished ? 'fas' : 'far') + ' fa-heart"></i>'
    +   '</button>'
    + '</div>'

    /* guarantees */
    + buildGuarantees()

    + '</div>'/* /pd-info */
    + '</div></div>'/* /pd-hero /container */

    /* story section */
    + storySection

    /* details section */
    + '<section class="pd-details-section"><div class="container">'
    + '<p class="pd-details-eyebrow">Product Details</p>'
    + '<h2 class="pd-details-title">What You Get</h2>'
    + '<div class="pd-details-grid">' + buildDetailsGrid(product, catName) + '</div>'
    + '</div></section>'

    /* reviews section */
    + '<section class="pd-reviews-section" id="pd-reviews-section"><div class="container">'
    + '<div class="pd-rev-header">'
    +   '<div>'
    +     '<p class="pd-rev-eyebrow">Customer Reviews</p>'
    +     '<h2 class="pd-rev-title">What People Say</h2>'
    +   '</div>'
    +   (state.user ? '<button class="pd-write-btn" id="pd-write-btn">Write a Review</button>' : '')
    + '</div>'
    + '<div class="pd-rev-grid" id="pd-rev-grid">' + revCardsHTML + '</div>'

    /* review form */
    + '<div class="pd-rev-form" id="pd-rev-form"' + (!state.user ? ' style="display:none"' : '') + '>'
    + '<div class="pd-rev-form-title">Share Your Experience</div>'
    + '<div class="pd-star-picker" id="pd-star-picker">'
    + '<button class="pd-star-k" data-star="1">★</button>'
    + '<button class="pd-star-k" data-star="2">★</button>'
    + '<button class="pd-star-k" data-star="3">★</button>'
    + '<button class="pd-star-k" data-star="4">★</button>'
    + '<button class="pd-star-k" data-star="5">★</button>'
    + '</div>'
    + '<textarea class="pd-rev-ta" id="pd-rev-ta" placeholder="Share your experience with this spice..."></textarea>'
    + '<button class="pd-rev-submit" id="pd-rev-submit">Submit Review</button>'
    + '</div>'
    + '</div></section>'

    /* related */
    + (relHTML ? (
        '<section class="pd-related-section"><div class="container">'
        + '<p class="pd-rel-eyebrow">You May Also Like</p>'
        + '<h2 class="pd-rel-title">More from ' + catName + '</h2>'
        + '<div class="pd-rel-grid">' + relHTML + '</div>'
        + '</div></section>'
      ) : '')

    + '</div>';/* /pd-page */
}

/* ── Wire all events ── */
function wireEvents(container, product, variants) {
  var maxStock = product.stock || 0;
  if (selectedVar) maxStock = selectedVar.stock || 0;
  var maxQty = Math.min(10, maxStock);

  /* Carousel prev/next */
  var prevEl = container.querySelector('#pd-prev');
  var nextEl = container.querySelector('#pd-next');
  if (prevEl) prevEl.addEventListener('click', function() { goToSlide(slideIndex - 1, container); });
  if (nextEl) nextEl.addEventListener('click', function() { goToSlide(slideIndex + 1, container); });

  /* Dots */
  container.querySelectorAll('.pd-dot').forEach(function(dot) {
    dot.addEventListener('click', function() { goToSlide(parseInt(dot.dataset.dot, 10), container); });
  });

  /* Thumbs */
  container.querySelectorAll('.pd-thumb').forEach(function(thumb) {
    thumb.addEventListener('click', function() { goToSlide(parseInt(thumb.dataset.thumb, 10), container); });
  });

  /* Touch swipe */
  var track = container.querySelector('#pd-track');
  if (track) {
    var startX = 0;
    track.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) goToSlide(diff > 0 ? slideIndex + 1 : slideIndex - 1, container);
    }, { passive: true });
  }

  /* Breadcrumb */
  container.querySelectorAll('.pd-bc-link').forEach(function(el) {
    el.addEventListener('click', function() {
      var p = {};
      if (el.dataset.cat) p.cat = el.dataset.cat;
      router.go(el.dataset.page, p);
    });
  });

  /* Variant selection */
  if (variants) {
    container.querySelectorAll('.pd-var-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (btn.classList.contains('oos')) return;
        var idx = parseInt(btn.dataset.varIdx, 10);
        selectedVar = variants[idx];
        container.querySelectorAll('.pd-var-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');

        /* Update price + pts */
        var newPx = parseFloat((selectedVar && selectedVar.price) ? selectedVar.price : product.price_lkr || 0);
        var newPts = Math.floor(newPx * 0.033);
        var priceEl  = container.querySelector('#pd-price');
        var ptsEl    = container.querySelector('#pd-pts');
        var labelEl  = container.querySelector('#pd-cart-label');
        if (priceEl) { priceEl.textContent = formatPrice(newPx); priceEl.dataset.lkr = newPx; }
        if (ptsEl)   ptsEl.innerHTML = '<i class="fas fa-star"></i> +' + newPts + ' loyalty points';
        if (labelEl) labelEl.textContent = 'Add to Cart \xB7 ' + formatPrice(newPx * selectedQty);

        /* Reset qty + stock */
        maxStock = (selectedVar && selectedVar.stock) ? selectedVar.stock : 0;
        maxQty   = Math.min(10, maxStock);
        selectedQty = 1;
        var qvalEl  = container.querySelector('#pd-qval');
        var qminEl  = container.querySelector('#pd-qminus');
        var qplusEl = container.querySelector('#pd-qplus');
        if (qvalEl)  qvalEl.textContent = '1';
        if (qminEl)  qminEl.disabled = true;
        if (qplusEl) qplusEl.disabled = maxQty <= 1;
      });
    });
  }

  /* Qty controls */
  var qminEl  = container.querySelector('#pd-qminus');
  var qplusEl = container.querySelector('#pd-qplus');
  var qvalEl  = container.querySelector('#pd-qval');
  var labelEl = container.querySelector('#pd-cart-label');

  function getCurrentPrice() {
    var el = container.querySelector('#pd-price');
    return el ? parseFloat(el.dataset.lkr || 0) : parseFloat(product.price_lkr || 0);
  }

  if (qminEl) {
    qminEl.disabled = (selectedQty <= 1);
    qminEl.addEventListener('click', function() {
      if (selectedQty <= 1) return;
      selectedQty--;
      if (qvalEl) qvalEl.textContent = selectedQty;
      qminEl.disabled = (selectedQty <= 1);
      if (qplusEl) qplusEl.disabled = false;
      if (labelEl) labelEl.textContent = 'Add to Cart \xB7 ' + formatPrice(getCurrentPrice() * selectedQty);
    });
  }

  if (qplusEl) {
    qplusEl.disabled = maxQty <= 1;
    qplusEl.addEventListener('click', function() {
      if (selectedQty >= maxQty) return;
      selectedQty++;
      if (qvalEl) qvalEl.textContent = selectedQty;
      qplusEl.disabled = (selectedQty >= maxQty);
      if (qminEl) qminEl.disabled = false;
      if (labelEl) labelEl.textContent = 'Add to Cart \xB7 ' + formatPrice(getCurrentPrice() * selectedQty);
    });
  }

  /* Add to cart */
  var cartBtn = container.querySelector('#pd-cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function() {
      if (cartBtn.disabled) return;
      cartBtn.disabled = true;
      addToCart(product.id).then(function() {
        cartBtn.classList.add('added');
        var lbl = container.querySelector('#pd-cart-label');
        if (lbl) lbl.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        loadCart();
        setTimeout(function() {
          cartBtn.disabled = false;
          cartBtn.classList.remove('added');
          var lbl2 = container.querySelector('#pd-cart-label');
          if (lbl2) lbl2.textContent = 'Add to Cart \xB7 ' + formatPrice(getCurrentPrice() * selectedQty);
        }, 3000);
      }).catch(function() { cartBtn.disabled = false; });
    });
  }

  /* Wishlist */
  var wishBtn = container.querySelector('#pd-wish-btn');
  if (wishBtn) {
    wishBtn.addEventListener('click', function() {
      toggleWishlist(product.id).then(function() {
        var inWish = state.wishlist && state.wishlist.indexOf(product.id) > -1;
        wishBtn.classList.toggle('wished', inWish);
        var icon = wishBtn.querySelector('i');
        if (icon) icon.className = inWish ? 'fas fa-heart' : 'far fa-heart';
        showToast(inWish ? 'Added to wishlist!' : 'Removed from wishlist', inWish ? 'success' : 'info');
      });
    });
  }

  /* Read reviews scroll */
  var readRevBtn = container.querySelector('#pd-read-reviews');
  if (readRevBtn) {
    readRevBtn.addEventListener('click', function() {
      var sec = document.getElementById('pd-reviews-section');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* Write review button toggle */
  var writeBtn = container.querySelector('#pd-write-btn');
  var revForm  = container.querySelector('#pd-rev-form');
  if (writeBtn && revForm) {
    writeBtn.addEventListener('click', function() {
      revForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* Star picker */
  var selectedRating = 0;
  var starBtns = container.querySelectorAll('.pd-star-k');
  starBtns.forEach(function(btn) {
    var n = parseInt(btn.dataset.star, 10);
    btn.addEventListener('mouseenter', function() {
      starBtns.forEach(function(b, i) { b.classList.toggle('lit', i < n); });
    });
    btn.addEventListener('mouseleave', function() {
      starBtns.forEach(function(b, i) { b.classList.toggle('lit', i < selectedRating); });
    });
    btn.addEventListener('click', function() {
      selectedRating = n;
      starBtns.forEach(function(b, i) { b.classList.toggle('lit', i < selectedRating); });
    });
  });

  /* Review submit */
  var submitBtn = container.querySelector('#pd-rev-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      if (!state.user) { showToast('Please sign in to leave a review', 'error'); router.go('login'); return; }
      if (!selectedRating) { showToast('Please select a star rating', 'error'); return; }
      var ta = container.querySelector('#pd-rev-ta');
      var comment = ta ? (ta.value || '').trim() : '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      supabase.from('reviews').insert({
        user_id:    state.user.id,
        product_id: product.id,
        rating:     selectedRating,
        comment:    comment || null,
        is_approved: false,
      }).then(function(res) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
        if (res.error) { showToast('Error submitting review', 'error'); return; }
        showToast('Review submitted! It will appear after approval.', 'success');
        if (ta) ta.value = '';
        selectedRating = 0;
        starBtns.forEach(function(b) { b.classList.remove('lit'); });
      });
    });
  }

  /* Related cards */
  container.querySelectorAll('.pd-rel-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('[data-rel-add]')) return;
      router.go('product', { id: card.dataset.relId });
    });
  });
  container.querySelectorAll('[data-rel-add]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      btn.disabled = true;
      addToCart(btn.dataset.relAdd).then(function() {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        loadCart();
        setTimeout(function() { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i>'; }, 2500);
      }).catch(function() { btn.disabled = false; });
    });
  });

  /* Currency change */
  document.addEventListener('currencyChange', function() {
    var priceEl = container.querySelector('#pd-price');
    if (priceEl) priceEl.textContent = formatPrice(parseFloat(priceEl.dataset.lkr || 0));
    container.querySelectorAll('[data-lkr]').forEach(function(el) {
      el.textContent = formatPrice(parseFloat(el.dataset.lkr || 0));
    });
    var lbl = container.querySelector('#pd-cart-label');
    if (lbl) lbl.textContent = 'Add to Cart \xB7 ' + formatPrice(getCurrentPrice() * selectedQty);
  });
}

/* ================================================================
   INIT
================================================================ */
export async function init(container, params) {
  injectStyles();

  var productId = params && params.id;
  if (!productId) {
    container.innerHTML = '<div class="pd-not-found">'
      + '<div style="font-size:4rem">🌶️</div>'
      + '<h2>No product selected</h2>'
      + '<p>Please browse our spice collection.</p>'
      + '</div>';
    return;
  }

  /* Skeleton */
  container.innerHTML = '<div class="pd-page"><div class="pd-breadcrumb" style="padding:88px 0 0"><div class="container">'
    + '<div class="pd-skel" style="height:12px;width:200px;margin-bottom:20px"></div>'
    + '</div></div>'
    + '<div class="container"><div class="pd-hero">'
    +   '<div class="pd-gallery"><div class="pd-skel pd-skel-square"></div></div>'
    +   '<div class="pd-skel-lines">'
    +     '<div class="pd-skel" style="height:14px;width:40%"></div>'
    +     '<div class="pd-skel" style="height:32px;width:80%"></div>'
    +     '<div class="pd-skel" style="height:14px;width:30%"></div>'
    +     '<div class="pd-skel" style="height:48px;width:50%"></div>'
    +     '<div class="pd-skel" style="height:48px"></div>'
    +     '<div class="pd-skel" style="height:48px"></div>'
    +   '</div>'
    + '</div></div></div>';

  try {
    /* Fetch product (no FK join) */
    var pRes = await supabase.from('products').select('*').eq('id', productId).single();

    if (pRes.error || !pRes.data) {
      container.innerHTML = '<div class="pd-not-found">'
        + '<div style="font-size:4rem">&#127798;</div>'
        + '<h2>Product not found</h2>'
        + '<p>This spice may have been removed or is unavailable.</p>'
        + '<button class="btn-primary" id="pd-back"><span>Browse Spices</span> <i class="fas fa-arrow-right"></i></button>'
        + '</div>';
      var backBtn = document.getElementById('pd-back');
      if (backBtn) backBtn.addEventListener('click', function() { router.go('products'); });
      return;
    }

    var product = pRes.data;

    /* Parallel: category + reviews + related */
    var catProm = product.category_id
      ? supabase.from('categories').select('id, name, slug').eq('id', product.category_id).single()
      : Promise.resolve({ data: null });

    var revProm = supabase.from('reviews')
      .select('id, rating, comment, created_at, user_id')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(6);

    var relProm = product.category_id
      ? supabase.from('products')
          .select('id, name, images, price_lkr, weight_grams, category_id')
          .eq('category_id', product.category_id)
          .neq('id', productId)
          .limit(4)
      : Promise.resolve({ data: [] });

    var results  = await Promise.all([catProm, revProm, relProm]);
    var catData  = results[0].data || null;
    var reviews  = results[1].data || [];
    var related  = results[2].data || [];

    /* Fetch reviewer names separately */
    if (reviews.length) {
      var uids = reviews.map(function(r) { return r.user_id; }).filter(Boolean);
      if (uids.length) {
        var usersRes = await supabase.from('users').select('id, full_name').in('id', uids);
        var userMap  = {};
        (usersRes.data || []).forEach(function(u) { userMap[u.id] = u; });
        reviews = reviews.map(function(r) { return Object.assign({}, r, { user: userMap[r.user_id] || null }); });
      }
    }

    var catName = catData ? catData.name : 'Spices';
    var catSlug = catData ? catData.slug : '';

    /* Render */
    container.innerHTML = buildPage(product, reviews, related, catName, catSlug);

    /* Init carousel sizing */
    initSlides(container);
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() { initSlides(container); }, 120);
    });

    var variants = parseVariants(product.story);
    wireEvents(container, product, variants);
    initReveals();

  } catch (err) {
    console.error('[Product]', err);
    container.innerHTML = '<div class="pd-not-found">'
      + '<div style="font-size:4rem">😞</div>'
      + '<h2>Something went wrong</h2>'
      + '<p>Please refresh and try again.</p>'
      + '</div>';
  }
}

export default init;