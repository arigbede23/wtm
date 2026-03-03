// Shared TypeScript types used across the app.
// These define the "shape" of our data so TypeScript can catch errors early.

// All possible event categories (must match the Prisma enum)
export type EventCategory =
  | "MUSIC"
  | "SPORTS"
  | "ARTS"
  | "FOOD"
  | "TECH"
  | "SOCIAL"
  | "COMEDY"
  | "WELLNESS"
  | "OUTDOORS"
  | "NIGHTLIFE"
  | "COMMUNITY"
  | "OTHER";

// The shape of an event as returned by our /api/events endpoint.
// Includes a _count field with the number of RSVPs.
export type EventWithCounts = {
  id: string;
  title: string;
  description: string | null;     // null means the field is empty
  category: EventCategory;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  startDate: string;              // ISO date string, e.g. "2026-03-14T18:00:00Z"
  endDate: string | null;
  coverImageUrl: string | null;
  isFree: boolean;
  price: number | null;
  url: string | null;
  status: string;
  _count: {
    rsvps: number;                // How many people have RSVP'd
  };
};

// Emoji for each category — used on event cards and detail pages
export const CATEGORY_EMOJI: Record<EventCategory, string> = {
  MUSIC: "🎵",
  SPORTS: "⚽",
  ARTS: "🎨",
  FOOD: "🍕",
  TECH: "💻",
  SOCIAL: "👋",
  COMEDY: "😂",
  WELLNESS: "🧘",
  OUTDOORS: "🌲",
  NIGHTLIFE: "🌙",
  COMMUNITY: "🤝",
  OTHER: "✨",
};
