'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { getGoogleMapsApiKey, loadGoogleMaps } from '@/lib/google-maps-loader';
import {
  getMapsUsage,
  recordMapsUsage,
  type MapsUsage,
} from '@/lib/maps-usage';

type MapPlace = {
  id: string;
  dayNumber: number;
  place: string;
  query: string;
  latitude?: number;
  longitude?: number;
};

export function GoogleJourneyMap({ places }: { places: MapPlace[] }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Loading map...');
  const [usage, setUsage] = useState<MapsUsage>(() => getMapsUsage());
  const apiKey = getGoogleMapsApiKey();
  const mapTargets = useMemo(
    () =>
      places.filter(
        (place) =>
          typeof place.latitude === 'number' &&
          typeof place.longitude === 'number',
      ),
    [places],
  );

  useEffect(() => {
    const refreshUsage = () => setUsage(getMapsUsage());
    window.addEventListener('waylog:maps-usage', refreshUsage);
    return () => window.removeEventListener('waylog:maps-usage', refreshUsage);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function drawMap() {
      if (!apiKey) {
        setStatus('Add a Google Maps API key to enable pinned maps.');
        return;
      }

      if (!mapElementRef.current) {
        return;
      }

      try {
        await loadGoogleMaps(apiKey);
        if (cancelled || !window.google?.maps || !mapElementRef.current) {
          return;
        }

        const googleMaps = window.google.maps;

        for (let attempt = 0; attempt < 5; attempt += 1) {
          if (
            typeof googleMaps.Map === 'function' &&
            typeof googleMaps.Marker === 'function' &&
            typeof googleMaps.LatLngBounds === 'function'
          ) {
            break;
          }
          await new Promise((resolve) => window.setTimeout(resolve, 300));
        }

        if (
          cancelled ||
          !mapElementRef.current ||
          typeof googleMaps.Map !== 'function' ||
          typeof googleMaps.Marker !== 'function' ||
          typeof googleMaps.LatLngBounds !== 'function'
        ) {
          return;
        }

        const map = new googleMaps.Map(mapElementRef.current, {
          center: { lat: 36.5, lng: 127.8 },
          zoom: 6,
          disableDefaultUI: false,
        });
        const bounds = new googleMaps.LatLngBounds();

        recordMapsUsage('mapLoads');

        if (cancelled) {
          return;
        }

        mapTargets.forEach((place) => {
          const position = {
            lat: place.latitude!,
            lng: place.longitude!,
          };
          new googleMaps.Marker({
            map,
            position,
            title: place.place,
          });
          bounds.extend(position);
        });

        if (mapTargets.length > 1) {
          map.fitBounds(bounds);
        } else if (mapTargets.length === 1) {
          map.fitBounds(bounds);
          map.setZoom(13);
        } else {
          map.setCenter({ lat: 36.5, lng: 127.8 });
        }

        setStatus(
          mapTargets.length > 0
            ? `${mapTargets.length} ${mapTargets.length === 1 ? 'place' : 'places'} pinned`
            : 'No saved coordinates yet.',
        );
      } catch {
        if (!cancelled) {
          setStatus('Unable to load Google Maps.');
        }
      }
    }

    void drawMap();

    return () => {
      cancelled = true;
    };
  }, [apiKey, mapTargets]);

  return (
    <div className="grid min-h-[56vh] md:min-h-[70vh]">
      <div className="relative">
        <div
          className="h-[56vh] w-full bg-muted md:h-[70vh]"
          ref={mapElementRef}
        />
        <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-4 py-3 text-sm shadow-xl backdrop-blur">
          <p className="inline-flex items-center gap-2 font-bold">
            <Activity size={16} />
            {status}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Today: {usage.mapLoads} map loads, {usage.placeSelections} place
            selections
          </p>
        </div>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 px-4 py-3 text-xs text-muted-foreground shadow-xl backdrop-blur">
          <p className="inline-flex gap-2">
            <AlertTriangle className="mt-0.5 shrink-0" size={14} />
            Pins use coordinates saved from Places selections. WAYLOG does not
            run background geocoding or repeated place lookups.
          </p>
          <div className="mt-2 flex flex-wrap gap-3 font-bold text-foreground">
            <a
              href="https://console.cloud.google.com/google/maps-apis/metrics"
              rel="noreferrer"
              target="_blank"
            >
              Usage
            </a>
            <a
              href="https://console.cloud.google.com/google/maps-apis/quotas"
              rel="noreferrer"
              target="_blank"
            >
              Quotas
            </a>
            <a
              href="https://console.cloud.google.com/billing/budgets"
              rel="noreferrer"
              target="_blank"
            >
              Budget alerts
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
