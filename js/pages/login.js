/* ================================================================
   KITHTHA GRAND — Login / Register Page
   js/pages/login.js  — v3 clean (no apostrophe/backtick issues)
================================================================ */

import { supabase }               from '../supabase.js';
import { router }                 from '../router.js';
import { showToast, initReveals } from '../app.js';

/* ── CSS ── */
const LOGIN_CSS = [
  '.auth-page{min-height:100vh;display:flex;position:relative;overflow:hidden;padding-top:0}',
  '.auth-bg{position:absolute;inset:0;z-index:0}',
  '.auth-bg-left{position:absolute;left:0;top:0;bottom:0;width:45%;background:linear-gradient(160deg,var(--brown) 0%,var(--red-dark) 60%,#5C1500 100%)}',
  '.auth-bg-right{position:absolute;right:0;top:0;bottom:0;width:55%;background:var(--cream)}',
  '.auth-particles span{position:absolute;left:var(--ax);top:var(--ay);font-size:1.8rem;opacity:.12;animation:authFloat var(--ad) ease-in-out infinite alternate;pointer-events:none}',
  '@keyframes authFloat{from{transform:translateY(0) rotate(0deg)}to{transform:translateY(-20px) rotate(15deg)}}',
  '.auth-left{position:relative;z-index:1;width:45%;padding:48px 56px;display:flex;flex-direction:column;color:var(--cream);flex-shrink:0}',
  '.auth-back{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-sub);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,224,192,.6);margin-bottom:48px;transition:color var(--transition)}',
  '.auth-back:hover{color:var(--gold-light)}',
  '.auth-emblem{position:relative;width:72px;height:72px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:2.2rem}',
  '.auth-emblem-ring{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(200,144,10,.4);animation:spinRing 6s linear infinite}',
  '.auth-brand-name{font-family:var(--font-head);font-size:clamp(1.4rem,2.5vw,1.9rem);color:var(--gold-light);margin-bottom:6px}',
  '.auth-brand-sub{font-style:italic;font-size:.9rem;color:rgba(240,224,192,.55);margin-bottom:48px}',
  '.auth-perks{display:flex;flex-direction:column;gap:24px;flex:1}',
  '.perk-item{display:flex;align-items:flex-start;gap:16px}',
  '.perk-icon{font-size:1.5rem;flex-shrink:0;width:44px;height:44px;background:rgba(200,144,10,.12);border:1px solid rgba(200,144,10,.2);border-radius:12px;display:flex;align-items:center;justify-content:center}',
  '.perk-item h4{font-family:var(--font-sub);font-size:.85rem;color:var(--gold-light);margin-bottom:4px}',
  '.perk-item p{font-size:.8rem;color:rgba(240,224,192,.6);line-height:1.6}',
  '.auth-quote{margin-top:40px;font-style:italic;font-size:.82rem;color:rgba(240,224,192,.35);border-top:1px solid rgba(200,144,10,.15);padding-top:24px}',
  '.auth-right{position:relative;z-index:1;flex:1;display:flex;align-items:center;justify-content:center;padding:48px 40px;overflow-y:auto}',
  '.auth-card{width:100%;max-width:460px;background:white;border-radius:24px;padding:40px;box-shadow:0 24px 80px rgba(61,28,2,.14);border:1px solid var(--cream-dark)}',
  '.auth-tabs{display:flex;background:var(--cream);border-radius:12px;padding:4px;margin-bottom:32px;gap:4px}',
  '.auth-tab{flex:1;padding:10px;border-radius:10px;font-family:var(--font-sub);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown-light);transition:var(--transition)}',
  '.auth-tab.active{background:var(--red);color:white;box-shadow:0 4px 16px rgba(139,37,0,.3)}',
  '.auth-form.hidden{display:none}',
  '.auth-welcome{font-size:.85rem;font-style:italic;color:var(--gold);margin-bottom:4px}',
  '.auth-title{font-family:var(--font-head);font-size:1.6rem;color:var(--brown);margin-bottom:28px}',
  '.auth-hint{font-size:.88rem;color:var(--brown-light);font-style:italic;margin-bottom:24px;line-height:1.6}',
  '.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}',
  '.form-group{margin-bottom:20px}',
  '.form-label{display:flex;justify-content:space-between;align-items:center;font-family:var(--font-sub);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown-light);margin-bottom:8px}',
  '.forgot-link{font-size:.68rem;color:var(--gold);text-transform:none;letter-spacing:0;transition:color var(--transition)}',
  '.forgot-link:hover{color:var(--red)}',
  '.input-wrap{position:relative;display:flex;align-items:center}',
  '.input-icon{position:absolute;left:14px;font-size:.85rem;color:var(--brown-light);pointer-events:none}',
  '.form-input{width:100%;padding:12px 14px 12px 38px;border:1.5px solid var(--cream-dark);border-radius:12px;font-family:var(--font-body);font-size:.92rem;color:var(--brown);background:var(--cream);transition:var(--transition);outline:none}',
  '.form-input:focus{border-color:var(--gold);background:white;box-shadow:0 0 0 3px rgba(200,144,10,.1)}',
  '.form-input::placeholder{color:rgba(107,58,31,.35)}',
  '.pw-toggle{position:absolute;right:12px;color:var(--brown-light);font-size:.85rem;transition:color var(--transition);padding:4px}',
  '.pw-toggle:hover{color:var(--red)}',
  '.pw-strength{height:3px;background:var(--cream-dark);border-radius:99px;margin-top:8px;overflow:hidden}',
  '.pw-bar{height:100%;width:0;border-radius:99px;transition:width .4s ease,background .4s ease}',
  '.pw-label{font-size:.7rem;color:var(--brown-light);margin-top:4px}',
  '.form-check{margin-bottom:24px}',
  '.check-label{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.85rem;color:var(--brown-light)}',
  '.check-label input{display:none}',
  '.check-box{width:18px;height:18px;flex-shrink:0;border:1.5px solid var(--cream-dark);border-radius:5px;background:var(--cream);transition:var(--transition);display:flex;align-items:center;justify-content:center}',
  '.check-label input:checked + .check-box{background:var(--red);border-color:var(--red)}',
  '.check-label input:checked + .check-box::after{content:"OK";color:white;font-size:.55rem;font-weight:700}',
  '.terms-link{color:var(--gold)}.terms-link:hover{color:var(--red)}',
  '.btn-auth-submit{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;background:var(--red);color:white;border-radius:12px;font-family:var(--font-sub);font-size:.85rem;letter-spacing:.1em;text-transform:uppercase;transition:var(--transition);box-shadow:0 6px 24px rgba(139,37,0,.3);margin-bottom:20px}',
  '.btn-auth-submit:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(139,37,0,.4)}',
  '.btn-auth-submit:disabled{opacity:.6;transform:none;cursor:not-allowed}',
  '.auth-divider{display:flex;align-items:center;gap:12px;margin-bottom:16px;font-size:.75rem;color:rgba(107,58,31,.4);font-family:var(--font-sub);letter-spacing:.1em}',
  '.auth-divider::before,.auth-divider::after{content:"";flex:1;height:1px;background:var(--cream-dark)}',
  '.btn-social{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:13px;border:1.5px solid var(--cream-dark);border-radius:12px;font-family:var(--font-sub);font-size:.82rem;color:var(--brown);transition:var(--transition);margin-bottom:20px}',
  '.btn-social:hover{border-color:var(--gold-pale);background:var(--cream)}',
  '.auth-switch{text-align:center;font-size:.85rem;color:var(--brown-light)}',
  '.switch-link{color:var(--red);font-family:var(--font-sub);font-size:.8rem}',
  '.switch-link:hover{color:var(--gold)}',
  '.auth-back-form{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-sub);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown-light);margin-bottom:24px;transition:color var(--transition)}',
  '.auth-back-form:hover{color:var(--red)}',
  '@media(max-width:900px){.auth-left,.auth-bg-left{display:none}.auth-bg-right{width:100%}.auth-right{padding:80px 24px 40px}}',
  '@media(max-width:480px){.auth-card{padding:28px 24px;border-radius:20px}.form-row{grid-template-columns:1fr}}',
].join('');

