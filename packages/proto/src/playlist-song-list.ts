import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('playlist-song-list')
export class PlaylistSongList extends LitElement {

  static styles = css`
    :host { display: block; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid var(--color-border); }
  `;


  @property({ type: String })
  src: string = '';

  @state()
  songs: Array<{ title: string; duration: string }> = [];

  connectedCallback() {
    super.connectedCallback();
    if (this.src) this._fetchSongs();
  }

  async _fetchSongs() {
    try {
      const res = await fetch(this.src);
      this.songs = await res.json();
    } catch (err) {
      console.error('Failed to load songs:', err);
    }
  }

  render() {
    return html`
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${this.songs.map(s => html`
            <playlist-song
              title=${s.title}
              duration=${s.duration}>
            </playlist-song>
          `)}
        </tbody>
      </table>
    `;
  }
}