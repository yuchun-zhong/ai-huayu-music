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
import { api } from '@/utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RadioScreen() {
  const insets = useSafeAreaInsets();
  const [playingRadio, setPlayingRadio] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  useEffect(() => {
    api.getPlayingRadio().then(res => setPlayingRadio(res.data));
    api.getRadioCategories().then(res => setCategories(res.data || []));
    api.getRadioStations().then(res => setStations(res.data || []));
  }, []);

  const filteredStations = activeCategory === '全部'
    ? stations
    : stations.filter(s => s.category === activeCategory);

  const allCategories = ['全部', ...categories];

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FAF7F2">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>广播</Text>
          <Text style={styles.subtitle}>发现好声音</Text>
        </View>

        {/* Now Playing Card */}
        {playingRadio && (
          <View style={styles.nowPlayingCard}>
            <Image
              source={{ uri: playingRadio.coverUrl }}
              style={styles.nowPlayingCover}
              contentFit="cover"
            />
            <View style={styles.nowPlayingOverlay}>
              <View style={styles.nowPlayingBadge}>
                <FontAwesome6 name="tower-broadcast" size={10} color="#fff" />
                <Text style={styles.nowPlayingBadgeText}>正在播放</Text>
              </View>
              <Text style={styles.nowPlayingName}>{playingRadio.name}</Text>
              <Text style={styles.nowPlayingDesc}>{playingRadio.description}</Text>
              <View style={styles.nowPlayingInfo}>
                <FontAwesome6 name="headphones" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.nowPlayingListeners}>
                  {playingRadio.listeners.toLocaleString()} 人在听
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Tags */}
        <View style={{ marginTop: 20 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {allCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTag, activeCategory === cat && styles.categoryTagActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Station Grid */}
        <View style={styles.grid}>
          {filteredStations.map(station => (
            <TouchableOpacity key={station.id} style={styles.stationCard} activeOpacity={0.8}>
              <Image
                source={{ uri: station.coverUrl }}
                style={styles.stationCover}
                contentFit="cover"
              />
              <View style={styles.stationInfo}>
                <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
                <Text style={styles.stationDesc} numberOfLines={1}>{station.description}</Text>
                <View style={styles.stationMeta}>
                  <FontAwesome6 name="headphones" size={10} color="#8B7D6B" />
                  <Text style={styles.stationListeners}>
                    {station.listeners.toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
  title: { fontSize: 28, fontWeight: '700', color: '#3A3530' },
  subtitle: { fontSize: 14, color: '#8B7D6B', marginTop: 4 },
  nowPlayingCard: {
    marginHorizontal: 20,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  nowPlayingCover: { width: '100%', height: '100%' },
  nowPlayingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  nowPlayingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(125,139,110,0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  nowPlayingBadgeText: { fontSize: 10, color: '#fff', fontWeight: '500' },
  nowPlayingName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  nowPlayingDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  nowPlayingInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  nowPlayingListeners: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  categoryList: { paddingHorizontal: 20, gap: 8 },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  categoryTagActive: { backgroundColor: '#7D8B6E' },
  categoryText: { fontSize: 13, color: '#3A3530', fontWeight: '500' },
  categoryTextActive: { color: '#fff' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginTop: 16,
    marginBottom: 100,
    gap: 8,
  },
  stationCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  stationCover: {
    width: '100%',
    aspectRatio: 1,
  },
  stationInfo: { padding: 10 },
  stationName: { fontSize: 14, fontWeight: '600', color: '#3A3530' },
  stationDesc: { fontSize: 11, color: '#8B7D6B', marginTop: 2 },
  stationMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  stationListeners: { fontSize: 10, color: '#8B7D6B' },
});
