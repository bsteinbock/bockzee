# bockzee

Expo Router version of the BockZee scorekeeper with Game, Settings, and Doc tabs.

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

The main game screen now lives in `app/index.tsx`, and the shared state and
scoring logic are type-checked in `src/game-context.tsx` and `src/game-logic.ts`.
