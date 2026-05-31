import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { GameProvider } from '../src/game-context';

export default function RootLayout() {
  return (
    <GameProvider>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0b57d0',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
          tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Game' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        <Tabs.Screen name="doc" options={{ title: 'Doc' }} />
      </Tabs>
    </GameProvider>
  );
}
