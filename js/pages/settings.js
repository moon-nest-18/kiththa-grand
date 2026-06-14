/* ================================================================
   KITHTHA GRAND — Settings Page
   js/pages/settings.js
================================================================ */
import { supabase }                        from '../supabase.js';
import { router }                          from '../router.js';
import { showToast, state, initReveals }   from '../app.js';

/* ── Injected styles ── */
function injectStyles() {
  if (document.getElementById('st-styles')) return;
  var el = document.createElement('style');
  el.id  = 'st-styles';
  el.textContent = [
    /* Hero */
    '.st-hero{position:relative;min-height:260px;display:flex;align-items:flex-end;padding-bottom:40px;overflow:hidden}',
    '.st-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 60% 40%,#3D1C02 0%,#1a0a00 60%,#0d0400 100%)}',
    '.st-hero-ov{position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23C8900A\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}',
    '.st-hero-inner{position:relative;z-index:1;width:100%;max-width:1100px;margin:0 auto;padding:0 24px;display:flex;flex-direction:column;gap:10px}',
    '.st-eyebrow{font-family:var(--font-sub);font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-light);opacity:.8}',
    '.st-hero-title{font-family:var(--font-head);font-size:clamp(1.8rem,5vw,2.8rem);color:var(--cream);line-height:1.1;margin:0}',
    '.st-hero-sub{font-family:var(--font-body);font-style:italic;color:rgba(253,243,227,.6);font-size:.95rem;margin:0}',
    /* Layout */
    '.st-wrap{max-width:720px;margin:0 auto;padding:40px 16px 80px}',
    '.st-section{background:var(--cream);border-radius:16px;margin-bottom:20px;overflow:hidden;box-shadow:0 2px 12px rgba(61,28,2,.06)}',
    '.st-section-head{display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid rgba(200,144,10,.15);background:linear-gradient(135deg,rgba(61,28,2,.03),transparent)}',
    '.st-section-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}',
    '.st-section-icon.red{background:linear-gradient(135deg,var(--red-dark),var(--red))}',
    '.st-section-icon.gold{background:linear-gradient(135deg,#b07a00,var(--gold))}',
    '.st-section-icon.green{background:linear-gradient(135deg,#1a3d2a,var(--green))}',
    '.st-section-icon.purple{background:linear-gradient(135deg,#2a1a5e,#6b2fbe)}',
    '.st-section-icon.dark{background:linear-gradient(135deg,#1a0a00,#3D1C02)}',
    '.st-section-icon i{color:#fff;font-size:.85rem}',
    '.st-section-title{font-family:var(--font-sub);font-size:.78rem;letter-spacing:.15em;text-transform:uppercase;color:var(--brown);font-weight:700}',
    '.st-section-body{padding:20px}',
    /* Row */
    '.st-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid rgba(61,28,2,.06)}',
    '.st-row:last-child{border-bottom:none;padding-bottom:0}',
    '.st-row:first-child{padding-top:0}',
    '.st-row-info{flex:1;min-width:0}',
    '.st-row-label{font-family:var(--font-sub);font-size:.83rem;color:var(--brown);font-weight:600;letter-spacing:.02em}',
    '.st-row-desc{font-family:var(--font-body);font-size:.78rem;color:var(--brown-light,#7a5a3a);margin-top:3px;font-style:italic}',
    /* Toggle switch */
    '.st-toggle{position:relative;width:48px;height:26px;flex-shrink:0;cursor:pointer}',
    '.st-toggle input{opacity:0;width:0;height:0;position:absolute}',
    '.st-slider{position:absolute;inset:0;background:#d4c5b0;border-radius:99px;transition:background .25s}',
    '.st-slider::before{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .25s;box-shadow:0 1px 4px rgba(0,0,0,.2)}',
    '.st-toggle input:checked + .st-slider{background:var(--red)}',
    '.st-toggle input:checked + .st-slider::before{transform:translateX(22px)}',
    /* Select */
    '.st-select{font-family:var(--font-sub);font-size:.8rem;color:var(--brown);background:rgba(61,28,2,.05);border:1.5px solid rgba(200,144,10,.25);border-radius:10px;padding:8px 34px 8px 12px;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%238B2500\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer;min-width:130px}',
    '.st-select:focus{outline:none;border-color:var(--red)}',
    /* Password input */
    '.st-input-wrap{position:relative;margin-top:12px}',
    '.st-input{width:100%;font-family:var(--font-sub);font-size:.83rem;color:var(--brown);background:rgba(61,28,2,.04);border:1.5px solid rgba(200,144,10,.2);border-radius:10px;padding:10px 40px 10px 14px;box-sizing:border-box;transition:border .2s}',
    '.st-input:focus{outline:none;border-color:var(--red);background:rgba(139,37,0,.04)}',
    '.st-input-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--brown);opacity:.5;font-size:.85rem;padding:4px}',
    '.st-input-label{font-family:var(--font-sub);font-size:.73rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown);opacity:.7;margin-bottom:4px;display:block}',
    '.st-input-group{margin-bottom:14px}',
    '.st-input-group:last-child{margin-bottom:0}',
    /* Buttons */
    '.st-btn{font-family:var(--font-sub);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;border:none;border-radius:10px;padding:10px 20px;cursor:pointer;transition:opacity .2s,transform .15s}',
    '.st-btn:active{transform:scale(.97)}',
    '.st-btn-primary{background:linear-gradient(135deg,var(--red-dark),var(--red));color:#fff}',
    '.st-btn-outline{background:transparent;border:1.5px solid var(--red);color:var(--red)}',
    '.st-btn-danger{background:linear-gradient(135deg,#7a0000,#c0392b);color:#fff}',
    '.st-btn-sm{padding:8px 16px;font-size:.7rem}',
    '.st-btn:disabled{opacity:.5;cursor:not-allowed}',
    /* Danger zone */
    '.st-danger-zone{border:1.5px solid rgba(192,57,43,.3);background:rgba(192,57,43,.04)}',
    '.st-danger-zone .st-section-head{background:rgba(192,57,43,.06)}',
    '.st-danger-text{font-family:var(--font-body);font-size:.85rem;color:#7a3a3a;font-style:italic;margin-bottom:16px}',
    /* Password strength bar */
    '.st-strength{height:3px;border-radius:3px;margin-top:6px;background:#e0d5c8;overflow:hidden}',
    '.st-strength-fill{height:100%;border-radius:3px;transition:width .3s,background .3s;width:0%}',
    /* Save bar */
    '.st-save-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:14px 20px;background:linear-gradient(135deg,rgba(200,144,10,.08),transparent);border-top:1px solid rgba(200,144,10,.15)}',
    '.st-saved-chip{font-family:var(--font-sub);font-size:.7rem;color:var(--green);display:flex;align-items:center;gap:5px;opacity:0;transition:opacity .3s}',
    '.st-saved-chip.show{opacity:1}',
    /* Divider */
    '.st-divider{height:1px;background:rgba(61,28,2,.07);margin:6px 0}',
    /* Avatar / profile summary at top */
    '.st-profile-card{display:flex;align-items:center;gap:16px;padding:20px;background:linear-gradient(135deg,rgba(61,28,2,.06),transparent);border-bottom:1px solid rgba(200,144,10,.15)}',
    '.st-avatar{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--red-dark),var(--red));display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-size:1.3rem;color:#fff;flex-shrink:0;border:3px solid var(--gold-light)}',
    '.st-profile-name{font-family:var(--font-sub);font-size:.9rem;color:var(--brown);font-weight:700}',
    '.st-profile-email{font-family:var(--font-body);font-size:.78rem;color:var(--brown-light,#7a5a3a);font-style:italic;margin-top:2px}',
    '.st-profile-link{font-family:var(--font-sub);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--red);margin-top:4px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;text-decoration:none}',
    /* Points badge */
    '.st-pts-badge{display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#b07a00,var(--gold));color:#fff;font-family:var(--font-sub);font-size:.68rem;letter-spacing:.1em;padding:3px 10px;border-radius:99px;text-transform:uppercase}',
    /* Info line */
    '.st-info-line{font-family:var(--font-body);font-size:.78rem;color:var(--brown-light,#7a5a3a);font-style:italic;margin-top:6px}',
    /* Mobile */
    '@media(max-width:600px){',
    '.st-wrap{padding:24px 12px 80px}',
    '.st-section-body{padding:16px}',
    '.st-row{gap:8px}',
    '.st-select{min-width:110px;font-size:.75rem}',
    '.st-btn{padding:9px 16px}',
    '.st-save-bar{padding:12px 16px}',
    '.st-hero{min-height:200px;padding-bottom:28px}',
    '}',
  ].join('');
  document.head.appendChild(el);
}

