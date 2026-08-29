import type { Journey } from '@/types/journey';
import type { PassportCountry, PassportViewModel } from '@/types/passport';

type CountryAccumulator = PassportCountry & {
  normalizedCities: Set<string>;
};

function normalizeKey(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeLabel(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function entryCount(journey: Journey) {
  return journey.days.reduce((sum, day) => sum + day.entries.length, 0);
}

export function createPassport(journeys: Journey[]): PassportViewModel {
  const countries = new Map<string, CountryAccumulator>();
  const allCities = new Set<string>();
  let momentCount = 0;
  let hasJourneysMissingCountry = false;

  journeys.forEach((journey) => {
    const country = normalizeLabel(journey.country);
    const destination = normalizeLabel(journey.destination);
    const countryKey = normalizeKey(country);
    const cityKey = normalizeKey(destination);
    const moments = entryCount(journey);

    momentCount += moments;

    if (!countryKey) {
      hasJourneysMissingCountry = true;
      return;
    }

    if (cityKey) {
      allCities.add(cityKey);
    }

    const existing = countries.get(countryKey);
    const mapPlaces = journey.days.flatMap((day) =>
      day.entries
        .filter(
          (entry) =>
            typeof entry.latitude === 'number' && typeof entry.longitude === 'number',
        )
        .map((entry) => ({
          id: entry.id,
          dayNumber: day.dayNumber,
          place: entry.place,
          query: [entry.place, journey.destination, country].filter(Boolean).join(', '),
          journeyTitle: journey.title,
          destination,
          latitude: entry.latitude!,
          longitude: entry.longitude!,
        })),
    );

    if (existing) {
      existing.firstVisitedAt =
        journey.startDate < existing.firstVisitedAt
          ? journey.startDate
          : existing.firstVisitedAt;
      existing.lastVisitedAt =
        journey.endDate > existing.lastVisitedAt ? journey.endDate : existing.lastVisitedAt;
      if (journey.cover?.url && journey.endDate >= existing.lastVisitedAt) {
        existing.coverUrl = journey.cover.url;
      }
      existing.journeyCount += 1;
      existing.momentCount += moments;
      existing.mapPlaces.push(...mapPlaces);
      if (cityKey && !existing.normalizedCities.has(cityKey)) {
        existing.normalizedCities.add(cityKey);
        existing.cities.push(destination);
      }
      return;
    }

    countries.set(countryKey, {
      country,
      firstVisitedAt: journey.startDate,
      lastVisitedAt: journey.endDate,
      journeyCount: 1,
      momentCount: moments,
      cities: cityKey ? [destination] : [],
      mapPlaces,
      coverUrl: journey.cover?.url,
      normalizedCities: cityKey ? new Set([cityKey]) : new Set(),
    });
  });

  const countryList = Array.from(countries.values())
    .map(({ normalizedCities: _normalizedCities, ...country }) => ({
      ...country,
      cities: [...country.cities].sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.country.localeCompare(b.country));

  return {
    countries: countryList,
    summary: {
      countryCount: countryList.length,
      cityCount: allCities.size,
      journeyCount: journeys.length,
      momentCount,
    },
    hasJourneys: journeys.length > 0,
    hasJourneysMissingCountry,
  };
}
