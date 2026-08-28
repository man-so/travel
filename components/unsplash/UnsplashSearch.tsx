'use client';

import { useState } from 'react';
import { Camera, Check, Search } from 'lucide-react';
import type { CoverPhoto } from '@/types/journey';
import type { UnsplashPhoto } from '@/types/unsplash';

const fallbackPhotos: UnsplashPhoto[] = [
  {
    id: 'fallback-kyoto',
    width: 1800,
    height: 1200,
    color: '#cabfa8',
    blurHash: null,
    urls: {
      small: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      regular: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      full: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80',
    },
    photographer: {
      name: 'Unsplash',
      username: 'unsplash',
      profileUrl: 'https://unsplash.com/?utm_source=waylog&utm_medium=referral',
    },
    unsplashUrl: 'https://unsplash.com/?utm_source=waylog&utm_medium=referral',
    downloadLocation: '',
  },
  {
    id: 'fallback-beach',
    width: 1800,
    height: 1200,
    color: '#7db7d9',
    blurHash: null,
    urls: {
      small: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      regular: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      full: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
    },
    photographer: {
      name: 'Unsplash',
      username: 'unsplash',
      profileUrl: 'https://unsplash.com/?utm_source=waylog&utm_medium=referral',
    },
    unsplashUrl: 'https://unsplash.com/?utm_source=waylog&utm_medium=referral',
    downloadLocation: '',
  },
];

function toCover(photo: UnsplashPhoto): CoverPhoto {
  return {
    url: photo.urls.regular,
    unsplashId: photo.id,
    photographerName: photo.photographer.name,
    photographerUsername: photo.photographer.username,
    photographerUrl: photo.photographer.profileUrl,
    unsplashUrl: photo.unsplashUrl,
    downloadLocation: photo.downloadLocation,
  };
}

export function UnsplashSearch({
  destination,
  selected,
  onSelect,
}: {
  destination: string;
  selected?: CoverPhoto;
  onSelect: (cover?: CoverPhoto) => void;
}) {
  const [query, setQuery] = useState(destination);
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchPhotos() {
    const searchQuery = query.trim() || destination.trim();
    if (!searchQuery) {
      setError('Add a destination first.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/unsplash/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message ?? 'We could not load travel photos.');
      }
      setPhotos(data.results);
    } catch (searchError) {
      setPhotos(fallbackPhotos);
      setError(
        searchError instanceof Error
          ? `${searchError.message} Showing demo covers instead.`
          : 'We could not load travel photos. Showing demo covers instead.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-lg bg-black/5 px-4">
          <Search size={20} className="text-muted-foreground" />
          <span className="sr-only">Unsplash search query</span>
          <input
            className="w-full bg-transparent outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search destination photos"
            value={query}
          />
        </label>
        <button
          className="min-h-12 rounded-full bg-foreground px-6 text-sm font-bold text-background disabled:opacity-50"
          disabled={isLoading}
          onClick={searchPhotos}
          type="button"
        >
          {isLoading ? 'Searching beautiful places...' : 'Find cover'}
        </button>
      </div>
      {error ? (
        <div className="rounded-lg border border-border bg-white p-4 text-sm text-muted-foreground">
          {error}
          <button className="ml-3 font-bold text-accent" onClick={() => onSelect(undefined)} type="button">
            Continue without a cover
          </button>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => {
          const active = selected?.unsplashId === photo.id;
          return (
            <button
              className="group relative aspect-[4/3] overflow-hidden rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-accent"
              key={photo.id}
              onClick={() => onSelect(toCover(photo))}
              type="button"
            >
              <img
                alt={`Travel cover from ${photo.photographer.name}`}
                className="h-full w-full object-cover transition group-hover:scale-105"
                src={photo.urls.small}
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-xs text-white">
                Photo by {photo.photographer.name} on Unsplash
              </span>
              {active ? (
                <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white">
                  <Check size={20} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {photos.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
          <Camera className="mb-3" />
          Search when you are ready to choose a cover.
        </div>
      ) : null}
    </section>
  );
}
