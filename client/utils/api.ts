const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export const api = {
  // Songs
  getSongs: () => fetch(`${BASE_URL}/api/v1/songs`).then(r => r.json()),
  getHotSongs: () => fetch(`${BASE_URL}/api/v1/songs/hot`).then(r => r.json()),
  getRecentSongs: () => fetch(`${BASE_URL}/api/v1/songs/recent`).then(r => r.json()),
  getRecommendSongs: () => fetch(`${BASE_URL}/api/v1/songs/recommend`).then(r => r.json()),
  getSongDetail: (id: number) => fetch(`${BASE_URL}/api/v1/songs/${id}`).then(r => r.json()),
  toggleLikeSong: (id: number) =>
    fetch(`${BASE_URL}/api/v1/songs/${id}/like`, { method: 'POST' }).then(r => r.json()),
  getLikedSongs: () => fetch(`${BASE_URL}/api/v1/songs/liked/list`).then(r => r.json()),

  // Playlists
  getPlaylists: () => fetch(`${BASE_URL}/api/v1/playlists`).then(r => r.json()),
  getRecommendPlaylists: () => fetch(`${BASE_URL}/api/v1/playlists/recommend`).then(r => r.json()),
  getPlaylistDetail: (id: number) => fetch(`${BASE_URL}/api/v1/playlists/${id}`).then(r => r.json()),

  // Radio
  getRadioStations: () => fetch(`${BASE_URL}/api/v1/radio`).then(r => r.json()),
  getRadioCategories: () => fetch(`${BASE_URL}/api/v1/radio/categories`).then(r => r.json()),
  getRadioByCategory: (category: string) =>
    fetch(`${BASE_URL}/api/v1/radio/category/${category}`).then(r => r.json()),
  getPlayingRadio: () => fetch(`${BASE_URL}/api/v1/radio/playing`).then(r => r.json()),

  // Search
  getHotKeywords: () => fetch(`${BASE_URL}/api/v1/search/hot`).then(r => r.json()),
  search: (q: string, type?: string) =>
    fetch(`${BASE_URL}/api/v1/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`).then(r => r.json()),

  // Artists
  getArtists: () => fetch(`${BASE_URL}/api/v1/artists`).then(r => r.json()),
  getRecentArtists: () => fetch(`${BASE_URL}/api/v1/artists/recent`).then(r => r.json()),
};
