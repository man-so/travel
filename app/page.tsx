import Link from 'next/link';
import { Header } from '@/components/layout/Header';

const heroImage =
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="absolute left-0 right-0 top-0 z-10">
        <Header inverse />
      </div>

      <section className="relative flex min-h-[92vh] items-end overflow-hidden px-5 pb-10 text-white md:px-10 md:pb-16">
        <img
          alt="A quiet Kyoto street at dusk"
          className="absolute inset-0 h-full w-full object-cover"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative max-w-6xl">
          <p className="mb-6 text-sm uppercase tracking-[0.3em]">WAYLOG</p>
          <h1 className="font-heading text-[clamp(4.5rem,13vw,12rem)] leading-[0.85]">
            Remember
            <br />
            where life took you.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-8 text-white/85">
            여행이 끝나도,
            <br />
            그날의 기억은 남도록.
          </p>
          <Link
            className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-white"
            href="/journeys/new"
          >
            Start your journey →
          </Link>
        </div>
      </section>

      <section
        className="grid gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-10 lg:py-28"
        id="about"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Digital Travel Diary
          </p>
          <h2 className="mt-5 font-heading text-5xl leading-none md:text-7xl">
            Your trips.
            <br />
            Your places.
            <br />
            Your memories.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['01', 'CAPTURE', '여행 중 느꼈던 순간을 사진과 한 줄로 기록하세요.'],
            ['02', 'REMEMBER', '시간이 지나도 그날의 장소와 감정을 다시 꺼내보세요.'],
            ['03', 'RELIVE', '여행 전체가 하나의 이야기가 됩니다.'],
          ].map(([number, title, copy]) => (
            <article
              className="border-t border-border pt-5"
              key={title}
            >
              <p className="text-sm text-accent">{number}</p>
              <h3 className="mt-6 text-sm font-semibold tracking-[0.18em]">
                {title}
              </h3>
              <p className="mt-4 leading-7 text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 border-t border-border pt-14 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Preview
            </p>
            <h2 className="mt-4 font-heading text-6xl leading-none md:text-8xl">
              Every day becomes a quiet timeline.
            </h2>
          </div>
          <div className="rounded-[2rem] bg-foreground p-3 shadow-2xl">
            <div className="overflow-hidden rounded-[1.45rem] bg-background">
              <div className="relative h-56">
                <img
                  alt="Kyoto temple gates"
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-heading text-6xl leading-none">KYOTO</p>
                  <p>Japan · April 1 - April 5, 2026</p>
                </div>
              </div>
              <div className="flex border-b border-border">
                {['Overview', 'Itinerary', 'Explore', '$'].map((item, index) => (
                  <span
                    className={`px-4 py-4 text-sm font-black ${
                      index === 0 ? 'border-b-2 border-accent text-accent' : 'text-muted-foreground'
                    }`}
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="space-y-8 p-5">
                {[
                  ['DAY 01', 'Fushimi Inari', 'Thousands of red gates.', '생각보다 사람이 많았지만 올라갈수록 조용해졌다.'],
                  ['DAY 02', 'Arashiyama', 'Bamboo Forest', '아침 일찍 가길 잘했다.'],
                ].map(([day, place, caption, note]) => (
                  <article className="border-t border-border pt-5" key={day}>
                    <p className="text-sm font-black tracking-[0.18em] text-accent">{day}</p>
                    <h3 className="mt-2 text-3xl font-black">{place}</h3>
                    <p className="mt-3 text-muted-foreground">{caption}</p>
                    <p className="mt-3 text-lg leading-8">{note}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 text-center md:px-10">
        <h2 className="font-heading text-6xl leading-none md:text-8xl">
          Every journey becomes a story.
        </h2>
        <Link
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-white"
          href="/journeys/new"
        >
          Create your first journey →
        </Link>
      </section>
    </main>
  );
}
