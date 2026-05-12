/* ================================================================
   KITHTHA GRAND — Our Story Page
   js/pages/about.js
================================================================ */

import { router }      from '../router.js';
import { initReveals } from '../app.js';

/* ── CSS ── */
const CSS = [
  '.about-page{min-height:100vh;background:var(--cream)}',

  /* hero */
  '.about-hero{background:#0a0502;padding:120px 0 80px;position:relative;overflow:hidden}',
  '.about-hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(139,37,0,.85) 0%,rgba(61,28,2,.95) 60%,#0a0502 100%)}',
  '.about-hero-overlay{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(200,144,10,.03) 40px,rgba(200,144,10,.03) 80px)}',
  '.about-hero .container{position:relative;z-index:1}',
  '.about-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}',
  '.about-hero h1{font-family:var(--font-head);font-size:clamp(2rem,5vw,3.6rem);color:var(--cream);line-height:1.2;margin-bottom:16px}',
  '.about-hero-sub{font-size:.95rem;color:rgba(253,243,227,.55);font-style:italic;max-width:540px;line-height:1.8}',
  '.about-hero-rule{display:flex;gap:8px;margin-top:28px;align-items:center}',
  '.about-hero-rule span{display:block;height:2px;border-radius:99px}',

  /* origin */
  '.about-origin{padding:80px 0;background:white}',
  '.about-origin-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}',
  '.about-origin-eyebrow{font-family:var(--font-sub);font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}',
  '.about-origin-text h2{font-family:var(--font-head);font-size:clamp(1.5rem,3vw,2.2rem);color:var(--brown);line-height:1.3;margin-bottom:20px}',
  '.about-origin-text p{font-size:.93rem;color:var(--brown-light);line-height:1.9;margin-bottom:16px;font-style:italic}',
  '.about-origin-text p strong{color:var(--brown);font-style:normal}',
  '.about-vis{border-radius:24px;overflow:hidden;position:relative;min-height:400px;display:flex;align-items:center;justify-content:center}',
  '.about-vis-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 40% 60%,rgba(139,37,0,.85) 0%,rgba(61,28,2,.95) 65%,#0a0502 100%)}',
  '.about-vis-lines{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 30px,rgba(200,144,10,.04) 30px,rgba(200,144,10,.04) 60px)}',
  '.about-vis-inner{position:relative;z-index:1;text-align:center;padding:48px 36px}',
  '.about-vis-emoji{font-size:4.5rem;display:block;margin-bottom:20px}',
  '.about-vis-quote{font-family:var(--font-head);font-size:1rem;color:var(--cream);line-height:1.7;font-style:italic;margin-bottom:16px}',
  '.about-vis-attr{font-family:var(--font-sub);font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}',
  '.about-vis-tags{display:flex;justify-content:center;gap:8px;margin-top:24px;flex-wrap:wrap}',
  '.about-vis-tag{padding:5px 12px;border:1px solid rgba(200,144,10,.3);border-radius:99px;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(200,144,10,.7)}',

  /* values */
  '.about-values{padding:80px 0;background:var(--cream)}',
  '.about-sec-head{text-align:center;margin-bottom:48px}',
  '.about-sec-head h2{font-family:var(--font-head);font-size:clamp(1.4rem,3vw,2rem);color:var(--brown);margin-bottom:8px}',
  '.about-sec-head p{font-size:.9rem;color:var(--brown-light);font-style:italic}',
  '.about-vals-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}',
  '.about-val{background:white;border-radius:20px;padding:32px 24px;text-align:center;border:1px solid var(--cream-dark);transition:.25s}',
  '.about-val:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(61,28,2,.1);border-color:rgba(200,144,10,.3)}',
  '.about-val-ico{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(139,37,0,.07),rgba(200,144,10,.1));display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 16px}',
  '.about-val-name{font-family:var(--font-sub);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--red);margin-bottom:8px}',
  '.about-val-desc{font-size:.84rem;color:var(--brown-light);line-height:1.7;font-style:italic}',

  /* stats */
  '.about-stats{padding:60px 0;background:#0a0502;position:relative;overflow:hidden}',
  '.about-stats-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,rgba(139,37,0,.35) 0%,transparent 70%)}',
  '.about-stats-row{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center}',
  '.about-stat-n{font-family:var(--font-head);font-size:clamp(2rem,4vw,3rem);color:var(--gold);line-height:1}',
  '.about-stat-l{font-family:var(--font-sub);font-size:.63rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(253,243,227,.4);margin-top:8px}',

  /* timeline */
  '.about-tl{padding:80px 0;background:white}',
  '.about-tl-list{max-width:620px;margin:0 auto;position:relative}',
  '.about-tl-list::before{content:"";position:absolute;left:28px;top:8px;bottom:8px;width:2px;background:linear-gradient(to bottom,var(--gold),rgba(200,144,10,.1))}',
  '.about-tl-item{display:flex;gap:24px;margin-bottom:32px}',
  '.about-tl-dot{width:56px;min-width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--red),var(--red-dark));display:flex;align-items:center;justify-content:center;font-family:var(--font-sub);font-size:.6rem;letter-spacing:.05em;color:white;font-weight:700;position:relative;z-index:1;box-shadow:0 4px 12px rgba(139,37,0,.3)}',
  '.about-tl-body{padding-top:14px}',
  '.about-tl-body h4{font-family:var(--font-sub);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--brown);margin-bottom:4px}',
  '.about-tl-body p{font-size:.84rem;color:var(--brown-light);line-height:1.7;font-style:italic}',

  /* CTA */
  '.about-cta{padding:80px 0;background:var(--cream);text-align:center}',
  '.about-cta h2{font-family:var(--font-head);font-size:clamp(1.5rem,3vw,2.2rem);color:var(--brown);margin-bottom:12px}',
  '.about-cta-lead{font-size:.9rem;color:var(--brown-light);font-style:italic;margin-bottom:32px;max-width:480px;margin-left:auto;margin-right:auto}',
  '.about-cta-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}',
  '.about-btn-pri{display:inline-flex;align-items:center;gap:10px;padding:15px 36px;background:linear-gradient(135deg,var(--red),var(--red-dark));color:white;border-radius:99px;font-family:var(--font-sub);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;border:none;transition:.25s}',
  '.about-btn-pri:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(139,37,0,.3)}',
  '.about-btn-sec{display:inline-flex;align-items:center;gap:10px;padding:14px 32px;border:1.5px solid rgba(139,37,0,.3);color:var(--red);border-radius:99px;font-family:var(--font-sub);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;background:transparent;transition:.25s}',
  '.about-btn-sec:hover{border-color:var(--red);background:rgba(139,37,0,.05)}',

  /* responsive */
  '@media(max-width:900px){.about-vals-grid{grid-template-columns:1fr 1fr}}',
  '@media(max-width:768px){',
  '.about-origin-grid{grid-template-columns:1fr}',
  '.about-vis{min-height:240px}',
  '.about-stats-row{grid-template-columns:1fr 1fr;gap:24px}',
  '}',
  '@media(max-width:480px){.about-val{padding:24px 16px}.about-val-ico{width:52px;height:52px;font-size:1.4rem}}',
].join('');

