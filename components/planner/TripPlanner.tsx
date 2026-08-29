'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Coffee,
  ExternalLink,
  Edit3,
  Landmark,
  ListPlus,
  MapPin,
  PenLine,
  Search,
  Sparkles,
  BedDouble,
  Trash2,
  Utensils,
} from 'lucide-react';
import {
  GoogleJourneyMap,
  type MapPlace,
  type MapViewport,
} from '@/components/maps/GoogleJourneyMap';
import { PlacePicker, type SelectedPlace } from '@/components/maps/PlacePicker';
import { formatShortDate } from '@/lib/dates';
import {
  fetchGooglePlaceDetail,
  searchGooglePlaces,
  type PlaceDetail,
  type PlaceSearchResult,
} from '@/lib/google-place-search';
import type { AiImportPlan } from '@/lib/ai-import/schema';
import {
  addItineraryItem,
  deleteItineraryItem,
  moveItineraryItem,
  updateItineraryItem,
} from '@/lib/journey-store';
import { orderedItinerary } from '@/lib/planner';
import type { Day, ItineraryItem, Journey } from '@/types/journey';

const markerPalette = [
  { background: '#ff5a36', text: '#ffffff' },
  { background: '#f97316', text: '#ffffff' },
  { background: '#eab308', text: '#111111' },
  { background: '#16a34a', text: '#ffffff' },
  { background: '#0284c7', text: '#ffffff' },
  { background: '#7c3aed', text: '#ffffff' },
  { background: '#db2777', text: '#ffffff' },
];

const explorerMarkerStyle = { background: '#111111', text: '#ffffff' };

const explorerCategories = [
  { label: '맛집', icon: Utensils },
  { label: '카페', icon: Coffee },
  { label: '명소', icon: Landmark },
  { label: '숙소', icon: BedDouble },
];

function markerStyle(label?: string) {
  const index = Math.max(Number(label ?? '1') - 1, 0);
  return markerPalette[index % markerPalette.length];
}

type PlannerFormState = {
  item?: ItineraryItem;
  dayId: string;
  time: string;
  placeName: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  note: string;
};

type ExploreStatus = 'idle' | 'loading' | 'success' | 'cached' | 'error';
type DetailStatus = 'idle' | 'loading' | 'success' | 'cached' | 'error';
type AddFeedback = {
  resultId: string;
  message: string;
} | null;
type AiImportStatus = 'idle' | 'loading' | 'success' | 'error';
type AiImportValidationStatus = 'idle' | 'loading' | 'complete';
type AiImportApplyStatus = 'idle' | 'applying' | 'applied' | 'error';
type AiImportResult = {
  content: {
    title: string;
    url: string;
  };
  plan: AiImportPlan;
};
type AiImportValidatedPlace =
  AiImportPlan['days'][number]['places'][number] & {
    status: 'resolved' | 'unresolved';
    result?: PlaceSearchResult;
    fromCache?: boolean;
    reason?: string;
  };
type AiImportValidatedDay = {
  day: number;
  places: AiImportValidatedPlace[];
};

function getAiImportPlanDayCount(plan: AiImportPlan) {
  const lastPlannedDay = Math.max(0, ...plan.days.map((day) => day.day));
  return plan.durationDays ?? lastPlannedDay;
}

