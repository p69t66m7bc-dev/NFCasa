const CACHE_NAME = "nfcasa-v5-3";
const APP_FILES = [
  "./",
  "./index.html",
  "./css/styles.css?v=53",
  "./js/app.js?v=53",
  "./js/auth.js",
  "./js/constants.js",
  "./js/firebase.js",
  "./js/helpers.js",
  "./js/store.js",
  "./js/ui.js",
  "./manifest.webmanifest",
  "./branding/logo-nfcasa.png",
  "./branding/logo-mark.png",
  "./icons/icon-64.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Xarxa primer: les versions noves publicades es veuen de seguida.
// Firebase queda fora del Service Worker perquè les dades sempre siguin actuals.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
