import { Router } from 'express';
import { playlists, songs } from '../data/music.js';

export const playlistsRouter = Router();

// GET /api/v1/playlists - 获取所有歌单
playlistsRouter.get('/', (req, res) => {
  res.json({ data: playlists });
});

// GET /api/v1/playlists/recommend - 推荐歌单
playlistsRouter.get('/recommend', (req, res) => {
  res.json({ data: playlists.slice(0, 4) });
});

// GET /api/v1/playlists/:id - 歌单详情
playlistsRouter.get('/:id', (req, res) => {
  const playlist = playlists.find(p => p.id === Number(req.params.id));
  if (!playlist) {
    res.status(404).json({ error: 'Playlist not found' });
    return;
  }
  const playlistSongs = playlist.songs
    .map(sid => songs.find(s => s.id === sid))
    .filter(Boolean);
  res.json({ data: { ...playlist, songList: playlistSongs } });
});
