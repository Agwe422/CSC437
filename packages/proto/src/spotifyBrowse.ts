interface TrackItem {
  track: {
    id: string;
    name: string;
    href: string;
    album: { images: { url: string }[] };
    artists: { name: string }[];
  };
}
const APIController = (function() {
  const clientId = '0d5b4043cc934147973074e15d1f2b0c';
  const clientSecret = '33d4b6a5c112493290b38c127329251c';

  // 1.1 Get a client‐credentials token from Spotify
  const _getToken = async (): Promise<string> => {
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Base64‐encode “clientId:clientSecret”
        Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    });
    const data = await result.json();
    return data.access_token; // a string like “BQD…”
  };

  // 1.2 Get Spotify “browse categories” (genres)
  const _getGenres = async (token: string) => {
    const response = await fetch(
      `https://api.spotify.com/v1/browse/categories?locale=sv_US`,
      {
        method: 'GExT',
        headers: { Authorization: 'Bearer ' + token }
      }
    );
    const data = await response.json();
    // data.categories.items is an array of { id, name, … }
    return data.categories.items as Array<{ id: string; name: string }>;
  };

  // 1.3 Given a genreId, fetch up to 10 playlists in that genre
  const _getPlaylistByGenre = async (genreId: string, limit = 10) => {
  const res = await fetch(`/api/category/${genreId}/playlists?limit=${limit}`);
  if (!res.ok) throw new Error(`Server said ${res.status}`);
  const data = await res.json();
  return data.playlists.items;   // ← now safe
};

  // 1.4 Given a playlist‑tracks endpoint returned by Spotify, fetch its first `limit` track items **via our Express proxy**
  const _getTracks = async (endpoint: string, limit = 10): Promise<TrackItem[]> => {
    const res = await fetch(
      `/api/playlist-tracks?href=${encodeURIComponent(endpoint)}&limit=${limit}`
    );
    if (!res.ok) throw new Error(`Server said ${res.status}`);
    const json = await res.json();
    return json.items as TrackItem[];
  };

  // 1.5 Fetch one individual track – again via the proxy
  const _getTrack = async (endpoint: string): Promise<any> => {
    const res = await fetch(`/api/track?href=${encodeURIComponent(endpoint)}`);
    if (!res.ok) throw new Error(`Server said ${res.status}`);
    return await res.json();
  };

  // Expose only the public methods
  return {
    getToken: _getToken,               // (still used only to load genres)
    getGenres: _getGenres,
    getPlaylistByGenre: _getPlaylistByGenre,
    getTracks: _getTracks,
    getTrack: _getTrack
  };
})();


const UIController = (function() {
  // store our CSS selectors in one place
  const DOMElements = {
    selectGenre: '#select_genre',
    selectPlaylist: '#select_playlist',
    buttonSearch: '#btn_search',
    divSongDetail: '#song-detail',
    hiddenToken: '#hidden_token',
    divSongList: '.song-list'
  };

  return {
    // 2.1 Read references to the DOM nodes we need
    inputFields() {
      return {
        genre: document.querySelector<HTMLSelectElement>(
          DOMElements.selectGenre
        )!,
        playlist: document.querySelector<HTMLSelectElement>(
          DOMElements.selectPlaylist
        )!,
        tracks: document.querySelector<HTMLDivElement>(
          DOMElements.divSongList
        )!,
        searchButton: document.querySelector<HTMLButtonElement>(
          DOMElements.buttonSearch
        )!,
        songDetail: document.querySelector<HTMLDivElement>(
          DOMElements.divSongDetail
        )!
      };
    },

    // 2.2 Append an <option> to the genre <select>
    createGenre(text: string, value: string) {
      const sel = document.querySelector<HTMLSelectElement>(DOMElements.selectGenre);
      if (sel) sel.insertAdjacentHTML('beforeend', `<option value="${value}">${text}</option>`);
    },

    // 2.3 Append an <option> to the playlist <select>
    createPlaylist(text: string, value: string) {
      const sel = document.querySelector<HTMLSelectElement>(DOMElements.selectPlaylist);
      if (sel) sel.insertAdjacentHTML('beforeend', `<option value="${value}">${text}</option>`);
    },

    // 2.4 For each track, create a clickable <a>
    createTrack(id: string, name: string) {
      const list = document.querySelector<HTMLDivElement>(DOMElements.divSongList);
      if (list) list.insertAdjacentHTML('beforeend',
        `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`
      );
    },

    // 2.5 Show the clicked track’s album image, title, and artist
    createTrackDetail(img: string, title: string, artist: string) {
      const detailDiv = document.querySelector<HTMLDivElement>(DOMElements.divSongDetail);
      if (!detailDiv) return;
      detailDiv.innerHTML = ''; // clear out old content
      const html = `
        <div class="row col-sm-12 px-0">
          <img src="${img}" alt="" style="max-width:100%; height:auto;" />
        </div>
        <div class="row col-sm-12 px-0">
          <label class="form-label col-sm-12">${title}</label>
        </div>
        <div class="row col-sm-12 px-0">
          <label class="form-label col-sm-12">By ${artist}</label>
        </div>
      `;
      detailDiv.insertAdjacentHTML('beforeend', html);
    },

    // 2.6 Clear out each section when selections change
    resetPlaylist() {
      this.inputFields().playlist.innerHTML =
        '<option value="">-- Select a playlist --</option>';
      this.resetTracks();
    },
    resetTracks() {
      this.inputFields().tracks.innerHTML = '';
      this.resetTrackDetail();
    },
    resetTrackDetail() {
      this.inputFields().songDetail.innerHTML = '';
    },

    // 2.7 Store and retrieve our token from the hidden <input>
    storeToken(value: string) {
      const hidden = document.querySelector<HTMLInputElement>(DOMElements.hiddenToken);
      if (hidden) hidden.value = value;
    },
    getStoredToken(): string {
      const hidden = document.querySelector<HTMLInputElement>(DOMElements.hiddenToken);
      return hidden?.value ?? '';
    }
  };
})();

