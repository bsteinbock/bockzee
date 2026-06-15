import { useMemo, useRef } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SCORE_CATEGORIES,
  UPPER_BONUS_THRESHOLD,
  type CategoryId,
  getPlayerTotal,
  getUpperBonus,
} from '../src/game-logic';
import { useGame } from '../src/game-context';
import { SCREEN_SCROLL_BOTTOM_GAP, SCREEN_SCROLL_TOP_GAP, useThemeColors } from '../src/theme';

export default function GameScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    availableCategories,
    canRoll,
    canScore,
    currentPlayer,
    dice,
    gameOver,
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
  const colorScheme = useColorScheme();
  const isDarkTheme = colorScheme === 'dark';
  const colors = useThemeColors();

  const upperBonus = useMemo(() => (currentPlayer ? getUpperBonus(currentPlayer) : 0), [currentPlayer]);
  const bockzeeBonus = useMemo(() => currentPlayer?.bockzeeBonus ?? 0, [currentPlayer]);
  const availableCategoryMap = useMemo(
    () => new Map(availableCategories.map((category) => [category.id, category])),
    [availableCategories],
  );
  const hasGameStarted = useMemo(
    () =>
      rollCount > 0 ||
      players.some((player) => SCORE_CATEGORIES.some((category) => player.scores[category.id] !== null)),
    [players, rollCount],
  );

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

  const handleUseCategory = (categoryId: CategoryId) => {
    scoreCurrentCategory(categoryId);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>BockZee</Text>
          <Image
            source={
              isDarkTheme ? require('../assets/icon-basic-dark.png') : require('../assets/icon-basic.png')
            }
            style={styles.titleIcon}
          />
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
        </View>

        <View style={[styles.card, themed.card]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current player score sheet</Text>
          {scoringHint ? (
            <Text style={[styles.scoringHint, { color: colors.accent }]}>{scoringHint}</Text>
          ) : null}
          {SCORE_CATEGORIES.map((category) => {
            const savedScore = currentPlayer?.scores?.[category.id];
            const availableCategory = availableCategoryMap.get(category.id);
            const canUseCategory = canScore && savedScore === null && Boolean(availableCategory);

            return (
              <View key={category.id}>
                <View style={[styles.scoreRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.scoreLabel, { color: colors.text }]}>{category.label}</Text>
                  <Text style={[styles.scoreValue, { color: colors.text }]}>
                    {getDisplayScore(category.id)}
                  </Text>
                  {canUseCategory ? (
                    <Pressable
                      onPress={() => handleUseCategory(category.id)}
                      style={[
                        styles.useButton,
                        {
                          backgroundColor: colors.buttonSecondaryBg,
                          borderColor: colors.buttonSecondaryBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.useButtonText, { color: colors.buttonSecondaryText }]}>Use</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.useButtonPlaceholder} />
                  )}
                </View>
                {category.id === 'sixes' ? (
                  <View style={[styles.scoreRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.scoreLabel, { color: colors.text }]}>
                      Bonus (if upper total {`>=`} {UPPER_BONUS_THRESHOLD})
                    </Text>
                    <Text style={[styles.scoreValue, { color: colors.text }]}>{upperBonus}</Text>
                    <View style={styles.useButtonPlaceholder} />
                  </View>
                ) : null}
                {category.id === 'bockzee' ? (
                  <View style={[styles.scoreRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.scoreLabel, { color: colors.text }]}>Bockzee Bonus (+100 each)</Text>
                    <Text style={[styles.scoreValue, { color: colors.text }]}>{bockzeeBonus}</Text>
                    <View style={styles.useButtonPlaceholder} />
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
    paddingTop: SCREEN_SCROLL_TOP_GAP,
    paddingBottom: 18,
    gap: 14,
  },
  scrollView: {
    marginBottom: SCREEN_SCROLL_BOTTOM_GAP,
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
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  scoreLabel: {
    flex: 1,
  },
  scoreValue: {
    width: 72,
    textAlign: 'right',
    fontWeight: '700',
  },
  useButton: {
    width: 78,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  useButtonPlaceholder: {
    width: 78,
    height: 34,
  },
  scoringHint: {
    fontSize: 14,
    lineHeight: 20,
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
});
