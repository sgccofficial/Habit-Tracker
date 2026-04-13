const CACHE_NAME = "habitflow-v0";

const urlsToCache = [
  "./",
  "index.html",
  "journal.html",
  "timer.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
];

// INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVATE (clear old cache)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (network first, fallback to cache)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        return caches.open("habitflow-runtime").then(cache => {
          cache.put(event.request, res.clone());
          return res;
        });
      }).catch(() => caches.match("offline.html"));
    })
  );
});
