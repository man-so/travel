import { expect, test, type Page } from '@playwright/test';

const storageKey = 'waylog.journeys.v1';

async function stubGoogleMaps(page: Page) {
  await page.route('https://maps.googleapis.com/maps/api/js**', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        (() => {
          class PlaceAutocompleteElement extends HTMLElement {}
          if (!customElements.get('gmp-place-autocomplete')) {
            customElements.define('gmp-place-autocomplete', PlaceAutocompleteElement);
          }
          window.google = {
            maps: {
              async importLibrary(library) {
                if (library === 'places') {
                  return { PlaceAutocompleteElement };
                }
                return {};
              },
              Map: class {
                fitBounds() {}
                setCenter() {}
                setZoom() {}
              },
              Marker: class {
                constructor(options) {
                  window.__waylogMarkers = [...(window.__waylogMarkers || []), options];
                }
              },
              LatLngBounds: class {
                extend() {}
              },
            },
          };
        })();
      `,
    });
  });
}

async function chooseMockPlace(
  page: Page,
  place: {
    displayName: string;
    formattedAddress: string;
    lat: number;
    lng: number;
  },
) {
  await page.locator('.waylog-place-autocomplete').waitFor();
  await page.locator('.waylog-place-autocomplete').evaluate((element, mockPlace) => {
    const event = new Event('gmp-select', { bubbles: true });
    Object.defineProperty(event, 'placePrediction', {
      value: {
        toPlace() {
          return {
            displayName: mockPlace.displayName,
            formattedAddress: mockPlace.formattedAddress,
            location: { lat: mockPlace.lat, lng: mockPlace.lng },
            async fetchFields() {},
          };
        },
      },
    });
    element.dispatchEvent(event);
  }, place);
}

async function seedJourney(page: Page) {
  const journeyId = 'planner-qa-journey';
  await page.goto('/');
  await page.evaluate(
    ({ key, id }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify([
          {
            id,
            title: 'Planner QA Kyoto',
            destination: 'Kyoto',
            country: 'Japan',
            startDate: '2026-04-10',
            endDate: '2026-04-12',
            companion: 'solo',
            days: [0, 1, 2].map((offset) => {
              const date = new Date('2026-04-10T00:00:00');
              date.setDate(date.getDate() + offset);
              return {
                id: `planner-qa-day-${offset + 1}`,
                journeyId: id,
                dayNumber: offset + 1,
                date: date.toISOString().slice(0, 10),
                entries: [],
              };
            }),
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ]),
      );
    },
    { key: storageKey, id: journeyId },
  );
  await page.goto(`/journeys/${journeyId}`);
  await expect(page.getByText('Planner QA Kyoto')).toBeVisible();
}

async function addPlan(
  page: Page,
  plan: {
    time: string;
    typedPlace: string;
    displayName: string;
    formattedAddress: string;
    lat: number;
    lng: number;
    note?: string;
  },
) {
  await page.getByRole('button', { name: 'Add place' }).first().click();
  await page.locator('form input[type="time"]').fill(plan.time);
  await page.locator('form input[required]').fill(plan.typedPlace);
  await chooseMockPlace(page, plan);
  if (plan.note) {
    await page.locator('form textarea').fill(plan.note);
  }
  await page.getByRole('button', { name: 'Save plan' }).click();
}

test.beforeEach(async ({ page }) => {
  await stubGoogleMaps(page);
  await page.goto('/');
  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
  }, storageKey);
});

test('creates, edits, reorders, deletes, persists, and maps Trip Planner items', async ({
  page,
}) => {
  await seedJourney(page);
  const journeyUrl = page.url();

  await page.getByRole('button', { name: 'Itinerary' }).click();
  await expect(page.getByText('Trip Planner')).toBeVisible();
  await expect(page.getByText('No plans yet.').first()).toBeVisible();

  await addPlan(page, {
    time: '09:00',
    typedPlace: 'Fushimi Inari',
    displayName: 'Fushimi Inari Taisha',
    formattedAddress: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto, Japan',
    lat: 34.9671,
    lng: 135.7727,
    note: 'Morning visit',
  });
  await addPlan(page, {
    time: '13:00',
    typedPlace: 'Kiyomizu-dera',
    displayName: 'Kiyomizu-dera',
    formattedAddress: '1 Chome-294 Kiyomizu, Higashiyama Ward, Kyoto, Japan',
    lat: 34.9949,
    lng: 135.785,
    note: 'Temple walk',
  });

  await expect(page.getByText('Fushimi Inari Taisha')).toBeVisible();
  await expect(page.getByText('Kiyomizu-dera')).toBeVisible();
  await expect(page.getByText('2 places pinned')).toBeVisible();

  await page.getByRole('button', { name: 'Edit planned place' }).first().click();
  await page.locator('form textarea').fill('Morning visit - edited');
  await page.getByRole('button', { name: 'Save plan' }).click();
  await expect(page.getByText('Morning visit - edited')).toBeVisible();

  await page.getByRole('button', { name: 'Move place down' }).first().click();
  await expect(
    page.getByTestId('itinerary-item').first().getByText('Kiyomizu-dera'),
  ).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete planned place' }).nth(1).click();
  await expect(page.getByText('Fushimi Inari Taisha')).toHaveCount(0);
  await expect(page.getByText('Kiyomizu-dera')).toBeVisible();

  const saved = await page.evaluate((key) => {
    const journeys = JSON.parse(window.localStorage.getItem(key) || '[]');
    const journey = journeys.find((entry: { title: string }) => entry.title === 'Planner QA Kyoto');
    return {
      dayCount: journey.days.length,
      entriesLength: journey.days[0].entries.length,
      itinerary: journey.days[0].itinerary,
    };
  }, storageKey);
  expect(saved.dayCount).toBe(3);
  expect(saved.entriesLength).toBe(0);
  expect(saved.itinerary).toHaveLength(1);
  expect(saved.itinerary[0]).toMatchObject({
    placeName: 'Kiyomizu-dera',
    formattedAddress: '1 Chome-294 Kiyomizu, Higashiyama Ward, Kyoto, Japan',
    latitude: 34.9949,
    longitude: 135.785,
    order: 0,
    status: 'planned',
  });

  await page.reload();
  await page.getByRole('button', { name: 'Itinerary' }).click();
  await expect(page.getByText('Kiyomizu-dera')).toBeVisible();
  await expect(page.getByText('1 place pinned')).toBeVisible();

  await page.goto(journeyUrl);
  await expect(page.getByText('Planner QA Kyoto')).toBeVisible();
  await page.getByRole('button', { name: 'Overview' }).click();
  await expect(page.getByText('Nothing recorded yet.').first()).toBeVisible();
});

for (const width of [360, 390, 768, 1440]) {
  test(`Trip Planner layout has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await seedJourney(page);
    await page.getByRole('button', { name: 'Itinerary' }).click();
    await addPlan(page, {
      time: '18:30',
      typedPlace: 'A very long planned destination name for wrapping QA',
      displayName:
        'A very long planned destination name for wrapping QA in Kyoto',
      formattedAddress:
        'A very long formatted address that should wrap cleanly inside the planner item without causing horizontal scroll, Kyoto, Japan',
      lat: 35.0116,
      lng: 135.7681,
      note: 'Mobile wrapping check',
    });

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    await expect(page.getByText('Trip Planner')).toBeVisible();
  });
}