/* ── HTML ── */
function getHTML() {
  const html = document.createElement('div');
  html.className = 'auth-page';

  html.innerHTML = `
  <div class="auth-bg">
    <div class="auth-bg-left"></div>
    <div class="auth-bg-right"></div>
    <div class="auth-particles">
      <span style="--ax:8%;--ay:15%;--ad:4s">🌶️</span>
      <span style="--ax:88%;--ay:20%;--ad:3s">✨</span>
      <span style="--ax:15%;--ay:75%;--ad:5s">🌿</span>
      <span style="--ax:80%;--ay:70%;--ad:3.5s">⭐</span>
    </div>
  </div>

  <div class="auth-left reveal">
    <a href="#" data-page="home" class="auth-back">
      <i class="fas fa-arrow-left"></i> Back to Shop
    </a>
    <div class="auth-brand">
      <div class="auth-emblem">
        <div class="auth-emblem-ring"></div>
        <a href="#" class="nav-logo" data-page="home">
  <img src="images/kiththa LOGO (4).png" alt="Kiththa Grand" class="nav-logo-img" />
</a>
      </div>
      <h1 class="auth-brand-name">Kiththa Grand</h1>
      <p class="auth-brand-sub">Pure Ceylon Spices · දිවෙන රසය</p>
    </div>
    <div class="auth-perks">
      <div class="perk-item">
        <span class="perk-icon">⭐</span>
        <div><h4>Loyalty Points</h4><p>Earn 10 points per $1 spent. Redeem for discounts.</p></div>
      </div>
      <div class="perk-item">
        <span class="perk-icon">🎁</span>
        <div><h4>Birthday Discount</h4><p>Get 15% off every year on your special day.</p></div>
      </div>
      <div class="perk-item">
        <span class="perk-icon">📦</span>
        <div><h4>Order Tracking</h4><p>Real-time FedEx tracking for every shipment.</p></div>
      </div>
      <div class="perk-item">
        <span class="perk-icon">💰</span>
        <div><h4>Referral Rewards</h4><p>Earn 500 points for every friend you refer.</p></div>
      </div>
    </div>
    <p class="auth-quote">"The finest spices from the Island of Ceylon"</p>
  </div>

  <div class="auth-right">
    <div class="auth-card reveal">

      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Sign In</button>
        <button class="auth-tab" data-tab="register">Create Account</button>
      </div>

      <div class="auth-form" id="form-login">
        <p class="auth-welcome">Welcome back 🌶️</p>
        <h2 class="auth-title">Sign In</h2>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-wrap">
            <i class="fas fa-envelope input-icon"></i>
            <input type="email" id="login-email" class="form-input" placeholder="hello@example.com" autocomplete="email" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">
            Password
            <a href="#" class="forgot-link" id="forgot-link">Forgot password?</a>
          </label>
          <div class="input-wrap">
            <i class="fas fa-lock input-icon"></i>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" autocomplete="current-password" />
            <button class="pw-toggle" data-target="login-password"><i class="far fa-eye"></i></button>
          </div>
        </div>
        <div class="form-check">
          <label class="check-label">
            <input type="checkbox" id="remember-me" />
            <span class="check-box"></span>
            <span>Remember me</span>
          </label>
        </div>
        <button class="btn-auth-submit" id="btn-login">
          <span>Sign In</span><i class="fas fa-arrow-right"></i>
        </button>
        <div class="auth-divider"><span>or continue with</span></div>
        <button class="btn-social" id="btn-google">
          <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="" />
          <span>Continue with Google</span>
        </button>
        <p class="auth-switch">
          No account yet?
          <a href="#" class="switch-link" data-tab="register">Create one free →</a>
        </p>
      </div>

      <div class="auth-form hidden" id="form-register">
        <p class="auth-welcome">Join the spice family 🌿</p>
        <h2 class="auth-title">Create Account</h2>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <div class="input-wrap">
              <i class="fas fa-user input-icon"></i>
              <input type="text" id="reg-name" class="form-input" placeholder="Your full name" autocomplete="name" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Birthday <span style="opacity:.5">(optional)</span></label>
            <div class="input-wrap">
              <i class="fas fa-birthday-cake input-icon"></i>
              <input type="date" id="reg-birthday" class="form-input" />
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-wrap">
            <i class="fas fa-envelope input-icon"></i>
            <input type="email" id="reg-email" class="form-input" placeholder="hello@example.com" autocomplete="email" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Phone <span style="opacity:.5">(optional)</span></label>
          <div class="input-wrap">
            <i class="fas fa-phone input-icon"></i>
            <input type="tel" id="reg-phone" class="form-input" placeholder="+1 234 567 8900" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-wrap">
            <i class="fas fa-lock input-icon"></i>
            <input type="password" id="reg-password" class="form-input" placeholder="Min. 8 characters" autocomplete="new-password" />
            <button class="pw-toggle" data-target="reg-password"><i class="far fa-eye"></i></button>
          </div>
          <div class="pw-strength"><div class="pw-bar" id="pw-bar"></div></div>
          <p class="pw-label" id="pw-label"></p>
        </div>
        <div class="form-group">
          <label class="form-label">Referral Code <span style="opacity:.5">(optional)</span></label>
          <div class="input-wrap">
            <i class="fas fa-gift input-icon"></i>
            <input type="text" id="reg-referral" class="form-input" placeholder="Friend referral code" />
          </div>
        </div>
        <div class="form-check">
          <label class="check-label">
            <input type="checkbox" id="agree-terms" />
            <span class="check-box"></span>
            <span>I agree to the <a href="#" class="terms-link">Terms &amp; Privacy Policy</a></span>
          </label>
        </div>
        <button class="btn-auth-submit" id="btn-register">
          <span>Create Account</span><i class="fas fa-arrow-right"></i>
        </button>
        <div class="auth-divider"><span>or</span></div>
        <button class="btn-social" id="btn-google-reg">
          <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="" />
          <span>Continue with Google</span>
        </button>
        <p class="auth-switch">
          Already have an account?
          <a href="#" class="switch-link" data-tab="login">Sign in →</a>
        </p>
      </div>

      <div class="auth-form hidden" id="form-forgot">
        <a href="#" class="auth-back-form" id="back-to-login">
          <i class="fas fa-arrow-left"></i> Back to Sign In
        </a>
        <p class="auth-welcome">No worries 😊</p>
        <h2 class="auth-title">Reset Password</h2>
        <p class="auth-hint">Enter your email and we will send you a reset link.</p>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-wrap">
            <i class="fas fa-envelope input-icon"></i>
            <input type="email" id="forgot-email" class="form-input" placeholder="hello@example.com" />
          </div>
        </div>
        <button class="btn-auth-submit" id="btn-forgot">
          <span>Send Reset Link</span><i class="fas fa-paper-plane"></i>
        </button>
      </div>

    </div>
  </div>
  `;

  return html;
}

