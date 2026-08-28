export type Companion = 'solo' | 'couple' | 'friends' | 'family';

export type CoverPhoto = {
  url: string;
  unsplashId?: string;
  photographerName?: string;
  photographerUsername?: string;
  photographerUrl?: string;
  unsplashUrl?: string;
  downloadLocation?: string;
};

export type Entry = {
  id: string;
  dayId: string;
  place: string;
  content: string;
  photoUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Day = {
  id: string;
  journeyId: string;
  dayNumber: number;
  date: string;
  title?: string;
  summary?: string;
  entries: Entry[];
};

export type Journey = {
  id: string;
  title: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  companion: Companion;
  cover?: CoverPhoto;
  days: Day[];
  createdAt: string;
  updatedAt: string;
};

export type JourneyDraft = {
  title: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  companion: Companion;
  cover?: CoverPhoto;
};
