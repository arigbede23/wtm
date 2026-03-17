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

// Filters that can be applied when fetching events
export type EventFilters = {
  category?: EventCategory;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number; // miles
  isFree?: boolean;
  dateFrom?: string;
  dateTo?: string;
  datePreset?: string; // tracks which date filter button is active
};

// Public user profile shape
export type UserProfile = {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
};

// Notification types (must match Prisma enum)
export type NotificationType = "NEW_FOLLOWER" | "FRIEND_GOING" | "FRIEND_INTERESTED" | "EVENT_UPDATED" | "EVENT_INVITE";

// A single notification as returned by the API
export type NotificationItem = {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  event?: {
    id: string;
    title: string;
  } | null;
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
