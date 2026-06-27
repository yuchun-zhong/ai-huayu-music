import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { usePlayer, Song } from '@/contexts/PlayerContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { api } from '@/utils/api';

interface Playlist {
  id: number;
  name: string;
  coverUrl: string;
  trackCount: number;
}

export default function ProfileScreen() {
  const router = useSafeRouter();
  const { playSong } = usePlayer();
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [likedPlaylists, setLikedPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const res = await api.getPersonalized(6);
      setLikedPlaylists(res.data.slice(0, 4));
    } catch {
      // ignore
    }
  };

  const menuItems = [
    { icon: 'heart', label: '我喜欢', color: '#E8B4B8', count: 0 },
    { icon: 'download', label: '下载管理', color: '#7D8B6E', count: 0 },
    { icon: 'clock-rotate-left', label: '最近播放', color: '#8B7D6B', count: recentSongs.length },
    { icon: 'list', label: '我的歌单', color: '#C9A96E', count: likedPlaylists.length },
  ];

  return (
    <Screen backgroundColor="#FAF7F2">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <FontAwesome6 name="user" size={32} color="#7D8B6E" />
            </View>
            <View style={styles.avatarRing} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>花语用户</Text>
            <Text style={styles.userDesc}>在音乐中遇见更好的自己</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/settings')}
          >
            <FontAwesome6 name="gear" size={20} color="#8B7D6B" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>关注</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>粉丝</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>动态</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}18` }]}>
                <FontAwesome6 name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.count > 0 && (
                <Text style={styles.menuCount}>{item.count}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* My Playlists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>我的歌单</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>查看全部</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.playlistGrid}>
            {likedPlaylists.slice(0, 2).map((pl) => (
              <TouchableOpacity key={pl.id} style={styles.playlistCard}>
                <Image source={{ uri: pl.coverUrl }} style={styles.playlistCover} contentFit="cover" />
                <View style={styles.playlistOverlay}>
                  <FontAwesome6 name="music" size={12} color="#fff" />
                  <Text style={styles.playlistCount}>{pl.trackCount}</Text>
                </View>
                <Text style={styles.playlistName} numberOfLines={2}>{pl.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Quick Access */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>快捷设置</Text>
          </View>
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => router.push('/settings')}
            >
              <View style={[styles.settingsIcon, { backgroundColor: '#E8B4B818' }]}>
                <FontAwesome6 name="palette" size={16} color="#E8B4B8" />
              </View>
              <Text style={styles.settingsLabel}>主题风格</Text>
              <FontAwesome6 name="chevron-right" size={12} color="#C4B8A8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem}>
              <View style={[styles.settingsIcon, { backgroundColor: '#7D8B6E18' }]}>
                <FontAwesome6 name="bell" size={16} color="#7D8B6E" />
              </View>
              <Text style={styles.settingsLabel}>消息通知</Text>
              <FontAwesome6 name="chevron-right" size={12} color="#C4B8A8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem}>
              <View style={[styles.settingsIcon, { backgroundColor: '#C9A96E18' }]}>
                <FontAwesome6 name="shield-halved" size={16} color="#C9A96E" />
              </View>
              <Text style={styles.settingsLabel}>隐私设置</Text>
              <FontAwesome6 name="chevron-right" size={12} color="#C4B8A8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem}>
              <View style={[styles.settingsIcon, { backgroundColor: '#8B7D6B18' }]}>
                <FontAwesome6 name="circle-info" size={16} color="#8B7D6B" />
              </View>
              <Text style={styles.settingsLabel}>关于花语音乐</Text>
              <FontAwesome6 name="chevron-right" size={12} color="#C4B8A8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 20,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#7D8B6E18',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#7D8B6E30',
  },
  avatarRing: {
    position: 'absolute', top: -3, left: -3,
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 1.5, borderColor: '#E8B4B840',
    borderStyle: 'dashed',
  },
  profileInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 20, fontWeight: '700', color: '#3A3530' },
  userDesc: { fontSize: 12, color: '#8B7D6B' },
  settingsBtn: { padding: 8 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20, paddingVertical: 16,
    marginBottom: 20,
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 18, fontWeight: '700', color: '#3A3530' },
  statLabel: { fontSize: 11, color: '#8B7D6B' },
  statDivider: { width: 1, height: 24, backgroundColor: '#E8E4DF' },
  menuGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 20, paddingVertical: 16,
    marginBottom: 20,
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    width: '25%', alignItems: 'center', gap: 6,
    paddingVertical: 8,
  },
  menuIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 11, color: '#3A3530' },
  menuCount: { fontSize: 10, color: '#8B7D6B' },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#3A3530' },
  sectionMore: { fontSize: 12, color: '#8B7D6B' },
  playlistGrid: { flexDirection: 'row', gap: 12 },
  playlistCard: { flex: 1, gap: 6 },
  playlistCover: {
    width: '100%', aspectRatio: 1,
    borderRadius: 14,
  },
  playlistOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8,
  },
  playlistCount: { fontSize: 10, color: '#fff' },
  playlistName: { fontSize: 12, color: '#3A3530', lineHeight: 16 },
  settingsList: {
    backgroundColor: '#fff',
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E4DF',
  },
  settingsIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: { flex: 1, fontSize: 14, color: '#3A3530' },
});
