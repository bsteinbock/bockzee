import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider } from '../src/game-context';
import AppTabs from '../src/components/app-tabs';
import { useStatusBarStyle } from '../src/theme';

export default function RootLayout() {
  const statusBarStyle = useStatusBarStyle();

  useEffect(() => {
    const applyOtaUpdate = async () => {
      if (__DEV__ || !Updates.isEnabled) {
        return;
      }

      try {
        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable) {
          return;
        }

        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch (error) {
        // Keep app startup resilient if update checks fail.
        console.warn('Failed to apply OTA update:', error);
      }
    };

    void applyOtaUpdate();
  }, []);

  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style={statusBarStyle} />
        <AppTabs />
      </GameProvider>
    </SafeAreaProvider>
  );
}
