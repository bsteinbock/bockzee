import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import {
  BOCKZEE_BONUS_POINTS,
  LOWER_CATEGORY_IDS,
  MAX_ALLOWED_ROLLS,
  MAX_PLAYERS,
  MIN_ALLOWED_ROLLS,
  MIN_PLAYERS,
  SCORE_CATEGORIES,
  createDice,
  createPlayers,
  getDiceValues,
  getUpperCategoryIdForDieValue,
  getPlayerTotal,
  isBockzee,
  isGameComplete,
  normalizePlayerNames,
  randomDieValue,
  sortDiceByHoldAndValue,
  scoreCategory,
  type CategoryId,
  type CategoryPreview,
  type Die,
  type Player,
} from './game-logic';

type GameSettings = {
  playerNames: string[];
  allowedRolls: number;
};

type GameSettingsInput = {
  playerNames: string[];
  allowedRolls?: number;
};

type Winner = {
  name: string;
  total: number;
};

type GameContextValue = {
  settings: GameSettings;
  players: Player[];
  currentPlayer: Player | null;
  currentPlayerIndex: number;
  dice: Die[];
  diceValues: number[];
  heldValues: number[];
  rollCount: number;
  gameOver: boolean;
  lastAction: string;
  winner: Winner | null;
  scoringHint: string | null;
  availableCategories: CategoryPreview[];
  canRoll: boolean;
  canScore: boolean;
  applySettings: (nextSettings: GameSettingsInput) => void;
  savePlayerNames: (playerNames: string[]) => void;
  resetGame: () => void;
  rollDice: () => void;
  toggleHeld: (dieId: number) => void;
  scoreCurrentCategory: (categoryId: CategoryId) => boolean;
  addPlayerSlot: (playerNames: string[]) => string[];
  removePlayerSlot: (playerNames: string[]) => string[];
};

const DEFAULT_SETTINGS: GameSettings = {
  playerNames: ['Player 1'],
  allowedRolls: 3,
};

const GAME_SETTINGS_STORAGE_KEY = 'bockzee.game-settings';

const GameContext = createContext<GameContextValue | null>(null);

function areStringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((item, index) => item === b[index]);
}

type TurnScoringRules = {
  bonusAward: number;
  forcedCategoryId: CategoryId | null;
  restrictToLowerSection: boolean;
  useJokerRuleForLowerSection: boolean;
};

function getTurnScoringRules(player: Player, diceValues: number[]): TurnScoringRules {
  const isBonusBockzee = isBockzee(diceValues) && player.scores.bockzee === 50;
  if (!isBonusBockzee) {
    return {
      bonusAward: 0,
      forcedCategoryId: null,
      restrictToLowerSection: false,
      useJokerRuleForLowerSection: false,
    };
  }

  const forcedUpperCategoryId = getUpperCategoryIdForDieValue(diceValues[0]);
  const mustUseUpperCategory =
    forcedUpperCategoryId !== null && player.scores[forcedUpperCategoryId] === null;

  return {
    bonusAward: BOCKZEE_BONUS_POINTS,
    forcedCategoryId: mustUseUpperCategory ? forcedUpperCategoryId : null,
    restrictToLowerSection: !mustUseUpperCategory,
    useJokerRuleForLowerSection: !mustUseUpperCategory,
  };
}

function getAvailableCategoryIdsForTurn(player: Player, diceValues: number[]): CategoryId[] {
  const rules = getTurnScoringRules(player, diceValues);

  if (rules.forcedCategoryId) {
    return [rules.forcedCategoryId];
  }

  if (rules.restrictToLowerSection) {
    return LOWER_CATEGORY_IDS.filter((categoryId) => player.scores[categoryId] === null);
  }

  return SCORE_CATEGORIES.filter((category) => player.scores[category.id] === null).map(
    (category) => category.id,
  );
}

function sanitizeSettings(nextSettings: GameSettingsInput): GameSettings {
  return {
    playerNames: normalizePlayerNames(nextSettings.playerNames ?? DEFAULT_SETTINGS.playerNames),
    allowedRolls: Math.max(
      MIN_ALLOWED_ROLLS,
      Math.min(MAX_ALLOWED_ROLLS, nextSettings.allowedRolls ?? DEFAULT_SETTINGS.allowedRolls),
    ),
  };
}

