/* ================================================================
   KITHTHA GRAND — Product Detail Page
   js/pages/product.js
   Features: Image carousel · Product info · Tabs · Reviews · Related
================================================================ */

import { supabase }                                from '../supabase.js';
import { router }                                  from '../router.js';
import { showToast, formatPrice, addToCart,
         toggleWishlist, state, initReveals }       from '../app.js';

/* ── CSS ── */
const PRODUCT_CSS = [
  '.pd-page{min-height:100vh;background:var(--cream)}',

  /* Breadcrumb */
  '.pd-breadcrumb{padding:88px 0 0;background:var(--cream)}',
  '.pd-bc-inner{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--brown-light);padding-bottom:20px;flex-wrap:wrap}',
  '.pd-bc-link{color:var(--gold);cursor:pointer;font-family:var(--font-sub);letter-spacing:.05em;font-size:.72rem;background:none;border:none;padding:0;transition:color .2s}',
  '.pd-bc-link:hover{color:var(--brown)}',
  '.pd-bc-sep{color:var(--cream-deep)}',
  '.pd-bc-cur{font-family:var(--font-sub);font-size:.72rem;color:var(--brown-light)}',

  /* Hero 2-col layout */
  '.pd-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;padding:8px 0 60px;align-items:start}',

  /* ── GALLERY ── */
  '.pd-gallery{position:sticky;top:88px}',

  /* Main carousel wrapper */
  '.pd-main-wrap{position:relative;border-radius:22px;overflow:hidden;background:var(--cream-dark);',
    'aspect-ratio:1/1;box-shadow:var(--shadow-md)}',

  /* Sliding track — no absolute positioning, slides sized by JS */
  '.pd-track{display:flex;height:100%;transition:transform .45s cubic-bezier(.4,0,.2,1);will-change:transform}',
  '.pd-slide{flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:5rem;background:var(--cream-dark);overflow:hidden}',
  '.pd-slide img{width:100%;height:100%;object-fit:cover;display:block}',

  /* Arrow buttons */
  '.pd-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;',
    'border-radius:50%;background:rgba(255,255,255,.92);border:none;',
    'display:flex;align-items:center;justify-content:center;cursor:pointer;',
    'transition:.2s;z-index:2;box-shadow:0 2px 10px rgba(0,0,0,.14);color:var(--brown)}',
  '.pd-nav:hover{background:white;box-shadow:0 4px 20px rgba(0,0,0,.18);color:var(--red)}',
  '.pd-nav.pd-prev{left:14px}',
  '.pd-nav.pd-next{right:14px}',
  '.pd-nav.pd-hidden{display:none}',

  /* Dots */
  '.pd-dots{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);',
    'display:flex;gap:7px;z-index:2}',
  '.pd-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.5);',
    'cursor:pointer;transition:.25s;border:none;padding:0}',
  '.pd-dot.active{background:white;transform:scale(1.3)}',

  /* Thumbnail strip */
  '.pd-thumbs{display:flex;gap:10px;margin-top:12px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}',
  '.pd-thumbs::-webkit-scrollbar{display:none}',
  '.pd-thumb{flex-shrink:0;width:70px;height:70px;border-radius:12px;overflow:hidden;',
    'cursor:pointer;border:2px solid transparent;transition:.2s;',
    'background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:1.8rem}',
  '.pd-thumb img{width:100%;height:100%;object-fit:cover}',
  '.pd-thumb.active{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold)}',
  '.pd-thumb:hover:not(.active){border-color:var(--brown-light)}',

  /* ── INFO PANEL ── */
  '.pd-info{padding-top:2px}',
  '.pd-cat-badge{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-sub);',
    'font-size:.64rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);',
    'margin-bottom:14px;background:rgba(200,144,10,.1);padding:5px 14px;',
    'border-radius:99px;border:1px solid rgba(200,144,10,.2)}',
  '.pd-name{font-family:var(--font-head);font-size:clamp(1.4rem,2.5vw,2.1rem);',
    'color:var(--brown);line-height:1.2;margin-bottom:6px}',
  '.pd-name-si{font-size:.9rem;color:var(--brown-light);font-style:italic;margin-bottom:14px}',

  /* Rating row */
  '.pd-rating{display:flex;align-items:center;gap:9px;margin-bottom:20px}',
  '.pd-stars{color:var(--gold-light);font-size:1rem;letter-spacing:.04em}',
  '.pd-rating-count{font-family:var(--font-sub);font-size:.72rem;color:var(--brown-light)}',

  /* Price block */
  '.pd-price-block{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--cream-dark)}',
  '.pd-price{font-family:var(--font-head);font-size:2.1rem;color:var(--red);line-height:1}',
  '.pd-price-note{font-size:.74rem;color:var(--brown-light);margin-top:5px;font-style:italic}',

  /* Meta chips */
  '.pd-meta{display:flex;gap:16px;margin-bottom:18px;flex-wrap:wrap}',
  '.pd-meta-chip{background:var(--cream-dark);border-radius:8px;padding:8px 14px;min-width:80px}',
  '.pd-meta-label{font-family:var(--font-sub);font-size:.58rem;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--brown-light);margin-bottom:3px}',
  '.pd-meta-val{font-family:var(--font-sub);font-size:.82rem;color:var(--brown);font-weight:600}',

  /* Stock badge */
  '.pd-stock{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-sub);',
    'font-size:.72rem;letter-spacing:.08em;margin-bottom:26px;padding:7px 16px;border-radius:99px}',
  '.pd-stock.in{background:rgba(42,92,63,.1);color:var(--green);border:1px solid rgba(42,92,63,.2)}',
  '.pd-stock.low{background:rgba(251,191,36,.1);color:#92400e;border:1px solid rgba(251,191,36,.2)}',
  '.pd-stock.out{background:rgba(139,37,0,.08);color:var(--red);border:1px solid rgba(139,37,0,.15)}',
  '.pd-stock-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:currentColor}',

  /* Action buttons */
  '.pd-actions{display:flex;gap:12px;align-items:center}',
  '.pd-cart-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;',
    'padding:15px 24px;background:var(--red);color:white;border-radius:99px;',
    'font-family:var(--font-sub);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;',
    'cursor:pointer;border:none;transition:.2s}',
  '.pd-cart-btn:hover:not(:disabled){background:var(--red-light);transform:translateY(-1px);',
    'box-shadow:0 6px 20px rgba(139,37,0,.3)}',
  '.pd-cart-btn:disabled{opacity:.5;cursor:not-allowed}',
  '.pd-wish-btn{width:52px;height:52px;border-radius:50%;border:1.5px solid var(--cream-dark);',
    'background:white;display:flex;align-items:center;justify-content:center;',
    'font-size:1.1rem;color:var(--brown-light);cursor:pointer;transition:.2s;flex-shrink:0}',
  '.pd-wish-btn:hover{border-color:var(--red);color:var(--red)}',
  '.pd-wish-btn.wished{border-color:var(--red);color:var(--red);background:rgba(139,37,0,.05)}',

  /* ── TABS ── */
  '.pd-tabs-section{background:white;border-top:1px solid var(--cream-dark);',
    'border-bottom:1px solid var(--cream-dark);margin-bottom:60px}',
  '.pd-tab-nav{display:flex;border-bottom:1px solid var(--cream-dark);overflow-x:auto;scrollbar-width:none}',
  '.pd-tab-nav::-webkit-scrollbar{display:none}',
  '.pd-tab-btn{padding:17px 26px;font-family:var(--font-sub);font-size:.75rem;',
    'letter-spacing:.1em;text-transform:uppercase;color:var(--brown-light);',
    'cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;',
    'margin-bottom:-1px;transition:.2s;white-space:nowrap}',
  '.pd-tab-btn:hover{color:var(--brown)}',
  '.pd-tab-btn.active{color:var(--red);border-bottom-color:var(--red)}',
  '.pd-tab-panel{display:none;padding:32px 0}',
  '.pd-tab-panel.active{display:block}',
  '.pd-tab-text{font-size:.95rem;line-height:1.9;color:var(--brown);max-width:700px}',

  /* Reviews list */
  '.pd-reviews-list{display:flex;flex-direction:column;gap:18px;margin-bottom:32px}',
  '.pd-review{display:flex;gap:16px;padding:20px;background:var(--cream);',
    'border-radius:14px;border:1px solid var(--cream-dark)}',
  '.pd-review-av{width:44px;height:44px;border-radius:50%;background:var(--red);',
    'color:var(--gold-light);display:flex;align-items:center;justify-content:center;',
    'font-family:var(--font-head);font-size:.9rem;flex-shrink:0}',
  '.pd-review-name{font-family:var(--font-sub);font-size:.8rem;color:var(--brown);margin-bottom:4px}',
  '.pd-review-stars{color:var(--gold-light);font-size:.9rem;margin-bottom:6px}',
  '.pd-review-text{font-size:.88rem;color:var(--brown-light);line-height:1.65}',
  '.pd-review-date{font-size:.7rem;color:var(--brown-light);opacity:.55;margin-top:6px;font-family:var(--font-sub)}',

  /* Review form */
  '.pd-review-form{background:var(--cream);border:1px solid var(--cream-dark);border-radius:16px;padding:24px}',
  '.pd-review-form h3{font-family:var(--font-sub);font-size:.82rem;letter-spacing:.1em;',
    'text-transform:uppercase;color:var(--brown);margin-bottom:16px}',
  '.pd-star-picker{display:flex;gap:4px;margin-bottom:14px}',
  '.pd-star-k{font-size:1.8rem;cursor:pointer;border:none;background:none;',
    'color:var(--cream-deep);transition:.15s;padding:0;line-height:1}',
  '.pd-star-k.lit{color:var(--gold-light)}',
  '.pd-star-k:hover{transform:scale(1.2)}',
  '.pd-review-ta{width:100%;padding:12px;border:1.5px solid var(--cream-dark);',
    'border-radius:10px;font-family:var(--font-body);font-size:.88rem;',
    'background:white;color:var(--brown);resize:vertical;min-height:88px;outline:none;transition:.2s}',
  '.pd-review-ta:focus{border-color:var(--gold)}',
  '.pd-review-submit{margin-top:12px;padding:11px 28px;background:var(--red);color:white;',
    'border-radius:99px;font-family:var(--font-sub);font-size:.74rem;',
    'letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
  '.pd-review-submit:hover{background:var(--red-light)}',
  '.pd-review-submit:disabled{opacity:.5;cursor:not-allowed}',

  /* ── RELATED ── */
  '.pd-related{padding:0 0 72px}',
  '.pd-related-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.2em;',
    'text-transform:uppercase;color:var(--gold);margin-bottom:8px}',
  '.pd-related-title{font-family:var(--font-head);font-size:1.5rem;color:var(--brown);margin-bottom:28px}',

  /* Not found / error */
  '.pd-not-found{min-height:60vh;display:flex;flex-direction:column;align-items:center;',
    'justify-content:center;gap:16px;text-align:center;padding:40px}',
  '.pd-not-found .nf-icon{font-size:4rem}',
  '.pd-not-found h2{font-family:var(--font-head);font-size:1.4rem;color:var(--brown)}',
  '.pd-not-found p{color:var(--brown-light);font-style:italic}',

  /* Loading */
  '.pd-loading{min-height:70vh;display:flex;align-items:center;justify-content:center;',
    'flex-direction:column;gap:14px;color:var(--brown-light);font-style:italic}',

  /* Responsive */
  '@media(max-width:900px){',
    '.pd-hero{grid-template-columns:1fr;gap:0}',
    '.pd-gallery{position:static}',
    '.pd-breadcrumb{padding:72px 0 0}',
  '}',
  '@media(max-width:600px){',
    /* breadcrumb — compact, only back link shown */
    '.pd-breadcrumb{padding:68px 0 0;background:transparent}',
    '.pd-bc-inner{gap:0;padding-bottom:8px}',
    '.pd-bc-sep,.pd-bc-cur{display:none}',
    '.pd-bc-link:not(:first-of-type){display:none}',
    '.pd-bc-link:first-of-type{font-size:.68rem;display:flex;align-items:center;gap:5px;color:var(--brown-light)}',
    '.pd-bc-link:first-of-type::before{content:"\\2190";font-size:.8rem}',

    /* image — edge-to-edge */
    '.pd-gallery{margin:0 -16px}',
    '.pd-main-wrap{border-radius:0;aspect-ratio:4/3}',
    '.pd-thumbs{padding:10px 16px 0}',

    /* info — lifted white card over image */
    '.pd-info{background:white;border-radius:20px 20px 0 0;margin:-22px -16px 0;',
      'padding:24px 20px 20px;position:relative;z-index:2;',
      'box-shadow:0 -2px 20px rgba(61,28,2,.08)}',

    '.pd-hero{padding:0 0 0}',
    '.pd-name{font-size:1.45rem}',
    '.pd-price{font-size:1.55rem}',
    '.pd-cart-btn{font-size:.74rem;padding:14px 16px}',
    '.pd-wish-btn{width:48px;height:48px}',
    '.pd-meta{gap:10px}',
    '.pd-meta-chip{padding:7px 12px}',
    '.pd-tab-btn{padding:12px 14px;font-size:.65rem}',
    '.pd-tab-panel{padding:20px 0}',
    '.pd-reviews-list{gap:14px}',
    '.pd-review{padding:16px;gap:12px}',
    '.pd-related-title{font-size:1.2rem}',
    '.pd-tabs-section{margin:0 -16px}',
    '.pd-tabs-section .container{padding:0 16px}',
  '}',
  '@media(max-width:380px){',
    '.pd-name{font-size:1.25rem}',
    '.pd-info{padding:20px 16px 16px}',
    '.pd-meta{gap:8px}',
    '.pd-meta-chip{padding:6px 10px;min-width:60px}',
    '.pd-meta-val{font-size:.76rem}',
    '.products-grid{grid-template-columns:repeat(2,1fr);gap:8px}',
  '}',
].join('');

