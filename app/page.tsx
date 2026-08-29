import { Header } from '@/components/layout/Header';

const heroImage =
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80';

const previewImage =
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80';

const passportImage =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80';

const memorySteps = [
  {
    label: '01',
    title: 'Create a Journey',
    body: 'Set dates, destination, country, and a cover before the trip begins.',
  },
  {
    label: '02',
    title: 'Capture Moments',
    body: 'Save notes, places, photos, and coordinates into a day-by-day timeline.',
  },
  {
    label: '03',
    title: 'Collect Passport',
    body: 'Your visited countries and cities become stamps automatically.',
  },
];

const previewDays = [
  {
    day: 'DAY 01',
    place: 'Fushimi Inari',
    note: 'Thousands of red gates before the city wakes.',
  },
  {
    day: 'DAY 02',
    place: 'Arashiyama',
    note: 'A slow morning beside the bamboo path.',
  },
  {
    day: 'DAY 03',
    place: 'Gion',
    note: 'Small streets, warm lights, one last walk.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
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
        <div className="relative mx-auto w-full max-w-7xl">
          <p className="waylog-reveal mb-5 text-sm font-bold uppercase tracking-[0.32em] text-white/85">
            Private Travel Journal
          </p>
          <h1 className="waylog-reveal waylog-reveal-delay-1 font-heading text-[clamp(5rem,18vw,16rem)] leading-[0.78]">
            WAYLOG
          </h1>
          <div className="waylog-reveal waylog-reveal-delay-2 mt-8 grid gap-7 md:grid-cols-[1fr_0.72fr] md:items-end">
            <p className="max-w-4xl font-heading text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.9]">
              Remember where life took you.
            </p>
            <div className="max-w-md md:justify-self-end">
              <p className="text-2xl font-black leading-tight">
                여행은 당신이.
                <br />
                기록은 WAYLOG가.
              </p>
              <p className="mt-5 leading-8 text-white/85">
                계획, 장소, 순간, 사진, 지도까지. 여행의 흐름을 하나의 조용한
                기록으로 남깁니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/journeys/new"
                  className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground"
                >
                  Start your journey
                </a>
                <a
                  href="/passport"
                  className="rounded-full border border-white/55 px-6 py-3 text-sm font-bold text-white"
                >
                  View Passport
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

      <section id="about" className="px-5 py-20 md:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              What WAYLOG keeps
            </p>
            <h2 className="font-heading text-6xl leading-none md:text-7xl">
              Your trips.
              <br />
              Your places.
              <br />
              Your memories.
            </h2>
          </div>
          <div className="grid gap-7 sm:grid-cols-3">
            {memorySteps.map((step) => (
              <article key={step.label} className="border-t border-border pt-6">
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-accent">
                  {step.label}
                </p>
                <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 border-y border-border py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Timeline
            </p>
            <h2 className="font-heading text-5xl leading-none md:text-6xl">
              Every day becomes a quiet timeline.
            </h2>
            <p className="mt-6 max-w-md leading-8 text-muted-foreground">
              A journey is not just a list of places. WAYLOG keeps the rhythm of
              each day, including the moments with photos and the moments that
              live only as words.
            </p>
          </div>

          <article className="rounded-[1.5rem] bg-foreground p-3 text-background shadow-2xl">
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
                    className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[6rem_1fr]"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
                      {item.day}
                    </p>
                    <div>
                      <h3 className="text-2xl font-black">{item.place}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_0.9fr] md:items-center">
          <article className="relative min-h-[360px] overflow-hidden rounded-lg border border-border p-6 text-white">
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
              Your map becomes a collection.
            </h2>
            <p className="mt-6 max-w-md leading-8 text-muted-foreground">
              Countries and cities are counted from journeys that include a
              country. Places with Google coordinates can also be viewed on the
              journey map.
            </p>
            <a
              href="/passport"
              className="mt-8 inline-flex rounded-full border border-foreground/20 px-6 py-3 text-sm font-black"
            >
              Open Passport
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 border-t border-border pt-16 md:grid-cols-2">
          <article>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Local-first
            </p>
            <h2 className="font-heading text-5xl leading-none">
              Your memories stay yours.
            </h2>
            <p className="mt-6 leading-8 text-muted-foreground">
              WAYLOG is designed as a privacy-first travel memory assistant.
              Cloud photo upload is not required for the core journal to feel
              complete.
            </p>
          </article>
          <article>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">
              Coming next
            </p>
            <h2 className="font-heading text-5xl leading-none">
              AI Photo Organizer
            </h2>
            <p className="mt-6 leading-8 text-muted-foreground">
              Future photo organization will start with EXIF, GPS, journey
              context, and visited places before optional on-device vision and
              user review.
            </p>
          </article>
        </div>
      </section>

      <section className="px-5 pb-24 text-center md:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-accent">
            Start with one trip
          </p>
          <h2 className="mt-5 font-heading text-6xl leading-none md:text-7xl">
            Make your next journey visible.
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="/journeys/new"
              className="rounded-full bg-accent px-7 py-3 text-sm font-bold text-accent-foreground"
            >
              Create Journey
            </a>
            <a
              href="/dashboard"
              className="rounded-full border border-foreground/20 px-7 py-3 text-sm font-bold"
            >
              View Dashboard
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
