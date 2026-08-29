'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Edit3,
  ListPlus,
  Map,
  MapPin,
  MoreHorizontal,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  addEntry,
  deleteEntry,
  getJourney,
  updateEntry,
} from '@/lib/journey-store';
import { GoogleJourneyMap } from '@/components/maps/GoogleJourneyMap';
import { PlacePicker, type SelectedPlace } from '@/components/maps/PlacePicker';
import { TripPlanner } from '@/components/planner/TripPlanner';
import { dayCount, formatDateRange, formatShortDate } from '@/lib/dates';
import { prepareMomentPhoto } from '@/lib/image-upload';
import {
  createMomentDraftFromItinerary,
  orderedItinerary,
} from '@/lib/planner';
import type { Day, Entry, ItineraryItem, Journey } from '@/types/journey';

type EntryFormState = {
  entry?: Entry;
  dayId: string;
  place: string;
  content: string;
  photoUrl: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  itineraryItemId?: string;
  plannedTime?: string;
};

export function JourneyDetail({ journeyId }: { journeyId: string }) {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [form, setForm] = useState<EntryFormState | null>(null);
  const [mapQuery, setMapQuery] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [hasOpenedPlanner, setHasOpenedPlanner] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(
      () => setJourney(getJourney(journeyId)),
      0,
    );
    return () => window.clearTimeout(handle);
  }, [journeyId]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).get('tab') === 'itinerary') {
        setActiveTab('Itinerary');
        setHasOpenedPlanner(true);
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  function refresh() {
    setJourney(getJourney(journeyId));
  }

  function saveMoment() {
    if (!form?.place.trim()) {
      return;
    }
    const payload = {
      place: form.place.trim(),
      content: form.content.trim(),
      photoUrl: form.photoUrl.trim() || undefined,
      formattedAddress: form.formattedAddress,
      latitude: form.latitude,
      longitude: form.longitude,
      itineraryItemId: form.itineraryItemId,
      plannedTime: form.plannedTime,
    };
    if (form.entry) {
      updateEntry(form.entry.id, payload);
    } else {
      addEntry(form.dayId, payload);
    }
    setForm(null);
    setPhotoError('');
    refresh();
  }

  async function uploadMomentPhoto(file?: File) {
    if (!file || !form) {
      return;
    }

    setPhotoError('');
    try {
      const photoUrl = await prepareMomentPhoto(file);
      setForm({ ...form, photoUrl });
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : 'Unable to prepare this photo.',
      );
    }
  }

  function removeMoment(entryId: string) {
    if (window.confirm('Are you sure?')) {
      deleteEntry(entryId);
      refresh();
    }
  }

  function openMomentFromItinerary(dayId: string, item: ItineraryItem) {
    setForm({
      dayId,
      ...createMomentDraftFromItinerary(item),
    });
  }

  function applyItineraryToMoment(item: ItineraryItem) {
    if (!form) {
      return;
    }
    const draft = createMomentDraftFromItinerary(item);
    setForm({
      ...form,
      ...draft,
      dayId: form.dayId,
      photoUrl: form.photoUrl,
    });
  }

  if (!journey) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="font-heading text-6xl">Journey not found.</h1>
          <p className="mt-4 text-muted-foreground">
            The story may have been deleted.
          </p>
          <a
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-bold text-white"
            href="/dashboard"
          >
            Back to dashboard
          </a>
        </div>
      </main>
    );
  }

  const cover = journey.cover?.url;
  const places = journey.days.flatMap((day) =>
    day.entries.map((entry) => ({
      id: entry.id,
      dayNumber: day.dayNumber,
      place: entry.place,
      query: [entry.place, journey.destination, journey.country]
        .filter(Boolean)
        .join(', '),
      latitude: entry.latitude,
      longitude: entry.longitude,
    })),
  );
  const journeyMapQuery = [journey.destination, journey.country]
    .filter(Boolean)
    .join(', ');
  const activeMapQuery = mapQuery ?? places[0]?.query ?? journeyMapQuery;
  const formDay = form
    ? journey.days.find((day) => day.id === form.dayId)
    : undefined;
  const formPlannerItems = formDay
    ? orderedItinerary(formDay.itinerary ?? [])
    : [];
  const selectedPlannerItem = form?.itineraryItemId
    ? formPlannerItems.find((item) => item.id === form.itineraryItemId)
    : undefined;

  return (
    <main className="min-h-screen bg-background pb-28">
      <section className="relative min-h-[62vh] overflow-hidden bg-foreground text-white">
        {cover ? (
          <img
            alt={`${journey.destination} cover`}
            className="absolute inset-0 h-full w-full object-cover"
            src={cover}
          />
        ) : null}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative flex items-center justify-between px-5 py-5 md:px-10">
          <a className="text-xl" href="/dashboard" aria-label="Back">
            ←
          </a>
          <p className="font-bold">{journey.title}</p>
          <a href={`/journeys/${journey.id}/edit`} aria-label="Edit Journey">
            <MoreHorizontal />
          </a>
        </div>
        <div className="relative mx-4 mt-16 max-w-xl rounded-lg bg-[#2f333d]/95 p-6 shadow-2xl md:mx-10">
          <p className="font-heading text-5xl leading-none md:text-7xl">
            {journey.destination}
          </p>
          <p className="mt-2 text-white/75">{journey.country}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} />
              {formatDateRange(journey.startDate, journey.endDate)}
            </span>
            <span>{dayCount(journey.startDate, journey.endDate)} Days</span>
            <a
              className="rounded-full bg-white px-5 py-2 font-bold text-foreground"
              href={`/journeys/${journey.id}/edit`}
            >
              Edit
            </a>
          </div>
          {journey.cover?.photographerName ? (
            <p className="mt-5 text-xs text-white/65">
              Photo by{' '}
              <a
                href={journey.cover.photographerUrl}
                rel="noreferrer"
                target="_blank"
                className="underline"
              >
                {journey.cover.photographerName}
              </a>{' '}
              on{' '}
              <a
                href={journey.cover.unsplashUrl}
                rel="noreferrer"
                target="_blank"
                className="underline"
              >
                Unsplash
              </a>
            </p>
          ) : null}
        </div>
      </section>

      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div
          className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 md:px-10"
        >
          <div className="-ml-4 flex min-w-0 overflow-x-auto">
            {['Overview', 'Itinerary', 'Explore', '$'].map((tab) => (
              <button
                className={`shrink-0 px-4 py-4 text-sm font-black ${activeTab === tab ? 'border-b-2 border-accent text-accent' : 'text-muted-foreground'}`}
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Itinerary') {
                    setHasOpenedPlanner(true);
                  }
                }}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <nav className="flex shrink-0 items-center gap-2 pb-2 md:pb-0">
            <a
              className="rounded-full border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition hover:border-accent hover:text-accent"
              href="/"
            >
              Home
            </a>
            <a
              className="rounded-full border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition hover:border-accent hover:text-accent"
              href="/dashboard"
            >
              Dashboard
            </a>
          </nav>
        </div>
      </div>

      <section
        className={`mx-auto px-5 py-12 md:px-10 ${
          activeTab === 'Itinerary' ? 'max-w-[1680px]' : 'max-w-5xl'
        }`}
      >
        {hasOpenedPlanner ? (
          <div hidden={activeTab !== 'Itinerary'}>
            <TripPlanner
              journey={journey}
              onCreateMoment={openMomentFromItinerary}
              onRefresh={refresh}
            />
          </div>
        ) : null}
        <div hidden={activeTab === 'Itinerary'}>
          <textarea
            aria-label="General trip notes"
            className="mb-10 min-h-24 w-full resize-none bg-transparent text-xl italic leading-8 text-muted-foreground outline-none"
            placeholder="Write or paste general notes here, e.g. how to get around, local tips, reminders"
          />
          <div className="space-y-16">
            {journey.days.map((day) => (
              <DaySection
                day={day}
                journeyLocation={journeyMapQuery}
                key={day.id}
                onAdd={() =>
                  setForm({
                    dayId: day.id,
                    place: '',
                    content: '',
                    photoUrl: '',
                  })
                }
                onDelete={removeMoment}
                onEdit={(entry) =>
                  setForm({
                    entry,
                    dayId: day.id,
                    place: entry.place,
                    content: entry.content,
                    photoUrl: entry.photoUrl ?? '',
                    formattedAddress: entry.formattedAddress,
                    latitude: entry.latitude,
                    longitude: entry.longitude,
                    itineraryItemId: entry.itineraryItemId,
                    plannedTime: entry.plannedTime,
                  })
                }
                onOpenMap={(query) => setMapQuery(query)}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 right-5 z-20 flex flex-col gap-3">
        <button
          aria-label="Open map"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#20242c] text-white shadow-xl"
          onClick={() => setMapQuery(activeMapQuery)}
          type="button"
        >
          <Map />
        </button>
        <button
          aria-label="Add moment"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#20242c] text-white shadow-xl"
          onClick={() =>
            setForm({
              dayId: journey.days[0]?.id ?? '',
              place: '',
              content: '',
              photoUrl: '',
            })
          }
          type="button"
        >
          <Plus size={34} />
        </button>
      </div>

      {form ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/40 p-4 md:items-center md:justify-center">
          <form
            className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-lg bg-white p-5 md:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              saveMoment();
            }}
          >
            <h2 className="text-3xl font-black">
              {form.entry ? 'Edit moment' : 'Add moment'}
            </h2>
            {form.itineraryItemId ? (
              <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
                <p className="font-black uppercase tracking-[0.16em] text-accent">
                  Planned place
                </p>
                <p className="mt-2 text-xl font-black text-foreground">
                  {form.place}
                </p>
                <p className="mt-1 font-bold text-muted-foreground">
                  {formDay
                    ? `Day ${String(formDay.dayNumber).padStart(
                        2,
                        '0',
                      )} · ${formatShortDate(formDay.date)}`
                    : 'Planned day'}
                  {form.plannedTime ? ` · ${form.plannedTime}` : ''}
                </p>
                {selectedPlannerItem?.formattedAddress ? (
                  <p className="mt-2 break-words text-muted-foreground">
                    {selectedPlannerItem.formattedAddress}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-6 grid gap-4">
              {!form.entry && formPlannerItems.length > 0 ? (
                <div className="grid gap-2">
                  <span className="text-sm font-bold">
                    Bring from today&apos;s plan
                  </span>
                  <div className="grid max-h-40 gap-2 overflow-auto rounded-lg border border-border bg-background p-2">
                    {formPlannerItems.map((item) => (
                      <button
                        className={`rounded-md border px-3 py-2 text-left transition ${
                          form.itineraryItemId === item.id
                            ? 'border-accent bg-accent text-white'
                            : 'border-border bg-white hover:border-accent'
                        }`}
                        key={item.id}
                        onClick={() => applyItineraryToMoment(item)}
                        type="button"
                      >
                        <span className="block text-xs font-black uppercase tracking-[0.12em] opacity-70">
                          {item.time || 'Any time'}
                        </span>
                        <span className="mt-1 block font-bold">
                          {item.placeName}
                        </span>
                        {item.note ? (
                          <span className="mt-1 block truncate text-sm opacity-75">
                            {item.note}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <label className="grid gap-2">
                <span className="text-sm font-bold">Place</span>
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) =>
                    setForm({ ...form, place: event.target.value })
                  }
                  required
                  value={form.place}
                />
              </label>
              <div className="grid gap-2">
                <span className="text-sm font-bold">Find place on Google</span>
                <PlacePicker
                  destination={journey.destination}
                  onSelect={(place: SelectedPlace) =>
                    setForm({
                      ...form,
                      place: place.place,
                      formattedAddress: place.formattedAddress,
                      latitude: place.latitude,
                      longitude: place.longitude,
                    })
                  }
                  selectedPlace={form.formattedAddress}
                />
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-bold">Note</span>
                <textarea
                  className="min-h-28 rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) =>
                    setForm({ ...form, content: event.target.value })
                  }
                  value={form.content}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">Photo URL optional</span>
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) =>
                    setForm({ ...form, photoUrl: event.target.value })
                  }
                  value={form.photoUrl}
                />
              </label>
              <div className="grid gap-3 rounded-lg border border-dashed border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">Upload your photo</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Images are resized for this local diary.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-bold text-background">
                    <Upload size={16} />
                    Choose photo
                    <input
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) =>
                        void uploadMomentPhoto(event.target.files?.[0])
                      }
                      type="file"
                    />
                  </label>
                </div>
                {photoError ? (
                  <p className="text-sm font-bold text-accent">{photoError}</p>
                ) : null}
                {form.photoUrl ? (
                  <div className="relative overflow-hidden rounded-lg bg-muted">
                    <img
                      alt="Moment preview"
                      className="max-h-64 w-full object-cover"
                      src={form.photoUrl}
                    />
                    <button
                      className="absolute right-3 top-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-foreground shadow"
                      onClick={() => setForm({ ...form, photoUrl: '' })}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full border border-border px-5 py-3 font-bold"
                onClick={() => setForm(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-accent px-5 py-3 font-bold text-white"
                type="submit"
              >
                Save moment
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {mapQuery ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/45 p-4 md:items-center md:justify-center">
          <section className="grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white md:grid-cols-[0.65fr_1.35fr]">
            <aside className="max-h-[38vh] overflow-auto border-b border-border p-5 md:max-h-none md:border-b-0 md:border-r">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-accent">
                Google Maps
              </p>
              <h2 className="mt-3 font-heading text-5xl leading-none">
                Journey places
              </h2>
              {places.length === 0 ? (
                <p className="mt-5 text-muted-foreground">
                  Add moments with places to build this map.
                </p>
              ) : (
                <div className="mt-6 grid gap-2">
                  {places.map((place) => (
                    <button
                      className={`rounded-lg border px-4 py-3 text-left transition ${
                        mapQuery === place.query
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-background'
                      }`}
                      key={place.id}
                      onClick={() => setMapQuery(place.query)}
                      type="button"
                    >
                      <span className="block text-xs font-black uppercase tracking-[0.16em] opacity-70">
                        Day {String(place.dayNumber).padStart(2, '0')}
                      </span>
                      <span className="mt-1 block font-bold">
                        {place.place}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapQuery)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in Google Maps
                  <ExternalLink size={16} />
                </a>
                <button
                  className="rounded-full border border-border px-5 py-3 text-sm font-bold"
                  onClick={() => setMapQuery(null)}
                  type="button"
                >
                  Close
                </button>
              </div>
            </aside>
            <GoogleJourneyMap places={places} />
          </section>
        </div>
      ) : null}
    </main>
  );
}

function DaySection({
  day,
  journeyLocation,
  onAdd,
  onEdit,
  onDelete,
  onOpenMap,
}: {
  day: Day;
  journeyLocation: string;
  onAdd: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: string) => void;
  onOpenMap: (query: string) => void;
}) {
  return (
    <article className="border-t border-border pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ChevronDown className="text-foreground" />
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-accent">
              Day {String(day.dayNumber).padStart(2, '0')}
            </p>
            <h2 className="mt-1 text-4xl font-black">
              {formatShortDate(day.date)}
            </h2>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-bold text-white"
          onClick={onAdd}
          type="button"
        >
          <ListPlus size={18} />
          Add moment
        </button>
      </div>

      {day.entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-muted-foreground">
          <p className="font-bold text-foreground">Nothing recorded yet.</p>
          <p className="mt-1">Add the first moment from this day.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {day.entries.map((entry) => (
            <div
              className={`grid gap-4 ${
                entry.photoUrl ? 'md:grid-cols-[0.8fr_1fr]' : ''
              }`}
              key={entry.id}
            >
              {entry.photoUrl ? (
                <img
                  alt={entry.place}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                  src={entry.photoUrl}
                />
              ) : null}
              <div className="flex flex-col justify-center">
                {entry.itineraryItemId ? (
                  <p className="mb-3 w-fit rounded-full border border-accent/25 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-accent">
                    Planned
                    {entry.plannedTime ? ` · ${entry.plannedTime}` : ''}
                  </p>
                ) : null}
                <p className="text-3xl font-black">{entry.place}</p>
                {entry.content ? (
                  <p className="mt-4 whitespace-pre-wrap text-lg leading-8">
                    {entry.content}
                  </p>
                ) : null}
                <button
                  className="mt-5 inline-flex w-fit items-center gap-2 text-left text-sm text-muted-foreground transition hover:text-accent"
                  onClick={() =>
                    onOpenMap(
                      [entry.place, journeyLocation].filter(Boolean).join(', '),
                    )
                  }
                  type="button"
                >
                  <MapPin size={16} />
                  {entry.place}
                </button>
                <div className="mt-5 flex gap-2">
                  <button
                    className="rounded-full border border-border p-3"
                    onClick={() => onEdit(entry)}
                    type="button"
                    aria-label="Edit moment"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    className="rounded-full border border-border p-3"
                    onClick={() => onDelete(entry.id)}
                    type="button"
                    aria-label="Delete moment"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
