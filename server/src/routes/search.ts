import { Router } from 'express';
import { songs, playlists, artists, hotSearchKeywords } from '../data/music.js';

export const searchRouter = Router();

// GET /api/v1/search/hot - 热门搜索关键词
searchRouter.get('/hot', (req, res) => {
  res.json({ data: hotSearchKeywords });
});

// GET /api/v1/search?q=xxx&type=song|artist|playlist|album - 搜索
searchRouter.get('/', (req, res) => {
  const { q, type = 'song' } = req.query;
  const query = String(q || '').toLowerCase();

  if (!query) {
    res.json({ data: { songs: [], artists: [], playlists: [] } });
    return;
  }

  const matchedSongs = songs.filter(
    s => s.title.toLowerCase().includes(query) ||
         s.artist.toLowerCase().includes(query) ||
         s.album.toLowerCase().includes(query)
  );

  const matchedArtists = artists.filter(
    a => a.name.toLowerCase().includes(query)
  );

  const matchedPlaylists = playlists.filter(
    p => p.title.toLowerCase().includes(query) ||
         p.description.toLowerCase().includes(query)
  );

  const result: Record<string, unknown> = {};
  if (type === 'song') result.songs = matchedSongs;
  else if (type === 'artist') result.artists = matchedArtists;
  else if (type === 'playlist') result.playlists = matchedPlaylists;
  else {
    result.songs = matchedSongs;
    result.artists = matchedArtists;
    result.playlists = matchedPlaylists;
  }

  res.json({ data: result });
});
