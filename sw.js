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
  // 항상 네트워크 우선, 실패 시 캐시
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 성공하면 캐시 업데이트
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
