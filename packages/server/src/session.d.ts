import 'express-session';

declare module 'express-session' {
  interface SessionData {
    spotify_auth_state: string;
    accessToken: string;
    refreshToken: string;
  }
}