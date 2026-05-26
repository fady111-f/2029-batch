// Service Worker for offline support (improved)
const CACHE_NAME = 'cmp2029-v4';
const PRECACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './logo1.png',
  './manifest.json',
  './openai-config.js',
  './styles.css',
  './app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const respClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
      }
      return response;
    });
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('./offline.html'))
    );
    return;
  }

  const shouldNetworkFirst = request.destination === 'document'
    || request.destination === 'script'
    || request.destination === 'style'
    || request.destination === ''
    || request.url.endsWith('.html')
    || request.url.endsWith('.js')
    || request.url.endsWith('.css');

  if (shouldNetworkFirst) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
