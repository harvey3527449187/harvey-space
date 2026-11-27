const CACHE_PREFIX = "harvey-vocab-";
const CACHE = CACHE_PREFIX + "v10";
const APP_SHELL = ["./背单词.html", "./manifest.webmanifest", "./vocabulary.css", "./ielts-vocabulary.js", "../module-nav.css", "../harvey-cloud.js"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  if(new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(fetch(event.request, {cache: "no-cache"}).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || caches.match("./背单词.html"))));
});
