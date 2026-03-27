const CACHE_NAME = 'prime-preview-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/phones.html',
  '/accessories.html',
  '/clothing-shoes.html',
  '/hair.html',
  '/hair.htm',
  '/stanley-cups.html',
  '/consoles.html',
  '/jewelry.html',
  '/cart.html',
  '/checkout.html',
  '/product.html',
  '/about.html',
  '/auth/auth.html',
  '/auth/admin-login.html',
  '/auth/supplier-login.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Cached-first for assets, navigation fallback to app shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(resp => resp).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).catch(() => { return caches.match(event.request); }))
  );
});
