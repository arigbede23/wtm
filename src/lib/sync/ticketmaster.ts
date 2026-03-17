// Ticketmaster Discovery API v2 client.
// Fetches events near a location and normalizes them for our database.
// Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

import {
  type NormalizedEvent,
  mapTicketmasterCategory,
  pickTicketmasterImage,
} from "./normalize";

const TM_BASE = "https://app.ticketmaster.com/discovery/v2/events.json";
const MAX_PAGES = 5;
const PAGE_SIZE = 200;
const DELAY_MS = 250; // Be polite to their API

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTicketmasterEvents(
  overrideLat?: string,
  overrideLng?: string
): Promise<NormalizedEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.warn("[Sync] TICKETMASTER_API_KEY not set, skipping Ticketmaster");
    return [];
  }

  const lat = overrideLat ?? process.env.SYNC_LAT;
  const lng = overrideLng ?? process.env.SYNC_LNG;

  if (!lat || !lng) {
    console.warn("[Sync] No coordinates provided and no SYNC_LAT/SYNC_LNG set, skipping Ticketmaster");
    return [];
  }

  // 30-day window from now
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const startDateTime = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  const endDateTime = end.toISOString().replace(/\.\d{3}Z$/, "Z");

  const allEvents: NormalizedEvent[] = [];

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const params = new URLSearchParams({
        apikey: apiKey,
        latlong: `${lat},${lng}`,
        radius: "50",
        unit: "miles",
        size: String(PAGE_SIZE),
        page: String(page),
        startDateTime,
        endDateTime,
      });

      const res = await fetch(`${TM_BASE}?${params}`);
      if (!res.ok) {
        console.error(
          `[Sync] Ticketmaster page ${page} failed: ${res.status} ${res.statusText}`
        );
        break;
      }

      const json = await res.json();
      const events = json?._embedded?.events;
      if (!events || events.length === 0) break;

      for (const ev of events) {
        const normalized = normalizeTMEvent(ev);
        if (normalized) allEvents.push(normalized);
      }

      // Check if there are more pages
      const totalPages = json?.page?.totalPages ?? 0;
      if (page + 1 >= totalPages) break;

      if (page < MAX_PAGES - 1) await sleep(DELAY_MS);
    }
  } catch (err) {
    console.error("[Sync] Ticketmaster fetch error:", err);
  }

  console.log(`[Sync] Ticketmaster: fetched ${allEvents.length} events`);
  return allEvents;
}

function normalizeTMEvent(ev: any): NormalizedEvent | null {
  const id = ev.id;
  const title = ev.name;
  if (!id || !title) return null;

  const venue = ev._embedded?.venues?.[0];
  const segment = ev.classifications?.[0]?.segment?.name;
  const genre = ev.classifications?.[0]?.genre?.name;

  // Price info
  const priceRange = ev.priceRanges?.[0];
  const minPrice = priceRange?.min ?? null;
  const isFree = minPrice === 0 || minPrice === null;

  // Build a reliable startDate. If Ticketmaster flags the time as TBD
  // or doesn't provide a dateTime, store a date-only value (midnight UTC)
  // so the UI knows not to display a timestamp.
  const tmStart = ev.dates?.start;
  let startDate: string;
  if (
    tmStart?.dateTime &&
    !tmStart?.timeTBD &&
    !tmStart?.noSpecificTime
  ) {
    startDate = tmStart.dateTime;
  } else if (tmStart?.localDate) {
    // date-only: midnight UTC signals "no specific time"
    startDate = `${tmStart.localDate}T00:00:00Z`;
  } else {
    // No date info at all — skip this event
    return null;
  }

  let endDate: string | null = null;
  const tmEnd = ev.dates?.end;
  if (tmEnd?.dateTime && !tmEnd?.approximate) {
    endDate = tmEnd.dateTime;
  }

  return {
    source: "TICKETMASTER",
    externalId: id,
    title,
    description: ev.info ?? ev.pleaseNote ?? null,
    category: mapTicketmasterCategory(segment, genre),
    address: venue?.address?.line1 ?? null,
    city: venue?.city?.name ?? null,
    state: venue?.state?.stateCode ?? null,
    lat: venue?.location?.latitude
      ? parseFloat(venue.location.latitude)
      : null,
    lng: venue?.location?.longitude
      ? parseFloat(venue.location.longitude)
      : null,
    startDate,
    endDate,
    coverImageUrl: pickTicketmasterImage(ev.images),
    isFree,
    price: isFree ? null : minPrice,
    url: ev.url ?? null,
    status: "PUBLISHED",
  };
}
