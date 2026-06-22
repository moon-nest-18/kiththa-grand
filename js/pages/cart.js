/* ================================================================
   KITHTHA GRAND — Cart Page
   js/pages/cart.js
================================================================ */

import { supabase } from '../supabase.js';
import { router }   from '../router.js';
import { showToast, initReveals, formatPrice, state, loadCart } from '../app.js';

/* ── Module state ── */
var cartData   = [];   /* [{id, product_id, quantity, product, catName}] */
var couponType  = '';
var couponValue = 0;
var couponCode  = '';
var FREE_SHIP   = 45750; /* Rs. ~$150 */

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
    /* body */
    '.ct-body{padding:48px 0 80px}',
    '.ct-layout{display:flex;gap:32px;align-items:start}',
    '.ct-left{flex:1;min-width:0}',
    '.ct-right{width:300px;min-width:300px;position:sticky;top:100px}',
    /* left header */
    '.ct-left-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}',
    '.ct-left-label{font-family:var(--font-sub);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}',
    '.ct-clear{background:none;border:none;cursor:pointer;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(139,37,0,.45);transition:color .2s}',
    '.ct-clear:hover{color:var(--red)}',
    /* cart item */
    '.ci{background:white;border-radius:14px;border:.5px solid var(--cream-dark);padding:16px;display:flex;gap:14px;margin-bottom:12px;transition:border-color .2s,box-shadow .2s}',
    '.ci:last-child{margin-bottom:0}',
    '.ci:hover{border-color:rgba(200,144,10,.2);box-shadow:0 4px 16px rgba(61,28,2,.06)}',
    '.ci.removing{opacity:0;transform:translateX(20px);transition:opacity .28s,transform .28s}',
    /* image */
    '.ci-img{width:72px;min-width:72px;height:72px;border-radius:10px;overflow:hidden;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0}',
    '.ci-img img{width:100%;height:100%;object-fit:cover}',
    /* body */
    '.ci-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}',
    '.ci-top{display:flex;align-items:flex-start;gap:6px}',
    '.ci-top-info{flex:1;min-width:0}',
    '.ci-cat{font-family:var(--font-sub);font-size:.52rem;letter-spacing:.15em;text-transform:uppercase;color:var(--gold);margin-bottom:2px}',
    '.ci-name{font-family:Georgia,serif;font-size:.9rem;color:var(--brown);font-weight:bold;line-height:1.3;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ci-si{font-family:var(--font-body);font-size:.73rem;color:var(--brown-light);font-style:italic}',
    '.ci-rm{background:none;border:none;cursor:pointer;color:var(--cream-dark);font-size:.72rem;padding:2px;margin-left:auto;flex-shrink:0;transition:color .2s;line-height:1;align-self:flex-start}',
    '.ci-rm:hover{color:var(--red)}',
    /* bottom row */
    '.ci-bot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',
    '.ci-price-wrap{display:flex;flex-direction:column;gap:2px}',
    '.ci-price{font-family:Georgia,serif;font-size:1rem;color:var(--red);font-weight:bold;line-height:1}',
    '.ci-unit{font-family:var(--font-sub);font-size:.52rem;letter-spacing:.04em;color:var(--brown-light)}',
    '.ci-pts{display:inline-flex;align-items:center;gap:3px;background:rgba(200,144,10,.1);color:var(--gold);border-radius:99px;padding:2px 7px;font-family:var(--font-sub);font-size:.5rem;letter-spacing:.04em;margin-top:2px;width:fit-content}',
    '.ci-bot-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}',
    /* qty pill */
    '.ci-qty{display:flex;align-items:center;background:var(--cream);border:1.5px solid var(--cream-dark);border-radius:99px;overflow:hidden}',
    '.ci-qbtn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:var(--brown);font-size:.7rem;transition:background .15s}',
    '.ci-qbtn:hover{background:var(--cream-dark)}',
    '.ci-qbtn:disabled{opacity:.35;cursor:not-allowed}',
    '.ci-qval{min-width:28px;text-align:center;font-family:var(--font-sub);font-size:.78rem;color:var(--brown);font-weight:600;pointer-events:none}',
    /* save for later */
    '.ci-save{background:none;border:1px solid var(--cream-dark);border-radius:99px;padding:4px 10px;font-family:var(--font-sub);font-size:.52rem;letter-spacing:.06em;color:var(--brown-light);cursor:pointer;transition:.2s;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}',
    '.ci-save:hover{border-color:var(--red);color:var(--red)}',
    '.ci-save.saved{border-color:#2a5c3f;color:#2a5c3f;pointer-events:none}',
    /* coupon */
    '.cc{background:white;border-radius:14px;border:.5px solid var(--cream-dark);overflow:hidden;margin-top:16px}',
    '.cc-head{display:flex;align-items:center;gap:10px;padding:14px 16px;cursor:pointer;user-select:none;transition:background .2s}',
    '.cc-head:hover{background:rgba(200,144,10,.04)}',
    '.cc-icon{color:var(--gold);font-size:.85rem;flex-shrink:0}',
    '.cc-label{flex:1;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown)}',
    '.cc-arrow{color:var(--brown-light);font-size:.72rem;transition:transform .25s;flex-shrink:0}',
    '.cc-arrow.open{transform:rotate(180deg)}',
    '.cc-body{padding:0 16px 16px;display:none}',
    '.cc-body.open{display:block}',
    '.cc-row{display:flex;gap:8px}',
    '.cc-input{flex:1;padding:10px 14px;border:1.5px solid var(--cream-dark);border-radius:10px;font-family:var(--font-sub);font-size:1rem;color:var(--brown);background:var(--cream);outline:none;letter-spacing:.08em;text-transform:uppercase;transition:border-color .2s}',
    '.cc-input:focus{border-color:var(--gold)}',
    '.cc-btn{padding:10px 18px;background:var(--red);color:white;border:none;border-radius:10px;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:.2s;white-space:nowrap;flex-shrink:0}',
    '.cc-btn:hover{background:var(--red-dark)}',
    '.cc-ok{margin-top:10px;padding:10px 14px;background:rgba(42,92,63,.1);border:1px solid rgba(42,92,63,.25);border-radius:10px;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.05em;color:#2a5c3f;display:none;align-items:center;gap:8px}',
    '.cc-ok.show{display:flex}',
    /* summary panel */
    '.cs{background:white;border-radius:20px;border:.5px solid var(--cream-dark);padding:24px}',
    '.cs-title{font-family:Georgia,serif;font-size:1.1rem;color:var(--brown);font-weight:bold;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--cream-dark)}',
    '.cs-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:.85rem}',
    '.cs-lbl{color:var(--brown-light);font-style:italic}',
    '.cs-val{font-family:var(--font-sub);color:var(--brown);font-size:.8rem}',
    '.cs-val.green{color:#2a5c3f}',
    '.cs-divider{border:none;border-top:1px solid var(--cream-dark);margin:10px 0}',
    '.cs-total-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0 18px}',
    '.cs-total-lbl{font-family:var(--font-sub);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown)}',
    '.cs-total-val{font-family:Georgia,serif;font-size:1.4rem;color:var(--red);font-weight:bold}',
    /* loyalty box */
    '.cs-pts{background:linear-gradient(135deg,var(--brown),var(--red-dark));border-radius:14px;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;gap:12px}',
    '.cs-pts-icon{font-size:1.3rem;flex-shrink:0}',
    '.cs-pts-info{flex:1}',
    '.cs-pts-lbl{font-family:var(--font-sub);font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(253,243,227,.55);margin-bottom:3px}',
    '.cs-pts-val{font-family:Georgia,serif;font-size:1.05rem;color:var(--gold-light);font-weight:bold}',
    '.cs-pts-note{font-family:var(--font-body);font-size:.66rem;color:rgba(253,243,227,.4);font-style:italic;margin-top:2px}',
    /* shipping progress */
    '.cs-ship{margin-bottom:16px}',
    '.cs-ship-lbl{font-family:var(--font-sub);font-size:.58rem;letter-spacing:.05em;color:var(--brown-light);margin-bottom:6px}',
    '.cs-ship-lbl.free{color:#2a5c3f}',
    '.cs-ship-track{height:4px;background:var(--cream-dark);border-radius:99px;overflow:hidden}',
    '.cs-ship-fill{height:100%;border-radius:99px;background:linear-gradient(to right,#68d391,#2a5c3f);transition:width .4s ease}',
    /* action buttons */
    '.cs-actions{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}',
    '.cs-checkout{width:100%;padding:15px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:12px;border:none;font-family:var(--font-sub);font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:10px}',
    '.cs-checkout:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(139,37,0,.3)}',
    '.cs-checkout:disabled{opacity:.45;cursor:not-allowed}',
    '.cs-paypal{width:100%;padding:13px;background:#ffc439;color:#003087;border-radius:12px;border:none;font-family:var(--font-sub);font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700}',
    '.cs-paypal:hover{background:#f0b429;transform:translateY(-1px)}',
    /* badges + payments */
    '.cs-badges{display:flex;align-items:center;justify-content:center;gap:10px;padding:10px;background:var(--cream);border-radius:10px;margin-bottom:12px;flex-wrap:wrap}',
    '.cs-badge{display:flex;align-items:center;gap:5px;font-family:var(--font-sub);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--brown-light)}',
    '.cs-badge i{font-size:.72rem;color:var(--gold)}',
    '.cs-pays{display:flex;flex-wrap:wrap;gap:5px;justify-content:center}',
    '.cs-pay{padding:3px 9px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:5px;font-family:var(--font-sub);font-size:.5rem;letter-spacing:.04em;color:var(--brown-light)}',
    /* empty */
    '.ct-empty{text-align:center;padding:80px 24px}',
    '.ct-empty-ico{font-size:4rem;display:block;margin-bottom:16px;opacity:.3}',
    '.ct-empty h2{font-family:var(--font-head);font-size:1.6rem;color:var(--brown);margin-bottom:8px}',
    '.ct-empty p{font-size:.9rem;color:var(--brown-light);font-style:italic;margin-bottom:28px}',
    /* skeleton */
    '.ct-skel{background:linear-gradient(90deg,var(--cream) 25%,var(--cream-dark) 50%,var(--cream) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:6px}',
    '.ct-skel-card{background:white;border-radius:14px;border:.5px solid var(--cream-dark);padding:16px;display:flex;gap:14px;margin-bottom:12px}',
    '.ct-skel-thumb{width:72px;min-width:72px;height:72px;border-radius:10px;flex-shrink:0}',
    '.ct-skel-lines{flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center}',
    /* responsive */
    '@media(max-width:900px){',
      '.ct-layout{flex-direction:column}',
      '.ct-right{width:100%;min-width:0;position:static}',
    '}',
    '@media(max-width:480px){',
      '.ct-hero{padding:100px 0 52px}',
      '.ci{padding:12px;gap:10px}',
      '.ci-img{width:58px;min-width:58px;height:58px}',
      '.ci-si{display:none}',
      '.ci-qbtn{width:36px;height:36px;font-size:.8rem}',
      '.ci-qval{min-width:32px}',
    '}',
  ].join('');
  document.head.appendChild(s);
}

