/* ================================================================
   KITHTHA GRAND — Bulk Orders Page
   js/pages/bulk-orders.js
================================================================ */

import { supabase }              from '../supabase.js';
import { router }                from '../router.js';
import { showToast, initReveals, state } from '../app.js';

/* ── CSS ── */
const BULK_CSS = [
  '.bulk-page{min-height:100vh;background:var(--cream)}',

  /* Hero — same dark bg as products */
  '.bulk-hero{background:#0a0502;padding:120px 0 72px;position:relative;overflow:hidden}',
  '.bulk-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(139,37,0,.85) 0%,rgba(61,28,2,.95) 60%,#0a0502 100%)}',
  '.bulk-hero-overlay{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(200,144,10,.03) 40px,rgba(200,144,10,.03) 80px)}',
  '.bulk-hero .container{position:relative;z-index:1}',
  '.bulk-hero-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}',
  '.bulk-hero h1{font-family:var(--font-head);font-size:clamp(1.8rem,4vw,3.2rem);color:var(--cream);line-height:1.2;margin-bottom:14px}',
  '.bulk-hero p{font-size:.95rem;color:rgba(253,243,227,.55);font-style:italic;max-width:520px}',
  '.bulk-hero-tags{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}',
  '.bulk-tag{display:inline-flex;align-items:center;gap:7px;padding:7px 16px;border:1px solid rgba(200,144,10,.3);border-radius:99px;font-family:var(--font-sub);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(200,144,10,.8)}',

  /* Main content */
  '.bulk-body{padding:60px 0 80px}',
  '.bulk-grid{display:grid;grid-template-columns:1fr 420px;gap:48px;align-items:start}',

  /* ── FORM CARD ── */
  '.bulk-form-card{background:white;border-radius:24px;border:1px solid var(--cream-dark);padding:40px;box-shadow:var(--shadow-md)}',
  '.bulk-form-title{font-family:var(--font-head);font-size:1.4rem;color:var(--brown);margin-bottom:6px}',
  '.bulk-form-sub{font-size:.88rem;color:var(--brown-light);margin-bottom:32px;font-style:italic}',

  /* Form rows */
  '.bform-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
  '.bform-group{margin-bottom:18px}',
  '.bform-label{display:block;font-family:var(--font-sub);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown-light);margin-bottom:7px}',
  '.bform-label span{color:var(--red);margin-left:2px}',
  '.bform-input{width:100%;padding:12px 16px;border:1.5px solid var(--cream-dark);border-radius:12px;font-family:var(--font-body);font-size:1rem;color:var(--brown);background:var(--cream);outline:none;transition:.2s}',
  '.bform-input:focus{border-color:var(--gold);background:white;box-shadow:0 0 0 3px rgba(200,144,10,.1)}',
  '.bform-input::placeholder{color:rgba(61,28,2,.3)}',
  '.bform-select{appearance:none;-webkit-appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\'%3E%3Cpath d=\'M0 0l6 8 6-8z\' fill=\'%236B3A1F\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}',
  '.bform-textarea{resize:vertical;min-height:100px}',

  /* Range slider */
  '.bform-range-wrap{position:relative}',
  '.bform-range{width:100%;-webkit-appearance:none;height:6px;border-radius:99px;background:var(--cream-dark);outline:none;cursor:pointer;margin:10px 0 6px}',
  '.bform-range::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--red);cursor:pointer;box-shadow:0 2px 6px rgba(139,37,0,.3)}',
  '.bform-range::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--red);cursor:pointer;border:none}',
  '.bform-range-labels{display:flex;justify-content:space-between;font-family:var(--font-sub);font-size:.62rem;color:var(--brown-light);letter-spacing:.06em}',
  '.bform-qty-display{text-align:center;font-family:var(--font-head);font-size:1.4rem;color:var(--red);margin-bottom:4px}',
  '.bform-qty-display span{font-size:.75rem;color:var(--brown-light);font-family:var(--font-sub)}',

  /* Submit button */
  '.bform-submit{width:100%;padding:15px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:12px;font-family:var(--font-sub);font-size:.82rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:10px}',
  '.bform-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(139,37,0,.3)}',
  '.bform-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}',
  '.bform-note{text-align:center;font-size:.75rem;color:var(--brown-light);margin-top:12px;font-style:italic}',

  /* ── SUCCESS STATE ── */
  '.bulk-success{text-align:center;padding:60px 40px}',
  '.bulk-success-icon{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--green),#3D7A58);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;box-shadow:0 8px 32px rgba(42,92,63,.3)}',
  '.bulk-success-icon i{font-size:2rem;color:white}',
  '.bulk-success h2{font-family:var(--font-head);font-size:1.5rem;color:var(--brown);margin-bottom:10px}',
  '.bulk-success p{color:var(--brown-light);font-size:.9rem;max-width:360px;margin:0 auto 28px;line-height:1.7}',
  '.bulk-wa-btn{display:inline-flex;align-items:center;gap:10px;padding:13px 28px;background:#25D366;color:white;border-radius:99px;font-family:var(--font-sub);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s}',
  '.bulk-wa-btn:hover{background:#1ebe5a;transform:translateY(-1px)}',

  /* ── INFO SIDEBAR ── */
  '.bulk-info{display:flex;flex-direction:column;gap:20px}',
  '.bulk-info-card{background:white;border-radius:20px;border:1px solid var(--cream-dark);padding:28px;box-shadow:var(--shadow-sm)}',
  '.bulk-info-title{font-family:var(--font-sub);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brown);margin-bottom:18px;display:flex;align-items:center;gap:8px}',
  '.bulk-info-title i{color:var(--gold);font-size:.9rem}',

  /* Benefits list */
  '.bulk-benefits{display:flex;flex-direction:column;gap:12px}',
  '.bulk-benefit{display:flex;align-items:flex-start;gap:13px}',
  '.bulk-benefit-icon{width:36px;height:36px;border-radius:10px;background:rgba(200,144,10,.1);display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0;margin-top:1px}',
  '.bulk-benefit-text strong{display:block;font-family:var(--font-sub);font-size:.78rem;color:var(--brown);margin-bottom:2px}',
  '.bulk-benefit-text span{font-size:.8rem;color:var(--brown-light)}',

  /* Process steps */
  '.bulk-steps{display:flex;flex-direction:column;gap:0}',
  '.bulk-step{display:flex;gap:14px;padding:10px 0;position:relative}',
  '.bulk-step:not(:last-child)::after{content:"";position:absolute;left:15px;top:42px;bottom:-2px;width:2px;background:linear-gradient(180deg,var(--gold),transparent)}',
  '.bulk-step-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-light));color:var(--brown);font-family:var(--font-head);font-size:.75rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:700}',
  '.bulk-step-text strong{display:block;font-family:var(--font-sub);font-size:.78rem;color:var(--brown);margin-bottom:2px}',
  '.bulk-step-text span{font-size:.78rem;color:var(--brown-light)}',

  /* Contact card */
  '.bulk-contact-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--cream-dark)}',
  '.bulk-contact-row:last-child{border-bottom:none}',
  '.bulk-contact-icon{width:34px;height:34px;border-radius:9px;background:rgba(139,37,0,.08);display:flex;align-items:center;justify-content:center;color:var(--red);font-size:.85rem;flex-shrink:0}',
  '.bulk-contact-label{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown-light);margin-bottom:2px}',
  '.bulk-contact-val{font-size:.85rem;color:var(--brown)}',

  /* Responsive */
  '@media(max-width:900px){.bulk-grid{grid-template-columns:1fr;gap:32px}.bulk-info{order:-1}}',
  '@media(max-width:600px){.bulk-form-card{padding:24px}.bform-row{grid-template-columns:1fr}.bulk-hero{padding:96px 0 52px}}',
].join('');

