'use client';

export type GoogleLatLngLiteral = {
  lat: number;
  lng: number;
};

export type GoogleLatLng = {
  lat(): number;
  lng(): number;
};

export type GoogleBoundsLiteral = {
  east: number;
  north: number;
  south: number;
  west: number;
};

export type GoogleBounds = {
  toJSON(): GoogleBoundsLiteral;
};

type GoogleImportLibrary = (library: string) => Promise<unknown>;

export type GoogleMarkerLabel =
  | string
  | {
      text: string;
      color?: string;
      fontSize?: string;
      fontWeight?: string;
    };

export type GoogleMarkerIcon = {
  url: string;
  scaledSize?: object;
  labelOrigin?: object;
};

export type GoogleMarker = {
  addListener(eventName: 'click', handler: () => void): { remove(): void };
  setIcon(icon?: GoogleMarkerIcon): void;
  setLabel(label?: GoogleMarkerLabel): void;
  setMap(map: object | null): void;
  setZIndex(zIndex?: number): void;
};

export type GooglePolyline = {
  setMap(map: object | null): void;
  setOptions(options: {
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    zIndex?: number;
  }): void;
};

export type GoogleMapsApi = {
  maps: {
    importLibrary: GoogleImportLibrary;
    Map: new (
      element: HTMLElement,
      options: {
        center: GoogleLatLngLiteral;
        zoom: number;
        disableDefaultUI?: boolean;
      },
    ) => {
      addListener(eventName: 'idle', handler: () => void): { remove(): void };
      fitBounds(bounds: { extend(location: GoogleLatLngLiteral): void }): void;
      getBounds(): GoogleBounds | undefined;
      getCenter(): GoogleLatLng | undefined;
      getZoom(): number | undefined;
      setCenter(location: GoogleLatLngLiteral): void;
      setZoom(zoom: number): void;
    };
    Marker: new (options: {
      map: object;
      position: GoogleLatLngLiteral;
      title: string;
      label?: GoogleMarkerLabel;
      icon?: GoogleMarkerIcon;
      zIndex?: number;
    }) => GoogleMarker;
    Point: new (x: number, y: number) => object;
    Size: new (width: number, height: number) => object;
    LatLngBounds: new () => {
      extend(location: GoogleLatLngLiteral): void;
    };
    Polyline: new (options: {
      map: object;
      path: GoogleLatLngLiteral[];
      geodesic?: boolean;
      strokeColor: string;
      strokeOpacity: number;
      strokeWeight: number;
      zIndex?: number;
    }) => GooglePolyline;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    waylogGoogleMapsPromise?: Promise<void>;
  }
}

export function getGoogleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

export function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps.importLibrary) {
    if (window.waylogGoogleMapsPromise) {
      return window.waylogGoogleMapsPromise;
    }

    return Promise.resolve();
  }

  if (window.waylogGoogleMapsPromise) {
    return window.waylogGoogleMapsPromise;
  }

  const googleWindow = window as unknown as {
    google?: {
      maps?: {
        __ib__?: () => void;
        importLibrary?: (library: string) => Promise<unknown>;
      };
    };
  };
  const requestedLibraries = new Set(['maps', 'marker', 'places']);
  const google = (googleWindow.google = googleWindow.google ?? {});
  const maps = (google.maps = google.maps ?? {});
  let bootstrapPromise: Promise<void> | undefined;

  maps.importLibrary = (library: string) => {
    requestedLibraries.add(library);

    bootstrapPromise =
      bootstrapPromise ??
      new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        const params = new URLSearchParams({
          key: apiKey,
          v: 'weekly',
          libraries: Array.from(requestedLibraries).join(','),
          loading: 'async',
          callback: 'google.maps.__ib__',
        });

        maps.__ib__ = resolve;
        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        script.async = true;
        script.defer = true;
        script.onerror = () =>
          reject(new Error('Unable to load Google Maps.'));
        document.head.appendChild(script);
      });

    return bootstrapPromise.then(() => window.google!.maps.importLibrary(library));
  };

  window.waylogGoogleMapsPromise = Promise.all(
    Array.from(requestedLibraries).map((library) => maps.importLibrary!(library)),
  ).then(() => undefined);

  return window.waylogGoogleMapsPromise;
}

function isGoogleLatLng(location: GoogleLatLng | GoogleLatLngLiteral): location is GoogleLatLng {
  return typeof location.lat === 'function';
}

export function readLatLng(location: GoogleLatLng | GoogleLatLngLiteral): GoogleLatLngLiteral {
  if (isGoogleLatLng(location)) {
    return {
      lat: location.lat(),
      lng: location.lng(),
    };
  }

  return {
    lat: location.lat,
    lng: location.lng,
  };
}
