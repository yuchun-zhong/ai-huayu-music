import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface Song {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  album: string;
  coverUrl: string;
  duration: number;
  liked: boolean;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number; // 0-1
  currentTime: number; // seconds
  playMode: 'sequential' | 'shuffle' | 'repeat';
  queue: Song[];
  queueIndex: number;
  miniPlayerVisible: boolean;
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
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate playback progress
  useEffect(() => {
    if (state.isPlaying && state.currentSong) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.currentSong) return prev;
          const newTime = prev.currentTime + 1;
          const newProgress = newTime / prev.currentSong.duration;
          if (newProgress >= 1) {
            // Auto next song
            const nextIndex = prev.queueIndex + 1;
            if (nextIndex < prev.queue.length) {
              return {
                ...prev,
                currentSong: prev.queue[nextIndex],
                queueIndex: nextIndex,
                currentTime: 0,
                progress: 0,
              };
            }
            return { ...prev, isPlaying: false, progress: 0, currentTime: 0 };
          }
          return { ...prev, currentTime: newTime, progress: newProgress };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isPlaying, state.currentSong?.id]);

  const playSong = useCallback((song: Song, queue?: Song[]) => {
    const newQueue = queue || [song];
    const index = newQueue.findIndex(s => s.id === song.id);
    setState(prev => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      progress: 0,
      currentTime: 0,
      queue: newQueue,
      queueIndex: index >= 0 ? index : 0,
      miniPlayerVisible: true,
    }));
  }, []);

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const nextSong = useCallback(() => {
    setState(prev => {
      if (prev.playMode === 'shuffle') {
        const randomIndex = Math.floor(Math.random() * prev.queue.length);
        return {
          ...prev,
          currentSong: prev.queue[randomIndex],
          queueIndex: randomIndex,
          currentTime: 0,
          progress: 0,
        };
      }
      const nextIndex = prev.queueIndex + 1;
      if (nextIndex >= prev.queue.length) {
        return { ...prev, isPlaying: false, progress: 0, currentTime: 0 };
      }
      return {
        ...prev,
        currentSong: prev.queue[nextIndex],
        queueIndex: nextIndex,
        currentTime: 0,
        progress: 0,
      };
    });
  }, []);

  const prevSong = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.queueIndex - 1;
      if (prevIndex < 0) {
        return { ...prev, currentTime: 0, progress: 0 };
      }
      return {
        ...prev,
        currentSong: prev.queue[prevIndex],
        queueIndex: prevIndex,
        currentTime: 0,
        progress: 0,
      };
    });
  }, []);

  const toggleLike = useCallback(() => {
    setState(prev => {
      if (!prev.currentSong) return prev;
      return {
        ...prev,
        currentSong: { ...prev.currentSong, liked: !prev.currentSong.liked },
        queue: prev.queue.map(s =>
          s.id === prev.currentSong!.id ? { ...s, liked: !s.liked } : s
        ),
      };
    });
  }, []);

  const setPlayMode = useCallback((mode: 'sequential' | 'shuffle' | 'repeat') => {
    setState(prev => ({ ...prev, playMode: mode }));
  }, []);

  const seekTo = useCallback((progress: number) => {
    setState(prev => {
      if (!prev.currentSong) return prev;
      return {
        ...prev,
        progress,
        currentTime: Math.floor(progress * prev.currentSong.duration),
      };
    });
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

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
