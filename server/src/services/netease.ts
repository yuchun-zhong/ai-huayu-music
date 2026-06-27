import axios from 'axios';

import type { Song, Playlist, Artist, RadioStation } from '../types/music.js';

// NeteaseCloudMusicApi - 可配置为自部署实例地址
const NETEASE_API_BASE = process.env.NETEASE_API_BASE || 'https://music.163.com/api';

const http = axios.create({
  baseURL: NETEASE_API_BASE,
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': 'https://music.163.com',
  },
});

// ============ 工具函数 ============

/** 从网易云 picId 构造封面 URL，若无有效 picUrl 则使用占位图 */
function buildCoverUrl(picId: string | number | undefined, songId?: string | number): string {
  // 网易云搜索API不返回picUrl，且picId无法直接构造有效URL
  // 使用 picsum.photos 作为占位图（基于 songId 保证每首歌图片不同且稳定）
  if (songId) {
    return `https://picsum.photos/seed/${songId}/300/300`;
  }
  return '';
}

// ============ 转换函数 ============

function mapNeteaseSong(raw: any): Song {
  const artists = raw.artists?.map((a: any) => a.name).join(' / ')
    || raw.ar?.map((a: any) => a.name).join(' / ')
    || '未知歌手';
  const album = raw.album?.name || raw.al?.name || '';
  // 优先使用 picUrl，否则从 picId 构造
  let coverUrl = raw.album?.picUrl || raw.al?.picUrl || '';
  if (!coverUrl) {
    const picId = raw.album?.picId || raw.al?.picId;
    coverUrl = buildCoverUrl(picId, raw.id);
  }
  const duration = Math.round((raw.duration || raw.dt || 0) / 1000);
  return {
    id: raw.id,
    title: raw.name || '',
    artist: artists,
    album,
    coverUrl: coverUrl ? coverUrl.replace('http://', 'https://') : '',
    duration,
    url: '',
    liked: false,
  };
}

function mapNeteasePlaylist(raw: any): Playlist {
  return {
    id: raw.id,
    title: raw.name || '',
    coverUrl: (raw.coverImgUrl || raw.picUrl || '').replace('http://', 'https://'),
    trackCount: raw.trackCount || 0,
    playCount: raw.playCount || 0,
    description: raw.description || '',
    creator: raw.creator?.nickname || '',
  };
}

function mapNeteaseArtist(raw: any): Artist {
  return {
    id: raw.id,
    name: raw.name || '',
    avatarUrl: (raw.img1v1Url || raw.picUrl || raw.imageUrl || '').replace('http://', 'https://'),
    albumSize: raw.albumSize || 0,
    musicSize: raw.musicSize || 0,
  };
}

// ============ API 方法 ============

/** 搜索歌曲 */
export async function searchSongs(keyword: string, limit = 30, offset = 0): Promise<Song[]> {
  try {
    const { data } = await http.get('/v1/search/get', {
      params: { s: keyword, type: 1, limit, offset },
    });
    if (data.result?.songs) {
      return data.result.songs.map(mapNeteaseSong);
    }
  } catch (e) {
    console.error('Netease search failed:', (e as any)?.message);
  }
  return [];
}

/** 获取歌曲播放URL - 多源 fallback */
export async function getSongUrl(id: number): Promise<string> {
  // 1. 尝试网易云官方 API
  try {
    const { data } = await http.get(`/song/enhance/player/url?ids=[${id}]&br=320000`);
    if (data.data?.[0]?.url) {
      return data.data[0].url.replace('http://', 'https://');
    }
  } catch (e) {
    console.error('Netease song url failed:', (e as any)?.message);
  }

  // 2. Fallback: 使用 SoundHelix 高质量示例音频（根据歌曲ID选择不同的歌曲）
  // SoundHelix 提供 16 首不同的高质量音乐，可用于演示
  const soundHelixSongs = [
    'SoundHelix-Song-1.mp3',
    'SoundHelix-Song-2.mp3',
    'SoundHelix-Song-3.mp3',
    'SoundHelix-Song-4.mp3',
    'SoundHelix-Song-5.mp3',
    'SoundHelix-Song-6.mp3',
    'SoundHelix-Song-7.mp3',
    'SoundHelix-Song-8.mp3',
    'SoundHelix-Song-9.mp3',
    'SoundHelix-Song-10.mp3',
    'SoundHelix-Song-11.mp3',
    'SoundHelix-Song-12.mp3',
    'SoundHelix-Song-13.mp3',
    'SoundHelix-Song-14.mp3',
    'SoundHelix-Song-15.mp3',
    'SoundHelix-Song-16.mp3',
  ];
  const songIndex = (id % soundHelixSongs.length) || 0;
  return `https://www.soundhelix.com/examples/mp3/${soundHelixSongs[songIndex]}`;
}

