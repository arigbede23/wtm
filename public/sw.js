// Service Worker — runs in the background even when the app is closed.
// It caches pages so the app can work offline (or load faster on slow connections).
// This file lives in /public so the browser can access it directly.

const CACHE_NAME = "wtm-v1"; // Change this version to bust the cache on updates
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
  // For page navigations (clicking links, typing URLs)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        // If offline, try to serve the cached feed page
        caches.match(OFFLINE_URL).then((response) => response || caches.match(event.request))
      )
    );
    return;
  }

  // For all other requests (images, API calls, CSS, JS):
  // Serve from cache if available, but also update the cache in the background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          // Only cache successful responses from our own origin
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // If network fails, fall back to cached version
      return cached || fetched; // Serve cached version first (faster), or wait for network
    })
  );
});
