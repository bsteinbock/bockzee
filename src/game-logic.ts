export const TOTAL_DICE = 5;
export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 6;
export const MIN_ALLOWED_ROLLS = 3;
export const MAX_ALLOWED_ROLLS = 5;
export const UPPER_BONUS_THRESHOLD = 63;
export const UPPER_BONUS_POINTS = 35;
export const BOCKZEE_BONUS_POINTS = 100;

export const SCORE_CATEGORIES = [
  { id: 'ones', label: 'Ones', section: 'Upper', description: 'Add only the dice showing 1.' },
  { id: 'twos', label: 'Twos', section: 'Upper', description: 'Add only the dice showing 2.' },
  { id: 'threes', label: 'Threes', section: 'Upper', description: 'Add only the dice showing 3.' },
  { id: 'fours', label: 'Fours', section: 'Upper', description: 'Add only the dice showing 4.' },
  { id: 'fives', label: 'Fives', section: 'Upper', description: 'Add only the dice showing 5.' },
  { id: 'sixes', label: 'Sixes', section: 'Upper', description: 'Add only the dice showing 6.' },
  {
    id: 'threeKind',
    label: 'Three of a kind',
    section: 'Lower',
    description: 'Any three matching dice score the total of all five dice.',
  },
  {
    id: 'fourKind',
    label: 'Four of a kind',
    section: 'Lower',
    description: 'Any four matching dice score the total of all five dice.',
  },
  {
    id: 'smallStraight',
    label: 'Small straight',
    section: 'Lower',
    description: 'Four consecutive values score 30 points.',
  },
  {
    id: 'largeStraight',
    label: 'Large straight',
    section: 'Lower',
    description: 'Five consecutive values score 40 points.',
  },
  {
    id: 'fullHouse',
    label: 'Full house',
    section: 'Lower',
    description: 'A 3-of-a-kind plus a pair scores 25 points.',
  },
  {
    id: 'bockzee',
    label: 'BockZee (5 of a kind)',
    section: 'Lower',
    description: 'Five of a kind scores 50 points.',
  },
  {
    id: 'chance',
    label: 'Chance',
    section: 'Lower',
    description: 'Score the total of all five dice.',
  },
] as const;

export type CategoryId = (typeof SCORE_CATEGORIES)[number]['id'];
export type Scores = Record<CategoryId, number | null>;
export type Die = {
  id: number;
  value: number;
  held: boolean;
};
export type Player = {
  id: number;
  name: string;
  scores: Scores;
  bockzeeBonus: number;
};
export type CategoryPreview = (typeof SCORE_CATEGORIES)[number] & {
  previewScore: number;
};

export const CATEGORY_IDS: CategoryId[] = SCORE_CATEGORIES.map((category) => category.id) as CategoryId[];
export const UPPER_CATEGORY_IDS: CategoryId[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
export const LOWER_CATEGORY_IDS: CategoryId[] = SCORE_CATEGORIES.filter(
  (category) => category.section === 'Lower',
).map((category) => category.id) as CategoryId[];

export function randomDieValue(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function createDice(): Die[] {
  return Array.from({ length: TOTAL_DICE }, (_, id) => ({
    id,
    value: randomDieValue(),
    held: false,
  }));
}

export function getInitialScores(): Scores {
  return CATEGORY_IDS.reduce<Scores>((scores, categoryId) => {
    scores[categoryId] = null;
    return scores;
  }, {} as Scores);
}

export function normalizePlayerNames(playerNames: string[]): string[] {
  const trimmedNames = playerNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .slice(0, MAX_PLAYERS);

  const fallbackCount = Math.max(MIN_PLAYERS, trimmedNames.length);

  return Array.from({ length: fallbackCount }, (_, index) => trimmedNames[index] || `Player ${index + 1}`);
}

export function createPlayers(playerNames: string[]): Player[] {
  return normalizePlayerNames(playerNames).map((name, index) => ({
    id: index,
    name,
    scores: getInitialScores(),
    bockzeeBonus: 0,
  }));
}

export function getDiceValues(dice: Die[]): number[] {
  return dice.map((die) => die.value);
}

export function sortDiceByHoldAndValue(dice: Die[]): Die[] {
  return [...dice].sort((a, b) => {
    if (a.held !== b.held) {
      return a.held ? -1 : 1;
    }

    if (a.value !== b.value) {
      return a.value - b.value;
    }

    return a.id - b.id;
  });
}

export function getDiceSum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function getValueCounts(values: number[]): Record<number, number> {
  return values.reduce<Record<number, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

export function isBockzee(values: number[]): boolean {
  return Object.values(getValueCounts(values)).includes(5);
}

export function getUpperCategoryIdForDieValue(value: number): CategoryId | null {
  switch (value) {
    case 1:
      return 'ones';
    case 2:
      return 'twos';
    case 3:
      return 'threes';
    case 4:
      return 'fours';
    case 5:
      return 'fives';
    case 6:
      return 'sixes';
    default:
      return null;
  }
}

function hasStraight(values: number[], length: number): boolean {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
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

export function scoreCategory(
  categoryId: CategoryId,
  values: number[],
  options?: { useJokerRule?: boolean },
): number {
  const useJokerRule = options?.useJokerRule ?? false;
  const counts = getValueCounts(values);
  const countValues = Object.values(counts);
  const sum = getDiceSum(values);

  switch (categoryId) {
    case 'ones':
      return values.filter((value) => value === 1).length * 1;
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
      return hasStraight(values, 4) || useJokerRule ? 30 : 0;
    case 'largeStraight':
      return hasStraight(values, 5) || useJokerRule ? 40 : 0;
    case 'fullHouse':
      return (countValues.includes(3) && countValues.includes(2)) || useJokerRule ? 25 : 0;
    case 'bockzee':
      return countValues.includes(5) ? 50 : 0;
    case 'chance':
      return sum;
    default:
      return 0;
  }
}

export function getPlayerTotal(player: Player): number {
  return (
    CATEGORY_IDS.reduce((total, categoryId) => total + (player.scores[categoryId] ?? 0), 0) +
    getUpperBonus(player) +
    player.bockzeeBonus
  );
}

export function getUpperSectionTotal(player: Player): number {
  return UPPER_CATEGORY_IDS.reduce((total, categoryId) => total + (player.scores[categoryId] ?? 0), 0);
}

export function getUpperBonus(player: Player): number {
  return getUpperSectionTotal(player) >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_POINTS : 0;
}

export function isGameComplete(players: Player[]): boolean {
  return players.every((player) => CATEGORY_IDS.every((categoryId) => player.scores[categoryId] !== null));
}
