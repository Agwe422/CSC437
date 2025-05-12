import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('playlist-song')
export class PlaylistSong extends LitElement {
  @property({ type: String })
  title: string = '';

  @property({ type: String })
  duration: string = '';

  static styles = css`
    :host { display: table-row; }
    td { padding: var(--spacing-xxs) var(--spacing-md); }
    .title    { text-align: left; }
    .duration { text-align: right; }
  `;

  render() {
    return html`
      <td class="title">${this.title}</td>
      <td class="duration">${this.duration}</td>
    `;
  }
}