/* ── Skeleton card ── */
function skelItem() {
  return '<div class="ct-skel-card">'
    + '<div class="ct-skel ct-skel-thumb"></div>'
    + '<div class="ct-skel-lines">'
    + '<div class="ct-skel" style="height:10px;width:30%"></div>'
    + '<div class="ct-skel" style="height:14px;width:60%"></div>'
    + '<div class="ct-skel" style="height:10px;width:40%"></div>'
    + '</div>'
    + '</div>';
}

/* ── Data fetch (two-step, no FK joins) ── */
async function fetchCartData() {
  if (!state.user) return [];

  var cartRes = await supabase
    .from('cart')
    .select('id, product_id, quantity, created_at')
    .eq('user_id', state.user.id)
    .order('created_at', { ascending: false });

  var rows = cartRes.data || [];
  if (!rows.length) return [];

  var ids = rows.map(function(r) { return r.product_id; });

  var prodsRes = await supabase
    .from('products')
    .select('id, name, name_si, price_lkr, images, weight_grams, category_id')
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

  return rows
    .map(function(r) {
      var p = prodMap[r.product_id];
      if (!p) return null;
      return {
        id: r.id,
        product_id: r.product_id,
        quantity: r.quantity || 1,
        product: p,
        catName: catMap[p.category_id] || ''
      };
    })
    .filter(function(x) { return x !== null; });
}

