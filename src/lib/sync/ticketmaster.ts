// Ticketmaster Discovery API v2 client.
// Fetches events near a location and normalizes them for our database.
// Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

import {
  type NormalizedEvent,
  mapTicketmasterCategory,
  pickTicketmasterImage,
} from "./normalize";

const TM_BASE = "https://app.ticketmaster.com/discovery/v2/events.json";
const MAX_PAGES = 10;
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
        radius: "100",
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

  // Enrich generic placeholder images with real ones from iTunes/Wikipedia
  await enrichImages(allEvents);

  console.log(`[Sync] Ticketmaster: fetched ${allEvents.length} events`);
  return allEvents;
}

// Generic TM category placeholders all live under /dam/c/
function isGenericImage(url: string): boolean {
  return url.includes("/dam/c/") || (url.includes("/dam/a/") && url.includes("SOURCE"));
}

// Pick the best available image for the event.
// For music events, attraction/artist photos are usually the best cover.
// For other categories (arts, sports, theatre, etc.), the event's own images
// are more accurate — attraction images may belong to unrelated performers
// sharing the same venue listing.
function pickBestImage(ev: any): string | null {
  const segment = ev.classifications?.[0]?.segment?.name?.toLowerCase();
  const isMusic = segment === "music";
  const attractions = ev._embedded?.attractions;

  if (isMusic) {
    // Music: prefer artist/attraction images (high-quality photos)
    if (attractions) {
      for (const attr of attractions) {
        const img = pickTicketmasterImage(attr.images);
        if (img && !isGenericImage(img)) return img;
      }
    }
    // Then try event images
    const eventImg = pickTicketmasterImage(ev.images);
    if (eventImg && !isGenericImage(eventImg)) return eventImg;
    return eventImg;
  }

  // Non-music: prefer event images (show posters, game graphics, etc.)
  const eventImg = pickTicketmasterImage(ev.images);
  if (eventImg && !isGenericImage(eventImg)) return eventImg;

  // Fall back to attraction images only if the attraction name matches the event title,
  // to avoid picking images from unrelated performers at the same venue.
  if (attractions) {
    const titleLower = (ev.name ?? "").toLowerCase();
    for (const attr of attractions) {
      const attrName = (attr.name ?? "").toLowerCase();
      if (titleLower.includes(attrName) || attrName.includes(titleLower)) {
        const img = pickTicketmasterImage(attr.images);
        if (img && !isGenericImage(img)) return img;
      }
    }
  }

  // Fall back to whatever we have (may be generic)
  return eventImg;
}

// Search external APIs for a better cover image.
// For music events, Deezer artist photos are a great match.
// For non-music (theatre, sports, etc.), Deezer would return unrelated artists
// with similar names, so we skip it and go straight to iTunes/Wikipedia.
async function findImageForTitle(title: string, category: string): Promise<string | null> {
  // Clean title: remove "(Touring)", "VIP", dates, suffixes, etc.
  const clean = title
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s*[-–—].*$/, "")
    .replace(/\s*(VIP|M&G|add-on|Access Pass|Premium|Seating|Parking|Suite|Suites?)\s*/gi, "")
    .trim();

  if (!clean || clean.length < 3) return null;

  const isMusic = category === "MUSIC";

  // 1. Deezer — only for music events (artist search returns wrong results for shows/plays)
  if (isMusic) {
    try {
      const deezerRes = await fetch(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(clean)}`
      );
      if (deezerRes.ok) {
        const data = await deezerRes.json();
        const artist = data.data?.[0];
        if (artist?.picture_xl) return artist.picture_xl;
        if (artist?.picture_big) return artist.picture_big;
      }
    } catch {}
  }

  try {
    // 2. iTunes — covers music, movies, TV shows, broadway
    const itunesRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(clean)}&media=all&entity=musicArtist,album,movie,tvShow&limit=3`
    );
    if (itunesRes.ok) {
      const data = await itunesRes.json();
      for (const result of data.results ?? []) {
        const art = result.artworkUrl100 ?? result.artworkUrl60;
        if (art) return art.replace(/\d+x\d+/, "600x600");
      }
    }
  } catch {}

  try {
    // 3. Wikipedia — fallback for shows, plays, festivals
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean.replace(/\s+/g, "_"))}`
    );
    if (wikiRes.ok) {
      const data = await wikiRes.json();
      const img = data.originalimage?.source ?? data.thumbnail?.source;
      if (img) return img;
    }
  } catch {}

  return null;
}

// Enrich events that have generic images with better ones from iTunes/Wikipedia
async function enrichImages(events: NormalizedEvent[]): Promise<void> {
  const BATCH = 10;
  const generics = events.filter(
    (e) => e.coverImageUrl && isGenericImage(e.coverImageUrl)
  );

  // Process in small batches to avoid hammering APIs
  for (let i = 0; i < generics.length; i += BATCH) {
    const batch = generics.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((e) => findImageForTitle(e.title, e.category))
    );
    for (let j = 0; j < batch.length; j++) {
      if (results[j]) batch[j].coverImageUrl = results[j];
    }
    if (i + BATCH < generics.length) await sleep(300);
  }
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
  const isFree = minPrice === 0;

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
    // Ticketmaster dateTime is UTC — ensure it has a Z suffix so JS
    // doesn't misinterpret it as local time when parsing.
    startDate = tmStart.dateTime.endsWith("Z")
      ? tmStart.dateTime
      : tmStart.dateTime + "Z";
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
    endDate = tmEnd.dateTime.endsWith("Z")
      ? tmEnd.dateTime
      : tmEnd.dateTime + "Z";
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
    coverImageUrl: pickBestImage(ev),
    isFree,
    price: isFree ? null : minPrice,
    url: ev.url ?? null,
    status: "PUBLISHED",
  };
}
