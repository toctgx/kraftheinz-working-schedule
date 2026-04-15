const CACHE_NAME = 'khk-schedule-v2';
const ASSETS = [
  '/kraftheinz-working-schedule/',
  '/kraftheinz-working-schedule/index.html',
  '/kraftheinz-working-schedule/manifest.json',
  '/kraftheinz-working-schedule/assets/icon-192.png',
  '/kraftheinz-working-schedule/assets/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // 엑셀 파일은 항상 네트워크에서
  if (e.request.url.includes('.xlsx')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // 나머지는 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
