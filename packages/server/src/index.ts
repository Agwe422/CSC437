interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  error?: string;
}


import 'dotenv/config';
import express, { Request, Response } from 'express';
import session from 'express-session';
import fetch from 'node-fetch';
import path from 'path';

declare module 'express-session' {
  // Extend SessionData to include our custom fields
  interface SessionData {
    spotify_auth_state: string;
    accessToken: string;
    refreshToken: string;
  }
}

const app = express();
const port = process.env.PORT || 3000;
// serve your frontend’s built files (adjust dirname if needed)
const staticDir = path.join(__dirname, '../../proto/dist');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI || `https://jhall61.csse.dev/auth/callback`;

function generateRandomString(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const SESSION_SECRET = generateRandomString(10)


app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(express.json());
// static files
app.use(express.static(staticDir));

// 1) Redirect user to Spotify for login
app.get('/auth/login', (req: Request, res: Response) => {
  const state = generateRandomString(16);
  req.session.spotify_auth_state = state;
  const scope = 'playlist-read-private playlist-modify-public playlist-modify-private';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// 2) Callback: exchange code for tokens
app.get('/auth/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const storedState = req.session.spotify_auth_state as string | undefined;

  if (!state || state !== storedState) {
    res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }));
    return;
  }
  delete req.session.spotify_auth_state;

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code || '',
      redirect_uri: REDIRECT_URI,
    }),
  });
  const tokenData = (await tokenRes.json()) as TokenResponse;
  if (tokenData.error) {
    res.redirect('/#' + new URLSearchParams({ error: tokenData.error }));
    return;
  }

  req.session.accessToken = tokenData.access_token;
  req.session.refreshToken = tokenData.refresh_token;
  res.redirect('/');
});

// 3) Proxy: fetch user playlists
app.get("/api/playlists", async (req: Request, res: Response) => {
  const userToken = req.session?.accessToken;
  if (!userToken) {
    res.sendStatus(401);              // front-end will ask user to log in
    return;
  }

  const r = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: { Authorization: `Bearer ${userToken}` }
  });

  if (!r.ok) {
    // token might be expired → optionally refresh here
    res.status(r.status).end();
    return;          // ensure the handler exits with void
  }

  const json: any = await r.json();
  res.json(json.items);
});


const categoryPlaylistsHandler: express.RequestHandler = async (req: Request, res: Response) => {
  const token = req.session.accessToken as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // A simple runtime check – Express automatically parses query params as strings
  const limit = (req.query.limit as string | undefined) ?? '10';
  const { id } = req.params;

  const url = `https://api.spotify.com/v1/browse/categories/${id}/playlists?limit=${limit}`;

  const spRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await spRes.json();
  res.status(spRes.status).json(data);
};

app.get('/api/category/:id/playlists', categoryPlaylistsHandler);


const playlistTracksHandler: express.RequestHandler = async (req, res) => {
  const token = req.session.accessToken as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const href = req.query.href as string | undefined;
  if (!href) {
    res.status(400).json({ error: 'Missing href' });
    return;
  }

  const limit = (req.query.limit as string | undefined) ?? '10';
  const url   = `${href}?limit=${limit}`;

  const spRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data: any = await spRes.json();
  res.status(spRes.status).json(data);
};
app.get('/api/playlist-tracks', playlistTracksHandler);

const trackHandler: express.RequestHandler = async (req, res) => {
  const token = req.session.accessToken as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const href = req.query.href as string | undefined;
  if (!href) {
    res.status(400).json({ error: 'Missing href' });
    return;
  }

  const spRes = await fetch(href, { headers: { Authorization: `Bearer ${token}` } });
  const data: any = await spRes.json();
  res.status(spRes.status).json(data);
};
app.get('/api/track', trackHandler);


// 4) (Optional) Refresh
app.get('/auth/refresh_token', async (req: Request, res: Response) => {
  const refreshToken = req.session.refreshToken as string;
  if (!refreshToken) {
    res.status(400).json({ error: 'No refresh_token' });
    return;
  }
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  const tokenData = (await tokenRes.json()) as TokenResponse;
  if (tokenData.error) {
    res.status(400).json(tokenData);
    return;
  }
  req.session.accessToken = tokenData.access_token;
  res.json({ access_token: tokenData.access_token });
});


app.get(/^\/(?!api\/|auth\/).*/, (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});