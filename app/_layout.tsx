import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider } from '../src/game-context';
import { useStatusBarStyle, useThemeColors } from '../src/theme';

export default function RootLayout() {
  const colors = useThemeColors();
  const statusBarStyle = useStatusBarStyle();

  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style={statusBarStyle} />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              height: 64,
              paddingBottom: 8,
              paddingTop: 8,
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
            tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Game',
              tabBarIcon: ({ color, size }) => <Entypo name="home" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, size }) => <Ionicons name="settings-sharp" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="doc"
            options={{
              title: 'Doc',
              tabBarIcon: ({ color, size }) => <Feather name="help-circle" size={size} color={color} />,
            }}
          />
        </Tabs>
      </GameProvider>
    </SafeAreaProvider>
  );
}
