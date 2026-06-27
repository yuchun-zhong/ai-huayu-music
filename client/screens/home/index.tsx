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

function PlaylistCard({ item, onPress }: { item: { id: number; title: string; coverUrl: string; playCount: number }; onPress: () => void }) {
  return (
    <TouchableOpacity style={playlistStyles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: item.coverUrl }} style={playlistStyles.cover} contentFit="cover" />
      <View style={playlistStyles.overlay}>
        <Text style={playlistStyles.title} numberOfLines={2}>{item.title}</Text>
        <View style={playlistStyles.playCount}>
          <FontAwesome6 name="play" size={8} color="rgba(255,255,255,0.9)" />
          <Text style={playlistStyles.playCountText}>{item.playCount > 10000 ? `${(item.playCount / 10000).toFixed(1)}万` : item.playCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SongRow({ song, index, onPress, isRank }: {
  song: Song; index: number; onPress: () => void; isRank?: boolean;
}) {
  const { playSong } = usePlayer();
  return (
    <TouchableOpacity style={songStyles.row} onPress={onPress} activeOpacity={0.7}>
      {isRank && <Text style={songStyles.rank}>{index + 1}</Text>}
      <Image source={{ uri: song.coverUrl }} style={songStyles.cover} contentFit="cover" />
      <View style={songStyles.info}>
        <Text style={songStyles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={songStyles.artist} numberOfLines={1}>{song.artist}</Text>
      </View>
      <TouchableOpacity onPress={() => playSong(song)} style={songStyles.playBtn}>
        <FontAwesome6 name="play-circle" size={22} color="#7D8B6E" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { playSong } = usePlayer();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [dailySongs, setDailySongs] = useState<Song[]>([]);
  const [topSongs, setTopSongs] = useState<Song[]>([]);

  useEffect(() => {
    api.getPersonalized(8).then(res => setPlaylists(res.data || [])).catch(() => {});
    api.getDailySongs().then(res => setDailySongs((res.data || []).slice(0, 5))).catch(() => {});
    api.getTopList().then(res => {
      const topList = res.data || [];
      if (topList.length > 0) {
        // Get tracks from the first chart (usually 飙升榜)
        const firstChart = topList[0];
        if (firstChart.id) {
          api.getPlaylistDetail(firstChart.id).then(detail => {
            setTopSongs((detail.data?.tracks || []).slice(0, 5));
          }).catch(() => {});
        }
      }
    }).catch(() => {});
  }, []);

  const handlePlaySong = useCallback((song: Song, queue: Song[]) => {
    playSong(song, queue);
  }, [playSong]);

  const quickEntries = [
    { icon: 'wand-magic-sparkles' as const, label: '每日推荐', color: '#E8B4B8' },
    { icon: 'compact-disc' as const, label: '私人FM', color: '#7D8B6E' },
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
            <Text style={styles.appName}>花语音乐</Text>
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
          </View>
          <FlatList
            data={playlists}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playlistList}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PlaylistCard item={item} onPress={() => {
                // Navigate to playlist detail (future feature)
              }} />
            )}
          />
        </View>

        {/* Daily Songs */}
        {dailySongs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>每日推荐</Text>
            </View>
            {dailySongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                onPress={() => handlePlaySong(song, dailySongs)}
                isRank
              />
            ))}
          </View>
        )}

        {/* Hot Songs Top 5 */}
        {topSongs.length > 0 && (
          <View style={[styles.section, { marginBottom: 100 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>热门榜单 Top5</Text>
            </View>
            {topSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                onPress={() => handlePlaySong(song, topSongs)}
                isRank
              />
            ))}
          </View>
        )}
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
  subGreeting: { fontSize: 13, color: '#8B7D6B', marginTop: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: 'rgba(125,139,110,0.08)',
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12,
  },
  searchPlaceholder: { fontSize: 13, color: '#8B7D6B' },
  quickEntries: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 20, marginBottom: 24,
  },
  quickEntry: { alignItems: 'center', gap: 6 },
  quickIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, color: '#5A5349', fontWeight: '500' },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#3A3530' },
  sectionMore: { fontSize: 12, color: '#7D8B6E' },
  playlistList: { paddingHorizontal: 20, gap: 12 },
});

const playlistStyles = StyleSheet.create({
  card: { width: (SCREEN_WIDTH - 80) / 3, borderRadius: 16, overflow: 'hidden' },
  cover: { width: '100%', aspectRatio: 1, borderRadius: 16 },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  title: { fontSize: 11, color: '#fff', fontWeight: '500', lineHeight: 14 },
  playCount: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  playCountText: { fontSize: 9, color: 'rgba(255,255,255,0.9)' },
});

const songStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  rank: { fontSize: 14, fontWeight: '700', color: '#E8B4B8', width: 20, textAlign: 'center' },
  cover: { width: 44, height: 44, borderRadius: 10 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '500', color: '#3A3530' },
  artist: { fontSize: 12, color: '#8B7D6B' },
  playBtn: { padding: 4 },
});
