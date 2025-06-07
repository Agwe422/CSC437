import {
  Auth,
  define,
  History,
  Switch
} from "@calpoly/mustang";
import { html } from "lit";

// your header component:
import { HeaderElement } from "./components/spotifyplaylist-header.ts";

// your views (we’ll stub one here):
import { PlaylistsViewElement } from "./views/playlists-view.ts";

// 2.1) define your app’s routes
const routes: Switch.Route[] = [
  {
    path: "/app/playlists",
    view: () => html`<playlists-view></playlists-view>`
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

// 2.2) wire up all custom elements
define({
  "mu-auth":     Auth.Provider,
  "mu-history":  History.Provider,
  // note that Switch needs your routes + history/auth tokens
  "mu-switch":   class AppSwitch extends Switch.Element {
    constructor() {
      super(routes, "spotifyplaylist:history", "spotifyplaylist:auth");
    }
  },
  // your header + any other UI components:
  "spotifyplaylist-header": HeaderElement,
  // your page-level views:
  "playlists-view":          PlaylistsViewElement
});