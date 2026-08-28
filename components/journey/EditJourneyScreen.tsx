'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { JourneyForm } from '@/components/journey/JourneyForm';
import { deleteJourney, getJourney } from '@/lib/journey-store';
import type { Journey } from '@/types/journey';

export function EditJourneyScreen({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null | undefined>(undefined);

  useEffect(() => {
    const handle = window.setTimeout(() => setJourney(getJourney(journeyId)), 0);
    return () => window.clearTimeout(handle);
  }, [journeyId]);

  if (journey === undefined) {
    return <main className="min-h-screen bg-background px-5 py-16">Loading journey...</main>;
  }

  if (!journey) {
    return <main className="min-h-screen bg-background px-5 py-16">Journey not found.</main>;
  }

  function remove() {
    if (window.confirm('Are you sure?')) {
      deleteJourney(journeyId);
      router.push('/dashboard');
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <JourneyForm journey={journey} />
      <div className="mx-auto max-w-6xl px-5 pb-20 md:px-10">
        <button
          className="inline-flex rounded-full border border-accent px-5 py-3 font-bold text-accent"
          onClick={remove}
          type="button"
        >
          Delete Journey
        </button>
      </div>
    </main>
  );
}
