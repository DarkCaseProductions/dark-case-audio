/* Dark Case Audio PWA service worker.
   Caches only the public homepage as an offline fallback.
   Never caches radio streams, audio, downloads, membership, Supabase or Stripe requests. */
const CACHE_NAME = "dca-home-shell-v1";
const HOME_URL = new URL("./", self.location.href).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try { await cache.add(new Request(HOME_URL, { cache: "reload" })); } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("dca-home-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode !== "navigate") return;
  const isHome = url.pathname === new URL("./", self.location.href).pathname ||
                 url.pathname.endsWith("/index.html");
  if (!isHome) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(HOME_URL, response.clone());
      }
      return response;
    } catch (_) {
      return (await caches.match(HOME_URL)) || Response.error();
    }
  })());
});