# WAYLOG Vercel Deployment Checklist

Use this checklist before publishing the current WAYLOG MVP.

## 1. Scope

This deployment is for the current local-first MVP:

- Landing
- Dashboard
- Journey CRUD
- Unsplash cover search and tracking
- Timeline moments
- Moment photo URL and browser-side photo upload
- Google Places coordinate saving
- Google Journey Map
- Travel Passport
- Country Stamp map modal

Do not include the future Photo Organizer, Bulk Photo Import, On-device AI, Cloud AI, Cloud Backup, auth, payments, achievements, or a persistence migration in this deployment pass.

## 2. Required Vercel Environment Variables

Register these in Vercel Project Settings -> Environment Variables.

```bash
UNSPLASH_ACCESS_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Notes:

- `UNSPLASH_ACCESS_KEY` is server-side only and is used by `/api/unsplash/search` and `/api/unsplash/download`.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is public by design because Google Maps JavaScript API runs in the browser.
- Do not paste real API keys into source files, README examples, screenshots, or committed docs.

## 3. Optional / Future Environment Variables

These are present for future Supabase-backed persistence work, but the current UI still uses browser `localStorage`.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

For the current MVP deployment, leave these unset unless you are intentionally testing the existing Supabase route groundwork.

## 4. Google Cloud Console Setup

Before testing a deployed URL, update the Google Maps API key restrictions.

Allowed APIs:

- Maps JavaScript API
- Places API (New)

HTTP referrers:

- `http://localhost:3000/*`
- Vercel preview domain, either exact preview URL or `https://*.vercel.app/*`
- Production domain, for example `https://your-domain.com/*`
- Optional www domain, for example `https://www.your-domain.com/*`

Current quota guardrails are documented in `GOOGLE_MAPS_API_CONFIG.md`.

## 5. Build Commands

Run locally before pushing:

```bash
npm install
npm run test:passport
npm run lint
npm run build
```

Recommended Vercel settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output/start settings: keep the framework defaults unless the deployed runtime requires custom Vinext handling.

## 6. Preview QA

After Vercel creates a preview deployment, test the preview URL on mobile and desktop.

Required screens:

- Landing
- Dashboard
- New Journey
- Journey Detail
- Timeline
- Passport
- Country Stamp map modal
- Google Journey Map

Required flows:

- Create a Journey with destination, country, dates, and Unsplash cover.
- Add a Moment with text only.
- Add a Moment with an uploaded photo.
- Select a Google Place and confirm coordinates are saved.
- Reload the page and confirm Journey, Moment, photo data URL, Passport, and coordinates persist.
- Open Journey Map and confirm pins render.
- Open Passport and confirm country/city counts are correct.

## 7. Post-Deployment Checks

After the first production deployment:

- Confirm Unsplash search works from the production domain.
- Confirm Unsplash download tracking does not block Journey creation if tracking fails.
- Confirm Google Maps loads under the production domain referrer.
- Confirm Places search works under the production domain referrer.
- Check Google Cloud Metrics for Maps JavaScript API and Places API usage.
- Check Google Cloud Billing alerts and confirm the budget alert is still enabled.

## 8. Current MVP Limitations

- Journey persistence is browser `localStorage` centered.
- Moment uploaded photos are stored as browser data URLs.
- Large photo volumes may hit browser storage limits.
- Multi-device sync is not supported yet.
- Supabase schema and route groundwork exists, but the current user-facing flow is local-first.
- Google Maps usage shown in the app is a local reference counter; Google Cloud Console is the source of truth for quota and billing.

## 9. Deployment Decision

The MVP is ready for Vercel preview deployment when all are true:

- `npm run test:passport` passes.
- `npm run lint` passes.
- `npm run build` passes.
- Vercel has `UNSPLASH_ACCESS_KEY`.
- Vercel has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- Google Cloud HTTP referrers include the Vercel preview or production URL being tested.
