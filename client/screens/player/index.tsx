import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
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
const DISC_SIZE = SCREEN_WIDTH * 0.65;

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
  } = usePlayer();

  const rotation = useSharedValue(0);

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

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!currentSong) {
    return (
      <Screen backgroundColor="#FAF7F2">
        <View style={fullStyles.empty}>
          <FontAwesome6 name="music" size={48} color="#C4B8A8" />
          <Text style={fullStyles.emptyText}>暂无播放</Text>
        </View>
      </Screen>
    );
  }

  const playModeIcons = {
    sequential: 'arrows-alt-h' as const,
    shuffle: 'random' as const,
    repeat: 'redo-alt' as const,
  };

  const cyclePlayMode = () => {
    const modes: ('sequential' | 'shuffle' | 'repeat')[] = ['sequential', 'shuffle', 'repeat'];
    const currentIdx = modes.indexOf(playMode);
    setPlayMode(modes[(currentIdx + 1) % modes.length]);
  };

  return (
    <Screen backgroundColor="#FAF7F2" safeAreaEdges={['left', 'right']}>
      <View style={[fullStyles.container, { paddingTop: insets.top + 10 }]}>
        {/* Top Bar */}
        <View style={fullStyles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={fullStyles.topBtn}>
            <FontAwesome6 name="chevron-down" size={20} color="#3A3530" />
          </TouchableOpacity>
          <View style={fullStyles.topCenter}>
            <Text style={fullStyles.topTitle} numberOfLines={1}>{currentSong.album}</Text>
          </View>
          <TouchableOpacity style={fullStyles.topBtn}>
            <FontAwesome6 name="ellipsis" size={18} color="#3A3530" />
          </TouchableOpacity>
        </View>

        {/* Vinyl Disc */}
        <View style={fullStyles.discContainer}>
          {/* Decorative petals */}
          <View style={fullStyles.petalDecor}>
            {[0, 60, 120, 180, 240, 300].map(angle => (
              <View
                key={angle}
                style={[fullStyles.petal, { transform: [{ rotate: `${angle}deg` }, { translateY: -DISC_SIZE * 0.55 }] }]}
              />
            ))}
          </View>

          <Animated.View style={[fullStyles.disc, discStyle]}>
            <Image
              source={{ uri: currentSong.coverUrl }}
              style={fullStyles.discImage}
              contentFit="cover"
            />
            {/* Center hole */}
            <View style={fullStyles.discCenter}>
              <View style={fullStyles.discHole} />
            </View>
          </Animated.View>
        </View>

        {/* Song Info */}
        <View style={fullStyles.songInfo}>
          <Text style={fullStyles.songTitle}>{currentSong.title}</Text>
          <Text style={fullStyles.songArtist}>{currentSong.artist}</Text>
        </View>

        {/* Progress Bar */}
        <View style={fullStyles.progressSection}>
          <Slider
            style={fullStyles.slider}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onValueChange={seekTo}
            minimumTrackTintColor="#7D8B6E"
            maximumTrackTintColor="rgba(125,139,110,0.2)"
            thumbTintColor="#7D8B6E"
          />
          <View style={fullStyles.timeRow}>
            <Text style={fullStyles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={fullStyles.timeText}>{formatTime(currentSong.duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={fullStyles.controls}>
          <TouchableOpacity onPress={cyclePlayMode} style={fullStyles.controlBtn}>
            <FontAwesome6 name={playModeIcons[playMode]} size={18} color="#8B7D6B" />
          </TouchableOpacity>

          <TouchableOpacity onPress={prevSong} style={fullStyles.controlBtn}>
            <FontAwesome6 name="backward-step" size={24} color="#3A3530" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} style={fullStyles.playBtn}>
            <FontAwesome6
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextSong} style={fullStyles.controlBtn}>
            <FontAwesome6 name="forward-step" size={24} color="#3A3530" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleLike} style={fullStyles.controlBtn}>
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

const fullStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: '#8B7D6B' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 20,
  },
  topBtn: { padding: 8 },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 14, fontWeight: '500', color: '#3A3530' },
  discContainer: {
    width: DISC_SIZE + 40,
    height: DISC_SIZE + 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  petalDecor: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(232,180,184,0.2)',
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: 'rgba(125,139,110,0.15)',
  },
  discImage: {
    width: '100%',
    height: '100%',
  },
  discCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discHole: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(125,139,110,0.3)',
  },
  songInfo: {
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 40,
  },
  songTitle: { fontSize: 22, fontWeight: '700', color: '#3A3530' },
  songArtist: { fontSize: 14, color: '#8B7D6B', marginTop: 6 },
  progressSection: {
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 24,
  },
  slider: { width: '100%', height: 40 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: { fontSize: 12, color: '#8B7D6B' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
  },
  controlBtn: { padding: 12 },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7D8B6E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
