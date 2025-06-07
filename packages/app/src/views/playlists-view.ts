import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import { unsafeHTML } from "lit/directives/unsafe-html.js";

@customElement("playlists-view")
export class PlaylistsViewElement extends LitElement {
  static styles = css`
    .prompt { margin: 2rem; }
    .list    { list-style: none; padding: 0; }
    .list li { margin: 0.5rem 0; display: flex; align-items: center; }
    .list img { width: 40px; height: 40px; margin-right: 0.5rem; }
  `;

  @state() private playlists: any[] | null = null;
  @state() private error    = "";

  async firstUpdated() {
    try {
      const res = await fetch("/api/playlists");
      if (res.status === 401) {
        this.error = `
          <p>Please <a href="/auth/login">log in with Spotify</a> to see your playlists.</p>
        `;
        return;
      }
      if (!res.ok) throw new Error(res.statusText);
      this.playlists = await res.json();
      if (this.playlists?.length === 0) {
        this.error = "No playlists found on your account.";
        return;
      }
    } catch (e: any) {
      this.error = "Unexpected error loading playlists.";
      console.error(e);
    }
  }

  render() {
    if (this.error) {
      return html`<div class="prompt">${unsafeHTML(this.error)}</div>`;
    }
    if (!this.playlists) {
      return html`<div class="prompt">Loading…</div>`;
    }
    return html`
      <ul class="list">
        ${this.playlists.map(p => html`
          <li>
            ${p.images?.[0]?.url
              ? html`<img src="${p.images[0].url}" />`
              : ""}
            <span>${p.name}</span>
          </li>
        `)}
      </ul>
    `;
  }
}