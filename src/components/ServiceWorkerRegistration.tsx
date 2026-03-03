// Service Worker Registration — makes the app installable as a PWA.
// A service worker runs in the background and can cache pages for offline use.
// This component registers the service worker file at /public/sw.js.

"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register if the browser supports service workers
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
    }
  }, []); // Empty dependency array = runs once on mount

  return null; // This component doesn't render anything visible
}
