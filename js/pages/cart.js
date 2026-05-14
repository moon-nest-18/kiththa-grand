/* ================================================================
   KITHTHA GRAND — Cart Page
   js/pages/cart.js
================================================================ */

import { router }                                          from '../router.js';
import { showToast, formatPrice, loadCart,
         removeFromCart, setCartQuantity,
         initReveals, state }                              from '../app.js';

/* ── CSS ── */
function injectStyles() {
  if (document.getElementById('cart-styles')) return;
  var s = document.createElement('style');
  s.id = 'cart-styles';
  s.textContent = [
    '.ct-page{min-height:100vh;background:var(--cream)}',
    /* hero */
    '.ct-hero{background:#0a0502;padding:120px 0 72px;position:relative;overflow:hidden}',
    '.ct-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 60% 50%,rgba(139,37,0,.85) 0%,rgba(61,28,2,.95) 60%,#0a0502 100%)}',
    '.ct-hero-ov{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(200,144,10,.03) 40px,rgba(200,144,10,.03) 80px)}',
    '.ct-hero .container{position:relative;z-index:1}',
    '.ct-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}',
    '.ct-hero h1{font-family:var(--font-head);font-size:clamp(2rem,5vw,3.2rem);color:var(--cream);line-height:1.2;margin-bottom:10px}',
    '.ct-hero-sub{font-size:.9rem;color:rgba(253,243,227,.5);font-style:italic}',
    /* body layout */
    '.ct-body{padding:48px 0 80px}',
    '.ct-layout{display:grid;grid-template-columns:1fr 360px;gap:32px;align-items:start}',
    '.ct-left-head{font-family:var(--font-sub);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--brown-light);margin-bottom:20px;display:flex;align-items:center;justify-content:space-between}',
    '.ct-left-head b{font-family:var(--font-sub);font-size:.72rem;color:var(--brown);letter-spacing:.06em;font-weight:600}',
    /* cart item */
    '.ct-item{background:white;border-radius:16px;padding:18px;display:flex;gap:16px;align-items:center;border:1px solid var(--cream-dark);transition:border-color .2s,box-shadow .2s;margin-bottom:10px}',
    '.ct-item:last-child{margin-bottom:0}',
    '.ct-item:hover{border-color:rgba(200,144,10,.25);box-shadow:0 4px 16px rgba(61,28,2,.07)}',
    '.ct-item.removing{opacity:0;transform:scale(.97);transition:opacity .25s,transform .25s}',
    '.ci-thumb{width:76px;min-width:76px;height:76px;border-radius:12px;overflow:hidden;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;flex-shrink:0}',
    '.ci-thumb img{width:100%;height:100%;object-fit:cover}',
    '.ci-info{flex:1;min-width:0}',
    '.ci-name{font-family:var(--font-sub);font-size:.88rem;letter-spacing:.03em;color:var(--brown);margin-bottom:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}',
    '.ci-name:hover{color:var(--red)}',
    '.ci-meta{font-size:.74rem;color:var(--brown-light);font-style:italic;margin-bottom:8px}',
    '.ci-line-price{font-family:var(--font-sub);font-size:.92rem;color:var(--red);font-weight:600}',
    '.ci-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0}',
    /* qty */
    '.ci-qty{display:flex;align-items:center;border:1.5px solid var(--cream-dark);border-radius:10px;overflow:hidden}',
    '.ci-qbtn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--cream);border:none;cursor:pointer;color:var(--brown);transition:.15s;font-size:.75rem}',
    '.ci-qbtn:hover{background:var(--cream-dark)}',
    '.ci-qbtn:disabled{opacity:.4;cursor:not-allowed}',
    '.ci-qval{width:34px;text-align:center;font-family:var(--font-sub);font-size:.82rem;color:var(--brown);background:white;pointer-events:none}',
    '.ci-rm{background:none;border:none;cursor:pointer;color:rgba(139,37,0,.35);font-size:.8rem;padding:4px;transition:.15s}',
    '.ci-rm:hover{color:var(--red)}',
    /* summary */
    '.ct-summary{background:white;border-radius:20px;padding:28px;border:1px solid var(--cream-dark);position:sticky;top:100px}',
    '.cs-head{font-family:var(--font-head);font-size:1.15rem;color:var(--brown);margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--cream-dark)}',
    '.cs-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:.88rem}',
    '.cs-lbl{color:var(--brown-light);font-style:italic}',
    '.cs-val{font-family:var(--font-sub);color:var(--brown);font-size:.84rem}',
    '.cs-hr{border:none;border-top:1px solid var(--cream-dark);margin:8px 0}',
    '.cs-total{display:flex;justify-content:space-between;align-items:center;padding:10px 0 20px}',
    '.cs-total-lbl{font-family:var(--font-sub);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown)}',
    '.cs-total-val{font-family:var(--font-head);font-size:1.35rem;color:var(--red)}',
    '.cs-checkout{width:100%;padding:14px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:12px;font-family:var(--font-sub);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px}',
    '.cs-checkout:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(139,37,0,.3)}',
    '.cs-continue{width:100%;padding:12px;background:transparent;border:1.5px solid rgba(61,28,2,.15);color:var(--brown-light);border-radius:12px;font-family:var(--font-sub);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:.2s}',
    '.cs-continue:hover{border-color:rgba(61,28,2,.3);color:var(--brown)}',
    '.cs-ship-wrap{margin:16px 0 0}',
    '.cs-ship-bar{height:5px;border-radius:99px;background:var(--cream-dark);overflow:hidden;margin-bottom:6px}',
    '.cs-ship-fill{height:100%;border-radius:99px;background:linear-gradient(to right,var(--gold-light),var(--gold));transition:width .4s ease}',
    '.cs-ship-note{font-size:.71rem;color:var(--brown-light);font-style:italic;text-align:center;line-height:1.5}',
    /* empty */
    '.ct-empty{text-align:center;padding:80px 24px}',
    '.ct-empty-ico{font-size:4rem;display:block;margin-bottom:16px}',
    '.ct-empty h2{font-family:var(--font-head);font-size:1.6rem;color:var(--brown);margin-bottom:8px}',
    '.ct-empty p{font-size:.9rem;color:var(--brown-light);font-style:italic;margin-bottom:28px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.7}',
    '.ct-empty-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:99px;font-family:var(--font-sub);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;border:none;transition:.25s}',
    '.ct-empty-btn:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(139,37,0,.3)}',
    /* skeleton */
    '.ct-skel{background:linear-gradient(90deg,var(--cream) 25%,var(--cream-dark) 50%,var(--cream) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:6px}',
    '.ct-skel-item{background:white;border-radius:16px;padding:18px;display:flex;gap:16px;align-items:center;border:1px solid var(--cream-dark);margin-bottom:10px}',
    '.ct-skel-thumb{width:76px;min-width:76px;height:76px;border-radius:12px;flex-shrink:0}',
    '.ct-skel-lines{flex:1;display:flex;flex-direction:column;gap:8px}',
    /* responsive */
    '@media(max-width:860px){',
      '.ct-layout{grid-template-columns:1fr}',
      '.ct-summary{position:static}',
    '}',
    '@media(max-width:480px){',
      '.ct-item{padding:12px;gap:10px}',
      '.ci-thumb{width:60px;min-width:60px;height:60px}',
      '.ci-meta{display:none}',
    '}',
  ].join('');
  document.head.appendChild(s);
}

