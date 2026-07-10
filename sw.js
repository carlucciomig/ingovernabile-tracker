// Service worker — Ingovernabile / Tracker Sovranità Digitale
// Cache-first app shell so the tracker and its generators work fully offline
// after the first visit. No analytics, no external calls except the one-time
// OpenPGP.js library fetch (cached forever afterwards).

const CACHE_VERSION = "ingovernabile-v4";
const SHELL = [
  "./index.html",
  "./ads-config.js",
  "./ads.js",
  "./data.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Cache same-origin shell files and the OpenPGP.js CDN script (runtime cache)
          const isCdnLib = req.url.includes("cdnjs.cloudflare.com") && req.url.includes("openpgp");
          const isSameOrigin = req.url.startsWith(self.location.origin);
          if (res.ok && (isSameOrigin || isCdnLib)) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
