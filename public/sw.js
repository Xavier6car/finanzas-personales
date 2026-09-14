// Service worker mínimo para hacer instalable la PWA.
// La app es dinámica (server actions + base de datos), así que no se cachean
// datos financieros: solo el "app shell" estático y una página de respaldo offline.

const CACHE_NAME = "nosotros-finanzas-shell-v1";
const SHELL_ASSETS = ["/manifest.webmanifest", "/offline.html", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // no interferir con server actions (POST)

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegación de páginas: red primero, con respaldo offline si falla.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html")),
    );
    return;
  }

  // Activos estáticos de Next.js e íconos: cache-first con actualización en segundo plano.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? network;
      }),
    );
  }
});
