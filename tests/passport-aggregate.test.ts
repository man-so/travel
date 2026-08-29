import assert from 'node:assert/strict';
import { createPassport } from '../lib/passport/aggregate.ts';
import type { Companion, Journey } from '../types/journey.ts';

const companion: Companion = 'solo';

function journey(overrides: Partial<Journey>): Journey {
  const id = overrides.id ?? crypto.randomUUID();

  return {
    id,
    title: overrides.title ?? overrides.destination ?? 'Untitled journey',
    destination: overrides.destination ?? '',
    country: overrides.country ?? '',
    startDate: overrides.startDate ?? '2026-04-01',
    endDate: overrides.endDate ?? '2026-04-01',
    companion,
    cover: overrides.cover,
    days: overrides.days ?? [
      {
        id: `${id}-day-1`,
        journeyId: id,
        dayNumber: 1,
        date: overrides.startDate ?? '2026-04-01',
        entries: [],
      },
    ],
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
  };
}

{
  const passport = createPassport([
    journey({ country: 'Japan', destination: 'Kyoto' }),
  ]);

  assert.equal(passport.summary.countryCount, 1);
  assert.equal(passport.summary.cityCount, 1);
  assert.equal(passport.countries[0]?.country, 'Japan');
  assert.deepEqual(passport.countries[0]?.cities, ['Kyoto']);
}

{
  const passport = createPassport([
    journey({ country: 'Japan', destination: 'Kyoto' }),
    journey({ country: 'Japan', destination: 'Tokyo' }),
  ]);

  assert.equal(passport.summary.countryCount, 1);
  assert.equal(passport.summary.cityCount, 2);
  assert.equal(passport.countries[0]?.journeyCount, 2);
  assert.deepEqual(passport.countries[0]?.cities, ['Kyoto', 'Tokyo']);
}

{
  const passport = createPassport([
    journey({ country: 'Japan', destination: 'Kyoto' }),
    journey({ country: 'Thailand', destination: 'Bangkok' }),
  ]);

  assert.equal(passport.summary.countryCount, 2);
  assert.equal(passport.summary.cityCount, 2);
}

{
  const passport = createPassport([
    journey({ country: 'Japan', destination: 'Kyoto' }),
    journey({ country: 'japan', destination: 'kyoto' }),
    journey({ country: ' JAPAN ', destination: ' Kyoto ' }),
  ]);

  assert.equal(passport.summary.countryCount, 1);
  assert.equal(passport.summary.cityCount, 1);
  assert.equal(passport.countries[0]?.journeyCount, 3);
}

{
  const passport = createPassport([
    journey({ country: '', destination: 'Local Walk' }),
    journey({ country: 'Japan', destination: 'Kyoto' }),
  ]);

  assert.equal(passport.summary.countryCount, 1);
  assert.equal(passport.summary.cityCount, 1);
  assert.equal(passport.summary.journeyCount, 2);
  assert.equal(passport.hasJourneysMissingCountry, true);
}

{
  const passport = createPassport([]);

  assert.equal(passport.hasJourneys, false);
  assert.equal(passport.summary.countryCount, 0);
  assert.equal(passport.summary.cityCount, 0);
  assert.deepEqual(passport.countries, []);
}
