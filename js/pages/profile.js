/* ================================================================
   KITHTHA GRAND — User Profile Page  |  js/pages/profile.js
   v2 — Country/State selector + Mobile fixes
================================================================ */
import { supabase } from '../supabase.js';
import { router } from '../router.js';
import { showToast, initReveals, formatPrice } from '../app.js';

/* ── Countries ── */
const COUNTRIES = [
  { code:'', label:'Select country...' },
  { code:'LK', flag:'LK', label:'Sri Lanka',     state:false },
  { code:'US', flag:'US', label:'United States',  state:true,  stateLabel:'State' },
  { code:'GB', flag:'GB', label:'United Kingdom', state:true,  stateLabel:'County' },
  { code:'AU', flag:'AU', label:'Australia',      state:true,  stateLabel:'State / Territory' },
  { code:'CA', flag:'CA', label:'Canada',         state:true,  stateLabel:'Province' },
  { code:'DE', flag:'DE', label:'Germany',        state:true,  stateLabel:'State' },
  { code:'FR', flag:'FR', label:'France',         state:true,  stateLabel:'Region' },
  { code:'IN', flag:'IN', label:'India',          state:true,  stateLabel:'State' },
  { code:'SG', flag:'SG', label:'Singapore',      state:false },
  { code:'AE', flag:'AE', label:'UAE',            state:false },
  { code:'JP', flag:'JP', label:'Japan',          state:true,  stateLabel:'Prefecture' },
  { code:'NZ', flag:'NZ', label:'New Zealand',    state:true,  stateLabel:'Region' },
  { code:'MY', flag:'MY', label:'Malaysia',       state:true,  stateLabel:'State' },
  { code:'IT', flag:'IT', label:'Italy',          state:true,  stateLabel:'Region' },
  { code:'NL', flag:'NL', label:'Netherlands',    state:true,  stateLabel:'Province' },
  { code:'SE', flag:'SE', label:'Sweden',         state:true,  stateLabel:'County' },
  { code:'NO', flag:'NO', label:'Norway',         state:true,  stateLabel:'County' },
  { code:'CH', flag:'CH', label:'Switzerland',    state:true,  stateLabel:'Canton' },
  { code:'OTHER', flag:'', label:'Other',         state:true,  stateLabel:'State / Province' },
];

function getFlagEmoji(code) {
  if (!code || code === 'OTHER') return '';
  return code.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  ) + ' ';
}

