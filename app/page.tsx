'use client';

import { Header } from '@/components/layout/Header';
import { useState, type CSSProperties } from 'react';

const heroImage =
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80';

const previewImage =
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80';

const passportImage =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80';

const memorySteps = [
  {
    label: '01',
    title: {
      en: 'Create a Journey',
      ko: '여행을 만들고',
    },
    body: {
      en: 'Set dates, destination, country, and a cover before the trip begins.',
      ko: '출발 전 날짜와 목적지, 국가, 커버 이미지를 차분히 정리합니다.',
    },
  },
  {
    label: '02',
    title: {
      en: 'Plan Each Day',
      ko: '하루를 계획하고',
    },
    body: {
      en: 'Build a day-by-day itinerary with time, places, notes, and map pins.',
      ko: '시간, 장소, 메모, 지도 핀을 Day별 일정으로 쌓아갑니다.',
    },
  },
  {
    label: '03',
    title: {
      en: 'Capture Moments',
      ko: '순간을 남기고',
    },
    body: {
      en: 'Turn planned places into diary moments with photos, notes, and coordinates.',
      ko: '계획했던 장소를 사진과 메모, 좌표가 담긴 여행 기록으로 이어갑니다.',
    },
  },
  {
    label: '04',
    title: {
      en: 'Collect Passport',
      ko: '여행 여권을 채웁니다',
    },
    body: {
      en: 'Your visited countries and cities become stamps automatically.',
      ko: '방문한 국가와 도시는 자동으로 나만의 Passport 스탬프가 됩니다.',
    },
  },
];

const previewDays = [
  {
    day: 'DAY 01',
    place: 'Fushimi Inari',
    note: {
      en: 'Thousands of red gates before the city wakes.',
      ko: '도시가 깨어나기 전, 붉은 도리이 사이를 걷는 아침.',
    },
  },
  {
    day: 'DAY 02',
    place: 'Arashiyama',
    note: {
      en: 'A slow morning beside the bamboo path.',
      ko: '대나무 숲길 옆에서 천천히 시작하는 하루.',
    },
  },
  {
    day: 'DAY 03',
    place: 'Gion',
    note: {
      en: 'Small streets, warm lights, one last walk.',
      ko: '작은 골목과 따뜻한 불빛 사이로 남기는 마지막 산책.',
    },
  },
];

const plannerStops = [
  {
    time: '09:00',
    place: 'Fushimi Inari',
    note: {
      en: 'Morning gates before the crowd.',
      ko: '사람이 붐비기 전, 아침의 도리이 길.',
    },
    color: '#ff5a36',
  },
  {
    time: '13:00',
    place: 'Kiyomizu-dera',
    note: {
      en: 'Temple walk and hillside lunch.',
      ko: '사찰을 둘러보고 언덕길에서 점심.',
    },
    color: '#f5b400',
  },
  {
    time: '18:30',
    place: 'Gion',
    note: {
      en: 'Evening streets and one diary moment.',
      ko: '저녁 골목에서 남기는 오늘의 기록.',
    },
    color: '#1fa463',
  },
];