/* ── Skeleton ── */
function skelItem() {
  return '<div class="ct-skel-item">'
    + '<div class="ct-skel ct-skel-thumb"></div>'
    + '<div class="ct-skel-lines">'
    + '<div class="ct-skel" style="height:13px;width:55%"></div>'
    + '<div class="ct-skel" style="height:10px;width:35%"></div>'
    + '<div class="ct-skel" style="height:12px;width:25%"></div>'
    + '</div>'
    + '</div>';
}

/* ── Calc subtotal ── */
function calcSubtotal() {
  var total = 0;
  (state.cart || []).forEach(function(item) {
    if (item.product) total += parseFloat(item.product.price_lkr || 0) * (item.quantity || 1);
  });
  return total;
}

/* ── Render empty / auth states ── */
function renderEmpty(wrap, type) {
  if (type === 'auth') {
    wrap.innerHTML = '<div class="ct-empty">'
      + '<span class="ct-empty-ico">&#128274;</span>'
      + '<h2>Sign In to View Your Cart</h2>'
      + '<p>Your cart items are saved to your account. Sign in to continue.</p>'
      + '<button class="ct-empty-btn" id="ct-login"><i class="fas fa-user"></i> Sign In</button>'
      + '</div>';
    var btn = document.getElementById('ct-login');
    if (btn) btn.addEventListener('click', function() { router.go('login'); });
  } else {
    wrap.innerHTML = '<div class="ct-empty">'
      + '<span class="ct-empty-ico">&#128722;</span>'
      + '<h2>Your Cart is Empty</h2>'
      + '<p>You have not added any spices yet. Explore our collection and find your favourites.</p>'
      + '<button class="ct-empty-btn" id="ct-shop"><i class="fas fa-leaf"></i> Shop Now</button>'
      + '</div>';
    var btn2 = document.getElementById('ct-shop');
    if (btn2) btn2.addEventListener('click', function() { router.go('products'); });
  }
}

