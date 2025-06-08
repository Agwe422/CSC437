// src/main.ts
import { Auth, History, Switch, Store, define } from "@calpoly/mustang";
import { html } from "lit";
import { Msg } from "./messages.ts";
import { Model, init } from "./model.ts";
import update from "./update.ts";
import { TracksViewElement } from "./views/tracks-view.ts";
import { PlaylistsViewElement } from "./views/playlists-view.ts";
import { HeaderElement } from "./components/blazing-header.ts";

// 1) Define your routes for <mu-switch>
const routes: Switch.Route[] = [
  {
    path: "/app/playlists",
    view: () => html`<playlists-view></playlists-view>`
  },
  {
    path: "/app/tracks/:playlistId",
    view: (params) => html`<tracks-view playlist-id=${params.playlistId}></tracks-view>`
  },
  {
    path: "/app",
    redirect: "/app/playlists"
  },
  {
    path: "/",
    redirect: "/app"
  }
];

define({
  // Mustang providers
  "mu-auth": Auth.Provider,
  "mu-history": History.Provider,
  "mu-store": class AppStore extends Store.Provider<Model, Msg> {
    constructor() {
      // update fn, initial model, auth-provides token
      super(update, init, "myapp:auth");
    }
  },
  "mu-switch": class AppSwitch extends Switch.Element {
    constructor() {
      // routes, history-provides, auth-provides
      super(routes, "myapp:history", "myapp:auth");
    }
  },
  // your custom elements
  "my-header": HeaderElement,
  "playlists-view": PlaylistsViewElement,
  "tracks-view": TracksViewElement
});