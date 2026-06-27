import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { Provider } from '@/components/Provider';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
]);

export default function RootLayout() {
  return (
    <Provider>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          headerShown: false
        }}
      >
        <Stack.Screen name="(tabs)" options={{ title: "" }} />
        <Stack.Screen name="search" options={{
          title: "",
          animation: 'slide_from_right',
        }} />
        <Stack.Screen name="player" options={{
          title: "",
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }} />
        <Stack.Screen name="settings" options={{
          title: "",
          animation: 'slide_from_right',
        }} />
      </Stack>
      <Toast />
    </Provider>
  );
}
