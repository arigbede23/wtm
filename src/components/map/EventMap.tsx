// EventMap — Leaflet map showing event markers and user location.
// Must be dynamically imported with { ssr: false } since Leaflet needs the browser DOM.

"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useTheme } from "next-themes";
import { formatDate, formatTime } from "@/lib/utils";
import { type EventCategory, type EventWithCounts } from "@/types";
import { parseMatchup, findTeamInTitle } from "@/lib/sportsTeams";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

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

// SVG paths for category icons (Lucide-style, 24x24 viewBox)
const CATEGORY_SVG: Record<EventCategory, string> = {
  MUSIC: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  SPORTS: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  ARTS: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  FOOD: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  TECH: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  SOCIAL: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  COMEDY: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  WELLNESS: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  OUTDOORS: '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14"/><path d="m7 14 5.6-6.2a1 1 0 0 1 1.5 0L17 11"/><path d="M12 2v4"/>',
  NIGHTLIFE: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  COMMUNITY: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 0 3 3l1.5-1.5"/><path d="m18 11-1.5 1.5"/><path d="M3 7v6h6"/><path d="M21 17v-6h-6"/>',
  OTHER: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
};

// Build a custom pin icon with category SVG and color
function createEventIcon(category: EventCategory) {
  const color = CATEGORY_COLORS[category] ?? "#6B7280";
  const svg = CATEGORY_SVG[category] ?? CATEGORY_SVG.OTHER;
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
          <svg style="transform:rotate(45deg);" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>
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
        const hasRealImage = event.coverImageUrl && !event.coverImageUrl.includes("/dam/c/");
        const matchup = event.category === "SPORTS" ? parseMatchup(event.title) : null;
        const singleTeam = !matchup && !hasRealImage ? findTeamInTitle(event.title) : null;
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
                    className="flex h-28 items-center justify-center gap-4 rounded-t-lg -mt-[13px] -mx-[1px]"
                    style={{ marginBottom: 8, width: "calc(100% + 2px)", background: `linear-gradient(to right, ${matchup.home?.color ?? "#333"} 50%, ${matchup.away?.color ?? "#333"} 50%)` }}
                  >
                    {matchup.home ? (
                      <img src={matchup.home.logo} alt={matchup.home.name} className="h-14 w-14 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                    ) : <div className="h-14 w-14" />}
                    {matchup.away ? (
                      <img src={matchup.away.logo} alt={matchup.away.name} className="h-14 w-14 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                    ) : <div className="h-14 w-14" />}
                  </div>
                ) : singleTeam ? (
                  <div
                    className="flex h-28 items-center justify-center rounded-t-lg -mt-[13px] -mx-[1px]"
                    style={{ marginBottom: 8, width: "calc(100% + 2px)", background: singleTeam.color }}
                  >
                    <img src={singleTeam.logo} alt={singleTeam.name} className="h-14 w-14 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
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
                    <CategoryIcon category={event.category} className="h-3.5 w-3.5" />
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
