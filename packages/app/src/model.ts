import type { Category, Playlist, Track } from "server/models";

export interface Model {
  categories?: Category[];
  playlists?: Playlist[];
  tracks?: Track[];
  selectedPlaylistId?: string;
  selectedTrackId?: string;

  newPlaylist?: Playlist;
}

export const init: Model = {};