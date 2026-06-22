/* ================================================================
   KITHTHA GRAND — Contact Us Page
   js/pages/contact.js
================================================================ */

import { initReveals, showToast } from '../app.js';
import { supabase }               from '../supabase.js';

/* ── CSS ── */
const CSS = [
  '.contact-page{min-height:100vh;background:var(--cream)}',

  /* hero */
  '.contact-hero{background:#0a0502;padding:120px 0 80px;position:relative;overflow:hidden}',
  '.contact-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(139,37,0,.85) 0%,rgba(61,28,2,.95) 60%,#0a0502 100%)}',
  '.contact-hero-overlay{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(200,144,10,.03) 40px,rgba(200,144,10,.03) 80px)}',
  '.contact-hero .container{position:relative;z-index:1}',
  '.contact-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}',
  '.contact-hero h1{font-family:var(--font-head);font-size:clamp(2rem,5vw,3.4rem);color:var(--cream);line-height:1.2;margin-bottom:16px}',
  '.contact-hero-sub{font-size:.95rem;color:rgba(253,243,227,.55);font-style:italic;max-width:500px;line-height:1.8}',
  '.contact-hero-rule{display:flex;gap:8px;margin-top:28px;align-items:center}',
  '.contact-hero-rule span{display:block;height:2px;border-radius:99px}',

  /* quick cards */
  '.contact-quick{padding:48px 0 0}',
  '.contact-quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}',
  '.contact-quick-card{background:white;border-radius:20px;padding:28px 24px;display:flex;align-items:flex-start;gap:18px;border:1px solid var(--cream-dark);transition:.25s;text-decoration:none;cursor:pointer}',
  '.contact-quick-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(61,28,2,.1);border-color:rgba(200,144,10,.3)}',
  '.cq-icon{width:52px;min-width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem}',
  '.cq-icon.whatsapp{background:rgba(37,211,102,.1);color:#25d366}',
  '.cq-icon.email{background:rgba(139,37,0,.08);color:var(--red)}',
  '.cq-icon.location{background:rgba(200,144,10,.1);color:var(--gold)}',
  '.cq-label{font-family:var(--font-sub);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brown-light);margin-bottom:4px}',
  '.cq-value{font-family:var(--font-sub);font-size:.88rem;color:var(--brown);font-weight:600;letter-spacing:.02em}',
  '.cq-note{font-size:.78rem;color:var(--brown-light);font-style:italic;margin-top:2px}',

  /* main body */
  '.contact-body{padding:48px 0 80px}',
  '.contact-grid{display:grid;grid-template-columns:1fr 400px;gap:48px;align-items:start}',

  /* form card */
  '.contact-form-card{background:white;border-radius:24px;border:1px solid var(--cream-dark);padding:40px;box-shadow:0 4px 24px rgba(61,28,2,.06)}',
  '.contact-form-title{font-family:var(--font-head);font-size:1.4rem;color:var(--brown);margin-bottom:6px}',
  '.contact-form-sub{font-size:.88rem;color:var(--brown-light);font-style:italic;margin-bottom:32px}',
  '.cf-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
  '.cf-group{margin-bottom:18px}',
  '.cf-label{display:block;font-family:var(--font-sub);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown-light);margin-bottom:7px}',
  '.cf-label span{color:var(--red);margin-left:2px}',
  '.cf-input{width:100%;padding:12px 16px;border:1.5px solid var(--cream-dark);border-radius:12px;font-family:var(--font-body);font-size:1rem;color:var(--brown);background:var(--cream);outline:none;transition:.2s;box-sizing:border-box}',
  '.cf-input:focus{border-color:var(--gold);background:white;box-shadow:0 0 0 3px rgba(200,144,10,.1)}',
  '.cf-input::placeholder{color:rgba(61,28,2,.3)}',
  '.cf-select{appearance:none;-webkit-appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\'%3E%3Cpath d=\'M0 0l6 8 6-8z\' fill=\'%236B3A1F\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}',
  '.cf-textarea{resize:vertical;min-height:130px}',
  '.cf-submit{width:100%;padding:15px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:12px;font-family:var(--font-sub);font-size:.82rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:none;transition:.2s;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:10px}',
  '.cf-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(139,37,0,.3)}',
  '.cf-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}',

  /* success state */
  '.cf-success{display:none;text-align:center;padding:40px 20px}',
  '.cf-success.show{display:block}',
  '.cf-success-ico{font-size:3.5rem;margin-bottom:16px}',
  '.cf-success h3{font-family:var(--font-head);font-size:1.5rem;color:var(--brown);margin-bottom:8px}',
  '.cf-success p{font-size:.9rem;color:var(--brown-light);font-style:italic;line-height:1.7;margin-bottom:24px}',
  '.cf-success-wa{display:inline-flex;align-items:center;gap:10px;padding:13px 28px;background:#25d366;color:white;border-radius:99px;font-family:var(--font-sub);font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;transition:.2s}',
  '.cf-success-wa:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,211,102,.35)}',

  /* info sidebar */
  '.contact-info{display:flex;flex-direction:column;gap:20px}',
  '.ci-card{background:white;border-radius:20px;padding:28px;border:1px solid var(--cream-dark)}',
  '.ci-card-title{font-family:var(--font-sub);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);margin-bottom:16px;display:flex;align-items:center;gap:8px}',
  '.ci-item{display:flex;gap:14px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--cream-dark)}',
  '.ci-item:last-child{border-bottom:none;padding-bottom:0}',
  '.ci-ico{width:36px;min-width:36px;height:36px;border-radius:10px;background:rgba(200,144,10,.08);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:.85rem}',
  '.ci-txt label{display:block;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown-light);margin-bottom:2px}',
  '.ci-txt a,.ci-txt span{font-size:.85rem;color:var(--brown);text-decoration:none;display:block}',
  '.ci-txt a:hover{color:var(--red)}',
  '.ci-hours-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--cream-dark);font-size:.82rem}',
  '.ci-hours-row:last-child{border-bottom:none}',
  '.ci-hours-row span:first-child{color:var(--brown-light);font-style:italic}',
  '.ci-hours-row span:last-child{color:var(--brown);font-family:var(--font-sub);font-size:.75rem;letter-spacing:.04em}',
  '.ci-badge-open{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);border-radius:99px;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:#16a34a;margin-top:12px}',
  '.ci-badge-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 1.4s ease infinite}',

  /* map card */
  '.ci-map{border-radius:14px;overflow:hidden;height:140px;background:linear-gradient(135deg,rgba(139,37,0,.08),rgba(200,144,10,.06));display:flex;align-items:center;justify-content:center;margin-top:16px;position:relative;border:1px solid var(--cream-dark)}',
  '.ci-map-pin{font-size:2.2rem}',
  '.ci-map-label{position:absolute;bottom:12px;left:0;right:0;text-align:center;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brown-light)}',

  /* responsive */
  '@media(max-width:900px){',
  '.contact-grid{grid-template-columns:1fr}',
  '.contact-quick-grid{grid-template-columns:1fr}',
  '}',
  '@media(max-width:600px){.cf-row{grid-template-columns:1fr}}',
  '@media(max-width:480px){',
  '.contact-form-card{padding:24px 20px}',
  '.ci-card{padding:20px}',
  '}',
].join('');

