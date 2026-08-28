'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  ChevronDown,
  Edit3,
  ListPlus,
  Map,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { addEntry, deleteEntry, getJourney, updateEntry } from '@/lib/journey-store';
import { dayCount, formatDateRange, formatShortDate } from '@/lib/dates';
import type { Day, Entry, Journey } from '@/types/journey';

type EntryFormState = {
  entry?: Entry;
  dayId: string;
  place: string;
  content: string;
  photoUrl: string;
};

export function JourneyDetail({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [form, setForm] = useState<EntryFormState | null>(null);

  useEffect(() => {
    setJourney(getJourney(journeyId));
  }, [journeyId]);

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
    };
    if (form.entry) {
      updateEntry(form.entry.id, payload);
    } else {
      addEntry(form.dayId, payload);
    }
    setForm(null);
    refresh();
  }

  function removeMoment(entryId: string) {
    if (window.confirm('Are you sure?')) {
      deleteEntry(entryId);
      refresh();
    }
  }

  if (!journey) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="font-heading text-6xl">Journey not found.</h1>
          <p className="mt-4 text-muted-foreground">The story may have been deleted.</p>
          <Link className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-bold text-white" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const cover = journey.cover?.url;

  return (
    <main className="min-h-screen bg-background pb-28">
      <section className="relative min-h-[62vh] overflow-hidden bg-foreground text-white">
        {cover ? (
          <img alt={`${journey.destination} cover`} className="absolute inset-0 h-full w-full object-cover" src={cover} />
        ) : null}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative flex items-center justify-between px-5 py-5 md:px-10">
          <Link className="text-xl" href="/dashboard">←</Link>
          <p className="font-bold">{journey.title}</p>
          <Link href={`/journeys/${journey.id}/edit`} aria-label="Edit Journey">
            <MoreHorizontal />
          </Link>
        </div>
        <div className="relative mx-4 mt-16 max-w-xl rounded-lg bg-[#2f333d]/95 p-6 shadow-2xl md:mx-10">
          <p className="font-heading text-5xl leading-none md:text-7xl">{journey.destination}</p>
          <p className="mt-2 text-white/75">{journey.country}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} />
              {formatDateRange(journey.startDate, journey.endDate)}
            </span>
            <span>{dayCount(journey.startDate, journey.endDate)} Days</span>
            <Link className="rounded-full bg-white px-5 py-2 font-bold text-foreground" href={`/journeys/${journey.id}/edit`}>
              Edit
            </Link>
          </div>
          {journey.cover?.photographerName ? (
            <p className="mt-5 text-xs text-white/65">
              Photo by{' '}
              <a href={journey.cover.photographerUrl} rel="noreferrer" target="_blank" className="underline">
                {journey.cover.photographerName}
              </a>{' '}
              on{' '}
              <a href={journey.cover.unsplashUrl} rel="noreferrer" target="_blank" className="underline">
                Unsplash
              </a>
            </p>
          ) : null}
        </div>
      </section>

      <div className="sticky top-0 z-10 flex border-b border-border bg-background/95 px-5 backdrop-blur md:px-10">
        {['Overview', 'Itinerary', 'Explore', '$'].map((tab, index) => (
          <button
            className={`px-4 py-4 text-sm font-black ${index === 0 ? 'border-b-2 border-accent text-accent' : 'text-muted-foreground'}`}
            key={tab}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="mx-auto max-w-5xl px-5 py-12 md:px-10">
        <textarea
          aria-label="General trip notes"
          className="mb-10 min-h-24 w-full resize-none bg-transparent text-xl italic leading-8 text-muted-foreground outline-none"
          placeholder="Write or paste general notes here, e.g. how to get around, local tips, reminders"
        />
        <div className="space-y-16">
          {journey.days.map((day) => (
            <DaySection
              day={day}
              key={day.id}
              onAdd={() => setForm({ dayId: day.id, place: '', content: '', photoUrl: '' })}
              onDelete={removeMoment}
              onEdit={(entry) =>
                setForm({
                  entry,
                  dayId: day.id,
                  place: entry.place,
                  content: entry.content,
                  photoUrl: entry.photoUrl ?? '',
                })
              }
            />
          ))}
        </div>
      </section>

      <div className="fixed bottom-6 right-5 z-20 flex flex-col gap-3">
        <button
          aria-label="Open map"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#20242c] text-white shadow-xl"
          type="button"
        >
          <Map />
        </button>
        <button
          aria-label="Add moment"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#20242c] text-white shadow-xl"
          onClick={() => setForm({ dayId: journey.days[0]?.id ?? '', place: '', content: '', photoUrl: '' })}
          type="button"
        >
          <Plus size={34} />
        </button>
      </div>

      {form ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/40 p-4 md:items-center md:justify-center">
          <form
            className="w-full max-w-xl rounded-lg bg-white p-5 md:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              saveMoment();
            }}
          >
            <h2 className="text-3xl font-black">{form.entry ? 'Edit moment' : 'Add moment'}</h2>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold">Place</span>
                <input className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent" onChange={(event) => setForm({ ...form, place: event.target.value })} required value={form.place} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">Note</span>
                <textarea className="min-h-28 rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-accent" onChange={(event) => setForm({ ...form, content: event.target.value })} value={form.content} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">Photo URL optional</span>
                <input className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent" onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} value={form.photoUrl} />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-full border border-border px-5 py-3 font-bold" onClick={() => setForm(null)} type="button">
                Cancel
              </button>
              <button className="rounded-full bg-accent px-5 py-3 font-bold text-white" type="submit">
                Save moment
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function DaySection({
  day,
  onAdd,
  onEdit,
  onDelete,
}: {
  day: Day;
  onAdd: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: string) => void;
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
            <h2 className="mt-1 text-4xl font-black">{formatShortDate(day.date)}</h2>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-bold text-white" onClick={onAdd} type="button">
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
            <div className="grid gap-4 md:grid-cols-[0.8fr_1fr]" key={entry.id}>
              {entry.photoUrl ? (
                <img alt={entry.place} className="aspect-[4/3] w-full rounded-lg object-cover" src={entry.photoUrl} />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <MapPin />
                </div>
              )}
              <div className="flex flex-col justify-center">
                <p className="text-3xl font-black">{entry.place}</p>
                {entry.content ? <p className="mt-4 whitespace-pre-wrap text-lg leading-8">{entry.content}</p> : null}
                <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  {entry.place}
                </p>
                <div className="mt-5 flex gap-2">
                  <button className="rounded-full border border-border p-3" onClick={() => onEdit(entry)} type="button" aria-label="Edit moment">
                    <Edit3 size={18} />
                  </button>
                  <button className="rounded-full border border-border p-3" onClick={() => onDelete(entry.id)} type="button" aria-label="Delete moment">
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
