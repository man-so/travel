'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  getGoogleMapsApiKey,
  loadGoogleMaps,
  readLatLng,
  type GoogleLatLng,
  type GoogleLatLngLiteral,
} from '@/lib/google-maps-loader';
import { recordMapsUsage } from '@/lib/maps-usage';

export type SelectedPlace = {
  place: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
};

type PlaceAutocompleteElement = HTMLElement & {
  placeholder?: string;
  value?: string;
};

type PlacePredictionSelectEvent = Event & {
  placePrediction?: {
    toPlace(): {
      displayName?: string;
      formattedAddress?: string;
      location?: GoogleLatLng | GoogleLatLngLiteral;
      fetchFields(request: { fields: string[] }): Promise<void>;
    };
  };
};

type PlacesLibrary = {
  PlaceAutocompleteElement: new () => PlaceAutocompleteElement;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function PlacePicker({
  destination,
  selectedPlace,
  onSelect,
}: {
  destination: string;
  selectedPlace?: string;
  onSelect: (place: SelectedPlace) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<PlaceAutocompleteElement | null>(null);
  const onSelectRef = useRef(onSelect);
  const selectedPlaceRef = useRef(selectedPlace);
  const [status, setStatus] = useState('');
  const apiKey = getGoogleMapsApiKey();

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedPlaceRef.current = selectedPlace;
  }, [selectedPlace]);

  useEffect(() => {
    let cancelled = false;

    async function mountAutocomplete() {
      if (!apiKey) {
        setStatus('Google Maps API key is not configured.');
        return;
      }

      if (!containerRef.current || elementRef.current) {
        return;
      }

      try {
        await loadGoogleMaps(apiKey);
        if (cancelled || !window.google?.maps || !containerRef.current) {
          return;
        }

        let placesLibrary: PlacesLibrary | null = null;
        let placesError: unknown;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            placesLibrary = (await window.google.maps.importLibrary(
              'places',
            )) as PlacesLibrary;
            if (placesLibrary.PlaceAutocompleteElement) {
              break;
            }
          } catch (error) {
            placesError = error;
          }
          await wait(400);
        }

        if (!placesLibrary?.PlaceAutocompleteElement) {
          throw (
            placesError ?? new Error('Places autocomplete is not available.')
          );
        }

        const { PlaceAutocompleteElement } = placesLibrary;
        const autocomplete = new PlaceAutocompleteElement();
        autocomplete.placeholder = destination
          ? `Search places near ${destination}`
          : 'Search a place';
        autocomplete.className = 'waylog-place-autocomplete';

        autocomplete.addEventListener('gmp-select', (event) => {
          void handlePlaceSelect(event as PlacePredictionSelectEvent);
        });

        async function handlePlaceSelect(event: PlacePredictionSelectEvent) {
          const placePrediction = event.placePrediction;
          if (!placePrediction) {
            return;
          }

          setStatus('Saving selected place...');
          const place = placePrediction.toPlace();
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location'],
          });
          recordMapsUsage('placeSelections');

          if (!place.location) {
            setStatus('Selected place has no coordinates.');
            return;
          }

          const location = readLatLng(place.location);
          onSelectRef.current({
            place:
              place.displayName ??
              place.formattedAddress ??
              selectedPlaceRef.current ??
              '',
            formattedAddress: place.formattedAddress,
            latitude: location.lat,
            longitude: location.lng,
          });
          setStatus('Place coordinates saved.');
        }

        containerRef.current.appendChild(autocomplete);
        elementRef.current = autocomplete;
        setStatus('');
      } catch {
        setStatus('Unable to load Places search.');
      }
    }

    void mountAutocomplete();

    return () => {
      cancelled = true;
      elementRef.current?.remove();
      elementRef.current = null;
    };
  }, [apiKey, destination]);

  return (
    <div className="grid gap-2">
      <div className="grid gap-2" ref={containerRef} />
      {selectedPlace ? (
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin size={14} />
          {selectedPlace}
        </p>
      ) : null}
      {status ? (
        <p className="text-xs font-bold text-muted-foreground">{status}</p>
      ) : null}
    </div>
  );
}
