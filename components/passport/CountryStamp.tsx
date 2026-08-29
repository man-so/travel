import { CalendarDays, MapPin } from 'lucide-react';
import type { PassportCountry } from '@/types/passport';

const countryFlags: Record<string, string> = {
  australia: 'AU',
  canada: 'CA',
  china: 'CN',
  france: 'FR',
  germany: 'DE',
  italy: 'IT',
  japan: 'JP',
  korea: 'KR',
  'south korea': 'KR',
  spain: 'ES',
  thailand: 'TH',
  'united kingdom': 'GB',
  uk: 'GB',
  'united states': 'US',
  usa: 'US',
  vietnam: 'VN',
};

function countryCode(country: string) {
  const key = country.trim().toLowerCase();
  return countryFlags[key] ?? country.slice(0, 2).toUpperCase();
}

function formatStampDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(`${date}T00:00:00`))
    .toUpperCase();
}

export function CountryStamp({
  country,
  onOpenMap,
}: {
  country: PassportCountry;
  onOpenMap: () => void;
}) {
  const pinnedPlaces = country.mapPlaces.length;

  return (
    <button
      aria-label={`Open ${country.country} passport map`}
      className="group relative min-h-[290px] overflow-hidden rounded-lg border border-foreground/15 bg-card p-6 text-left text-foreground transition hover:-translate-y-1 hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
      onClick={onOpenMap}
      type="button"
    >
      {country.coverUrl ? (
        <>
          <img
            alt={`${country.country} journey cover`}
            className="absolute inset-0 h-full w-full object-cover"
            src={country.coverUrl}
          />
          <div className="absolute inset-0 bg-white/78" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/65 to-background/55" />
        </>
      ) : (
        <div className="absolute inset-0 border-2 border-dashed border-foreground/35" />
      )}
      <div className="absolute right-5 top-5 flex h-16 w-16 rotate-6 items-center justify-center rounded-full border-2 border-accent text-lg font-black text-accent">
        {countryCode(country.country)}
      </div>
      <div className="relative">
        <p className="pr-20 text-sm font-black uppercase tracking-[0.28em] text-accent">
          {formatStampDate(country.firstVisitedAt)}
        </p>
        <h2 className="mt-6 break-words font-heading text-5xl leading-none sm:text-6xl">
          {country.country}
        </h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {country.cities.slice(0, 5).map((city) => (
            <span
              className="rounded-full border border-foreground/15 bg-white/65 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]"
              key={city}
            >
              {city}
            </span>
          ))}
          {country.cities.length > 5 ? (
            <span className="rounded-full border border-foreground/15 bg-white/65 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">
              +{country.cities.length - 5}
            </span>
          ) : null}
        </div>
        <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <CalendarDays size={16} />
            First visited {formatStampDate(country.firstVisitedAt)}
          </p>
          <p className="inline-flex items-center gap-2">
            <MapPin size={16} />
            {country.journeyCount}{' '}
            {country.journeyCount === 1 ? 'trip' : 'trips'} -{' '}
            {country.cities.length}{' '}
            {country.cities.length === 1 ? 'city' : 'cities'}
          </p>
          <p className="inline-flex items-center gap-2 text-foreground">
            <MapPin size={16} />
            {pinnedPlaces > 0
              ? `${pinnedPlaces} pinned ${pinnedPlaces === 1 ? 'place' : 'places'}`
              : 'Choose places to add pins'}
          </p>
        </div>
      </div>
    </button>
  );
}
