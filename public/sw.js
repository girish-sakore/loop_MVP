/* Minimal service worker: deliberately no fetch handler or offline cache. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    const parsed = event.data ? event.data.json() : {};
    payload = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    payload = {};
  }

  const title = typeof payload.title === "string" ? payload.title : "Loopit";
  const body = typeof payload.body === "string" ? payload.body : "";
  const url = typeof payload.url === "string" ? payload.url : "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192-nobg.png",
      badge: "/icon-192-nobg.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const requestedUrl = event.notification.data?.url;
      let targetUrl = "/";

      if (typeof requestedUrl === "string") {
        try {
          const parsedUrl = new URL(requestedUrl, self.location.origin);
          if (parsedUrl.origin === self.location.origin) {
            targetUrl = parsedUrl.href;
          }
        } catch {
          targetUrl = "/";
        }
      }

      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existingWindow = windows.find((client) => "focus" in client);

      if (existingWindow) {
        await existingWindow.focus();
      } else {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});