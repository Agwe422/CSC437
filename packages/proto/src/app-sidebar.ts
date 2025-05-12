import { LitElement, html, css } from 'lit';
import { define } from '@calpoly/mustang';

class AppSidebarElement extends LitElement {
  static styles = css`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background-color: var(--color-background-header);
      padding: var(--spacing-md);
    }
    .sidebar a {
      display: flex;
      align-items: center;
      gap: var(--spacing-xxs);
      color: var(--color-link);
      margin-bottom: var(--spacing-md);
      text-decoration: none;
    }
    svg.icon {
      width: var(--icon-size);
      height: var(--icon-size);
      fill: currentColor;
    }
  `;

  render() {
    return html`
      <aside class="sidebar">
        <a href="/index.html">
          Home
        </a>
        <a href="/playlist1.html">
          <svg class = "icon">
          <use xlink:href="/icons/app-icons.svg#playlist" />
        </svg>
          Playlist 1
        </a>
      </aside>
    `;
  }
}

define({ 'app-sidebar': AppSidebarElement });