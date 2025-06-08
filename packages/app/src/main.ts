import { define, Auth, History, Switch, Store, Form } from "@calpoly/mustang";
import { HeaderElement } from "./components/blazing-header.ts";
import { PlaylistCreateViewElement } from "./views/playlist-create-view.ts";
import { routes } from "./routes.ts";
import { Model, init } from "./model";
import { Msg } from "./messages";
import update from "./update";

define({
  "mu-auth": Auth.Provider,
  "mu-history": History.Provider,
  "mu-store": class AppStore extends Store.Provider<Model, Msg> {
    constructor() {
      super(update, init, "spotify:auth");
    }
  },
  "mu-switch": class AppSwitch extends Switch.Element {
    constructor() {
      super(routes, "spotify:history", "spotify:auth");
    }
  },
  "mu-form": Form.Element,
  "blazing-header": HeaderElement,
  "playlist-create-view": PlaylistCreateViewElement,
});