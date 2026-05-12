/* ================================================================
   KITHTHA GRAND — Service Worker
   sw.js  |  Cache-first for assets, network-first for API
================================================================ */

var CACHE_NAME = 'kg-v1';

var PRECACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/animations.css',
  '/js/app.js',
  '/js/router.js',
  '/js/supabase.js',
  '/js/pages/products.js',
  '/js/pages/product.js',
  '/js/pages/profile.js',
  '/js/pages/login.js',
  '/js/pages/admin.js',
  '/images/kiththa LOGO (4).png',
];

/* ── Install: pre-cache shell ── */
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE.map(function(url) {
        return new Request(url, { cache: 'reload' });
      })).catch(function() {});
    })
  );
});

/* ── Activate: clear old caches ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

/* ── Fetch strategy ── */
self.addEventListener('fetch', function(e) {
  var req = e.request;

  /* Skip non-GET, browser-extension, and Supabase API requests */
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;
  if (req.url.includes('supabase.co')) return;
  if (req.url.includes('cdn.jsdelivr.net')) return;

  /* HTML navigation — network first, cache fallback */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function() {
        return caches.match('/index.html');
      })
    );
    return;
  }

  /* Static assets — cache first, then network + update cache */
  e.respondWith(
    caches.match(req).then(function(cached) {
      var networkFetch = fetch(req).then(function(resp) {
        if (resp.ok) {
          var clone = resp.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(req, clone); });
        }
        return resp;
      }).catch(function() {});

      return cached || networkFetch;
    })
  );
});
