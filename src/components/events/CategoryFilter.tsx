// CategoryFilter — horizontal scrolling row of category filter pills.
// Lets users filter events by type (Music, Food, Sports, etc.).

"use client";

import { cn } from "@/lib/utils";
import type { EventCategory } from "@/types";
import {
  Music,
  Trophy,
  Palette,
  UtensilsCrossed,
  Monitor,
  Users,
  Laugh,
  Heart,
  TreePine,
  Moon,
  Handshake,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<EventCategory, LucideIcon> = {
  MUSIC: Music,
  SPORTS: Trophy,
  ARTS: Palette,
  FOOD: UtensilsCrossed,
  TECH: Monitor,
  SOCIAL: Users,
  COMEDY: Laugh,
  WELLNESS: Heart,
  OUTDOORS: TreePine,
  NIGHTLIFE: Moon,
  COMMUNITY: Handshake,
  OTHER: Music,
};

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
        const Icon = cat.value !== "ALL" ? CATEGORY_ICONS[cat.value as EventCategory] : null;
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
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
