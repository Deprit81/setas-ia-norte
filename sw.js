
const CACHE = 'setas-norte-v46-1';

const FILES = [
  './v46.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
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
          .filter(key => key.startsWith('setas-norte-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Redirigir accesos antiguos a la versión actual.
  if (/\/v(?:32|39)\.html$/.test(url.pathname)) {
    event.respondWith(
      fetch('./v46.html').catch(() => caches.match('./v46.html'))
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
