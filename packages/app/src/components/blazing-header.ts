import { LitElement, html, css } from "lit";

export class HeaderElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--color-background-header, #228b22);
      color: var(--color-text, #fff);
      padding: 0.75rem 1rem;
      font-size: 1.25rem;
    }
    nav a {
      color: var(--color-link, #e6e6fa);
      margin-right: 1rem;
      text-decoration: none;
    }
  `;

  render() {
    return html`
      <header class="page-header">
        <span>🎵 Blazing Playlists</span>
        <nav>
          <a href="/">Home</a>
          <a href="/playlists">My Playlists</a>
          <!-- add more links as routes grow -->
        </nav>
      </header>
    `;
  }
}