import { Category, Playlist, Track } from "server/models";

export interface Model {
  categories?: Category[];          // the browse‐categories from Spotify
  playlists?: Playlist[];           // the playlists for the selected category
  tracks?: Track[];                 // the tracks for the selected playlist
  selectedPlaylistId?: string;      // the playlist the user clicked on
  selectedTrackId?: string;         // the track the user clicked on
}

export const init: Model = {};