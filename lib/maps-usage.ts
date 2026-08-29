'use client';

export type MapsUsage = {
  date: string;
  mapLoads: number;
  placeSelections: number;
};

const storageKey = 'waylog.mapsUsage.v1';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function emptyUsage(): MapsUsage {
  return {
    date: todayKey(),
    mapLoads: 0,
    placeSelections: 0,
  };
}

export function getMapsUsage(): MapsUsage {
  if (typeof window === 'undefined') {
    return emptyUsage();
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return emptyUsage();
  }

  try {
    const usage = JSON.parse(raw) as MapsUsage;
    return usage.date === todayKey() ? usage : emptyUsage();
  } catch {
    return emptyUsage();
  }
}

export function recordMapsUsage(kind: 'mapLoads' | 'placeSelections', amount = 1) {
  if (typeof window === 'undefined') {
    return emptyUsage();
  }

  const usage = getMapsUsage();
  const updated = {
    ...usage,
    [kind]: usage[kind] + amount,
  };
  window.localStorage.setItem(storageKey, JSON.stringify(updated));
  window.dispatchEvent(new Event('waylog:maps-usage'));
  return updated;
}