/* ── INIT ── */
export async function init(container) {
  if (!document.getElementById('login-styles')) {
    const s = document.createElement('style');
    s.id = 'login-styles';
    s.textContent = LOGIN_CSS;
    document.head.appendChild(s);
  }

  container.innerHTML = '';
  container.appendChild(getHTML());

  bindTabs(container);
  bindPasswordToggles(container);
  bindPasswordStrength(container);
  bindLoginForm(container);
  bindRegisterForm(container);
  bindForgotForm(container);
  bindGoogleAuth(container);
  bindSwitchLinks(container);
  setTimeout(initReveals, 50);
}

/* ── TABS ── */
function bindTabs(c) {
  c.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchForm(c, tab.dataset.tab));
  });
}

function switchForm(c, name) {
  c.querySelectorAll('.auth-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  ['login', 'register', 'forgot'].forEach(n => {
    const f = c.querySelector('#form-' + n);
    if (f) f.classList.toggle('hidden', n !== name);
  });
}

/* ── PASSWORD TOGGLE ── */
function bindPasswordToggles(c) {
  c.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = c.querySelector('#' + btn.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').className = input.type === 'text'
        ? 'far fa-eye-slash' : 'far fa-eye';
    });
  });
}

/* ── PASSWORD STRENGTH ── */
function bindPasswordStrength(c) {
  const input = c.querySelector('#reg-password');
  const bar   = c.querySelector('#pw-bar');
  const label = c.querySelector('#pw-label');
  if (!input) return;
  input.addEventListener('input', () => {
    const v = input.value;
    let score = 0;
    if (v.length >= 8)          score++;
    if (/[A-Z]/.test(v))        score++;
    if (/[0-9]/.test(v))        score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const lvls = [
      { w: '0%',   bg: 'transparent', t: '' },
      { w: '25%',  bg: '#ef4444',     t: 'Weak' },
      { w: '50%',  bg: '#f97316',     t: 'Fair' },
      { w: '75%',  bg: '#C8900A',     t: 'Good' },
      { w: '100%', bg: '#22c55e',     t: 'Strong' },
    ];
    const l = lvls[score] || lvls[0];
    bar.style.width      = l.w;
    bar.style.background = l.bg;
    label.textContent    = l.t;
  });
}