/* ── Render ── */
function renderHero() {
  return (
    '<section class="about-hero">'
      + '<div class="about-hero-bg"></div>'
      + '<div class="about-hero-overlay"></div>'
      + '<div class="container">'
        + '<p class="about-eyebrow reveal">Our Story</p>'
        + '<h1 class="reveal" style="--delay:.08s">From the Spice Gardens of Ceylon</h1>'
        + '<p class="about-hero-sub reveal" style="--delay:.14s">'
          + 'For generations, the highlands of Sri Lanka have gifted the world with the finest spices. '
          + 'Kiththa Grand was born from a deep love for this heritage &mdash; to carry the purity of Ceylon spices to every kitchen on earth.'
        + '</p>'
        + '<div class="about-hero-rule reveal" style="--delay:.2s">'
          + '<span style="width:40px;background:var(--gold)"></span>'
          + '<span style="width:20px;background:rgba(200,144,10,.4)"></span>'
          + '<span style="width:10px;background:rgba(200,144,10,.2)"></span>'
        + '</div>'
      + '</div>'
    + '</section>'
  );
}

function renderOrigin() {
  return (
    '<section class="about-origin">'
      + '<div class="container">'
        + '<div class="about-origin-grid">'
          + '<div class="about-origin-text reveal">'
            + '<p class="about-origin-eyebrow">The Beginning</p>'
            + '<h2>Where Every Spice Tells a Story</h2>'
            + '<p>Sri Lanka &mdash; once called <strong>Serendib</strong> by Arab traders and <strong>Taprobane</strong> by the Greeks &mdash; has been at the heart of the global spice trade for over 2,000 years. The volcanic soils, monsoon rains and perfect elevation of the island create flavour profiles found nowhere else on earth.</p>'
            + '<p>Kiththa Grand was founded with a single purpose: to connect the <strong>small-scale spice farmers of the hill country</strong> directly to homes and kitchens around the world &mdash; without dilution, without compromise, without middlemen.</p>'
            + '<p>Every batch is sourced directly from trusted growers in Kandy, Matale and the Southern Province. Each spice is sun-dried, hand-sorted and packed using traditional methods that have not changed in centuries.</p>'
          + '</div>'
          + '<div class="about-vis reveal" style="--delay:.1s">'
            + '<div class="about-vis-bg"></div>'
            + '<div class="about-vis-lines"></div>'
            + '<div class="about-vis-inner">'
              + '<span class="about-vis-emoji">&#127798;</span>'
              + '<p class="about-vis-quote">&ldquo;The spice trade built empires. We bring that same precious cargo &mdash; directly from the island of serendipity &mdash; to your table.&rdquo;</p>'
              + '<p class="about-vis-attr">&mdash; Kiththa Grand</p>'
              + '<div class="about-vis-tags">'
                + '<span class="about-vis-tag">Ceylon Cinnamon</span>'
                + '<span class="about-vis-tag">Black Pepper</span>'
                + '<span class="about-vis-tag">Cardamom</span>'
                + '<span class="about-vis-tag">Cloves</span>'
              + '</div>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</div>'
    + '</section>'
  );
}

