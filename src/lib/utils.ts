// Utility functions used across the app.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// cn() — combines CSS class names intelligently.
// It merges Tailwind classes so conflicting ones don't clash.
// Example: cn("px-4 py-2", isActive && "bg-blue-500", "px-6")
//   → "py-2 bg-blue-500 px-6" (px-6 overrides px-4)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ensure a date string is treated as UTC — some stored dates are missing
// the trailing "Z", which causes JS to parse them as local time.
function toUTC(date: Date | string): Date {
  if (typeof date === "string" && !date.endsWith("Z") && !date.includes("+")) {
    return new Date(date + "Z");
  }
  return new Date(date);
}

// Format a date as "Mon, Mar 14"
export function formatDate(date: Date | string) {
  return toUTC(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

// Format a time as "6:00 PM CT", optionally in a specific timezone.
// Includes short timezone abbreviation so users know what timezone is shown.
export function formatTime(date: Date | string, timeZone?: string) {
  const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  return toUTC(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: tz,
  });
}

// Returns true if the time portion is exactly 00:00:00 UTC,
// meaning the API didn't provide a specific time (date-only event).
// Only reliable for imported events — user-created events can land on
// midnight UTC by coincidence (e.g., 7 PM CDT = midnight UTC).
export function isTimeMidnight(date: Date | string): boolean {
  const d = toUTC(date);
  return (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0
  );
}

// Smart date+time formatter.
// For imported events (source != USER), hides time when it's midnight UTC
// (sentinel for "date only"). For user-created events, always shows time.
export function formatEventDateTime(
  date: Date | string,
  options?: { timeZone?: string; source?: string }
): string {
  const formatted = formatDate(date);
  const isImported = options?.source && options.source !== "USER";
  if (isImported && isTimeMidnight(date)) return formatted;
  return `${formatted} · ${formatTime(date, options?.timeZone)}`;
}

// Returns true if the event has already ended (or started, if no endDate)
export function isEventPast(
  startDate: Date | string,
  endDate?: Date | string | null
): boolean {
  const now = Date.now();
  if (endDate) return new Date(endDate).getTime() < now;
  return new Date(startDate).getTime() < now;
}

// Calculate distance in miles between two lat/lng points using the Haversine formula
export function getDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format a date as relative time: "just now", "2m ago", "3h ago", "5d ago"
export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  // Supabase timestamps lack timezone suffix — treat as UTC
  const dateStr = typeof date === "string" && !date.endsWith("Z") && !date.includes("+") ? date + "Z" : date;
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// Format price as "Free", "$25", or "See price" when unknown
export function formatPrice(price: number | null, isFree: boolean) {
  if (isFree) return "Free";
  if (price != null && price > 0) return `$${price.toFixed(0)}`;
  // Price data is missing — don't claim it's free
  return "See price";
}

// Build a Google Calendar "Add Event" URL from event data
export function buildCalendarUrl(event: {
  title: string;
  startDate: string;
  endDate?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  description?: string | null;
}): string {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const start = fmt(event.startDate);
  const end = event.endDate ? fmt(event.endDate) : fmt(event.startDate);

  const location = [event.address, event.city, event.state]
    .filter(Boolean)
    .join(", ");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });
  if (location) params.set("location", location);
  if (event.description) params.set("details", event.description);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Format friend names for "X is going" text on event cards
export function friendsGoingText(
  friends: { displayName: string | null; username: string | null }[]
): string {
  const names = friends.map(
    (f) => f.displayName ?? f.username ?? "Someone"
  );
  if (names.length === 1) return `${names[0]} is going`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are going`;
  return `${names[0]} and ${names.length - 1} others are going`;
}

// Build a Google Maps directions URL from event location data
export function buildDirectionsUrl(event: {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
}): string | null {
  if (event.lat != null && event.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`;
  }
  const addr = [event.address, event.city, event.state]
    .filter(Boolean)
    .join(", ");
  if (addr) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  }
  return null;
}
