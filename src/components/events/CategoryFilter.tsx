"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_EMOJI, type EventCategory } from "@/types";

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
  selected: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            selected === cat.value
              ? "bg-brand-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          )}
        >
          {cat.value !== "ALL" && (
            <span>{CATEGORY_EMOJI[cat.value as EventCategory]}</span>
          )}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