export function TripPlanner({
  journey,
  onRefresh,
  onCreateMoment,
}: {
  journey: Journey;
  onRefresh: () => void;
  onCreateMoment: (dayId: string, item: ItineraryItem) => void;
}) {
  const [form, setForm] = useState<PlannerFormState | null>(null);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [plannerView, setPlannerView] = useState<'schedule' | 'explore'>(
    'schedule',
  );
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreCategory, setExploreCategory] = useState('맛집');
  const [exploreResults, setExploreResults] = useState<PlaceSearchResult[]>([]);
  const [exploreStatus, setExploreStatus] = useState<ExploreStatus>('idle');
  const [exploreError, setExploreError] = useState('');
  const [mapViewport, setMapViewport] = useState<MapViewport | undefined>();
  const [addPanelResultId, setAddPanelResultId] = useState<string | null>(null);
  const [addFeedback, setAddFeedback] = useState<AddFeedback>(null);
  const [aiImportUrl, setAiImportUrl] = useState('');
  const [aiImportStatus, setAiImportStatus] =
    useState<AiImportStatus>('idle');
  const [aiImportError, setAiImportError] = useState('');
  const [aiImportResult, setAiImportResult] = useState<AiImportResult | null>(
    null,
  );
  const [aiImportClarificationChoice, setAiImportClarificationChoice] =
    useState('');
  const [aiImportValidationStatus, setAiImportValidationStatus] =
    useState<AiImportValidationStatus>('idle');
  const [aiImportValidatedDays, setAiImportValidatedDays] = useState<
    AiImportValidatedDay[]
  >([]);
  const [aiImportApplyStatus, setAiImportApplyStatus] =
    useState<AiImportApplyStatus>('idle');
  const [aiImportApplyError, setAiImportApplyError] = useState('');

  const markerLabels = useMemo(() => {
    let markerIndex = 0;
    return journey.days.reduce<Record<string, string>>((labels, day) => {
      orderedItinerary(day.itinerary ?? []).forEach((item) => {
        markerIndex += 1;
        labels[item.id] = String(markerIndex);
      });
      return labels;
    }, {});
  }, [journey]);

  const plannedPlaces = useMemo<MapPlace[]>(
    () =>
      journey.days.flatMap((day) =>
        orderedItinerary(day.itinerary ?? []).map((item) => {
          const style = markerStyle(markerLabels[item.id]);
          return {
            id: item.id,
            dayNumber: day.dayNumber,
            place: item.placeName,
            query: [
              item.placeName,
              item.formattedAddress,
              journey.destination,
              journey.country,
            ]
              .filter(Boolean)
              .join(', '),
            latitude: item.latitude,
            longitude: item.longitude,
            markerLabel: markerLabels[item.id],
            markerColor: style.background,
            markerTextColor: style.text,
          };
        }),
      ),
    [journey, markerLabels],
  );
  const pinnedPlaces = plannedPlaces.filter(
    (place) =>
      typeof place.latitude === 'number' &&
      typeof place.longitude === 'number',
  );
  const explorePlaces = useMemo<MapPlace[]>(
    () =>
      exploreResults.map((result, index) => {
        return {
          id: result.id,
          dayNumber: 0,
          place: result.name,
          query: [result.name, result.address, journey.destination]
            .filter(Boolean)
            .join(', '),
          latitude: result.latitude,
          longitude: result.longitude,
          markerLabel: `E${index + 1}`,
          markerColor: explorerMarkerStyle.background,
          markerTextColor: explorerMarkerStyle.text,
        };
      }),
    [exploreResults, journey.destination],
  );
  const visibleMapPlaces = useMemo(
    () =>
      plannerView === 'explore' && explorePlaces.length > 0
        ? [...plannedPlaces, ...explorePlaces]
        : plannedPlaces,
    [explorePlaces, plannedPlaces, plannerView],
  );

  function openNewItem(dayId: string) {
    setForm({
      dayId,
      time: '',
      placeName: '',
      note: '',
    });
  }

  function openEditItem(dayId: string, item: ItineraryItem) {
    setForm({
      item,
      dayId,
      time: item.time ?? '',
      placeName: item.placeName,
      formattedAddress: item.formattedAddress,
      latitude: item.latitude,
      longitude: item.longitude,
      note: item.note ?? '',
    });
  }

  function savePlan() {
    if (!form?.placeName.trim()) {
      return;
    }

    const payload = {
      time: form.time,
      placeName: form.placeName,
      formattedAddress: form.formattedAddress,
      latitude: form.latitude,
      longitude: form.longitude,
      note: form.note,
      status: 'planned' as const,
    };

    if (form.item) {
      updateItineraryItem(form.item.id, payload);
    } else {
      addItineraryItem(form.dayId, payload);
    }

    setForm(null);
    onRefresh();
  }

  function removePlan(itemId: string) {
    if (window.confirm('Delete this planned place?')) {
      deleteItineraryItem(itemId);
      onRefresh();
    }
  }

  function movePlan(itemId: string, direction: 'up' | 'down') {
    moveItineraryItem(itemId, direction);
    onRefresh();
  }

  async function searchExplorePlaces() {
    setExploreStatus('loading');
    setExploreError('');
    setActivePlaceId(null);

    try {
      const response = await searchGooglePlaces({
        destination: journey.destination,
        category: exploreCategory,
        query: exploreQuery,
        viewport: mapViewport,
      });
      setExploreResults(response.results);
      setExploreStatus(response.fromCache ? 'cached' : 'success');
    } catch (error) {
      setExploreStatus('error');
      setExploreError(
        error instanceof Error
          ? error.message
          : 'Unable to search Google Places.',
      );
    }
  }

  function addExploreResultToDay(dayId: string, result: PlaceSearchResult) {
    const targetDay = journey.days.find((day) => day.id === dayId);
    addItineraryItem(dayId, {
      placeName: result.name,
      ...(result.address ? { formattedAddress: result.address } : {}),
      latitude: result.latitude,
      longitude: result.longitude,
      status: 'planned',
    });
    setAddPanelResultId(null);
    setAddFeedback({
      resultId: result.id,
      message: `✓ DAY ${targetDay?.dayNumber ?? ''}에 추가했습니다`,
    });
    onRefresh();
  }

  function applyAiImportPlan() {
    const plan = aiImportResult?.plan;
    if (!plan) {
      return;
    }

    const planDayCount = getAiImportPlanDayCount(plan);
    if (planDayCount !== journey.days.length) {
      setAiImportApplyStatus('error');
      setAiImportApplyError(
        `AI 일정은 ${planDayCount}일이고 현재 Journey는 ${journey.days.length}일입니다. Day를 임의로 추가하거나 삭제하지 않으므로 적용할 수 없습니다.`,
      );
      return;
    }

    if (aiImportValidationStatus !== 'complete') {
      setAiImportApplyStatus('error');
      setAiImportApplyError('Google Places 검증이 끝난 뒤 적용할 수 있습니다.');
      return;
    }

    setAiImportApplyStatus('applying');
    setAiImportApplyError('');

    try {
      let savedCount = 0;

      for (const importedDay of aiImportValidatedDays) {
        const journeyDay = journey.days.find(
          (day) => day.dayNumber === importedDay.day,
        );
        if (!journeyDay) {
          throw new Error(`DAY ${importedDay.day}을 현재 Journey에서 찾지 못했습니다.`);
        }

        for (const place of importedDay.places) {
          if (place.status !== 'resolved' || !place.result) {
            continue;
          }

          addItineraryItem(journeyDay.id, {
            placeName: place.result.name,
            ...(place.result.address
              ? { formattedAddress: place.result.address }
              : {}),
            latitude: place.result.latitude,
            longitude: place.result.longitude,
            status: 'planned',
          });
          savedCount += 1;
        }
      }

      if (savedCount === 0) {
        throw new Error('저장할 수 있는 검증 완료 장소가 없습니다.');
      }

      setAiImportApplyStatus('applied');
      setPlannerView('schedule');
      onRefresh();
    } catch (error) {
      setAiImportApplyStatus('error');
      setAiImportApplyError(
        error instanceof Error
          ? error.message
          : 'AI 일정을 Planner에 적용하지 못했습니다.',
      );
    }
  }

  async function validateAiImportPlaces(plan: AiImportPlan) {
    setAiImportValidationStatus('loading');
    setAiImportValidatedDays([]);

    const destination = plan.destination || journey.destination;
    const validatedDays: AiImportValidatedDay[] = [];

    for (const day of plan.days) {
      const validatedPlaces: AiImportValidatedPlace[] = [];

      for (const place of day.places) {
        try {
          const response = await searchGooglePlaces({
            destination,
            category: place.category,
            query: place.name,
            viewport: mapViewport,
          });
          const result = response.results[0];

          if (result) {
            validatedPlaces.push({
              ...place,
              status: 'resolved',
              result,
              fromCache: response.fromCache,
            });
          } else {
            validatedPlaces.push({
              ...place,
              status: 'unresolved',
              reason: '일치하는 Google Places 후보를 찾지 못했습니다.',
            });
          }
        } catch (error) {
          validatedPlaces.push({
            ...place,
            status: 'unresolved',
            reason:
              error instanceof Error
                ? error.message
                : 'Google Places 검증에 실패했습니다.',
          });
        }
      }

      validatedDays.push({
        day: day.day,
        places: validatedPlaces,
      });
    }

    setAiImportValidatedDays(validatedDays);
    setAiImportValidationStatus('complete');
  }

  async function importPlanFromUrl(clarificationChoice?: string) {
    const url = aiImportUrl.trim();
    if (!url) {
      return;
    }

    setAiImportStatus('loading');
    setAiImportError('');
    setAiImportResult(null);
    setAiImportValidationStatus('idle');
    setAiImportValidatedDays([]);
    setAiImportApplyStatus('idle');
    setAiImportApplyError('');
    setAiImportClarificationChoice(clarificationChoice ?? '');

    try {
      const response = await fetch('/api/ai-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          ...(clarificationChoice ? { clarificationChoice } : {}),
          journey: {
            destination: journey.destination,
            country: journey.country,
            startDate: journey.startDate,
            endDate: journey.endDate,
            dayCount: journey.days.length,
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

      setAiImportResult(data);
      setAiImportStatus('success');
      await validateAiImportPlaces(data.plan);
    } catch (error) {
      setAiImportStatus('error');
      setAiImportValidationStatus('idle');
      setAiImportError(
        error instanceof Error ? error.message : 'Unable to import this URL.',
      );
    }
  }

  return (
    <section className="grid gap-10">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-accent">
            Trip Planner
          </p>
          <h2 className="mt-3 font-heading text-5xl leading-none md:text-6xl">
            Plan your days
          </h2>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Build the places you plan to visit before the trip. These plans stay separate from your actual travel moments.
          </p>
        </div>
        <div className="rounded-lg border border-border p-5">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <CalendarDays size={16} />
            {journey.destination}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="font-heading text-4xl leading-none">
                {journey.days.length}
              </p>
              <p className="mt-1 font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Days
              </p>
            </div>
            <div>
              <p className="font-heading text-4xl leading-none">
                {plannedPlaces.length}
              </p>
              <p className="mt-1 font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Plans
              </p>
            </div>
            <div>
              <p className="font-heading text-4xl leading-none">
                {pinnedPlaces.length}
              </p>
              <p className="mt-1 font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Pins
              </p>
            </div>
          </div>
        </div>
      </div>

      <AiImportPanel
        result={aiImportResult}
        status={aiImportStatus}
        applyError={aiImportApplyError}
        applyStatus={aiImportApplyStatus}
        journeyDayCount={journey.days.length}
        validationStatus={aiImportValidationStatus}
        validatedDays={aiImportValidatedDays}
        url={aiImportUrl}
        error={aiImportError}
        onApply={applyAiImportPlan}
        onClarificationSelect={(option) => void importPlanFromUrl(option)}
        onSubmit={importPlanFromUrl}
        onUrlChange={setAiImportUrl}
        selectedClarification={aiImportClarificationChoice}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(380px,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="min-w-0">
          <div className="mb-8 inline-flex rounded-full border border-border bg-background p-1">
            <button
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                plannerView === 'schedule'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setPlannerView('schedule')}
              type="button"
            >
              내 일정
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                plannerView === 'explore'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setPlannerView('explore')}
              type="button"
            >
              장소 찾기
            </button>
          </div>

          <div hidden={plannerView !== 'schedule'} className="grid gap-12">
            {journey.days.map((day) => (
              <PlannerDay
                day={day}
                key={day.id}
                markerLabels={markerLabels}
                activePlaceId={activePlaceId}
                onAdd={() => openNewItem(day.id)}
                onDelete={removePlan}
                onEdit={(item) => openEditItem(day.id, item)}
                onMove={movePlan}
                onCreateMoment={(item) => onCreateMoment(day.id, item)}
                onSelectPlace={setActivePlaceId}
              />
            ))}
          </div>

          <div hidden={plannerView !== 'explore'}>
            <PlaceExplorerShell
              activeResultId={activePlaceId}
              addFeedback={addFeedback}
              addPanelResultId={addPanelResultId}
              category={exploreCategory}
              days={journey.days}
              destination={journey.destination}
              error={exploreError}
              query={exploreQuery}
              results={exploreResults}
              status={exploreStatus}
              onAddToDay={addExploreResultToDay}
              onCategoryChange={setExploreCategory}
              onQueryChange={setExploreQuery}
              onSearch={searchExplorePlaces}
              onSelectResult={setActivePlaceId}
              onToggleAddPanel={(resultId) => {
                setAddFeedback(null);
                setAddPanelResultId((current) =>
                  current === resultId ? null : resultId,
                );
              }}
            />
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-20">
          {visibleMapPlaces.length > 0 || plannerView === 'explore' ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <GoogleJourneyMap
                activePlaceId={activePlaceId}
                places={visibleMapPlaces}
                onPlaceClick={setActivePlaceId}
                onViewportChange={setMapViewport}
                showRoute={plannerView !== 'explore'}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-muted-foreground">
              <p className="font-bold text-foreground">
                No planned places pinned yet.
              </p>
              <p className="mt-1">
                Select places from Google to save coordinates for your planner map.
              </p>
            </div>
          )}
        </div>
      </div>

      {form ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/40 p-4 md:items-center md:justify-center">
          <form
            className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-lg bg-white p-5 md:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              savePlan();
            }}
          >
            <h2 className="text-3xl font-black">
              {form.item ? 'Edit planned place' : 'Add planned place'}
            </h2>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold">Time optional</span>
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) => setForm({ ...form, time: event.target.value })}
                  type="time"
                  value={form.time}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">Place</span>
                <input
                  className="min-h-12 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) =>
                    setForm({ ...form, placeName: event.target.value })
                  }
                  required
                  value={form.placeName}
                />
              </label>
              <div className="grid gap-2">
                <span className="text-sm font-bold">Find place on Google</span>
                <PlacePicker
                  destination={journey.destination}
                  onSelect={(place: SelectedPlace) =>
                    setForm({
                      ...form,
                      placeName: place.place,
                      formattedAddress: place.formattedAddress,
                      latitude: place.latitude,
                      longitude: place.longitude,
                    })
                  }
                  selectedPlace={form.formattedAddress}
                />
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-bold">Memo optional</span>
                <textarea
                  className="min-h-28 rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
                  onChange={(event) =>
                    setForm({ ...form, note: event.target.value })
                  }
                  value={form.note}
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
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
                Save plan
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function AiImportPanel({
  url,
  status,
  error,
  result,
  applyStatus,
  applyError,
  journeyDayCount,
  validationStatus,
  validatedDays,
  onApply,
  onClarificationSelect,
  onUrlChange,
  onSubmit,
  selectedClarification,
}: {
  url: string;
  status: AiImportStatus;
  error: string;
  result: AiImportResult | null;
  applyStatus: AiImportApplyStatus;
  applyError: string;
  journeyDayCount: number;
  validationStatus: AiImportValidationStatus;
  validatedDays: AiImportValidatedDay[];
  onApply: () => void;
  onClarificationSelect: (option: string) => void;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  selectedClarification: string;
}) {
  const plan = result?.plan;
  const planDayCount = plan ? getAiImportPlanDayCount(plan) : 0;
  const hasDayMismatch = Boolean(plan && planDayCount !== journeyDayCount);
  const resolvedCount = validatedDays.reduce(
    (count, day) =>
      count +
      day.places.filter(
        (place) => place.status === 'resolved' && Boolean(place.result),
      ).length,
    0,
  );
  const displayDays: AiImportValidatedDay[] =
    validatedDays.length > 0
      ? validatedDays
      : plan?.days.map((day) => ({
          day: day.day,
          places: day.places.map((place) => ({
            ...place,
            status: 'unresolved' as const,
            reason: '아직 Google Places 검증 전입니다.',
          })),
        })) ?? [];

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-accent">
            <Sparkles size={16} />
            AI Import
          </p>
          <h3 className="mt-2 text-2xl font-black">AI로 일정 가져오기</h3>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            여행 글 URL을 넣으면 내용을 읽고, 저장 전 검토할 Day별 일정 초안을 만듭니다.
          </p>
        </div>
      </div>

      <form
        className="mt-5 flex flex-col gap-3 md:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input
          className="min-h-12 min-w-0 flex-1 rounded-lg border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://example.com/travel-article"
          type="url"
          value={url}
        />
        <button
          className="rounded-full bg-foreground px-5 py-3 text-sm font-black text-background transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          disabled={status === 'loading'}
          type="submit"
        >
          {status === 'loading' ? '가져오는 중...' : '일정 초안 만들기'}
        </button>
      </form>

      {status === 'error' ? (
        <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-muted-foreground">
          <p className="font-black text-accent">AI Import failed.</p>
          <p className="mt-2 leading-6">{error}</p>
        </div>
      ) : null}

      {plan ? (
        <div className="mt-5 grid gap-4 border-t border-border pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-background">
              {plan.status}
            </span>
            <span className="text-sm font-bold text-muted-foreground">
              {plan.contentType}
            </span>
            {typeof plan.durationDays === 'number' ? (
              <span className="text-sm font-bold text-muted-foreground">
                {plan.durationDays} days
              </span>
            ) : null}
          </div>

          {result.content.title ? (
            <p className="text-sm font-bold text-muted-foreground">
              Source: {result.content.title}
            </p>
          ) : null}

          {plan.destination ? (
            <p className="text-xl font-black">{plan.destination}</p>
          ) : null}

          {plan.status === 'clarification' ? (
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="font-black">확인이 필요합니다</p>
              <p className="mt-2 leading-7 text-muted-foreground">
                {plan.question ?? plan.durationNote ?? '선택지를 확인해 주세요.'}
              </p>
              {plan.options.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {plan.options.map((option) => (
                    <button
                      className={`rounded-full border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        selectedClarification === option
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-white hover:border-accent hover:text-accent'
                      }`}
                      disabled={status === 'loading'}
                      key={option}
                      onClick={() => onClarificationSelect(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {plan.days.length > 0 ? (
            <div className="grid gap-3">
              {validationStatus === 'loading' ? (
                <p className="rounded-lg border border-border bg-background p-4 text-sm font-bold text-muted-foreground">
                  Google Places에서 실제 장소 후보를 확인하는 중입니다.
                </p>
              ) : null}
              {displayDays.map((day) => (
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
                        className="grid gap-3 border-t border-border/70 pt-3"
                        key={`${day.day}-${place.name}-${place.source}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-black">{place.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {place.category}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${
                                place.source === 'article'
                                  ? 'bg-accent/10 text-accent'
                                  : 'bg-foreground/10 text-foreground'
                              }`}
                            >
                              {place.source}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${
                                place.status === 'resolved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-zinc-200 text-zinc-700'
                              }`}
                            >
                              {place.status === 'resolved'
                                ? '검증 성공'
                                : '검증 실패'}
                            </span>
                          </div>
                        </div>
                        {place.result ? (
                          <div className="rounded-lg border border-border/70 bg-white p-3 text-sm text-muted-foreground">
                            <p className="font-black text-foreground">
                              {place.result.name}
                            </p>
                            {place.result.address ? (
                              <p className="mt-1 leading-6">
                                {place.result.address}
                              </p>
                            ) : null}
                            <p className="mt-1 text-xs">
                              좌표와 장소 ID를 확인했습니다.
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm leading-6 text-muted-foreground">
                            {place.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {hasDayMismatch ? (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm leading-6 text-muted-foreground">
              <p className="font-black text-accent">Day 수 확인 필요</p>
              <p className="mt-1">
                AI 일정은 {planDayCount}일이고 현재 Journey는 {journeyDayCount}
                일입니다. 기존 Day를 임의로 추가하거나 삭제하지 않기 때문에 바로
                적용할 수 없습니다.
              </p>
            </div>
          ) : null}

          {applyStatus === 'error' ? (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm leading-6 text-muted-foreground">
              <p className="font-black text-accent">Planner 적용 실패</p>
              <p className="mt-1">{applyError}</p>
            </div>
          ) : null}

          {applyStatus === 'applied' ? (
            <p className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-black text-green-800">
              검증된 장소를 Planner에 추가했습니다. unresolved 항목은 저장하지 않았습니다.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm leading-6 text-muted-foreground">
              검증 성공 {resolvedCount}개만 기존 Planner 일정으로 저장합니다.
            </p>
            <button
              className="rounded-full bg-accent px-5 py-3 text-sm font-black text-white transition hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                applyStatus === 'applying' ||
                applyStatus === 'applied' ||
                validationStatus !== 'complete' ||
                hasDayMismatch ||
                resolvedCount === 0
              }
              onClick={onApply}
              type="button"
            >
              {applyStatus === 'applying'
                ? '적용 중...'
                : applyStatus === 'applied'
                  ? '적용 완료'
                  : '이 일정 사용하기'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PlaceExplorerShell({
  destination,
  query,
  category,
  days,
  results,
  status,
  error,
  activeResultId,
  addPanelResultId,
  addFeedback,
  onQueryChange,
  onCategoryChange,
  onSearch,
  onSelectResult,
  onToggleAddPanel,
  onAddToDay,
}: {
  destination: string;
  query: string;
  category: string;
  days: Day[];
  results: PlaceSearchResult[];
  status: ExploreStatus;
  error: string;
  activeResultId: string | null;
  addPanelResultId: string | null;
  addFeedback: AddFeedback;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSearch: () => void;
  onSelectResult: (resultId: string | null) => void;
  onToggleAddPanel: (resultId: string) => void;
  onAddToDay: (dayId: string, result: PlaceSearchResult) => void;
}) {
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [detailsByPlaceId, setDetailsByPlaceId] = useState<
    Record<string, PlaceDetail>
  >({});
  const [detailStatuses, setDetailStatuses] = useState<
    Record<string, DetailStatus>
  >({});
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!activeResultId) {
      return;
    }

    cardRefs.current[activeResultId]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [activeResultId]);

  async function toggleDetail(result: PlaceSearchResult) {
    if (openDetailId === result.id) {
      setOpenDetailId(null);
      return;
    }

    setOpenDetailId(result.id);
    onSelectResult(result.id);

    if (detailsByPlaceId[result.placeId]) {
      return;
    }

    setDetailStatuses((current) => ({
      ...current,
      [result.placeId]: 'loading',
    }));
    setDetailErrors((current) => ({
      ...current,
      [result.placeId]: '',
    }));

    try {
      const response = await fetchGooglePlaceDetail(result.placeId);
      setDetailsByPlaceId((current) => ({
        ...current,
        [result.placeId]: response.detail,
      }));
      setDetailStatuses((current) => ({
        ...current,
        [result.placeId]: response.fromCache ? 'cached' : 'success',
      }));
    } catch (error) {
      setDetailStatuses((current) => ({
        ...current,
        [result.placeId]: 'error',
      }));
      setDetailErrors((current) => ({
        ...current,
        [result.placeId]:
          error instanceof Error
            ? error.message
            : 'Unable to load place details.',
      }));
    }
  }

  return (
    <section className="grid gap-6 border-t border-border pt-8">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-accent">
          Place Explorer
        </p>
        <h3 className="mt-1 text-4xl font-black">장소 찾기</h3>
        <p className="mt-3 max-w-lg leading-7 text-muted-foreground">
          {destination} 주변에서 일정에 추가할 후보를 검색합니다. 입력 중에는
          요청하지 않고, 버튼을 눌렀을 때만 Google Places를 호출합니다.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-bold">검색어</span>
        <span className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-accent">
          <Search className="shrink-0 text-muted-foreground" size={18} />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={`${destination}에서 찾고 싶은 장소`}
            value={query}
          />
        </span>
      </label>

      <div className="grid gap-3">
        <p className="text-sm font-bold">카테고리</p>
        <div className="flex flex-wrap gap-2">
          {explorerCategories.map(({ label, icon: Icon }) => (
            <button
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-black transition ${
                category === label
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-background text-muted-foreground hover:border-accent hover:text-accent'
              }`}
              key={label}
              onClick={() => onCategoryChange(label)}
              type="button"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold">검색 결과</p>
          <button
            className="rounded-full border border-border px-4 py-2 text-xs font-black text-muted-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            disabled={status === 'loading'}
            onClick={onSearch}
            type="button"
          >
            {status === 'loading' ? '검색 중...' : '이 지역에서 검색'}
          </button>
        </div>
        {status === 'error' ? (
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-muted-foreground">
            <p className="font-black text-accent">Places search failed.</p>
            <p className="mt-2 leading-6">{error}</p>
          </div>
        ) : null}
        {status === 'cached' ? (
          <p className="text-xs font-bold text-muted-foreground">
            같은 검색 조건의 세션 캐시 결과를 사용했습니다.
          </p>
        ) : null}
        {results.length > 0 ? (
          <div className="grid gap-3">
            {results.map((result, index) => {
              const isActive = activeResultId === result.id;
              const isOpen = openDetailId === result.id;
              const isAddPanelOpen = addPanelResultId === result.id;
              const detail = detailsByPlaceId[result.placeId];
              const detailStatus = detailStatuses[result.placeId] ?? 'idle';
              const detailError = detailErrors[result.placeId];
              return (
                <article
                  className={`w-full rounded-lg border bg-background p-4 text-left transition ${
                    isActive
                      ? 'border-accent bg-accent/5 shadow-lg ring-2 ring-accent/25'
                      : 'border-border hover:border-accent/50 hover:shadow-md'
                  }`}
                  key={result.id}
                >
                  <button
                    className="flex w-full items-start gap-3 text-left"
                    aria-label={`${result.name} 지도에서 보기`}
                    onClick={() => onSelectResult(result.id)}
                    onMouseEnter={() => onSelectResult(result.id)}
                    onMouseLeave={() => onSelectResult(null)}
                    ref={(element) => {
                      cardRefs.current[result.id] = element;
                    }}
                    type="button"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm"
                      style={{
                        backgroundColor: explorerMarkerStyle.background,
                        color: explorerMarkerStyle.text,
                      }}
                    >
                      E{index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-black uppercase tracking-[0.14em] text-accent">
                        {result.category}
                      </span>
                      <span className="mt-1 block break-words text-xl font-black">
                        {result.name}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>
                          {typeof result.rating === 'number'
                            ? `Rating ${result.rating.toFixed(1)}`
                            : 'No rating'}
                        </span>
                      </span>
                      {result.address ? (
                        <span className="mt-2 block break-words text-sm leading-6 text-muted-foreground">
                          {result.address}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
                    <button
                      className="rounded-full border border-border px-3 py-2 text-sm font-black text-muted-foreground transition hover:border-accent hover:text-accent"
                      onClick={() => void toggleDetail(result)}
                      type="button"
                    >
                      {isOpen ? '접기' : '자세히 보기'}
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-2 text-sm font-black text-white transition hover:bg-foreground"
                      onClick={() => onToggleAddPanel(result.id)}
                      type="button"
                    >
                      <ListPlus size={15} />
                      일정에 추가
                    </button>
                    {addFeedback?.resultId === result.id ? (
                      <span className="text-sm font-black text-accent">
                        {addFeedback.message}
                      </span>
                    ) : null}
                  </div>
                  {isAddPanelOpen ? (
                    <div className="mt-3 grid gap-2 rounded-lg border border-border/80 bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                        추가할 Day 선택
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {days.map((day) => (
                          <button
                            className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition hover:border-accent hover:bg-accent/5"
                            key={day.id}
                            onClick={() => onAddToDay(day.id, result)}
                            type="button"
                          >
                            <span className="block font-black text-foreground">
                              DAY {String(day.dayNumber).padStart(2, '0')}
                            </span>
                            <span className="mt-1 block text-xs font-bold text-muted-foreground">
                              {formatShortDate(day.date)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    {isOpen ? (
                      <div className="mt-4 grid gap-4">
                        {detailStatus === 'loading' ? (
                          <p className="text-sm font-bold text-muted-foreground">
                            상세정보를 불러오는 중...
                          </p>
                        ) : null}
                        {detailStatus === 'error' ? (
                          <p className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm font-bold text-accent">
                            {detailError ?? '상세정보를 불러오지 못했습니다.'}
                          </p>
                        ) : null}
                        {detail ? (
                          <PlaceDetailPanel
                            detail={detail}
                            fromCache={detailStatus === 'cached'}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-muted-foreground">
            <p className="font-bold text-foreground">검색 결과가 없습니다.</p>
            <p className="mt-2 leading-7">
              검색어와 카테고리를 정한 뒤 이 지역에서 검색을 눌러주세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function PlaceDetailPanel({
  detail,
  fromCache,
}: {
  detail: PlaceDetail;
  fromCache: boolean;
}) {
  return (
    <div className="grid gap-4 text-sm text-muted-foreground">
      {detail.photoUrl ? (
        <figure>
          <img
            src={detail.photoUrl}
            alt="Google Places preview"
            className="h-40 w-full rounded-lg object-cover"
          />
          {detail.photoAttributions.length > 0 ? (
            <figcaption className="mt-2 text-xs">
              Photo:{' '}
              {detail.photoAttributions.map((author, index) => (
                <span key={`${author.name}-${index}`}>
                  {index > 0 ? ', ' : ''}
                  {author.uri ? (
                    <a
                      className="font-bold underline-offset-2 hover:underline"
                      href={author.uri}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {author.name}
                    </a>
                  ) : (
                    author.name
                  )}
                </span>
              ))}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <div className="grid gap-2 rounded-lg border border-border/70 p-3">
        <p className="font-black text-foreground">영업 정보</p>
        <p>{detail.openingText ?? '영업시간 정보가 없습니다.'}</p>
        {detail.businessStatus ? (
          <p className="text-xs font-bold uppercase tracking-[0.12em]">
            {detail.businessStatus.replace(/_/g, ' ')}
          </p>
        ) : null}
      </div>

      {detail.review ? (
        <div className="grid gap-2 rounded-lg border border-border/70 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-foreground">Google 리뷰</p>
            {typeof detail.review.rating === 'number' ? (
              <span className="text-xs font-bold">
                Rating {detail.review.rating.toFixed(1)}
              </span>
            ) : null}
          </div>
          {detail.review.text ? (
            <p className="overflow-hidden leading-6 [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]">
              {detail.review.text}
            </p>
          ) : (
            <p>리뷰 내용이 없습니다.</p>
          )}
          <p className="text-xs">
            {detail.review.authorUri ? (
              <a
                className="font-bold underline-offset-2 hover:underline"
                href={detail.review.authorUri}
                rel="noreferrer"
                target="_blank"
              >
                {detail.review.authorName ?? 'Google user'}
              </a>
            ) : (
              (detail.review.authorName ?? 'Google user')
            )}
            {detail.review.relativeTime ? ` · ${detail.review.relativeTime}` : ''}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-3 text-xs">
        <span>Powered by Google</span>
        {fromCache ? <span>Session cache</span> : null}
        {detail.googleMapsUri ? (
          <a
            className="inline-flex items-center gap-1 font-black text-foreground underline-offset-2 hover:underline"
            href={detail.googleMapsUri}
            rel="noreferrer"
            target="_blank"
          >
            Google Maps에서 더 보기
            <ExternalLink size={13} />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function PlannerDay({
  day,
  markerLabels,
  activePlaceId,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  onCreateMoment,
  onSelectPlace,
}: {
  day: Day;
  markerLabels: Record<string, string>;
  activePlaceId: string | null;
  onAdd: () => void;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (itemId: string) => void;
  onMove: (itemId: string, direction: 'up' | 'down') => void;
  onCreateMoment: (item: ItineraryItem) => void;
  onSelectPlace: (itemId: string | null) => void;
}) {
  const items = orderedItinerary(day.itinerary ?? []);

  return (
    <article className="border-t border-border pt-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-accent">
            Day {String(day.dayNumber).padStart(2, '0')}
          </p>
          <h3 className="mt-1 text-4xl font-black">{formatShortDate(day.date)}</h3>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-bold text-white"
          onClick={onAdd}
          type="button"
        >
          <ListPlus size={18} />
          Add place
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-muted-foreground">
          <p className="font-bold text-foreground">No plans yet.</p>
          <p className="mt-1">Add a place you want to visit.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item, index) => (
            <div
              className={`group relative rounded-lg border bg-background p-4 transition ${
                activePlaceId === item.id
                  ? 'border-accent bg-accent/5 shadow-lg ring-2 ring-accent/30'
                  : 'border-border hover:border-accent/50 hover:shadow-md'
              }`}
              data-testid="itinerary-item"
              key={item.id}
            >
              <button
                className="grid w-full gap-4 text-left sm:grid-cols-[5.25rem_minmax(0,1fr)] xl:pr-28"
                onClick={() => onSelectPlace(item.id)}
                onFocus={() => onSelectPlace(item.id)}
                onMouseEnter={() => onSelectPlace(item.id)}
                onMouseLeave={() => onSelectPlace(null)}
                type="button"
              >
                <span className="flex items-center gap-3 sm:block">
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-sm ring-2 ring-white transition ${
                      activePlaceId === item.id
                        ? 'scale-110 ring-4 ring-foreground/20'
                        : ''
                    }`}
                    style={{
                      backgroundColor:
                        markerStyle(markerLabels[item.id]).background,
                      color: markerStyle(markerLabels[item.id]).text,
                    }}
                  >
                    {markerLabels[item.id] ?? String(index + 1)}
                  </span>
                  <span className="block text-xl font-black sm:mt-3">
                    {item.time || 'Anytime'}
                  </span>
                </span>
                <span className="block min-w-0">
                  <span className="block break-words text-2xl font-black leading-tight">
                    {item.placeName}
                  </span>
                  {item.formattedAddress ? (
                    <span className="mt-2 inline-flex items-start gap-2 break-words text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 shrink-0" size={15} />
                      {item.formattedAddress}
                    </span>
                  ) : null}
                  {item.note ? (
                    <span className="mt-3 block whitespace-pre-wrap break-words text-muted-foreground">
                      {item.note}
                    </span>
                  ) : null}
                </span>
              </button>
              <div className="mt-3 flex flex-wrap items-start gap-2 border-t border-border/70 pt-3 sm:ml-[6.25rem] xl:absolute xl:right-4 xl:top-4 xl:mt-0 xl:border-t-0 xl:bg-background/95 xl:p-1 xl:pt-1 xl:opacity-0 xl:shadow-sm xl:backdrop-blur xl:transition xl:group-hover:opacity-100 xl:group-focus-within:opacity-100">
                <button
                  aria-label="Move place up"
                  className="rounded-full border border-border bg-background p-2.5 disabled:opacity-35"
                  disabled={index === 0}
                  onClick={() => onMove(item.id, 'up')}
                  type="button"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  aria-label="Move place down"
                  className="rounded-full border border-border bg-background p-2.5 disabled:opacity-35"
                  disabled={index === items.length - 1}
                  onClick={() => onMove(item.id, 'down')}
                  type="button"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  aria-label="Edit planned place"
                  className="rounded-full border border-border bg-background p-2.5"
                  onClick={() => onEdit(item)}
                  type="button"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2.5 text-sm font-bold transition hover:border-accent hover:text-accent"
                  onClick={() => onCreateMoment(item)}
                  type="button"
                >
                  <PenLine size={16} />
                  Moment
                </button>
                <button
                  aria-label="Delete planned place"
                  className="rounded-full border border-border bg-background p-2.5"
                  onClick={() => onDelete(item.id)}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
