import { Router } from 'express';
import * as netease from '../services/netease.js';

const router = Router();

// 静态路由必须在动态路由之前定义

/**
 * 获取推荐歌单
 * GET /api/v1/playlists/recommend?limit=10
 */
router.get('/recommend', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const playlists = await netease.getPersonalizedPlaylists(limit);
    res.json({ code: 200, data: playlists });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * 获取热门歌单
 * GET /api/v1/playlists/hot?category=全部&limit=20
 */
router.get('/hot', async (req, res) => {
  try {
    const category = (req.query.category as string) || '全部';
    const limit = parseInt(req.query.limit as string) || 20;
    const playlists = await netease.getTopPlaylists(category, limit);
    res.json({ code: 200, data: playlists });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * 获取歌单详情
 * GET /api/v1/playlists/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const playlist = await netease.getPlaylistDetail(id);
    if (playlist) {
      res.json({ code: 200, data: playlist });
    } else {
      res.json({ code: 404, message: 'Playlist not found' });
    }
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * 获取歌单中的歌曲
 * GET /api/v1/playlists/:id/tracks
 */
router.get('/:id/tracks', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tracks = await netease.getPlaylistTracks(id);
    res.json({ code: 200, data: tracks });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