const copy = {
  en: {
    languageLabel: 'Language',
    eyebrow: 'Private Travel Journal',
    headline: (
      <>
        <span>Remember where</span>
        <span>life took you.</span>
      </>
    ),
    promise: (
      <>
        You take the trip.
        <br />
        WAYLOG keeps the story.
      </>
    ),
    heroBody: (
      <>
        Plans, places, moments, photos, and maps.
        <br />
        Keep the whole journey in one quiet record.
      </>
    ),
    start: 'Start your journey',
    passport: 'View Passport',
    keepsEyebrow: 'What WAYLOG keeps',
    keepsTitle: (
      <>
        Trips.
        <br />
        Places.
        <br />
        Memories.
      </>
    ),
    plannerTitle: 'Plan the route before the memories happen.',
    plannerBody:
      'WAYLOG keeps planned places separate from diary moments. During the trip, place time, notes, and coordinates can become a Moment.',
    timelineTitle: (
      <>
        <span>Every day becomes</span>
        <span>a quiet timeline.</span>
      </>
    ),
    timelineBody:
      'A journey is not just a list of places. WAYLOG keeps photo moments and text-only memories in a day-by-day flow.',
    passportTitle: 'Your map becomes a Passport collection.',
    passportBody:
      'Journeys with a country are used to count visited countries and cities. Places with Google coordinates can be viewed on the Journey Map.',
    localTitle: 'Your memories stay yours.',
    localBody:
      'WAYLOG is designed as a privacy-first travel memory assistant. Cloud upload is not required for the core journal experience.',
    nextEyebrow: 'Coming next',
    nextBody:
      'Future photo organization starts with EXIF, GPS, Journey Context, and visited places before optional on-device vision and user review.',
    startEyebrow: 'Start with one trip',
    closingTitle: 'Make your next journey visible.',
    createJourney: 'Create Journey',
    viewDashboard: 'View Dashboard',
  },
  ko: {
    languageLabel: '언어',
    eyebrow: '개인 여행 기록장',
    headline: (
      <>
        <span>여행을 계획하고</span>
        <span>기억으로 남기세요.</span>
      </>
    ),
    promise: (
      <>
        여행은 당신이.
        <br />
        기록은 WAYLOG가.
      </>
    ),
    heroBody: (
      <>
        계획, 장소, 순간, 사진, 지도까지.
        <br />
        여행의 흐름을 하나의 조용한 기록으로 남깁니다.
      </>
    ),
    start: '여행 시작하기',
    passport: '여권 보기',
    keepsEyebrow: 'WAYLOG에 남는 것',
    keepsTitle: (
      <>
        계획한 여행.
        <br />
        다녀온 장소.
        <br />
        오래 남을 기억.
      </>
    ),
    plannerTitle: '떠나기 전, 하루의 동선을 먼저 그려보세요.',
    plannerBody:
      'WAYLOG는 여행 계획과 실제 기록을 구분합니다. 여행 중에는 계획해 둔 장소의 시간, 메모, 좌표를 그대로 가져와 Moment로 남길 수 있습니다.',
    timelineTitle: (
      <>
        <span>하루의 순간들이</span>
        <span>자연스럽게</span>
        <span>타임라인이 됩니다.</span>
      </>
    ),
    timelineBody:
      '여행은 장소 목록만으로 완성되지 않습니다. 사진이 있는 순간과 글로 남긴 기억을 Day별 흐름에 맞춰 정리합니다.',
    passportTitle: '다녀온 도시와 국가가 나만의 여권이 됩니다.',
    passportBody:
      '국가가 입력된 Journey를 기준으로 방문 국가와 도시를 자동으로 집계합니다. Google Places 좌표가 있는 장소는 Journey Map에서 함께 확인할 수 있습니다.',
    localTitle: '여행 기록은 먼저 내 기기에 안전하게 남습니다.',
    localBody:
      'WAYLOG는 Privacy-first 여행 기록 도구를 지향합니다. 핵심 기록 경험을 위해 원본 사진을 반드시 Cloud에 올릴 필요는 없습니다.',
    nextEyebrow: '다음 단계',
    nextBody:
      '향후 사진 정리는 EXIF, GPS, Journey Context, 방문 장소처럼 확실한 정보부터 활용하고, 필요한 경우에만 On-device Vision과 사용자 검토를 거칩니다.',
    startEyebrow: '첫 여행부터 시작해 보세요',
    closingTitle: '다음 여행을 더 선명한 기록으로 남겨보세요.',
    createJourney: '여행 만들기',
    viewDashboard: '대시보드 보기',
  },
} as const;

type Language = keyof typeof copy;

