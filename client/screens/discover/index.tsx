import React, { useState, useEffect } from 'react';
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
import { api } from '@/utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CATEGORIES = ['全部', '华语', '欧美', '日韩', '民谣', '电子', '摇滚', '说唱'];

function PlaylistGridItem({ item, onPress }: { item: any; onPress: () => void }) {
  return (
    <TouchableOpacity style={gridStyles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: item.coverUrl }} style={gridStyles.cover} contentFit="cover" />
      <View style={gridStyles.overlay}>
        <View style={gridStyles.playRow}>
          <FontAwesome6 name="play" size={9} color="rgba(255,255,255,0.9)" />
          <Text style={gridStyles.playText}>{item.playCount > 10000 ? `${(item.playCount / 10000).toFixed(1)}万` : item.playCount}</Text>
        </View>
      </View>
      <View style={gridStyles.info}>
        <Text style={gridStyles.title} numberOfLines={2}>{item.title}</Text>
        {item.creator ? <Text style={gridStyles.creator} numberOfLines={1}>by {item.creator}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function SongRow({ song, onPress }: { song: Song; onPress: () => void }) {
  return (
    <TouchableOpacity style={songRowStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: song.coverUrl }} style={songRowStyles.cover} contentFit="cover" />
      <View style={songRowStyles.info}>
        <Text style={songRowStyles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={songRowStyles.artist} numberOfLines={1}>{song.artist} · {song.album}</Text>
      </View>
      <FontAwesome6 name="play-circle" size={22} color="#7D8B6E" />
    </TouchableOpacity>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { playSong } = usePlayer();
  const [activeCat, setActiveCat] = useState('全部');
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [topLists, setTopLists] = useState<any[]>([]);
  const [topSongs, setTopSongs] = useState<Song[]>([]);

  useEffect(() => {
    api.getTopPlaylists(activeCat, 20).then(res => setPlaylists(res.data || [])).catch(() => {});
  }, [activeCat]);

  useEffect(() => {
    api.getTopList().then(res => {
      const lists = (res.data || []).slice(0, 4);
      setTopLists(lists);
      if (lists.length > 0 && lists[0].id) {
        api.getPlaylistDetail(lists[0].id).then(detail => {
          setTopSongs((detail.data?.tracks || []).slice(0, 8));
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const handlePlaySong = (song: Song, queue: Song[]) => {
    playSong(song, queue);
  };

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FAF7F2">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>发现</Text>
          <Text style={styles.headerSub}>探索音乐的无限可能</Text>
        </View>

        {/* Category Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catTag, activeCat === cat && styles.catTagActive]}
              onPress={() => setActiveCat(cat)}
            >
              <Text style={[styles.catText, activeCat === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Top Charts */}
        {topSongs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome6 name="trophy" size={16} color="#C9A96E" />
              <Text style={styles.sectionTitle}>热门榜单</Text>
            </View>
            {topSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                onPress={() => handlePlaySong(song, topSongs)}
              />
            ))}
          </View>
        )}

        {/* Playlists Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome6 name="music" size={16} color="#7D8B6E" />
            <Text style={styles.sectionTitle}>精选歌单</Text>
          </View>
          <View style={styles.grid}>
            {playlists.map(pl => (
              <PlaylistGridItem
                key={pl.id}
                item={pl}
                onPress={() => undefined}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <MiniPlayer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#3A3530' },
  headerSub: { fontSize: 13, color: '#8B7D6B', marginTop: 4 },
  catScroll: { marginBottom: 20, maxHeight: 40 },
  catContent: { paddingHorizontal: 20, gap: 8, flexDirection: 'row' },
  catTag: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(125,139,110,0.08)',
  },
  catTagActive: { backgroundColor: '#7D8B6E' },
  catText: { fontSize: 13, color: '#5A5349', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#3A3530' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
  },
});

const gridStyles = StyleSheet.create({
  card: {
    width: (SCREEN_WIDTH - 56) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cover: { width: '100%', aspectRatio: 1 },
  overlay: {
    position: 'absolute', top: 8, right: 8,
  },
  playRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3,
  },
  playText: { fontSize: 9, color: 'rgba(255,255,255,0.9)' },
  info: { padding: 10 },
  title: { fontSize: 12, fontWeight: '500', color: '#3A3530', lineHeight: 16 },
  creator: { fontSize: 10, color: '#8B7D6B', marginTop: 2 },
});

const songRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  cover: { width: 44, height: 44, borderRadius: 10 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '500', color: '#3A3530' },
  artist: { fontSize: 12, color: '#8B7D6B' },
});
