/* ================================================================
   KITHTHA GRAND — Cart Page
   js/pages/cart.js
================================================================ */

import { router }                                        from '../router.js';
import { showToast, formatPrice, loadCart,
         addToCart, removeFromCart, setCartQuantity,
         initReveals, state }                            from '../app.js';

const CSS = [
  '.cart-page{min-height:100vh;background:var(--cream)}',

  /* hero */
  '.cart-hero{background:#0a0502;padding:120px 0 72px;position:relative;overflow:hidden}',
  '.cart-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 60% 50%,rgba(139,37,0,.85) 0%,rgba(61,28,2,.95) 60%,#0a0502 100%)}',
  '.cart-hero-ov{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(200,144,10,.03) 40px,rgba(200,144,10,.03) 80px)}',
  '.cart-hero .container{position:relative;z-index:1}',
  '.cart-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}',
  '.cart-hero h1{font-family:var(--font-head);font-size:clamp(2rem,5vw,3.2rem);color:var(--cream);line-height:1.2;margin-bottom:10px}',
  '.cart-hero-sub{font-size:.9rem;color:rgba(253,243,227,.5);font-style:italic}',

  /* body */
  '.cart-body{padding:48px 0 80px}',
  '.cart-grid{display:grid;grid-template-columns:1fr 360px;gap:32px;align-items:start}',
  '.cart-sec-title{font-family:var(--font-sub);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--brown-light);margin-bottom:20px;display:flex;align-items:center;justify-content:space-between}',
  '.cart-sec-title b{font-family:var(--font-sub);font-size:.72rem;color:var(--brown);letter-spacing:.06em;font-weight:600}',

  /* cart item */
  '.cart-item{background:white;border-radius:16px;padding:18px;display:flex;gap:16px;align-items:center;border:1px solid var(--cream-dark);transition:.2s;margin-bottom:10px}',
  '.cart-item:last-child{margin-bottom:0}',
  '.cart-item:hover{border-color:rgba(200,144,10,.25);box-shadow:0 4px 16px rgba(61,28,2,.07)}',
  '.ci-thumb{width:76px;min-width:76px;height:76px;border-radius:12px;overflow:hidden;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer}',
  '.ci-thumb img{width:100%;height:100%;object-fit:cover}',
  '.ci-info{flex:1;min-width:0}',
  '.ci-name{font-family:var(--font-sub);font-size:.88rem;letter-spacing:.03em;color:var(--brown);margin-bottom:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.ci-name:hover{color:var(--red)}',
  '.ci-meta{font-size:.74rem;color:var(--brown-light);font-style:italic;margin-bottom:8px}',
  '.ci-line-price{font-family:var(--font-sub);font-size:.92rem;color:var(--red)}',
  '.ci-right{display:flex;flex-direction:column;align-items:flex-end;gap:10px;min-width:fit-content}',

  /* qty control */
  '.ci-qty{display:flex;align-items:center;border:1.5px solid var(--cream-dark);border-radius:10px;overflow:hidden}',
  '.ci-qbtn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--cream);border:none;cursor:pointer;color:var(--brown);transition:.15s;touch-action:manipulation;font-size:.75rem}',
  '.ci-qbtn:hover{background:var(--cream-dark)}',
  '.ci-qval{width:34px;text-align:center;font-family:var(--font-sub);font-size:.82rem;color:var(--brown);background:white}',
  '.ci-rm{background:none;border:none;cursor:pointer;color:rgba(139,37,0,.3);font-size:.8rem;padding:4px;transition:.15s;touch-action:manipulation}',
  '.ci-rm:hover{color:var(--red)}',

  /* summary */
  '.cart-summary{background:white;border-radius:20px;padding:28px;border:1px solid var(--cream-dark);position:sticky;top:100px}',
  '.cs-head{font-family:var(--font-head);font-size:1.15rem;color:var(--brown);margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--cream-dark)}',
  '.cs-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:.88rem}',
  '.cs-row .cs-lbl{color:var(--brown-light);font-style:italic}',
  '.cs-row .cs-val{font-family:var(--font-sub);color:var(--brown);font-size:.84rem}',
  '.cs-hr{border:none;border-top:1px solid var(--cream-dark);margin:8px 0}',
  '.cs-total{display:flex;justify-content:space-between;align-items:center;padding:10px 0 20px}',
  '.cs-total-lbl{font-family:var(--font-sub);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown)}',
  '.cs-total-val{font-family:var(--font-head);font-size:1.35rem;color:var(--red)}',
  '.cs-checkout{width:100%;padding:14px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:12px;font-family:var(--font-sub);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px}',
  '.cs-checkout:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(139,37,0,.3)}',
  '.cs-shop{width:100%;padding:12px;background:transparent;border:1.5px solid rgba(61,28,2,.15);color:var(--brown-light);border-radius:12px;font-family:var(--font-sub);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:.2s}',
  '.cs-shop:hover{border-color:rgba(61,28,2,.3);color:var(--brown)}',
  '.cs-ship-bar{height:5px;border-radius:99px;background:var(--cream-dark);margin:14px 0 4px;overflow:hidden}',
  '.cs-ship-fill{height:100%;border-radius:99px;background:linear-gradient(to right,var(--gold-light),var(--gold));transition:width .4s ease}',
  '.cs-ship-note{font-size:.71rem;color:var(--brown-light);font-style:italic;text-align:center;line-height:1.5}',

  /* empty / auth */
  '.cart-empty{text-align:center;padding:80px 24px}',
  '.cart-empty-ico{font-size:4rem;display:block;margin-bottom:16px}',
  '.cart-empty h2{font-family:var(--font-head);font-size:1.6rem;color:var(--brown);margin-bottom:8px}',
  '.cart-empty p{font-size:.9rem;color:var(--brown-light);font-style:italic;margin-bottom:28px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.7}',
  '.cart-empty-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:99px;font-family:var(--font-sub);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;border:none;transition:.25s}',
  '.cart-empty-btn:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(139,37,0,.3)}',

  /* responsive */
  '@media(max-width:860px){.cart-grid{grid-template-columns:1fr}.cart-summary{position:static}}',
  '@media(max-width:480px){',
  '.cart-item{padding:14px;gap:10px}',
  '.ci-thumb{width:60px;min-width:60px;height:60px}',
  '.ci-meta{display:none}',
  '}',
].join('');

