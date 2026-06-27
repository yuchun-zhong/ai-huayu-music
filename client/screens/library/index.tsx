import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { MiniPlayer } from '@/components/MiniPlayer';
import { type Song } from '@/contexts/PlayerContext';
import { api } from '@/utils/api';

function PlaylistItem({ item }: { item: { id: number; title: string; coverUrl: string; songCount: number } }) {
  return (
    <TouchableOpacity style={playlistStyles.item} activeOpacity={0.7}>
      <Image source={{ uri: item.coverUrl }} style={playlistStyles.cover} contentFit="cover" />
      <View style={playlistStyles.info}>
        <Text style={playlistStyles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={playlistStyles.count}>{item.songCount}首歌曲</Text>
      </View>
      <FontAwesome6 name="chevron-right" size={14} color="#C4B8A8" />
    </TouchableOpacity>
  );
}

function ArtistAvatar({ item }: { item: { id: number; name: string; avatarUrl: string } }) {
  return (
    <View style={artistStyles.container}>
      <Image source={{ uri: item.avatarUrl }} style={artistStyles.avatar} contentFit="cover" />
      <Text style={artistStyles.name} numberOfLines={1}>{item.name}</Text>
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [recentArtists, setRecentArtists] = useState<any[]>([]);

  useEffect(() => {
    api.getLikedSongs().then(res => setLikedSongs(res.data || []));
    api.getPlaylists().then(res => setPlaylists(res.data || []));
    api.getRecentArtists().then(res => setRecentArtists(res.data || []));
  }, []);

  const myPlaylists = [
    { id: 101, title: '我喜欢的音乐', coverUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=300&h=300&fit=crop', songCount: likedSongs.length },
    { id: 102, title: '下载的歌曲', coverUrl: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop', songCount: 12 },
    ...playlists.slice(0, 3),
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
          <Text style={styles.title}>资料库</Text>
        </View>

        {/* Like & Download Cards */}
        <View style={styles.topCards}>
          <TouchableOpacity style={[styles.topCard, { backgroundColor: 'rgba(232,180,184,0.15)' }]}>
            <View style={[styles.topCardIcon, { backgroundColor: 'rgba(232,180,184,0.3)' }]}>
              <FontAwesome6 name="heart" size={22} color="#E8B4B8" />
            </View>
            <Text style={styles.topCardTitle}>我喜欢</Text>
            <Text style={styles.topCardCount}>{likedSongs.length}首</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topCard, { backgroundColor: 'rgba(125,139,110,0.1)' }]}>
            <View style={[styles.topCardIcon, { backgroundColor: 'rgba(125,139,110,0.2)' }]}>
              <FontAwesome6 name="download" size={22} color="#7D8B6E" />
            </View>
            <Text style={styles.topCardTitle}>下载</Text>
            <Text style={styles.topCardCount}>12首</Text>
          </TouchableOpacity>
        </View>

        {/* My Playlists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>我的歌单</Text>
            <Text style={styles.sectionCount}>{myPlaylists.length}个</Text>
          </View>
          {myPlaylists.map(pl => (
            <PlaylistItem key={pl.id} item={pl} />
          ))}
        </View>

        {/* Recent Artists */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近播放的歌手</Text>
          </View>
          <FlatList
            data={recentArtists}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistList}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ArtistAvatar item={item} />}
          />
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
  title: { fontSize: 28, fontWeight: '700', color: '#3A3530' },
  topCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  topCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  topCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  topCardTitle: { fontSize: 15, fontWeight: '600', color: '#3A3530' },
  topCardCount: { fontSize: 12, color: '#8B7D6B', marginTop: 4 },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#3A3530' },
  sectionCount: { fontSize: 13, color: '#8B7D6B' },
  artistList: { paddingHorizontal: 20, gap: 16 },
});

const playlistStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cover: { width: 48, height: 48, borderRadius: 12 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '500', color: '#3A3530' },
  count: { fontSize: 12, color: '#8B7D6B', marginTop: 3 },
});

const artistStyles = StyleSheet.create({
  container: { alignItems: 'center', width: 64 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  name: { fontSize: 11, color: '#3A3530', marginTop: 6, textAlign: 'center' },
});
