// A simple service worker for the Hub UNO PWA.
const CACHE_NAME = 'hub-uno-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/dual_infodose_style.css',
  '/dual_infodose_script.js',
  '/pwa_overrides.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  // Pre-cache critical assets.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  // Respond from cache first, then network.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});