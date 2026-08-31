'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import {
  getGoogleMapsApiKey,
  loadGoogleMaps,
  readLatLng,
  type GoogleBoundsLiteral,
  type GoogleLatLngLiteral,
  type GoogleMarker,
  type GooglePolyline,
} from '@/lib/google-maps-loader';
import {
  getMapsUsage,
  recordMapsUsage,
  type MapsUsage,
} from '@/lib/maps-usage';

export type MapPlace = {
  id: string;
  dayNumber: number;
  place: string;
  query: string;
  latitude?: number;
  longitude?: number;
  markerLabel?: string;
  markerColor?: string;
  markerTextColor?: string;
};

export type MapViewport = {
  bounds?: GoogleBoundsLiteral;
  center?: GoogleLatLngLiteral;
  zoom?: number;
};

function offsetDuplicatePosition(
  place: MapPlace,
  positionCounts: Map<string, number>,
) {
  const key = `${place.latitude?.toFixed(6)},${place.longitude?.toFixed(6)}`;
  const duplicateIndex = positionCounts.get(key) ?? 0;
  positionCounts.set(key, duplicateIndex + 1);

  if (duplicateIndex === 0) {
    return {
      lat: place.latitude!,
      lng: place.longitude!,
    };
  }

  const angle = (duplicateIndex - 1) * 0.9;
  const distance = 0.00012 * Math.ceil(duplicateIndex / 2);
  return {
    lat: place.latitude! + Math.sin(angle) * distance,
    lng: place.longitude! + Math.cos(angle) * distance,
  };
}

