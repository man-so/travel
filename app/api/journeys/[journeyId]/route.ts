import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { mapJourney, type JourneyRow } from '@/lib/supabase/mappers';
import { journeySchema } from '@/lib/validation/journey';
import type { CoverPhoto } from '@/types/journey';

type RouteContext = {
  params: Promise<{ journeyId: string }>;
};

type UpdateJourneyBody = {
  title?: string;
  destination?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  companion?: string;
  cover?: CoverPhoto;
};

export async function GET(_request: Request, context: RouteContext) {
  const { journeyId } = await context.params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return apiError('DATABASE_ERROR', 'Supabase is not configured.', 503);
  }

  const { data, error } = await supabase
    .from('journeys')
    .select('*, days(*, entries(*))')
    .eq('id', journeyId)
    .single();

  if (error || !data) {
    return apiError('NOT_FOUND', 'Journey not found.', 404);
  }

  return NextResponse.json({ journey: mapJourney(data as JourneyRow) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { journeyId } = await context.params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return apiError('DATABASE_ERROR', 'Supabase is not configured.', 503);
  }

  const body = (await request.json()) as UpdateJourneyBody;
  const parsed = journeySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'VALIDATION_ERROR',
      parsed.error.issues[0]?.message ?? 'Invalid journey data.',
      400,
    );
  }

  const cover = body.cover;
  const { error } = await supabase
    .from('journeys')
    .update({
      title: parsed.data.title || parsed.data.destination,
      destination: parsed.data.destination,
      country: parsed.data.country ?? '',
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      companion: parsed.data.companion,
      cover_url: cover?.url,
      cover_unsplash_id: cover?.unsplashId,
      cover_photographer_name: cover?.photographerName,
      cover_photographer_username: cover?.photographerUsername,
      cover_photographer_url: cover?.photographerUrl,
      cover_unsplash_url: cover?.unsplashUrl,
      cover_download_location: cover?.downloadLocation,
    })
    .eq('id', journeyId);

  if (error) {
    return apiError('DATABASE_ERROR', 'Unable to update journey.', 500);
  }

  const { data, error: loadError } = await supabase
    .from('journeys')
    .select('*, days(*, entries(*))')
    .eq('id', journeyId)
    .single();

  if (loadError || !data) {
    return apiError('NOT_FOUND', 'Journey not found.', 404);
  }

  return NextResponse.json({ journey: mapJourney(data as JourneyRow) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { journeyId } = await context.params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return apiError('DATABASE_ERROR', 'Supabase is not configured.', 503);
  }

  const { error } = await supabase.from('journeys').delete().eq('id', journeyId);
  if (error) {
    return apiError('DATABASE_ERROR', 'Unable to delete journey.', 500);
  }

  return NextResponse.json({ ok: true });
}