/* ── Country list ── */
var COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belgium','Bolivia','Brazil','Bulgaria',
  'Cambodia','Canada','Chile','China','Colombia','Croatia','Czech Republic',
  'Denmark','Ecuador','Egypt','Estonia','Ethiopia',
  'Finland','France','Germany','Ghana','Greece','Guatemala',
  'Hungary','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Japan','Jordan','Kazakhstan','Kenya','Kuwait','Latvia','Lebanon','Lithuania',
  'Malaysia','Mexico','Morocco','Netherlands','New Zealand','Nigeria','Norway',
  'Pakistan','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Saudi Arabia','Singapore','Slovakia','South Africa',
  'South Korea','Spain','Sri Lanka','Sweden','Switzerland','Thailand',
  'Tunisia','Turkey','UAE','Uganda','Ukraine','United Kingdom',
  'United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Zimbabwe',
];

/* ── Spice products list ── */
var SPICE_OPTIONS = [
  'Ceylon Cinnamon','Black Pepper','Cardamom','Cloves','Nutmeg','Turmeric',
  'Curry Powder','Chilli Powder','Coriander','Cumin','Mustard Seeds',
  'Fenugreek','Ginger','Mace','White Pepper','Mixed Spice Blends',
  'Custom Blend','Gift Sets / Hampers','Multiple Products',
];

