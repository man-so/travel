'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Home, Image, MapPinned, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { GoogleJourneyMap } from '@/components/maps/GoogleJourneyMap';
import { PassportSummary } from '@/components/passport/PassportSummary';
import { StampGrid } from '@/components/passport/StampGrid';
import { createPassport } from '@/lib/passport/aggregate';
import { listJourneys } from '@/lib/journey-store';
import type { Journey } from '@/types/journey';
import type { PassportCountry, PassportMapPlace } from '@/types/passport';

function countryCode(country: string) {
  return country.trim().slice(0, 2).toUpperCase();
}

function createCountryPin(country: PassportCountry): PassportMapPlace | null {
  if (country.mapPlaces.length === 0) {
    return null;
  }

  const latitude =
    country.mapPlaces.reduce((sum, place) => sum + place.latitude, 0) /
    country.mapPlaces.length;
  const longitude =
    country.mapPlaces.reduce((sum, place) => sum + place.longitude, 0) /
    country.mapPlaces.length;

  return {
    id: `passport-country-${country.country}`,
    dayNumber: 0,
    place: country.country,
    query: country.country,
    country: country.country,
    journeyTitle: `${country.journeyCount} ${
      country.journeyCount === 1 ? 'journey' : 'journeys'
    }`,
    destination: country.cities.join(', '),
    latitude,
    longitude,
    markerLabel: countryCode(country.country),
    markerColor: '#1b5143',
    markerTextColor: '#ffffff',
  };
}

export default function PassportPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<PassportCountry | null>(null);

  useEffect(() => {
    const refresh = () => setJourneys(listJourneys());
    refresh();
    window.addEventListener('waylog:change', refresh);
    return () => window.removeEventListener('waylog:change', refresh);
  }, []);

  const passport = useMemo(() => createPassport(journeys), [journeys]);
  const passportCountryPins = useMemo(
    () =>
      passport.countries
        .map((country) => createCountryPin(country))
        .filter((place): place is PassportMapPlace => Boolean(place)),
    [passport.countries],
  );

  function openCountryByPlace(placeId: string) {
    const country = passport.countries.find(
      (item) => `passport-country-${item.country}` === placeId,
    );
    if (country) {
      setSelectedCountry(country);
    }
  }

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground">
      <Header />
      <section className="mx-auto max-w-[1440px] px-5 pb-12 pt-8 md:px-16">
        <div className="grid gap-8 border-b border-border pb-10 md:grid-cols-[0.95fr_1.05fr] md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-accent">
              Travel Passport
            </p>
            <h1 className="mt-4 font-heading text-6xl leading-none md:text-8xl">
              My Travel Passport
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground md:justify-self-end">
            Every saved journey becomes a stamp, gathered by country and city from your
            own WAYLOG stories.
          </p>
        </div>

        <div className="mt-10">
          <PassportSummary summary={passport.summary} />
        </div>

        {!passport.hasJourneys ? (
          <EmptyPassport
            copy="Create a journey and your first stamp will appear here."
            title="Your passport is empty."
          />
        ) : passport.countries.length === 0 ? (
          <EmptyPassport
            copy="Add a country to your journey to unlock this stamp."
            title="No country stamps yet."
          />
        ) : (
          <>
            {passport.hasJourneysMissingCountry ? (
              <div className="mt-10 rounded-lg border border-border bg-card p-5 text-muted-foreground">
                Add a country to any uncategorized journey to unlock more stamps.
              </div>
            ) : null}
            <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div>
                <StampGrid countries={passport.countries} onOpenCountry={setSelectedCountry} />
              </div>
              {passportCountryPins.length > 0 ? (
                <section className="overflow-hidden rounded-lg border border-border bg-white lg:sticky lg:top-24">
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-5">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-accent">
                        World Map
                      </p>
                      <h2 className="mt-2 font-heading text-4xl leading-none text-primary">
                        Passport pins
                      </h2>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-muted-foreground">
                      One pin represents one country. Select a pin to open the related passport.
                    </p>
                  </div>
                  <GoogleJourneyMap
                    onPlaceClick={openCountryByPlace}
                    places={passportCountryPins}
                    showRoute={false}
                  />
                </section>
              ) : (
                <section className="rounded-lg border border-dashed border-border p-6 text-muted-foreground">
                  <p className="font-bold text-foreground">No country pins yet.</p>
                  <p className="mt-2">
                    Choose Google Places for moments to place country pins on the map.
                  </p>
                </section>
              )}
            </div>
          </>
        )}
      </section>

      {selectedCountry ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/45 p-4 md:items-center md:justify-center">
          <section className="grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white md:grid-cols-[0.65fr_1.35fr]">
            <aside className="max-h-[38vh] overflow-auto border-b border-border p-5 md:max-h-none md:border-b-0 md:border-r">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-accent">
                Passport Map
              </p>
              <h2 className="mt-3 font-heading text-5xl leading-none">
                {selectedCountry.country}
              </h2>
              {selectedCountry.mapPlaces.length === 0 ? (
                <p className="mt-5 text-muted-foreground">
                  Edit moments and choose places from Google to add pins here.
                </p>
              ) : (
                <div className="mt-6 grid gap-2">
                  {selectedCountry.mapPlaces.map((place) => (
                    <div
                      className="flex gap-3 rounded-lg border border-border bg-background px-4 py-3"
                      key={place.id}
                    >
                      {place.markerLabel ? (
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black"
                          style={{
                            backgroundColor: place.markerColor ?? '#ff5a36',
                            color: place.markerTextColor ?? '#ffffff',
                          }}
                        >
                          {place.markerLabel}
                        </span>
                      ) : null}
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                          Day {String(place.dayNumber).padStart(2, '0')} - {place.destination}
                        </p>
                        <p className="mt-1 font-bold">{place.place}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{place.journeyTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="mt-6 rounded-full border border-border px-5 py-3 text-sm font-bold"
                onClick={() => setSelectedCountry(null)}
                type="button"
              >
                Close
              </button>
            </aside>
            <GoogleJourneyMap places={selectedCountry.mapPlaces} />
          </section>
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 mx-auto flex h-20 max-w-xl items-center justify-around border-t border-border bg-white/95 px-6 backdrop-blur md:hidden">
        <a aria-label="Home" className="text-muted-foreground" href="/">
          <Home />
        </a>
        <a aria-label="Journeys" className="text-muted-foreground" href="/dashboard">
          <Image />
        </a>
        <a aria-label="Passport" className="text-foreground" href="/passport">
          <BookOpen />
        </a>
        <a aria-label="New journey" className="text-muted-foreground" href="/journeys/new">
          <Plus />
        </a>
      </nav>
    </main>
  );
}

function EmptyPassport({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="mt-12 flex min-h-[320px] flex-col justify-end rounded-lg border border-dashed border-border p-7">
      <MapPinned className="mb-8 text-accent" size={42} />
      <h2 className="font-heading text-5xl leading-none">{title}</h2>
      <p className="mt-4 max-w-md text-muted-foreground">{copy}</p>
      <a
        className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white"
        href="/journeys/new"
      >
        <Plus size={18} />
        Create your first journey
      </a>
    </section>
  );
}
