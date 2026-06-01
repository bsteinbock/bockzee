import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SCORE_CATEGORIES,
  UPPER_BONUS_THRESHOLD,
  type CategoryId,
  getPlayerTotal,
  getUpperBonus,
} from '../src/game-logic';
import { useGame } from '../src/game-context';
import { useThemeColors } from '../src/theme';

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
    scoringHint,
    scoreCurrentCategory,
    settings,
    toggleHeld,
    winner,
  } = useGame();
  const colors = useThemeColors();
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const currentTotal = useMemo(() => (currentPlayer ? getPlayerTotal(currentPlayer) : 0), [currentPlayer]);
  const upperBonus = useMemo(() => (currentPlayer ? getUpperBonus(currentPlayer) : 0), [currentPlayer]);
  const bockzeeBonus = useMemo(() => currentPlayer?.bockzeeBonus ?? 0, [currentPlayer]);
  const hasGameStarted = useMemo(
    () =>
      rollCount > 0 ||
      players.some((player) => SCORE_CATEGORIES.some((category) => player.scores[category.id] !== null)),
    [players, rollCount],
  );

  const openDonePicker = () => {
    if (!canScore) {
      return;
    }

    setIsPickerVisible(true);
  };

  const handleCategoryPick = (categoryId: CategoryId) => {
    const didScore = scoreCurrentCategory(categoryId);
    if (didScore) {
      setIsPickerVisible(false);
    }
  };

  const handleResetGame = () => {
    if (!gameOver && hasGameStarted) {
      Alert.alert('Restart game?', 'Your current progress will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restart', style: 'destructive', onPress: resetGame },
      ]);
      return;
    }

    resetGame();
  };

  const getDisplayScore = (categoryId: CategoryId): number | string => {
    const savedScore = currentPlayer?.scores?.[categoryId];
    if (savedScore !== null && savedScore !== undefined) {
      return savedScore;
    }

    const previewScore = availableCategories.find((item) => item.id === categoryId)?.previewScore;
    if (canScore && previewScore !== undefined) {
      return `+${previewScore}`;
    }

    return '-';
  };

  const themed = useThemedStyles(colors);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>BockZee</Text>
          <Image source={require('../assets/icon-basic.png')} style={styles.titleIcon} />
        </View>

        <View style={[styles.card, themed.card]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Current player</Text>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Roll {rollCount} of {settings.allowedRolls}
            </Text>
          </View>
          <Text style={[styles.playerName, { color: colors.text }]}>
            {currentPlayer?.name ?? 'No player'}
          </Text>

          {gameOver && winner ? (
            <Text style={[styles.winnerText, { color: colors.success }]}>
              Winner: {winner.name} with {winner.total}
            </Text>
          ) : null}
        </View>

        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {rollCount === 0 ? 'Tap Roll Dice to get started' : 'Tap dice to hold them.'}
          </Text>
          <View style={styles.diceRow}>
            {dice.map((die) => (
              <Pressable
                key={die.id}
                onPress={() => toggleHeld(die.id)}
                style={[
                  styles.die,
                  { backgroundColor: colors.dieBg, borderColor: colors.dieBorder },
                  die.held && { backgroundColor: colors.heldDieBg, borderColor: colors.heldDieBorder },
                ]}
              >
                <Text style={[styles.dieValue, { color: colors.text }]}>
                  {rollCount === 0 ? '?' : die.value}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            disabled={!canRoll}
            onPress={rollDice}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.buttonPrimaryBg },
              !canRoll && styles.disabledButton,
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.buttonPrimaryText }]}>Roll Dice</Text>
          </Pressable>
          <Pressable
            disabled={!canScore}
            onPress={openDonePicker}
            style={[
              styles.secondaryButton,
              { backgroundColor: colors.buttonSecondaryBg, borderColor: colors.buttonSecondaryBorder },
              !canScore && styles.disabledButton,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.buttonSecondaryText }]}>Done</Text>
          </Pressable>
        </View>

        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current player score sheet</Text>
          {SCORE_CATEGORIES.map((category) => {
            return (
              <View key={category.id}>
                <View style={[styles.scoreRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.scoreLabel, { color: colors.text }]}>{category.label}</Text>
                  <Text style={[styles.scoreValue, { color: colors.text }]}>
                    {getDisplayScore(category.id)}
                  </Text>
                </View>
                {category.id === 'sixes' ? (
                  <View style={[styles.scoreRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.scoreLabel, { color: colors.text }]}>
                      Bonus (if upper total {`>=`} {UPPER_BONUS_THRESHOLD})
                    </Text>
                    <Text style={[styles.scoreValue, { color: colors.text }]}>{upperBonus}</Text>
                  </View>
                ) : null}
                {category.id === 'bockzee' ? (
                  <View style={[styles.scoreRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.scoreLabel, { color: colors.text }]}>Bockzee Bonus (+100 each)</Text>
                    <Text style={[styles.scoreValue, { color: colors.text }]}>{bockzeeBonus}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Scoreboard</Text>
          {players.map((player) => (
            <View key={player.id} style={styles.playerRow}>
              <Text
                style={[
                  styles.playerRowText,
                  { color: colors.text },
                  currentPlayer?.id === player.id && { color: colors.accent, fontWeight: '700' },
                ]}
              >
                {player.name}
              </Text>
              <Text style={[styles.playerRowText, { color: colors.text }]}>{getPlayerTotal(player)}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleResetGame}
          style={[styles.resetButton, { backgroundColor: colors.resetBg }]}
        >
          <Text style={[styles.resetButtonText, { color: colors.resetText }]}>Start Over</Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isPickerVisible}
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsPickerVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose a score entry</Text>
            {scoringHint ? (
              <Text style={[styles.modalHint, { color: colors.accent }]}>{scoringHint}</Text>
            ) : null}
            <ScrollView style={styles.modalList}>
              {availableCategories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPick(category.id)}
                  style={[styles.modalOption, { borderBottomColor: colors.border }]}
                >
                  <View>
                    <Text style={[styles.modalOptionLabel, { color: colors.text }]}>{category.label}</Text>
                    <Text style={[styles.modalOptionHint, { color: colors.textMuted }]}>
                      {category.section} section
                    </Text>
                  </View>
                  <Text style={[styles.modalOptionScore, { color: colors.accent }]}>
                    {category.previewScore}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setIsPickerVisible(false)}
              style={[
                styles.secondaryButton,
                { backgroundColor: colors.buttonSecondaryBg, borderColor: colors.buttonSecondaryBorder },
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.buttonSecondaryText }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function useThemedStyles(colors: ReturnType<typeof useThemeColors>) {
  return useMemo(
    () => ({
      card: {
        backgroundColor: colors.card,
        shadowColor: colors.text,
      },
    }),
    [colors],
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
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    fontSize: 28,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 15,
  },
  winnerText: {
    fontWeight: '700',
    fontSize: 16,
  },
  lastAction: {
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  diceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  die: {
    minWidth: 56,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dieValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  dieCaption: {
    fontSize: 12,
  },
  heldText: {
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.45,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerRowText: {
    fontSize: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scoreLabel: {
    flex: 1,
  },
  scoreValue: {
    width: 64,
    textAlign: 'right',
    fontWeight: '700',
  },
  resetButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
    maxHeight: '72%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalHint: {
    fontSize: 14,
    lineHeight: 20,
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
    gap: 12,
  },
  modalOptionLabel: {
    fontWeight: '700',
  },
  modalOptionHint: {
    marginTop: 2,
  },
  modalOptionScore: {
    fontSize: 18,
    fontWeight: '700',
  },
});
