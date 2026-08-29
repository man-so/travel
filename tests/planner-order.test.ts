import assert from 'node:assert/strict';
import {
  createMomentDraftFromItinerary,
  moveItineraryOrder,
  normalizeItineraryOrder,
  orderedItinerary,
} from '../lib/planner.ts';
import type { ItineraryItem } from '../types/journey.ts';

function item(id: string, order: number): ItineraryItem {
  return {
    id,
    dayId: 'day-1',
    placeName: id,
    order,
    status: 'planned',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

{
  const ordered = orderedItinerary([item('third', 2), item('first', 0), item('second', 1)]);
  assert.deepEqual(
    ordered.map((entry) => entry.id),
    ['first', 'second', 'third'],
  );
}

{
  const normalized = normalizeItineraryOrder([item('a', 7), item('b', 3)]);
  assert.deepEqual(
    normalized.map((entry) => entry.order),
    [0, 1],
  );
}

{
  const moved = moveItineraryOrder(
    [item('a', 0), item('b', 1), item('c', 2)],
    'b',
    'up',
  );
  assert.deepEqual(
    moved.map((entry) => entry.id),
    ['b', 'a', 'c'],
  );
  assert.deepEqual(
    moved.map((entry) => entry.order),
    [0, 1, 2],
  );
}

{
  const moved = moveItineraryOrder(
    [item('a', 0), item('b', 1), item('c', 2)],
    'b',
    'down',
  );
  assert.deepEqual(
    moved.map((entry) => entry.id),
    ['a', 'c', 'b'],
  );
}

{
  const unchanged = moveItineraryOrder([item('a', 0)], 'a', 'up');
  assert.deepEqual(unchanged.map((entry) => entry.id), ['a']);
}

{
  const draft = createMomentDraftFromItinerary({
    ...item('itinerary-1', 0),
    time: '09:00',
    placeName: 'Seoul Station',
    formattedAddress: '405 Hangang-daero',
    latitude: 37.5547,
    longitude: 126.9706,
    note: 'KTX arrival',
  });

  assert.deepEqual(draft, {
    place: 'Seoul Station',
    content: 'KTX arrival',
    photoUrl: '',
    formattedAddress: '405 Hangang-daero',
    latitude: 37.5547,
    longitude: 126.9706,
    itineraryItemId: 'itinerary-1',
    plannedTime: '09:00',
  });
}