/* ── Render ── */
function renderHero() {
  return (
    '<section class="contact-hero">'
      + '<div class="contact-hero-bg"></div>'
      + '<div class="contact-hero-overlay"></div>'
      + '<div class="container">'
        + '<p class="contact-eyebrow reveal">Contact Us</p>'
        + '<h1 class="reveal" style="--delay:.08s">Get in Touch</h1>'
        + '<p class="contact-hero-sub reveal" style="--delay:.14s">'
          + 'A question about our spices? An order you need help with? We are always delighted to hear from you &mdash; reach out any time.'
        + '</p>'
        + '<div class="contact-hero-rule reveal" style="--delay:.2s">'
          + '<span style="width:40px;background:var(--gold)"></span>'
          + '<span style="width:20px;background:rgba(200,144,10,.4)"></span>'
          + '<span style="width:10px;background:rgba(200,144,10,.2)"></span>'
        + '</div>'
      + '</div>'
    + '</section>'
  );
}

function renderQuickCards(s) {
  var waDigits = (s.whatsapp_number || '94771234567').replace(/[^0-9]/g, '');
  var waDisplay = '+' + waDigits;
  var email = s.shop_email || 'hello@kiththagrand.com';
  var location = s.shop_location || 'Colombo, Sri Lanka';
  return (
    '<section class="contact-quick">'
      + '<div class="container">'
        + '<div class="contact-quick-grid">'
          + '<a class="contact-quick-card reveal" href="https://wa.me/' + waDigits + '" target="_blank" rel="noopener">'
            + '<div class="cq-icon whatsapp"><i class="fab fa-whatsapp"></i></div>'
            + '<div>'
              + '<p class="cq-label">WhatsApp</p>'
              + '<p class="cq-value">' + waDisplay + '</p>'
              + '<p class="cq-note">Fastest response &mdash; usually within an hour</p>'
            + '</div>'
          + '</a>'
          + '<a class="contact-quick-card reveal" style="--delay:.06s" href="mailto:' + email + '">'
            + '<div class="cq-icon email"><i class="fas fa-envelope"></i></div>'
            + '<div>'
              + '<p class="cq-label">Email</p>'
              + '<p class="cq-value">' + email + '</p>'
              + '<p class="cq-note">We reply within 24 hours on business days</p>'
            + '</div>'
          + '</a>'
          + '<div class="contact-quick-card reveal" style="--delay:.12s">'
            + '<div class="cq-icon location"><i class="fas fa-map-marker-alt"></i></div>'
            + '<div>'
              + '<p class="cq-label">Location</p>'
              + '<p class="cq-value">' + location + '</p>'
              + '<p class="cq-note">Shipping worldwide from the island of spices</p>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</div>'
    + '</section>'
  );
}

