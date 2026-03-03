// FilterBar — row of toggle pills for filtering events.
// Includes "Free only", "This week", and distance dropdown.

"use client";

import { cn } from "@/lib/utils";
import type { EventFilters } from "@/types";

const DISTANCE_OPTIONS = [
  { label: "5 mi", value: 5 },
  { label: "10 mi", value: 10 },
  { label: "25 mi", value: 25 },
  { label: "50 mi", value: 50 },
];

export function FilterBar({
  filters,
  onFilterChange,
  hasLocation,
}: {
  filters: EventFilters;
  onFilterChange: (updates: Partial<EventFilters>) => void;
  hasLocation: boolean;
}) {
  // Calculate "this week" date range (today through end of Sunday)
  const getThisWeekRange = () => {
    const now = new Date();
    const end = new Date(now);
    const daysUntilSunday = 7 - now.getDay();
    end.setDate(now.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
    return {
      dateFrom: now.toISOString(),
      dateTo: end.toISOString(),
    };
  };

  const isThisWeek = !!filters.dateTo;

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
      {/* Free only toggle */}
      <button
        onClick={() =>
          onFilterChange({ isFree: filters.isFree ? undefined : true })
        }
        className={cn(
          "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
          filters.isFree
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        )}
      >
        Free only
      </button>

      {/* This week toggle */}
      <button
        onClick={() => {
          if (isThisWeek) {
            onFilterChange({
              dateFrom: undefined,
              dateTo: undefined,
            });
          } else {
            onFilterChange(getThisWeekRange());
          }
        }}
        className={cn(
          "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
          isThisWeek
            ? "bg-brand-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        )}
      >
        This week
      </button>

      {/* Distance options — only show when user has granted location */}
      {hasLocation &&
        DISTANCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              onFilterChange({
                radius:
                  filters.radius === opt.value ? undefined : opt.value,
              })
            }
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filters.radius === opt.value
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {opt.label}
          </button>
        ))}
    </div>
  );
}
