import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { mapEntry } from '@/lib/supabase/mappers';
import { entrySchema } from '@/lib/validation/journey';

type EntryRow = Parameters<typeof mapEntry>[0];

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return apiError('DATABASE_ERROR', 'Supabase is not configured.', 503);
  }

  const body = await request.json();
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'VALIDATION_ERROR',
      parsed.error.issues[0]?.message ?? 'Invalid entry data.',
      400,
    );
  }

  const { count, error: countError } = await supabase
    .from('entries')
    .select('id', { count: 'exact', head: true })
    .eq('day_id', parsed.data.dayId);

  if (countError) {
    return apiError('DATABASE_ERROR', 'Unable to prepare moment order.', 500);
  }

  const { data, error } = await supabase
    .from('entries')
    .insert({
      day_id: parsed.data.dayId,
      place: parsed.data.place,
      content: parsed.data.content,
      photo_url: parsed.data.photoUrl || null,
      photo_source: parsed.data.photoUrl ? 'url' : null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (error || !data) {
    return apiError('DATABASE_ERROR', 'Unable to save moment.', 500);
  }

  return NextResponse.json({ entry: mapEntry(data as EntryRow) }, { status: 201 });
}