export default function Home() {
  const [language, setLanguage] = useState<Language>('ko');
  const t = copy[language];

  return (
    <main
      className={`min-h-screen bg-background text-foreground ${
        language === 'ko' ? 'waylog-ko-copy' : ''
      }`}
    >
      <div className="absolute left-0 right-0 top-0 z-10">
        <Header inverse />
      </div>

      <section className="relative flex min-h-[94vh] items-end overflow-hidden px-5 pb-10 text-white md:px-10 md:pb-16">
        <img
          src={heroImage}
          alt="Lantern-lit street in Kyoto at dusk"
          className="waylog-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute right-5 top-20 z-20 inline-flex items-center gap-1 rounded-full border border-white/45 bg-black/25 p-1 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg backdrop-blur md:right-10">
          <span className="px-3 text-white/70">{t.languageLabel}</span>
          {(['ko', 'en'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={language === option}
              onClick={() => setLanguage(option)}
              className={`rounded-full px-3 py-2 transition ${
                language === option
                  ? 'bg-white text-foreground'
                  : 'text-white/75 hover:bg-white/15 hover:text-white'
              }`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="relative mx-auto w-full max-w-7xl">
          <p className="waylog-reveal mb-5 text-sm font-bold uppercase tracking-[0.32em] text-white/85">
            {t.eyebrow}
          </p>
          <h1 className="waylog-reveal waylog-reveal-delay-1 font-heading text-[clamp(5rem,18vw,16rem)] leading-[0.78]">
            WAYLOG
          </h1>
          <div className="waylog-reveal waylog-reveal-delay-2 mt-8 grid gap-7 md:grid-cols-[1fr_0.72fr] md:items-end">
            <p
              className={`max-w-4xl leading-[0.96] md:[&>span]:block md:[&>span]:whitespace-nowrap lg:min-h-[12.1rem] ${
                language === 'ko'
                  ? 'font-sans text-5xl font-black md:max-w-[920px] md:text-7xl lg:text-[5.25rem] xl:text-[5.65rem]'
                  : 'font-heading text-6xl md:max-w-[720px] md:text-7xl lg:text-8xl'
              }`}
            >
              {t.headline}
            </p>
            <div className="max-w-md md:justify-self-end">
              <p className="text-2xl font-black leading-tight">
                {t.promise}
              </p>
              <p className="mt-5 leading-8 text-white/85">
                {t.heroBody}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/journeys/new"
                  className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground"
                >
                  {t.start}
                </a>
                <a
                  href="/passport"
                  className="rounded-full border border-white/55 px-6 py-3 text-sm font-bold text-white"
                >
                  {t.passport}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          className="waylog-scroll-cue absolute bottom-4 left-1/2 hidden h-10 w-px -translate-x-1/2 bg-white/35 md:block"
          aria-hidden="true"
        />
      </section>

      <section
        id="about"
        className="waylog-section-reveal px-5 py-20 md:px-10 lg:py-28"
      >
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              {t.keepsEyebrow}
            </p>
            <h2 className="font-heading text-6xl leading-none md:text-7xl">
              {t.keepsTitle}
            </h2>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {memorySteps.map((step) => (
              <article
                key={step.label}
                className="waylog-feature-card border-t border-border pt-6"
              >
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-accent">
                  {step.label}
                </p>
                <h3 className="mt-5 text-xl font-black">
                  {step.title[language]}
                </h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  {step.body[language]}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="waylog-section-reveal px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 border-y border-border py-16 md:grid-cols-[0.82fr_1.18fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Trip Planner
            </p>
            <h2 className="font-heading text-5xl leading-none md:text-6xl">
              {t.plannerTitle}
            </h2>
            <p className="mt-6 max-w-md leading-8 text-muted-foreground">
              {t.plannerBody}
            </p>
          </div>

          <article className="waylog-planner-preview overflow-hidden rounded-lg border border-border bg-white shadow-2xl">
            <div className="grid md:grid-cols-[0.45fr_0.55fr]">
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
                    Day 01
                  </p>
                  <h3 className="mt-1 text-3xl font-black">April 10</h3>
                </div>
                {plannerStops.map((stop, index) => (
                  <div
                    className="waylog-planner-stop grid grid-cols-[3rem_1fr] gap-4 border-t border-border pt-4"
                    key={stop.place}
                    style={{ '--stop-color': stop.color } as CSSProperties}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--stop-color)] text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-black">{stop.time}</p>
                      <h4 className="mt-1 text-xl font-black">{stop.place}</h4>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {stop.note[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative min-h-[360px] overflow-hidden bg-[#dfe9df]">
                <img
                  src={previewImage}
                  alt="Kyoto street preview for planned places"
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
                <div className="absolute inset-0 waylog-map-grid" />
                <svg
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                  viewBox="0 0 420 360"
                >
                  <path
                    className="waylog-route-line"
                    d="M90 84 C150 110 130 176 205 190 C270 205 258 278 334 294"
                    fill="none"
                    stroke="#ff5a36"
                    strokeLinecap="round"
                    strokeWidth="5"
                  />
                </svg>
                {plannerStops.map((stop, index) => (
                  <div
                    className="waylog-map-pin absolute flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white shadow-xl"
                    key={stop.place}
                    style={
                      {
                        '--pin-color': stop.color,
                        left: `${18 + index * 29}%`,
                        top: `${18 + index * 30}%`,
                      } as CSSProperties
                    }
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="waylog-section-reveal px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Timeline
            </p>
            <h2
              className={`leading-none [&>span]:block ${
                language === 'ko'
                  ? 'font-sans text-5xl font-black md:text-[3.4rem]'
                  : 'font-heading text-5xl md:text-6xl'
              }`}
            >
              {t.timelineTitle}
            </h2>
            <p className="mt-6 max-w-md leading-8 text-muted-foreground">
              {t.timelineBody}
            </p>
          </div>

          <article className="waylog-product-preview rounded-[1.5rem] bg-foreground p-3 text-background shadow-2xl">
            <div className="overflow-hidden rounded-[1.1rem] bg-background text-foreground">
              <img
                src={previewImage}
                alt="Kyoto street with traditional buildings"
                className="h-64 w-full object-cover"
              />
              <div className="border-b border-border px-5 py-4">
                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.18em]">
                  <span className="text-accent">Overview</span>
                  <span className="text-muted-foreground">Itinerary</span>
                  <span className="text-muted-foreground">Explore</span>
                </div>
              </div>
              <div className="space-y-4 p-5">
                {previewDays.map((item) => (
                  <div
                    key={item.day}
                    className="waylog-timeline-row grid gap-3 border-t border-border pt-4 sm:grid-cols-[6rem_1fr]"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
                      {item.day}
                    </p>
                    <div>
                      <h3 className="text-2xl font-black">{item.place}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.note[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="waylog-section-reveal px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_0.9fr] md:items-center">
          <article className="waylog-passport-preview relative min-h-[360px] overflow-hidden rounded-lg border border-border p-6 text-white">
            <img
              src={passportImage}
              alt="Coastal road and blue ocean"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative flex h-full min-h-[312px] flex-col justify-between border border-dashed border-white/65 p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.32em] text-white/90">
                    Jan 2026
                  </p>
                  <h3 className="mt-7 font-heading text-6xl leading-none">
                    korea
                  </h3>
                </div>
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-white/90 text-lg font-black italic text-accent">
                  KR
                </span>
              </div>
              <div>
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-foreground">
                  Busan
                </span>
                <p className="mt-6 text-sm font-semibold text-white/88">
                  First visited JAN 2026 · 1 trip · 1 city
                </p>
              </div>
            </div>
          </article>

          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Travel Passport
            </p>
            <h2 className="font-heading text-5xl leading-none md:text-6xl">
              {t.passportTitle}
            </h2>
            <p className="mt-6 max-w-md leading-8 text-muted-foreground">
              {t.passportBody}
            </p>
            <a
              href="/passport"
              className="mt-8 inline-flex rounded-full border border-foreground/20 px-6 py-3 text-sm font-black"
            >
              {t.passport}
            </a>
          </div>
        </div>
      </section>

      <section className="waylog-section-reveal px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 border-t border-border pt-16 md:grid-cols-2">
          <article className="waylog-feature-card">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Local-first
            </p>
            <h2 className="font-heading text-5xl leading-none">
              {t.localTitle}
            </h2>
            <p className="mt-6 leading-8 text-muted-foreground">
              {t.localBody}
            </p>
          </article>
          <article className="waylog-feature-card">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              {t.nextEyebrow}
            </p>
            <h2 className="font-heading text-5xl leading-none">
              AI Photo Organizer
            </h2>
            <p className="mt-6 leading-8 text-muted-foreground">
              {t.nextBody}
            </p>
          </article>
        </div>
      </section>

      <section className="waylog-section-reveal px-5 pb-24 text-center md:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-accent">
            {t.startEyebrow}
          </p>
          <h2 className="mt-5 font-heading text-6xl leading-none md:text-7xl">
            {t.closingTitle}
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="/journeys/new"
              className="rounded-full bg-accent px-7 py-3 text-sm font-bold text-accent-foreground"
            >
              {t.createJourney}
            </a>
            <a
              href="/dashboard"
              className="rounded-full border border-foreground/20 px-7 py-3 text-sm font-bold"
            >
              {t.viewDashboard}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
