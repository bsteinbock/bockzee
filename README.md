# bockzee

A Yahtzee-style dice scorekeeper built with Expo and React Native. The app
features three tabs—Game, Settings, and Doc—powered by expo-router.

## Features

- **Game tab** – Roll dice, hold between rolls, and score into standard Yahtzee
  categories (upper section, lower section).
- **Settings tab** – Configure player names (1–6 players) and the number of
  allowed rolls per turn (3–5). Saving resets the current game.
- **Doc tab** – In-app rules and scoring reference.
- **Light/Dark theme** – Automatically adapts to the device's system color
  scheme using React Native's `useColorScheme` hook. A shared theme utility
  (`src/theme.ts`) provides consistent colors across all screens.

## Project structure

```
app/
  _layout.tsx    – Root tab navigator with theme-aware tab bar
  index.tsx      – Game screen
  settings.tsx   – Settings screen
  doc.tsx        – Rules/documentation screen
src/
  game-context.tsx – React context providing game state and actions
  game-logic.ts   – Pure scoring logic and type definitions
  theme.ts        – Light/dark color palettes and useThemeColors hook
```

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo dev server:
   ```bash
   npm start
   ```
3. Use the Expo CLI prompts to run on Android, iOS, or web.

## TypeScript

All source files are written in TypeScript. Run type-checking with:

```bash
npx tsc --noEmit
```
