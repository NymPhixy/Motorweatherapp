const CACHE_NAME = "motor-weather-cache-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch(() => caches.match("/index.html"));
    }),
  );
});

self.addEventListener("message", (event) => {
  const payload = event.data;

  if (!payload || payload.type !== "SHOW_WEATHER_NOTIFICATION") {
    return;
  }

  const { title, body } = payload;
  self.registration.showNotification(title, {
    body,
    icon: "/vite.svg",
    badge: "/vite.svg",
  });
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Motor Ride Weather",
    body: "Nieuwe weerupdate beschikbaar.",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Motor Ride Weather", {
      body: data.body || "Nieuwe weerupdate beschikbaar.",
      icon: "/vite.svg",
      badge: "/vite.svg",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