function numberedMarkerIcon(
  googleMaps: NonNullable<typeof window.google>['maps'],
  place: MapPlace,
  isActive: boolean,
) {
  if (!place.markerLabel) {
    return undefined;
  }

  const size = isActive ? 64 : 44;
  const center = size / 2;
  const pinScale = isActive ? 1.16 : 1;
  const pinWidth = 32 * pinScale;
  const pinHeight = 42 * pinScale;
  const pinLeft = center - pinWidth / 2;
  const pinTop = isActive ? 5 : 2;
  const circleRadius = 11 * pinScale;
  const fill = place.markerColor ?? '#ff5a36';
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${
        isActive
          ? `<ellipse cx="${center}" cy="${size - 8}" rx="15" ry="5" fill="#111111" fill-opacity="0.2"/>`
          : `<ellipse cx="${center}" cy="${size - 6}" rx="11" ry="4" fill="#111111" fill-opacity="0.12"/>`
      }
      <path
        d="M ${center} ${pinTop + pinHeight}
           C ${center - 2} ${pinTop + pinHeight - 6}, ${pinLeft} ${pinTop + 25}, ${pinLeft} ${pinTop + 16}
           C ${pinLeft} ${pinTop + 7}, ${center - 8} ${pinTop}, ${center} ${pinTop}
           C ${center + 8} ${pinTop}, ${pinLeft + pinWidth} ${pinTop + 7}, ${pinLeft + pinWidth} ${pinTop + 16}
           C ${pinLeft + pinWidth} ${pinTop + 25}, ${center + 2} ${pinTop + pinHeight - 6}, ${center} ${pinTop + pinHeight}
           Z"
        fill="${fill}"
        stroke="#ffffff"
        stroke-width="4"
        stroke-linejoin="round"
      />
      <circle cx="${center}" cy="${pinTop + 16 * pinScale}" r="${circleRadius}" fill="${fill}"/>
    </svg>
  `);

  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new googleMaps.Size(size, size),
    labelOrigin: new googleMaps.Point(center, pinTop + 16 * pinScale),
  };
}

export function GoogleJourneyMap({
  places,
  activePlaceId,
  onPlaceClick,
  onViewportChange,
  fitMode = 'bounds',
  pinLabel = 'place',
  pinPluralLabel = 'places',
  showRoute = true,
}: {
  places: MapPlace[];
  activePlaceId?: string | null;
  onPlaceClick?: (placeId: string) => void;
  onViewportChange?: (viewport: MapViewport) => void;
  fitMode?: 'bounds' | 'world';
  pinLabel?: string;
  pinPluralLabel?: string;
  showRoute?: boolean;
}) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const googleMapsRef = useRef<NonNullable<typeof window.google>['maps'] | null>(
    null,
  );
  const mapRef = useRef<InstanceType<
    NonNullable<typeof window.google>['maps']['Map']
  > | null>(null);
  const markersRef = useRef<
    Array<{ marker: GoogleMarker; place: MapPlace; index: number }>
  >([]);
  const baseRouteRef = useRef<GooglePolyline | null>(null);
  const routeSegmentsRef = useRef<
    Array<{ fromPlaceId: string; polyline: GooglePolyline }>
  >([]);
  const viewportListenerRef = useRef<{ remove(): void } | null>(null);
  const onPlaceClickRef = useRef(onPlaceClick);
  const onViewportChangeRef = useRef(onViewportChange);
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
    onPlaceClickRef.current = onPlaceClick;
  }, [onPlaceClick]);

  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  useEffect(() => {
    let cancelled = false;

    function emitViewport() {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      const center = map.getCenter();
      const viewport: MapViewport = {};
      const bounds = map.getBounds()?.toJSON();
      const zoom = map.getZoom();
      if (bounds) {
        viewport.bounds = bounds;
      }
      if (center) {
        viewport.center = readLatLng(center);
      }
      if (typeof zoom === 'number') {
        viewport.zoom = zoom;
      }
      onViewportChangeRef.current?.(viewport);
    }

    function clearMapOverlays() {
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      markersRef.current = [];
      baseRouteRef.current?.setMap(null);
      baseRouteRef.current = null;
      routeSegmentsRef.current.forEach(({ polyline }) => polyline.setMap(null));
      routeSegmentsRef.current = [];
    }

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
        googleMapsRef.current = googleMaps;

        for (let attempt = 0; attempt < 5; attempt += 1) {
          if (
            typeof googleMaps.Map === 'function' &&
            typeof googleMaps.Marker === 'function' &&
            typeof googleMaps.LatLngBounds === 'function' &&
            typeof googleMaps.Polyline === 'function'
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
          typeof googleMaps.LatLngBounds !== 'function' ||
          typeof googleMaps.Polyline !== 'function'
        ) {
          return;
        }

        const map =
          mapRef.current ??
          new googleMaps.Map(mapElementRef.current, {
            center: { lat: 36.5, lng: 127.8 },
            zoom: 6,
            disableDefaultUI: false,
          });
        if (!mapRef.current) {
          mapRef.current = map;
          recordMapsUsage('mapLoads');
          viewportListenerRef.current = map.addListener('idle', emitViewport);
        }
        const bounds = new googleMaps.LatLngBounds();

        if (cancelled) {
          return;
        }

        clearMapOverlays();

        const positionCounts = new Map<string, number>();
        const routePath = mapTargets.map((place) =>
          offsetDuplicatePosition(place, positionCounts),
        );

        if (showRoute && routePath.length > 1) {
          baseRouteRef.current = new googleMaps.Polyline({
            map,
            path: routePath,
            geodesic: false,
            strokeColor: '#ff5a36',
            strokeOpacity: 0.34,
            strokeWeight: 3,
            zIndex: 1,
          });
        }

        if (showRoute) {
          for (let index = 0; index < routePath.length - 1; index += 1) {
            const from = routePath[index];
            const to = routePath[index + 1];
            const place = mapTargets[index];
            if (!from || !to || !place) {
              continue;
            }

            const polyline = new googleMaps.Polyline({
              map,
              path: [from, to],
              geodesic: false,
              strokeColor: place.markerColor ?? '#ff5a36',
              strokeOpacity: 0,
              strokeWeight: 5,
              zIndex: 2,
            });
            routeSegmentsRef.current.push({
              fromPlaceId: place.id,
              polyline,
            });
          }
        }

        mapTargets.forEach((place, index) => {
          const position = routePath[index];
          if (!position) {
            return;
          }
          const marker = new googleMaps.Marker({
            map,
            position,
            title: place.place,
            icon: numberedMarkerIcon(googleMaps, place, false),
            label: place.markerLabel
              ? {
                  text: place.markerLabel,
                  color: place.markerTextColor ?? '#ffffff',
                  fontSize: '14px',
                  fontWeight: '900',
                }
              : undefined,
            zIndex: 100 + index,
          });
          marker.addListener('click', () => onPlaceClickRef.current?.(place.id));
          markersRef.current.push({ marker, place, index });
          bounds.extend(position);
        });

        if (fitMode === 'world') {
          if (routePath.length === 1 && routePath[0]) {
            map.setCenter(routePath[0]);
            map.setZoom(3);
          } else if (routePath.length > 1) {
            map.fitBounds(bounds);
            window.setTimeout(() => {
              if (cancelled) {
                return;
              }
              const zoom = map.getZoom();
              if (typeof zoom === 'number' && zoom > 3) {
                map.setZoom(3);
              }
            }, 0);
          } else {
            map.setCenter({ lat: 20, lng: 0 });
            map.setZoom(2);
          }
        } else if (mapTargets.length > 1) {
          map.fitBounds(bounds);
        } else if (mapTargets.length === 1) {
          map.fitBounds(bounds);
          map.setZoom(13);
        } else if (!mapRef.current) {
          map.setCenter({ lat: 36.5, lng: 127.8 });
        }

        emitViewport();

        setStatus(
          mapTargets.length > 0
            ? `${mapTargets.length} ${mapTargets.length === 1 ? pinLabel : pinPluralLabel} pinned`
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
      clearMapOverlays();
    };
  }, [apiKey, fitMode, mapTargets, pinLabel, pinPluralLabel, showRoute]);

  useEffect(() => {
    const googleMaps = googleMapsRef.current;
    if (!googleMaps) {
      return;
    }

    markersRef.current.forEach(({ marker, place, index }) => {
      const isActive = activePlaceId === place.id;
      marker.setIcon(numberedMarkerIcon(googleMaps, place, isActive));
      marker.setLabel(
        place.markerLabel
          ? {
              text: place.markerLabel,
              color: place.markerTextColor ?? '#ffffff',
              fontSize: isActive ? '16px' : '14px',
              fontWeight: '900',
            }
          : undefined,
      );
      marker.setZIndex(isActive ? 1000 : 100 + index);
    });

    routeSegmentsRef.current.forEach(({ fromPlaceId, polyline }) => {
      const isActive = activePlaceId === fromPlaceId;
      polyline.setOptions({
        strokeOpacity: isActive ? 0.9 : 0,
        strokeWeight: isActive ? 6 : 5,
        zIndex: isActive ? 20 : 2,
      });
    });
  }, [activePlaceId]);

  return (
    <div className="grid min-h-[58vh] md:min-h-[72vh] lg:min-h-[calc(100vh-8rem)]">
      <div className="relative">
        <div
          className="h-[58vh] w-full bg-muted md:h-[72vh] lg:h-[calc(100vh-8rem)]"
          ref={mapElementRef}
        />
        <div className="absolute left-4 top-4 rounded bg-white/90 px-4 py-3 text-sm shadow-xl backdrop-blur">
          <p className="inline-flex items-center gap-2 font-bold">
            <Activity size={16} />
            {status}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Today: {usage.mapLoads} map loads, {usage.placeSelections} place
            selections
          </p>
        </div>
        <div className="absolute bottom-4 left-4 right-4 rounded bg-white/90 px-4 py-3 text-xs text-muted-foreground shadow-xl backdrop-blur">
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