////////////////////////////////////////////////////////////////////////////////
// 3) APPController: wires up UI events → API calls → UI updates
////////////////////////////////////////////////////////////////////////////////
const APPController = (function(
  UICtrl: typeof UIController,
  APICtrl: typeof APIController
) {
  // grab our DOM references once
  const DOM = UICtrl.inputFields();

  // 3.1 On page load: fetch a token, then load all genres into the genre <select>
  const loadGenres = async () => {
    const token = await APICtrl.getToken();
    UICtrl.storeToken(token);

    const genres = await APICtrl.getGenres(token);
    // each genre: { id: "pop", name: "Pop", … }
    genres.forEach((g) => UICtrl.createGenre(g.name, g.id));
  };

  // 3.2 When the genre <select> changes, fetch playlists for that genre
  if (DOM.genre) {
    DOM.genre.addEventListener('change', async () => {
      UICtrl.resetPlaylist();
      // const token = UICtrl.getStoredToken(); // no longer needed
      const genreId = DOM.genre.value; // e.g. “pop” or “rock”
      if (!genreId) return;

      const playlists = await APICtrl.getPlaylistByGenre(genreId, 10);
      // playlists: Array<{ name: string, tracks: { href: string } }>
      playlists.forEach((p: { name: string; tracks: { href: string } }) => {
        UICtrl.createPlaylist(p.name, p.tracks.href);
      });
    });
  }

  // 3.3 When the user clicks “Search Tracks,” fetch the first 10 tracks
  if (DOM.searchButton) {
    DOM.searchButton.addEventListener('click', async (e) => {
      e.preventDefault();
      UICtrl.resetTracks();
      const playlistHref = DOM.playlist.value; // e.g. ".../playlists/{id}/tracks"
      if (!playlistHref) return;

      const tracks = await APICtrl.getTracks(playlistHref);
      // tracks is Array<{ track: any }>
      tracks.forEach((item) => {
        const trackObj = item.track;
        // Each track has track.href (URL), track.name (title)
        UICtrl.createTrack(trackObj.href, trackObj.name);
      });
    });
  }

  // 3.4 When the user clicks a track link, fetch that track’s details
  if (DOM.tracks) {
    DOM.tracks.addEventListener('click', async (e) => {
      e.preventDefault();
      UICtrl.resetTrackDetail();

      const trackHref = (e.target as HTMLElement).id;
      if (!trackHref) return;

      const track = await APICtrl.getTrack(trackHref);
      // track.album.images is an array; pick the smallest (last) image for thumbnail
      const thumbnailUrl =
        track.album.images[track.album.images.length - 1].url;
      const title = track.name;
      const artist = track.artists[0].name;
      UICtrl.createTrackDetail(thumbnailUrl, title, artist);
    });
  }

  // ------------------------------------------------------------
  // expose a single public method
  return {
    init() {
      console.log('APPController.init() running');
      loadGenres();
    }
  };
})(UIController, APIController);

// Kick‑off once the document’s HTML is parsed
window.addEventListener('DOMContentLoaded', () => {
  APPController.init();
});