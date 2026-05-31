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

export default function SettingsScreen() {
  const { addPlayerSlot, applySettings, removePlayerSlot, settings } = useGame();
  const [playerNames, setPlayerNames] = useState(settings.playerNames);
  const [allowedRolls, setAllowedRolls] = useState(settings.allowedRolls);

  useEffect(() => {
    setPlayerNames(settings.playerNames);
    setAllowedRolls(settings.allowedRolls);
  }, [settings]);

  const updatePlayerName = (index, value) => {
    setPlayerNames((currentNames) =>
      currentNames.map((name, currentIndex) => (currentIndex === index ? value : name))
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Player names</Text>
          {playerNames.map((name, index) => (
            <View key={`player-${index}`} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Player {index + 1}</Text>
              <TextInput
                value={name}
                onChangeText={(value) => updatePlayerName(index, value)}
                placeholder={`Player ${index + 1}`}
                style={styles.input}
              />
            </View>
          ))}
          <View style={styles.buttonRow}>
            <Pressable
              disabled={playerNames.length <= MIN_PLAYERS}
              onPress={() => setPlayerNames((currentNames) => removePlayerSlot(currentNames))}
              style={[styles.smallButton, playerNames.length <= MIN_PLAYERS && styles.disabledButton]}
            >
              <Text style={styles.smallButtonText}>Remove</Text>
            </Pressable>
            <Pressable
              disabled={playerNames.length >= MAX_PLAYERS}
              onPress={() => setPlayerNames((currentNames) => addPlayerSlot(currentNames))}
              style={[styles.smallButton, playerNames.length >= MAX_PLAYERS && styles.disabledButton]}
            >
              <Text style={styles.smallButtonText}>Add Player</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Allowed rolls</Text>
          <Text style={styles.helperText}>Choose between {MIN_ALLOWED_ROLLS} and {MAX_ALLOWED_ROLLS} rolls per turn.</Text>
          <View style={styles.rollOptions}>
            {Array.from({ length: MAX_ALLOWED_ROLLS - MIN_ALLOWED_ROLLS + 1 }, (_, offset) => {
              const value = MIN_ALLOWED_ROLLS + offset;
              const isSelected = value === allowedRolls;
              return (
                <Pressable
                  key={value}
                  onPress={() => setAllowedRolls(value)}
                  style={[styles.rollButton, isSelected && styles.rollButtonSelected]}
                >
                  <Text style={[styles.rollButtonText, isSelected && styles.rollButtonTextSelected]}>{value}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => applySettings({ playerNames, allowedRolls })}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Save Settings</Text>
        </Pressable>

        <Text style={styles.note}>Saving settings resets the current game so the new lineup and roll limit take effect.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
    color: '#111827',
  },
  card: {
    backgroundColor: '#ffffff',
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
    color: '#111827',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#374151',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
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
    borderColor: '#0b57d0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#0b57d0',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  helperText: {
    color: '#4b5563',
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
    backgroundColor: '#e5e7eb',
  },
  rollButtonSelected: {
    backgroundColor: '#0b57d0',
  },
  rollButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  rollButtonTextSelected: {
    color: '#ffffff',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
  },
});
