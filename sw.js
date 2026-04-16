const CACHE_NAME = "habitflow-v2";

const urlsToCache = [
  "./",
  "index.html",
  "journal.html",
  "timer.html",
  "manifest.json",
  "image-192.png",
  "image-512.png"
];

// INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        return caches.open("habitflow-runtime").then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

// 🔔 PUSH (only this is needed)
self.addEventListener("push", event => {
  if (!event.data) return;

  const data = event.data.json();

  const title = data.notification?.title || "HabitFlow";
  const options = {
    body: data.notification?.body || "New message",
    icon: "image-192.png"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