export function GameProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<Player[]>(() => createPlayers(DEFAULT_SETTINGS.playerNames));
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState<Die[]>(createDice);
  const [rollCount, setRollCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);

  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const rawSettings = await AsyncStorage.getItem(GAME_SETTINGS_STORAGE_KEY);
        if (!rawSettings) {
          setHasLoadedSettings(true);
          return;
        }

        const parsedSettings = JSON.parse(rawSettings) as Partial<GameSettings>;
        const storedSettings = sanitizeSettings({
          playerNames: parsedSettings.playerNames ?? DEFAULT_SETTINGS.playerNames,
          allowedRolls: parsedSettings.allowedRolls,
        });

        setSettings(storedSettings);
        setPlayers(createPlayers(storedSettings.playerNames));
      } catch (error) {
        console.warn('Failed to load saved game settings:', error);
      } finally {
        setHasLoadedSettings(true);
      }
    };

    void loadStoredSettings();
  }, []);

  useEffect(() => {
    if (!hasLoadedSettings) {
      return;
    }

    const persistSettings = async () => {
      try {
        await AsyncStorage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.warn('Failed to save game settings:', error);
      }
    };

    void persistSettings();
  }, [hasLoadedSettings, settings]);

  const resetForSettings = (nextSettings: GameSettingsInput) => {
    const sanitizedSettings = sanitizeSettings(nextSettings);
    setSettings(sanitizedSettings);
    setPlayers(createPlayers(sanitizedSettings.playerNames));
    setCurrentPlayerIndex(0);
    setDice(createDice());
    setRollCount(0);
    setGameOver(false);
    setLastAction('');
  };

  const currentPlayer = players[currentPlayerIndex] ?? null;
  const diceValues = getDiceValues(dice);
  const heldValues = dice
    .filter((die) => die.held)
    .map((die) => die.value)
    .sort((a, b) => a - b);

  const finishTurn = (updatedPlayers: Player[], actionMessage: string) => {
    setPlayers(updatedPlayers);
    setLastAction(actionMessage);

    if (isGameComplete(updatedPlayers)) {
      setGameOver(true);
      return;
    }

    setCurrentPlayerIndex((currentPlayerIndex + 1) % updatedPlayers.length);
    setDice(createDice());
    setRollCount(0);
  };

  const rollDice = () => {
    if (gameOver || rollCount >= settings.allowedRolls) {
      return;
    }

    setDice((currentDice) =>
      sortDiceByHoldAndValue(
        currentDice.map((die) => (die.held ? die : { ...die, value: randomDieValue() })),
      ),
    );
    setRollCount((currentRollCount) => currentRollCount + 1);
    setLastAction('');
  };

  const toggleHeld = (dieId: number) => {
    if (gameOver || rollCount === 0 || rollCount >= settings.allowedRolls) {
      return;
    }

    setDice((currentDice) =>
      currentDice.map((die) => (die.id === dieId ? { ...die, held: !die.held } : die)),
    );
  };

  const scoreCurrentCategory = (categoryId: CategoryId): boolean => {
    if (!currentPlayer || gameOver || rollCount === 0 || currentPlayer.scores[categoryId] !== null) {
      return false;
    }

    const allowedCategoryIds = getAvailableCategoryIdsForTurn(currentPlayer, diceValues);
    if (!allowedCategoryIds.includes(categoryId)) {
      return false;
    }

    const rules = getTurnScoringRules(currentPlayer, diceValues);
    const score = scoreCategory(categoryId, diceValues, {
      useJokerRule: rules.useJokerRuleForLowerSection,
    });
    const updatedPlayers = players.map((player, index) => {
      if (index !== currentPlayerIndex) {
        return player;
      }

      return {
        ...player,
        bockzeeBonus: player.bockzeeBonus + rules.bonusAward,
        scores: {
          ...player.scores,
          [categoryId]: score,
        },
      };
    });

    const category = SCORE_CATEGORIES.find((item) => item.id === categoryId);
    const bonusSuffix = rules.bonusAward > 0 ? ` (+${rules.bonusAward} Bockzee Bonus)` : '';
    finishTurn(updatedPlayers, `Scored ${currentPlayer.name}: ${category?.label} = ${score}${bonusSuffix}`);
    return true;
  };

  const applySettings = (nextSettings: GameSettingsInput) => {
    const normalizedNames = normalizePlayerNames(nextSettings.playerNames).slice(0, MAX_PLAYERS);
    const nextAllowedRolls = nextSettings.allowedRolls ?? settings.allowedRolls;

    if (
      areStringArraysEqual(normalizedNames, settings.playerNames) &&
      nextAllowedRolls === settings.allowedRolls
    ) {
      return;
    }

    resetForSettings({
      playerNames: normalizedNames,
      allowedRolls: nextAllowedRolls,
    });
  };

  const savePlayerNames = (playerNames: string[]) => {
    const normalizedNames = normalizePlayerNames(playerNames).slice(0, MAX_PLAYERS);
    if (areStringArraysEqual(normalizedNames, settings.playerNames)) {
      return;
    }

    // Changing player count impacts turn order and score ownership, so reset in that case.
    if (normalizedNames.length !== players.length) {
      resetForSettings({
        playerNames: normalizedNames,
        allowedRolls: settings.allowedRolls,
      });
      return;
    }

    setSettings((currentSettings) => ({
      ...currentSettings,
      playerNames: normalizedNames,
    }));
    setPlayers((currentPlayers) =>
      currentPlayers.map((player, index) => ({
        ...player,
        name: normalizedNames[index] ?? player.name,
      })),
    );
  };

  const addPlayerSlot = (playerNames: string[]): string[] => {
    if (playerNames.length >= MAX_PLAYERS) {
      return playerNames;
    }

    return [...playerNames, `Player ${playerNames.length + 1}`];
  };

  const removePlayerSlot = (playerNames: string[]): string[] => {
    if (playerNames.length <= MIN_PLAYERS) {
      return playerNames;
    }

    return playerNames.slice(0, -1);
  };

  const winner = useMemo<Winner | null>(() => {
    if (!gameOver) {
      return null;
    }

    return players.reduce<Winner | null>((best, player) => {
      const total = getPlayerTotal(player);
      if (!best || total > best.total) {
        return { name: player.name, total };
      }
      return best;
    }, null);
  }, [gameOver, players]);

  const scoringHint = useMemo<string | null>(() => {
    if (!currentPlayer || rollCount === 0 || gameOver) {
      return null;
    }

    const rules = getTurnScoringRules(currentPlayer, diceValues);
    if (rules.bonusAward === 0) {
      return null;
    }

    if (rules.forcedCategoryId) {
      const forcedCategory = SCORE_CATEGORIES.find((category) => category.id === rules.forcedCategoryId);
      return `Bockzee bonus active: +${rules.bonusAward}. You must score ${forcedCategory?.label}.`;
    }

    return `Bockzee bonus active: +${rules.bonusAward}. Upper match is closed, so choose any open lower category (joker rule applies).`;
  }, [currentPlayer, diceValues, gameOver, rollCount]);

  const availableCategories = useMemo<CategoryPreview[]>(() => {
    if (!currentPlayer) {
      return [];
    }

    const allowedCategoryIds = getAvailableCategoryIdsForTurn(currentPlayer, diceValues);
    const rules = getTurnScoringRules(currentPlayer, diceValues);

    return SCORE_CATEGORIES.filter((category) => allowedCategoryIds.includes(category.id)).map(
      (category) => ({
        ...category,
        previewScore: scoreCategory(category.id, diceValues, {
          useJokerRule: rules.useJokerRuleForLowerSection,
        }),
      }),
    );
  }, [currentPlayer, diceValues]);

  const value: GameContextValue = {
    settings,
    players,
    currentPlayer,
    currentPlayerIndex,
    dice,
    diceValues,
    heldValues,
    rollCount,
    gameOver,
    lastAction,
    winner,
    scoringHint,
    availableCategories,
    canRoll: !gameOver && rollCount < settings.allowedRolls,
    canScore: !gameOver && rollCount > 0,
    applySettings,
    savePlayerNames,
    resetGame: () => resetForSettings(settings),
    rollDice,
    toggleHeld,
    scoreCurrentCategory,
    addPlayerSlot,
    removePlayerSlot,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error('useGame must be used inside GameProvider');
  }

  return context;
}