/* ── Module-level carousel state ── */
var slideCount = 1;
var slideIndex = 0;

/* ── Set every slide to the exact pixel size of the wrap ── */
function initSlides(container) {
  var wrap = container.querySelector('.pd-main-wrap');
  if (!wrap) return;
  var w = wrap.offsetWidth;
  var h = wrap.offsetHeight;
  if (!w) return;
  container.querySelectorAll('.pd-slide').forEach(function(s) {
    s.style.width    = w + 'px';
    s.style.minWidth = w + 'px';
    s.style.height   = h + 'px';
  });
  /* Re-position after resize */
  var track = container.querySelector('#pd-track');
  if (track) track.style.transform = 'translateX(-' + (slideIndex * w) + 'px)';
}

/* ── Move to slide n ── */
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

/* ── Carousel HTML ── */
function buildCarousel(images) {
  var imgs = (images && images.length) ? images : [];

  var slidesHTML = '';
  if (!imgs.length) {
    slidesHTML = '<div class="pd-slide">🌶️</div>';
  } else {
    for (var i = 0; i < imgs.length; i++) {
      slidesHTML += '<div class="pd-slide">'
        + '<img src="' + imgs[i] + '" alt="Product image" loading="' + (i === 0 ? 'eager' : 'lazy') + '" />'
        + '</div>';
    }
  }

  var dotsHTML = '';
  var thumbsHTML = '';
  for (var j = 0; j < imgs.length; j++) {
    dotsHTML  += '<button class="pd-dot' + (j === 0 ? ' active' : '') + '" data-dot="' + j + '"></button>';
    thumbsHTML += '<div class="pd-thumb' + (j === 0 ? ' active' : '') + '" data-thumb="' + j + '">'
      + '<img src="' + imgs[j] + '" loading="lazy" /></div>';
  }

  var hideClass = imgs.length <= 1 ? ' pd-hidden' : '';

  return '<div class="pd-main-wrap">'
    + '<div class="pd-track" id="pd-track">' + slidesHTML + '</div>'
    + '<button class="pd-nav pd-prev' + hideClass + '" id="pd-prev"><i class="fas fa-chevron-left"></i></button>'
    + '<button class="pd-nav pd-next' + hideClass + '" id="pd-next"><i class="fas fa-chevron-right"></i></button>'
    + (imgs.length > 1 ? '<div class="pd-dots">' + dotsHTML + '</div>' : '')
    + '</div>'
    + (imgs.length > 1 ? '<div class="pd-thumbs" id="pd-thumbs">' + thumbsHTML + '</div>' : '');
}

