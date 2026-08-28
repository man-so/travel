'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { UnsplashSearch } from '@/components/unsplash/UnsplashSearch';
import { createJourney, updateJourney } from '@/lib/journey-store';
import { dayCount } from '@/lib/dates';
import { journeySchema } from '@/lib/validation/journey';
import type { CoverPhoto, Journey, JourneyDraft } from '@/types/journey';

const companions = ['solo', 'couple', 'friends', 'family'] as const;

export function JourneyForm({ journey }: { journey?: Journey }) {
  const router = useRouter();
  const [step, setStep] = useState(journey ? 2 : 1);
  const [form, setForm] = useState<JourneyDraft>({
    title: journey?.title ?? '',
    destination: journey?.destination ?? '',
    country: journey?.country ?? '',
    startDate: journey?.startDate ?? '',
    endDate: journey?.endDate ?? '',
    companion: journey?.companion ?? 'solo',
    cover: journey?.cover,
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function setField(field: keyof JourneyDraft, value: string | CoverPhoto | undefined) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const result = journeySchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Check your journey details.');
      return false;
    }
    setError('');
    return true;
  }

  async function save() {
    if (!validate()) {
      setStep(1);
      return;
    }
    setIsSaving(true);
    if (form.cover?.downloadLocation) {
      fetch('/api/unsplash/download', {
        method: 'POST',
        body: JSON.stringify({ downloadLocation: form.cover.downloadLocation }),
      }).catch(() => undefined);
    }
    const saved = journey ? updateJourney(journey.id, form) : createJourney(form);
    setTimeout(() => {
      if (saved) {
        router.push(`/journeys/${saved.id}`);
      }
    }, 250);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-4 md:grid-cols-[0.8fr_1.2fr] md:px-10">
      <aside className="md:sticky md:top-6 md:self-start">
        <p className="text-sm uppercase tracking-[0.24em] text-accent">
          {journey ? 'Edit Journey' : 'Create Journey'}
        </p>
        <h1 className="mt-4 font-heading text-6xl leading-none md:text-8xl">
          {journey ? 'Refine the story.' : 'Where did life take you?'}
        </h1>
        <p className="mt-6 max-w-sm leading-7 text-muted-foreground">
          Add the basics, choose a visual cover, and WAYLOG will make one day section for every date in the trip.
        </p>
        {form.startDate && form.endDate && new Date(form.startDate) <= new Date(form.endDate) ? (
          <p className="mt-6 text-2xl font-black">{dayCount(form.startDate, form.endDate)} Days</p>
        ) : null}
      </aside>

      <section className="rounded-lg bg-white p-5 md:p-8">
        <div className="mb-8 flex border-b border-border">
          {['Details', 'Cover'].map((label, index) => (
            <button
              className={`-mb-px px-4 py-3 text-sm font-bold ${
                step === index + 1
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted-foreground'
              }`}
              key={label}
              onClick={() => setStep(index + 1)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-bold">Title</span>
              <input
                className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                onChange={(event) => setField('title', event.target.value)}
                placeholder="Spring in Kyoto"
                value={form.title}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold">Destination</span>
              <input
                className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                onChange={(event) => setField('destination', event.target.value)}
                placeholder="Kyoto"
                value={form.destination}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold">Country</span>
              <input
                className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                onChange={(event) => setField('country', event.target.value)}
                placeholder="Japan"
                value={form.country}
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold">Start Date</span>
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) => setField('startDate', event.target.value)}
                  type="date"
                  value={form.startDate}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">End Date</span>
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) => setField('endDate', event.target.value)}
                  type="date"
                  value={form.endDate}
                />
              </label>
            </div>
            <fieldset className="grid gap-3">
              <legend className="text-sm font-bold">Companion</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {companions.map((companion) => (
                  <button
                    className={`min-h-11 rounded-full border px-4 text-sm font-bold capitalize ${
                      form.companion === companion
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-background'
                    }`}
                    key={companion}
                    onClick={() => setField('companion', companion)}
                    type="button"
                  >
                    {companion}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        ) : (
          <UnsplashSearch
            destination={form.destination}
            onSelect={(cover) => setField('cover', cover)}
            selected={form.cover}
          />
        )}

        {error ? <p className="mt-5 text-sm font-bold text-accent">{error}</p> : null}
        {journey ? (
          <p className="mt-5 rounded-lg bg-background p-4 text-sm text-muted-foreground">
            Changing dates will not delete existing moments in this MVP. Review any extra day sections manually.
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <button
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 font-bold"
            onClick={() => (step === 1 ? router.back() : setStep(1))}
            type="button"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          {step === 1 ? (
            <button
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-6 font-bold text-background"
              onClick={() => validate() && setStep(2)}
              type="button"
            >
              Choose cover
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className="min-h-12 rounded-full bg-accent px-6 font-bold text-white disabled:opacity-60"
              disabled={isSaving}
              onClick={save}
              type="button"
            >
              {isSaving ? 'Creating your journey...' : journey ? 'Save changes' : 'Create journey'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
