import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const TOTAL_DICE = 5;
const MAX_ROLLS = 3;
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 6;

const SCORE_CATEGORIES = [
  { id: 'ones', label: 'Ones', section: 'Upper' },
  { id: 'twos', label: 'Twos', section: 'Upper' },
  { id: 'threes', label: 'Threes', section: 'Upper' },
  { id: 'fours', label: 'Fours', section: 'Upper' },
  { id: 'fives', label: 'Fives', section: 'Upper' },
  { id: 'sixes', label: 'Sixes', section: 'Upper' },
  { id: 'threeKind', label: 'Three of a kind', section: 'Lower' },
  { id: 'fourKind', label: 'Four of a kind', section: 'Lower' },
  { id: 'smallStraight', label: 'Small straight', section: 'Lower' },
  { id: 'largeStraight', label: 'Large straight', section: 'Lower' },
  { id: 'fullHouse', label: 'Full house', section: 'Lower' },
  { id: 'bockzee', label: 'BockZee (5 of a kind)', section: 'Lower' },
  { id: 'chance', label: 'Chance', section: 'Lower' },
] as const;

const CATEGORY_IDS: CategoryId[] = SCORE_CATEGORIES.map((category) => category.id);
const SCORE_SECTIONS = ['Upper', 'Lower'] as const;

type CategoryId = (typeof SCORE_CATEGORIES)[number]['id'];
type ScoreSection = (typeof SCORE_CATEGORIES)[number]['section'];
type Scores = Record<CategoryId, number | null>;
type Die = {
  id: number;
  value: number;
  held: boolean;
};
type Player = {
  id: number;
  name: string;
  scores: Scores;
};
type CategorySelection = {
  categoryId: CategoryId;
  score: number;
};

function randomDieValue(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function createDice(): Die[] {
  return Array.from({ length: TOTAL_DICE }, (_, id) => ({
    id,
    value: randomDieValue(),
    held: false,
  }));
}

function getInitialScores(): Scores {
  return CATEGORY_IDS.reduce<Scores>((scores, categoryId) => {
    scores[categoryId] = null;
    return scores;
  }, {} as Scores);
}

function createPlayers(playerCount: number): Player[] {
  return Array.from({ length: playerCount }, (_, index) => ({
    id: index,
    name: `Player ${index + 1}`,
    scores: getInitialScores(),
  }));
}

function getDiceValues(dice: Die[]): number[] {
  return dice.map((die) => die.value);
}

function getDiceSum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function getValueCounts(values: number[]): Record<number, number> {
  return values.reduce<Record<number, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function hasStraight(uniqueValues: number[], length: number): boolean {
  const sorted = [...new Set(uniqueValues)].sort((a, b) => a - b);
  let run = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] === sorted[i - 1] + 1) {
      run += 1;
      if (run >= length) {
        return true;
      }
    } else {
      run = 1;
    }
  }

  return false;
}

function scoreCategory(categoryId: CategoryId, values: number[]): number {
  const counts = getValueCounts(values);
  const countValues = Object.values(counts);
  const sum = getDiceSum(values);

  switch (categoryId) {
    case 'ones':
      return values.filter((value) => value === 1).length;
    case 'twos':
      return values.filter((value) => value === 2).length * 2;
    case 'threes':
      return values.filter((value) => value === 3).length * 3;
    case 'fours':
      return values.filter((value) => value === 4).length * 4;
    case 'fives':
      return values.filter((value) => value === 5).length * 5;
    case 'sixes':
      return values.filter((value) => value === 6).length * 6;
    case 'threeKind':
      return countValues.some((count) => count >= 3) ? sum : 0;
    case 'fourKind':
      return countValues.some((count) => count >= 4) ? sum : 0;
    case 'smallStraight':
      return hasStraight(values, 4) ? 30 : 0;
    case 'largeStraight':
      return hasStraight(values, 5) ? 40 : 0;
    case 'fullHouse':
      return countValues.includes(3) && countValues.includes(2) ? 25 : 0;
    case 'bockzee':
      return countValues.includes(5) ? 50 : 0;
    case 'chance':
      return sum;
    default:
      return 0;
  }
}

function getPlayerTotal(player: Player): number {
  return CATEGORY_IDS.reduce((total, categoryId) => {
    const score = player.scores[categoryId];
    return total + (score ?? 0);
  }, 0);
}

