// FilterBar — row of toggle pills for filtering events.
// Includes "Free only" and date range toggles.

"use client";

import { cn } from "@/lib/utils";
import type { EventFilters } from "@/types";

type DatePreset = "this-week" | "this-weekend" | "this-month";

export function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: EventFilters;
  onFilterChange: (updates: Partial<EventFilters>) => void;
}) {
  const activePreset = (filters.datePreset as DatePreset) ?? null;

  const getRange = (preset: DatePreset) => {
    const now = new Date();
    const end = new Date(now);

    switch (preset) {
      case "this-week": {
        const daysUntilSunday = 7 - now.getDay();
        end.setDate(now.getDate() + daysUntilSunday);
        break;
      }
      case "this-weekend": {
        const dayOfWeek = now.getDay();
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        end.setDate(now.getDate() + daysUntilSunday);
        break;
      }
      case "this-month": {
        end.setMonth(end.getMonth() + 1, 0);
        break;
      }
    }

    end.setHours(23, 59, 59, 999);
    return { dateFrom: now.toISOString(), dateTo: end.toISOString(), datePreset: preset };
  };

  const togglePreset = (preset: DatePreset) => {
    if (activePreset === preset) {
      onFilterChange({ dateFrom: undefined, dateTo: undefined, datePreset: undefined });
    } else {
      onFilterChange(getRange(preset));
    }
  };

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

      {/* This Weekend toggle */}
      <button
        onClick={() => togglePreset("this-weekend")}
        className={cn(
          "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
          activePreset === "this-weekend"
            ? "bg-brand-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        )}
      >
        This weekend
      </button>

      {/* This week toggle */}
      <button
        onClick={() => togglePreset("this-week")}
        className={cn(
          "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
          activePreset === "this-week"
            ? "bg-brand-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        )}
      >
        This week
      </button>

      {/* This month toggle */}
      <button
        onClick={() => togglePreset("this-month")}
        className={cn(
          "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
          activePreset === "this-month"
            ? "bg-brand-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        )}
      >
        This month
      </button>
    </div>
  );
}
