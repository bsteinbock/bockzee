import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  MAX_ALLOWED_ROLLS,
  MAX_PLAYERS,
  MIN_ALLOWED_ROLLS,
  MIN_PLAYERS,
  SCORE_CATEGORIES,
  createDice,
  createPlayers,
  getDiceValues,
  getPlayerTotal,
  isGameComplete,
  normalizePlayerNames,
  randomDieValue,
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
  availableCategories: CategoryPreview[];
  canRoll: boolean;
  canScore: boolean;
  applySettings: (nextSettings: GameSettingsInput) => void;
  resetGame: () => void;
  rollDice: () => void;
  toggleHeld: (dieId: number) => void;
  scoreCurrentCategory: (categoryId: CategoryId) => boolean;
  addPlayerSlot: (playerNames: string[]) => string[];
  removePlayerSlot: (playerNames: string[]) => string[];
};

const DEFAULT_SETTINGS: GameSettings = {
  playerNames: ['Player 1', 'Player 2'],
  allowedRolls: 3,
};

const GameContext = createContext<GameContextValue | null>(null);

function sanitizeSettings(nextSettings: GameSettingsInput): GameSettings {
  return {
    playerNames: normalizePlayerNames(
      nextSettings.playerNames ?? DEFAULT_SETTINGS.playerNames
    ),
    allowedRolls: Math.max(
      MIN_ALLOWED_ROLLS,
      Math.min(
        MAX_ALLOWED_ROLLS,
        nextSettings.allowedRolls ?? DEFAULT_SETTINGS.allowedRolls
      )
    ),
  };
}

export function GameProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<Player[]>(() =>
    createPlayers(DEFAULT_SETTINGS.playerNames)
  );
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState<Die[]>(createDice);
  const [rollCount, setRollCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastAction, setLastAction] = useState('');

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
      currentDice.map((die) =>
        die.held ? die : { ...die, value: randomDieValue() }
      )
    );
    setRollCount((currentRollCount) => currentRollCount + 1);
    setLastAction('');
  };

  const toggleHeld = (dieId: number) => {
    if (gameOver || rollCount === 0 || rollCount >= settings.allowedRolls) {
      return;
    }

    setDice((currentDice) =>
      currentDice.map((die) =>
        die.id === dieId ? { ...die, held: !die.held } : die
      )
    );
  };

  const scoreCurrentCategory = (categoryId: CategoryId): boolean => {
    if (
      !currentPlayer ||
      gameOver ||
      rollCount === 0 ||
      currentPlayer.scores[categoryId] !== null
    ) {
      return false;
    }

    const score = scoreCategory(categoryId, diceValues);
    const updatedPlayers = players.map((player, index) => {
      if (index !== currentPlayerIndex) {
        return player;
      }

      return {
        ...player,
        scores: {
          ...player.scores,
          [categoryId]: score,
        },
      };
    });

    const category = SCORE_CATEGORIES.find((item) => item.id === categoryId);
    finishTurn(
      updatedPlayers,
      `Scored ${currentPlayer.name}: ${category?.label} = ${score}`
    );
    return true;
  };

  const applySettings = (nextSettings: GameSettingsInput) => {
    resetForSettings({
      playerNames: normalizePlayerNames(nextSettings.playerNames).slice(
        0,
        MAX_PLAYERS
      ),
      allowedRolls: nextSettings.allowedRolls,
    });
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

  const availableCategories = useMemo<CategoryPreview[]>(() => {
    if (!currentPlayer) {
      return [];
    }

    return SCORE_CATEGORIES.filter(
      (category) => currentPlayer.scores[category.id] === null
    ).map((category) => ({
      ...category,
      previewScore: scoreCategory(category.id, diceValues),
    }));
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
    availableCategories,
    canRoll: !gameOver && rollCount < settings.allowedRolls,
    canScore: !gameOver && rollCount > 0,
    applySettings,
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
