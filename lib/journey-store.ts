'use client';

import { createDays } from '@/lib/dates';
import type { Entry, Journey, JourneyDraft } from '@/types/journey';

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
  Partial<Pick<Entry, 'formattedAddress' | 'latitude' | 'longitude'>>;

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
