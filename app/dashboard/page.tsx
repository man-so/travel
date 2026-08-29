'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Home, Image, Plus, Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { JourneyCard, NewJourneyCard } from '@/components/journey/JourneyCard';
import { listJourneys } from '@/lib/journey-store';
import type { Journey } from '@/types/journey';

export default function DashboardPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const refresh = () => setJourneys(listJourneys());
    refresh();
    window.addEventListener('waylog:change', refresh);
    return () => window.removeEventListener('waylog:change', refresh);
  }, []);

  const filteredJourneys = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return journeys;
    }
    return journeys.filter((journey) =>
      [journey.title, journey.destination, journey.country]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [journeys, query]);

  return (
    <main className="min-h-screen bg-background pb-24">
      <Header />
      <section className="mx-auto w-full max-w-6xl px-5 pb-12 pt-4 md:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground">Good evening.</p>
            <h1 className="mt-2 text-5xl font-black tracking-tight md:text-7xl">
              My Journeys
            </h1>
          </div>
          <a className="hidden rounded-full bg-accent px-5 py-3 text-sm font-bold text-white md:inline-flex" href="/journeys/new">
            New Journey
          </a>
        </div>

        <label className="mt-7 flex items-center gap-3 rounded-lg bg-black/5 px-4 py-3 text-muted-foreground">
          <Search size={22} />
          <span className="sr-only">Filter by keyword or country</span>
          <input
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by keyword or country"
            value={query}
          />
        </label>

        {journeys.length === 0 ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <NewJourneyCard />
            <div className="flex min-h-[270px] flex-col justify-end rounded-lg border border-dashed border-border p-7">
              <p className="text-3xl font-black">No journeys yet.</p>
              <p className="mt-3 text-muted-foreground">
                Your stories will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NewJourneyCard />
            {filteredJourneys.map((journey) => (
              <JourneyCard journey={journey} key={journey.id} />
            ))}
          </div>
        )}
      </section>

      <nav className="fixed bottom-0 left-0 right-0 mx-auto flex h-20 max-w-xl items-center justify-around border-t border-border bg-white/95 px-6 backdrop-blur md:hidden">
        <a aria-label="Home" className="text-muted-foreground" href="/">
          <Home />
        </a>
        <a aria-label="Journeys" className="text-foreground" href="/dashboard">
          <Image />
        </a>
        <a aria-label="Passport" className="text-muted-foreground" href="/passport">
          <BookOpen />
        </a>
        <a aria-label="New journey" className="text-muted-foreground" href="/journeys/new">
          <Plus />
        </a>
      </nav>
    </main>
  );
}
