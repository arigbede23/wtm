// OG Image API — generates a branded 1200x630 PNG card for any event.
// Used by social media crawlers (og:image) and the share feature.
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image

import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { CATEGORY_EMOJI, type EventCategory } from "@/types";

export const runtime = "edge";

// Cache images for 1 hour, revalidate in background for 24 hours
export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: event } = await supabase
    .from("events")
    .select("title, category, startDate, endDate, city, state, coverImageUrl, address")
    .eq("id", params.id)
    .single();

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const category = event.category as EventCategory;
  const emoji = CATEGORY_EMOJI[category] ?? "✨";
  const categoryLabel = category.charAt(0) + category.slice(1).toLowerCase();

  // Format the date in UTC so it's deterministic (no timezone drift on the edge)
  const startDate = new Date(
    event.startDate.endsWith("Z") ? event.startDate : event.startDate + "Z"
  );
  const dateStr = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const hours = startDate.getUTCHours();
  const minutes = startDate.getUTCMinutes();
  const isMidnight = hours === 0 && minutes === 0;
  const timeStr = isMidnight
    ? null
    : startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      });

  const location = [event.city, event.state].filter(Boolean).join(", ");

  // Truncate long titles so they don't overflow the card
  const title =
    event.title.length > 80 ? event.title.slice(0, 77) + "..." : event.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Background layer */}
        {event.coverImageUrl ? (
          // Blurred cover image as background
          <img
            src={event.coverImageUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200",
              height: "630",
              objectFit: "cover",
              filter: "blur(20px) brightness(0.3)",
            }}
          />
        ) : null}

        {/* Dark gradient overlay (always present — sits on top of blurred image) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200",
            height: "630",
            display: "flex",
            background: event.coverImageUrl
              ? "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(64,5,14,0.8) 100%)"
              : "linear-gradient(135deg, #0a0a0a 0%, #40050e 50%, #1a0a0a 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "60px",
          }}
        >
          {/* Top section: category pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: "24px",
                color: "white",
              }}
            >
              <span>{emoji}</span>
              <span>{categoryLabel}</span>
            </div>
          </div>

          {/* Middle: title + details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                fontSize: title.length > 50 ? "48px" : "56px",
                fontWeight: 700,
                color: "white",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>

            {/* Date & time */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "28px",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              <span>📅</span>
              <span>{dateStr}</span>
              {timeStr ? (
                <span style={{ color: "rgba(255,255,255,0.5)" }}>
                  {" "}
                  · {timeStr}
                </span>
              ) : null}
            </div>

            {/* Location */}
            {location ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "26px",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                <span>📍</span>
                <span>{location}</span>
              </div>
            ) : null}
          </div>

          {/* Bottom: branding */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                fontWeight: 800,
                color: "#C8102E",
                letterSpacing: "-0.03em",
              }}
            >
              wtm?
            </div>
            <div
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Find events near you
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
