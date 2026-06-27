import { Router } from 'express';
import * as netease from '../services/netease.js';

const router = Router();

/**
 * 获取热门歌手
 * GET /api/v1/artists/top?limit=12
 */
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 12;
    const artists = await netease.getTopArtists(limit);
    res.json({ code: 200, data: artists });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * 获取歌手热门歌曲
 * GET /api/v1/artists/:id/songs
 */
router.get('/:id/songs', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const songs = await netease.getArtistHotSongs(id);
    res.json({ code: 200, data: songs });
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

export default router;
