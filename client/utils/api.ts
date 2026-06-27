const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

async function request<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  // Songs
  getSongUrl: (id: number, br = 320000) =>
    request(`/songs/${id}/url?br=${br}`),
  getLyric: (id: number) =>
    request(`/songs/${id}/lyric`),
  getSongDetail: (ids: number[]) =>
    request(`/songs/detail?ids=${ids.join(',')}`),
  getDailySongs: () =>
    request('/songs/daily'),

  // Playlists
  getPersonalized: (limit = 10) =>
    request(`/playlists/recommend?limit=${limit}`),
  getTopPlaylists: (cat = '全部', limit = 20) =>
    request(`/playlists/hot?category=${encodeURIComponent(cat)}&limit=${limit}`),
  getHighQualityPlaylists: (cat = '全部', limit = 20) =>
    request(`/playlists/hot?category=${encodeURIComponent(cat)}&limit=${limit}`),
  getTopList: () =>
    request('/playlists/toplist'),
  getPlaylistDetail: (id: number) =>
    request(`/playlists/${id}`),
  getPlaylistTracks: (id: number) =>
    request(`/playlists/${id}/tracks`),

  // Search
  search: (q: string, type = 'songs', limit = 30, offset = 0) =>
    request(`/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}&offset=${offset}`),
  getHotKeywords: () =>
    request('/search/hot'),

  // Artists
  getArtistDetail: (id: number) =>
    request(`/artists/${id}`),
  getArtistSongs: (id: number, limit = 50) =>
    request(`/artists/${id}/songs?limit=${limit}`),
};
