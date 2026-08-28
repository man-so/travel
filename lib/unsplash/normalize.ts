import type { UnsplashPhoto } from '@/types/unsplash';

type RawUnsplashPhoto = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  blur_hash: string | null;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download_location: string;
  };
};

const utm = 'utm_source=waylog&utm_medium=referral';

function withUtm(url: string) {
  return `${url}${url.includes('?') ? '&' : '?'}${utm}`;
}

export function normalizeUnsplashPhoto(photo: RawUnsplashPhoto): UnsplashPhoto {
  return {
    id: photo.id,
    width: photo.width,
    height: photo.height,
    color: photo.color,
    blurHash: photo.blur_hash,
    urls: photo.urls,
    photographer: {
      name: photo.user.name,
      username: photo.user.username,
      profileUrl: withUtm(photo.user.links.html),
    },
    unsplashUrl: withUtm(photo.links.html),
    downloadLocation: photo.links.download_location,
  };
}