/* ── Calc helpers ── */
function calcSubtotal() {
  var t = 0;
  cartData.forEach(function(item) {
    t += parseFloat(item.product.price_lkr || 0) * (item.quantity || 1);
  });
  return t;
}

function calcDiscount(subtotal) {
  if (couponType === 'percent') return subtotal * (couponValue / 100);
  if (couponType === 'fixed')   return Math.min(couponValue, subtotal);
  return 0;
}

/* ── Build one item HTML ── */
function buildItemHTML(item) {
  var p   = item.product;
  var qty = item.quantity || 1;
  var linePx = parseFloat(p.price_lkr || 0) * qty;
  var unitPx = parseFloat(p.price_lkr || 0);
  var pts    = Math.floor(linePx * 0.033);

  var imgH = (p.images && p.images.length)
    ? '<img src="' + p.images[0] + '" alt="' + (p.name || '') + '" loading="lazy">'
    : '🌶️';

  var siArr = [];
  if (p.name_si)      siArr.push(p.name_si);
  if (p.weight_grams) siArr.push(p.weight_grams + 'g');
  var siLine = siArr.join(' \xB7 ');

  return '<div class="ci" data-row-id="' + item.id + '">'
    + '<div class="ci-img">' + imgH + '</div>'
    + '<div class="ci-body">'
    +   '<div class="ci-top">'
    +     '<div class="ci-top-info">'
    +       '<div class="ci-cat">' + (item.catName || 'Spices') + '</div>'
    +       '<div class="ci-name">' + (p.name || '') + '</div>'
    +       (siLine ? '<div class="ci-si">' + siLine + '</div>' : '')
    +     '</div>'
    +     '<button class="ci-rm" data-rm="' + item.id + '" title="Remove" aria-label="Remove">'
    +       '<i class="fas fa-times"></i>'
    +     '</button>'
    +   '</div>'
    +   '<div class="ci-bot">'
    +     '<div class="ci-price-wrap">'
    +       '<div class="ci-price" id="ci-price-' + item.id + '">' + formatPrice(linePx) + '</div>'
    +       '<div class="ci-unit">Rs.' + Math.round(unitPx).toLocaleString() + ' / unit</div>'
    +       '<div class="ci-pts"><i class="fas fa-star"></i> +' + pts + ' pts</div>'
    +     '</div>'
    +     '<div class="ci-bot-right">'
    +       '<div class="ci-qty">'
    +         '<button class="ci-qbtn" data-minus="' + item.id + '" data-qty="' + qty + '"'
    +           + (qty <= 1 ? ' disabled' : '') + '>'
    +           '<i class="fas fa-minus"></i>'
    +         '</button>'
    +         '<span class="ci-qval" id="ci-qval-' + item.id + '">' + qty + '</span>'
    +         '<button class="ci-qbtn" data-plus="' + item.id + '" data-qty="' + qty + '">'
    +           '<i class="fas fa-plus"></i>'
    +         '</button>'
    +       '</div>'
    +       '<button class="ci-save" data-save="' + item.id + '" data-pid="' + item.product_id + '">'
    +         '<i class="far fa-heart"></i> Save for later'
    +       '</button>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';
}