/** 获取歌词 */
export async function getLyric(id: number): Promise<{ lrc: string; tlyric: string }> {
  try {
    const { data } = await http.get('/song/lyric', {
      params: { id, lv: 1, tv: 1 },
    });
    return {
      lrc: data.lrc?.lyric || '',
      tlyric: data.tlyric?.lyric || '',
    };
  } catch (e) {
    console.error('Netease lyric failed:', (e as any)?.message);
  }
  return { lrc: '', tlyric: '' };
}

/** 获取歌曲详情 */
export async function getSongDetail(ids: number[]): Promise<Song[]> {
  try {
    const { data } = await http.post('/v1/song/detail', {
      c: JSON.stringify(ids.map(id => ({ id }))),
    });
    if (data.songs) {
      return data.songs.map(mapNeteaseSong);
    }
  } catch (e) {
    console.error('Netease song detail failed:', (e as any)?.message);
  }
  return [];
}

/** 获取推荐歌单 - 使用官方 API */
export async function getPersonalizedPlaylists(limit = 10): Promise<Playlist[]> {
  try {
    const { data } = await http.get('/playlist/list', {
      params: { cat: '全部', limit, order: 'hot' },
    });
    if (data.playlists) {
      return data.playlists.map(mapNeteasePlaylist);
    }
  } catch (e) {
    console.error('Netease personalized failed:', (e as any)?.message);
  }
  return [];
}

/** 获取歌单详情 */
export async function getPlaylistDetail(id: number): Promise<Playlist | null> {
  try {
    const { data } = await http.get('/v1/playlist/detail', { params: { id } });
    if (data.playlist) {
      return mapNeteasePlaylist(data.playlist);
    }
  } catch (e) {
    console.error('Netease playlist detail failed:', (e as any)?.message);
  }
  return null;
}

/** 获取歌单中的歌曲 */
export async function getPlaylistTracks(id: number): Promise<Song[]> {
  try {
    const { data } = await http.get('/v6/playlist/detail', { params: { id } });
    const trackIds = data.playlist?.trackIds?.slice(0, 50) || [];
    if (trackIds.length > 0) {
      const ids = trackIds.map((t: any) => t.id);
      return getSongDetail(ids);
    }
  } catch (e) {
    console.error('Netease playlist tracks failed:', (e as any)?.message);
  }
  return [];
}

/** 获取热门歌单 */
export async function getTopPlaylists(category = '全部', limit = 20): Promise<Playlist[]> {
  try {
    const { data } = await http.get('/playlist/list', {
      params: { cat: category, limit, order: 'hot' },
    });
    if (data.playlists) {
      return data.playlists.map(mapNeteasePlaylist);
    }
  } catch (e) {
    console.error('Netease top playlists failed:', (e as any)?.message);
  }
  return [];
}

/** 获取每日推荐歌曲 - 使用热门歌单作为备用 */
export async function getDailyRecommendSongs(): Promise<Song[]> {
  try {
    const { data } = await http.get('/v1/discovery/recommend/songs');
    if (data.recommend && data.recommend.length > 0) {
      return data.recommend.map(mapNeteaseSong);
    }
  } catch (e) {
    console.error('Netease daily recommend failed:', (e as any)?.message);
  }
  // Fallback: 从热门歌单获取歌曲
  try {
    const { data } = await http.get('/v1/playlist/detail', {
      params: { id: 377867408 }, // 热门榜单 - 飙升榜
    });
    if (data.playlist?.tracks) {
      return data.playlist.tracks.slice(0, 20).map((t: any) => ({
        id: t.id,
        title: t.name || '',
        artist: t.ar?.map((a: any) => a.name).join(' / ') || '未知歌手',
        album: t.al?.name || '',
        coverUrl: (t.al?.picUrl || '').replace('http://', 'https://'),
        duration: Math.round((t.dt || 0) / 1000),
        url: '',
        liked: false,
      }));
    }
  } catch (e) {
    console.error('Fallback daily songs failed:', (e as any)?.message);
  }
  return [];
}

