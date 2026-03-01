const CACHE_NAME = 'milweno-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API calls, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always fetch live data from weather/geocoding APIs
  if (url.hostname.includes('open-meteo.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('{"error":"offline"}', {headers:{'Content-Type':'application/json'}})));
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
      return res;
    }))
  );
});

// Handle push notifications (for future server-side push)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'MilWeNo Alert', body: 'Weather update available' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  );
});
