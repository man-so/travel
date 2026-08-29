'use client';

import {
  getGoogleMapsApiKey,
  loadGoogleMaps,
  readLatLng,
  type GoogleBoundsLiteral,
  type GoogleLatLng,
  type GoogleLatLngLiteral,
} from '@/lib/google-maps-loader';

const CACHE_PREFIX = 'waylog.place-search.v1';

const categoryTypes: Record<string, string> = {
  맛집: 'restaurant',
  카페: 'cafe',
  명소: 'tourist_attraction',
  숙소: 'lodging',
  activity: 'tourist_attraction',
  accommodation: 'lodging',
  attraction: 'tourist_attraction',
  cafe: 'cafe',
  hotel: 'lodging',
  lodging: 'lodging',
  nature: 'tourist_attraction',
  restaurant: 'restaurant',
  shopping: 'shopping_mall',
};

type GooglePlace = {
  attributions?: Array<{
    provider?: string;
    providerURI?: string;
  }>;
  businessStatus?: string;
  currentOpeningHours?: {
    weekdayDescriptions?: string[];
  };
  id?: string;
  displayName?: unknown;
  fetchFields?(request: { fields: string[] }): Promise<{ place: GooglePlace }>;
  formattedAddress?: string;
  googleMapsURI?: string;
  location?: GoogleLatLng | GoogleLatLngLiteral;
  photos?: Array<{
    authorAttributions?: Array<{
      displayName: string;
      uri?: string;
    }>;
    getURI(options?: { maxHeight?: number; maxWidth?: number }): string;
    googleMapsURI?: string;
  }>;
  rating?: number;
  reviews?: Array<{
    authorAttribution?: {
      displayName: string;
      uri?: string;
    };
    googleMapsURI?: string;
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: string;
  }>;
  types?: string[];
};

type GooglePlaceConstructor = {
  new (options: {
    id: string;
    requestedLanguage?: string;
    requestedRegion?: string;
  }): GooglePlace;
  searchByText(request: {
    textQuery: string;
    fields: string[];
    includedType?: string;
    language?: string;
    locationBias?: GoogleLatLngLiteral;
    maxResultCount?: number;
    region?: string;
    useStrictTypeFiltering?: boolean;
  }): Promise<{ places?: GooglePlace[] }>;
};

type PlacesLibrary = {
  Place: GooglePlaceConstructor;
};

export type PlaceSearchResult = {
  id: string;
  placeId: string;
  name: string;
  category: string;
  rating?: number;
  address?: string;
  latitude: number;
  longitude: number;
};

export type PlaceSearchResponse = {
  cacheKey: string;
  fromCache: boolean;
  results: PlaceSearchResult[];
};

export type PlaceDetail = {
  placeId: string;
  photoUrl?: string;
  photoAttributions: Array<{
    name: string;
    uri?: string;
  }>;
  openingText?: string;
  businessStatus?: string;
  review?: {
    authorName?: string;
    authorUri?: string;
    googleMapsUri?: string;
    rating?: number;
    relativeTime?: string;
    text?: string;
  };
  googleMapsUri?: string;
  attributions: Array<{
    provider: string;
    providerUri?: string;
  }>;
};

export type PlaceDetailResponse = {
  cacheKey: string;
  detail: PlaceDetail;
  fromCache: boolean;
};

export type PlaceSearchViewport = {
  bounds?: GoogleBoundsLiteral;
  center?: GoogleLatLngLiteral;
  zoom?: number;
};

function normalizeSearchPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

function normalizeCoordinate(value: number) {
  return roundToStep(value, 0.02).toFixed(2);
}

function getRegionCachePart(viewport?: PlaceSearchViewport) {
  if (!viewport?.center) {
    return 'region:any';
  }

  const zoom = typeof viewport.zoom === 'number' ? Math.round(viewport.zoom) : 0;
  return [
    'region',
    normalizeCoordinate(viewport.center.lat),
    normalizeCoordinate(viewport.center.lng),
    `z${zoom}`,
  ].join(':');
}

export function getPlaceSearchCacheKey({
  destination,
  category,
  query,
  viewport,
}: {
  destination: string;
  category: string;
  query: string;
  viewport?: PlaceSearchViewport;
}) {
  return [
    CACHE_PREFIX,
    normalizeSearchPart(destination),
    normalizeSearchPart(category),
    normalizeSearchPart(query || category),
    getRegionCachePart(viewport),
  ].join(':');
}

export function getPlaceDetailCacheKey(placeId: string) {
  return [CACHE_PREFIX, 'detail', placeId].join(':');
}

function readDisplayName(displayName: unknown) {
  if (typeof displayName === 'string') {
    return displayName;
  }

  if (
    displayName &&
    typeof displayName === 'object' &&
    'text' in displayName &&
    typeof (displayName as { text?: unknown }).text === 'string'
  ) {
    return (displayName as { text: string }).text;
  }

  return '';
}

function readCachedResults(cacheKey: string) {
  try {
    const cached = window.sessionStorage.getItem(cacheKey);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached) as PlaceSearchResult[];
  } catch {
    return null;
  }
}

function writeCachedResults(cacheKey: string, results: PlaceSearchResult[]) {
  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(results));
  } catch {
    // Session cache is an optimization only. Search still works if storage fails.
  }
}

function readCachedDetail(cacheKey: string) {
  try {
    const cached = window.sessionStorage.getItem(cacheKey);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached) as PlaceDetail;
  } catch {
    return null;
  }
}

