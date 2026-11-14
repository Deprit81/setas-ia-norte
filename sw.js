
const CACHE = 'setas-norte-v57-1';
const ACTUAL = './v57.html';

const FILES = [
  ACTUAL,
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith('setas-norte-') &&
            key !== CACHE
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (
    req.method !== 'GET' ||
    url.origin !== self.location.origin
  ) return;

  // Mantener operativos los accesos antiguos
  // de la aplicación instalada.
  if (/\/v(?:32|39|46|53)\.html$/.test(url.pathname)) {
    event.respondWith(
      fetch(ACTUAL, { cache: 'no-store' })
        .then(response => {
          if (!response.ok) {
            throw new Error('No disponible');
          }
          return response;
        })
        .catch(() => caches.match(ACTUAL))
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE)
            .then(cache => cache.put(req, copy))
            .catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});
