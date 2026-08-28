import type { Day } from '@/types/journey';

const dayMs = 24 * 60 * 60 * 1000;

export function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return `${formatter.format(new Date(`${startDate}T00:00:00`))} - ${formatter.format(
    new Date(`${endDate}T00:00:00`),
  )}`;
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export function dayCount(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.floor((end.getTime() - start.getTime()) / dayMs) + 1;
}

export function createDays(journeyId: string, startDate: string, endDate: string): Day[] {
  const totalDays = Math.max(dayCount(startDate, endDate), 0);
  const start = new Date(`${startDate}T00:00:00`);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      id: crypto.randomUUID(),
      journeyId,
      dayNumber: index + 1,
      date: date.toISOString().slice(0, 10),
      entries: [],
    };
  });
}
