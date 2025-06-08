import type { Playlist } from "server/models";

export type Msg =
  | ["category/select", { categoryId: string }]
  | ["playlist/select", { playlistId: string }]
  | ["track/select", { trackId: string }]
  | ["categories/load", {}]
  | ["playlists/load", { categoryId: string }]
  | ["tracks/load",    { playlistId: string }]
  | [
      "playlist/create",
      {
        name: string;
        description?: string;
        isPublic?: boolean;
        onSuccess?: (pl: Playlist) => void;
        onFailure?: (err: Error) => void;
      }
    ];