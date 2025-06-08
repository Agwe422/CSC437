import { html } from "lit";

export const routes = [
  {
    path: "/app/playlists/create",
    view: () => html`<playlist-create-view></playlist-create-view>`
  },
  {
    path: "/app",
    view: () => html`<landing-view></landing-view>`
  },
  {
    path: "/",
    redirect: "/app"
  }
];
