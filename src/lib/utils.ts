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

// Format a date as "Mon, Mar 14"
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Format a time as "6:00 PM"
export function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
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

// Format price as "Free" or "$25"
export function formatPrice(price: number | null, isFree: boolean) {
  if (isFree) return "Free";
  if (!price) return "Free";
  return `$${price.toFixed(0)}`;
}
