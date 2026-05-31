import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

const TOTAL_DICE = 5;
const MAX_ROLLS = 3;

function randomDieValue() {
  return Math.floor(Math.random() * 6) + 1;
}

function createDice() {
  return Array.from({ length: TOTAL_DICE }, (_, id) => ({
    id,
    value: randomDieValue(),
    held: false,
  }));
}

export default function App() {
  const [dice, setDice] = useState(createDice);
  const [rollCount, setRollCount] = useState(0);

  const handleRoll = () => {
    if (rollCount >= MAX_ROLLS) {
      return;
    }

    const nextRoll = rollCount + 1;

    setDice((currentDice) => {
      const rerolled = currentDice.map((die) =>
        die.held ? die : { ...die, value: randomDieValue() }
      );

      if (nextRoll === MAX_ROLLS) {
        return rerolled.map((die) => ({ ...die, held: false }));
      }

      return rerolled;
    });

    setRollCount(nextRoll === MAX_ROLLS ? 0 : nextRoll);
  };

  const toggleHeld = (dieId) => {
    setDice((currentDice) =>
      currentDice.map((die) =>
        die.id === dieId ? { ...die, held: !die.held } : die
      )
    );
  };

  const heldValues = dice
    .filter((die) => die.held)
    .map((die) => die.value)
    .sort((a, b) => a - b);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bockzee</Text>
      <Text style={styles.subtitle}>Roll {rollCount + 1} of {MAX_ROLLS}</Text>

      <View style={styles.diceRow}>
        {dice.map((die) => (
          <Pressable
            key={die.id}
            onPress={() => toggleHeld(die.id)}
            style={[styles.die, die.held && styles.heldDie]}
          >
            <Text style={styles.dieValue}>{die.value}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleRoll} style={styles.rollButton}>
        <Text style={styles.rollButtonText}>Roll Dice</Text>
      </Pressable>

      <Text style={styles.heldHeader}>Held dice (sorted):</Text>
      <Text style={styles.heldValues}>
        {heldValues.length > 0 ? heldValues.join(', ') : 'None'}
      </Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
  },
  diceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  die: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heldDie: {
    backgroundColor: '#d7f4d7',
    borderColor: '#2e7d32',
  },
  dieValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  rollButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#0b57d0',
  },
  rollButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  heldHeader: {
    fontSize: 16,
    fontWeight: '600',
  },
  heldValues: {
    fontSize: 16,
  },
});
