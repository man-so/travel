import type { PassportSummary as PassportSummaryType } from '@/types/passport';

const labels = [
  ['countryCount', 'Countries'],
  ['cityCount', 'Cities'],
  ['journeyCount', 'Journeys'],
  ['momentCount', 'Moments'],
] as const;

export function PassportSummary({ summary }: { summary: PassportSummaryType }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {labels.map(([key, label]) => (
        <div className="border-t border-border py-5" key={key}>
          <p className="font-heading text-5xl leading-none md:text-6xl">{summary[key]}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
        </div>
      ))}
    </section>
  );
}