/* ── Helper: password strength ── */
function pwStrength(pw) {
  if (!pw) return 0;
  var score = 0;
  if (pw.length >= 8)              score++;
  if (pw.length >= 12)             score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  return score; /* 0–5 */
}

function strengthColor(s) {
  if (s <= 1) return '#e74c3c';
  if (s <= 2) return '#e67e22';
  if (s <= 3) return '#f1c40f';
  return '#27ae60';
}

/* ── Build HTML ── */
function buildHTML(user, prefs) {
  var initials = ((prefs && prefs.full_name) || user.email || 'KG')
    .split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  var name    = (prefs && prefs.full_name)  || 'Spice Lover';
  var email   = user.email || '';
  var points  = (prefs && prefs.loyalty_points) || 0;

  var emailNotif  = prefs && prefs.email_notifications     !== false ? 'checked' : '';
  var waNotif     = prefs && prefs.whatsapp_notifications  !== false ? 'checked' : '';
  var orderUpd    = localStorage.getItem('kg_notif_orders') !== '0'  ? 'checked' : '';
  var promoNotif  = localStorage.getItem('kg_notif_promo')  !== '0'  ? 'checked' : '';
  var lang        = (prefs && prefs.language)   || 'en';
  var currency    = (prefs && prefs.currency)   || state.currency || 'LKR';
  var packaging   = (prefs && prefs.packaging)  || 'standard';
  var soundOn     = state.sound !== false;

  return ''
    /* Hero */
    + '<div class="st-hero">'
    +   '<div class="st-hero-bg"></div>'
    +   '<div class="st-hero-ov"></div>'
    +   '<div class="st-hero-inner">'
    +     '<p class="st-eyebrow">Your Account</p>'
    +     '<h1 class="st-hero-title">Settings</h1>'
    +     '<p class="st-hero-sub">Manage your preferences and account</p>'
    +   '</div>'
    + '</div>'

    + '<div class="st-wrap">'

    /* ── Profile summary card ── */
    + '<div class="st-section">'
    +   '<div class="st-profile-card">'
    +     '<div class="st-avatar">' + initials + '</div>'
    +     '<div>'
    +       '<div class="st-profile-name">' + name + '</div>'
    +       '<div class="st-profile-email">' + email + '</div>'
    +       '<div style="margin-top:6px"><span class="st-pts-badge"><i class="fas fa-star"></i> ' + points.toLocaleString() + ' pts</span></div>'
    +     '</div>'
    +     '<a class="st-profile-link" data-go="profile" style="margin-left:auto"><i class="fas fa-edit"></i> Edit</a>'
    +   '</div>'
    + '</div>'

    /* ── Notifications ── */
    + '<div class="st-section reveal">'
    +   '<div class="st-section-head">'
    +     '<div class="st-section-icon red"><i class="fas fa-bell"></i></div>'
    +     '<span class="st-section-title">Notifications</span>'
    +   '</div>'
    +   '<div class="st-section-body">'

    +     '<div class="st-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label">Email Notifications</div>'
    +         '<div class="st-row-desc">Order updates, receipts, account alerts</div>'
    +       '</div>'
    +       '<label class="st-toggle"><input type="checkbox" id="tog-email" ' + emailNotif + '><span class="st-slider"></span></label>'
    +     '</div>'

    +     '<div class="st-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label">WhatsApp Notifications</div>'
    +         '<div class="st-row-desc">Shipping updates via WhatsApp</div>'
    +       '</div>'
    +       '<label class="st-toggle"><input type="checkbox" id="tog-wa" ' + waNotif + '><span class="st-slider"></span></label>'
    +     '</div>'

    +     '<div class="st-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label">Order Status Updates</div>'
    +         '<div class="st-row-desc">Packed, shipped, delivered notifications</div>'
    +       '</div>'
    +       '<label class="st-toggle"><input type="checkbox" id="tog-orders" ' + orderUpd + '><span class="st-slider"></span></label>'
    +     '</div>'

    +     '<div class="st-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label">Promotions &amp; Offers</div>'
    +         '<div class="st-row-desc">Sales, new arrivals, special deals</div>'
    +       '</div>'
    +       '<label class="st-toggle"><input type="checkbox" id="tog-promo" ' + promoNotif + '><span class="st-slider"></span></label>'
    +     '</div>'

    +   '</div>'
    +   '<div class="st-save-bar">'
    +     '<span class="st-saved-chip" id="notif-saved"><i class="fas fa-check"></i> Saved</span>'
    +     '<button class="st-btn st-btn-primary st-btn-sm" id="btn-save-notif">Save</button>'
    +   '</div>'
    + '</div>'

    /* ── Display Preferences ── */
    + '<div class="st-section reveal">'
    +   '<div class="st-section-head">'
    +     '<div class="st-section-icon gold"><i class="fas fa-sliders-h"></i></div>'
    +     '<span class="st-section-title">Display &amp; Preferences</span>'
    +   '</div>'
    +   '<div class="st-section-body">'

    +     '<div class="st-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label">Language</div>'
    +         '<div class="st-row-desc">Interface language</div>'
    +       '</div>'
    +       '<select class="st-select" id="sel-lang">'
    +         '<option value="en"' + (lang === 'en' ? ' selected' : '') + '>English</option>'
    +         '<option value="si"' + (lang === 'si' ? ' selected' : '') + '>සිංහල</option>'
    +       '</select>'
    +     '</div>'

    +     '<div class="st-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label">Currency</div>'
    +         '<div class="st-row-desc">Prices display in this currency</div>'
    +       '</div>'
    +       '<select class="st-select" id="sel-currency">'
    +         '<option value="LKR"' + (currency === 'LKR' ? ' selected' : '') + '>Rs. LKR</option>'
    +         '<option value="USD"' + (currency === 'USD' ? ' selected' : '') + '>$ USD</option>'
    +         '<option value="EUR"' + (currency === 'EUR' ? ' selected' : '') + '>€ EUR</option>'
    +         '<option value="GBP"' + (currency === 'GBP' ? ' selected' : '') + '>£ GBP</option>'
    +       '</select>'
    +     '</div>'

    +     '<div class="st-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label">Packaging Type</div>'
    +         '<div class="st-row-desc">Preferred packaging for your orders</div>'
    +       '</div>'
    +       '<select class="st-select" id="sel-packaging">'
    +         '<option value="standard"'  + (packaging === 'standard'  ? ' selected' : '') + '>Standard</option>'
    +         '<option value="gift"'      + (packaging === 'gift'      ? ' selected' : '') + '>Gift Wrap</option>'
    +         '<option value="eco"'       + (packaging === 'eco'       ? ' selected' : '') + '>Eco Pack</option>'
    +         '<option value="bulk"'      + (packaging === 'bulk'      ? ' selected' : '') + '>Bulk Pack</option>'
    +       '</select>'
    +     '</div>'

    +     '<div class="st-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label">Background Music</div>'
    +         '<div class="st-row-desc">Ambient spice market sounds</div>'
    +       '</div>'
    +       '<label class="st-toggle"><input type="checkbox" id="tog-sound"' + (soundOn ? ' checked' : '') + '><span class="st-slider"></span></label>'
    +     '</div>'

    +   '</div>'
    +   '<div class="st-save-bar">'
    +     '<span class="st-saved-chip" id="disp-saved"><i class="fas fa-check"></i> Saved</span>'
    +     '<button class="st-btn st-btn-primary st-btn-sm" id="btn-save-disp">Save</button>'
    +   '</div>'
    + '</div>'

    /* ── Change Password ── */
    + '<div class="st-section reveal">'
    +   '<div class="st-section-head">'
    +     '<div class="st-section-icon green"><i class="fas fa-lock"></i></div>'
    +     '<span class="st-section-title">Change Password</span>'
    +   '</div>'
    +   '<div class="st-section-body">'
    +     '<p class="st-info-line">Leave blank to keep your current password.</p>'
    +     '<div class="st-input-group" style="margin-top:14px">'
    +       '<label class="st-input-label" for="pw-new">New Password</label>'
    +       '<div class="st-input-wrap">'
    +         '<input class="st-input" type="password" id="pw-new" placeholder="Min. 8 characters" autocomplete="new-password" />'
    +         '<button class="st-input-eye" type="button" data-eye="pw-new"><i class="fas fa-eye"></i></button>'
    +       '</div>'
    +       '<div class="st-strength"><div class="st-strength-fill" id="pw-strength-bar"></div></div>'
    +     '</div>'
    +     '<div class="st-input-group">'
    +       '<label class="st-input-label" for="pw-confirm">Confirm New Password</label>'
    +       '<div class="st-input-wrap">'
    +         '<input class="st-input" type="password" id="pw-confirm" placeholder="Repeat new password" autocomplete="new-password" />'
    +         '<button class="st-input-eye" type="button" data-eye="pw-confirm"><i class="fas fa-eye"></i></button>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="st-save-bar">'
    +     '<span class="st-saved-chip" id="pw-saved"><i class="fas fa-check"></i> Password changed</span>'
    +     '<button class="st-btn st-btn-primary st-btn-sm" id="btn-save-pw">Update Password</button>'
    +   '</div>'
    + '</div>'

    /* ── Linked Accounts ── */
    + '<div class="st-section reveal">'
    +   '<div class="st-section-head">'
    +     '<div class="st-section-icon purple"><i class="fas fa-link"></i></div>'
    +     '<span class="st-section-title">Linked Accounts</span>'
    +   '</div>'
    +   '<div class="st-section-body">'
    +     '<div class="st-row" id="google-link-row">'
    +       '<div class="st-row-info">'
    +         '<div class="st-row-label"><i class="fab fa-google" style="color:#ea4335;margin-right:6px"></i>Google</div>'
    +         '<div class="st-row-desc" id="google-status">Checking...</div>'
    +       '</div>'
    +       '<button class="st-btn st-btn-outline st-btn-sm" id="btn-google-link">Link</button>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    /* ── Danger Zone ── */
    + '<div class="st-section st-danger-zone reveal">'
    +   '<div class="st-section-head">'
    +     '<div class="st-section-icon dark"><i class="fas fa-exclamation-triangle" style="color:#e74c3c"></i></div>'
    +     '<span class="st-section-title" style="color:#c0392b">Danger Zone</span>'
    +   '</div>'
    +   '<div class="st-section-body">'
    +     '<p class="st-danger-text">These actions are permanent and cannot be undone.</p>'
    +     '<div style="display:flex;flex-direction:column;gap:10px">'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
    +         '<div>'
    +           '<div class="st-row-label">Sign Out Everywhere</div>'
    +           '<div class="st-row-desc">Logs you out of all devices</div>'
    +         '</div>'
    +         '<button class="st-btn st-btn-outline st-btn-sm" id="btn-signout-all" style="border-color:#c0392b;color:#c0392b">Sign Out All</button>'
    +       '</div>'
    +       '<div class="st-divider"></div>'
    +       '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
    +         '<div>'
    +           '<div class="st-row-label">Delete Account</div>'
    +           '<div class="st-row-desc">Permanently delete your account and all data</div>'
    +         '</div>'
    +         '<button class="st-btn st-btn-danger st-btn-sm" id="btn-delete-acct">Delete</button>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    + '</div>'; /* st-wrap */
}

