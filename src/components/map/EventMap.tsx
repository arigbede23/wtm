// EventMap — Leaflet map showing event markers and user location.
// Must be dynamically imported with { ssr: false } since Leaflet needs the browser DOM.

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import { CATEGORY_EMOJI, type EventWithCounts } from "@/types";

// Fix Leaflet default icon path issue (icons not loading in bundled apps)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Blue dot icon for user location
const userLocationIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#4285f4;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(66,133,244,0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to recenter the map when user location changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

type EventMapProps = {
  events: (EventWithCounts & { distance?: number })[];
  userLat?: number | null;
  userLng?: number | null;
};

export default function EventMap({ events, userLat, userLng }: EventMapProps) {
  // Default center: user location or NYC
  const centerLat = userLat ?? 40.7128;
  const centerLng = userLng ?? -74.006;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Recenter when user location updates */}
      {userLat != null && userLng != null && (
        <RecenterMap lat={userLat} lng={userLng} />
      )}

      {/* User location blue dot */}
      {userLat != null && userLng != null && (
        <>
          <Marker position={[userLat, userLng]} icon={userLocationIcon}>
            <Popup>You are here</Popup>
          </Marker>
          <Circle
            center={[userLat, userLng]}
            radius={200}
            pathOptions={{
              color: "#4285f4",
              fillColor: "#4285f4",
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
        </>
      )}

      {/* Event markers */}
      {events.map((event) => {
        if (event.lat == null || event.lng == null) return null;
        return (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="text-xs text-gray-500">
                  {CATEGORY_EMOJI[event.category]} {event.category.toLowerCase()}
                </p>
                <p className="mt-0.5 font-semibold text-sm leading-tight">
                  {event.title}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  {formatDate(event.startDate)} &middot; {formatTime(event.startDate)}
                </p>
                {event.distance != null && (
                  <p className="text-xs text-blue-600">{event.distance} mi away</p>
                )}
                <Link
                  href={`/event/${event.id}`}
                  className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
                >
                  View details &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
