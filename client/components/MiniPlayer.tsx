import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import { usePlayer } from '@/contexts/PlayerContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, progress } = usePlayer();
  const router = useSafeRouter();

  if (!currentSong) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={() => router.push('/player')}
    >
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: currentSong.coverUrl }}
          style={styles.cover}
          contentFit="cover"
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
        </View>
        <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); togglePlay(); }} style={styles.playBtn}>
          <FontAwesome6
            name={isPlaying ? 'pause' : 'play'}
            size={18}
            color="#7D8B6E"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(125,139,110,0.15)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7D8B6E',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  cover: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3530',
  },
  artist: {
    fontSize: 12,
    color: '#8B7D6B',
    marginTop: 2,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(125,139,110,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
