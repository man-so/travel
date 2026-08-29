'use client';

export type GoogleLatLngLiteral = {
  lat: number;
  lng: number;
};

export type GoogleLatLng = {
  lat(): number;
  lng(): number;
};

type GoogleImportLibrary = (library: string) => Promise<unknown>;

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
      fitBounds(bounds: { extend(location: GoogleLatLngLiteral): void }): void;
      setCenter(location: GoogleLatLngLiteral): void;
      setZoom(zoom: number): void;
    };
    Marker: new (options: {
      map: object;
      position: GoogleLatLngLiteral;
      title: string;
    }) => object;
    LatLngBounds: new () => {
      extend(location: GoogleLatLngLiteral): void;
    };
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
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (window.waylogGoogleMapsPromise) {
    return window.waylogGoogleMapsPromise;
  }

  window.waylogGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Google Maps.'));
    document.head.appendChild(script);
  });

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
