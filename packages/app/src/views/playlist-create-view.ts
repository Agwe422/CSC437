import { define, View } from "@calpoly/mustang";
import { html, css, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import type { Playlist } from "server/models";
import type { Msg } from "../messages";
import type { Model } from "../model";

export class PlaylistCreateViewElement extends View<Model, Msg> {
  static uses = define({
    "mu-form": (window as any)["mu-form"],
  });

  @state()
  name = "";

  @state()
  description = "";

  @state()
  isPublic = false;

  constructor() {
    super("spotify:model");
  }

  static styles = css`
    .form-group { margin-bottom: 1rem; }
  `;

  render() {
    return html`
      <main class="page">
        <h2>Create a New Playlist</h2>
        <mu-form @mu-form:submit=${this.handleSubmit}>
          <div class="form-group">
            <label>Name:</label>
            <input name="name" .value=${this.name} @input=${(e: Event) =>
              (this.name = (e.target as HTMLInputElement).value)} required />
          </div>
          <div class="form-group">
            <label>Description:</label>
            <textarea name="description" .value=${this.description} 
                      @input=${(e: Event) =>
                        (this.description = (e.target as HTMLTextAreaElement).value)}></textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" name="isPublic" 
                     .checked=${this.isPublic}
                     @change=${(e: Event) =>
                       (this.isPublic = (e.target as HTMLInputElement).checked)} />
              Public
            </label>
          </div>
          <button type="submit">Create Playlist</button>
        </mu-form>
      </main>
    `;
  }

  private handleSubmit(e: CustomEvent) {
    e.preventDefault();
    const detail = e.detail as { name: string; description?: string; isPublic?: boolean };
    this.dispatchMessage([
      "playlist/create",
      {
        name: detail.name,
        description: detail.description,
        isPublic: detail.isPublic,
        onSuccess: (pl: Playlist) => {
          console.log("Created:", pl);
        },
        onFailure: (err) => console.error("Create failed:", err),
      },
    ]);
  }
}