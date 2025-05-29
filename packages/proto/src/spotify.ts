
// ————————————————————————————————————————————————————————————————
// 1) Types
// ————————————————————————————————————————————————————————————————
interface Category { id: string; name: string }
interface Playlist { name: string; tracks: { href: string } }
interface TrackItem {
  track: {
    id: string
    name: string
    href: string
    album: { images: { url: string }[] }
    artists: { name: string }[]
  }
}

// ————————————————————————————————————————————————————————————————
// 2) API MODULE
// ————————————————————————————————————————————————————————————————
const APIController = (() => {
  // pick these up from Vite’s env
  const clientId     = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string

  async function _getToken(): Promise<string> {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(`${clientId}:${clientSecret}`)
      },
      body: "grant_type=client_credentials"
    })
    const json = await res.json()
    return json.access_token
  }

  async function _getGenres(token: string): Promise<Category[]> {
    const res = await fetch(
      "https://api.spotify.com/v1/browse/categories?locale=sv_US",
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const json = await res.json()
    return json.categories.items
  }

  async function _getPlaylists(token: string, genreId: string): Promise<Playlist[]> {
    const res = await fetch(
      `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=10`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const json = await res.json()
    return json.playlists.items
  }

  async function _getTracks(token: string, endpoint: string): Promise<TrackItem[]> {
    const res = await fetch(`${endpoint}?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const json = await res.json()
    return json.items
  }

  async function _getTrack(token: string, endpoint: string) {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return await res.json()
  }

  return {
    getToken:        _getToken,
    getGenres:       _getGenres,
    getPlaylists:    _getPlaylists,
    getTracks:       _getTracks,
    getTrack:        _getTrack
  }
})()

// ————————————————————————————————————————————————————————————————
// 3) UI MODULE
// ————————————————————————————————————————————————————————————————
const UIController = (() => {
  const DOM = {
    selectGenre:   "#select_genre",
    selectPlaylist:"#select_playlist",
    btnSearch:     "#btn_submit",
    songList:      ".song-list",
    songDetail:    "#song-detail",
    hiddenToken:   "#hidden_token"
  }

  return {
    getElements() {
      return {
        genre:    document.querySelector<HTMLSelectElement>(DOM.selectGenre)!,
        playlist: document.querySelector<HTMLSelectElement>(DOM.selectPlaylist)!,
        search:   document.querySelector<HTMLButtonElement>(DOM.btnSearch)!,
        list:     document.querySelector<HTMLDivElement>(DOM.songList)!,
        detail:   document.querySelector<HTMLDivElement>(DOM.songDetail)!,
        token:    document.querySelector<HTMLInputElement>(DOM.hiddenToken)!
      }
    },

    fillGenres(genres: Category[]) {
      const sel = this.getElements().genre
      genres.forEach(g => {
        const opt = document.createElement("option")
        opt.value = g.id
        opt.textContent = g.name
        sel.appendChild(opt)
      })
    },

    fillPlaylists(pls: Playlist[]) {
      const sel = this.getElements().playlist
      pls.forEach(p => {
        const opt = document.createElement("option")
        opt.value = p.tracks.href
        opt.textContent = p.name
        sel.appendChild(opt)
      })
    },

    fillTracks(ts: TrackItem[]) {
      const container = this.getElements().list
      container.innerHTML = ""
      ts.forEach(t => {
        const a = document.createElement("a")
        a.href = "#"
        a.id   = t.track.id
        a.textContent = t.track.name
        a.className = "list-group-item list-group-item-action list-group-item-light"
        container.appendChild(a)
      })
    },

    showTrackDetail(track: any) {
      const d = this.getElements().detail
      d.innerHTML = `
        <div class="row col-sm-12 px-0">
          <img src="${track.album.images[2].url}" alt="" class="track" />
        </div>
        <div class="row col-sm-12 px-0">
          <label class="form-label col-sm-12">${track.name}</label>
        </div>
        <div class="row col-sm-12 px-0">
          <label class="form-label col-sm-12">By ${track.artists[0].name}</label>
        </div>
      `
    },

    storeToken(tok: string) {
      this.getElements().token.value = tok
    },

    getStoredToken(): string {
      return this.getElements().token.value
    }
  }
})()

// ————————————————————————————————————————————————————————————————
// 4) APP INIT
// ————————————————————————————————————————————————————————————————
const APPController = (function(API, UI) {
  const E = UI.getElements()

  async function init() {
    const token = await API.getToken()
    UI.storeToken(token)

    const genres = await API.getGenres(token)
    UI.fillGenres(genres)
  }

  E.genre.addEventListener("change", async () => {
    E.playlist.innerHTML = "<option>Select…</option>"
    E.list.innerHTML     = ""
    E.detail.innerHTML   = ""
    const token = UI.getStoredToken()
    const pls   = await API.getPlaylists(token, E.genre.value)
    UI.fillPlaylists(pls)
  })

  E.search.addEventListener("click", async e => {
    e.preventDefault()
    E.list.innerHTML   = ""
    E.detail.innerHTML = ""
    const token = UI.getStoredToken()
    const tracks = await API.getTracks(token, E.playlist.value)
    UI.fillTracks(tracks)
  })

  E.list.addEventListener("click", async e => {
    e.preventDefault()
    const target = e.target as HTMLElement
    const token  = UI.getStoredToken()
    const trk    = await API.getTrack(token, target.id)
    UI.showTrackDetail(trk)
  })

  return { init }
})(APIController, UIController)

// ————————————————————————————————————————————————————————————————
window.addEventListener("DOMContentLoaded", () => {
  APPController.init()
})