/* ── Star display ── */
function buildStars(avg) {
  var full = Math.round(avg);
  var html = '';
  for (var i = 1; i <= 5; i++) html += (i <= full ? '★' : '☆');
  return html;
}

/* ── Stock badge ── */
function buildStock(stock) {
  var cls, label;
  if (!stock || stock <= 0)  { cls = 'out'; label = 'Out of Stock'; }
  else if (stock < 10)       { cls = 'low'; label = 'Low Stock — ' + stock + ' left'; }
  else                       { cls = 'in';  label = 'In Stock'; }
  return '<div class="pd-stock ' + cls + '"><span class="pd-stock-dot"></span>' + label + '</div>';
}

/* ── Reviews panel HTML ── */
function buildReviewsHTML(reviews) {
  var listHTML = '';
  if (!reviews.length) {
    listHTML = '<p style="color:var(--brown-light);font-style:italic;margin-bottom:24px">No reviews yet. Be the first to share your experience!</p>';
  } else {
    for (var i = 0; i < reviews.length; i++) {
      var r    = reviews[i];
      var name = (r.user && (r.user.full_name || r.user.email)) || 'Customer';
      var init = name.charAt(0).toUpperCase();
      var dt   = new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      listHTML += '<div class="pd-review">'
        + '<div class="pd-review-av">' + init + '</div>'
        + '<div style="flex:1">'
        + '<div class="pd-review-name">' + name + '</div>'
        + '<div class="pd-review-stars">' + buildStars(r.rating) + '</div>'
        + (r.comment ? '<div class="pd-review-text">' + r.comment + '</div>' : '')
        + '<div class="pd-review-date">' + dt + '</div>'
        + '</div></div>';
    }
  }

  return '<div class="pd-reviews-list">' + listHTML + '</div>'
    + '<div class="pd-review-form">'
    + '<h3>Write a Review</h3>'
    + '<div class="pd-star-picker" id="pd-star-picker">'
    + '<button class="pd-star-k" data-star="1">★</button>'
    + '<button class="pd-star-k" data-star="2">★</button>'
    + '<button class="pd-star-k" data-star="3">★</button>'
    + '<button class="pd-star-k" data-star="4">★</button>'
    + '<button class="pd-star-k" data-star="5">★</button>'
    + '</div>'
    + '<textarea class="pd-review-ta" id="pd-review-ta" placeholder="Share your experience with this spice..."></textarea>'
    + '<button class="pd-review-submit" id="pd-review-submit">Submit Review</button>'
    + '</div>';
}

