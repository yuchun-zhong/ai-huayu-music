import { Router } from 'express';
import * as netease from '../services/netease.js';

const router = Router();

// 静态路由必须在动态路由之前定义

/**
 * 获取歌曲详情
 * GET /api/v1/songs/detail?ids=1,2,3
 */
router.get('/detail', async (req, res) => {
  try {
    const ids = (req.query.ids as string || '').split(',').map(Number).filter(Boolean);
    if (ids.length === 0) {
      res.json({ code: 200, data: [] });
      return;
    }
    const songs = await netease.getSongDetail(ids);
    res.json({ code: 200, data: songs });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * 获取每日推荐歌曲
 * GET /api/v1/songs/daily
 */
router.get('/daily', async (req, res) => {
  try {
    const songs = await netease.getDailyRecommendSongs();
    res.json({ code: 200, data: songs });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * 获取歌曲播放地址
 * GET /api/v1/songs/:id/url
 */
router.get('/:id/url', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const url = await netease.getSongUrl(id);
    if (url) {
      res.json({ code: 200, data: { url } });
    } else {
      res.json({ code: 200, data: { url: '' }, message: 'No playable URL' });
    }
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * 获取歌词
 * GET /api/v1/songs/:id/lyric
 */
router.get('/:id/lyric', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lyric = await netease.getLyric(id);
    res.json({ code: 200, data: lyric });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
