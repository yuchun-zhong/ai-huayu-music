import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { api } from '@/utils/api';

export interface Song {
  id: number;
  title: string;
  artist: string;
  artistId?: number;
  album: string;
  albumId?: number;
  coverUrl: string;
  duration: number;
  liked: boolean;
}

export interface LyricLine {
  time: number; // seconds
  text: string;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  playMode: 'sequential' | 'shuffle' | 'repeat';
  queue: Song[];
  queueIndex: number;
  miniPlayerVisible: boolean;
  lyrics: LyricLine[];
  currentLyricIndex: number;
  songUrl: string | null;
  isLoading: boolean;
}

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  toggleLike: () => void;
  setPlayMode: (mode: 'sequential' | 'shuffle' | 'repeat') => void;
  seekTo: (progress: number) => void;
  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

function parseLyric(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    let match;
    const times: number[] = [];
    while ((match = timeRegex.exec(line)) !== null) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      times.push(min * 60 + sec + ms / 1000);
    }
    const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
    if (text && times.length > 0) {
      for (const t of times) {
        result.push({ time: t, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    playMode: 'sequential',
    queue: [],
    queueIndex: -1,
    miniPlayerVisible: false,
    lyrics: [],
    currentLyricIndex: 0,
    songUrl: null,
    isLoading: false,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Use ref for handleFinish to avoid circular dependency
  const handleFinishRef = useRef<() => void>(() => {});

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // Progress timer
  useEffect(() => {
    if (state.isPlaying && soundRef.current) {
      progressTimerRef.current = setInterval(async () => {
        try {
          const status = await soundRef.current?.getStatusAsync() as any;
          if (status?.isLoaded && status.isPlaying) {
            const currentTime = status.positionMillis / 1000;
            const duration = status.durationMillis / 1000;
            const progress = duration > 0 ? currentTime / duration : 0;

            // Find current lyric index
            const lyricIdx = state.lyrics.reduce((acc, line, idx) => {
              return line.time <= currentTime ? idx : acc;
            }, 0);

            setState(prev => ({
              ...prev,
              currentTime,
              progress,
              currentLyricIndex: lyricIdx,
            }));
          }
        } catch {
          // ignore
        }
      }, 500);
    }
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [state.isPlaying, state.lyrics.length]);

  // Handle song finish - defined first to be available for playAudio
  const handleFinish = useCallback(() => {
    setState(prev => {
      if (prev.playMode === 'repeat') {
        if (prev.currentSong && soundRef.current) {
          soundRef.current.setPositionAsync(0);
          soundRef.current.playAsync();
          return { ...prev, currentTime: 0, progress: 0, currentLyricIndex: 0 };
        }
        return prev;
      }

      let nextIndex: number;
      if (prev.playMode === 'shuffle') {
        nextIndex = Math.floor(Math.random() * prev.queue.length);
      } else {
        nextIndex = prev.queueIndex + 1;
      }

      if (nextIndex >= prev.queue.length) {
        nextIndex = 0;
      }

      const nextSongItem = prev.queue[nextIndex];
      if (nextSongItem) {
        return {
          ...prev,
          currentSong: nextSongItem,
          queueIndex: nextIndex,
          currentTime: 0,
          progress: 0,
          currentLyricIndex: 0,
        };
      }

      return { ...prev, isPlaying: false, progress: 0, currentTime: 0 };
    });
  }, []);

  // Keep ref in sync
  handleFinishRef.current = handleFinish;

  const playAudio = useCallback(async (url: string, song: Song) => {
    try {
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('[Player] Loading audio from:', url);

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              // Use ref to avoid circular dependency
              handleFinishRef.current();
            }
          } else if (status.isLoaded === false && status.error) {
            console.error('[Player] Audio load error:', status.error);
          }
        }
      );

      soundRef.current = sound;
      console.log('[Player] Audio loaded and playing');

      // Load lyrics
      let lyrics: LyricLine[] = [];
      try {
        const lyricRes = await api.getLyric(song.id);
        if (lyricRes?.data?.lrc) {
          lyrics = parseLyric(lyricRes.data.lrc);
        }
      } catch {
        // Lyrics not available
      }

      setState(prev => ({
        ...prev,
        isPlaying: true,
        songUrl: url,
        lyrics,
        currentLyricIndex: 0,
        isLoading: false,
      }));
    } catch (error) {
      console.error('[Player] Play audio error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadAndPlay = useCallback(async (song: Song) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get song URL from API
      const urlRes = await api.getSongUrl(song.id);
      const url = urlRes?.data?.url;

      if (url) {
        console.log('[Player] Got URL from API:', url);
        await playAudio(url, song);
      } else {
        console.warn('[Player] No URL from API, trying fallback');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('[Player] Load song error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [playAudio]);

  // Auto-load song when currentSong changes
  useEffect(() => {
    if (state.currentSong) {
      loadAndPlay(state.currentSong);
    }
  }, [state.currentSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const playSong = useCallback((song: Song, queue?: Song[]) => {
    const newQueue = queue || [song];
    const index = newQueue.findIndex(s => s.id === song.id);
    setState(prev => ({
      ...prev,
      currentSong: song,
      queue: newQueue,
      queueIndex: index >= 0 ? index : 0,
      miniPlayerVisible: true,
    }));
  }, []);

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      if (state.isPlaying) {
        await soundRef.current.pauseAsync();
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        await soundRef.current.playAsync();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('[Player] Toggle play error:', error);
    }
  }, [state.isPlaying]);

  const nextSong = useCallback(() => {
    setState(prev => {
      let nextIndex: number;
      if (prev.playMode === 'shuffle') {
        nextIndex = Math.floor(Math.random() * prev.queue.length);
      } else {
        nextIndex = (prev.queueIndex + 1) % prev.queue.length;
      }
      const next = prev.queue[nextIndex];
      if (next) {
        return { ...prev, currentSong: next, queueIndex: nextIndex };
      }
      return prev;
    });
  }, []);

  const prevSong = useCallback(async () => {
    // If more than 3 seconds in, restart current song
    if (state.currentTime > 3) {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
      }
      setState(prev => ({ ...prev, currentTime: 0, progress: 0, currentLyricIndex: 0 }));
      return;
    }

    setState(prev => {
      let prevIndex: number;
      if (prev.playMode === 'shuffle') {
        prevIndex = Math.floor(Math.random() * prev.queue.length);
      } else {
        prevIndex = prev.queueIndex - 1;
        if (prevIndex < 0) prevIndex = prev.queue.length - 1;
      }
      const prevSongItem = prev.queue[prevIndex];
      if (prevSongItem) {
        return { ...prev, currentSong: prevSongItem, queueIndex: prevIndex };
      }
      return prev;
    });
  }, [state.currentTime]);

  const toggleLike = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSong: prev.currentSong ? { ...prev.currentSong, liked: !prev.currentSong.liked } : null,
      queue: prev.queue.map(s =>
        s.id === prev.currentSong?.id ? { ...s, liked: !s.liked } : s
      ),
    }));
  }, []);

  const setPlayMode = useCallback((mode: 'sequential' | 'shuffle' | 'repeat') => {
    setState(prev => ({ ...prev, playMode: mode }));
  }, []);

  const seekTo = useCallback(async (progress: number) => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        const position = progress * status.durationMillis;
        await soundRef.current.setPositionAsync(position);
        setState(prev => ({ ...prev, progress, currentTime: position / 1000 }));
      }
    } catch (error) {
      console.error('[Player] Seek error:', error);
    }
  }, []);

  const showMiniPlayer = useCallback(() => {
    setState(prev => ({ ...prev, miniPlayerVisible: true }));
  }, []);

  const hideMiniPlayer = useCallback(() => {
    setState(prev => ({ ...prev, miniPlayerVisible: false }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        toggleLike,
        setPlayMode,
        seekTo,
        showMiniPlayer,
        hideMiniPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
