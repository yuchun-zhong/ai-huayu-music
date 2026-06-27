import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const themes = [
  {
    id: 'forest',
    name: '森系浪漫',
    desc: '米白暖底 · 鼠尾草绿 · 玫瑰粉',
    colors: ['#FAF7F2', '#7D8B6E', '#E8B4B8'],
    active: true,
  },
  {
    id: 'ocean',
    name: '海风轻语',
    desc: '雾蓝白 · 海盐蓝 · 珊瑚橘',
    colors: ['#F5F8FA', '#5B8FA8', '#E8956B'],
    active: false,
  },
  {
    id: 'sunset',
    name: '暮光花园',
    desc: '淡紫白 · 薰衣紫 · 蜜桃粉',
    colors: ['#F8F5FA', '#8B6FA8', '#F0B8A8'],
    active: false,
  },
  {
    id: 'dark',
    name: '暗夜森林',
    desc: '深墨绿 · 苔藓绿 · 月光银',
    colors: ['#1A1F1A', '#4A5D4A', '#C8D0C8'],
    active: false,
  },
];

const accentColors = [
  { id: 'sage', name: '鼠尾草绿', color: '#7D8B6E' },
  { id: 'rose', name: '玫瑰粉', color: '#E8B4B8' },
  { id: 'gold', name: '香槟金', color: '#C9A96E' },
  { id: 'lavender', name: '薰衣紫', color: '#8B6FA8' },
  { id: 'sky', name: '天空蓝', color: '#5B8FA8' },
  { id: 'coral', name: '珊瑚橘', color: '#E8956B' },
];

export default function SettingsScreen() {
  const router = useSafeRouter();
  const [selectedTheme, setSelectedTheme] = useState('forest');
  const [selectedAccent, setSelectedAccent] = useState('sage');
  const [autoPlay, setAutoPlay] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [showLyrics, setShowLyrics] = useState(true);

  return (
    <Screen backgroundColor="#FAF7F2">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome6 name="chevron-left" size={18} color="#3A3530" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>设置</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主题风格</Text>
          <Text style={styles.sectionDesc}>选择你喜欢的视觉风格</Text>
          <View style={styles.themeList}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  selectedTheme === theme.id && styles.themeCardActive,
                ]}
                onPress={() => setSelectedTheme(theme.id)}
              >
                <View style={styles.themePreview}>
                  {theme.colors.map((c, i) => (
                    <View key={i} style={[styles.themeDot, { backgroundColor: c }]} />
                  ))}
                </View>
                <View style={styles.themeInfo}>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  <Text style={styles.themeDesc}>{theme.desc}</Text>
                </View>
                {selectedTheme === theme.id && (
                  <View style={styles.themeCheck}>
                    <FontAwesome6 name="check" size={12} color="#7D8B6E" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accent Color Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>强调色</Text>
          <Text style={styles.sectionDesc}>自定义按钮和高亮颜色</Text>
          <View style={styles.accentGrid}>
            {accentColors.map((accent) => (
              <TouchableOpacity
                key={accent.id}
                style={styles.accentItem}
                onPress={() => setSelectedAccent(accent.id)}
              >
                <View
                  style={[
                    styles.accentDot,
                    { backgroundColor: accent.color },
                    selectedAccent === accent.id && styles.accentDotActive,
                  ]}
                />
                <Text style={styles.accentName}>{accent.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Playback Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放设置</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome6 name="wand-magic-sparkles" size={16} color="#7D8B6E" />
                <Text style={styles.settingLabel}>自动播放</Text>
              </View>
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{ false: '#E8E4DF', true: '#7D8B6E40' }}
                thumbColor={autoPlay ? '#7D8B6E' : '#C4B8A8'}
              />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome6 name="wifi" size={16} color="#7D8B6E" />
                <Text style={styles.settingLabel}>仅WiFi播放</Text>
              </View>
              <Switch
                value={wifiOnly}
                onValueChange={setWifiOnly}
                trackColor={{ false: '#E8E4DF', true: '#7D8B6E40' }}
                thumbColor={wifiOnly ? '#7D8B6E' : '#C4B8A8'}
              />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome6 name="compact-disc" size={16} color="#7D8B6E" />
                <Text style={styles.settingLabel}>高品质音质</Text>
              </View>
              <Switch
                value={highQuality}
                onValueChange={setHighQuality}
                trackColor={{ false: '#E8E4DF', true: '#7D8B6E40' }}
                thumbColor={highQuality ? '#7D8B6E' : '#C4B8A8'}
              />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <FontAwesome6 name="align-left" size={16} color="#7D8B6E" />
                <Text style={styles.settingLabel}>显示歌词</Text>
              </View>
              <Switch
                value={showLyrics}
                onValueChange={setShowLyrics}
                trackColor={{ false: '#E8E4DF', true: '#7D8B6E40' }}
                thumbColor={showLyrics ? '#7D8B6E' : '#C4B8A8'}
              />
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <View style={styles.settingCard}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>版本</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>应用名称</Text>
              <Text style={styles.aboutValue}>花语音乐</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#3A3530' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#3A3530', marginBottom: 4 },
  sectionDesc: { fontSize: 12, color: '#8B7D6B', marginBottom: 12 },
  themeList: { gap: 10 },
  themeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  themeCardActive: {
    borderColor: '#7D8B6E',
    backgroundColor: '#7D8B6E08',
  },
  themePreview: {
    flexDirection: 'row', gap: 4,
  },
  themeDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  themeInfo: { flex: 1, gap: 2 },
  themeName: { fontSize: 14, fontWeight: '500', color: '#3A3530' },
  themeDesc: { fontSize: 11, color: '#8B7D6B' },
  themeCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#7D8B6E18',
    alignItems: 'center', justifyContent: 'center',
  },
  accentGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
  },
  accentItem: {
    width: '30%', alignItems: 'center', gap: 6,
  },
  accentDot: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: 'transparent',
  },
  accentDotActive: {
    borderColor: '#3A3530',
    borderWidth: 2.5,
  },
  accentName: { fontSize: 11, color: '#8B7D6B' },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingLabel: { fontSize: 14, color: '#3A3530' },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E4DF',
    marginHorizontal: 16,
  },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  aboutLabel: { fontSize: 14, color: '#3A3530' },
  aboutValue: { fontSize: 14, color: '#8B7D6B' },
});
