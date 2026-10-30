// Lets the website install as an app (Windows, phone) and open without internet.
// Always tries the internet first, so new drives show up; falls back to the last copy saved here.
const CACHE = "radar-map-v1";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "index.html", "vendor/leaflet.js", "vendor/leaflet-heat.js",
    "vendor/leaflet.css", "manifest.webmanifest", "icon-192.png"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;   // map tiles, fonts: browser handles them
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(url.pathname, copy)); }
    return res;
  }).catch(() => caches.match(url.pathname).then(hit => hit || caches.match("index.html"))));
});
