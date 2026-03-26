// EventDateTime — client component for displaying event date/time.
// Must be a client component so it uses the browser's timezone,
// not the server's (which is UTC on Vercel).

"use client";

import { formatDate, formatTime, isTimeMidnight } from "@/lib/utils";

type EventDateTimeProps = {
  startDate: string;
  endDate?: string | null;
  isExternal?: boolean;
};

export function EventDateTime({ startDate, endDate, isExternal }: EventDateTimeProps) {
  const hideTime = isExternal && isTimeMidnight(startDate);

  return (
    <div>
      <p className="font-medium text-gray-900 dark:text-white">
        {formatDate(startDate)}
      </p>
      {!hideTime && (
        <p className="text-sm text-gray-500">
          {formatTime(startDate)}
          {endDate && !(isExternal && isTimeMidnight(endDate)) && ` – ${formatTime(endDate)}`}
        </p>
      )}
    </div>
  );
}
