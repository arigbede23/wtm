// useGeolocation — provides the user's current location via the browser Geolocation API.
// Caches the position in localStorage so it's available instantly on subsequent loads.
// Does NOT auto-request; the user must explicitly grant permission via requestLocation().

"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "wtm-user-location";

type GeoState = {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>(() => {
    // Try to restore cached location from localStorage on init
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const { lat, lng } = JSON.parse(cached);
          return { lat, lng, loading: false, error: null };
        }
      } catch {
        // ignore parse errors
      }
    }
    return { lat: null, lng: null, loading: false, error: null };
  });

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
      },
      (err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.code === 1 ? "Location permission denied" : err.message,
        }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, requestLocation };
}
