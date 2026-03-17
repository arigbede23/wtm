// useGeolocation — provides the user's current location via the browser Geolocation API.
// Caches the position in localStorage so it's available instantly on subsequent loads.
// Does NOT auto-request; the user must explicitly grant permission via requestLocation().

"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "wtm-user-location-v2";

type GeoState = {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
};

export function useGeolocation() {
  // Always start with null so server and client initial render match.
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    loading: false,
    error: null,
  });

  // Restore cached location from localStorage after mount (avoids hydration mismatch),
  // then auto-refresh if permission was already granted so we don't serve stale coords.
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { lat, lng } = JSON.parse(cached);
        setState({ lat, lng, loading: false, error: null });
      }
    } catch {
      // ignore parse errors
    }

    // If permission is already granted, silently refresh in the background
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude: lat, longitude: lng } = position.coords;
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
              setState({ lat, lng, loading: false, error: null });
            },
            () => {},
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        }
      }).catch(() => {});
    }
  }, []);

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
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, requestLocation };
}
