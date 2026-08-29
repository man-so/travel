# WAYLOG

## Overview

WAYLOG is a privacy-first, local-first travel memory assistant. It helps users create a journey, choose an Unsplash cover, generate day sections from trip dates, and save timeline moments with places, notes, coordinates, and optional photos.

The current MVP focuses on a complete web travel journal flow:

Landing -> Create Journey -> Choose Cover -> Save Journey -> Add Moments -> View Timeline -> Open Passport

## Problem

Travel memories often live across camera rolls, map pins, notes, and social apps. WAYLOG keeps the experience private and editorial: the trip, places, dates, and short memories come first, without social feed mechanics.

## Target User

- Travelers who take many photos but do not want to write long travel essays
- People who want a clean archive for trips, places, and feelings
- Users who prefer private memory keeping over social sharing
- Users who want travel history summarized by country and city

## Features

- Editorial landing page
- Journey dashboard with search and empty state
- New journey flow with validation
- Unsplash cover search through a server route
- Cover selection, attribution, and download tracking
- Automatic day generation from start and end dates
- Journey detail timeline
- Add, edit, and delete moments
- Moment photo URL support
- Moment photo upload using browser-side image preparation
- Google Places search for saving place coordinates
- Google Maps view for pinned journey places
- Travel Passport at `/passport`
- Passport Summary for countries, cities, journeys, and moments
- Country Stamp grid with normalized country and city aggregation
- Passport map modal using saved moment coordinates
- Edit and delete journeys with confirmation
- Loading, empty, and error states for core flows

## Architecture

Browser -> Vinext/Next-style UI -> route handlers -> Unsplash API / Supabase helpers

The current interactive MVP stores journeys in browser `localStorage` so the core flow works end-to-end without requiring hosted credentials. Supabase schema, route handlers, and mappers are present for a future server-backed persistence pass, but the current UI keeps the existing local-first storage path.

## Tech Stack

- Vinext / Next-style App Router
- React
- TypeScript
- Tailwind CSS
- Zod
- Supabase client and server helpers
- Unsplash API route handlers
- Google Maps JavaScript API
- Places API (New)

## Journey

Users can create, edit, and delete journeys with destination, country, dates, companion, and an optional Unsplash cover. When a journey is created, WAYLOG generates one day section for each date in the trip.

## Timeline

Journey detail pages show day-by-day moments. Each moment can include:

- Place
- Note
- Optional photo URL
- Optional uploaded photo stored as a browser data URL
- Optional Google Places coordinates

When a moment has a photo, the timeline keeps the visual image layout. When no photo exists, the timeline falls back to a text-first editorial moment instead of showing repeated empty image placeholders.

## Passport

The Travel Passport is available at `/passport`.

Passport data is derived from existing Journey data. There is no separate stamps table in the MVP.

- Countries are counted from normalized `country` values.
- Cities are counted from normalized `destination` values only when the Journey has a country.
- A country appears as one stamp even if the user creates multiple journeys with differently cased names such as `Japan`, `japan`, or `JAPAN`.
- Passport Summary shows country count, city count, journey count, and moment count.
- Country Stamps can open a map modal when saved coordinates exist.

## Google Maps

WAYLOG uses Google Maps only for currently implemented map and place features:

- Journey map display
- Passport country map modal
- Places-based coordinate saving in Moment forms

