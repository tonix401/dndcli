// utilities/SaveLoadService.ts
import fs from "fs-extra";
import { GameState } from "../src/gameState.js";

const SAVE_FILE_PATH = "./savedGameState.json";

/**
 * Saves the current game state to a JSON file.
 */
export async function saveGameState(gameState: GameState): Promise<void> {
  try {
    await fs.writeJson(SAVE_FILE_PATH, gameState, { spaces: 2 });
    console.log("Game state saved successfully.");
  } catch (error) {
    console.error("Error saving game state:", error);
  }
}

/**
 * Loads the game state from the JSON file.
 * Returns null if no saved state exists.
 */
export async function loadGameState(): Promise<GameState | null> {
  try {
    const exists = await fs.pathExists(SAVE_FILE_PATH);
    if (!exists) return null;
    const loadedState = await fs.readJson(SAVE_FILE_PATH);
    // If necessary, re-instantiate GameState (if methods are lost).
    return Object.assign(new GameState(), loadedState);
  } catch (error) {
    console.error("Error loading game state:", error);
    return null;
  }
}
