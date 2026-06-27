import { Router } from 'express';
import { artists } from '../data/music.js';

export const artistsRouter = Router();

// GET /api/v1/artists - 获取所有歌手
artistsRouter.get('/', (req, res) => {
  res.json({ data: artists });
});

// GET /api/v1/artists/recent - 最近播放的歌手
artistsRouter.get('/recent', (req, res) => {
  res.json({ data: artists.slice(0, 6) });
});

// GET /api/v1/artists/:id - 歌手详情
artistsRouter.get('/:id', (req, res) => {
  const artist = artists.find(a => a.id === Number(req.params.id));
  if (!artist) {
    res.status(404).json({ error: 'Artist not found' });
    return;
  }
  res.json({ data: artist });
});
