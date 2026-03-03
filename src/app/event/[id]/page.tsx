export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Share2,
  Bookmark,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import { CATEGORY_EMOJI, type EventCategory } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: event, error } = await supabase
    .from("events")
    .select("*, rsvps(count)")
    .eq("id", params.id)
    .single();

  if (error || !event) {
    notFound();
  }

  const rsvpCount = event.rsvps?.[0]?.count ?? 0;
  const category = event.category as EventCategory;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white dark:bg-gray-950">
      {/* Header Image */}
      <div className="relative">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gray-100 text-6xl dark:bg-gray-800">
            {CATEGORY_EMOJI[category]}
          </div>
        )}

        {/* Back button */}
        <Link
          href="/feed"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Action buttons */}
        <div className="absolute right-4 top-4 flex gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {CATEGORY_EMOJI[category]} {category.toLowerCase()}
        </div>

        {/* Title */}
        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {event.title}
        </h1>

        {/* RSVP Count */}
        {rsvpCount > 0 && (
          <p className="mt-1 text-sm font-medium text-brand-600">
            {rsvpCount} {rsvpCount === 1 ? "person" : "people"} going
          </p>
        )}

        {/* Details */}
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(event.startDate)}
              </p>
              <p className="text-sm text-gray-500">
                {formatTime(event.startDate)}
                {event.endDate && ` – ${formatTime(event.endDate)}`}
              </p>
            </div>
          </div>

          {event.address && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {event.address}
                </p>
                {event.city && (
                  <p className="text-sm text-gray-500">
                    {event.city}
                    {event.state ? `, ${event.state}` : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <DollarSign className="mt-0.5 h-5 w-5 text-gray-400" />
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formatPrice(event.price, event.isFree)}
            </p>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              About
            </h2>
            <p className="mt-2 leading-relaxed text-gray-700 dark:text-gray-300">
              {event.description}
            </p>
          </div>
        )}

        {/* RSVP Button */}
        <div className="mt-8 pb-8">
          <button className="w-full rounded-xl bg-brand-600 py-3.5 text-center font-semibold text-white transition-colors hover:bg-brand-700">
            I&apos;m Going
          </button>
          <button className="mt-2 w-full rounded-xl border border-gray-200 py-3.5 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Interested
          </button>
        </div>
      </div>
    </div>
  );
}
