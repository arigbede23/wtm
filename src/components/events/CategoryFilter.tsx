// CategoryFilter — horizontal scrolling row of category filter pills.

"use client";

import { cn } from "@/lib/utils";
import type { EventCategory } from "@/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

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
      {categories.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            )}
          >
            {cat.value !== "ALL" && <CategoryIcon category={cat.value} className="h-3.5 w-3.5" />}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
