export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number;
  url: string;
  liked: boolean;
}

export interface Playlist {
  id: number;
  title: string;
  coverUrl: string;
  trackCount: number;
  playCount: number;
  description: string;
  creator: string;
}

export interface Artist {
  id: number;
  name: string;
  avatarUrl: string;
  albumSize: number;
  musicSize: number;
}

export interface RadioStation {
  id: number;
  name: string;
  coverUrl: string;
  desc: string;
  rcmdtext: string;
}
