'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Link2, Pencil, Sparkles } from 'lucide-react';
import { JourneyForm } from '@/components/journey/JourneyForm';
import { formatDateKey } from '@/lib/dates';
import { createJourney, addItineraryItem } from '@/lib/journey-store';
import { searchGooglePlaces, type PlaceSearchResult } from '@/lib/google-place-search';
import type { AiImportPlan } from '@/lib/ai-import/schema';
import type { Companion, JourneyDraft } from '@/types/journey';

type Mode = 'choose' | 'manual' | 'link';
type Status = 'idle' | 'loading' | 'success' | 'error';
type ValidationStatus = 'idle' | 'loading' | 'complete';
type ApplyStatus = 'idle' | 'creating' | 'error';
type AiImportResult = {
  content: { title: string; url: string };
  plan: AiImportPlan;
};
type ValidatedPlace = AiImportPlan['days'][number]['places'][number] & {
  status: 'resolved' | 'unresolved';
  result?: PlaceSearchResult;
  reason?: string;
};
type ValidatedDay = {
  day: number;
  places: ValidatedPlace[];
};

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return formatDateKey(next);
}

function getPlanDayCount(plan: AiImportPlan) {
  return plan.durationDays ?? Math.max(1, ...plan.days.map((day) => day.day));
}

function buildDraft(form: {
  title: string;
  destination: string;
  country: string;
  startDate: string;
  durationDays: number;
  companion: Companion;
}): JourneyDraft {
  return {
    title: form.title,
    destination: form.destination,
    country: form.country,
    startDate: form.startDate,
    endDate: addDays(form.startDate, Math.max(form.durationDays - 1, 0)),
    companion: form.companion,
  };
}