/* ── LOGIN ── */
function bindLoginForm(c) {
  const btn = c.querySelector('#btn-login');
  if (!btn) return;
  const submit = async () => {
    const email    = c.querySelector('#login-email').value.trim();
    const password = c.querySelector('#login-password').value;
    if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
    setLoading(btn, true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(btn, false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Welcome back! 🌶️', 'success');
    setTimeout(() => router.go('home'), 600);
  };
  btn.addEventListener('click', submit);
  ['login-email', 'login-password'].forEach(id => {
    c.querySelector('#' + id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') submit();
    });
  });
}

/* ── REGISTER ── */
function bindRegisterForm(c) {
  const btn = c.querySelector('#btn-register');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const name     = c.querySelector('#reg-name').value.trim();
    const email    = c.querySelector('#reg-email').value.trim();
    const password = c.querySelector('#reg-password').value;
    const phone    = c.querySelector('#reg-phone').value.trim();
    const birthday = c.querySelector('#reg-birthday').value;
    const referral = c.querySelector('#reg-referral').value.trim().toUpperCase();
    const agreed   = c.querySelector('#agree-terms').checked;

    if (!name || !email || !password) { showToast('Please fill required fields', 'error'); return; }
    if (password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    if (!agreed) { showToast('Please agree to the Terms and Privacy Policy', 'error'); return; }

    setLoading(btn, true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) { setLoading(btn, false); showToast(error.message, 'error'); return; }

    if (data.user) {
      await supabase.from('users').insert({
        id:            data.user.id,
        full_name:     name,
        email:         email,
        phone:         phone    || null,
        birthday:      birthday || null,
        referral_code: genCode(name),
      });
      await supabase.from('user_preferences').insert({ user_id: data.user.id });

      if (referral) {
        const { data: ref } = await supabase
          .from('users').select('id').eq('referral_code', referral).single();
        if (ref) {
          await supabase.from('referrals').insert({
            referrer_id:   ref.id,
            referred_id:   data.user.id,
            referral_code: referral,
          });
        }
      }
    }

    setLoading(btn, false);
    showToast('Account created! Check your email to verify.', 'success');
    setTimeout(() => switchForm(c, 'login'), 1500);
  });
}