function renderForm() {
  return (
    '<div class="contact-form-card reveal">'
      + '<h2 class="contact-form-title">Send a Message</h2>'
      + '<p class="contact-form-sub">Fill in the form below and we will get back to you promptly.</p>'

      + '<form id="contact-form" novalidate>'
        + '<div class="cf-row">'
          + '<div class="cf-group">'
            + '<label class="cf-label" for="cf-name">Your Name <span>*</span></label>'
            + '<input class="cf-input" id="cf-name" type="text" placeholder="Kamal Perera" required />'
          + '</div>'
          + '<div class="cf-group">'
            + '<label class="cf-label" for="cf-email">Email Address <span>*</span></label>'
            + '<input class="cf-input" id="cf-email" type="email" placeholder="kamal@example.com" required />'
          + '</div>'
        + '</div>'
        + '<div class="cf-group">'
          + '<label class="cf-label" for="cf-subject">Subject <span>*</span></label>'
          + '<select class="cf-input cf-select" id="cf-subject" required>'
            + '<option value="">Select a topic...</option>'
            + '<option value="general">General Inquiry</option>'
            + '<option value="product">Product Question</option>'
            + '<option value="order">Order Issue</option>'
            + '<option value="bulk">Bulk / Wholesale</option>'
            + '<option value="other">Other</option>'
          + '</select>'
        + '</div>'
        + '<div class="cf-group">'
          + '<label class="cf-label" for="cf-message">Message <span>*</span></label>'
          + '<textarea class="cf-input cf-textarea" id="cf-message" placeholder="Tell us how we can help..." required></textarea>'
        + '</div>'
        + '<button class="cf-submit" id="cf-btn" type="submit">'
          + '<i class="fas fa-paper-plane"></i> Send Message'
        + '</button>'
      + '</form>'

      + '<div class="cf-success" id="cf-success">'
        + '<div class="cf-success-ico">&#127801;</div>'
        + '<h3>Message Received!</h3>'
        + '<p>Thank you for reaching out. Our team will get back to you within 24 hours. In the meantime, feel free to chat with us directly on WhatsApp for a faster response.</p>'
        + '<a class="cf-success-wa" id="cf-success-wa-link" href="https://wa.me/94771234567" target="_blank" rel="noopener">'
          + '<i class="fab fa-whatsapp"></i> Chat on WhatsApp'
        + '</a>'
      + '</div>'
    + '</div>'
  );
}

