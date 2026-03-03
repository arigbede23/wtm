// CategoryFilter — horizontal scrolling row of category filter pills.
// Lets users filter events by type (Music, Food, Sports, etc.).
// Used on the feed page (functionality will be wired up in Phase 2).

"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_EMOJI, type EventCategory } from "@/types";

// List of categories to show as filter buttons
const categories: { value: EventCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "MUSIC", label: "Music" },
  { value: "FOOD", label: "Food" },
  { value: "SPORTS", label: "Sports" },
  { value: "ARTS", label: "Arts" },
  { value: "TECH", label: "Tech" },
  { value: "SOCIAL", label: "Social" },
  { value: "COMEDY", label: "Comedy" },
  { value: "WELLNESS", label: "Wellness" },
  { value: "OUTDOORS", label: "Outdoors" },
  { value: "NIGHTLIFE", label: "Nightlife" },
  { value: "COMMUNITY", label: "Community" },
];

export function CategoryFilter({
  selected,
  onChange,
}: {
  selected: string;               // Currently selected category
  onChange: (category: string) => void;  // Called when user taps a category
}) {
  return (
    // "no-scrollbar" hides the scrollbar but keeps horizontal scroll working
    // "overflow-x-auto" enables horizontal scrolling when pills overflow
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={cn(
            // "shrink-0" prevents pills from squishing when the row overflows
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            selected === cat.value
              ? "bg-brand-600 text-white"           // Active: filled blue
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          )}
        >
          {/* Show emoji for all categories except "All" */}
          {cat.value !== "ALL" && (
            <span>{CATEGORY_EMOJI[cat.value as EventCategory]}</span>
          )}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
