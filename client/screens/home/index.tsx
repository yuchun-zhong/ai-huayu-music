import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { MiniPlayer } from '@/components/MiniPlayer';
import { usePlayer, type Song } from '@/contexts/PlayerContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { api } from '@/utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

// Separate component for playlist card to avoid hooks in loops
function PlaylistCard({ item, onPress }: { item: { id: number; title: string; coverUrl: string; playCount: number }; onPress: () => void }) {
  return (
    <TouchableOpacity style={playlistStyles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: item.coverUrl }} style={playlistStyles.cover} contentFit="cover" />
      <View style={playlistStyles.overlay}>
        <Text style={playlistStyles.title} numberOfLines={2}>{item.title}</Text>
        <View style={playlistStyles.playCount}>
          <FontAwesome6 name="play" size={8} color="rgba(255,255,255,0.9)" />
          <Text style={playlistStyles.playCountText}>{(item.playCount / 10000).toFixed(1)}万</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SongRow({ song, index, onPress, onToggleLike }: {
  song: Song; index: number; onPress: () => void; onToggleLike: () => void;
}) {
  return (
    <TouchableOpacity style={songStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={songStyles.rank}>{index + 1}</Text>
      <Image source={{ uri: song.coverUrl }} style={songStyles.cover} contentFit="cover" />
      <View style={songStyles.info}>
        <Text style={songStyles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={songStyles.artist} numberOfLines={1}>{song.artist} - {song.album}</Text>
      </View>
      <TouchableOpacity onPress={onToggleLike} style={songStyles.likeBtn}>
        <FontAwesome6
          name={song.liked ? 'heart' : 'heart'}
          size={16}
          color={song.liked ? '#E8B4B8' : '#C4B8A8'}
          solid={song.liked}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { playSong } = usePlayer();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [hotSongs, setHotSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);

  useEffect(() => {
    api.getRecommendPlaylists().then(res => setPlaylists(res.data || []));
    api.getHotSongs().then(res => setHotSongs(res.data || []));
    api.getRecentSongs().then(res => setRecentSongs(res.data || []));
  }, []);

  const handlePlaySong = useCallback((song: Song, queue: Song[]) => {
    playSong(song, queue);
  }, [playSong]);

  const handleToggleLike = useCallback(async (id: number) => {
    await api.toggleLikeSong(id);
    setHotSongs(prev => prev.map(s => s.id === id ? { ...s, liked: !s.liked } : s));
    setRecentSongs(prev => prev.map(s => s.id === id ? { ...s, liked: !s.liked } : s));
  }, []);

  const quickEntries = [
    { icon: 'sparkles' as const, label: '每日推荐', color: '#E8B4B8' },
    { icon: 'radio' as const, label: '私人FM', color: '#7D8B6E' },
    { icon: 'chart-line' as const, label: '热门榜单', color: '#C9A96E' },
  ];

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FAF7F2">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.appName}>花间乐章</Text>
          </View>
          <Text style={styles.subGreeting}>在花香中聆听美好</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/search')}
          activeOpacity={0.8}
        >
          <FontAwesome6 name="magnifying-glass" size={14} color="#8B7D6B" />
          <Text style={styles.searchPlaceholder}>搜索歌曲、歌手、歌单</Text>
        </TouchableOpacity>

        {/* Quick Entries */}
        <View style={styles.quickEntries}>
          {quickEntries.map((entry) => (
            <TouchableOpacity key={entry.label} style={styles.quickEntry}>
              <View style={[styles.quickIcon, { backgroundColor: `${entry.color}20` }]}>
                <FontAwesome6 name={entry.icon} size={20} color={entry.color} />
              </View>
              <Text style={styles.quickLabel}>{entry.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended Playlists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>为你推荐</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>更多</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={playlists}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playlistList}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PlaylistCard
                item={item}
                onPress={() => undefined}
              />
            )}
          />
        </View>

        {/* Recent Plays */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近播放</Text>
          </View>
          {recentSongs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              onPress={() => handlePlaySong(song, recentSongs)}
              onToggleLike={() => handleToggleLike(song.id)}
            />
          ))}
        </View>

        {/* Hot Songs Top 5 */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>热门榜单 Top5</Text>
          </View>
          {hotSongs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              onPress={() => handlePlaySong(song, hotSongs)}
              onToggleLike={() => handleToggleLike(song.id)}
            />
          ))}
        </View>
      </ScrollView>

      <MiniPlayer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  greetingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  greeting: { fontSize: 28, fontWeight: '700', color: '#3A3530' },
  appName: { fontSize: 14, color: '#7D8B6E', fontWeight: '500' },
  subGreeting: { fontSize: 14, color: '#8B7D6B', marginTop: 4 },
  searchBar: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchPlaceholder: { fontSize: 14, color: '#8B7D6B' },
  quickEntries: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  quickEntry: { alignItems: 'center', gap: 8 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 12, color: '#3A3530', fontWeight: '500' },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#3A3530' },
  sectionMore: { fontSize: 13, color: '#7D8B6E' },
  playlistList: { paddingHorizontal: 20, gap: 12 },
});

const playlistStyles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.35,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: { fontSize: 12, fontWeight: '600', color: '#fff' },
  playCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  playCountText: { fontSize: 10, color: 'rgba(255,255,255,0.9)' },
});

const songStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  rank: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    color: '#C9A96E',
    textAlign: 'center',
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginLeft: 8,
  },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '500', color: '#3A3530' },
  artist: { fontSize: 12, color: '#8B7D6B', marginTop: 3 },
  likeBtn: { padding: 8 },
});
