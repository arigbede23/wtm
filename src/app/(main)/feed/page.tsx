import { EventList } from "@/components/events/EventList";

export default function FeedPage() {
  return (
    <div>
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Happening near you
        </h2>
        <p className="text-sm text-gray-500">
          Events and things to do this week
        </p>
      </div>
      <EventList />
    </div>
  );
}
