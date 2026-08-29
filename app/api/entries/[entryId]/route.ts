import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '@/lib/api';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import { mapEntry } from '@/lib/supabase/mappers';

type RouteContext = {
  params: Promise<{ entryId: string }>;
};

type EntryRow = Parameters<typeof mapEntry>[0];

const updateEntrySchema = z.object({
  place: z.string().trim().min(1, 'Place is required.'),
  content: z.string().max(2000).default(''),
  photoUrl: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function PATCH(request: Request, context: RouteContext) {
  const { entryId } = await context.params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return apiError('DATABASE_ERROR', 'Supabase is not configured.', 503);
  }

  const body = await request.json();
  const parsed = updateEntrySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'VALIDATION_ERROR',
      parsed.error.issues[0]?.message ?? 'Invalid entry data.',
      400,
    );
  }

  const { data, error } = await supabase
    .from('entries')
    .update({
      place: parsed.data.place,
      content: parsed.data.content,
      photo_url: parsed.data.photoUrl || null,
      photo_source: parsed.data.photoUrl ? 'url' : null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
    })
    .eq('id', entryId)
    .select()
    .single();

  if (error || !data) {
    return apiError('DATABASE_ERROR', 'Unable to update moment.', 500);
  }

  return NextResponse.json({ entry: mapEntry(data as EntryRow) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { entryId } = await context.params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return apiError('DATABASE_ERROR', 'Supabase is not configured.', 503);
  }

  const { error } = await supabase.from('entries').delete().eq('id', entryId);
  if (error) {
    return apiError('DATABASE_ERROR', 'Unable to delete moment.', 500);
  }

  return NextResponse.json({ ok: true });
}