/* ── Build summary HTML ── */
function buildSummaryHTML() {
  var subtotal = calcSubtotal();
  var discount = calcDiscount(subtotal);
  var total    = subtotal - discount;
  var pts      = Math.floor(total * 0.033);
  var count    = cartData.length;
  var pct      = Math.min(100, Math.round((subtotal / FREE_SHIP) * 100));
  var remain   = Math.max(0, FREE_SHIP - subtotal);
  var isFree   = remain <= 0;

  var discHidden = discount <= 0 ? ' style="display:none"' : '';

  return '<div class="cs">'
    + '<div class="cs-title">Order Summary</div>'
    + '<div class="cs-row">'
    +   '<span class="cs-lbl">Subtotal (' + count + ' item' + (count !== 1 ? 's' : '') + ')</span>'
    +   '<span class="cs-val" id="cs-sub">' + formatPrice(subtotal) + '</span>'
    + '</div>'
    + '<div class="cs-row" id="cs-disc-row"' + discHidden + '>'
    +   '<span class="cs-lbl">Discount</span>'
    +   '<span class="cs-val green" id="cs-disc">- ' + formatPrice(discount) + '</span>'
    + '</div>'
    + '<div class="cs-row">'
    +   '<span class="cs-lbl">Shipping</span>'
    +   '<span class="cs-val">' + (isFree ? 'Free &#127881;' : 'Calculated at checkout') + '</span>'
    + '</div>'
    + '<div class="cs-row"><span class="cs-lbl">Estimated tax</span><span class="cs-val">Rs.0</span></div>'
    + '<hr class="cs-divider">'
    + '<div class="cs-total-row">'
    +   '<span class="cs-total-lbl">Total</span>'
    +   '<span class="cs-total-val" id="cs-total">' + formatPrice(total) + '</span>'
    + '</div>'
    + '<div class="cs-pts">'
    +   '<span class="cs-pts-icon">&#11088;</span>'
    +   '<div class="cs-pts-info">'
    +     '<div class="cs-pts-lbl">You will earn</div>'
    +     '<div class="cs-pts-val" id="cs-pts">+' + pts.toLocaleString() + ' loyalty points</div>'
    +     '<div class="cs-pts-note">100 pts = Rs.10 discount</div>'
    +   '</div>'
    + '</div>'
    + '<div class="cs-ship">'
    +   '<div class="cs-ship-lbl' + (isFree ? ' free' : '') + '" id="cs-ship-lbl">'
    +     (isFree ? 'Free shipping applied! &#127881;' : (formatPrice(remain) + ' more for free shipping'))
    +   '</div>'
    +   '<div class="cs-ship-track"><div class="cs-ship-fill" id="cs-ship-fill" style="width:' + pct + '%"></div></div>'
    + '</div>'
    + '<div class="cs-actions">'
    +   '<button class="cs-checkout" id="cs-checkout"' + (!count ? ' disabled' : '') + '>'
    +     '<i class="fas fa-lock"></i> Proceed to Checkout'
    +   '</button>'
    +   '<button class="cs-paypal" id="cs-paypal">'
    +     '<i class="fab fa-paypal"></i> Pay with PayPal'
    +   '</button>'
    + '</div>'
    + '<div class="cs-badges">'
    +   '<div class="cs-badge"><i class="fas fa-shield-alt"></i> SSL Secure</div>'
    +   '<div class="cs-badge"><i class="fas fa-lock"></i> Safe Checkout</div>'
    +   '<div class="cs-badge"><i class="fas fa-shipping-fast"></i> FedEx Tracked</div>'
    + '</div>'
    + '<div class="cs-pays">'
    +   '<span class="cs-pay">VISA</span>'
    +   '<span class="cs-pay">Mastercard</span>'
    +   '<span class="cs-pay">AMEX</span>'
    +   '<span class="cs-pay">PayHere</span>'
    +   '<span class="cs-pay">PayPal</span>'
    + '</div>'
    + '</div>';
}

