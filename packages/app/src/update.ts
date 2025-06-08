import { Auth, Update } from "@calpoly/mustang";
import type { Msg } from "./messages";
import type { Model } from "./model";

export default function update(
  [type, payload]: Msg,
  apply: Update.ApplyMap<Model>,
  user: Auth.User
) {
  switch (type) {
    case "categories/load":
      fetch("/api/categories", {
        headers: Auth.headers(user),
      })
        .then((r) => r.json())
        .then((categories) =>
          apply((m) => ({
            ...m,
            categories,
          }))
        );
      break;

    case "playlists/load":
      fetch(`/api/categories/${payload.categoryId}/playlists`, {
        headers: Auth.headers(user),
      })
        .then((r) => r.json())
        .then((playlists) =>
          apply((m) => ({
            ...m,
            playlists,
            selectedPlaylistId: payload.categoryId,
          }))
        );
      break;

    case "tracks/load":
      fetch(`/api/playlists/${payload.playlistId}/tracks`, {
        headers: Auth.headers(user),
      })
        .then((r) => r.json())
        .then((tracks) =>
          apply((m) => ({
            ...m,
            tracks,
            selectedTrackId: payload.playlistId,
          }))
        );
      break;


    default:
      
      throw new Error(`Unhandled message "${type}"`);
  }
}