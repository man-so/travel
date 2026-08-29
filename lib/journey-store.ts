'use client';

import { createDays } from '@/lib/dates';
import { moveItineraryOrder, normalizeItineraryOrder } from '@/lib/planner';
import type { Entry, ItineraryItem, Journey, JourneyDraft } from '@/types/journey';

const storageKey = 'waylog.journeys.v1';

export function listJourneys(): Journey[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Journey[];
  } catch {
    return [];
  }
}

export function saveJourneys(journeys: Journey[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(journeys));
  window.dispatchEvent(new Event('waylog:change'));
}

export function createJourney(draft: JourneyDraft) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const journey: Journey = {
    ...draft,
    id,
    title: draft.title || draft.destination,
    country: draft.country || '',
    days: createDays(id, draft.startDate, draft.endDate),
    createdAt: now,
    updatedAt: now,
  };
  saveJourneys([journey, ...listJourneys()]);
  return journey;
}

export function getJourney(id: string) {
  return listJourneys().find((journey) => journey.id === id) ?? null;
}

export function updateJourney(id: string, patch: Partial<JourneyDraft>) {
  let updated: Journey | null = null;
  const journeys = listJourneys().map((journey) => {
    if (journey.id !== id) {
      return journey;
    }
    updated = {
      ...journey,
      ...patch,
      title: patch.title || journey.title,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  saveJourneys(journeys);
  return updated;
}

export function deleteJourney(id: string) {
  saveJourneys(listJourneys().filter((journey) => journey.id !== id));
}

type EntryPatch = Pick<Entry, 'place' | 'content' | 'photoUrl'> &
  Partial<
    Pick<
      Entry,
      | 'formattedAddress'
      | 'latitude'
      | 'longitude'
      | 'itineraryItemId'
      | 'plannedTime'
    >
  >;

type ItineraryPatch = Pick<ItineraryItem, 'placeName'> &
  Partial<
    Pick<
      ItineraryItem,
      'time' | 'formattedAddress' | 'latitude' | 'longitude' | 'note' | 'status'
    >
  >;

export function addEntry(dayId: string, entry: EntryPatch) {
  const now = new Date().toISOString();
  let newEntry: Entry | null = null;
  const journeys = listJourneys().map((journey) => ({
    ...journey,
    days: journey.days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      newEntry = {
        id: crypto.randomUUID(),
        dayId,
        place: entry.place,
        content: entry.content,
        photoUrl: entry.photoUrl,
        formattedAddress: entry.formattedAddress,
        latitude: entry.latitude,
        longitude: entry.longitude,
        itineraryItemId: entry.itineraryItemId,
        plannedTime: entry.plannedTime,
        sortOrder: day.entries.length,
        createdAt: now,
        updatedAt: now,
      };
      return { ...day, entries: [...day.entries, newEntry] };
    }),
  }));
  saveJourneys(journeys);
  return newEntry;
}

export function updateEntry(entryId: string, patch: EntryPatch) {
  const journeys = listJourneys().map((journey) => ({
    ...journey,
    days: journey.days.map((day) => ({
      ...day,
      entries: day.entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, ...patch, updatedAt: new Date().toISOString() }
          : entry,
      ),
    })),
  }));
  saveJourneys(journeys);
}

export function deleteEntry(entryId: string) {
  const journeys = listJourneys().map((journey) => ({
    ...journey,
    days: journey.days.map((day) => ({
      ...day,
      entries: day.entries.filter((entry) => entry.id !== entryId),
    })),
  }));
  saveJourneys(journeys);
}

export function addItineraryItem(dayId: string, item: ItineraryPatch) {
  const now = new Date().toISOString();
  let newItem: ItineraryItem | null = null;
  const journeys = listJourneys().map((journey) => ({
    ...journey,
    days: journey.days.map((day) => {
      if (day.id !== dayId) {
        return day;
      }
      const itinerary = normalizeItineraryOrder(day.itinerary ?? []);
      newItem = {
        id: crypto.randomUUID(),
        dayId,
        time: item.time?.trim() || undefined,
        placeName: item.placeName.trim(),
        formattedAddress: item.formattedAddress,
        latitude: item.latitude,
        longitude: item.longitude,
        note: item.note?.trim() || undefined,
        order: itinerary.length,
        status: item.status ?? 'planned',
        createdAt: now,
        updatedAt: now,
      };
      return { ...day, itinerary: [...itinerary, newItem] };
    }),
  }));
  saveJourneys(journeys);
  return newItem;
}

export function updateItineraryItem(itemId: string, patch: ItineraryPatch) {
  const now = new Date().toISOString();
  const journeys = listJourneys().map((journey) => ({
    ...journey,
    days: journey.days.map((day) => ({
      ...day,
      itinerary: normalizeItineraryOrder(
        (day.itinerary ?? []).map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...patch,
                time: patch.time?.trim() || undefined,
                placeName: patch.placeName.trim(),
                note: patch.note?.trim() || undefined,
                updatedAt: now,
              }
            : item,
        ),
      ),
    })),
  }));
  saveJourneys(journeys);
}

export function deleteItineraryItem(itemId: string) {
  const journeys = listJourneys().map((journey) => ({
    ...journey,
    days: journey.days.map((day) => ({
      ...day,
      itinerary: normalizeItineraryOrder(
        (day.itinerary ?? []).filter((item) => item.id !== itemId),
      ),
    })),
  }));
  saveJourneys(journeys);
}

export function moveItineraryItem(
  itemId: string,
  direction: 'up' | 'down',
) {
  const journeys = listJourneys().map((journey) => ({
    ...journey,
    days: journey.days.map((day) => ({
      ...day,
      itinerary: moveItineraryOrder(day.itinerary ?? [], itemId, direction),
    })),
  }));
  saveJourneys(journeys);
}
