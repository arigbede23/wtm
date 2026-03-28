// Eventbrite sync — uses their public destination search API.
// No API key needed; uses a CSRF token from the search page.
// Fetches events by place IDs for major US metros.

import { type NormalizedEvent } from "./normalize";
import type { EventCategory } from "@/types";

const EB_SEARCH_URL = "https://www.eventbrite.com/api/v3/destination/search/";
const EB_PAGE_URL = "https://www.eventbrite.com/d/united-states/events/";
const MAX_PAGES = 4;
const PAGE_SIZE = 50;
const DELAY_MS = 500;

// Who's On First place IDs for major US metros
const METRO_PLACE_IDS: Record<string, string> = {
  "New York": "85977539",
  "Los Angeles": "85923517",
  "Chicago": "85940195",
  "Houston": "101725629",
  "Miami": "85933669",
  "Atlanta": "85936429",
  "Dallas": "101724385",
  "San Francisco": "85922583",
  "Seattle": "101730401",
  "Boston": "85950361",
  "Denver": "85928879",
  "Nashville": "101723183",
  "Austin": "101724577",
  "Phoenix": "85917479",
  "Philadelphia": "101718083",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch(EB_PAGE_URL, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
    });
    if (!res.ok) return null;
    // Get CSRF from cookie header
    const setCookie = res.headers.get("set-cookie") ?? "";
    const match = setCookie.match(/csrftoken=([^;]+)/);
    if (match) return match[1];
    // Fallback: get from HTML
    const html = await res.text();
    const htmlMatch = html.match(/name='csrfmiddlewaretoken'\s+value='([^']+)'/);
    return htmlMatch?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function fetchEventbriteEvents(): Promise<NormalizedEvent[]> {
  const csrfToken = await getCsrfToken();
  if (!csrfToken) {
    console.warn("[Sync] Could not get Eventbrite CSRF token, skipping");
    return [];
  }

  const allEvents: NormalizedEvent[] = [];
  const seenIds = new Set<string>();

  // Fetch for each metro
  for (const [city, placeId] of Object.entries(METRO_PLACE_IDS)) {
    try {
      const events = await fetchPlaceEvents(placeId, csrfToken);
      for (const ev of events) {
        if (!seenIds.has(ev.externalId)) {
          seenIds.add(ev.externalId);
          allEvents.push(ev);
        }
      }
    } catch (err) {
      console.error(`[Sync] Eventbrite ${city} error:`, err);
    }
    await sleep(DELAY_MS);
  }

  console.log(`[Sync] Eventbrite: fetched ${allEvents.length} events`);
  return allEvents;
}

async function fetchPlaceEvents(
  placeId: string,
  csrfToken: string
): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = [];
  let continuation: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const body: any = {
      event_search: {
        dates: "current_future",
        dedup: true,
        places: [placeId],
        page_size: PAGE_SIZE,
        page: page + 1,
      },
      "expand.destination_event": [
        "primary_venue",
        "image",
        "ticket_availability",
      ],
    };

    if (continuation) {
      body.event_search.continuation = continuation;
    }

    const res = await fetch(EB_SEARCH_URL, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
        "Content-Type": "application/json",
        Referer: "https://www.eventbrite.com/d/united-states/events/",
        "X-CSRFToken": csrfToken,
        Cookie: `csrftoken=${csrfToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`[Sync] Eventbrite place ${placeId} page ${page + 1} failed: ${res.status}`);
      break;
    }

    const json = await res.json();
    const results = json?.events?.results;
    if (!results || results.length === 0) break;

    for (const ev of results) {
      const normalized = normalizeEBEvent(ev);
      if (normalized) events.push(normalized);
    }

    const pagination = json?.events?.pagination;
    if (!pagination?.continuation || page + 1 >= (pagination?.page_count ?? 0)) break;
    continuation = pagination.continuation;

    if (page < MAX_PAGES - 1) await sleep(DELAY_MS);
  }

  return events;
}

// Map Eventbrite tags to our categories
const EB_TAG_MAP: Record<string, EventCategory> = {
  "EventbriteCategory/103": "MUSIC",
  "EventbriteCategory/108": "SPORTS",
  "EventbriteCategory/105": "ARTS",
  "EventbriteCategory/110": "FOOD",
  "EventbriteCategory/102": "TECH",
  "EventbriteCategory/107": "WELLNESS",
  "EventbriteCategory/109": "OUTDOORS",
  "EventbriteCategory/113": "COMMUNITY",
  "EventbriteSubCategory/13003": "COMEDY",
  "EventbriteSubCategory/13004": "NIGHTLIFE",
};

function mapEBCategory(tags?: Array<{ tag: string }>): EventCategory {
  if (!tags) return "OTHER";
  for (const t of tags) {
    if (t.tag.startsWith("EventbriteSubCategory/") && EB_TAG_MAP[t.tag]) {
      return EB_TAG_MAP[t.tag];
    }
  }
  for (const t of tags) {
    if (t.tag.startsWith("EventbriteCategory/") && EB_TAG_MAP[t.tag]) {
      return EB_TAG_MAP[t.tag];
    }
  }
  return "OTHER";
}

function normalizeEBEvent(ev: any): NormalizedEvent | null {
  const id = ev.id ?? ev.eventbrite_event_id;
  const title = ev.name;
  if (!id || !title) return null;
  if (ev.is_online_event) return null;

  const venue = ev.primary_venue;
  const addr = venue?.address;
  const lat = addr?.latitude ? parseFloat(addr.latitude) : null;
  const lng = addr?.longitude ? parseFloat(addr.longitude) : null;

  const startDate =
    ev.start_date && ev.start_time
      ? `${ev.start_date}T${ev.start_time}:00`
      : ev.start_date
        ? `${ev.start_date}T00:00:00`
        : null;
  if (!startDate) return null;

  const endDate =
    ev.end_date && ev.end_time
      ? `${ev.end_date}T${ev.end_time}:00`
      : null;

  const ta = ev.ticket_availability ?? {};
  const isFree = ta.is_free === true;
  const minPrice = ta.minimum_ticket_price?.value
    ? ta.minimum_ticket_price.value / 100
    : null;

  return {
    source: "EVENTBRITE",
    externalId: String(id),
    title,
    description: ev.summary ?? null,
    category: mapEBCategory(ev.tags),
    address: null,
    city: addr?.city ?? null,
    state: addr?.region ?? null,
    lat,
    lng,
    startDate,
    endDate,
    coverImageUrl: ev.image?.url ?? null,
    isFree,
    price: isFree ? null : minPrice,
    url: ev.url ?? null,
    status: "PUBLISHED",
  };
}
