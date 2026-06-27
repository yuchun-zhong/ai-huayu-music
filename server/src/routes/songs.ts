import { Router } from 'express';
import { songs } from '../data/music.js';

export const songsRouter = Router();

// Static routes MUST be before dynamic routes

// GET /api/v1/songs/hot - 获取热门榜单 Top5
songsRouter.get('/hot', (req, res) => {
  const hotSongs = songs.slice(0, 5);
  res.json({ data: hotSongs });
});

// GET /api/v1/songs/recent - 获取最近播放
songsRouter.get('/recent', (req, res) => {
  const recentSongs = songs.slice(5, 10);
  res.json({ data: recentSongs });
});

// GET /api/v1/songs/recommend - 每日推荐
songsRouter.get('/recommend', (req, res) => {
  const shuffled = [...songs].sort(() => Math.random() - 0.5);
  res.json({ data: shuffled.slice(0, 6) });
});

// GET /api/v1/songs/liked/list - 获取喜欢的歌曲
songsRouter.get('/liked/list', (req, res) => {
  const likedSongs = songs.filter(s => s.liked);
  res.json({ data: likedSongs });
});

// GET /api/v1/songs - 获取所有歌曲
songsRouter.get('/', (req, res) => {
  res.json({ data: songs });
});

// GET /api/v1/songs/:id - 获取歌曲详情
songsRouter.get('/:id', (req, res) => {
  const song = songs.find(s => s.id === Number(req.params.id));
  if (!song) {
    res.status(404).json({ error: 'Song not found' });
    return;
  }
  res.json({ data: song });
});

// POST /api/v1/songs/:id/like - 喜欢/取消喜欢
songsRouter.post('/:id/like', (req, res) => {
  const song = songs.find(s => s.id === Number(req.params.id));
  if (!song) {
    res.status(404).json({ error: 'Song not found' });
    return;
  }
  song.liked = !song.liked;
  res.json({ data: { id: song.id, liked: song.liked } });
});