/* ── Build page HTML ── */
function buildPage() {
  var countryOpts = COUNTRIES.map(function(c) {
    return '<option value="' + c + '">' + c + '</option>';
  }).join('');

  var spiceOpts = SPICE_OPTIONS.map(function(s) {
    return '<option value="' + s + '">' + s + '</option>';
  }).join('');

  return '<div class="bulk-page">'

    /* Hero */
    + '<div class="bulk-hero">'
    + '<div class="bulk-hero-bg"></div>'
    + '<div class="bulk-hero-overlay"></div>'
    + '<div class="container">'
    + '<p class="bulk-hero-eyebrow">Wholesale &amp; Trade</p>'
    + '<h1>Bulk Orders</h1>'
    + '<p>Source authentic Ceylon spices directly from the island. Competitive wholesale pricing, custom packaging, and worldwide delivery.</p>'
    + '<div class="bulk-hero-tags">'
    + '<span class="bulk-tag"><i class="fas fa-weight-hanging"></i> Min. 10kg per product</span>'
    + '<span class="bulk-tag"><i class="fas fa-globe"></i> 40+ Countries</span>'
    + '<span class="bulk-tag"><i class="fas fa-box"></i> Custom Packaging</span>'
    + '<span class="bulk-tag"><i class="fas fa-certificate"></i> Certificate of Origin</span>'
    + '</div>'
    + '</div>'
    + '</div>'

    /* Body */
    + '<div class="container">'
    + '<div class="bulk-body">'
    + '<div class="bulk-grid">'

    /* Form */
    + '<div class="bulk-form-card" id="bulk-form-wrap">'
    + '<h2 class="bulk-form-title">Request a Quote</h2>'
    + '<p class="bulk-form-sub">Fill in your details and we\'ll get back within 24 hours.</p>'

    + '<div class="bform-row">'
    + '<div class="bform-group">'
    + '<label class="bform-label">Full Name <span>*</span></label>'
    + '<input type="text" id="bf-name" class="bform-input" placeholder="John Silva" />'
    + '</div>'
    + '<div class="bform-group">'
    + '<label class="bform-label">Email <span>*</span></label>'
    + '<input type="email" id="bf-email" class="bform-input" placeholder="john@company.com" />'
    + '</div>'
    + '</div>'

    + '<div class="bform-row">'
    + '<div class="bform-group">'
    + '<label class="bform-label">Phone / WhatsApp</label>'
    + '<input type="tel" id="bf-phone" class="bform-input" placeholder="+1 234 567 8900" />'
    + '</div>'
    + '<div class="bform-group">'
    + '<label class="bform-label">Company Name</label>'
    + '<input type="text" id="bf-company" class="bform-input" placeholder="Colombo Spice Traders" />'
    + '</div>'
    + '</div>'

    + '<div class="bform-row">'
    + '<div class="bform-group">'
    + '<label class="bform-label">Country <span>*</span></label>'
    + '<select id="bf-country" class="bform-input bform-select">'
    + '<option value="">Select country...</option>'
    + countryOpts
    + '</select>'
    + '</div>'
    + '<div class="bform-group">'
    + '<label class="bform-label">Product Interest <span>*</span></label>'
    + '<select id="bf-product" class="bform-input bform-select">'
    + '<option value="">Select product...</option>'
    + spiceOpts
    + '</select>'
    + '</div>'
    + '</div>'

    + '<div class="bform-group">'
    + '<label class="bform-label">Quantity Required <span>*</span></label>'
    + '<div class="bform-range-wrap">'
    + '<div class="bform-qty-display" id="bf-qty-display">50 <span>kg</span></div>'
    + '<input type="range" id="bf-qty-range" class="bform-range" min="10" max="5000" step="10" value="50" />'
    + '<div class="bform-range-labels"><span>10 kg</span><span>500 kg</span><span>1000 kg</span><span>5000 kg</span></div>'
    + '</div>'
    + '</div>'

    + '<div class="bform-group">'
    + '<label class="bform-label">Message / Special Requirements</label>'
    + '<textarea id="bf-message" class="bform-input bform-textarea" placeholder="Tell us about your specific requirements, packaging preferences, or any questions..."></textarea>'
    + '</div>'

    + '<button class="bform-submit" id="bf-submit">'
    + '<i class="fas fa-paper-plane"></i> Send Inquiry'
    + '</button>'
    + '<p class="bform-note">We reply within 24 hours &middot; No commitment required</p>'
    + '</div>'

    /* Info sidebar */
    + '<div class="bulk-info">'

    + '<div class="bulk-info-card">'
    + '<div class="bulk-info-title"><i class="fas fa-star"></i> Why Kiththa Grand</div>'
    + '<div class="bulk-benefits">'
    + buildBenefit('🌱', 'Farm Direct Sourcing', 'Direct from certified spice gardens in Sri Lanka')
    + buildBenefit('📦', 'Custom Packaging', 'Your brand, our spices — private label available')
    + buildBenefit('🚢', 'Global Shipping', 'FedEx tracked delivery to 40+ countries')
    + buildBenefit('📜', 'Documentation', 'Certificate of Origin, Phytosanitary, HACCP')
    + buildBenefit('💰', 'Wholesale Pricing', 'Competitive rates with volume discounts')
    + buildBenefit('👤', 'Dedicated Manager', 'Personal account manager for every client')
    + '</div>'
    + '</div>'

    + '<div class="bulk-info-card">'
    + '<div class="bulk-info-title"><i class="fas fa-route"></i> Our Process</div>'
    + '<div class="bulk-steps">'
    + buildStep('1', 'Submit Inquiry', 'Fill the form and tell us your needs')
    + buildStep('2', 'Custom Quote', 'We send a detailed price quote within 24h')
    + buildStep('3', 'Sample Order', 'Receive samples before committing')
    + buildStep('4', 'Place Order', 'Confirm, pay, and we handle the rest')
    + '</div>'
    + '</div>'

    + '<div class="bulk-info-card">'
    + '<div class="bulk-info-title"><i class="fas fa-headset"></i> Get in Touch</div>'
    + buildContact('fab fa-whatsapp', 'WhatsApp', '+94 77 123 4567')
    + buildContact('fas fa-envelope', 'Email', 'bulk@kiththagrand.com')
    + buildContact('fas fa-clock', 'Response Time', 'Within 24 hours')
    + '</div>'

    + '</div>'/* /bulk-info */
    + '</div>'/* /bulk-grid */
    + '</div>'/* /bulk-body */
    + '</div>'/* /container */
    + '</div>';/* /bulk-page */
}