/* ── Live-update summary totals only (no full re-render) ── */
function updateSummary() {
  var subtotal = calcSubtotal();
  var discount = calcDiscount(subtotal);
  var total    = subtotal - discount;
  var pts      = Math.floor(total * 0.033);
  var pct      = Math.min(100, Math.round((subtotal / FREE_SHIP) * 100));
  var remain   = Math.max(0, FREE_SHIP - subtotal);
  var isFree   = remain <= 0;

  var subEl      = document.getElementById('cs-sub');
  var totalEl    = document.getElementById('cs-total');
  var ptsEl      = document.getElementById('cs-pts');
  var fillEl     = document.getElementById('cs-ship-fill');
  var lblEl      = document.getElementById('cs-ship-lbl');
  var discRowEl  = document.getElementById('cs-disc-row');
  var discValEl  = document.getElementById('cs-disc');

  if (subEl)   subEl.textContent   = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(total);
  if (ptsEl)   ptsEl.textContent   = '+' + pts.toLocaleString() + ' loyalty points';
  if (fillEl)  fillEl.style.width  = pct + '%';
  if (lblEl) {
    lblEl.textContent = isFree ? 'Free shipping applied! 🎉' : (formatPrice(remain) + ' more for free shipping');
    lblEl.className = 'cs-ship-lbl' + (isFree ? ' free' : '');
  }
  if (discRowEl) discRowEl.style.display = discount > 0 ? '' : 'none';
  if (discValEl) discValEl.textContent = '- ' + formatPrice(discount);
}