export function JourneyStart() {
  const [mode, setMode] = useState<Mode>('choose');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>('idle');
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiImportResult | null>(null);
  const [validatedDays, setValidatedDays] = useState<ValidatedDay[]>([]);
  const [selectedClarification, setSelectedClarification] = useState('');
  const [form, setForm] = useState({
    title: '',
    destination: '',
    country: '',
    startDate: new Date().toISOString().slice(0, 10),
    durationDays: 3,
    companion: 'solo' as Companion,
  });

  const resolvedCount = useMemo(
    () =>
      validatedDays.reduce(
        (total, day) =>
          total +
          day.places.filter(
            (place) => place.status === 'resolved' && Boolean(place.result),
          ).length,
        0,
      ),
    [validatedDays],
  );
  const plan = result?.plan;
  const hasDayMismatch = Boolean(
    plan && plan.status === 'plan' && getPlanDayCount(plan) !== form.durationDays,
  );

  async function validatePlaces(nextPlan: AiImportPlan) {
    if (nextPlan.status !== 'plan') {
      setValidationStatus('idle');
      setValidatedDays([]);
      return;
    }

    setValidationStatus('loading');
    const destination = nextPlan.destination || form.destination || 'Travel';
    const nextValidatedDays: ValidatedDay[] = [];

    for (const day of nextPlan.days) {
      const places: ValidatedPlace[] = [];

      for (const place of day.places) {
        try {
          const response = await searchGooglePlaces({
            destination,
            category: place.category,
            query: place.name,
          });
          const candidate = response.results[0];
          places.push(
            candidate
              ? { ...place, status: 'resolved', result: candidate }
              : {
                  ...place,
                  status: 'unresolved',
                  reason: '일치하는 Google Places 후보를 찾지 못했습니다.',
                },
          );
        } catch (placeError) {
          places.push({
            ...place,
            status: 'unresolved',
            reason:
              placeError instanceof Error
                ? placeError.message
                : 'Google Places 검증에 실패했습니다.',
          });
        }
      }

      nextValidatedDays.push({ day: day.day, places });
    }

    setValidatedDays(nextValidatedDays);
    setValidationStatus('complete');
  }

  async function importUrl(clarificationChoice?: string) {
    if (!url.trim()) {
      return;
    }

    setStatus('loading');
    setError('');
    setApplyStatus('idle');
    setValidationStatus('idle');
    setValidatedDays([]);
    setSelectedClarification(clarificationChoice ?? '');

    try {
      const response = await fetch('/api/ai-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          ...(clarificationChoice ? { clarificationChoice } : {}),
          journey: {
            destination: form.destination || 'Travel',
            country: form.country,
            startDate: form.startDate,
            endDate: addDays(form.startDate, form.durationDays - 1),
            dayCount: form.durationDays,
          },
        }),
      });
      const data = (await response.json()) as
        | AiImportResult
        | { error?: { message?: string } };

      if (!response.ok || !('plan' in data)) {
        throw new Error(
          'error' in data
            ? data.error?.message || 'Unable to import this URL.'
            : 'Unable to import this URL.',
        );
      }

      setResult(data);
      if (data.plan.destination) {
        setForm((current) => ({
          ...current,
          title: current.title || data.plan.destination || '',
          destination: current.destination || data.plan.destination || '',
          durationDays: data.plan.durationDays ?? current.durationDays,
        }));
      }
      setStatus('success');
      await validatePlaces(data.plan);
    } catch (importError) {
      setStatus('error');
      setError(
        importError instanceof Error
          ? importError.message
          : '여행 링크를 불러오지 못했습니다.',
      );
    }
  }

  function createFromReview() {
    if (!plan || plan.status !== 'plan') {
      return;
    }
    if (hasDayMismatch || validationStatus !== 'complete' || resolvedCount === 0) {
      setApplyStatus('error');
      setError('Day 수와 검증된 장소를 확인한 뒤 생성할 수 있습니다.');
      return;
    }

    setApplyStatus('creating');
    setError('');

    try {
      const journey = createJourney(buildDraft(form));

      for (const day of validatedDays) {
        const targetDay = journey.days.find((item) => item.dayNumber === day.day);
        if (!targetDay) {
          continue;
        }

        for (const place of day.places) {
          if (place.status !== 'resolved' || !place.result) {
            continue;
          }
          addItineraryItem(targetDay.id, {
            placeName: place.result.name,
            ...(place.result.address
              ? { formattedAddress: place.result.address }
              : {}),
            latitude: place.result.latitude,
            longitude: place.result.longitude,
            status: 'planned',
          });
        }
      }

      window.location.href = `/journeys/${journey.id}?tab=itinerary`;
    } catch (createError) {
      setApplyStatus('error');
      setError(
        createError instanceof Error
          ? createError.message
          : 'Journey를 생성하지 못했습니다.',
      );
    }
  }

  if (mode === 'manual') {
    return (
      <div>
        <div className="mx-auto max-w-6xl px-5 pt-4 md:px-10">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold"
            onClick={() => setMode('choose')}
            type="button"
          >
            <ArrowLeft size={16} />
            시작 방법
          </button>
        </div>
        <JourneyForm />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-4 md:grid-cols-[0.8fr_1.2fr] md:px-10">
      <aside>
        <p className="text-sm uppercase tracking-[0.24em] text-accent">
          Create Journey
        </p>
        <h1 className="mt-4 font-heading text-6xl leading-none md:text-8xl">
          Start your way.
        </h1>
        <p className="mt-6 max-w-sm leading-7 text-muted-foreground">
          직접 기록을 만들거나, 여행 글 URL에서 일정 초안을 가져와 검토 후 시작하세요.
        </p>
      </aside>

      <section className="rounded-lg bg-white p-5 md:p-8">
        {mode === 'choose' ? (
          <div className="grid gap-4">
            <button
              className="rounded-lg border border-border bg-background p-6 text-left transition hover:border-accent"
              onClick={() => setMode('manual')}
              type="button"
            >
              <Pencil className="text-accent" />
              <p className="mt-4 text-2xl font-black">직접 만들기</p>
              <p className="mt-2 leading-7 text-muted-foreground">
                기존처럼 여행 정보와 커버 사진을 직접 선택합니다.
              </p>
            </button>
            <button
              className="rounded-lg border border-border bg-background p-6 text-left transition hover:border-accent"
              onClick={() => setMode('link')}
              type="button"
            >
              <Link2 className="text-accent" />
              <p className="mt-4 text-2xl font-black">여행 링크로 만들기</p>
              <p className="mt-2 leading-7 text-muted-foreground">
                여행 글을 분석해 일정 초안을 만들고, 검토 후 Planner에 저장합니다.
              </p>
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            <button
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold"
              onClick={() => setMode('choose')}
              type="button"
            >
              <ArrowLeft size={16} />
              시작 방법
            </button>

            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-accent">
                <Sparkles size={16} />
                AI Import
              </p>
              <h2 className="mt-2 text-3xl font-black">여행 링크로 만들기</h2>
            </div>

            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void importUrl();
              }}
            >
              <input
                className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/travel-article"
                type="url"
                value={url}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      destination: event.target.value,
                    }))
                  }
                  placeholder="Destination hint"
                  value={form.destination}
                />
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                  type="date"
                  value={form.startDate}
                />
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  min={1}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      durationDays: Math.max(Number(event.target.value), 1),
                    }))
                  }
                  type="number"
                  value={form.durationDays}
                />
              </div>
              <button
                className="min-h-12 rounded-full bg-foreground px-6 font-bold text-background disabled:opacity-60"
                disabled={status === 'loading'}
                type="submit"
              >
                {status === 'loading' ? '가져오는 중...' : '일정 초안 만들기'}
              </button>
            </form>

            {error ? (
              <p className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm font-bold text-accent">
                {error}
              </p>
            ) : null}

            {plan ? (
              <div className="grid gap-5 border-t border-border pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-background">
                    {plan.status}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">
                    {result?.content.title}
                  </span>
                </div>

                {plan.status === 'clarification' ? (
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="font-black">확인이 필요합니다</p>
                    <p className="mt-2 leading-7 text-muted-foreground">
                      {plan.question ?? '선택지를 확인해 주세요.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {plan.options.map((option) => (
                        <button
                          className={`rounded-full border px-3 py-2 text-sm font-bold ${
                            selectedClarification === option
                              ? 'border-accent bg-accent text-white'
                              : 'border-border bg-white'
                          }`}
                          disabled={status === 'loading'}
                          key={option}
                          onClick={() => void importUrl(option)}
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-bold">Destination</span>
                        <input
                          className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              destination: event.target.value,
                              title: current.title || event.target.value,
                            }))
                          }
                          value={form.destination}
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-bold">Country</span>
                        <input
                          className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              country: event.target.value,
                            }))
                          }
                          placeholder="Japan"
                          value={form.country}
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-bold">Start date</span>
                        <input
                          className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              startDate: event.target.value,
                            }))
                          }
                          type="date"
                          value={form.startDate}
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-bold">Duration</span>
                        <input
                          className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                          min={1}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              durationDays: Math.max(Number(event.target.value), 1),
                            }))
                          }
                          type="number"
                          value={form.durationDays}
                        />
                      </label>
                    </div>

                    {hasDayMismatch ? (
                      <p className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm font-bold text-accent">
                        AI 일정은 {getPlanDayCount(plan)}일입니다. Duration을 맞춘 뒤 생성하세요.
                      </p>
                    ) : null}

                    <div className="grid gap-3">
                      {validatedDays.map((day) => (
                        <div
                          className="rounded-lg border border-border bg-background p-4"
                          key={day.day}
                        >
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
                            DAY {String(day.day).padStart(2, '0')}
                          </p>
                          <div className="mt-3 grid gap-2">
                            {day.places.map((place) => (
                              <div
                                className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3"
                                key={`${day.day}-${place.name}-${place.source}`}
                              >
                                <div>
                                  <p className="font-black">{place.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {place.result?.address ?? place.reason}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-black ${
                                    place.status === 'resolved'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-zinc-200 text-zinc-700'
                                  }`}
                                >
                                  {place.status === 'resolved' ? '검증 성공' : '검증 실패'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      className="min-h-12 rounded-full bg-accent px-6 font-bold text-white disabled:opacity-60"
                      disabled={
                        applyStatus === 'creating' ||
                        validationStatus !== 'complete' ||
                        hasDayMismatch ||
                        resolvedCount === 0 ||
                        !form.destination.trim() ||
                        !form.startDate
                      }
                      onClick={createFromReview}
                      type="button"
                    >
                      {applyStatus === 'creating'
                        ? 'Journey 생성 중...'
                        : `검증된 ${resolvedCount}개 장소로 Journey 생성`}
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