/* ── Flash saved chip ── */
function flashSaved(id) {
  var chip = document.getElementById(id);
  if (!chip) return;
  chip.classList.add('show');
  setTimeout(function() { chip.classList.remove('show'); }, 2500);
}

/* ── Bind all events ── */
function bindEvents(userId) {

  /* Profile quick link */
  var goProfile = document.querySelector('[data-go="profile"]');
  if (goProfile) {
    goProfile.addEventListener('click', function() { router.go('profile'); });
  }

  /* ── Save Notifications ── */
  var btnNotif = document.getElementById('btn-save-notif');
  if (btnNotif) {
    btnNotif.addEventListener('click', async function() {
      btnNotif.disabled = true;
      var emailVal  = document.getElementById('tog-email').checked;
      var waVal     = document.getElementById('tog-wa').checked;
      var orderVal  = document.getElementById('tog-orders').checked;
      var promoVal  = document.getElementById('tog-promo').checked;
      /* Save only columns that exist in the schema */
      localStorage.setItem('kg_notif_orders', orderVal ? '1' : '0');
      localStorage.setItem('kg_notif_promo',  promoVal ? '1' : '0');
      var { error } = await supabase.from('user_preferences').upsert({
        user_id:                 userId,
        email_notifications:     emailVal,
        whatsapp_notifications:  waVal,
      }, { onConflict: 'user_id' });
      btnNotif.disabled = false;
      if (error) { showToast('Could not save. Try again.', 'error'); return; }
      flashSaved('notif-saved');
      showToast('Notification settings saved', 'success');
    });
  }

  /* ── Save Display Prefs ── */
  var btnDisp = document.getElementById('btn-save-disp');
  if (btnDisp) {
    btnDisp.addEventListener('click', async function() {
      btnDisp.disabled = true;
      var langVal      = document.getElementById('sel-lang').value;
      var currencyVal  = document.getElementById('sel-currency').value;
      var packVal      = document.getElementById('sel-packaging').value;
      var soundVal     = document.getElementById('tog-sound').checked;

      /* Update currency globally */
      if (currencyVal !== state.currency) {
        state.currency = currencyVal;
        localStorage.setItem('kg_currency', currencyVal);
        localStorage.setItem('kg_currency_manual', '1');
        var navSel  = document.getElementById('currency-select');
        var mobSel  = document.getElementById('mobile-currency-select');
        if (navSel)  navSel.value  = currencyVal;
        if (mobSel)  mobSel.value  = currencyVal;
        document.dispatchEvent(new CustomEvent('currencyChange', { detail: currencyVal }));
      }

      /* Update sound globally */
      state.sound = soundVal;
      localStorage.setItem('kg_sound', soundVal ? 'on' : 'off');
      var soundBtn = document.getElementById('sound-btn');
      if (soundBtn) {
        soundBtn.querySelector('i').className = soundVal ? 'fas fa-volume-up' : 'fas fa-volume-mute';
      }

      var { error } = await supabase.from('user_preferences').upsert({
        user_id:   userId,
        language:  langVal,
        currency:  currencyVal,
        packaging: packVal,
      }, { onConflict: 'user_id' });
      btnDisp.disabled = false;
      if (error) { showToast('Could not save. Try again.', 'error'); return; }
      flashSaved('disp-saved');
      showToast('Preferences saved', 'success');
    });
  }

  /* ── Password show/hide eyes ── */
  document.querySelectorAll('[data-eye]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var inp = document.getElementById(btn.dataset.eye);
      if (!inp) return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  });

  /* ── Password strength meter ── */
  var pwNew = document.getElementById('pw-new');
  var pwBar = document.getElementById('pw-strength-bar');
  if (pwNew && pwBar) {
    pwNew.addEventListener('input', function() {
      var s = pwStrength(pwNew.value);
      pwBar.style.width      = (s / 5 * 100) + '%';
      pwBar.style.background = strengthColor(s);
    });
  }

  /* ── Change Password ── */
  var btnPw = document.getElementById('btn-save-pw');
  if (btnPw) {
    btnPw.addEventListener('click', async function() {
      var newPw  = document.getElementById('pw-new').value.trim();
      var confPw = document.getElementById('pw-confirm').value.trim();
      if (!newPw) { showToast('Enter a new password', 'error'); return; }
      if (newPw.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
      if (newPw !== confPw) { showToast('Passwords do not match', 'error'); return; }
      btnPw.disabled = true;
      var { error } = await supabase.auth.updateUser({ password: newPw });
      btnPw.disabled = false;
      if (error) { showToast('Could not update password. ' + error.message, 'error'); return; }
      document.getElementById('pw-new').value     = '';
      document.getElementById('pw-confirm').value = '';
      if (pwBar) { pwBar.style.width = '0%'; }
      flashSaved('pw-saved');
      showToast('Password updated successfully', 'success');
    });
  }

  /* ── Google link status ── */
  var googleStatus = document.getElementById('google-status');
  var btnGoogle    = document.getElementById('btn-google-link');
  supabase.auth.getUser().then(function(res) {
    if (!res || !res.data || !res.data.user) return;
    var identities = res.data.user.identities || [];
    var hasGoogle  = identities.some(function(id) { return id.provider === 'google'; });
    if (googleStatus) {
      googleStatus.textContent = hasGoogle ? 'Connected' : 'Not connected';
    }
    if (btnGoogle) {
      if (hasGoogle) {
        btnGoogle.textContent = 'Connected';
        btnGoogle.disabled    = true;
      } else {
        btnGoogle.textContent = 'Link Google';
        btnGoogle.addEventListener('click', function() {
          supabase.auth.signInWithOAuth({ provider: 'google' });
        });
      }
    }
  });

  /* ── Sign out everywhere ── */
  var btnSignoutAll = document.getElementById('btn-signout-all');
  if (btnSignoutAll) {
    btnSignoutAll.addEventListener('click', async function() {
      if (!confirm('Sign out from all devices?')) return;
      await supabase.auth.signOut({ scope: 'global' });
      showToast('Signed out from all devices', 'info');
      setTimeout(function() { router.go('home'); }, 1000);
    });
  }

  /* ── Delete account ── */
  var btnDel = document.getElementById('btn-delete-acct');
  if (btnDel) {
    btnDel.addEventListener('click', function() {
      if (!confirm('Are you sure? This permanently deletes your account and all your data. This cannot be undone.')) return;
      showToast('Please contact hello@kiththagrand.com to delete your account.', 'info', 6000);
    });
  }
}

/* ── INIT ── */
export async function init(container) {
  injectStyles();
  container.innerHTML = '<div style="min-height:60vh;display:flex;align-items:center;justify-content:center"><span style="font-family:var(--font-sub);color:var(--brown);opacity:.5;font-size:.85rem;letter-spacing:.1em">Loading settings...</span></div>';

  /* Auth check */
  var { data: authData } = await supabase.auth.getUser();
  var user = authData && authData.user;
  if (!user) {
    showToast('Please sign in to view settings', 'error');
    router.go('login');
    return;
  }

  /* Fetch user preferences + loyalty points from users table */
  var { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  var { data: userRow } = await supabase
    .from('users')
    .select('full_name, loyalty_points')
    .eq('id', user.id)
    .single();

  /* Merge full_name + loyalty_points into prefs object */
  var merged = Object.assign({}, prefs || {}, {
    full_name:      (userRow && userRow.full_name)      || null,
    loyalty_points: (userRow && userRow.loyalty_points) || 0,
  });

  container.innerHTML = buildHTML(user, merged);
  initReveals();
  bindEvents(user.id);
}

export default init;
