
const CACHE_NAME = "hululcom-cache-v1";
const OFFLINE_URL = "/offline.html";

// Important: Add all essential files for the app shell to work offline.
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/index.tsx" // Precache the main script
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error("Precaching failed:", err))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Service Worker: Deleting old cache', key);
          return caches.delete(key);
        }
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  if (event.request.method !== "GET" || event.request.url.startsWith('https://esm.sh/')) {
    // Don't cache external dependencies from esm.sh for simplicity in this setup,
    // let the browser handle them. In a real build setup, these would be local.
    return;
  }

  // Stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If the fetch is successful, update the cache
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });

      // Return cached response immediately if available, and update cache in background
      return cachedResponse || fetchPromise;
    })
  );
});
