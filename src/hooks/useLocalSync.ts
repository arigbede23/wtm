// useLocalSync — triggers a background sync of Ticketmaster events near the user.
// Runs at most once per 30 minutes per location bucket (checked client-side).

"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "wtm-local-sync";
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

function bucketKey(lat: number, lng: number): string {
  return `${lat.toFixed(1)},${lng.toFixed(1)}`;
}

export function useLocalSync(lat: number | null, lng: number | null) {
  const fired = useRef(false);

  useEffect(() => {
    if (lat == null || lng == null || fired.current) return;

    const key = bucketKey(lat, lng);
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const map = JSON.parse(cached);
        const last = map[key];
        if (last && Date.now() - last < COOLDOWN_MS) return;
      }
    } catch {
      // ignore
    }

    fired.current = true;

    fetch("/api/sync/local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng }),
    })
      .then(() => {
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          const map = cached ? JSON.parse(cached) : {};
          map[key] = Date.now();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        } catch {
          // ignore
        }
      })
      .catch(() => {});
  }, [lat, lng]);
}
