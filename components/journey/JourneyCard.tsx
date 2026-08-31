import { MapPin, Plus } from 'lucide-react';
import { dayCount } from '@/lib/dates';
import type { Journey } from '@/types/journey';

export function NewJourneyCard() {
  return (
    <a
      className="group flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted p-7 text-primary transition hover:bg-[#e7e9e6] focus:outline-none focus:ring-2 focus:ring-primary md:min-h-[500px]"
      href="/journeys/new"
    >
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card transition group-hover:scale-105">
        <Plus size={30} />
      </span>
      <span className="text-sm font-bold uppercase tracking-[0.16em]">
        New Journey
      </span>
      <span className="mt-2 text-sm text-muted-foreground">
        Start a new chapter
      </span>
    </a>
  );
}

export function JourneyCard({ journey }: { journey: Journey }) {
  const totalEntries = journey.days.reduce((sum, day) => sum + day.entries.length, 0);
  return (
    <a
      className="group relative min-h-[320px] overflow-hidden rounded-lg border border-border bg-card text-white transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary md:min-h-[500px]"
      href={`/journeys/${journey.id}`}
    >
      {journey.cover?.url ? (
        <img
          alt={`${journey.destination} cover`}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={journey.cover.url}
        />
      ) : (
        <div className="absolute inset-0 bg-[#e29a8f]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="font-heading text-4xl leading-none md:text-5xl">
          {journey.title}
        </p>
        <p className="mt-5 flex items-center gap-1 text-sm font-semibold text-white/85">
          <MapPin size={15} />
          {journey.country || journey.destination}
        </p>
        <p className="mt-1 text-sm text-white/80">
          {dayCount(journey.startDate, journey.endDate)} Days · {totalEntries} Moments
        </p>
      </div>
    </a>
  );
}
