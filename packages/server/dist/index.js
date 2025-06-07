"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"));
var import_express_session = __toESM(require("express-session"));
var import_node_fetch = __toESM(require("node-fetch"));
var import_path = __toESM(require("path"));
var import_promises = __toESM(require("node:fs/promises"));
const app = (0, import_express.default)();
const port = process.env.PORT || 3e3;
const staticDir = import_path.default.join(__dirname, "../../proto/dist");
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || `https://jhall61.csse.dev/auth/callback`;
function generateRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
const SESSION_SECRET = generateRandomString(10);
app.use((0, import_express_session.default)({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));
app.use(import_express.default.json());
app.use(import_express.default.static(staticDir));
app.get("/auth/login", (req, res) => {
  const state = generateRandomString(16);
  req.session.spotify_auth_state = state;
  const scope = "playlist-read-private playlist-modify-public playlist-modify-private";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = req.session.spotify_auth_state;
  if (!state || state !== storedState) {
    res.redirect("/#" + new URLSearchParams({ error: "state_mismatch" }));
    return;
  }
  delete req.session.spotify_auth_state;
  const tokenRes = await (0, import_node_fetch.default)("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code || "",
      redirect_uri: REDIRECT_URI
    })
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    res.redirect("/#" + new URLSearchParams({ error: tokenData.error }));
    return;
  }
  req.session.accessToken = tokenData.access_token;
  req.session.refreshToken = tokenData.refresh_token;
  res.redirect("/");
});
app.get("/api/playlists", async (req, res) => {
  const userToken = req.session?.accessToken;
  if (!userToken) {
    res.sendStatus(401);
    return;
  }
  const r = await (0, import_node_fetch.default)("https://api.spotify.com/v1/me/playlists", {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (!r.ok) {
    res.status(r.status).end();
    return;
  }
  const json = await r.json();
  res.json(json.items);
});
const categoryPlaylistsHandler = async (req, res) => {
  const token = req.session.accessToken;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const limit = req.query.limit ?? "10";
  const { id } = req.params;
  const url = `https://api.spotify.com/v1/browse/categories/${id}/playlists?limit=${limit}`;
  const spRes = await (0, import_node_fetch.default)(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await spRes.json();
  res.status(spRes.status).json(data);
};
app.get("/api/category/:id/playlists", categoryPlaylistsHandler);
const playlistTracksHandler = async (req, res) => {
  const token = req.session.accessToken;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const href = req.query.href;
  if (!href) {
    res.status(400).json({ error: "Missing href" });
    return;
  }
  const limit = req.query.limit ?? "10";
  const url = `${href}?limit=${limit}`;
  const spRes = await (0, import_node_fetch.default)(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await spRes.json();
  res.status(spRes.status).json(data);
};
app.get("/api/playlist-tracks", playlistTracksHandler);
const trackHandler = async (req, res) => {
  const token = req.session.accessToken;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const href = req.query.href;
  if (!href) {
    res.status(400).json({ error: "Missing href" });
    return;
  }
  const spRes = await (0, import_node_fetch.default)(href, { headers: { Authorization: `Bearer ${token}` } });
  const data = await spRes.json();
  res.status(spRes.status).json(data);
};
app.get("/api/track", trackHandler);
app.get("/auth/refresh_token", async (req, res) => {
  const refreshToken = req.session.refreshToken;
  if (!refreshToken) {
    res.status(400).json({ error: "No refresh_token" });
    return;
  }
  const tokenRes = await (0, import_node_fetch.default)("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    res.status(400).json(tokenData);
    return;
  }
  req.session.accessToken = tokenData.access_token;
  res.json({ access_token: tokenData.access_token });
});
app.get(/^\/(?!api\/|auth\/).*/, (_req, res) => {
  res.sendFile(import_path.default.join(staticDir, "index.html"));
});
app.use("/app", (req, res) => {
  const indexHtml = import_path.default.resolve(staticDir, "index.html");
  import_promises.default.readFile(indexHtml, { encoding: "utf8" }).then(
    (html) => res.send(html)
  );
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
