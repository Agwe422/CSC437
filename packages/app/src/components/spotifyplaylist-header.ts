import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("spotifyplaylist-header")
export class HeaderElement extends LitElement {
  static styles = css`
    header { padding: 1rem; background: #1db954; color: white; }
  `;

  render() {
    return html`
      <header>
        <h1>My Spotify Playlist Manager</h1>
      </header>
    `;
  }
}