/* ── Helpers ── */
function calcSubtotal() {
  var total = 0;
  state.cart.forEach(function(item) {
    if (item.product) total += parseFloat(item.product.price_lkr || 0) * (item.quantity || 1);
  });
  return total;
}

/* ── Render states ── */
function renderEmpty(bodyEl, type) {
  if (type === 'auth') {
    bodyEl.innerHTML = (
      '<div class="cart-empty">'
        + '<span class="cart-empty-ico">&#128274;</span>'
        + '<h2>Sign In to View Your Cart</h2>'
        + '<p>Your cart items are saved to your account. Sign in to continue.</p>'
        + '<button class="cart-empty-btn js-login"><i class="fas fa-user"></i> Sign In</button>'
      + '</div>'
    );
    bodyEl.querySelector('.js-login').addEventListener('click', function() { router.go('login'); });
  } else {
    bodyEl.innerHTML = (
      '<div class="cart-empty">'
        + '<span class="cart-empty-ico">&#128722;</span>'
        + '<h2>Your Cart is Empty</h2>'
        + '<p>You have not added any spices yet. Explore our collection and find your favourites.</p>'
        + '<button class="cart-empty-btn js-shop"><i class="fas fa-leaf"></i> Shop Now</button>'
      + '</div>'
    );
    bodyEl.querySelector('.js-shop').addEventListener('click', function() { router.go('products'); });
  }
}

