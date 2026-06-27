import { Router } from 'express';
import * as netease from '../services/netease.js';

const router = Router();

/**
 * 综合搜索
 * GET /api/v1/search?q=keyword&type=song&limit=30&offset=0
 * type: song | artist | playlist | album
 */
router.get('/', async (req, res) => {
  try {
    const { q, type = 'song', limit = '30', offset = '0' } = req.query;
    if (!q) {
      res.json({ code: 200, data: { songs: [], artists: [], playlists: [] } });
      return;
    }

    const keyword = q as string;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    if (type === 'song') {
      const songs = await netease.searchSongs(keyword, limitNum, offsetNum);
      res.json({ code: 200, data: { songs } });
    } else if (type === 'artist') {
      const artists = await netease.searchArtists(keyword, limitNum);
      res.json({ code: 200, data: { artists } });
    } else if (type === 'playlist') {
      const playlists = await netease.searchPlaylists(keyword, limitNum);
      res.json({ code: 200, data: { playlists } });
    } else {
      // 综合搜索
      const [songs, artists, playlists] = await Promise.all([
        netease.searchSongs(keyword, 10),
        netease.searchArtists(keyword, 5),
        netease.searchPlaylists(keyword, 5),
      ]);
      res.json({ code: 200, data: { songs, artists, playlists } });
    }
  } catch (error: any) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * 热门搜索关键词
 * GET /api/v1/search/hot
 */
router.get('/hot', async (req, res) => {
  try {
    // 网易云热搜
    const { data } = await (await import('axios')).default.get(
      'https://music.163.com/api/search/hot',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://music.163.com',
        },
      }
    );
    const keywords = data.result?.hots?.map((h: any) => h.first) || [
      '周杰伦', '林俊杰', '陈奕迅', '薛之谦', '邓紫棋',
      '毛不易', '李荣浩', '华晨宇', '王菲', 'Taylor Swift',
    ];
    res.json({ code: 200, data: keywords });
  } catch {
    res.json({
      code: 200,
      data: ['周杰伦', '林俊杰', '陈奕迅', '薛之谦', '邓紫棋', '毛不易', '李荣浩', '华晨宇', '王菲', 'Taylor Swift'],
    });
  }
});

export default router;
