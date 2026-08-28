import { MapPin, Plus } from 'lucide-react';
import { dayCount } from '@/lib/dates';
import type { Journey } from '@/types/journey';

export function NewJourneyCard() {
  return (
    <a
      className="flex min-h-[270px] flex-col justify-end rounded-lg bg-[#10a9aa] p-7 text-white transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-accent"
      href="/journeys/new"
    >
      <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#10a9aa]">
        <Plus size={32} />
      </span>
      <span className="text-3xl font-bold leading-tight">New journey album</span>
    </a>
  );
}

export function JourneyCard({ journey }: { journey: Journey }) {
  const totalEntries = journey.days.reduce((sum, day) => sum + day.entries.length, 0);
  return (
    <a
      className="group relative min-h-[270px] overflow-hidden rounded-lg bg-card text-white transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-accent"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 bg-accent/85 p-5">
        <p className="text-2xl font-bold leading-tight">{journey.title}</p>
        <p className="mt-4 flex items-center gap-1 text-sm text-white/85">
          <MapPin size={15} />
          {journey.country || journey.destination}
        </p>
        <p className="text-sm text-white/85">
          {dayCount(journey.startDate, journey.endDate)} Days · {totalEntries} Moments
        </p>
      </div>
    </a>
  );
}
