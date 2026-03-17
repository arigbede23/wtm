// Instagram Hashtag Event Discovery.
// Searches configured hashtags via the Instagram Graph API,
// then uses OpenAI to extract structured event data from captions.

import OpenAI from "openai";
import type { NormalizedEvent } from "./normalize";
import type { EventCategory } from "@/types";

const IG_BASE = "https://graph.facebook.com/v19.0";
const MAX_AGE_DAYS = 14;

type ExtractedEvent = {
  isEvent: boolean;
  title: string;
  description: string;
  date: string; // ISO string
  endDate: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lng: number | null;
  category: EventCategory;
  isFree: boolean;
  price: number | null;
};

// Generate location-aware hashtags for a city (e.g. "Atlanta" → ["atlantaevents", "atlnightlife", ...])
function cityHashtags(city: string): string[] {
  const c = city.toLowerCase().replace(/[\s.'-]+/g, "");
  return [
    `${c}events`,
    `${c}nightlife`,
    `thingsToDo${city.replace(/[\s.'-]+/g, "")}`,
  ];
}

export async function fetchInstagramEvents(
  cities?: string[]
): Promise<NormalizedEvent[]> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !userId) {
    console.warn(
      "[Sync] Instagram env vars not set, skipping Instagram discovery"
    );
    return [];
  }

  // Build hashtags: from explicit city list, env override, or skip
  let hashtags: string[];
  if (cities && cities.length > 0) {
    hashtags = cities.flatMap(cityHashtags);
  } else if (process.env.INSTAGRAM_HASHTAGS) {
    hashtags = process.env.INSTAGRAM_HASHTAGS.split(",").map((h) => h.trim());
  } else {
    console.warn("[Sync] No cities or INSTAGRAM_HASHTAGS provided, skipping Instagram");
    return [];
  }

  const openai = new OpenAI();
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  const allEvents: NormalizedEvent[] = [];

  for (const hashtag of hashtags) {
    try {
      // Step 1: Search for the hashtag ID
      const searchRes = await fetch(
        `${IG_BASE}/ig_hashtag_search?q=${encodeURIComponent(hashtag)}&user_id=${userId}&access_token=${accessToken}`
      );
      if (!searchRes.ok) {
        console.error(
          `[Sync] Instagram hashtag search failed for #${hashtag}: ${searchRes.status}`
        );
        continue;
      }
      const searchData = await searchRes.json();
      const hashtagId = searchData?.data?.[0]?.id;
      if (!hashtagId) continue;

      // Step 2: Fetch recent media for this hashtag
      const mediaRes = await fetch(
        `${IG_BASE}/${hashtagId}/recent_media?user_id=${userId}&fields=id,caption,timestamp,permalink&access_token=${accessToken}`
      );
      if (!mediaRes.ok) {
        console.error(
          `[Sync] Instagram media fetch failed for #${hashtag}: ${mediaRes.status}`
        );
        continue;
      }
      const mediaData = await mediaRes.json();
      const posts = mediaData?.data ?? [];

      // Step 3: Filter posts
      const validPosts = posts.filter((post: any) => {
        if (!post.caption || post.caption.length < 50) return false;
        const postDate = new Date(post.timestamp);
        return postDate >= cutoff;
      });

      // Step 4: Extract event data from captions using OpenAI
      for (const post of validPosts) {
        try {
          const extracted = await extractEventFromCaption(
            openai,
            post.caption
          );
          if (!extracted || !extracted.isEvent || !extracted.date) continue;

          allEvents.push({
            source: "INSTAGRAM",
            externalId: post.id,
            title: extracted.title,
            description: extracted.description,
            category: extracted.category,
            address: extracted.location,
            city: extracted.city,
            state: extracted.state,
            lat: extracted.lat,
            lng: extracted.lng,
            startDate: extracted.date,
            endDate: extracted.endDate,
            coverImageUrl: null,
            isFree: extracted.isFree,
            price: extracted.price,
            url: post.permalink ?? null,
            status: "PUBLISHED",
          });
        } catch (err) {
          console.error(
            `[Sync] Instagram AI extraction error for post ${post.id}:`,
            err
          );
        }
      }
    } catch (err) {
      console.error(`[Sync] Instagram fetch error for #${hashtag}:`, err);
    }
  }

  console.log(`[Sync] Instagram: extracted ${allEvents.length} events`);
  return allEvents;
}

async function extractEventFromCaption(
  openai: OpenAI,
  caption: string
): Promise<ExtractedEvent | null> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You extract event details from Instagram captions. Respond with JSON.
If the caption describes a specific upcoming event with a date, return:
{
  "isEvent": true,
  "title": "event name",
  "description": "brief description",
  "date": "ISO 8601 date string — if a specific start TIME is mentioned (e.g. '7 PM', '19:00'), include it. If only a date is mentioned with no time, use midnight UTC (e.g. '2026-03-14T00:00:00Z').",
  "endDate": "ISO 8601 with time only if an end time is explicitly stated, otherwise null",
  "location": "venue or address or null",
  "city": "city name or null",
  "state": "two-letter state code or null",
  "lat": approximate latitude of the city as a number, or null if city is unknown,
  "lng": approximate longitude of the city as a number, or null if city is unknown,
  "category": one of "MUSIC","SPORTS","ARTS","FOOD","TECH","SOCIAL","COMEDY","WELLNESS","OUTDOORS","NIGHTLIFE","COMMUNITY","OTHER",
  "isFree": true/false,
  "price": number or null
}
If it's NOT an event (just a photo, ad, meme, etc.), return: { "isEvent": false }
Use the current year (2026) for dates that don't specify a year.`,
      },
      {
        role: "user",
        content: caption,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content) as ExtractedEvent;
  } catch {
    return null;
  }
}
