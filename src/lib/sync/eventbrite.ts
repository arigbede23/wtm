// Eventbrite API client — org-based polling.
// Since Eventbrite deprecated public search in 2020, we poll specific
// organization IDs for their live events.
// Docs: https://www.eventbrite.com/platform/api

import { type NormalizedEvent, mapEventbriteCategory } from "./normalize";

const EB_BASE = "https://www.eventbriteapi.com/v3";

export async function fetchEventbriteEvents(): Promise<NormalizedEvent[]> {
  const token = process.env.EVENTBRITE_TOKEN;
  const orgIds = process.env.EVENTBRITE_ORG_IDS;

  if (!token || !orgIds) {
    console.warn(
      "[Sync] EVENTBRITE_TOKEN or EVENTBRITE_ORG_IDS not set, skipping Eventbrite"
    );
    return [];
  }

  const organizations = orgIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const allEvents: NormalizedEvent[] = [];

  for (const orgId of organizations) {
    try {
      const events = await fetchOrgEvents(orgId, token);
      allEvents.push(...events);
    } catch (err) {
      console.error(`[Sync] Eventbrite org ${orgId} error:`, err);
      // Continue to next org
    }
  }

  console.log(`[Sync] Eventbrite: fetched ${allEvents.length} events`);
  return allEvents;
}

async function fetchOrgEvents(
  orgId: string,
  token: string
): Promise<NormalizedEvent[]> {
  const events: NormalizedEvent[] = [];
  let continuation: string | null = null;

  do {
    const params = new URLSearchParams({
      status: "live",
      time_filter: "current_future",
      expand: "venue",
      order_by: "start_asc",
    });
    if (continuation) {
      params.set("continuation", continuation);
    }

    const res = await fetch(
      `${EB_BASE}/organizations/${orgId}/events/?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      console.error(
        `[Sync] Eventbrite org ${orgId} page failed: ${res.status} ${res.statusText}`
      );
      break;
    }

    const json = await res.json();
    const pageEvents = json.events;
    if (!pageEvents || pageEvents.length === 0) break;

    for (const ev of pageEvents) {
      const normalized = normalizeEBEvent(ev);
      if (normalized) events.push(normalized);
    }

    // Eventbrite uses continuation tokens for pagination
    continuation = json.pagination?.has_more_items
      ? json.pagination.continuation
      : null;
  } while (continuation);

  return events;
}

function normalizeEBEvent(ev: any): NormalizedEvent | null {
  const id = ev.id;
  const title = ev.name?.text;
  if (!id || !title) return null;

  const venue = ev.venue;
  const isFree = ev.is_free ?? true;

  return {
    source: "EVENTBRITE",
    externalId: String(id),
    title,
    description: ev.description?.text ?? ev.summary ?? null,
    category: mapEventbriteCategory(ev.category_id),
    address: venue?.address?.address_1 ?? null,
    city: venue?.address?.city ?? null,
    state: venue?.address?.region ?? null,
    lat: venue?.latitude ? parseFloat(venue.latitude) : null,
    lng: venue?.longitude ? parseFloat(venue.longitude) : null,
    startDate: ev.start?.utc ?? new Date().toISOString(),
    endDate: ev.end?.utc ?? null,
    coverImageUrl: ev.logo?.original?.url ?? ev.logo?.url ?? null,
    isFree,
    price: null, // EB doesn't include price in list endpoint
    url: ev.url ?? null,
    status: "PUBLISHED",
  };
}
