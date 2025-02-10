// utilities/SaveLoadService.ts
import fs from "fs-extra";
import path from "path";
import { GameState } from "../src/gameState.js";

// Define the storage directory (relative to the project root)
const SAVE_DIR = path.join(process.cwd(), "storage");
// Define the full path for the saved game state file inside the storage folder.
const SAVE_FILE_PATH = path.join(SAVE_DIR, "savedGameState.json");

/**
 * Ensures that the storage directory exists.
 */
async function ensureSaveDirectory(): Promise<void> {
  await fs.ensureDir(SAVE_DIR);
}

/**
 * Saves the current game state to a JSON file in the storage folder using an atomic write.
 */
export async function saveGameState(gameState: GameState): Promise<void> {
  try {
    await ensureSaveDirectory();
    // Write to a temporary file first.
    const tempPath = SAVE_FILE_PATH + ".tmp";
    await fs.writeJson(tempPath, gameState, { spaces: 2 });
    // Atomically move the temporary file to the final location.
    await fs.move(tempPath, SAVE_FILE_PATH, { overwrite: true });
    console.log("Game state saved successfully to", SAVE_FILE_PATH);
  } catch (error) {
    console.error("Error saving game state:", error);
  }
}

/**
 * Loads the game state from the JSON file in the storage folder.
 * Returns null if no saved state exists.
 */
export async function loadGameState(): Promise<GameState | null> {
  try {
    await ensureSaveDirectory();
    const exists = await fs.pathExists(SAVE_FILE_PATH);
    if (!exists) return null;
    const loadedState = await fs.readJson(SAVE_FILE_PATH);
    // Re-instantiate GameState to restore its methods.
    return Object.assign(new GameState(), loadedState);
  } catch (error) {
    console.error("Error loading game state:", error);
    return null;
  }
}
