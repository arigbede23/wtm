// PushNotificationToggle — toggle for enabling/disabling browser push notifications.

"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setSupported(isSupported);

    if (!isSupported) {
      setLoading(false);
      return;
    }

    // Check current subscription status
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setEnabled(!!subscription);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle() {
    if (!supported) return;
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (enabled) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
          await subscription.unsubscribe();
        }
        setEnabled(false);
      } else {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setLoading(false);
          return;
        }

        // Subscribe
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          setLoading(false);
          return;
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidKey);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });

        const key = subscription.getKey("p256dh");
        const auth = subscription.getKey("auth");

        if (!key || !auth) {
          setLoading(false);
          return;
        }

        const keyArray = Array.from(new Uint8Array(key));
        const authArray = Array.from(new Uint8Array(auth));

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode(...keyArray)),
            auth: btoa(String.fromCharCode(...authArray)),
          }),
        });

        setEnabled(true);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <div className="flex items-center gap-3">
        {enabled ? (
          <Bell className="h-4 w-4 text-brand-600" />
        ) : (
          <BellOff className="h-4 w-4 text-gray-400" />
        )}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Push Notifications
        </span>
      </div>
      <div
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
