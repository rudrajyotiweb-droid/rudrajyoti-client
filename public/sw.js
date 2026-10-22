/* Rudra Jyoti service worker — hand-written for the UI phase.
 * Strategy (BRD §8): precache shell + offline page, cache-first for hashed static
 * assets, stale-while-revalidate for images, network-first for pages/API GETs.
 * Images from the database (/media/*) use stale-while-revalidate; videos stream directly. */
const VERSION = "sm-v4";
// trailing slashes match the static export, so cached responses are never redirects
const SHELL = ["/", "/offline/", "/puja/", "/store/", "/icons/icon-192.png", "/assets/patterns/mandala.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(`${VERSION}-shell`).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const staleWhileRevalidate = async (req, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
};

const cacheFirst = async (req, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
};

const networkFirst = async (req, cacheName) => {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    if (req.mode === "navigate") return caches.match("/offline/");
    throw new Error("offline");
  }
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) return e.respondWith(cacheFirst(req, `${VERSION}-static`));
  if (url.pathname.startsWith("/_next/image") || url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || (url.pathname.startsWith("/media/") && /\.(webp|png|jpe?g|gif|svg)$/i.test(url.pathname)))
    return e.respondWith(staleWhileRevalidate(req, `${VERSION}-images`));
  if (req.mode === "navigate" || url.pathname.startsWith("/api/")) return e.respondWith(networkFirst(req, `${VERSION}-pages`));
});

/* Web push (wired up in the backend phase) */
self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : { title: "Rudra Jyoti", body: "You have a new update" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/account/bookings" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow(e.notification.data.url));
});
