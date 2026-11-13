
 // SETAS IA NORTE V3.9
 // Actualización de caché y compatibilidad con la aplicación instalada.

const CACHE = 'setas-norte-v39-1';

const FILES = [
  './v39.html',
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

  // Compatibilidad con accesos antiguos de la V3.2.
  if (url.pathname.endsWith('/v32.html')) {
    event.respondWith(
      fetch('./v39.html').catch(() => caches.match('./v39.html'))
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

