import type { ItineraryItem } from '@/types/journey';

export function orderedItinerary(items: ItineraryItem[] = []) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function normalizeItineraryOrder(items: ItineraryItem[]) {
  return orderedItinerary(items).map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function moveItineraryOrder(
  items: ItineraryItem[] = [],
  itemId: string,
  direction: 'up' | 'down',
) {
  const ordered = orderedItinerary(items);
  const currentIndex = ordered.findIndex((item) => item.id === itemId);

  if (currentIndex < 0) {
    return ordered;
  }

  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= ordered.length) {
    return ordered;
  }

  const next = [...ordered];
  [next[currentIndex], next[nextIndex]] = [next[nextIndex], next[currentIndex]];
  return next.map((item, index) => ({
    ...item,
    order: index,
  }));
}

export function createMomentDraftFromItinerary(item: ItineraryItem) {
  return {
    place: item.placeName,
    content: item.note ?? '',
    photoUrl: '',
    formattedAddress: item.formattedAddress,
    latitude: item.latitude,
    longitude: item.longitude,
    itineraryItemId: item.id,
    plannedTime: item.time,
  };
}