function writeCachedDetail(cacheKey: string, detail: PlaceDetail) {
  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(detail));
  } catch {
    // Session cache is an optimization only. Detail display still works.
  }
}

async function getPlacesLibrary() {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured.');
  }

  await loadGoogleMaps(apiKey);
  const placesLibrary = (await window.google?.maps.importLibrary(
    'places',
  )) as PlacesLibrary | undefined;

  if (!placesLibrary?.Place) {
    throw new Error('Google Places is not available.');
  }

  return placesLibrary;
}

export async function searchGooglePlaces({
  destination,
  category,
  query,
  viewport,
}: {
  destination: string;
  category: string;
  query: string;
  viewport?: PlaceSearchViewport;
}): Promise<PlaceSearchResponse> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured.');
  }

  const cacheKey = getPlaceSearchCacheKey({
    destination,
    category,
    query,
    viewport,
  });
  const cachedResults = readCachedResults(cacheKey);
  if (cachedResults) {
    return {
      cacheKey,
      fromCache: true,
      results: cachedResults,
    };
  }

  const placesLibrary = await getPlacesLibrary();

  if (!placesLibrary.Place.searchByText) {
    throw new Error('Google Places search is not available.');
  }

  const searchTerm = normalizeSearchPart(query || category);
  const textQuery = destination
    ? `${searchTerm} near ${destination}`
    : searchTerm;
  const includedType = categoryTypes[category];
  const response = await placesLibrary.Place.searchByText({
    textQuery,
    fields: [
      'id',
      'displayName',
      'formattedAddress',
      'location',
      'rating',
      'types',
    ],
    includedType,
    ...(viewport?.center ? { locationBias: viewport.center } : {}),
    maxResultCount: 8,
    language: 'ko',
    region: 'kr',
    useStrictTypeFiltering: false,
  });

  const results = (response.places ?? []).reduce<PlaceSearchResult[]>(
    (items, place, index) => {
      if (!place.location) {
        return items;
      }

      const location = readLatLng(place.location);
      const placeId = place.id ?? `${textQuery}-${index}`;
      const result: PlaceSearchResult = {
        id: `explore:${placeId}`,
        placeId,
        name:
          readDisplayName(place.displayName) ||
          place.formattedAddress ||
          'Unnamed place',
        category: place.types?.[0]?.replace(/_/g, ' ') ?? category,
        latitude: location.lat,
        longitude: location.lng,
      };
      if (typeof place.rating === 'number') {
        result.rating = place.rating;
      }
      if (place.formattedAddress) {
        result.address = place.formattedAddress;
      }
      items.push(result);
      return items;
    },
    [],
  );

  writeCachedResults(cacheKey, results);

  return {
    cacheKey,
    fromCache: false,
    results,
  };
}

export async function fetchGooglePlaceDetail(
  placeId: string,
): Promise<PlaceDetailResponse> {
  const cacheKey = getPlaceDetailCacheKey(placeId);
  const cachedDetail = readCachedDetail(cacheKey);
  if (cachedDetail) {
    return {
      cacheKey,
      detail: cachedDetail,
      fromCache: true,
    };
  }

  const placesLibrary = await getPlacesLibrary();
  const place = new placesLibrary.Place({
    id: placeId,
    requestedLanguage: 'ko',
    requestedRegion: 'kr',
  });

  if (!place.fetchFields) {
    throw new Error('Google Place details are not available.');
  }

  const { place: detailPlace } = await place.fetchFields({
    fields: [
      'attributions',
      'businessStatus',
      'currentOpeningHours',
      'googleMapsURI',
      'photos',
      'reviews',
    ],
  });
  const photo = detailPlace.photos?.[0];
  const review = detailPlace.reviews?.[0];
  const detail: PlaceDetail = {
    placeId,
    photoAttributions:
      photo?.authorAttributions?.map((author) => ({
        name: author.displayName,
        ...(author.uri ? { uri: author.uri } : {}),
      })) ?? [],
    attributions:
      detailPlace.attributions?.map((attribution) => ({
        provider: attribution.provider ?? 'Google',
        ...(attribution.providerURI
          ? { providerUri: attribution.providerURI }
          : {}),
      })) ?? [],
  };

  const openingText = detailPlace.currentOpeningHours?.weekdayDescriptions?.[0];
  if (photo) {
    detail.photoUrl = photo.getURI({ maxHeight: 220, maxWidth: 420 });
  }
  if (openingText) {
    detail.openingText = openingText;
  }
  if (detailPlace.businessStatus) {
    detail.businessStatus = detailPlace.businessStatus;
  }
  if (review) {
    detail.review = {
      ...(review.authorAttribution?.displayName
        ? { authorName: review.authorAttribution.displayName }
        : {}),
      ...(review.authorAttribution?.uri
        ? { authorUri: review.authorAttribution.uri }
        : {}),
      ...(review.googleMapsURI ? { googleMapsUri: review.googleMapsURI } : {}),
      ...(typeof review.rating === 'number' ? { rating: review.rating } : {}),
      ...(review.relativePublishTimeDescription
        ? { relativeTime: review.relativePublishTimeDescription }
        : {}),
      ...(review.text ? { text: review.text } : {}),
    };
  }
  if (detailPlace.googleMapsURI) {
    detail.googleMapsUri = detailPlace.googleMapsURI;
  }

  writeCachedDetail(cacheKey, detail);

  return {
    cacheKey,
    detail,
    fromCache: false,
  };
}