function renderValues() {
  var vals = [
    { ico: '&#127807;', name: 'Pure & Natural',      desc: 'No additives, no preservatives. Only the real, unprocessed spice &mdash; exactly as nature intended.' },
    { ico: '&#127862;', name: 'Traditional Methods', desc: 'Sun-dried and hand-sorted using age-old techniques passed down through Sri Lankan farming families.' },
    { ico: '&#129309;', name: 'Farmer First',        desc: 'Direct partnerships with hill country growers &mdash; fair prices and fully traceable supply chains.' },
    { ico: '&#127757;', name: 'Global Reach',        desc: 'Certified for export to 30+ countries while maintaining the intimate care of a family-run operation.' },
  ];
  var cards = '';
  vals.forEach(function(v, i) {
    cards += (
      '<div class="about-val reveal" style="--delay:' + (i * 0.06) + 's">'
        + '<div class="about-val-ico">' + v.ico + '</div>'
        + '<p class="about-val-name">' + v.name + '</p>'
        + '<p class="about-val-desc">' + v.desc + '</p>'
      + '</div>'
    );
  });
  return (
    '<section class="about-values">'
      + '<div class="container">'
        + '<div class="about-sec-head">'
          + '<h2 class="reveal">What We Stand For</h2>'
          + '<p class="reveal" style="--delay:.06s">The principles behind every grain of spice we ship</p>'
        + '</div>'
        + '<div class="about-vals-grid">' + cards + '</div>'
      + '</div>'
    + '</section>'
  );
}