The API key is read from `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. It is not hardcoded in source files. Current Google Maps Platform settings, allowed APIs, quotas, and billing guardrails are documented in `GOOGLE_MAPS_API_CONFIG.md`.

## Places Coordinates

The Moment form includes a Places search field. WAYLOG fetches limited place fields only after a user selects a place:

- `displayName`
- `formattedAddress`
- `location`

Saved `latitude` and `longitude` values are reused for map pins. WAYLOG does not run background geocoding or repeated coordinate lookups.

## Moment Photo Upload

Moment photo upload is browser-side and optional. Uploaded images are prepared in the browser and stored with the current local Journey record as a data URL. Cloud photo upload is not required to use WAYLOG.

## Privacy Direction

WAYLOG follows a privacy-first and local-first direction:

- Original travel photos should stay on the user's device by default.
- Cloud photo upload must not become a required condition for using WAYLOG.
- Selected Photos Sync can be added later as an opt-in feature.
- Cloud Backup is a future optional feature, not an MVP dependency.
- Web screens should still feel complete when cloud photos are unavailable.

## Future Photo Organizer

The future On-device AI Photo Organizer should be implemented in separate approved phases:

Photo -> EXIF -> GPS -> Journey Context -> Planned / Visited Places -> Rule-based Matching -> On-device Vision -> Confidence -> User Review -> Apply

AI should not be the first processing step. Deterministic metadata such as EXIF, GPS, journey dates, and saved places should be used first. Cloud AI should remain an optional fallback, and AI results should require user review before being applied.

## Unsplash API

Search requests go through `GET /api/unsplash/search?q=Kyoto`. The client never reads `UNSPLASH_ACCESS_KEY`.

When a cover is selected and saved, the app calls `POST /api/unsplash/download` server-side for Unsplash download tracking. If the key is missing or Unsplash fails, the app shows a readable error and offers demo covers so journey creation can continue.

## Database Schema

Planned Supabase tables:

- `journeys`: trip metadata and cover attribution fields
- `days`: generated child rows for each date
- `entries`: place, note, optional photo URL, coordinate fields, and sort order

Relationship: `journeys` -> `days` -> `entries`.

## Environment Variables

Copy `.env.example` and provide the values needed for the APIs you plan to use:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UNSPLASH_ACCESS_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Do not commit `.env.local` or API secrets.

## Local Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test:passport
npm run lint
npm run build
```

## Deployment

The app can be prepared for Vercel with the same production build command:

```bash
npm run build
```

Before deploying, review `VERCEL_DEPLOYMENT_CHECKLIST.md`.

Required Vercel environment variables for the current MVP:

- `UNSPLASH_ACCESS_KEY`: required for Unsplash cover search and download tracking.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: required for Google Maps, Places search, saved coordinates, and map pins.

Optional / future persistence variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The current UI stores Journey data in `localStorage`, so Supabase variables are not required for the local-first MVP user flow. They are kept in `.env.example` because schema, route-handler, and mapper groundwork exists for a later persistence pass.

For Google Maps, add every deployed Vercel URL you plan to use to the API key HTTP referrer restrictions before QA:

- Local development: `http://localhost:3000/*`
- Vercel preview: `https://*.vercel.app/*` or the exact preview domain
- Production domain: `https://your-domain.com/*`
- Optional www domain: `https://www.your-domain.com/*`

Keep API restrictions limited to the APIs currently used by WAYLOG:

- Maps JavaScript API
- Places API (New)

## Current Limitations

- Current Journey persistence is centered on browser `localStorage`.
- Moment photo upload stores prepared images as data URLs in the browser record.
- Large photo volumes can hit browser storage limits.
- Multi-device sync is not supported yet.
- Supabase persistence exists as schema and route-handler groundwork, but the current UI still uses the local-first store.
- Google Maps usage shown in the app is a local reference counter; Google Cloud Console is the source of truth for quota and billing.

## Screenshots

Add screenshots after the first production deployment pass.

## Roadmap

- Production persistence and account-based sync
- Selected Photos Sync as an opt-in feature
- Supabase Storage for selected representative photos
- Supabase Auth
- Shareable journey URLs
- Photo Organizer Phase A: bulk photo selection, local EXIF parsing, journey day grouping
- Photo Organizer Phase B: GPS parsing and journey places matching
- Photo Organizer Phase C: On-device Vision PoC
- Photo Organizer Phase D: Review, edit, approve, and apply to timeline
- Optional Cloud Backup as a future Pro feature
