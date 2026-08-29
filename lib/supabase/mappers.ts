import type { Companion, CoverPhoto, Day, Entry, Journey } from '@/types/journey';

type EntryRow = {
  id: string;
  day_id: string;
  place: string;
  content: string | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

type DayRow = {
  id: string;
  journey_id: string;
  day_number: number;
  date: string;
  title: string | null;
  summary: string | null;
  created_at: string;
  entries?: EntryRow[];
};

export type JourneyRow = {
  id: string;
  title: string;
  destination: string;
  country: string | null;
  start_date: string;
  end_date: string;
  companion: Companion | null;
  cover_url: string | null;
  cover_unsplash_id: string | null;
  cover_photographer_name: string | null;
  cover_photographer_username: string | null;
  cover_photographer_url: string | null;
  cover_unsplash_url: string | null;
  cover_download_location: string | null;
  created_at: string;
  updated_at: string;
  days?: DayRow[];
};

export function mapEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    dayId: row.day_id,
    place: row.place,
    content: row.content ?? '',
    photoUrl: row.photo_url ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDay(row: DayRow): Day {
  return {
    id: row.id,
    journeyId: row.journey_id,
    dayNumber: row.day_number,
    date: row.date,
    title: row.title ?? undefined,
    summary: row.summary ?? undefined,
    entries: (row.entries ?? []).map(mapEntry).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function mapJourney(row: JourneyRow): Journey {
  const cover = row.cover_url
    ? ({
        url: row.cover_url,
        unsplashId: row.cover_unsplash_id ?? undefined,
        photographerName: row.cover_photographer_name ?? undefined,
        photographerUsername: row.cover_photographer_username ?? undefined,
        photographerUrl: row.cover_photographer_url ?? undefined,
        unsplashUrl: row.cover_unsplash_url ?? undefined,
        downloadLocation: row.cover_download_location ?? undefined,
      } satisfies CoverPhoto)
    : undefined;

  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    country: row.country ?? '',
    startDate: row.start_date,
    endDate: row.end_date,
    companion: row.companion ?? 'solo',
    cover,
    days: (row.days ?? []).map(mapDay).sort((a, b) => a.dayNumber - b.dayNumber),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