function renderStats() {
  var stats = [
    { n: '2000', plus: '+', l: 'Years of Spice Heritage' },
    { n: '30',   plus: '+', l: 'Countries Served' },
    { n: '25',   plus: '+', l: 'Spice Varieties' },
    { n: '500',  plus: '+', l: 'Happy Customers' },
  ];
  var items = '';
  stats.forEach(function(s, i) {
    items += (
      '<div class="reveal" style="--delay:' + (i * 0.07) + 's">'
        + '<div class="about-stat-n">' + s.n + '<span style="color:var(--red)">' + s.plus + '</span></div>'
        + '<div class="about-stat-l">' + s.l + '</div>'
      + '</div>'
    );
  });
  return (
    '<section class="about-stats">'
      + '<div class="about-stats-glow"></div>'
      + '<div class="container">'
        + '<div class="about-stats-row">' + items + '</div>'
      + '</div>'
    + '</section>'
  );
}

function renderTimeline() {
  var events = [
    { year: '2020', title: 'The Dream Begins',          desc: 'Kiththa Grand is founded in Colombo with a mission to share pure Ceylon spices with the world.' },
    { year: '2021', title: 'Farmer Partnerships',       desc: 'Direct sourcing agreements established with hill country farmers in Kandy and Matale districts.' },
    { year: '2022', title: 'First International Export', desc: 'Ceylon cinnamon and black pepper reach kitchens in Europe and the Middle East for the first time.' },
    { year: '2024', title: 'Global Reach',               desc: 'Serving 30+ countries with a growing catalogue of 25+ hand-picked Ceylon spice varieties.' },
  ];
  var items = '';
  events.forEach(function(e, i) {
    items += (
      '<div class="about-tl-item reveal" style="--delay:' + (i * 0.08) + 's">'
        + '<div class="about-tl-dot">' + e.year + '</div>'
        + '<div class="about-tl-body">'
          + '<h4>' + e.title + '</h4>'
          + '<p>' + e.desc + '</p>'
        + '</div>'
      + '</div>'
    );
  });
  return (
    '<section class="about-tl">'
      + '<div class="container">'
        + '<div class="about-sec-head">'
          + '<h2 class="reveal">Our Journey</h2>'
          + '<p class="reveal" style="--delay:.06s">From a small family vision to a global spice brand</p>'
        + '</div>'
        + '<div class="about-tl-list">' + items + '</div>'
      + '</div>'
    + '</section>'
  );
}

function renderCta() {
  return (
    '<section class="about-cta">'
      + '<div class="container">'
        + '<h2 class="reveal">Taste the Difference</h2>'
        + '<p class="about-cta-lead reveal" style="--delay:.06s">Join thousands of home cooks and chefs who have discovered the magic of authentic Ceylon spices.</p>'
        + '<div class="about-cta-btns reveal" style="--delay:.12s">'
          + '<button class="about-btn-pri js-shop"><i class="fas fa-leaf"></i> Shop Our Collection</button>'
          + '<button class="about-btn-sec js-contact"><i class="fas fa-envelope"></i> Get in Touch</button>'
        + '</div>'
      + '</div>'
    + '</section>'
  );
}

/* ── Init ── */
export async function init(container) {
  if (!document.getElementById('about-css')) {
    var s = document.createElement('style');
    s.id = 'about-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  container.innerHTML = (
    '<div class="about-page">'
      + renderHero()
      + renderOrigin()
      + renderValues()
      + renderStats()
      + renderTimeline()
      + renderCta()
    + '</div>'
  );

  var shopBtn    = container.querySelector('.js-shop');
  var contactBtn = container.querySelector('.js-contact');
  if (shopBtn)    shopBtn.addEventListener('click',    function() { router.go('products'); });
  if (contactBtn) contactBtn.addEventListener('click', function() { router.go('contact'); });

  initReveals();
}

export default init;
