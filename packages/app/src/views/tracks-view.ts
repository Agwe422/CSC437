// packages/app/src/views/tracks-view.ts
import { customElement, property, state } from 'lit/decorators.js';
import { View, define } from '@calpoly/mustang';
import { html, css } from 'lit';
import { Model } from '../model';
import { Msg } from '../messages';

@customElement('tracks-view')
export class TracksViewElement extends View<Model, Msg> {
  static styles = css`
    ul { list-style: none; padding: 0; }
    li { margin: 0.5rem 0; }
  `;

  @property({ attribute: 'playlist-id' }) playlistId = '';
  @state() private tracks: any[] | null = null;
  @state() private error = '';

  constructor() {
    super('myapp:model');
  }

  async firstUpdated() {
    try {
      const res = await fetch(`/api/playlists/${this.playlistId}/tracks`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      this.tracks = json.items;
    } catch (e: any) {
      this.error = 'Could not load tracks.';
    }
  }

  render() {
    if (this.error) return html`<p>${this.error}</p>`;
    if (!this.tracks) return html`<p>Loading tracks…</p>`;

    return html`
      <ul>
        ${this.tracks.map(item => html`
          <li>${item.track.name} — ${item.track.artists[0].name}</li>
        `)}
      </ul>
    `;
  }
}