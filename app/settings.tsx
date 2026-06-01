import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  MAX_ALLOWED_ROLLS,
  MAX_PLAYERS,
  MIN_ALLOWED_ROLLS,
  MIN_PLAYERS,
} from '../src/game-logic';
import { useGame } from '../src/game-context';
import { useThemeColors } from '../src/theme';

export default function SettingsScreen() {
  const { addPlayerSlot, applySettings, removePlayerSlot, settings } = useGame();
  const colors = useThemeColors();
  const [playerNames, setPlayerNames] = useState(settings.playerNames);
  const [allowedRolls, setAllowedRolls] = useState(settings.allowedRolls);

  useEffect(() => {
    setPlayerNames(settings.playerNames);
    setAllowedRolls(settings.allowedRolls);
  }, [settings]);

  const updatePlayerName = (index: number, value: string) => {
    setPlayerNames((currentNames) =>
      currentNames.map((name, currentIndex) => (currentIndex === index ? value : name))
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Player names</Text>
          {playerNames.map((name, index) => (
            <View key={`player-${index}`} style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Player {index + 1}</Text>
              <TextInput
                value={name}
                onChangeText={(value) => updatePlayerName(index, value)}
                placeholder={`Player ${index + 1}`}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.inputText }]}
              />
            </View>
          ))}
          <View style={styles.buttonRow}>
            <Pressable
              disabled={playerNames.length <= MIN_PLAYERS}
              onPress={() => setPlayerNames((currentNames) => removePlayerSlot(currentNames))}
              style={[styles.smallButton, { borderColor: colors.accent }, playerNames.length <= MIN_PLAYERS && styles.disabledButton]}
            >
              <Text style={[styles.smallButtonText, { color: colors.accent }]}>Remove</Text>
            </Pressable>
            <Pressable
              disabled={playerNames.length >= MAX_PLAYERS}
              onPress={() => setPlayerNames((currentNames) => addPlayerSlot(currentNames))}
              style={[styles.smallButton, { borderColor: colors.accent }, playerNames.length >= MAX_PLAYERS && styles.disabledButton]}
            >
              <Text style={[styles.smallButtonText, { color: colors.accent }]}>Add Player</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Allowed rolls</Text>
          <Text style={[styles.helperText, { color: colors.textMuted }]}>Choose between {MIN_ALLOWED_ROLLS} and {MAX_ALLOWED_ROLLS} rolls per turn.</Text>
          <View style={styles.rollOptions}>
            {Array.from({ length: MAX_ALLOWED_ROLLS - MIN_ALLOWED_ROLLS + 1 }, (_, offset) => {
              const value = MIN_ALLOWED_ROLLS + offset;
              const isSelected = value === allowedRolls;
              return (
                <Pressable
                  key={value}
                  onPress={() => setAllowedRolls(value)}
                  style={[styles.rollButton, { backgroundColor: isSelected ? colors.buttonPrimaryBg : colors.rollButtonBg }]}
                >
                  <Text style={[styles.rollButtonText, { color: isSelected ? colors.buttonPrimaryText : colors.rollButtonText }]}>{value}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => applySettings({ playerNames, allowedRolls })}
          style={[styles.primaryButton, { backgroundColor: colors.resetBg }]}
        >
          <Text style={[styles.primaryButtonText, { color: colors.resetText }]}>Save Settings</Text>
        </Pressable>

        <Text style={[styles.note, { color: colors.textMuted }]}>Saving settings resets the current game so the new lineup and roll limit take effect.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  smallButtonText: {
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  helperText: {
    fontSize: 14,
  },
  rollOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  rollButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rollButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
