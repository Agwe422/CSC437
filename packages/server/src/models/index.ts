/**
 * A Spotify Category (aka “genre”) as returned by
 * GET /v1/browse/categories
 */
export interface Category {
  id:       string;
  name:     string;
  href:     string;
  icons:    { url: string; height: number; width: number }[];
}

/**
 * A Spotify Playlist summary as returned by
 * GET /v1/browse/categories/{category_id}/playlists
 */
export interface Playlist {
  id:       string;
  name:     string;
  href:     string;
  tracks:   { href: string; total: number };
  images:   { url: string; height: number; width: number }[];
  owner:    { id: string; display_name: string };
}

/**
 * A Spotify Track object (simplified) as returned by
 * GET /v1/playlists/{playlist_id}/tracks
 */
export interface Track {
  id:       string;
  name:     string;
  href:     string;
  album:    { images: { url: string; height: number; width: number }[] };
  artists:  { id: string; name: string }[];
}