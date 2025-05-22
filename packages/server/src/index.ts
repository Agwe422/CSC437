interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  error?: string;
}
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import fetch from 'node-fetch';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;
// serve your frontend’s built files (adjust dirname if needed)
const staticDir = path.join(__dirname, '../../proto/dist');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${port}/auth/callback`;

function generateRandomString(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.use(cookieParser());
app.use(express.json());
// static files
app.use(express.static(staticDir));

// 1) Redirect user to Spotify for login
app.get('/auth/login', (req: Request, res: Response) => {
  const state = generateRandomString(16);
  res.cookie('spotify_auth_state', state, { httpOnly: true });
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
  const storedState = req.cookies.spotify_auth_state as string | undefined;

  if (!state || state !== storedState) {
    return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }));
  }
  res.clearCookie('spotify_auth_state');

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
    return res.redirect('/#' + new URLSearchParams({ error: tokenData.error }));
  }

  res.cookie('access_token', tokenData.access_token, { httpOnly: true });
  res.cookie('refresh_token', tokenData.refresh_token, { httpOnly: true });
  res.redirect('/');
});

// 3) Proxy: fetch user playlists
app.get('/api/playlists', async (req: Request, res: Response) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const spRes = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await spRes.json();
  res.json(data);
});

// 4) (Optional) Refresh
app.get('/auth/refresh_token', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(400).json({ error: 'No refresh_token' });
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
  if (tokenData.error) return res.status(400).json(tokenData);
  res.cookie('access_token', tokenData.access_token, { httpOnly: true });
  res.json({ access_token: tokenData.access_token });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});