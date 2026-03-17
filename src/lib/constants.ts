// Shared constants used across the app.

import type { EventCategory } from "@/types";

// Interest categories — used in onboarding and profile editing
export const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "MUSIC", label: "Music" },
  { value: "SPORTS", label: "Sports" },
  { value: "ARTS", label: "Arts" },
  { value: "FOOD", label: "Food & Drink" },
  { value: "TECH", label: "Tech" },
  { value: "SOCIAL", label: "Social" },
  { value: "COMEDY", label: "Comedy" },
  { value: "WELLNESS", label: "Wellness" },
  { value: "OUTDOORS", label: "Outdoors" },
  { value: "NIGHTLIFE", label: "Nightlife" },
  { value: "COMMUNITY", label: "Community" },
];
