// FilterBar — row of toggle pills for filtering events.
// Includes "Free only" and "This week" toggles.

"use client";

import { cn } from "@/lib/utils";
import type { EventFilters } from "@/types";

export function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: EventFilters;
  onFilterChange: (updates: Partial<EventFilters>) => void;
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
    </div>
  );
}
