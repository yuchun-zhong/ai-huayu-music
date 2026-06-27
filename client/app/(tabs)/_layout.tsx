import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  let tabBarStyle = {
    backgroundColor: 'rgba(250,247,242,0.92)',
    borderTopWidth: 0,
    height: 60 + insets.bottom,
    paddingTop: 8,
  };

  if (Platform.OS === 'web') {
    tabBarStyle = {
      ...tabBarStyle,
      height: 'auto' as any,
    };
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#7D8B6E',
        tabBarInactiveTintColor: '#C4B8A8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: '发现',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="compass" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI助手',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="leaf" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user" size={18} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