function buildBenefit(icon, title, desc) {
  return '<div class="bulk-benefit">'
    + '<div class="bulk-benefit-icon">' + icon + '</div>'
    + '<div class="bulk-benefit-text">'
    + '<strong>' + title + '</strong>'
    + '<span>' + desc + '</span>'
    + '</div></div>';
}

function buildStep(num, title, desc) {
  return '<div class="bulk-step">'
    + '<div class="bulk-step-num">' + num + '</div>'
    + '<div class="bulk-step-text">'
    + '<strong>' + title + '</strong>'
    + '<span>' + desc + '</span>'
    + '</div></div>';
}

function buildContact(icon, label, val) {
  return '<div class="bulk-contact-row">'
    + '<div class="bulk-contact-icon"><i class="' + icon + '"></i></div>'
    + '<div>'
    + '<div class="bulk-contact-label">' + label + '</div>'
    + '<div class="bulk-contact-val">' + val + '</div>'
    + '</div></div>';
}

/* ── Success state ── */
function showSuccess(wrap) {
  wrap.innerHTML = '<div class="bulk-success">'
    + '<div class="bulk-success-icon"><i class="fas fa-check"></i></div>'
    + '<h2>Inquiry Received!</h2>'
    + '<p>Thank you for reaching out. Our bulk orders team will contact you within 24 hours with a personalised quote.</p>'
    + '<a href="https://wa.me/94771234567" target="_blank" class="bulk-wa-btn">'
    + '<i class="fab fa-whatsapp"></i> Chat on WhatsApp'
    + '</a>'
    + '</div>';
}