/* ── Related product card HTML ── */
function buildRelatedCard(p) {
  var img = (p.images && p.images[0])
    ? '<img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy" />'
    : '<span style="font-size:3rem">🌶️</span>';
  return '<div class="product-card" data-id="' + p.id + '">'
    + '<div class="product-img">' + img + '</div>'
    + '<div class="product-info">'
    + '<p class="product-cat">' + (p.category ? p.category.name : 'Spices') + '</p>'
    + '<h3 class="product-name">' + p.name + '</h3>'
    + '<p class="product-weight">' + p.weight_grams + 'g</p>'
    + '<div class="product-footer">'
    + '<span class="product-price" data-lkr="' + p.price_lkr + '">' + formatPrice(p.price_lkr) + '</span>'
    + '<button class="product-add" data-add="' + p.id + '"><i class="fas fa-plus"></i></button>'
    + '</div></div></div>';
}

/* ── Full page HTML ── */
function buildPage(product, reviews, related) {
  var images   = product.images || [];
  var catName  = product.category ? product.category.name : 'Spices';
  var catSlug  = product.category ? product.category.slug : '';
  var avgRating = reviews.length
    ? reviews.reduce(function(s, r) { return s + r.rating; }, 0) / reviews.length
    : 0;
  var wished = state.wishlist.includes(product.id);
  var oos    = !product.stock || product.stock <= 0;

  /* Story section — skip if it is variant data */
  var storyContent = '';
  if (product.story && product.story.indexOf('[VARIANTS]') !== 0) {
    storyContent = '<div class="pd-tab-text">' + product.story.replace(/\n/g, '<br>') + '</div>';
  } else {
    storyContent = '<p style="color:var(--brown-light);font-style:italic">The story behind this spice is being written...</p>';
  }

  /* Related section */
  var relatedSection = '';
  if (related && related.length) {
    var cards = '';
    for (var i = 0; i < related.length; i++) cards += buildRelatedCard(related[i]);
    relatedSection = '<div class="container"><div class="pd-related">'
      + '<p class="pd-related-eyebrow">You Might Also Like</p>'
      + '<h2 class="pd-related-title">More from ' + catName + '</h2>'
      + '<div class="products-grid">' + cards + '</div>'
      + '</div></div>';
  }

  slideCount = images.length || 1;
  slideIndex = 0;

  return '<div class="pd-page">'

    /* ── Breadcrumb ── */
    + '<div class="pd-breadcrumb"><div class="container"><div class="pd-bc-inner">'
    + '<button class="pd-bc-link" data-page="home">Home</button>'
    + '<span class="pd-bc-sep">/</span>'
    + '<button class="pd-bc-link" data-page="products">Products</button>'
    + (catSlug
        ? '<span class="pd-bc-sep">/</span>'
          + '<button class="pd-bc-link" data-page="products" data-cat="' + catSlug + '">' + catName + '</button>'
        : '')
    + '<span class="pd-bc-sep">/</span>'
    + '<span class="pd-bc-cur">' + product.name + '</span>'
    + '</div></div></div>'

    /* ── Hero ── */
    + '<div class="container"><div class="pd-hero">'

    /* Gallery */
    + '<div class="pd-gallery">' + buildCarousel(images) + '</div>'

    /* Info */
    + '<div class="pd-info">'
    + '<div class="pd-cat-badge"><i class="fas fa-tag"></i> ' + catName + '</div>'
    + '<h1 class="pd-name">' + product.name + '</h1>'
    + (product.name_si ? '<p class="pd-name-si">' + product.name_si + '</p>' : '')

    /* Rating */
    + '<div class="pd-rating">'
    + '<span class="pd-stars">' + buildStars(avgRating) + '</span>'
    + '<span class="pd-rating-count">(' + reviews.length + ' review' + (reviews.length === 1 ? '' : 's') + ')</span>'
    + '</div>'

    /* Price */
    + '<div class="pd-price-block">'
    + '<div class="pd-price" id="pd-price" data-lkr="' + product.price_lkr + '">' + formatPrice(product.price_lkr) + '</div>'
    + '<div class="pd-price-note">Free shipping above $150 USD &middot; Worldwide delivery</div>'
    + '</div>'

    /* Meta chips */
    + '<div class="pd-meta">'
    + '<div class="pd-meta-chip"><div class="pd-meta-label">Weight</div><div class="pd-meta-val">' + product.weight_grams + 'g</div></div>'
    + '<div class="pd-meta-chip"><div class="pd-meta-label">Origin</div><div class="pd-meta-val">' + (product.origin || 'Sri Lanka') + '</div></div>'
    + '<div class="pd-meta-chip"><div class="pd-meta-label">Category</div><div class="pd-meta-val">' + catName + '</div></div>'
    + '</div>'

    /* Stock */
    + buildStock(product.stock)

    /* Actions */
    + '<div class="pd-actions">'
    + '<button class="pd-cart-btn" id="pd-cart-btn"' + (oos ? ' disabled' : '') + '>'
    + '<i class="fas fa-shopping-basket"></i> '
    + (oos ? 'Out of Stock' : 'Add to Cart')
    + '</button>'
    + '<button class="pd-wish-btn' + (wished ? ' wished' : '') + '" id="pd-wish-btn" aria-label="Wishlist">'
    + '<i class="' + (wished ? 'fas' : 'far') + ' fa-heart"></i>'
    + '</button>'
    + '</div>'

    + '</div>'/* /pd-info */
    + '</div></div>'/* /pd-hero /container */

    /* ── Tabs ── */
    + '<div class="pd-tabs-section"><div class="container">'
    + '<div class="pd-tab-nav">'
    + '<button class="pd-tab-btn active" data-tab="desc">Description</button>'
    + '<button class="pd-tab-btn" data-tab="story">Origin Story</button>'
    + '<button class="pd-tab-btn" data-tab="reviews">Reviews (' + reviews.length + ')</button>'
    + '</div>'
    + '<div id="pd-tab-desc" class="pd-tab-panel active">'
    + (product.description
        ? '<div class="pd-tab-text">' + product.description + '</div>'
        : '<p style="color:var(--brown-light);font-style:italic">Product details coming soon...</p>')
    + '</div>'
    + '<div id="pd-tab-story" class="pd-tab-panel">' + storyContent + '</div>'
    + '<div id="pd-tab-reviews" class="pd-tab-panel">' + buildReviewsHTML(reviews) + '</div>'
    + '</div></div>'/* /tabs */

    /* ── Related ── */
    + relatedSection

    + '</div>';/* /pd-page */
}