function renderInfo(s) {
  var waDigits = (s.whatsapp_number || '94771234567').replace(/[^0-9]/g, '');
  var waDisplay = '+' + waDigits;
  var email = s.shop_email || 'hello@kiththagrand.com';
  var location = s.shop_location || 'Colombo, Sri Lanka';
  return (
    '<div class="contact-info">'
      + '<div class="ci-card reveal" style="--delay:.1s">'
        + '<p class="ci-card-title"><i class="fas fa-address-card"></i> Contact Details</p>'
        + '<div class="ci-item">'
          + '<div class="ci-ico"><i class="fab fa-whatsapp"></i></div>'
          + '<div class="ci-txt"><label>WhatsApp</label><a href="https://wa.me/' + waDigits + '" target="_blank">' + waDisplay + '</a></div>'
        + '</div>'
        + '<div class="ci-item">'
          + '<div class="ci-ico"><i class="fas fa-envelope"></i></div>'
          + '<div class="ci-txt"><label>Email</label><a href="mailto:' + email + '">' + email + '</a></div>'
        + '</div>'
        + '<div class="ci-item">'
          + '<div class="ci-ico"><i class="fas fa-globe"></i></div>'
          + '<div class="ci-txt"><label>Website</label><span>kiththagrand.com</span></div>'
        + '</div>'
        + '<div class="ci-item">'
          + '<div class="ci-ico"><i class="fas fa-map-marker-alt"></i></div>'
          + '<div class="ci-txt"><label>Location</label><span>' + location + '</span></div>'
        + '</div>'
        + '<div class="ci-map">'
          + '<span class="ci-map-pin">&#128205;</span>'
          + '<p class="ci-map-label">' + location + ' &mdash; Island of Spices</p>'
        + '</div>'
      + '</div>'

      + '<div class="ci-card reveal" style="--delay:.18s">'
        + '<p class="ci-card-title"><i class="fas fa-clock"></i> Business Hours</p>'
        + '<div class="ci-hours-row"><span>Monday &ndash; Friday</span><span>9:00 AM &ndash; 6:00 PM</span></div>'
        + '<div class="ci-hours-row"><span>Saturday</span><span>9:00 AM &ndash; 2:00 PM</span></div>'
        + '<div class="ci-hours-row"><span>Sunday</span><span>Closed</span></div>'
        + '<p style="font-size:.75rem;color:var(--brown-light);font-style:italic;margin-top:12px">All times in Sri Lanka Standard Time (IST, UTC+5:30)</p>'
        + '<span class="ci-badge-open"><span class="ci-badge-dot"></span> WhatsApp available 24/7</span>'
      + '</div>'
    + '</div>'
  );
}

/* ── Init ── */
export async function init(container) {
  if (!document.getElementById('contact-css')) {
    var s = document.createElement('style');
    s.id = 'contact-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  var settingsMap = {};
  var settingsRes = await supabase.from('settings').select('key, value')
    .in('key', ['whatsapp_number', 'shop_email', 'shop_location']);
  (settingsRes.data || []).forEach(function(r) { settingsMap[r.key] = r.value; });

  container.innerHTML = (
    '<div class="contact-page">'
      + renderHero()
      + renderQuickCards(settingsMap)
      + '<section class="contact-body"><div class="container"><div class="contact-grid">'
        + renderForm()
        + renderInfo(settingsMap)
      + '</div></div></section>'
    + '</div>'
  );

  var successWaLink = container.querySelector('#cf-success-wa-link');
  if (successWaLink) {
    successWaLink.href = 'https://wa.me/' + (settingsMap.whatsapp_number || '94771234567').replace(/[^0-9]/g, '');
  }

  /* form submit */
  var form    = container.querySelector('#contact-form');
  var btn     = container.querySelector('#cf-btn');
  var success = container.querySelector('#cf-success');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name    = container.querySelector('#cf-name').value.trim();
      var email   = container.querySelector('#cf-email').value.trim();
      var subject = container.querySelector('#cf-subject').value;
      var message = container.querySelector('#cf-message').value.trim();

      if (!name || !email || !subject || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }
      if (!email.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      setTimeout(function() {
        form.style.display = 'none';
        if (success) success.classList.add('show');
      }, 1200);
    });
  }

  initReveals();
}

export default init;
