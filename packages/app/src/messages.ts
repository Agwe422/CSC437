export type Msg =
  | ["categories/load",      {}]
  | ["playlists/load",       { categoryId: string }]
  | ["tracks/load",          { playlistId: string }]
  | ["playlist/select",      { playlistId: string }]
  | ["track/select",         { trackId: string }];