function isGameComplete(players: Player[]): boolean {
  return players.every((player) =>
    CATEGORY_IDS.every((categoryId) => player.scores[categoryId] !== null)
  );
}

function chooseAutoCategory(player: Player, values: number[]): CategorySelection | null {
  const openCategories = SCORE_CATEGORIES.filter(
    (category) => player.scores[category.id] === null
  );

  if (openCategories.length === 0) {
    return null;
  }

  return openCategories.reduce<CategorySelection | null>((best, category) => {
    const candidateScore = scoreCategory(category.id, values);

    if (!best || candidateScore > best.score) {
      return { categoryId: category.id, score: candidateScore };
    }

    return best;
  }, null);
}

export default function App() {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>(() => createPlayers(2));
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState<Die[]>(createDice);
  const [rollCount, setRollCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const currentPlayer = players[currentPlayerIndex];

  if (!currentPlayer) {
    return null;
  }

  const diceValues = getDiceValues(dice);

  const heldValues = dice
    .filter((die) => die.held)
    .map((die) => die.value)
    .sort((a, b) => a - b);

  const finishTurn = (updatedPlayers: Player[], actionMessage = '') => {
    setPlayers(updatedPlayers);
    setLastAction(actionMessage);

    if (isGameComplete(updatedPlayers)) {
      setGameOver(true);
      return;
    }

    setCurrentPlayerIndex((currentPlayerIndex + 1) % updatedPlayers.length);
    setRollCount(0);
    setDice(createDice());
  };

  const postScore = (
    categoryId: CategoryId,
    source: 'manual' | 'auto' = 'manual',
    sourceValues: number[] = diceValues
  ) => {
    if (!gameStarted || gameOver) {
      return;
    }

    if (currentPlayer.scores[categoryId] !== null) {
      return;
    }

    const score = scoreCategory(categoryId, sourceValues);
    const updatedPlayers = players.map<Player>((player, index) => {
      if (index !== currentPlayerIndex) {
        return player;
      }

      const scores: Scores = {
        ...player.scores,
        [categoryId]: score,
      };

      return {
        ...player,
        scores,
      };
    });

    const category = SCORE_CATEGORIES.find((item) => item.id === categoryId);
    const actionSource = source === 'auto' ? 'Auto-scored' : 'Scored';
    finishTurn(
      updatedPlayers,
      `${actionSource} ${currentPlayer.name}: ${category?.label} = ${score}`
    );
  };

  const autoScoreAndAdvance = (finalDiceValues: number[]) => {
    const selection = chooseAutoCategory(currentPlayer, finalDiceValues);

    if (!selection) {
      setGameOver(true);
      setLastAction(`${currentPlayer.name} has no open categories left.`);
      return;
    }

    postScore(selection.categoryId, 'auto', finalDiceValues);
  };

  const handleRoll = () => {
    if (!gameStarted || gameOver || rollCount >= MAX_ROLLS) {
      return;
    }

    const nextRoll = rollCount + 1;
    const rerolledDice: Die[] = dice.map((die) =>
      die.held ? die : { ...die, value: randomDieValue() }
    );

    if (nextRoll === MAX_ROLLS) {
      const clearedDice: Die[] = rerolledDice.map((die) => ({ ...die, held: false }));
      setDice(clearedDice);
      setRollCount(nextRoll);
      autoScoreAndAdvance(getDiceValues(clearedDice));
      return;
    }

    setDice(rerolledDice);
    setRollCount(nextRoll);
    setLastAction('');
  };

  const toggleHeld = (dieId: number) => {
    if (!gameStarted || gameOver) {
      return;
    }

    setDice((currentDice) =>
      currentDice.map((die) =>
        die.id === dieId ? { ...die, held: !die.held } : die
      )
    );
  };

  const updatePlayerCount = (direction: 'increase' | 'decrease') => {
    if (gameStarted) {
      return;
    }

    setPlayerCount((count) => {
      if (direction === 'increase') {
        return Math.min(MAX_PLAYERS, count + 1);
      }

      return Math.max(MIN_PLAYERS, count - 1);
    });
  };

  const startGame = () => {
    const gamePlayers = createPlayers(playerCount);
    setPlayers(gamePlayers);
    setCurrentPlayerIndex(0);
    setRollCount(0);
    setDice(createDice());
    setGameOver(false);
    setLastAction('');
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setCurrentPlayerIndex(0);
    setRollCount(0);
    setDice(createDice());
    setLastAction('');
  };

  const winner = gameOver
    ? players.reduce<{ name: string; total: number } | null>((best, player) => {
        const total = getPlayerTotal(player);

        if (!best || total > best.total) {
          return { name: player.name, total };
        }

        return best;
      }, null)
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bockzee</Text>

      {!gameStarted ? (
        <View style={styles.setupCard}>
          <Text style={styles.setupHeader}>Set up players</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepperButton}
              onPress={() => updatePlayerCount('decrease')}
            >
              <Text style={styles.stepperText}>-</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{playerCount} players</Text>
            <Pressable
              style={styles.stepperButton}
              onPress={() => updatePlayerCount('increase')}
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
          <Pressable style={styles.primaryButton} onPress={startGame}>
            <Text style={styles.primaryButtonText}>Start Game</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Current player: {currentPlayer.name} • Rolls left: {MAX_ROLLS - rollCount}
          </Text>

          {gameOver && winner ? (
            <Text style={styles.winnerText}>
              Game complete! Winner: {winner.name} ({winner.total})
            </Text>
          ) : null}

          {lastAction ? <Text style={styles.lastAction}>{lastAction}</Text> : null}

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

          <Pressable onPress={handleRoll} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Roll Dice</Text>
          </Pressable>

          <Text style={styles.heldHeader}>Held dice (sorted):</Text>
          <Text style={styles.heldValues}>
            {heldValues.length > 0 ? heldValues.join(', ') : 'None'}
          </Text>

          <ScrollView
            style={styles.scoreSheet}
            contentContainerStyle={styles.scoreSheetContent}
          >
            <Text style={styles.sheetTitle}>Score sheet</Text>
            {SCORE_SECTIONS.map((sectionName) => (
              <View key={sectionName} style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>{sectionName} section</Text>
                {SCORE_CATEGORIES.filter(
                  (item) => item.section === (sectionName as ScoreSection)
                ).map((category) => (
                  <View key={category.id} style={styles.scoreRow}>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                    <View style={styles.scoreCells}>
                      {players.map((player, index) => {
                        const score = player.scores[category.id];
                        const isCurrent = index === currentPlayerIndex;
                        const canScore = !gameOver && isCurrent && score === null;
                        const potentialScore = scoreCategory(category.id, diceValues);

                        return (
                          <Pressable
                            key={`${category.id}-${player.id}`}
                            style={[
                              styles.scoreCell,
                              isCurrent && styles.currentPlayerCell,
                              canScore && styles.scorableCell,
                            ]}
                            onPress={() => {
                              if (canScore) {
                                postScore(category.id);
                              }
                            }}
                          >
                            <Text style={styles.scoreCellText}>
                              {score !== null
                                ? score
                                : canScore
                                  ? `+${potentialScore}`
                                  : '-'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.totalBlock}>
              <Text style={styles.sectionHeader}>Totals</Text>
              <View style={styles.scoreCells}>
                {players.map((player) => (
                  <View key={`total-${player.id}`} style={styles.scoreCell}>
                    <Text style={styles.scoreCellText}>{getPlayerTotal(player)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.playerRow}>
                {players.map((player) => player.name).join(' • ')}
              </Text>
            </View>
          </ScrollView>

          <Pressable style={styles.secondaryButton} onPress={resetGame}>
            <Text style={styles.secondaryButtonText}>Reset Setup</Text>
          </Pressable>
        </>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 12,
    paddingTop: 44,
    paddingBottom: 20,
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  setupCard: {
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 14,
  },
  setupHeader: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  stepperButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0b57d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  winnerText: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#1b5e20',
  },
  lastAction: {
    textAlign: 'center',
    color: '#444',
  },
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  die: {
    width: 50,
    height: 50,
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
  primaryButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#0b57d0',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0b57d0',
  },
  secondaryButtonText: {
    color: '#0b57d0',
    fontWeight: '600',
  },
  heldHeader: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  heldValues: {
    textAlign: 'center',
    fontSize: 16,
  },
  scoreSheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scoreSheetContent: {
    padding: 12,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
  },
  scoreRow: {
    gap: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreCells: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scoreCell: {
    minWidth: 46,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#aaa',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  currentPlayerCell: {
    borderColor: '#0b57d0',
  },
  scorableCell: {
    backgroundColor: '#e8f0ff',
  },
  scoreCellText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalBlock: {
    gap: 8,
    marginBottom: 4,
  },
  playerRow: {
    color: '#666',
    fontSize: 12,
  },
});
