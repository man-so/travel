import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api';
import { dayCount, formatDateKey } from '@/lib/dates';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { mapJourney, type JourneyRow } from '@/lib/supabase/mappers';
import { journeySchema } from '@/lib/validation/journey';
import type { CoverPhoto } from '@/types/journey';

type CreateJourneyBody = {
  title?: string;
  destination?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  companion?: string;
  cover?: CoverPhoto;
};

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return apiError('DATABASE_ERROR', 'Supabase is not configured.', 503);
  }

  const { data, error } = await supabase
    .from('journeys')
    .select('*, days(*, entries(*))')
    .order('created_at', { ascending: false });

  if (error) {
    return apiError('DATABASE_ERROR', 'Unable to load journeys.', 500);
  }

  return NextResponse.json({ data: (data as JourneyRow[]).map(mapJourney) });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return apiError('DATABASE_ERROR', 'Supabase is not configured.', 503);
  }

  const body = (await request.json()) as CreateJourneyBody;
  const parsed = journeySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      'VALIDATION_ERROR',
      parsed.error.issues[0]?.message ?? 'Invalid journey data.',
      400,
    );
  }

  const journeyPayload = parsed.data;
  const cover = body.cover;
  const { data: journey, error: journeyError } = await supabase
    .from('journeys')
    .insert({
      title: journeyPayload.title || journeyPayload.destination,
      destination: journeyPayload.destination,
      country: journeyPayload.country ?? '',
      start_date: journeyPayload.startDate,
      end_date: journeyPayload.endDate,
      companion: journeyPayload.companion,
      cover_url: cover?.url,
      cover_unsplash_id: cover?.unsplashId,
      cover_photographer_name: cover?.photographerName,
      cover_photographer_username: cover?.photographerUsername,
      cover_photographer_url: cover?.photographerUrl,
      cover_unsplash_url: cover?.unsplashUrl,
      cover_download_location: cover?.downloadLocation,
    })
    .select()
    .single();

  if (journeyError || !journey) {
    return apiError('DATABASE_ERROR', 'Unable to create journey.', 500);
  }

  const start = new Date(`${journeyPayload.startDate}T00:00:00`);
  const days = Array.from(
    { length: dayCount(journeyPayload.startDate, journeyPayload.endDate) },
    (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        journey_id: journey.id,
        day_number: index + 1,
        date: formatDateKey(date),
      };
    },
  );

  const { error: daysError } = await supabase.from('days').insert(days);
  if (daysError) {
    await supabase.from('journeys').delete().eq('id', journey.id);
    return apiError('DATABASE_ERROR', 'Unable to create journey days.', 500);
  }

  if (cover?.downloadLocation && process.env.UNSPLASH_ACCESS_KEY) {
    fetch(cover.downloadLocation, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    }).catch(() => undefined);
  }

  const { data: created, error: loadError } = await supabase
    .from('journeys')
    .select('*, days(*, entries(*))')
    .eq('id', journey.id)
    .single();

  if (loadError || !created) {
    return apiError(
      'DATABASE_ERROR',
      'Journey was created but could not be loaded.',
      500,
    );
  }

  return NextResponse.json(
    { journey: mapJourney(created as JourneyRow) },
    { status: 201 },
  );
}
