import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { usePlayer } from '@/contexts/PlayerContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DISC_SIZE = SCREEN_WIDTH * 0.55;

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const {
    currentSong, isPlaying, progress, currentTime,
    playMode, togglePlay, nextSong, prevSong,
    toggleLike, setPlayMode, seekTo,
    lyrics, currentLyricIndex, isLoading,
  } = usePlayer();

  const [showLyrics, setShowLyrics] = useState(false);
  const rotation = useSharedValue(0);
  const lyricScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
    }
  }, [isPlaying]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (showLyrics && currentLyricIndex > 0) {
      // Scroll to current lyric
      const itemHeight = 44;
      lyricScrollRef.current?.scrollTo({
        y: Math.max(0, currentLyricIndex * itemHeight - 150),
        animated: true,
      });
    }
  }, [currentLyricIndex, showLyrics]);

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!currentSong) {
    return (
      <Screen backgroundColor="#FAF7F2">
        <View style={styles.empty}>
          <FontAwesome6 name="music" size={48} color="#C4B8A8" />
          <Text style={styles.emptyText}>暂无播放</Text>
        </View>
      </Screen>
    );
  }

  const playModeIcons = {
    sequential: 'arrows-alt-h' as const,
    shuffle: 'random' as const,
    repeat: 'redo-alt' as const,
  };

  const playModeLabels = {
    sequential: '列表循环',
    shuffle: '随机播放',
    repeat: '单曲循环',
  };

  const cyclePlayMode = () => {
    const modes: ('sequential' | 'shuffle' | 'repeat')[] = ['sequential', 'shuffle', 'repeat'];
    const currentIdx = modes.indexOf(playMode);
    setPlayMode(modes[(currentIdx + 1) % modes.length]);
  };

  return (
    <Screen backgroundColor="#FAF7F2" safeAreaEdges={['left', 'right']}>
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.topBtn}>
            <FontAwesome6 name="chevron-down" size={20} color="#3A3530" />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topTitle} numberOfLines={1}>{currentSong.album}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowLyrics(!showLyrics)} style={styles.topBtn}>
            <FontAwesome6 name={showLyrics ? 'disc' : 'align-left'} size={18} color="#3A3530" />
          </TouchableOpacity>
        </View>

        {showLyrics ? (
          /* Lyrics View */
          <View style={styles.lyricsContainer}>
            <View style={styles.lyricsHeader}>
              <Image source={{ uri: currentSong.coverUrl }} style={styles.lyricsCover} contentFit="cover" />
              <View style={styles.lyricsInfo}>
                <Text style={styles.lyricsSongTitle} numberOfLines={1}>{currentSong.title}</Text>
                <Text style={styles.lyricsArtist} numberOfLines={1}>{currentSong.artist}</Text>
              </View>
            </View>
            <ScrollView
              ref={lyricScrollRef}
              style={styles.lyricsScroll}
              contentContainerStyle={styles.lyricsContent}
              showsVerticalScrollIndicator={false}
            >
              {lyrics.length > 0 ? (
                lyrics.map((line, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.lyricLine,
                      idx === currentLyricIndex && styles.lyricLineActive,
                    ]}
                  >
                    {line.text}
                  </Text>
                ))
              ) : (
                <Text style={styles.noLyric}>暂无歌词</Text>
              )}
              <View style={{ height: 200 }} />
            </ScrollView>
          </View>
        ) : (
          /* Disc View */
          <View style={styles.discContainer}>
            {/* Decorative petals */}
            <View style={styles.petalDecor}>
              {[0, 60, 120, 180, 240, 300].map(angle => (
                <View
                  key={angle}
                  style={[styles.petal, { transform: [{ rotate: `${angle}deg` }, { translateY: -DISC_SIZE * 0.55 }] }]}
                />
              ))}
            </View>

            <Animated.View style={[styles.disc, discStyle]}>
              <Image
                source={{ uri: currentSong.coverUrl }}
                style={styles.discImage}
                contentFit="cover"
              />
              <View style={styles.discCenter}>
                <View style={styles.discHole} />
              </View>
            </Animated.View>

            {isLoading && (
              <Text style={styles.loadingText}>加载中...</Text>
            )}
          </View>
        )}

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{currentSong.title}</Text>
          <Text style={styles.songArtist}>{currentSong.artist}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onValueChange={seekTo}
            minimumTrackTintColor="#7D8B6E"
            maximumTrackTintColor="rgba(125,139,110,0.2)"
            thumbTintColor="#7D8B6E"
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(currentSong.duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={cyclePlayMode} style={styles.controlBtn}>
            <FontAwesome6 name={playModeIcons[playMode]} size={18} color="#8B7D6B" />
            <Text style={styles.modeLabel}>{playModeLabels[playMode]}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={prevSong} style={styles.controlBtn}>
            <FontAwesome6 name="backward-step" size={24} color="#3A3530" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
            <FontAwesome6
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextSong} style={styles.controlBtn}>
            <FontAwesome6 name="forward-step" size={24} color="#3A3530" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleLike} style={styles.controlBtn}>
            <FontAwesome6
              name="heart"
              size={20}
              color={currentSong.liked ? '#E8B4B8' : '#C4B8A8'}
              solid={currentSong.liked}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: '#8B7D6B' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, width: '100%', marginBottom: 10,
  },
  topBtn: { padding: 8 },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 14, fontWeight: '500', color: '#3A3530' },
  discContainer: {
    width: DISC_SIZE + 40, height: DISC_SIZE + 40,
    alignItems: 'center', justifyContent: 'center',
  },
  petalDecor: {
    position: 'absolute', width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    width: 12, height: 18,
    borderRadius: 6,
    backgroundColor: 'rgba(232,180,184,0.25)',
  },
  disc: {
    width: DISC_SIZE, height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(58,53,48,0.1)',
  },
  discImage: { width: '100%', height: '100%' },
  discCenter: {
    position: 'absolute', top: '50%', left: '50%',
    marginTop: -12, marginLeft: -12,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FAF7F2',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(58,53,48,0.08)',
  },
  discHole: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8E4DF' },
  loadingText: { fontSize: 12, color: '#8B7D6B', marginTop: 8 },
  lyricsContainer: {
    flex: 1, width: '100%', paddingHorizontal: 20,
  },
  lyricsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 16,
  },
  lyricsCover: { width: 48, height: 48, borderRadius: 12 },
  lyricsInfo: { flex: 1, gap: 2 },
  lyricsSongTitle: { fontSize: 16, fontWeight: '600', color: '#3A3530' },
  lyricsArtist: { fontSize: 13, color: '#8B7D6B' },
  lyricsScroll: { flex: 1 },
  lyricsContent: { paddingTop: 20 },
  lyricLine: {
    fontSize: 15, color: '#8B7D6B', lineHeight: 44,
    textAlign: 'center',
  },
  lyricLineActive: {
    color: '#7D8B6E', fontWeight: '600', fontSize: 16,
  },
  noLyric: { fontSize: 14, color: '#C4B8A8', textAlign: 'center', marginTop: 40 },
  songInfo: {
    alignItems: 'center', paddingHorizontal: 40,
    marginTop: 16, marginBottom: 8,
  },
  songTitle: { fontSize: 18, fontWeight: '600', color: '#3A3530', textAlign: 'center' },
  songArtist: { fontSize: 13, color: '#8B7D6B', marginTop: 4 },
  progressSection: { width: '100%', paddingHorizontal: 30 },
  slider: { height: 40 },
  timeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 8, marginTop: -8,
  },
  timeText: { fontSize: 11, color: '#8B7D6B' },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: 30,
    marginTop: 16, paddingBottom: 20,
  },
  controlBtn: { alignItems: 'center', gap: 2, padding: 8 },
  modeLabel: { fontSize: 9, color: '#8B7D6B' },
  playBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#7D8B6E',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
