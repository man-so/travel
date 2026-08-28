export type UnsplashPhoto = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  blurHash: string | null;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  photographer: {
    name: string;
    username: string;
    profileUrl: string;
  };
  unsplashUrl: string;
  downloadLocation: string;
};
