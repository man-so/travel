import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ ok: false });
  }

  const body = (await request.json()) as { downloadLocation?: string };
  if (!body.downloadLocation) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Download location is required.' } },
      { status: 400 },
    );
  }

  try {
    await fetch(body.downloadLocation, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
