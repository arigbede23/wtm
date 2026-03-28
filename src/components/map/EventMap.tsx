// EventMap — Leaflet map showing event markers and user location.
// Must be dynamically imported with { ssr: false } since Leaflet needs the browser DOM.

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useTheme } from "next-themes";
import { formatDate, formatTime } from "@/lib/utils";
import { CATEGORY_EMOJI, type EventCategory, type EventWithCounts } from "@/types";
import { parseMatchup } from "@/lib/sportsTeams";

// Category → brand color for pins
const CATEGORY_COLORS: Record<EventCategory, string> = {
  MUSIC: "#8B5CF6",
  SPORTS: "#10B981",
  ARTS: "#F59E0B",
  FOOD: "#EF4444",
  TECH: "#3B82F6",
  SOCIAL: "#EC4899",
  COMEDY: "#F97316",
  WELLNESS: "#14B8A6",
  OUTDOORS: "#22C55E",
  NIGHTLIFE: "#8B5CF6",
  COMMUNITY: "#6366F1",
  OTHER: "#6B7280",
};

// Build a custom pin icon with category emoji and color
function createEventIcon(category: EventCategory) {
  const color = CATEGORY_COLORS[category] ?? "#6B7280";
  const emoji = CATEGORY_EMOJI[category] ?? "📍";
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
        <div style="
          width:40px;height:40px;
          background:${color};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 10px rgba(0,0,0,0.25);
          border:2.5px solid white;
        ">
          <span style="transform:rotate(45deg);font-size:18px;line-height:1;">${emoji}</span>
        </div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
}

// Memoize icons so we don't recreate them per render
const iconCache = new Map<EventCategory, L.DivIcon>();
function getEventIcon(category: EventCategory) {
  if (!iconCache.has(category)) {
    iconCache.set(category, createEventIcon(category));
  }
  return iconCache.get(category)!;
}

// Pulsing blue dot for user location
const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="
        position:absolute;inset:0;
        background:rgba(66,133,244,0.2);
        border-radius:50%;
        animation:pulse-ring 2s ease-out infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;
        background:#4285f4;
        border:2.5px solid white;
        border-radius:50%;
        box-shadow:0 0 8px rgba(66,133,244,0.5);
      "></div>
    </div>
    <style>
      @keyframes pulse-ring {
        0% { transform:scale(1); opacity:1; }
        100% { transform:scale(2.5); opacity:0; }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Recenter map when user location changes
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

const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export default function EventMap({ events, userLat, userLng }: EventMapProps) {
  const centerLat = userLat ?? 40.7128;
  const centerLng = userLng ?? -74.006;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={11}
      className="h-full w-full"
      zoomControl={false}
    >
      {/* Map tiles — switch between Voyager (light) and Dark Matter (dark) */}
      <TileLayer
        key={isDark ? "dark" : "light"}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url={isDark ? TILE_DARK : TILE_LIGHT}
      />

      {/* Recenter on user */}
      {userLat != null && userLng != null && (
        <RecenterMap lat={userLat} lng={userLng} />
      )}

      {/* User location */}
      {userLat != null && userLng != null && (
        <Marker position={[userLat, userLng]} icon={userLocationIcon}>
          <Popup className="modern-popup">
            <p className="text-sm font-medium">You are here</p>
          </Popup>
        </Marker>
      )}

      {/* Event markers */}
      {events.map((event) => {
        if (event.lat == null || event.lng == null) return null;
        const matchup = event.category === "SPORTS" ? parseMatchup(event.title) : null;
        return (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            icon={getEventIcon(event.category)}
          >
            <Popup className="modern-popup" maxWidth={260} minWidth={220}>
              <Link href={`/event/${event.id}`} className="block -m-1">
                {/* Cover image */}
                {matchup && (matchup.home || matchup.away) ? (
                  <div
                    className="flex h-28 items-center justify-center gap-3 rounded-t-lg -mt-[13px] -mx-[1px]"
                    style={{ marginBottom: 8, width: "calc(100% + 2px)", background: `linear-gradient(to right, ${matchup.home?.color ?? "#333"} 50%, ${matchup.away?.color ?? "#333"} 50%)` }}
                  >
                    {matchup.home ? (
                      <img src={matchup.home.logo} alt={matchup.home.name} className="h-12 w-12 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />
                    ) : <div className="h-12 w-12" />}
                    <span className="text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">vs</span>
                    {matchup.away ? (
                      <img src={matchup.away.logo} alt={matchup.away.name} className="h-12 w-12 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />
                    ) : <div className="h-12 w-12" />}
                  </div>
                ) : event.coverImageUrl ? (
                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="h-28 w-full rounded-t-lg object-cover -mt-[13px] -mx-[1px]"
                    style={{ marginBottom: 8, width: "calc(100% + 2px)" }}
                  />
                ) : null}
                {/* Content */}
                <div className="px-0.5 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{CATEGORY_EMOJI[event.category]}</span>
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-1 font-bold text-sm leading-snug text-gray-900">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(event.startDate)} &middot; {formatTime(event.startDate)}
                  </p>
                  {event.distance != null && (
                    <p className="mt-0.5 text-xs font-medium text-brand-600">
                      {event.distance} mi away
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-600">
                      View details &rarr;
                    </span>
                    {event.isFree ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        FREE
                      </span>
                    ) : event.price ? (
                      <span className="text-xs font-medium text-gray-500">
                        ${event.price}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