/* ── Render full cart content ── */
function renderCart(container) {
  var wrap = document.getElementById('ct-wrap');
  if (!wrap) return;

  if (!state.user)                        { renderEmpty(wrap, 'auth');  return; }
  if (!state.cart || !state.cart.length)  { renderEmpty(wrap, 'empty'); return; }

  var subtotal   = calcSubtotal();
  var freeThresh = 150 / 0.0033;
  var pct        = Math.min(100, Math.round((subtotal / freeThresh) * 100));
  var remain     = Math.max(0, freeThresh - subtotal);
  var shipNote   = remain > 0
    ? 'Add ' + formatPrice(remain) + ' more for free shipping'
    : 'You qualify for free shipping! &#127881;';
  var shipLabel  = remain > 0 ? 'Calculated at checkout' : 'Free &#127881;';
  var count      = state.cart.length;

  /* items HTML */
  var itemsHTML = '';
  state.cart.forEach(function(item) {
    if (!item.product) return;
    var p   = item.product;
    var qty = item.quantity || 1;

    var imgHtml = (p.images && p.images.length)
      ? '<img src="' + p.images[0] + '" alt="' + (p.name || '') + '">'
      : '&#127798;';

    var minusIcon = qty === 1
      ? '<i class="fas fa-trash-alt"></i>'
      : '<i class="fas fa-minus"></i>';

    var meta = '';
    if (p.weight_grams) meta += p.weight_grams + 'g';
    if (p.origin)       meta += (meta ? ' &middot; ' : '') + p.origin;
    if (!meta)          meta = 'Pure Ceylon Spice';

    itemsHTML += '<div class="ct-item" data-pid="' + item.product_id + '">'
      + '<div class="ci-thumb" data-goto="' + item.product_id + '">' + imgHtml + '</div>'
      + '<div class="ci-info">'
      +   '<span class="ci-name" data-goto="' + item.product_id + '">' + (p.name || '') + '</span>'
      +   '<p class="ci-meta">' + meta + '</p>'
      +   '<p class="ci-line-price">' + formatPrice(parseFloat(p.price_lkr || 0) * qty) + '</p>'
      + '</div>'
      + '<div class="ci-right">'
      +   '<div class="ci-qty">'
      +     '<button class="ci-qbtn" data-minus="' + item.product_id + '" data-qty="' + qty + '" title="Decrease">' + minusIcon + '</button>'
      +     '<span class="ci-qval">' + qty + '</span>'
      +     '<button class="ci-qbtn" data-plus="' + item.product_id + '" data-qty="' + qty + '" title="Increase"><i class="fas fa-plus"></i></button>'
      +   '</div>'
      +   '<button class="ci-rm" data-rm="' + item.product_id + '" title="Remove item"><i class="fas fa-trash-alt"></i></button>'
      + '</div>'
      + '</div>';
  });

  wrap.innerHTML = '<div class="ct-layout">'
    + '<div>'
    +   '<div class="ct-left-head"><span>Items</span><b>' + count + ' item' + (count !== 1 ? 's' : '') + '</b></div>'
    +   '<div id="ct-items">' + itemsHTML + '</div>'
    + '</div>'
    + '<div class="ct-summary">'
    +   '<h3 class="cs-head">Order Summary</h3>'
    +   '<div class="cs-row"><span class="cs-lbl">Subtotal</span><span class="cs-val">' + formatPrice(subtotal) + '</span></div>'
    +   '<div class="cs-row"><span class="cs-lbl">Shipping</span><span class="cs-val">' + shipLabel + '</span></div>'
    +   '<hr class="cs-hr">'
    +   '<div class="cs-total"><span class="cs-total-lbl">Total</span><span class="cs-total-val">' + formatPrice(subtotal) + '</span></div>'
    +   '<button class="cs-checkout" id="cs-checkout"><i class="fas fa-lock"></i> Proceed to Checkout</button>'
    +   '<button class="cs-continue" id="cs-continue"><i class="fas fa-arrow-left"></i> Continue Shopping</button>'
    +   '<div class="cs-ship-wrap">'
    +     '<div class="cs-ship-bar"><div class="cs-ship-fill" style="width:' + pct + '%"></div></div>'
    +     '<p class="cs-ship-note">' + shipNote + '</p>'
    +   '</div>'
    + '</div>'
    + '</div>';

  /* events — delegated on items container */
  var itemsEl = document.getElementById('ct-items');
  if (itemsEl) {
    itemsEl.addEventListener('click', function(e) {
      /* navigate to product */
      var gotoEl = e.target.closest('[data-goto]');
      if (gotoEl) { router.go('product', { id: gotoEl.dataset.goto }); return; }

      /* minus / trash */
      var minusEl = e.target.closest('[data-minus]');
      if (minusEl) {
        var pid = minusEl.dataset.minus;
        var qty = parseInt(minusEl.dataset.qty, 10);
        minusEl.disabled = true;
        if (qty <= 1) {
          /* animate out then remove */
          var itemEl = itemsEl.querySelector('[data-pid="' + pid + '"]');
          if (itemEl) itemEl.classList.add('removing');
          setTimeout(function() {
            removeFromCart(pid).then(function() {
              showToast('Item removed', 'info');
              renderCart(container);
            });
          }, 260);
        } else {
          setCartQuantity(pid, qty - 1).then(function() { renderCart(container); });
        }
        return;
      }

      /* plus */
      var plusEl = e.target.closest('[data-plus]');
      if (plusEl) {
        plusEl.disabled = true;
        var pid2 = plusEl.dataset.plus;
        var qty2 = parseInt(plusEl.dataset.qty, 10);
        setCartQuantity(pid2, qty2 + 1).then(function() { renderCart(container); });
        return;
      }

      /* explicit remove button */
      var rmEl = e.target.closest('[data-rm]');
      if (rmEl) {
        var pid3 = rmEl.dataset.rm;
        var itemEl2 = itemsEl.querySelector('[data-pid="' + pid3 + '"]');
        if (itemEl2) itemEl2.classList.add('removing');
        setTimeout(function() {
          removeFromCart(pid3).then(function() {
            showToast('Item removed', 'info');
            renderCart(container);
          });
        }, 260);
      }
    });
  }

  var checkoutBtn = document.getElementById('cs-checkout');
  if (checkoutBtn) checkoutBtn.addEventListener('click', function() { router.go('checkout'); });

  var continueBtn = document.getElementById('cs-continue');
  if (continueBtn) continueBtn.addEventListener('click', function() { router.go('products'); });
}

