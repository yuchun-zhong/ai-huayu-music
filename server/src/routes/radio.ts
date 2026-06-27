import { Router } from 'express';
import { radioStations } from '../data/music.js';

export const radioRouter = Router();

// GET /api/v1/radio - 获取所有电台
radioRouter.get('/', (req, res) => {
  res.json({ data: radioStations });
});

// GET /api/v1/radio/categories - 获取电台分类
radioRouter.get('/categories', (req, res) => {
  const categories = [...new Set(radioStations.map(r => r.category))];
  res.json({ data: categories });
});

// GET /api/v1/radio/:category - 按分类获取电台
radioRouter.get('/category/:category', (req, res) => {
  const filtered = radioStations.filter(r => r.category === req.params.category);
  res.json({ data: filtered });
});

// GET /api/v1/radio/playing - 正在播放的电台
radioRouter.get('/playing', (req, res) => {
  const playing = radioStations.find(r => r.isPlaying);
  res.json({ data: playing || radioStations[0] });
});