/* ── FORGOT PASSWORD ── */
function bindForgotForm(c) {
  c.querySelector('#forgot-link')?.addEventListener('click', e => {
    e.preventDefault();
    ['login', 'register'].forEach(n => c.querySelector('#form-' + n)?.classList.add('hidden'));
    c.querySelector('#form-forgot')?.classList.remove('hidden');
  });

  c.querySelector('#back-to-login')?.addEventListener('click', e => {
    e.preventDefault();
    c.querySelector('#form-forgot')?.classList.add('hidden');
    c.querySelector('#form-login')?.classList.remove('hidden');
  });

  const btn = c.querySelector('#btn-forgot');
  btn?.addEventListener('click', async () => {
    const email = c.querySelector('#forgot-email').value.trim();
    if (!email) { showToast('Please enter your email', 'error'); return; }
    setLoading(btn, true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + '/#settings'
    });
    setLoading(btn, false);
    error
      ? showToast(error.message, 'error')
      : showToast('Reset link sent! Check your inbox.', 'success');
  });
}

/* ── GOOGLE ── */
function bindGoogleAuth(c) {
const doGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  if (error) showToast(error.message, 'error');
};
  c.querySelector('#btn-google')?.addEventListener('click', doGoogle);
  c.querySelector('#btn-google-reg')?.addEventListener('click', doGoogle);
}

/* ── SWITCH LINKS ── */
function bindSwitchLinks(c) {
  c.querySelectorAll('.switch-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchForm(c, link.dataset.tab);
    });
  });
}

/* ── HELPERS ── */
function setLoading(btn, on) {
  btn.disabled = on;
  const icon = btn.querySelector('i');
  if (icon) icon.className = on ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-right';
}

function genCode(name) {
  const base = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return base + rand;
}

export default init;