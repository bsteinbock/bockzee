import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useThemeColors } from '../theme';

export default function AppTabs() {
  const colors = useThemeColors();

  return (
    <NativeTabs
      backgroundColor={colors.card}
      indicatorColor={colors.background}
      labelStyle={{ selected: { color: colors.text }, default: { color: colors.textMuted } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Game</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="doc">
        <NativeTabs.Trigger.Label>Doc</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="questionmark.circle" md="help" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