/* ── Wire events ── */
function wireEvents(container) {
  /* Quantity slider */
  var slider = container.querySelector('#bf-qty-range');
  var display = container.querySelector('#bf-qty-display');
  if (slider && display) {
    slider.addEventListener('input', function() {
      var v = parseInt(slider.value);
      display.innerHTML = v.toLocaleString() + ' <span>kg</span>';
    });
  }

  /* Submit */
  var form = container.querySelector('#bulk-form-wrap');
  var submitBtn = container.querySelector('#bf-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async function() {
    var name    = (container.querySelector('#bf-name').value    || '').trim();
    var email   = (container.querySelector('#bf-email').value   || '').trim();
    var phone   = (container.querySelector('#bf-phone').value   || '').trim();
    var company = (container.querySelector('#bf-company').value || '').trim();
    var country = (container.querySelector('#bf-country').value || '').trim();
    var product = (container.querySelector('#bf-product').value || '').trim();
    var qty     = parseInt(container.querySelector('#bf-qty-range').value) || 50;
    var message = (container.querySelector('#bf-message').value || '').trim();

    if (!name)    { showToast('Please enter your name', 'error');    return; }
    if (!email || !email.includes('@')) { showToast('Please enter a valid email', 'error'); return; }
    if (!country) { showToast('Please select your country', 'error'); return; }
    if (!product) { showToast('Please select a product', 'error');   return; }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    /* Build notes combining phone + product + message */
    var notes = '';
    if (phone)   notes += 'Phone: ' + phone + '\n';
    if (product) notes += 'Product: ' + product + '\n';
    if (message) notes += 'Notes: ' + message;

    var res = await supabase.from('bulk_orders').insert({
      name:        name,
      email:       email,
      company:     company || null,
      country:     country,
      quantity_kg: qty,
      message:     notes || null,
      status:      'new',
    });

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry';

    if (res.error) {
      console.error('[BulkOrders]', res.error);
      showToast('Something went wrong. Please try again.', 'error');
      return;
    }

    showSuccess(form);
  });
}

/* ── Init ── */
export async function init(container) {
  if (!document.getElementById('bulk-css')) {
    var style       = document.createElement('style');
    style.id        = 'bulk-css';
    style.textContent = BULK_CSS;
    document.head.appendChild(style);
  }

  container.innerHTML = buildPage();
  wireEvents(container);
  initReveals();
}

export default init;
