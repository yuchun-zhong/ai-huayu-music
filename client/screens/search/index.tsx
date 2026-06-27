import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { MiniPlayer } from '@/components/MiniPlayer';
import { usePlayer, type Song } from '@/contexts/PlayerContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { api } from '@/utils/api';

type TabType = 'songs' | 'artists' | 'playlists';

function SongItem({ song, index, onPress }: { song: Song; index: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={songStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: song.coverUrl }} style={songStyles.cover} contentFit="cover" />
      <View style={songStyles.info}>
        <Text style={songStyles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={songStyles.artist} numberOfLines={1}>{song.artist} · {song.album}</Text>
      </View>
      <FontAwesome6 name="play-circle" size={22} color="#7D8B6E" />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { playSong } = usePlayer();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [hotKeywords, setHotKeywords] = useState<{ keyword: string }[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load hot keywords on mount
  React.useEffect(() => {
    api.getHotKeywords().then(res => setHotKeywords(res.data || [])).catch(() => {});
  }, []);

  const doSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) return;
    setQuery(keyword.trim());
    setIsLoading(true);
    setHasSearched(true);

    // Add to history
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h !== keyword.trim());
      return [keyword.trim(), ...filtered].slice(0, 10);
    });

    try {
      // Search all types
      const [songsRes, artistsRes, playlistsRes] = await Promise.all([
        api.search(keyword, 'songs', 30),
        api.search(keyword, 'artists', 10),
        api.search(keyword, 'playlists', 10),
      ]);
      setSongs(songsRes.data?.songs || []);
      setArtists(artistsRes.data?.artists || []);
      setPlaylists(playlistsRes.data?.playlists || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePlaySong = useCallback((song: Song, queue: Song[]) => {
    playSong(song, queue);
  }, [playSong]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'songs', label: '歌曲' },
    { key: 'artists', label: '歌手' },
    { key: 'playlists', label: '歌单' },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={resultStyles.loading}>
          <Text style={resultStyles.loadingText}>搜索中...</Text>
        </View>
      );
    }

    if (activeTab === 'songs') {
      return (
        <View>
          {songs.map((song, idx) => (
            <SongItem
              key={song.id}
              song={song}
              index={idx}
              onPress={() => handlePlaySong(song, songs)}
            />
          ))}
          {songs.length === 0 && hasSearched && (
            <Text style={resultStyles.empty}>没有找到相关歌曲</Text>
          )}
        </View>
      );
    }

    if (activeTab === 'artists') {
      return (
        <View style={resultStyles.artistGrid}>
          {artists.map(a => (
            <View key={a.id} style={resultStyles.artistCard}>
              <Image source={{ uri: a.coverUrl }} style={resultStyles.artistCover} contentFit="cover" />
              <Text style={resultStyles.artistName} numberOfLines={1}>{a.name}</Text>
            </View>
          ))}
          {artists.length === 0 && hasSearched && (
            <Text style={resultStyles.empty}>没有找到相关歌手</Text>
          )}
        </View>
      );
    }

    if (activeTab === 'playlists') {
      return (
        <View>
          {playlists.map(pl => (
            <TouchableOpacity key={pl.id} style={resultStyles.playlistRow} activeOpacity={0.7}>
              <Image source={{ uri: pl.coverUrl }} style={resultStyles.playlistCover} contentFit="cover" />
              <View style={resultStyles.playlistInfo}>
                <Text style={resultStyles.playlistTitle} numberOfLines={1}>{pl.title}</Text>
                <Text style={resultStyles.playlistMeta}>{pl.trackCount}首 · {pl.playCount > 10000 ? `${(pl.playCount / 10000).toFixed(1)}万` : pl.playCount}次播放</Text>
              </View>
            </TouchableOpacity>
          ))}
          {playlists.length === 0 && hasSearched && (
            <Text style={resultStyles.empty}>没有找到相关歌单</Text>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FAF7F2">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Back Button and Search Bar */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <FontAwesome6 name="arrow-left" size={18} color="#4A4539" />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <FontAwesome6 name="magnifying-glass" size={14} color="#8B7D6B" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="搜索歌曲、歌手、歌单"
              placeholderTextColor="#8B7D6B"
              returnKeyType="search"
              onSubmitEditing={() => doSearch(query)}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setHasSearched(false); }}>
                <FontAwesome6 name="xmark" size={14} color="#8B7D6B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!hasSearched ? (
          <>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>搜索历史</Text>
                  <TouchableOpacity onPress={() => setSearchHistory([])}>
                    <FontAwesome6 name="trash" size={12} color="#8B7D6B" />
                  </TouchableOpacity>
                </View>
                <View style={styles.tagWrap}>
                  {searchHistory.map(h => (
                    <TouchableOpacity key={h} style={styles.tag} onPress={() => doSearch(h)}>
                      <Text style={styles.tagText}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Hot Keywords */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>热门搜索</Text>
              </View>
              <View style={styles.hotList}>
                {hotKeywords.map((item, idx) => {
                  const keyword = typeof item === 'string' ? item : (item.keyword || '');
                  return (
                    <TouchableOpacity
                      key={keyword || idx}
                      style={styles.hotRow}
                      onPress={() => doSearch(keyword)}
                    >
                      <Text style={[styles.hotRank, idx < 3 && styles.hotRankTop]}>{idx + 1}</Text>
                      <Text style={styles.hotKeyword}>{keyword}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Tabs */}
            <View style={styles.tabs}>
              {tabs.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                    {tab.key === 'songs' && songs.length > 0 ? ` (${songs.length})` : ''}
                    {tab.key === 'artists' && artists.length > 0 ? ` (${artists.length})` : ''}
                    {tab.key === 'playlists' && playlists.length > 0 ? ` (${playlists.length})` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Results */}
            <View style={{ marginBottom: 100 }}>
              {renderContent()}
            </View>
          </>
        )}
      </ScrollView>

      <MiniPlayer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, marginBottom: 12,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(125,139,110,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(125,139,110,0.08)',
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#3A3530' },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#3A3530' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: 'rgba(125,139,110,0.08)',
    borderRadius: 16, paddingVertical: 6, paddingHorizontal: 14,
  },
  tagText: { fontSize: 13, color: '#5A5349' },
  hotList: { gap: 4 },
  hotRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
  },
  hotRank: { fontSize: 14, fontWeight: '700', color: '#C4B8A8', width: 24, textAlign: 'center' },
  hotRankTop: { color: '#E8B4B8' },
  hotKeyword: { fontSize: 14, color: '#3A3530' },
  tabs: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 4, marginBottom: 16,
  },
  tab: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabActive: { backgroundColor: '#7D8B6E' },
  tabText: { fontSize: 13, color: '#5A5349', fontWeight: '500' },
  tabTextActive: { color: '#fff' },
});

const songStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  cover: { width: 44, height: 44, borderRadius: 10 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '500', color: '#3A3530' },
  artist: { fontSize: 12, color: '#8B7D6B' },
});

const resultStyles = StyleSheet.create({
  loading: { padding: 40, alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#8B7D6B' },
  empty: { fontSize: 14, color: '#8B7D6B', textAlign: 'center', padding: 40 },
  artistGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, gap: 16,
  },
  artistCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    alignItems: 'center', gap: 8,
  },
  artistCover: {
    width: '100%', aspectRatio: 1, borderRadius: 999,
  },
  artistName: { fontSize: 13, fontWeight: '500', color: '#3A3530' },
  playlistRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  playlistCover: { width: 52, height: 52, borderRadius: 12 },
  playlistInfo: { flex: 1, gap: 4 },
  playlistTitle: { fontSize: 14, fontWeight: '500', color: '#3A3530' },
  playlistMeta: { fontSize: 12, color: '#8B7D6B' },
});


