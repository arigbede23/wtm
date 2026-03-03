// Normalization layer for external event APIs.
// Converts Ticketmaster and Eventbrite responses into a common shape
// that matches our events table columns.

import type { EventCategory } from "@/types";

// The shape we insert/upsert into the events table.
// Matches column names from the Prisma schema.
export type NormalizedEvent = {
  source: "TICKETMASTER" | "EVENTBRITE" | "INSTAGRAM";
  externalId: string;
  title: string;
  description: string | null;
  category: EventCategory;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  startDate: string; // ISO string
  endDate: string | null;
  coverImageUrl: string | null;
  isFree: boolean;
  price: number | null;
  url: string | null;
  status: "PUBLISHED";
};

// --- Ticketmaster category mapping ---
// TM uses "segment" (top-level) and "genre" (sub-level).
// Map to our EventCategory enum.
export function mapTicketmasterCategory(
  segmentName?: string,
  genreName?: string
): EventCategory {
  const segment = segmentName?.toLowerCase();
  const genre = genreName?.toLowerCase();

  if (segment === "music") return "MUSIC";
  if (segment === "sports") return "SPORTS";
  if (segment === "arts & theatre") {
    if (genre === "comedy") return "COMEDY";
    return "ARTS";
  }
  if (segment === "film") return "ARTS";
  if (segment === "family") return "COMMUNITY";
  return "OTHER";
}

// --- Eventbrite category mapping ---
// EB uses numeric category IDs.
// https://www.eventbrite.com/platform/api#/reference/categories
const EB_CATEGORY_MAP: Record<string, EventCategory> = {
  "103": "MUSIC",
  "108": "SPORTS",
  "105": "ARTS",
  "110": "FOOD",
  "102": "TECH",
  "107": "WELLNESS",
  "109": "OUTDOORS",
  "113": "COMMUNITY",
};

export function mapEventbriteCategory(
  categoryId?: string | null
): EventCategory {
  if (!categoryId) return "OTHER";
  return EB_CATEGORY_MAP[categoryId] ?? "OTHER";
}

// --- Ticketmaster image picker ---
// TM returns multiple images with different ratios and sizes.
// Prefer 16:9 ratio at a reasonable width for cover images.
export function pickTicketmasterImage(
  images?: Array<{ url: string; ratio?: string; width?: number }>
): string | null {
  if (!images || images.length === 0) return null;

  // Prefer 16_9 images, then pick the widest one
  const wideImages = images
    .filter((img) => img.ratio === "16_9")
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));

  if (wideImages.length > 0) return wideImages[0].url;

  // Fallback: pick the largest image available
  const sorted = [...images].sort(
    (a, b) => (b.width ?? 0) - (a.width ?? 0)
  );
  return sorted[0].url;
}
