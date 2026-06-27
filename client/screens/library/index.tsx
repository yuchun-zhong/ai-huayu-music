import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { MiniPlayer } from '@/components/MiniPlayer';
import { usePlayer, type Song } from '@/contexts/PlayerContext';
import { api } from '@/utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { playSong } = usePlayer();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);

  useEffect(() => {
    api.getHighQualityPlaylists('全部', 6).then(res => setPlaylists(res.data || [])).catch(() => {});
    api.getDailySongs().then(res => setRecentSongs((res.data || []).slice(0, 6))).catch(() => {});
  }, []);

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FAF7F2">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>我的</Text>
          <Text style={styles.headerSub}>你的音乐花园</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard}>
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(232,180,184,0.15)' }]}>
              <FontAwesome6 name="heart" size={20} color="#E8B4B8" solid />
            </View>
            <Text style={styles.quickLabel}>我喜欢</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard}>
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(125,139,110,0.12)' }]}>
              <FontAwesome6 name="download" size={20} color="#7D8B6E" />
            </View>
            <Text style={styles.quickLabel}>本地下载</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard}>
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(201,169,110,0.12)' }]}>
              <FontAwesome6 name="clock-rotate-left" size={20} color="#C9A96E" />
            </View>
            <Text style={styles.quickLabel}>最近播放</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Songs */}
        {recentSongs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>最近播放</Text>
            </View>
            {recentSongs.map((song) => (
              <TouchableOpacity
                key={song.id}
                style={styles.songRow}
                onPress={() => playSong(song, recentSongs)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: song.coverUrl }} style={styles.songCover} contentFit="cover" />
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                  <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                </View>
                <FontAwesome6 name="play-circle" size={20} color="#7D8B6E" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Featured Playlists */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>精选歌单</Text>
          </View>
          <View style={styles.playlistGrid}>
            {playlists.map(pl => (
              <TouchableOpacity key={pl.id} style={styles.playlistCard} activeOpacity={0.8}>
                <Image source={{ uri: pl.coverUrl }} style={styles.playlistCover} contentFit="cover" />
                <View style={styles.playlistOverlay}>
                  <Text style={styles.playlistTitle} numberOfLines={2}>{pl.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <MiniPlayer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#3A3530' },
  headerSub: { fontSize: 13, color: '#8B7D6B', marginTop: 4 },
  quickRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 20, marginBottom: 24,
  },
  quickCard: { alignItems: 'center', gap: 8 },
  quickIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { fontSize: 12, color: '#5A5349', fontWeight: '500' },
  section: { marginBottom: 24 },
  sectionHeader: {
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#3A3530' },
  songRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  songCover: { width: 44, height: 44, borderRadius: 10 },
  songInfo: { flex: 1, gap: 2 },
  songTitle: { fontSize: 14, fontWeight: '500', color: '#3A3530' },
  songArtist: { fontSize: 12, color: '#8B7D6B' },
  playlistGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
  },
  playlistCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    borderRadius: 16, overflow: 'hidden',
  },
  playlistCover: { width: '100%', aspectRatio: 1 },
  playlistOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playlistTitle: { fontSize: 12, color: '#fff', fontWeight: '500', lineHeight: 16 },
});
