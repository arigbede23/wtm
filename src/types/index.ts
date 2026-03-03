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

export type EventWithCounts = {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  startDate: string;
  endDate: string | null;
  coverImageUrl: string | null;
  isFree: boolean;
  price: number | null;
  url: string | null;
  status: string;
  _count: {
    rsvps: number;
  };
};

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