/* ── Wire all events ── */
function wireEvents(container, product) {
  /* Carousel — prev / next */
  var prevBtn = container.querySelector('#pd-prev');
  var nextBtn = container.querySelector('#pd-next');
  if (prevBtn) prevBtn.addEventListener('click', function() { goToSlide(slideIndex - 1, container); });
  if (nextBtn) nextBtn.addEventListener('click', function() { goToSlide(slideIndex + 1, container); });

  /* Dot clicks */
  container.querySelectorAll('.pd-dot').forEach(function(dot) {
    dot.addEventListener('click', function() { goToSlide(parseInt(dot.dataset.dot), container); });
  });

  /* Thumbnail clicks */
  container.querySelectorAll('.pd-thumb').forEach(function(thumb) {
    thumb.addEventListener('click', function() { goToSlide(parseInt(thumb.dataset.thumb), container); });
  });

  /* Touch swipe on carousel */
  var track = container.querySelector('#pd-track');
  if (track) {
    var touchStartX = 0;
    track.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) {
        goToSlide(diff > 0 ? slideIndex + 1 : slideIndex - 1, container);
      }
    }, { passive: true });
  }

  /* Breadcrumb navigation */
  container.querySelectorAll('.pd-bc-link').forEach(function(el) {
    el.addEventListener('click', function() {
      var params = {};
      if (el.dataset.cat) params.cat = el.dataset.cat;
      router.go(el.dataset.page, params);
    });
  });

  /* Add to cart */
  var cartBtn = container.querySelector('#pd-cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function() { addToCart(product.id); });
  }

  /* Wishlist toggle */
  var wishBtn = container.querySelector('#pd-wish-btn');
  if (wishBtn) {
    wishBtn.addEventListener('click', function() {
      toggleWishlist(product.id).then(function() {
        var inWish = state.wishlist.includes(product.id);
        wishBtn.classList.toggle('wished', inWish);
        var icon = wishBtn.querySelector('i');
        if (icon) icon.className = inWish ? 'fas fa-heart' : 'far fa-heart';
      });
    });
  }

  /* Tabs */
  container.querySelectorAll('.pd-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.pd-tab-btn').forEach(function(b) { b.classList.remove('active'); });
      container.querySelectorAll('.pd-tab-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = container.querySelector('#pd-tab-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* Star rating picker */
  var selectedRating = 0;
  var starBtns = container.querySelectorAll('.pd-star-k');
  starBtns.forEach(function(btn) {
    var n = parseInt(btn.dataset.star);
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
  var submitBtn = container.querySelector('#pd-review-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', async function() {
      if (!state.user) {
        showToast('Please sign in to leave a review', 'error');
        router.go('login');
        return;
      }
      if (!selectedRating) {
        showToast('Please select a star rating', 'error');
        return;
      }
      var comment = (container.querySelector('#pd-review-ta').value || '').trim();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      var res = await supabase.from('reviews').insert({
        user_id:     state.user.id,
        product_id:  product.id,
        rating:      selectedRating,
        comment:     comment || null,
        is_approved: false,
      });
      submitBtn.disabled  = false;
      submitBtn.textContent = 'Submit Review';
      if (res.error) { showToast(res.error.message, 'error'); return; }
      showToast('Review submitted! It will appear after admin approval.', 'success');
      container.querySelector('#pd-review-ta').value = '';
      selectedRating = 0;
      starBtns.forEach(function(b) { b.classList.remove('lit'); });
    });
  }

  /* Related cards — delegated */
  container.querySelectorAll('[data-add]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      addToCart(btn.dataset.add);
    });
  });
  container.querySelectorAll('.product-card[data-id]').forEach(function(card) {
    card.addEventListener('click', function() {
      router.go('product', { id: card.dataset.id });
    });
  });

  /* Currency change */
  document.addEventListener('currencyChange', function onCC() {
    var el = container.querySelector('#pd-price');
    if (el) el.textContent = formatPrice(parseFloat(el.dataset.lkr));
    container.querySelectorAll('.product-price[data-lkr]').forEach(function(e) {
      e.textContent = formatPrice(parseFloat(e.dataset.lkr));
    });
  });
}

