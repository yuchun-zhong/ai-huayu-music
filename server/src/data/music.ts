export interface Song {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  album: string;
  coverUrl: string;
  duration: number; // seconds
  liked: boolean;
}

export interface Playlist {
  id: number;
  title: string;
  coverUrl: string;
  description: string;
  songCount: number;
  playCount: number;
  songs: number[]; // song ids
}

export interface RadioStation {
  id: number;
  name: string;
  coverUrl: string;
  category: string;
  description: string;
  listeners: number;
  isPlaying: boolean;
}

export interface Artist {
  id: number;
  name: string;
  avatarUrl: string;
  songCount: number;
  albumCount: number;
}

export const songs: Song[] = [
  { id: 1, title: "春风十里", artist: "鹿先森乐队", artistId: 1, album: "春风十里", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop", duration: 268, liked: true },
  { id: 2, title: "花园里的第一支舞", artist: "陈粒", artistId: 2, album: "小梦大半", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop", duration: 245, liked: false },
  { id: 3, title: "日落大道", artist: "梁博", artistId: 3, album: "迷藏", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop", duration: 312, liked: true },
  { id: 4, title: "南山南北秋悲", artist: "马頔", artistId: 4, album: "孤岛", coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop", duration: 289, liked: false },
  { id: 5, title: "理想三旬", artist: "陈鸿宇", artistId: 5, album: "浓烟下的诗歌电台", coverUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop", duration: 256, liked: true },
  { id: 6, title: "奇妙能力歌", artist: "陈粒", artistId: 2, album: "如也", coverUrl: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop", duration: 234, liked: false },
  { id: 7, title: "董小姐", artist: "宋冬野", artistId: 6, album: "摩登天空7", coverUrl: "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=300&h=300&fit=crop", duration: 278, liked: true },
  { id: 8, title: "成都", artist: "赵雷", artistId: 7, album: "无法长大", coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop", duration: 325, liked: true },
  { id: 9, title: "起风了", artist: "买辣椒不用券", artistId: 8, album: "起风了", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop", duration: 298, liked: false },
  { id: 10, title: "夜空中最亮的星", artist: "逃跑计划", artistId: 9, album: "世界", coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop", duration: 242, liked: true },
  { id: 11, title: "平凡之路", artist: "朴树", artistId: 10, album: "猎户星座", coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop", duration: 280, liked: false },
  { id: 12, title: "小幸运", artist: "田馥甄", artistId: 11, album: "小幸运", coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop", duration: 215, liked: true },
  { id: 13, title: "告白气球", artist: "周杰伦", artistId: 12, album: "周杰伦的床边故事", coverUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop", duration: 198, liked: true },
  { id: 14, title: "光年之外", artist: "邓紫棋", artistId: 13, album: "光年之外", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop", duration: 236, liked: false },
  { id: 15, title: "漂洋过海来看你", artist: "刘明湘", artistId: 14, album: "我要你", coverUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop", duration: 267, liked: true },
];

export const playlists: Playlist[] = [
  { id: 1, title: "花园漫步", coverUrl: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=300&h=300&fit=crop", description: "在花香中聆听最温柔的歌", songCount: 24, playCount: 128456, songs: [1, 2, 5, 6, 9] },
  { id: 2, title: "午后阳光", coverUrl: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop", description: "温暖午后，一杯咖啡一首歌", songCount: 18, playCount: 95234, songs: [3, 7, 8, 11, 13] },
  { id: 3, title: "星空下的呢喃", coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop", description: "夜晚最适合听的温柔旋律", songCount: 32, playCount: 203891, songs: [4, 10, 12, 14, 15] },
  { id: 4, title: "春日私语", coverUrl: "https://images.unsplash.com/photo-1464233366260-0bf11b1c6bc6?w=300&h=300&fit=crop", description: "春天的风，带来新的旋律", songCount: 20, playCount: 87654, songs: [1, 3, 5, 7, 9] },
  { id: 5, title: "民谣时光机", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop", description: "那些年我们一起听的民谣", songCount: 45, playCount: 345678, songs: [1, 4, 7, 8, 11] },
  { id: 6, title: "治愈系轻音乐", coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop", description: "让心灵得到片刻安宁", songCount: 28, playCount: 156789, songs: [2, 6, 9, 12, 15] },
];

export const radioStations: RadioStation[] = [
  { id: 1, name: "花瓣轻语", coverUrl: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=300&h=300&fit=crop", category: "助眠", description: "伴你入眠的轻柔旋律", listeners: 12580, isPlaying: true },
  { id: 2, name: "森林电台", coverUrl: "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=300&h=300&fit=crop", category: "民谣", description: "来自森林深处的歌声", listeners: 8934, isPlaying: false },
  { id: 3, name: "故事盒子", coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop", category: "故事", description: "每首歌背后都有一个故事", listeners: 15672, isPlaying: false },
  { id: 4, name: "流行前线", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop", category: "流行", description: "最热门的流行音乐", listeners: 23456, isPlaying: false },
  { id: 5, name: "月光曲", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop", category: "助眠", description: "月光下的安眠曲", listeners: 9876, isPlaying: false },
  { id: 6, name: "独立音乐人", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop", category: "民谣", description: "发现独立音乐的美好", listeners: 6543, isPlaying: false },
  { id: 7, name: "深夜食堂", coverUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop", category: "故事", description: "深夜的温暖故事", listeners: 11234, isPlaying: false },
  { id: 8, name: "潮流速递", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop", category: "流行", description: "最新潮流音乐速递", listeners: 18765, isPlaying: false },
];

export const artists: Artist[] = [
  { id: 1, name: "鹿先森乐队", avatarUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop", songCount: 12, albumCount: 3 },
  { id: 2, name: "陈粒", avatarUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=150&h=150&fit=crop", songCount: 28, albumCount: 5 },
  { id: 3, name: "梁博", avatarUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop", songCount: 15, albumCount: 4 },
  { id: 4, name: "马頔", avatarUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=150&h=150&fit=crop", songCount: 18, albumCount: 3 },
  { id: 5, name: "陈鸿宇", avatarUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=150&h=150&fit=crop", songCount: 10, albumCount: 2 },
  { id: 6, name: "宋冬野", avatarUrl: "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=150&h=150&fit=crop", songCount: 22, albumCount: 4 },
  { id: 7, name: "赵雷", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop", songCount: 20, albumCount: 5 },
  { id: 8, name: "买辣椒不用券", avatarUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&h=150&fit=crop", songCount: 8, albumCount: 1 },
  { id: 9, name: "逃跑计划", avatarUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=150&h=150&fit=crop", songCount: 14, albumCount: 3 },
  { id: 10, name: "朴树", avatarUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&h=150&fit=crop", songCount: 25, albumCount: 6 },
];

export const hotSearchKeywords = [
  "春风十里", "成都", "告白气球", "起风了", "平凡之路",
  "夜空中最亮的星", "小幸运", "董小姐", "光年之外", "理想三旬"
];
