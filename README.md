# wtm? — What's The Move?

A local event discovery app that aggregates real events from Ticketmaster and Eventbrite alongside user-created events. Built with Next.js, Supabase, and Tailwind CSS.

**Live:** [wtm-one.vercel.app](https://wtm-one.vercel.app)

## Features

- **Event Feed** — Browse upcoming events with filtering by category, search, price, and date range
- **Map View** — See events plotted on an interactive Leaflet map with geolocation
- **Event Creation** — Authenticated users can create and publish their own events
- **RSVP System** — Mark events as Going, Interested, or Not Going
- **Bookmarks** — Save events for later
- **API Aggregation** — Auto-imports events from Ticketmaster (location-based) and Eventbrite (org-based)
- **Auth** — Email/password authentication via Supabase Auth

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Maps:** Leaflet + React Leaflet
- **State:** Zustand + TanStack Query
- **ORM:** Prisma (schema & migrations)
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables (copy and fill in your keys)
cp .env.example .env.local

# Push database schema
npx prisma db push

# Run dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL connection string (direct) |
| `TICKETMASTER_API_KEY` | Ticketmaster Discovery API key |
| `EVENTBRITE_TOKEN` | Eventbrite private token (optional) |
| `EVENTBRITE_ORG_IDS` | Comma-separated Eventbrite org IDs (optional) |
| `CRON_SECRET` | Secret for authenticating sync requests |
| `SYNC_LAT` | Latitude for event sync center (default: NYC) |
| `SYNC_LNG` | Longitude for event sync center (default: NYC) |

## Syncing Events

Trigger a sync manually:

```bash
curl -X POST https://wtm-one.vercel.app/api/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

This fetches events from Ticketmaster (50mi radius, 30-day window) and Eventbrite (configured orgs), upserts them into the database, and cleans up past imported events.

## Project Structure

```
src/
  app/           — Next.js pages and API routes
    api/
      events/    — Event CRUD
      rsvp/      — RSVP management
      saved-events/ — Bookmarks
      sync/      — External API sync endpoint
  components/    — React components
  hooks/         — Custom React hooks
  lib/
    supabase/    — Supabase client setup
    sync/        — Ticketmaster & Eventbrite clients + normalization
  stores/        — Zustand state stores
  types/         — TypeScript type definitions
prisma/
  schema.prisma  — Database schema
```
