const CACHE_VERSION = '1';
const CACHE_NAME = 'khk-schedule-v2-v' + CACHE_VERSION;

const STATIC_ASSETS = [
  '/kraftheinz-working-schedule-v2/',
  '/kraftheinz-working-schedule-v2/index.html',
  '/kraftheinz-working-schedule-v2/manifest.json',
  '/kraftheinz-working-schedule-v2/assets/icon-192.png',
  '/kraftheinz-working-schedule-v2/assets/icon-512.png',
  '/kraftheinz-working-schedule-v2/assets/icon-180.png',
  '/kraftheinz-working-schedule-v2/assets/kh-logo.jpg',
];

// Apps Script URL 패턴 - 캐시 안 함
const NO_CACHE_PATTERNS = [
  'script.google.com',
  'script.googleusercontent.com',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
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
  const url = e.request.url;

  // Apps Script 요청 → 항상 네트워크만 (캐시 안 함)
  if (NO_CACHE_PATTERNS.some(p => url.includes(p))) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 정적 파일 → 네트워크 우선, 실패 시 캐시
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