function renderItems(container) {
  var bodyEl = container.querySelector('#cart-body');
  if (!bodyEl) return;

  if (!state.user)                            { renderEmpty(bodyEl, 'auth');  return; }
  if (!state.cart || !state.cart.length)      { renderEmpty(bodyEl, 'empty'); return; }

  var subtotal        = calcSubtotal();
  var freeThresh      = Math.round(150 / 0.0033);
  var pct             = Math.min(100, Math.round((subtotal / freeThresh) * 100));
  var remain          = Math.max(0, freeThresh - subtotal);
  var shipNote        = remain > 0
    ? 'Add ' + formatPrice(remain) + ' more for free shipping'
    : 'You qualify for free shipping! &#127881;';

  var itemsHTML = '';
  state.cart.forEach(function(item) {
    if (!item.product) return;
    var p   = item.product;
    var img = p.images && p.images[0]
      ? '<img src="' + p.images[0] + '" alt="' + p.name + '" />'
      : '&#127798;';
    itemsHTML += (
      '<div class="cart-item">'
        + '<div class="ci-thumb js-pd" data-id="' + item.product_id + '">' + img + '</div>'
        + '<div class="ci-info">'
          + '<p class="ci-name js-pd" data-id="' + item.product_id + '">' + p.name + '</p>'
          + '<p class="ci-meta">' + (p.weight_grams || '') + 'g &middot; ' + (p.origin || 'Sri Lanka') + '</p>'
          + '<p class="ci-line-price">' + formatPrice(parseFloat(p.price_lkr) * item.quantity) + '</p>'
        + '</div>'
        + '<div class="ci-right">'
          + '<div class="ci-qty">'
            + '<button class="ci-qbtn js-minus" data-pid="' + item.product_id + '" data-qty="' + (item.quantity - 1) + '"><i class="fas fa-minus"></i></button>'
            + '<span class="ci-qval">' + item.quantity + '</span>'
            + '<button class="ci-qbtn js-plus" data-pid="' + item.product_id + '" data-qty="' + (item.quantity + 1) + '"><i class="fas fa-plus"></i></button>'
          + '</div>'
          + '<button class="ci-rm js-rm" data-pid="' + item.product_id + '" title="Remove"><i class="fas fa-trash-alt"></i></button>'
        + '</div>'
      + '</div>'
    );
  });

  bodyEl.innerHTML = (
    '<div class="cart-grid">'
      + '<div>'
        + '<div class="cart-sec-title"><span>Items</span><b>' + state.cart.length + ' item' + (state.cart.length !== 1 ? 's' : '') + '</b></div>'
        + itemsHTML
      + '</div>'
      + '<div class="cart-summary">'
        + '<h3 class="cs-head">Order Summary</h3>'
        + '<div class="cs-row"><span class="cs-lbl">Subtotal</span><span class="cs-val">' + formatPrice(subtotal) + '</span></div>'
        + '<div class="cs-row"><span class="cs-lbl">Shipping</span><span class="cs-val">' + (remain > 0 ? 'Calculated at checkout' : 'Free &#127881;') + '</span></div>'
        + '<hr class="cs-hr" />'
        + '<div class="cs-total"><span class="cs-total-lbl">Total</span><span class="cs-total-val">' + formatPrice(subtotal) + '</span></div>'
        + '<button class="cs-checkout js-checkout"><i class="fas fa-lock"></i> Proceed to Checkout</button>'
        + '<button class="cs-shop js-shop"><i class="fas fa-arrow-left"></i> Continue Shopping</button>'
        + '<div class="cs-ship-bar"><div class="cs-ship-fill" style="width:' + pct + '%"></div></div>'
        + '<p class="cs-ship-note">' + shipNote + '</p>'
      + '</div>'
    + '</div>'
  );

  /* events */
  bodyEl.querySelectorAll('.js-pd').forEach(function(el) {
    el.addEventListener('click', function() { router.go('product', { id: el.dataset.id }); });
  });

  bodyEl.querySelectorAll('.js-minus, .js-plus').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var pid = btn.dataset.pid;
      var qty = parseInt(btn.dataset.qty, 10);
      setCartQuantity(pid, qty).then(function() { renderItems(container); });
    });
  });

  bodyEl.querySelectorAll('.js-rm').forEach(function(btn) {
    btn.addEventListener('click', function() {
      removeFromCart(btn.dataset.pid).then(function() {
        showToast('Item removed', 'info');
        renderItems(container);
      });
    });
  });

  var checkoutBtn = bodyEl.querySelector('.js-checkout');
  if (checkoutBtn) checkoutBtn.addEventListener('click', function() { router.go('checkout'); });

  var shopBtn = bodyEl.querySelector('.js-shop');
  if (shopBtn) shopBtn.addEventListener('click', function() { router.go('products'); });
}

/* ── Init ── */
export async function init(container) {
  if (!document.getElementById('cart-css')) {
    var s = document.createElement('style');
    s.id = 'cart-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  container.innerHTML = (
    '<div class="cart-page">'
      + '<section class="cart-hero">'
        + '<div class="cart-hero-bg"></div>'
        + '<div class="cart-hero-ov"></div>'
        + '<div class="container">'
          + '<p class="cart-eyebrow">Shopping Cart</p>'
          + '<h1>Your Cart</h1>'
          + '<p class="cart-hero-sub">Review your selection before checkout</p>'
        + '</div>'
      + '</section>'
      + '<section class="cart-body"><div class="container">'
        + '<div id="cart-body" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="color:var(--gold);font-size:1.5rem"></i></div>'
      + '</div></section>'
    + '</div>'
  );

  if (state.user) await loadCart();
  renderItems(container);
  initReveals();
}

export default init;
