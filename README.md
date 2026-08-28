# WAYLOG

## Overview

WAYLOG is a mobile-first visual travel diary. Users create a journey, choose a cover image, generate day sections from the trip dates, and save moments with places, notes, and optional photo URLs.

## Problem

Travelers often keep photos, places, and small memories scattered across apps. WAYLOG gives each trip a quiet, editorial record without social feed mechanics.

## Target User

- Travelers who take many photos but do not want to write long travel essays
- People who want a clean archive for trips, places, and feelings
- Users who prefer private memory keeping over social sharing

## Features

- Editorial landing page
- Journey dashboard with search and empty state
- New journey flow with validation
- Unsplash cover search through a server route
- Cover selection and attribution
- Automatic day generation from start and end dates
- Journey detail timeline
- Add, edit, and delete moments
- Edit and delete journeys with confirmation
- Loading, empty, and error states for the core flows

## Architecture

Browser -> Vinext/Next UI -> route handlers -> Unsplash API

The prototype stores journey records in browser localStorage so it works end-to-end without credentials. Supabase client helpers are included for moving persistence to PostgreSQL when project keys are available.

## Tech Stack

- Vinext / Next-style App Router
- React
- TypeScript
- Tailwind CSS
- Zod
- Supabase client helpers
- Unsplash API route handlers

## Unsplash API

Search requests go through `GET /api/unsplash/search?q=Kyoto`. The client never reads `UNSPLASH_ACCESS_KEY`. When a cover is selected and saved, the app calls `POST /api/unsplash/download` server-side for Unsplash download tracking.

If the key is missing or Unsplash fails, the app shows a readable error and offers demo covers so journey creation can continue.

## Database Schema

Planned Supabase tables:

- `journeys`: trip metadata and cover attribution fields
- `days`: generated child rows for each date
- `entries`: place, note, optional photo URL, and sort order

Relationship: `journeys` -> `days` -> `entries`.

## Environment Variables

Copy `.env.example` and provide:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UNSPLASH_ACCESS_KEY=
```

## Local Development

```bash
npm install
npm run dev
```

## Deployment

The app is scaffolded as an OpenAI Sites project and can be built with:

```bash
npm run build
```

Set hosted runtime values for Supabase and Unsplash before using production APIs.

## Screenshots

Add screenshots after the first deployed production pass.

## Known Limitations

- Current journey persistence is localStorage rather than Supabase PostgreSQL.
- User photo upload is not implemented.
- Auth, maps, GPS, AI summaries, sharing, and payments are intentionally outside MVP scope.

## Roadmap

- Supabase-backed Journey, Day, and Entry APIs
- Supabase Storage image uploads
- Supabase Auth
- Shareable journey URLs
- Map view
- AI trip summary and essay generation