/* ── Remove item ── */
async function removeItem(rowId) {
  var el = document.querySelector('.ci[data-row-id="' + rowId + '"]');
  if (el) {
    el.classList.add('removing');
    await new Promise(function(r) { setTimeout(r, 300); });
    el.remove();
  }

  var delRes = await supabase.from('cart').delete().eq('id', rowId);
  if (delRes.error) {
    showToast('Could not remove item. Please refresh and try again.', 'error');
    return;
  }
  cartData = cartData.filter(function(x) { return String(x.id) !== String(rowId); });
  await loadCart();
  updateSummary();

  var countEl = document.getElementById('ct-item-count');
  if (countEl) {
    var c = cartData.length;
    countEl.textContent = c + ' item' + (c !== 1 ? 's' : '');
  }

  if (!cartData.length) showEmpty();
}

/* ── Change quantity ── */
async function changeQty(rowId, newQty) {
  if (newQty < 1) return;

  var item = null;
  for (var i = 0; i < cartData.length; i++) {
    if (String(cartData[i].id) === String(rowId)) { item = cartData[i]; break; }
  }
  if (!item) return;

  var prevQty = item.quantity;
  item.quantity = newQty;

  var updRes = await supabase.from('cart').update({ quantity: newQty }).eq('id', rowId);
  if (updRes.error) {
    item.quantity = prevQty;
    showToast('Could not update quantity. Please try again.', 'error');
    return;
  }
  await loadCart();

  /* update qty display */
  var qvalEl  = document.getElementById('ci-qval-' + rowId);
  var minusEl = document.querySelector('[data-minus="' + rowId + '"]');
  var plusEl  = document.querySelector('[data-plus="' + rowId + '"]');
  if (qvalEl)  qvalEl.textContent    = newQty;
  if (minusEl) { minusEl.dataset.qty = newQty; minusEl.disabled = (newQty <= 1); }
  if (plusEl)  plusEl.dataset.qty    = newQty;

  /* update line price */
  var linePx  = parseFloat(item.product.price_lkr || 0) * newQty;
  var priceEl = document.getElementById('ci-price-' + rowId);
  if (priceEl) priceEl.textContent = formatPrice(linePx);

  updateSummary();
}

