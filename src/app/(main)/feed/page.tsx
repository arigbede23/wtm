// Feed Page — the main screen users see when they open the app.
// Shows a heading and a scrollable list of event cards.

import { EventList } from "@/components/events/EventList";

export default function FeedPage() {
  return (
    <div>
      {/* Page heading */}
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Happening near you
        </h2>
        <p className="text-sm text-gray-500">
          Events and things to do this week
        </p>
      </div>
      {/* EventList fetches events from the API and renders cards */}
      <EventList />
    </div>
  );
}