/* ── Init ── */
export async function init(container, params) {
  /* Inject CSS once */
  if (!document.getElementById('product-css')) {
    var style       = document.createElement('style');
    style.id        = 'product-css';
    style.textContent = PRODUCT_CSS;
    document.head.appendChild(style);
  }

  var productId = params && params.id;

  if (!productId) {
    container.innerHTML = '<div class="pd-not-found">'
      + '<div class="nf-icon">🌶️</div>'
      + '<h2>No product selected</h2>'
      + '<p>Please browse our spice collection.</p>'
      + '</div>';
    return;
  }

  /* Show spinner */
  container.innerHTML = '<div class="pd-loading">'
    + '<i class="fas fa-spinner fa-spin" style="font-size:2.2rem;color:var(--red)"></i>'
    + '<span>Loading product...</span>'
    + '</div>';

  try {
    /* Fetch product (no FK join) */
    var pRes = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (pRes.error || !pRes.data) {
      container.innerHTML = '<div class="pd-not-found">'
        + '<div class="nf-icon">&#127798;</div>'
        + '<h2>Product not found</h2>'
        + '<p>This spice may have been removed or is unavailable.</p>'
        + '</div>';
      return;
    }

    var product = pRes.data;

    /* Fetch category, reviews, related separately (avoids FK dependency) */
    var catProm = product.category_id
      ? supabase.from('categories').select('name, slug').eq('id', product.category_id).single()
      : Promise.resolve({ data: null });

    var results = await Promise.all([
      catProm,
      supabase.from('reviews')
        .select('id, rating, comment, created_at, user_id')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false }),
      supabase.from('products')
        .select('id, name, images, price_lkr, weight_grams')
        .eq('category_id', product.category_id)
        .neq('id', productId)
        .limit(4),
    ]);

    if (results[0].data) product.category = results[0].data;
    var reviews = results[1].data || [];
    var related = results[2].data || [];

    /* Render */
    container.innerHTML = buildPage(product, reviews, related);

    /* Size slides with explicit px (must run after DOM insertion) */
    initSlides(container);

    /* Re-size on window resize */
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() { initSlides(container); }, 120);
    });

    /* Wire */
    wireEvents(container, product);
    initReveals();

  } catch (err) {
    console.error('[Product] Error:', err);
    container.innerHTML = '<div class="pd-not-found">'
      + '<div class="nf-icon">😞</div>'
      + '<h2>Something went wrong</h2>'
      + '<p>Please refresh and try again.</p>'
      + '</div>';
  }
}

export default init;
