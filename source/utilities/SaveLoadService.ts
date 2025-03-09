// utilities/SaveLoadService.ts
import fs from "fs-extra";
import path from "path";
import { GameState } from "../src/gameState.js";

// Define the storage directory and file path.
const SAVE_DIR = path.join(process.cwd(), "storage");
const SAVE_FILE_PATH = path.join(SAVE_DIR, "savedGameState.json");

// Ensure that the save directory exists.
async function ensureSaveDirectory(): Promise<void> {
  await fs.ensureDir(SAVE_DIR);
}

// Define the structure of the saved data.
interface SaveData {
  version: number;
  savedAt: string;
  state: GameState;
}

/**
 * Saves the current game state to a JSON file in the storage folder.
 * Uses an atomic write to prevent data corruption.
 */
export async function saveGameState(gameState: GameState): Promise<void> {
  try {
    await ensureSaveDirectory();
    const tempPath = SAVE_FILE_PATH + ".tmp";

    // Create the save data object with a version number and timestamp.
    const saveData: SaveData = {
      version: 1, // Increment this when you change the structure of GameState.
      savedAt: new Date().toISOString(),
      state: gameState,
    };

    // Write to a temporary file, then move it automically.
    await fs.writeJson(tempPath, saveData, { spaces: 2 });
    await fs.move(tempPath, SAVE_FILE_PATH, { overwrite: true });
  } catch (error) {
    console.error("Error saving game state:", error);
  }
}

/**
 * Loads the game state from the JSON file in the storage folder.
 * Returns null if no saved state exists or if there is a validation error.
 */
export async function loadGameState(): Promise<GameState | null> {
  try {
    await ensureSaveDirectory();
    const exists = await fs.pathExists(SAVE_FILE_PATH);
    if (!exists) return null;

    const loadedData: SaveData = await fs.readJson(SAVE_FILE_PATH);

    // Validate that the loaded data has the expected properties.
    if (
      typeof loadedData.version !== "number" ||
      typeof loadedData.savedAt !== "string" ||
      typeof loadedData.state !== "object"
    ) {
      console.error("Loaded save file is invalid.");
      return null;
    }

    // Here you can also check for version mismatches and handle migrations if needed.
    return Object.assign(new GameState(), loadedData.state);
  } catch (error) {
    console.error("Error loading game state:", error);
    return null;
  }
}
