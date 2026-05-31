import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SCORE_CATEGORIES, getPlayerTotal } from '../src/game-logic';
import { useGame } from '../src/game-context';

export default function GameScreen() {
  const {
    availableCategories,
    canRoll,
    canScore,
    currentPlayer,
    dice,
    gameOver,
    heldValues,
    lastAction,
    players,
    resetGame,
    rollCount,
    rollDice,
    scoreCurrentCategory,
    settings,
    toggleHeld,
    winner,
  } = useGame();
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const currentTotal = useMemo(
    () => (currentPlayer ? getPlayerTotal(currentPlayer) : 0),
    [currentPlayer]
  );

  const openDonePicker = () => {
    if (!canScore) {
      return;
    }

    setIsPickerVisible(true);
  };

  const handleCategoryPick = (categoryId) => {
    const didScore = scoreCurrentCategory(categoryId);
    if (didScore) {
      setIsPickerVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bockzee</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Current player</Text>
          <Text style={styles.playerName}>{currentPlayer?.name ?? 'No player'}</Text>
          <Text style={styles.helperText}>
            Roll {rollCount} of {settings.allowedRolls} • Total {currentTotal}
          </Text>
          {gameOver && winner ? (
            <Text style={styles.winnerText}>
              Winner: {winner.name} with {winner.total}
            </Text>
          ) : null}
          {lastAction ? <Text style={styles.lastAction}>{lastAction}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tap dice to hold them between rolls.</Text>
          <View style={styles.diceRow}>
            {dice.map((die) => (
              <Pressable
                key={die.id}
                onPress={() => toggleHeld(die.id)}
                style={[styles.die, die.held && styles.heldDie]}
              >
                <Text style={styles.dieValue}>{die.value}</Text>
                <Text style={styles.dieCaption}>{die.held ? 'Held' : 'Tap'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Held dice</Text>
          <Text style={styles.heldText}>{heldValues.length > 0 ? heldValues.join(', ') : 'None yet'}</Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={rollDice}
            style={[styles.primaryButton, !canRoll && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>Roll Dice</Text>
          </Pressable>
          <Pressable
            onPress={openDonePicker}
            style={[styles.secondaryButton, !canScore && styles.disabledButton]}
          >
            <Text style={styles.secondaryButtonText}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Scoreboard</Text>
          {players.map((player, index) => (
            <View key={player.id} style={styles.playerRow}>
              <Text style={[styles.playerRowText, index === 0 && currentPlayer?.id === player.id && styles.currentLabel]}>
                {player.name}
              </Text>
              <Text style={styles.playerRowText}>{getPlayerTotal(player)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current player sheet</Text>
          {SCORE_CATEGORIES.map((category) => {
            const score = currentPlayer?.scores?.[category.id];
            const preview = availableCategories.find((item) => item.id === category.id)?.previewScore;
            return (
              <View key={category.id} style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>{category.label}</Text>
                <Text style={styles.scoreValue}>
                  {score !== null && score !== undefined ? score : canScore && preview !== undefined ? `+${preview}` : '-'}
                </Text>
              </View>
            );
          })}
        </View>

        <Pressable onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Start Over</Text>
        </Pressable>
      </ScrollView>

      <Modal animationType="slide" transparent visible={isPickerVisible} onRequestClose={() => setIsPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose a score entry</Text>
            <ScrollView style={styles.modalList}>
              {availableCategories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPick(category.id)}
                  style={styles.modalOption}
                >
                  <View>
                    <Text style={styles.modalOptionLabel}>{category.label}</Text>
                    <Text style={styles.modalOptionHint}>{category.section} section</Text>
                  </View>
                  <Text style={styles.modalOptionScore}>{category.previewScore}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setIsPickerVisible(false)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    gap: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  playerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  helperText: {
    color: '#374151',
    fontSize: 15,
  },
  winnerText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 16,
  },
  lastAction: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  diceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  die: {
    width: '18%',
    minWidth: 58,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  heldDie: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  dieValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  dieCaption: {
    fontSize: 12,
    color: '#4b5563',
  },
  heldText: {
    fontSize: 18,
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0b57d0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0b57d0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#0b57d0',
    fontWeight: '700',
    fontSize: 16,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
  },
  playerRowText: {
    fontSize: 16,
    color: '#111827',
  },
  currentLabel: {
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  scoreLabel: {
    flex: 1,
    color: '#374151',
  },
  scoreValue: {
    width: 54,
    textAlign: 'right',
    fontWeight: '700',
    color: '#111827',
  },
  resetButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  resetButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalList: {
    maxHeight: 320,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
  },
  modalOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalOptionHint: {
    color: '#6b7280',
    marginTop: 2,
  },
  modalOptionScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b57d0',
  },
});
