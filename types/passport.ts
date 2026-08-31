export type PassportMapPlace = {
  id: string;
  dayNumber: number;
  place: string;
  query: string;
  journeyTitle: string;
  destination: string;
  latitude: number;
  longitude: number;
  markerLabel?: string;
  markerColor?: string;
  markerTextColor?: string;
};

export type PassportCountry = {
  country: string;
  firstVisitedAt: string;
  lastVisitedAt: string;
  journeyCount: number;
  momentCount: number;
  cities: string[];
  mapPlaces: PassportMapPlace[];
  coverUrl?: string;
};

export type PassportSummary = {
  countryCount: number;
  cityCount: number;
  journeyCount: number;
  momentCount: number;
};

export type PassportViewModel = {
  countries: PassportCountry[];
  summary: PassportSummary;
  hasJourneys: boolean;
  hasJourneysMissingCountry: boolean;
};
