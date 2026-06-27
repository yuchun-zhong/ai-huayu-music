import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { MiniPlayer } from '@/components/MiniPlayer';
import { usePlayer, type Song } from '@/contexts/PlayerContext';
import { api } from '@/utils/api';

type SearchType = 'all' | 'song' | 'artist' | 'playlist';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { playSong } = usePlayer();
  const [query, setQuery] = useState('');
  const [hotKeywords, setHotKeywords] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(['民谣', '陈粒', '治愈系']);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    api.getHotKeywords().then(res => setHotKeywords(res.data || []));
  }, []);

  const handleSearch = useCallback(async (keyword?: string) => {
    const q = keyword || query;
    if (!q.trim()) return;
    if (keyword) setQuery(keyword);
    setIsSearching(true);
    try {
      const typeParam = searchType === 'all' ? undefined : searchType;
      const res = await api.search(q, typeParam);
      setSearchResults(res.data);
      // Add to history
      setSearchHistory(prev => {
        const filtered = prev.filter(k => k !== q);
        return [q, ...filtered].slice(0, 10);
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, searchType]);

  const searchTypes: { key: SearchType; label: string }[] = [
    { key: 'all', label: '综合' },
    { key: 'song', label: '歌曲' },
    { key: 'artist', label: '歌手' },
    { key: 'playlist', label: '歌单' },
  ];

  const renderSongResult = (song: Song, idx: number) => (
    <TouchableOpacity
      key={song.id}
      style={resultStyles.songRow}
      onPress={() => playSong(song, searchResults?.songs || [])}
      activeOpacity={0.7}
    >
      <Image source={{ uri: song.coverUrl }} style={resultStyles.songCover} contentFit="cover" />
      <View style={resultStyles.songInfo}>
        <Text style={resultStyles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={resultStyles.songArtist} numberOfLines={1}>{song.artist} - {song.album}</Text>
      </View>
    </TouchableOpacity>
  );

  const showResults = query.length > 0 && searchResults;

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FAF7F2">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.backBtn}>
            <FontAwesome6 name="arrow-left" size={18} color="#3A3530" />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <FontAwesome6 name="magnifying-glass" size={14} color="#8B7D6B" />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索歌曲、歌手、歌单"
              placeholderTextColor="#8B7D6B"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setSearchResults(null); }}>
                <FontAwesome6 name="xmark" size={14} color="#8B7D6B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!showResults ? (
          <>
            {/* Search History */}
            {searchHistory.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>搜索历史</Text>
                  <TouchableOpacity onPress={() => setSearchHistory([])}>
                    <FontAwesome6 name="trash" size={14} color="#8B7D6B" />
                  </TouchableOpacity>
                </View>
                <View style={styles.tagList}>
                  {searchHistory.map(kw => (
                    <TouchableOpacity
                      key={kw}
                      style={styles.tag}
                      onPress={() => handleSearch(kw)}
                    >
                      <Text style={styles.tagText}>{kw}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Hot Search */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>热门搜索</Text>
              </View>
              {hotKeywords.map((kw, idx) => (
                <TouchableOpacity
                  key={kw}
                  style={styles.hotRow}
                  onPress={() => handleSearch(kw)}
                >
                  <Text style={[styles.hotRank, idx < 3 && styles.hotRankTop]}>{idx + 1}</Text>
                  <Text style={styles.hotKeyword}>{kw}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Search Type Tabs */}
            <View style={styles.typeTabs}>
              {searchTypes.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeTab, searchType === t.key && styles.typeTabActive]}
                  onPress={() => { setSearchType(t.key); handleSearch(); }}
                >
                  <Text style={[styles.typeTabText, searchType === t.key && styles.typeTabTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Results */}
            <View style={{ marginTop: 12, marginBottom: 100 }}>
              {searchResults.songs && searchResults.songs.length > 0 && (
                <View>
                  {searchResults.songs.map((song: Song, idx: number) => renderSongResult(song, idx))}
                </View>
              )}
              {searchResults.artists && searchResults.artists.length > 0 && (
                <View style={{ paddingHorizontal: 20 }}>
                  {searchResults.artists.map((artist: any) => (
                    <View key={artist.id} style={resultStyles.artistRow}>
                      <Image source={{ uri: artist.avatarUrl }} style={resultStyles.artistAvatar} contentFit="cover" />
                      <Text style={resultStyles.artistName}>{artist.name}</Text>
                    </View>
                  ))}
                </View>
              )}
              {(!searchResults.songs?.length && !searchResults.artists?.length && !searchResults.playlists?.length) && (
                <View style={styles.empty}>
                  <FontAwesome6 name="music" size={40} color="#C4B8A8" />
                  <Text style={styles.emptyText}>没有找到相关内容</Text>
                </View>
              )}
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
  scrollContent: { paddingBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#3A3530', padding: 0 },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#3A3530' },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  tagText: { fontSize: 13, color: '#3A3530' },
  hotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  hotRank: { width: 24, fontSize: 15, fontWeight: '700', color: '#C4B8A8', textAlign: 'center' },
  hotRankTop: { color: '#C9A96E' },
  hotKeyword: { fontSize: 15, color: '#3A3530' },
  typeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 8,
  },
  typeTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  typeTabActive: { backgroundColor: '#7D8B6E' },
  typeTabText: { fontSize: 13, color: '#3A3530', fontWeight: '500' },
  typeTabTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#8B7D6B' },
});

const resultStyles = StyleSheet.create({
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  songCover: { width: 44, height: 44, borderRadius: 10 },
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: { fontSize: 15, fontWeight: '500', color: '#3A3530' },
  songArtist: { fontSize: 12, color: '#8B7D6B', marginTop: 3 },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  artistAvatar: { width: 48, height: 48, borderRadius: 24 },
  artistName: { fontSize: 15, fontWeight: '500', color: '#3A3530', marginLeft: 12 },
});
