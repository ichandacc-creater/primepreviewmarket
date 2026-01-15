const CACHE_NAME = 'prime-preview-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/auth/auth.html',
  '/auth/admin-login.html',
  '/auth/supplier-login.html',
  '/styles.css'
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
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).catch(() => caches.match('/index.html')))
  );
});
