/*
 * Dark Case Audio PWA foundation.
 * Intentionally conservative: only the homepage shell and small public logo
 * are cached. Audio streaming, downloads, Supabase, Stripe and other requests
 * are left to the network and are never cached by this worker.
 */
const CACHE_NAME = "dark-case-audio-shell-v1";
const APP_SHELL = [
  "./index.html",
  "./smart%20logo%20small.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("dark-case-audio-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Never intercept cross-origin requests, non-GET requests, or media streams.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    request.destination === "audio" ||
    request.destination === "video"
  ) {
    return;
  }

  // Only cache the explicitly listed public shell assets. Navigation is
  // network-first so visitors receive current website content when online.
  const shellPaths = APP_SHELL.map((path) => new URL(path, self.location.href).pathname);
  const isHomeNavigation = request.mode === "navigate" && (url.pathname === new URL("./", self.location.href).pathname || url.pathname === new URL("./index.html", self.location.href).pathname);
  const isShellAsset = isHomeNavigation || shellPaths.includes(url.pathname);

  if (!isShellAsset) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          }
          return response;
        })
        .catch(async () => (await caches.match("./index.html")) || Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
