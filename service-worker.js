/*
 * Dark Case Audio PWA foundation.
 * Test-branch preview only. The live website is not modified.
 * Audio streaming, downloads, Supabase, Stripe and other requests are never cached.
 */
const CACHE_NAME = "dark-case-audio-shell-v2";
const APP_SHELL = [
  "./pwa-preview.html",
  "./pwa-icon.svg",
  "./smart%20logo%20small.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((key) => key.startsWith("dark-case-audio-shell-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin ||
      request.destination === "audio" || request.destination === "video") return;

  const shellPaths = APP_SHELL.map((path) => new URL(path, self.location.href).pathname);
  const isHomeNavigation = request.mode === "navigate" &&
    (url.pathname === new URL("./", self.location.href).pathname ||
     url.pathname === new URL("./pwa-preview.html", self.location.href).pathname);
  if (!isHomeNavigation && !shellPaths.includes(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./pwa-preview.html", copy));
        }
        return response;
      }).catch(async () => (await caches.match("./pwa-preview.html")) || Response.error())
    );
    return;
  }

  event.respondWith(caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    });
  }));
});