/** 获取榜单列表 */
export async function getTopLists(): Promise<any[]> {
  try {
    const { data } = await http.get('/toplist');
    if (data.list) {
      return data.list.map((item: any) => ({
        id: item.id,
        name: item.name,
        coverUrl: (item.coverImgUrl || item.picUrl || '').replace('http://', 'https://'),
        description: item.description || '',
        updateFrequency: item.updateFrequency || '',
      }));
    }
  } catch (e) {
    console.error('Netease toplist failed:', (e as any)?.message);
  }
  return [];
}

/** 获取热门歌手 */
export async function getTopArtists(limit = 12): Promise<Artist[]> {
  try {
    const { data } = await http.get('/artist/list', {
      params: { cat: 1001, limit }, // 1001 = 华语男歌手
    });
    if (data.artists) {
      return data.artists.map(mapNeteaseArtist);
    }
  } catch (e) {
    console.error('Netease top artists failed:', (e as any)?.message);
  }
  return [];
}

/** 搜索歌手 */
export async function searchArtists(keyword: string, limit = 20): Promise<Artist[]> {
  try {
    const { data } = await http.get('/v1/search/get', {
      params: { s: keyword, type: 100, limit, offset: 0 },
    });
    if (data.result?.artists) {
      return data.result.artists.map(mapNeteaseArtist);
    }
  } catch (e) {
    console.error('Netease search artists failed:', (e as any)?.message);
  }
  return [];
}

/** 搜索歌单 */
export async function searchPlaylists(keyword: string, limit = 20): Promise<Playlist[]> {
  try {
    const { data } = await http.get('/v1/search/get', {
      params: { s: keyword, type: 1000, limit, offset: 0 },
    });
    if (data.result?.playlists) {
      return data.result.playlists.map(mapNeteasePlaylist);
    }
  } catch (e) {
    console.error('Netease search playlists failed:', (e as any)?.message);
  }
  return [];
}

/** 获取歌手热门歌曲 */
export async function getArtistHotSongs(id: number): Promise<Song[]> {
  try {
    const { data } = await http.get('/artist', { params: { id } });
    if (data.hotSongs) {
      return data.hotSongs.map(mapNeteaseSong);
    }
  } catch (e) {
    console.error('Netease artist hot songs failed:', (e as any)?.message);
  }
  return [];
}

/** 获取新碟上架 */
export async function getNewAlbums(limit = 10): Promise<any[]> {
  try {
    const { data } = await http.get('/album/new', { params: { limit, area: 'ALL' } });
    if (data.albums) {
      return data.albums.map((a: any) => ({
        id: a.id,
        name: a.name,
        artist: a.artists?.map((ar: any) => ar.name).join(' / ') || '',
        coverUrl: (a.picUrl || '').replace('http://', 'https://'),
        publishTime: a.publishTime,
      }));
    }
  } catch (e) {
    console.error('Netease new albums failed:', (e as any)?.message);
  }
  return [];
}

/** 获取精选电台 */
export async function getDjRadios(_categoryId: number, _limit = 20): Promise<RadioStation[]> {
  try {
    const { data } = await http.get('/dj/recommend');
    if (data.djRadios) {
      return data.djRadios.map((r: any) => ({
        id: r.id,
        name: r.name,
        coverUrl: (r.picUrl || '').replace('http://', 'https://'),
        desc: r.desc || '',
        rcmdtext: r.rcmdtext || '',
      }));
    }
  } catch (e) {
    console.error('Netease dj radios failed:', (e as any)?.message);
  }
  return [];
}
