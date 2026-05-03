// Service Worker — runs in the background even when the app is closed.
// It caches pages so the app can work offline (or load faster on slow connections).
// This file lives in /public so the browser can access it directly.

const CACHE_NAME = "wtm-v4"; // Change this version to bust the cache on updates
const OFFLINE_URL = "/feed"; // Fallback page when user is offline

// Files to cache immediately when the service worker is installed
const PRECACHE_URLS = ["/feed", "/manifest.json"];

// INSTALL — runs once when the service worker is first registered.
// Pre-caches essential files so they're available offline immediately.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // Activate the new service worker immediately
});

// ACTIVATE — runs when a new service worker takes over.
// Cleans up old caches from previous versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // Take control of all open tabs immediately
});

// PUSH — handle incoming push notifications from the server.
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: { url: data.url || "/feed" },
    };

    event.waitUntil(self.registration.showNotification(data.title || "WTM", options));
  } catch {
    // Ignore malformed push data
  }
});

// NOTIFICATION CLICK — handle taps on push notifications.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/feed";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus an existing tab if one is open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open a new tab
      return clients.openWindow(url);
    })
  );
});

// FETCH — intercepts every network request the app makes.
// Strategy: try network first, fall back to cache if offline.
self.addEventListener("fetch", (event) => {
  // Only handle GET requests — POST/PUT/DELETE can't be cached
  if (event.request.method !== "GET") return;

  // Only handle same-origin requests — don't intercept external URLs
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip API routes — they return dynamic data that shouldn't be stale-cached
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;

  // For page navigations (clicking links, typing URLs)
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(event.request);
        } catch {
          // Offline — fall back through cached offline page, cached request, then 503.
          // Whatever we return must be a real Response or respondWith throws
          // "Failed to convert value to 'Response'".
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response("Offline", {
            status: 503,
            statusText: "Offline",
            headers: { "Content-Type": "text/plain" },
          });
        }
      })()
    );
    return;
  }

  // For static assets (CSS, JS, images):
  // Serve from cache if available, but also update the cache in the background
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) {
        // Update in background but don't block the response
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === "basic") {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
          })
          .catch(() => {});
        return cached;
      }
      try {
        const response = await fetch(event.request);
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      } catch {
        return new Response("", {
          status: 504,
          statusText: "Gateway Timeout",
        });
      }
    })()
  );
});
