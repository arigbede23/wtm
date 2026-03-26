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

  // On mount: restore cache for instant display, then get a fresh position
  useEffect(() => {
    // 1. Restore cache so we have something immediately (avoids blank state)
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { lat, lng } = JSON.parse(cached);
        setState({ lat, lng, loading: true, error: null });
      }
    } catch {
      // ignore
    }

    // 2. Always request a fresh position on every app open.
    // maximumAge: 0 forces the browser to get a new GPS fix instead of
    // returning a stale cached position.
    if (navigator.geolocation) {
      setState((s) => ({ ...s, loading: true }));

      // Try high accuracy first, fall back to low accuracy if it fails
      const onSuccess = (position: GeolocationPosition) => {
        const { latitude: lat, longitude: lng } = position.coords;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
        setState({ lat, lng, loading: false, error: null });
        startWatching();
      };

      const onError = (err: GeolocationPositionError) => {
        // If high accuracy timed out, retry with low accuracy (WiFi/IP-based)
        if (err.code === 3) {
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            (fallbackErr) => {
              setState((s) => ({
                ...s,
                loading: false,
                error: fallbackErr.code === 1 ? "Location permission denied" : null,
              }));
              if (fallbackErr.code !== 1) startWatching();
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
          return;
        }

        setState((s) => ({
          ...s,
          loading: false,
          error: err.code === 1 ? "Location permission denied" : null,
        }));
        if (err.code !== 1) startWatching();
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  return { ...state, requestLocation };
}
