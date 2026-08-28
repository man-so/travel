import { NextResponse } from 'next/server';
import { normalizeUnsplashPhoto } from '@/lib/unsplash/normalize';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const page = searchParams.get('page') ?? '1';

  if (!query) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Search query is required.' } },
      { status: 400 },
    );
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: { code: 'UNSPLASH_ERROR', message: 'Unsplash is not configured.' } },
      { status: 503 },
    );
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('per_page', '12');
  url.searchParams.set('content_filter', 'high');
  url.searchParams.set('page', page);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: { code: 'UNSPLASH_ERROR', message: 'Unable to search photos.' } },
        { status: response.status },
      );
    }

    const data = (await response.json()) as { results: Parameters<typeof normalizeUnsplashPhoto>[0][] };
    return NextResponse.json({ results: data.results.map(normalizeUnsplashPhoto) });
  } catch {
    return NextResponse.json(
      { error: { code: 'UNSPLASH_ERROR', message: 'Unable to search photos.' } },
      { status: 500 },
    );
  }
}
