// Service Worker for offline support
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("CMP2029-cache").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./logo.png",
        "./manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