/* ── HTML ── */
function getHTML(user, profile, points, orders) {
  const totalPoints = profile?.loyalty_points || 0;
  const totalOrders = profile?.total_orders   || 0;
  const totalSpent  = profile?.total_spent    || 0;
  const initials    = (profile?.full_name || user?.email || 'KG')
                        .split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const memberSince = new Date(user?.created_at||Date.now())
                        .toLocaleDateString('en-US',{month:'long',year:'numeric'});

  const countryOptions = COUNTRIES.map(c =>
    `<option value="${c.code}">${getFlagEmoji(c.flag)}${c.label}</option>`
  ).join('');

  return `
  <div class="profile-page">
    <div class="profile-hero">
      <div class="profile-hero-bg"></div>
      <div class="container">
        <div class="profile-hero-inner">

          <div class="profile-avatar-wrap reveal">
            <div class="profile-avatar">
              ${profile?.avatar_url
                ? `<img src="${profile.avatar_url}" alt="Avatar" />`
                : `<span class="avatar-initials">${initials}</span>`}
            </div>
            <button class="avatar-edit-btn" title="Change photo"><i class="fas fa-camera"></i></button>
            <div class="profile-online-dot"></div>
          </div>

          <div class="profile-hero-info reveal">
            <p class="profile-greeting">Welcome back</p>
            <h1 class="profile-name">${profile?.full_name||'Spice Lover'}</h1>
            <p class="profile-email"><i class="fas fa-envelope"></i> ${user?.email||''}</p>
            <div class="profile-meta">
              <span><i class="fas fa-calendar-alt"></i> Member since ${memberSince}</span>
              ${profile?.referral_code
                ? `<span><i class="fas fa-gift"></i> Code: <strong>${profile.referral_code}</strong></span>`
                : ''}
            </div>
          </div>

          <div class="profile-stats reveal">
            <div class="p-stat"><span class="p-stat-num">${totalOrders}</span><span class="p-stat-label">Orders</span></div>
            <div class="p-stat-div"></div>
            <div class="p-stat"><span class="p-stat-num">${formatPrice(totalSpent)}</span><span class="p-stat-label">Spent</span></div>
            <div class="p-stat-div"></div>
            <div class="p-stat"><span class="p-stat-num">${totalPoints.toLocaleString()}</span><span class="p-stat-label">Points</span></div>
          </div>

          <div class="profile-quick reveal">
            <button class="quick-btn" data-page="orders"><i class="fas fa-box"></i><span>Orders</span></button>
            <button class="quick-btn" data-page="wishlist"><i class="far fa-heart"></i><span>Wishlist</span></button>
            <button class="quick-btn" data-page="settings"><i class="fas fa-cog"></i><span>Settings</span></button>
            <button class="quick-btn" id="btn-logout"><i class="fas fa-sign-out-alt"></i><span>Logout</span></button>
          </div>

        </div>
      </div>
    </div>

    <div class="container profile-body">
      <div class="profile-grid">

        <!-- LEFT -->
        <div class="profile-left">

          <div class="loyalty-card reveal">
            <div class="loyalty-card-bg"></div>
            <div class="loyalty-card-inner">
              <div class="loyalty-top">
                <div>
                  <p class="loyalty-label">Loyalty Balance</p>
                  <h2 class="loyalty-points">${totalPoints.toLocaleString()} <span>pts</span></h2>
                  <p class="loyalty-equiv">approx ${formatPrice(Math.floor(totalPoints/100)*10)} discount</p>
                </div>
                <div class="loyalty-emblem">&#9733;</div>
              </div>
              <div class="loyalty-progress-wrap">
                <div class="loyalty-progress-bar">
                  <div class="loyalty-progress-fill" style="width:${Math.min((totalPoints%1000)/10,100)}%"></div>
                </div>
                <p class="loyalty-progress-label">${1000-(totalPoints%1000)} pts to next tier</p>
              </div>
              <div class="loyalty-actions">
                <button class="btn-loyalty-redeem" id="btn-redeem">Redeem Points</button>
                <button class="btn-loyalty-refer" data-page="settings">Refer a Friend</button>
              </div>
            </div>
          </div>

          <div class="profile-card reveal">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-history"></i> Points History</h3>
            </div>
            <div class="points-list">
              ${points?.length ? points.map(p => `
                <div class="point-item">
                  <div class="point-icon">
                    ${p.type==='earned'?'&#43;':p.type==='redeemed'?'&#8722;':p.type==='referral'?'&#128101;':p.type==='birthday'?'&#127874;':'&#11088;'}
                  </div>
                  <div class="point-info">
                    <p class="point-desc">${p.description||p.type}</p>
                    <p class="point-date">${new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
                  </div>
                  <span class="point-val ${p.points>0?'pos':'neg'}">${p.points>0?'+':''}${p.points} pts</span>
                </div>`).join('')
              : '<div class="empty-state"><p>No points yet. Start shopping!</p></div>'}
            </div>
          </div>

        </div>

        <!-- RIGHT -->
        <div class="profile-right">

          <div class="profile-card reveal">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-user-edit"></i> Personal Details</h3>
              <button class="card-edit-btn" id="btn-edit-toggle"><i class="fas fa-pen"></i> Edit</button>
            </div>
            <div id="profile-view">
              <div class="detail-grid">
                <div class="detail-item"><span class="detail-label">Full Name</span><span class="detail-val">${profile?.full_name||'--'}</span></div>
                <div class="detail-item"><span class="detail-label">Email</span><span class="detail-val">${user?.email||'--'}</span></div>
                <div class="detail-item"><span class="detail-label">Phone</span><span class="detail-val">${profile?.phone||'--'}</span></div>
                <div class="detail-item"><span class="detail-label">Birthday</span><span class="detail-val">${profile?.birthday?new Date(profile.birthday).toLocaleDateString('en-US',{month:'long',day:'numeric'}):'--'}</span></div>
              </div>
            </div>
            <div id="profile-edit" class="p-hidden">
              <div class="pform-row">
                <div class="pform-group">
                  <label class="pform-label">Full Name</label>
                  <div class="pinput-wrap"><i class="fas fa-user pinput-icon"></i>
                    <input type="text" id="edit-name" class="pinput" value="${profile?.full_name||''}" placeholder="Your full name" />
                  </div>
                </div>
                <div class="pform-group">
                  <label class="pform-label">Phone</label>
                  <div class="pinput-wrap"><i class="fas fa-phone pinput-icon"></i>
                    <input type="tel" id="edit-phone" class="pinput" value="${profile?.phone||''}" placeholder="+1 234 567 8900" />
                  </div>
                </div>
              </div>
              <div class="pform-group">
                <label class="pform-label">Birthday</label>
                <div class="pinput-wrap"><i class="fas fa-birthday-cake pinput-icon"></i>
                  <input type="date" id="edit-birthday" class="pinput" value="${profile?.birthday||''}" />
                </div>
              </div>
              <div class="edit-actions">
                <button class="btn-save" id="btn-save-profile"><i class="fas fa-check"></i> Save Changes</button>
                <button class="btn-cancelp" id="btn-cancel-edit">Cancel</button>
              </div>
            </div>
          </div>

          <!-- ADDRESSES -->
          <div class="profile-card reveal">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-map-marker-alt"></i> Addresses</h3>
              <button class="card-edit-btn" id="btn-add-address"><i class="fas fa-plus"></i> Add</button>
            </div>
            <div id="addresses-list">
              <div class="empty-state"><p>No saved addresses yet.</p></div>
            </div>

            <div id="address-form" class="p-hidden addr-form-wrap">
              <div class="pform-row">
                <div class="pform-group">
                  <label class="pform-label">Label</label>
                  <div class="pinput-wrap"><i class="fas fa-tag pinput-icon"></i>
                    <input type="text" id="addr-label" class="pinput" value="Home" />
                  </div>
                </div>
                <div class="pform-group">
                  <label class="pform-label">Full Name</label>
                  <div class="pinput-wrap"><i class="fas fa-user pinput-icon"></i>
                    <input type="text" id="addr-name" class="pinput" placeholder="Recipient name" />
                  </div>
                </div>
              </div>

              <div class="pform-group">
                <label class="pform-label">Address Line 1</label>
                <div class="pinput-wrap"><i class="fas fa-home pinput-icon"></i>
                  <input type="text" id="addr-line1" class="pinput" placeholder="Street address" />
                </div>
              </div>

              <div class="pform-group">
                <label class="pform-label">Address Line 2 <span style="opacity:.5">(optional)</span></label>
                <div class="pinput-wrap"><i class="fas fa-building pinput-icon"></i>
                  <input type="text" id="addr-line2" class="pinput" placeholder="Apt, suite, floor..." />
                </div>
              </div>

              <div class="pform-row">
                <div class="pform-group">
                  <label class="pform-label">City</label>
                  <div class="pinput-wrap"><i class="fas fa-city pinput-icon"></i>
                    <input type="text" id="addr-city" class="pinput" placeholder="City" />
                  </div>
                </div>
                <div class="pform-group">
                  <label class="pform-label">Postal Code</label>
                  <div class="pinput-wrap"><i class="fas fa-mail-bulk pinput-icon"></i>
                    <input type="text" id="addr-postal" class="pinput" placeholder="Postal / ZIP code" />
                  </div>
                </div>
              </div>

              <!-- Country select -->
              <div class="pform-group">
                <label class="pform-label">Country</label>
                <div class="pinput-wrap"><i class="fas fa-globe pinput-icon"></i>
                  <select id="addr-country" class="pinput pselect">
                    ${countryOptions}
                  </select>
                </div>
              </div>

              <!-- State / Province (shows based on country) -->
              <div class="pform-group p-hidden" id="state-wrap">
                <label class="pform-label" id="state-label">State</label>
                <div class="pinput-wrap"><i class="fas fa-map pinput-icon"></i>
                  <input type="text" id="addr-state" class="pinput" placeholder="State / Province" />
                </div>
              </div>

              <div class="edit-actions">
                <button class="btn-save" id="btn-save-address"><i class="fas fa-check"></i> Save Address</button>
                <button class="btn-cancelp" id="btn-cancel-address">Cancel</button>
              </div>
            </div>
          </div>

          <!-- ORDERS -->
          <div class="profile-card reveal">
            <div class="card-header">
              <h3 class="card-title"><i class="fas fa-shopping-bag"></i> Recent Orders</h3>
              <button class="card-edit-btn" data-page="orders">View All</button>
            </div>
            <div id="recent-orders">
              ${orders?.length ? orders.map(o => `
                <div class="order-item">
                  <div class="order-icon">&#128230;</div>
                  <div class="order-info">
                    <p class="order-num">${o.order_number}</p>
                    <p class="order-date">${new Date(o.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
                  </div>
                  <div class="order-right">
                    <span class="order-status ${o.status}">${o.status}</span>
                    <span class="order-total">${formatPrice(o.total)}</span>
                  </div>
                </div>`).join('')
              : '<div class="empty-state"><p>No orders yet. <a href="#" data-page="products">Start shopping</a></p></div>'}
            </div>
          </div>

          <!-- REFERRAL -->
          <div class="referral-card reveal">
            <div class="referral-inner">
              <div class="referral-text">
                <h3>Share &amp; Earn</h3>
                <p>Give friends 500 bonus points. You earn 500 too!</p>
                <div class="referral-code-wrap">
                  <span class="referral-code">${profile?.referral_code||'--'}</span>
                  <button class="btn-copy" id="btn-copy-ref"><i class="fas fa-copy"></i> Copy</button>
                </div>
              </div>
              <div class="referral-emoji">&#127873;</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>`;
}

/* ── CSS ── */
const CSS = `
.profile-page{min-height:100vh;background:var(--cream);padding-bottom:80px}
.profile-hero{position:relative;background:var(--brown);padding:120px 0 80px;overflow:hidden}
.profile-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 10% 50%,rgba(139,37,0,.4) 0%,transparent 60%),radial-gradient(ellipse at 90% 30%,rgba(200,144,10,.1) 0%,transparent 50%)}
.profile-hero-inner{position:relative;z-index:1;display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:28px;padding-bottom:20px}
.profile-avatar-wrap{position:relative;display:inline-block;line-height:0;vertical-align:middle}
.profile-avatar{width:104px;height:104px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--red-dark));border:3px solid rgba(200,144,10,.4);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;box-shadow:0 8px 32px rgba(0,0,0,.3)}
.profile-avatar img{width:100%;height:100%;object-fit:cover}
.avatar-initials{font-family:var(--font-head);font-size:2rem;color:var(--gold-light);line-height:1}
.avatar-edit-btn{position:absolute;bottom:6px;right:6px;width:30px;height:30px;border-radius:50%;background:var(--gold);color:var(--brown);font-size:.75rem;display:flex;align-items:center;justify-content:center;transition:var(--transition);z-index:2;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid var(--brown)}
.avatar-edit-btn:hover{background:var(--gold-light);transform:scale(1.1)}
.profile-online-dot{position:absolute;top:8px;right:8px;width:13px;height:13px;border-radius:50%;background:#22c55e;border:2px solid var(--brown)}
.profile-greeting{font-style:italic;font-size:.85rem;color:var(--gold);margin-bottom:4px}
.profile-name{font-family:var(--font-head);font-size:clamp(1.4rem,3vw,2rem);color:var(--cream);margin-bottom:8px}
.profile-email{font-size:.85rem;color:rgba(240,224,192,.6);display:flex;align-items:center;gap:8px;margin-bottom:12px}
.profile-meta{display:flex;gap:20px;flex-wrap:wrap}
.profile-meta span{font-family:var(--font-sub);font-size:.72rem;letter-spacing:.1em;color:rgba(240,224,192,.5);display:flex;align-items:center;gap:6px}
.profile-meta strong{color:var(--gold-light)}
.profile-stats{display:flex;align-items:center;gap:20px}
.p-stat{text-align:center}
.p-stat-num{display:block;font-family:var(--font-head);font-size:1.4rem;color:var(--gold-light)}
.p-stat-label{display:block;font-family:var(--font-sub);font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(240,224,192,.5);margin-top:2px}
.p-stat-div{width:1px;height:36px;background:rgba(200,144,10,.2)}
.profile-quick{display:flex;gap:8px;flex-wrap:wrap}
.quick-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 16px;background:rgba(255,255,255,.07);border:1px solid rgba(200,144,10,.15);border-radius:14px;color:rgba(240,224,192,.7);font-family:var(--font-sub);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;transition:var(--transition);min-width:64px}
.quick-btn i{font-size:1.1rem}
.quick-btn:hover{background:rgba(200,144,10,.15);border-color:rgba(200,144,10,.35);color:var(--gold-light)}
#btn-logout:hover{background:rgba(139,37,0,.3);border-color:rgba(139,37,0,.4);color:#fca5a5}
.profile-body{margin-top:-60px;position:relative;z-index:2;padding-top:0}
.profile-grid{display:grid;grid-template-columns:360px 1fr;gap:28px}
.profile-card{background:white;border-radius:20px;border:1px solid var(--cream-dark);padding:28px;margin-bottom:24px;box-shadow:var(--shadow-sm)}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.card-title{font-family:var(--font-sub);font-size:.85rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown);display:flex;align-items:center;gap:8px}
.card-title i{color:var(--gold)}
.card-edit-btn{font-family:var(--font-sub);font-size:.72rem;color:var(--red);display:flex;align-items:center;gap:6px;padding:6px 14px;border:1px solid rgba(139,37,0,.2);border-radius:99px;transition:var(--transition)}
.card-edit-btn:hover{background:rgba(139,37,0,.06)}
.loyalty-card{position:relative;border-radius:20px;overflow:hidden;margin-bottom:24px;padding:28px;box-shadow:var(--shadow-md)}
.loyalty-card-bg{position:absolute;inset:0;background:linear-gradient(135deg,var(--brown) 0%,var(--red-dark) 50%,#6B1800 100%)}
.loyalty-card-bg::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(200,144,10,.2) 0%,transparent 50%)}
.loyalty-card-inner{position:relative;z-index:1}
.loyalty-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}
.loyalty-label{font-family:var(--font-sub);font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(240,224,192,.6);margin-bottom:6px}
.loyalty-points{font-family:var(--font-head);font-size:2.4rem;color:var(--gold-light);line-height:1}
.loyalty-points span{font-size:1rem;color:rgba(240,224,192,.5)}
.loyalty-equiv{font-size:.78rem;font-style:italic;color:rgba(240,224,192,.5);margin-top:4px}
.loyalty-emblem{font-size:3rem;opacity:.4}
.loyalty-progress-wrap{margin-bottom:20px}
.loyalty-progress-bar{height:4px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;margin-bottom:6px}
.loyalty-progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-light));border-radius:99px;transition:width 1s ease}
.loyalty-progress-label{font-size:.72rem;color:rgba(240,224,192,.5);font-style:italic}
.loyalty-actions{display:flex;gap:10px}
.btn-loyalty-redeem{flex:1;padding:10px;border-radius:10px;background:linear-gradient(135deg,var(--gold),var(--gold-light));color:var(--brown);font-family:var(--font-sub);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;transition:var(--transition)}
.btn-loyalty-redeem:hover{transform:translateY(-1px);box-shadow:var(--shadow-gold)}
.btn-loyalty-refer{flex:1;padding:10px;border-radius:10px;border:1px solid rgba(200,144,10,.3);color:rgba(240,224,192,.7);font-family:var(--font-sub);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;transition:var(--transition)}
.btn-loyalty-refer:hover{border-color:var(--gold);color:var(--gold-light)}
.points-list{display:flex;flex-direction:column;gap:2px}
.point-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--cream)}
.point-item:last-child{border-bottom:none}
.point-icon{width:36px;height:36px;border-radius:10px;background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.point-info{flex:1}
.point-desc{font-size:.85rem;color:var(--brown);margin-bottom:2px}
.point-date{font-size:.72rem;color:var(--brown-light)}
.point-val{font-family:var(--font-sub);font-size:.85rem;font-weight:600;flex-shrink:0}
.point-val.pos{color:#16a34a}
.point-val.neg{color:var(--red)}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.detail-item{padding:14px;background:var(--cream);border-radius:12px}
.detail-label{display:block;font-family:var(--font-sub);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:4px}
.detail-val{font-size:.92rem;color:var(--brown)}
.p-hidden{display:none!important}
.pform-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.pform-group{margin-bottom:16px}
.pform-label{display:block;font-family:var(--font-sub);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown-light);margin-bottom:6px}
.pinput-wrap{position:relative;display:flex;align-items:center}
.pinput-icon{position:absolute;left:14px;font-size:.82rem;color:var(--brown-light);pointer-events:none;z-index:1}
.pinput{width:100%;padding:11px 14px 11px 36px;border:1.5px solid var(--cream-dark);border-radius:10px;font-family:var(--font-body);font-size:.88rem;color:var(--brown);background:var(--cream);outline:none;transition:var(--transition)}
.pinput:focus{border-color:var(--gold);background:white;box-shadow:0 0 0 3px rgba(200,144,10,.1)}
.pselect{appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:32px}
.edit-actions{display:flex;gap:10px;margin-top:8px}
.btn-save{display:flex;align-items:center;gap:8px;padding:10px 20px;background:var(--red);color:white;border-radius:10px;font-family:var(--font-sub);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;transition:var(--transition)}
.btn-save:hover{background:var(--red-light)}
.btn-save:disabled{opacity:.6;cursor:not-allowed}
.btn-cancelp{padding:10px 16px;color:var(--brown-light);font-family:var(--font-sub);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;transition:color var(--transition)}
.btn-cancelp:hover{color:var(--red)}
.order-item{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--cream)}
.order-item:last-child{border-bottom:none}
.order-icon{font-size:1.4rem}
.order-info{flex:1}
.order-num{font-family:var(--font-sub);font-size:.82rem;color:var(--brown)}
.order-date{font-size:.72rem;color:var(--brown-light);margin-top:2px}
.order-right{text-align:right}
.order-status{display:block;font-family:var(--font-sub);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;padding:3px 10px;border-radius:99px;margin-bottom:4px}
.order-status.pending{background:#fef9c3;color:#854d0e}
.order-status.confirmed{background:#dbeafe;color:#1e40af}
.order-status.shipped{background:#ede9fe;color:#5b21b6}
.order-status.delivered{background:#dcfce7;color:#166534}
.order-status.cancelled{background:#fee2e2;color:#991b1b}
.order-total{font-family:var(--font-head);font-size:.92rem;color:var(--red)}
.addr-form-wrap{margin-top:20px;padding-top:20px;border-top:1px solid var(--cream-dark)}
.referral-card{background:linear-gradient(135deg,var(--green),var(--green-light));border-radius:20px;padding:28px;margin-bottom:24px}
.referral-inner{display:flex;align-items:center;justify-content:space-between;gap:20px}
.referral-text h3{font-family:var(--font-sub);font-size:1rem;color:white;margin-bottom:6px}
.referral-text p{font-size:.82rem;color:rgba(255,255,255,.7);margin-bottom:16px}
.referral-code-wrap{display:flex;align-items:center;gap:10px}
.referral-code{font-family:var(--font-sub);font-size:1.1rem;letter-spacing:.2em;color:white;background:rgba(255,255,255,.15);padding:8px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.2)}
.btn-copy{padding:8px 16px;background:white;color:var(--green);border-radius:10px;font-family:var(--font-sub);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600;transition:var(--transition);display:flex;align-items:center;gap:6px}
.btn-copy:hover{background:var(--cream)}
.referral-emoji{font-size:3.5rem;opacity:.6}
.empty-state{text-align:center;padding:32px 16px}
.empty-state p{font-size:.88rem;font-style:italic;color:var(--brown-light);line-height:1.6}
.empty-state a{color:var(--red)}
@media(max-width:1024px){
  .profile-grid{grid-template-columns:1fr}
  .profile-hero-inner{grid-template-columns:auto 1fr;grid-template-rows:auto auto auto}
  .profile-stats,.profile-quick{grid-column:1/-1}
}
@media(max-width:640px){
  .profile-hero-inner{grid-template-columns:1fr;text-align:center}
  .profile-avatar-wrap{margin:0 auto}
  .profile-meta{justify-content:center}
  .profile-stats{justify-content:center}
  .profile-quick{justify-content:center}
  .profile-greeting{text-align:center}
  .profile-name{text-align:center}
  .profile-email{justify-content:center;text-align:center}
  .detail-grid{grid-template-columns:1fr}
  .pform-row{grid-template-columns:1fr}
}
`;

/* ── INIT ── */
export async function init(container) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { router.go('login'); return; }

  if (!document.getElementById('profile-styles')) {
    const s = document.createElement('style');
    s.id = 'profile-styles'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  // Skeleton loader — instant feel
container.innerHTML = `
<div style="min-height:100vh;background:var(--cream);">
  <div style="background:var(--brown);height:280px;padding:100px 32px 0;">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;gap:28px;">
      <div style="width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.1);animation:shimmer 1.5s infinite;flex-shrink:0;"></div>
      <div style="flex:1">
        <div style="height:14px;width:120px;background:rgba(255,255,255,.1);border-radius:8px;margin-bottom:12px;animation:shimmer 1.5s infinite;"></div>
        <div style="height:28px;width:220px;background:rgba(255,255,255,.15);border-radius:8px;margin-bottom:12px;animation:shimmer 1.5s infinite 0.1s;"></div>
        <div style="height:12px;width:180px;background:rgba(255,255,255,.08);border-radius:8px;animation:shimmer 1.5s infinite 0.2s;"></div>
      </div>
    </div>
  </div>
  <div style="max-width:1280px;margin:40px auto;padding:0 32px;display:grid;grid-template-columns:360px 1fr;gap:28px;">
    <div>
      <div style="height:200px;background:white;border-radius:20px;border:1px solid var(--cream-dark);animation:shimmer 1.5s infinite 0.1s;margin-bottom:24px;"></div>
      <div style="height:240px;background:white;border-radius:20px;border:1px solid var(--cream-dark);animation:shimmer 1.5s infinite 0.2s;"></div>
    </div>
    <div>
      <div style="height:180px;background:white;border-radius:20px;border:1px solid var(--cream-dark);animation:shimmer 1.5s infinite 0.15s;margin-bottom:24px;"></div>
      <div style="height:280px;background:white;border-radius:20px;border:1px solid var(--cream-dark);animation:shimmer 1.5s infinite 0.25s;"></div>
    </div>
  </div>
</div>`;

  const [profileRes, pointsRes, ordersRes, addressRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('loyalty_points').select('*').eq('user_id', user.id)
      .order('created_at',{ascending:false}).limit(8),
    supabase.from('orders').select('*').eq('user_id', user.id)
      .order('created_at',{ascending:false}).limit(5),
    supabase.from('addresses').select('*').eq('user_id', user.id)
      .order('is_default',{ascending:false}),
  ]);

  const profile   = profileRes.data;
  const points    = pointsRes.data  || [];
  const orders    = ordersRes.data  || [];
  const addresses = addressRes.data || [];

  container.innerHTML = getHTML(user, profile, points, orders);
  renderAddresses(container, addresses);
  bindEditProfile(container, user, profile);
  bindAddressForm(container, user);
  bindLogout(container);
  bindCopyReferral(container, profile);
  bindRedeemPoints(container, profile);
  setTimeout(initReveals, 50);
}

/* ── RENDER ADDRESSES ── */
function renderAddresses(c, addresses) {
  const list = c.querySelector('#addresses-list');
  if (!list) return;
  if (!addresses.length) {
    list.innerHTML = '<div class="empty-state"><p>No saved addresses yet.</p></div>';
    return;
  }
  list.innerHTML = addresses.map(a => `
    <div class="order-item">
      <div class="order-icon">${a.label==='Home'?'&#127968;':a.label==='Work'?'&#127970;':'&#128205;'}</div>
      <div class="order-info">
        <p class="order-num">${a.label} — ${a.full_name}</p>
        <p class="order-date">${a.address_line1}, ${a.city}, ${a.country}</p>
      </div>
      ${a.is_default ? '<span class="order-status delivered">Default</span>' : ''}
    </div>`).join('');
}

/* ── EDIT PROFILE ── */
function bindEditProfile(c, user, profile) {
  const editBtn   = c.querySelector('#btn-edit-toggle');
  const viewEl    = c.querySelector('#profile-view');
  const editEl    = c.querySelector('#profile-edit');
  const saveBtn   = c.querySelector('#btn-save-profile');
  const cancelBtn = c.querySelector('#btn-cancel-edit');

  editBtn?.addEventListener('click', () => {
    viewEl.classList.add('p-hidden');
    editEl.classList.remove('p-hidden');
    editBtn.style.display = 'none';
  });
  cancelBtn?.addEventListener('click', () => {
    viewEl.classList.remove('p-hidden');
    editEl.classList.add('p-hidden');
    editBtn.style.display = '';
  });
  saveBtn?.addEventListener('click', async () => {
    const name     = c.querySelector('#edit-name').value.trim();
    const phone    = c.querySelector('#edit-phone').value.trim();
    const birthday = c.querySelector('#edit-birthday').value;
    if (!name) { showToast('Name cannot be empty', 'error'); return; }
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    const { error } = await supabase.from('users')
      .update({ full_name: name, phone: phone||null, birthday: birthday||null })
      .eq('id', user.id);
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Save Changes';
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Profile updated! ✅', 'success');
    c.querySelector('.profile-name').textContent = name;
    cancelBtn.click();
  });
}

/* ── ADDRESS FORM ── */
function bindAddressForm(c, user) {
  const addBtn    = c.querySelector('#btn-add-address');
  const form      = c.querySelector('#address-form');
  const saveBtn   = c.querySelector('#btn-save-address');
  const cancelBtn = c.querySelector('#btn-cancel-address');
  const countryEl = c.querySelector('#addr-country');
  const stateWrap = c.querySelector('#state-wrap');
  const stateLabel= c.querySelector('#state-label');

  // Country change → show/hide state
  countryEl?.addEventListener('change', () => {
    const selected = COUNTRIES.find(cn => cn.code === countryEl.value);
    if (selected?.state) {
      stateWrap.classList.remove('p-hidden');
      stateLabel.textContent = selected.stateLabel || 'State';
      c.querySelector('#addr-state').placeholder = selected.stateLabel || 'State';
    } else {
      stateWrap.classList.add('p-hidden');
      c.querySelector('#addr-state').value = '';
    }
  });

  addBtn?.addEventListener('click', () => {
    form.classList.toggle('p-hidden');
    addBtn.innerHTML = form.classList.contains('p-hidden')
      ? '<i class="fas fa-plus"></i> Add'
      : '<i class="fas fa-times"></i> Close';
  });

  cancelBtn?.addEventListener('click', () => {
    form.classList.add('p-hidden');
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
    // Reset form
    form.querySelectorAll('input').forEach(i => i.value = '');
    countryEl.value = '';
    stateWrap.classList.add('p-hidden');
  });

  saveBtn?.addEventListener('click', async () => {
    const name    = c.querySelector('#addr-name').value.trim();
    const line1   = c.querySelector('#addr-line1').value.trim();
    const line2   = c.querySelector('#addr-line2').value.trim();
    const city    = c.querySelector('#addr-city').value.trim();
    const postal  = c.querySelector('#addr-postal').value.trim();
    const countryCode = countryEl.value;
    const state   = c.querySelector('#addr-state').value.trim();

    // Get country display name
    const countryObj = COUNTRIES.find(cn => cn.code === countryCode);
    const countryName = countryObj?.label || countryCode;

    if (!name || !line1 || !city || !countryCode) {
      showToast('Please fill all required fields', 'error'); return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const { error } = await supabase.from('addresses').insert({
      user_id:       user.id,
      label:         c.querySelector('#addr-label').value.trim() || 'Home',
      full_name:     name,
      address_line1: line1,
      address_line2: state
        ? (line2 ? line2 + ', ' : '') + state
        : line2 || null,
      city,
      postal_code:   postal || null,
      country:       countryName,
    });

    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Save Address';

    if (error) { showToast(error.message, 'error'); return; }
    showToast('Address saved! &#128230;', 'success');
    cancelBtn.click();
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
    renderAddresses(c, data || []);
  });
}

/* ── LOGOUT ── */
function bindLogout(c) {
  c.querySelector('#btn-logout')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showToast('Logged out. See you soon! &#128075;', 'info');
    setTimeout(() => router.go('home'), 600);
  });
}

/* ── COPY REFERRAL ── */
function bindCopyReferral(c, profile) {
  c.querySelector('#btn-copy-ref')?.addEventListener('click', () => {
    navigator.clipboard.writeText(profile?.referral_code || '')
      .then(() => showToast('Referral code copied! &#127873;', 'success'));
  });
}

/* ── REDEEM POINTS ── */
function bindRedeemPoints(c, profile) {
  c.querySelector('#btn-redeem')?.addEventListener('click', () => {
    const pts = profile?.loyalty_points || 0;
    if (pts < 100) {
      showToast('You need at least 100 points to redeem', 'error'); return;
    }
    showToast(pts + ' pts = ' + formatPrice(Math.floor(pts/100)*10) + ' discount. Apply at checkout!', 'info', 5000);
  });
}

export default init;