import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(250,247,242,0.95)', 'rgba(232,180,184,0.12)', 'rgba(125,139,110,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: '#7D8B6E',
        tabBarInactiveTintColor: '#C4B8A8',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="house" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="radio"
        options={{
          title: '广播',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="radio" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: '资料库',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="compact-disc" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '搜索',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="magnifying-glass" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    height: 70,
    paddingTop: 8,
    ...(Platform.OS === 'web' ? { height: 'auto' as any } : {}),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
