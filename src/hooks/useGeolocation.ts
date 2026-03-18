// useGeolocation — provides the user's current location via the browser Geolocation API.
// Continuously watches position when permission is granted so the app stays
// up to date as the user moves. Caches the latest position in localStorage
// so it's available instantly on subsequent loads.

"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const STORAGE_KEY = "wtm-user-location-v2";

type GeoState = {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    loading: false,
    error: null,
  });
  const watchId = useRef<number | null>(null);

  // Restore cached position on mount, then start watching if permission exists
  useEffect(() => {
    // 1. Restore cache so we have something immediately
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { lat, lng } = JSON.parse(cached);
        setState({ lat, lng, loading: false, error: null });
      }
    } catch {
      // ignore
    }

    // 2. If permission already granted, start watching position continuously
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          startWatching();
        }
      }).catch(() => {});
    }

    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  function startWatching() {
    if (watchId.current != null) return; // already watching
    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
        setState({ lat, lng, loading: false, error: null });
      },
      (err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.code === 1 ? "Location permission denied" : err.message,
        }));
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
        setState({ lat, lng, loading: false, error: null });
        // Start continuous watching after first grant
        startWatching();
      },
      (err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.code === 1 ? "Location permission denied" : err.message,
        }));
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return { ...state, requestLocation };
}