/* ── Save for later (move to wishlist) ── */
async function saveForLater(rowId, productId) {
  if (!state.user) return;
  var btn = document.querySelector('[data-save="' + rowId + '"]');
  if (btn) btn.disabled = true;

  await supabase.from('saved_items')
    .upsert({ user_id: state.user.id, product_id: productId }, { onConflict: 'user_id,product_id' });

  showToast('Saved to wishlist!', 'success');

  if (btn) {
    btn.innerHTML = '<i class="fas fa-heart"></i> Saved to wishlist';
    btn.classList.add('saved');
  }

  await removeItem(rowId);
}

/* ── Apply coupon ── */
async function applyCoupon(code) {
  if (!code) return;

  var res = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (res.error || !res.data) {
    showToast('Invalid or expired coupon', 'error');
    return;
  }

  var c = res.data;
  couponType  = c.type;
  couponValue = parseFloat(c.discount_value);
  couponCode  = code.toUpperCase();

  var label = couponType === 'percent'
    ? (couponValue + '% off!')
    : ('Rs.' + Math.round(couponValue).toLocaleString() + ' off!');

  var okEl = document.getElementById('cc-ok');
  if (okEl) {
    okEl.innerHTML = '<i class="fas fa-check-circle"></i> ' + couponCode + ' applied - ' + label;
    okEl.classList.add('show');
  }

  updateSummary();
  showToast('Coupon applied!', 'success');
}

/* ── Show empty state ── */
function showEmpty() {
  var leftEl = document.getElementById('ct-left');
  if (leftEl) {
    leftEl.innerHTML = '<div class="ct-empty">'
      + '<span class="ct-empty-ico">&#128722;</span>'
      + '<h2>Your Cart is Empty</h2>'
      + '<p>Explore our Pure Ceylon spices</p>'
      + '<button class="btn-primary" id="ct-browse"><span>Browse Spices</span>'
      + ' <i class="fas fa-arrow-right"></i></button>'
      + '</div>';
    var br = document.getElementById('ct-browse');
    if (br) br.addEventListener('click', function() { router.go('products'); });
  }
  var checkoutEl = document.getElementById('cs-checkout');
  if (checkoutEl) checkoutEl.disabled = true;
}

/* ── Bind all events ── */
function bindEvents() {
  /* items — delegated */
  var itemsEl = document.getElementById('ct-items');
  if (itemsEl) {
    itemsEl.addEventListener('click', function(e) {
      var rm = e.target.closest('[data-rm]');
      if (rm)   { removeItem(rm.dataset.rm); return; }

      var minus = e.target.closest('[data-minus]');
      if (minus && !minus.disabled) {
        changeQty(minus.dataset.minus, parseInt(minus.dataset.qty, 10) - 1);
        return;
      }

      var plus = e.target.closest('[data-plus]');
      if (plus) {
        changeQty(plus.dataset.plus, parseInt(plus.dataset.qty, 10) + 1);
        return;
      }

      var save = e.target.closest('[data-save]');
      if (save && !save.disabled) {
        saveForLater(save.dataset.save, save.dataset.pid);
      }
    });
  }

  /* clear all */
  var clearBtn = document.getElementById('ct-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (!confirm('Remove all items from your cart?')) return;
      clearBtn.disabled = true;
      supabase.from('cart').delete().eq('user_id', state.user.id).then(function() {
        cartData = [];
        loadCart();
        showEmpty();
      });
    });
  }

  /* coupon toggle */
  var ccHead  = document.getElementById('cc-head');
  var ccBody  = document.getElementById('cc-body');
  var ccArrow = document.getElementById('cc-arrow');
  if (ccHead && ccBody) {
    ccHead.addEventListener('click', function() {
      var open = ccBody.classList.toggle('open');
      if (ccArrow) ccArrow.classList.toggle('open', open);
    });
  }

  /* coupon apply */
  var ccBtn   = document.getElementById('cc-btn');
  var ccInput = document.getElementById('cc-input');
  if (ccBtn && ccInput) {
    ccBtn.addEventListener('click', function() { applyCoupon(ccInput.value.trim()); });
    ccInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') applyCoupon(ccInput.value.trim());
    });
  }

  /* checkout */
  var checkoutEl = document.getElementById('cs-checkout');
  if (checkoutEl) checkoutEl.addEventListener('click', function() { router.go('checkout'); });

  /* paypal placeholder */
  var paypalEl = document.getElementById('cs-paypal');
  if (paypalEl) paypalEl.addEventListener('click', function() {
    showToast('PayPal integration coming soon!', 'info');
  });
}