/* ================================================================
   INIT
================================================================ */
export async function init(container) {
  injectStyles();

  if (!state.user) { router.go('login'); return; }

  /* Skeleton while loading */
  container.innerHTML = '<div class="ct-page">'
    + '<section class="ct-hero">'
    +   '<div class="ct-hero-bg"></div>'
    +   '<div class="ct-hero-ov"></div>'
    +   '<div class="container">'
    +     '<p class="ct-eyebrow">Shopping Cart</p>'
    +     '<h1 class="reveal">Your Cart</h1>'
    +     '<p class="ct-hero-sub reveal">Review your selection before checkout</p>'
    +   '</div>'
    + '</section>'
    + '<section class="ct-body"><div class="container">'
    +   '<div id="ct-wrap">'
    +     '<div class="ct-layout">'
    +       '<div>'
    +         skelItem() + skelItem() + skelItem()
    +       '</div>'
    +       '<div class="ct-summary">'
    +         '<div class="ct-skel" style="height:20px;width:60%;border-radius:6px;margin-bottom:20px"></div>'
    +         '<div class="ct-skel" style="height:12px;margin-bottom:10px"></div>'
    +         '<div class="ct-skel" style="height:12px;width:80%;margin-bottom:20px"></div>'
    +         '<div class="ct-skel" style="height:48px;border-radius:12px"></div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div></section>'
    + '</div>';

  await loadCart();
  renderCart(container);
  initReveals();
}

export default init;