/* ================================================================
   INIT
================================================================ */
export async function init(container) {
  injectStyles();

  if (!state.user) { router.go('login'); return; }

  /* Skeleton */
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
    +   '<div class="ct-layout">'
    +     '<div class="ct-left" id="ct-left">'
    +       skelItem() + skelItem() + skelItem()
    +     '</div>'
    +     '<div class="ct-right" id="ct-right">'
    +       '<div class="cs">'
    +         '<div class="cs-title">Order Summary</div>'
    +         '<div class="ct-skel" style="height:14px;margin-bottom:10px"></div>'
    +         '<div class="ct-skel" style="height:14px;width:70%;margin-bottom:10px"></div>'
    +         '<div class="ct-skel" style="height:14px;width:80%;margin-bottom:20px"></div>'
    +         '<div class="ct-skel" style="height:48px;border-radius:12px"></div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div></section>'
    + '</div>';

  /* Load data */
  cartData = await fetchCartData();

  var leftEl  = document.getElementById('ct-left');
  var rightEl = document.getElementById('ct-right');

  /* Render summary always */
  if (rightEl) rightEl.innerHTML = buildSummaryHTML();

  /* Empty state */
  if (!cartData.length) {
    if (leftEl) leftEl.innerHTML = '<div class="ct-empty">'
      + '<span class="ct-empty-ico">&#128722;</span>'
      + '<h2>Your Cart is Empty</h2>'
      + '<p>Explore our Pure Ceylon spices</p>'
      + '<button class="btn-primary" id="ct-browse"><span>Browse Spices</span>'
      + ' <i class="fas fa-arrow-right"></i></button>'
      + '</div>';
    var br = document.getElementById('ct-browse');
    if (br) br.addEventListener('click', function() { router.go('products'); });
    bindEvents();
    return;
  }

  /* Build items */
  var itemsHTML = '';
  cartData.forEach(function(item) { itemsHTML += buildItemHTML(item); });

  if (leftEl) leftEl.innerHTML = ''
    + '<div class="ct-left-head">'
    +   '<span class="ct-left-label">Cart Items</span>'
    +   '<button class="ct-clear" id="ct-clear">Clear all</button>'
    + '</div>'
    + '<div id="ct-items">' + itemsHTML + '</div>'
    + '<div class="cc">'
    +   '<div class="cc-head" id="cc-head">'
    +     '<i class="fas fa-ticket-alt cc-icon"></i>'
    +     '<span class="cc-label">Apply coupon or promo code</span>'
    +     '<i class="fas fa-chevron-down cc-arrow" id="cc-arrow"></i>'
    +   '</div>'
    +   '<div class="cc-body" id="cc-body">'
    +     '<div class="cc-row">'
    +       '<input class="cc-input" id="cc-input" type="text" placeholder="ENTER CODE" maxlength="30">'
    +       '<button class="cc-btn" id="cc-btn">Apply</button>'
    +     '</div>'
    +     '<div class="cc-ok" id="cc-ok"></div>'
    +   '</div>'
    + '</div>';

  bindEvents();
  initReveals();
}

export default init;