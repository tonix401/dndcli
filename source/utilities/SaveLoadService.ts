// utilities/SaveLoadService.ts
import fs from "fs-extra";
import path from "path";
import { IGameState } from "@utilities/IGameState.js";
import { createNewGameState } from "./CacheService.js";
import { log } from "./LogService.js";
// Define the storage directory and file path.
const SAVE_DIR = path.join(process.cwd(), "storage");
const SAVE_FILE_PATH = path.join(SAVE_DIR, "gamestate.json");

// Ensure that the save directory exists.
async function ensureSaveDirectory(): Promise<void> {
  await fs.ensureDir(SAVE_DIR);
}

// Define the structure of the saved data.
interface SaveData {
  version: number;
  savedAt: string;
  state: any; // Use 'any' as the serialized state has Maps converted to objects
}
/**
 * ---------------------------------------------------------
 * WHAT THIS CODE DOES IN SIMPLE TERMS
 * ---------------------------------------------------------
 *
 * Imagine you have a complex Lego creation. When you save your game:
 *
 * 1. Takes a Photo: The game takes a "photo" of your current progress
 * 2. Disassembles Special Parts: Some pieces can't be photographed properly
 *    (like Maps and Sets), so it converts them to simpler forms
 * 3. Saves to File: Writes everything to a file on your computer
 *
 * When you load your game:
 *
 * 1. Checks for Photo: Looks for your saved game file
 * 2. Creates Empty Frame: Starts with a blank game state (like an empty Lego baseplate)
 * 3. Rebuilds Everything: Carefully reconstructs your game piece by piece:
 *    - Regular Pieces: Numbers, text, and basic arrays are easy to copy back
 *    - Special Pieces: Maps (like your character list) and Sets (like themes) need special rebuilding
 * 4. Returns Complete Model: Gives you back a fully working game state with all your progress
 *
 * THE TRICKY PART
 *
 * The most important part of this code is handling those special pieces (Maps and Sets):
 *
 * - Maps (like characters): In your save file, they're stored as simple lists of names
 *   and values. The code rebuilds the proper Map structure by reading each name and
 *   creating a proper connection.
 *
 * - Sets (like themes): These are stored as simple lists but need to be converted
 *   back to Sets that don't allow duplicates.
 * ---------------------------------------------------------
 */

/**
 * Saves the current game state to a JSON file in the storage folder.
 * Uses an atomic write to prevent data corruption.
 */
export async function saveGameState(gameState: IGameState): Promise<void> {
  try {
    await ensureSaveDirectory();
    const tempPath = SAVE_FILE_PATH + ".tmp";

    // Convert Maps and Sets to serializable formats
    const serializableState = {
      ...gameState,
      characters: Object.fromEntries(gameState.characters),
      themes: Array.from(gameState.themes),
    };

    // Create the save data object with a version number and timestamp.
    const saveData: SaveData = {
      version: 1, // Increment this when you change the structure of IGameState.
      savedAt: new Date().toISOString(),
      state: serializableState,
    };

    // Write to a temporary file, then move it atomically.
    await fs.writeJson(tempPath, saveData, { spaces: 2 });
    await fs.move(tempPath, SAVE_FILE_PATH, { overwrite: true });
    log("Game state saved successfully", "Info ");
  } catch (error) {
    console.error("Error saving game state:", error);
    log(
      `Error details: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
  }
}

/**
 * Loads the game state from the JSON file in the storage folder.
 * Returns null if no saved state exists or if there is a validation error.
 */
export async function loadGameState(): Promise<IGameState | null> {
  try {
    await ensureSaveDirectory();
    const exists = await fs.pathExists(SAVE_FILE_PATH);

    // If no save file exists, create a new game state
    if (!exists) {
      log("No save file found. Created new game state.", "Info ");
      return null;
    }

    const loadedData: SaveData = await fs.readJson(SAVE_FILE_PATH);

    // Validate that the loaded data has the expected properties.
    if (
      typeof loadedData.version !== "number" ||
      typeof loadedData.savedAt !== "string" ||
      typeof loadedData.state !== "object"
    ) {
      log("Save file format is invalid. Creating new game state.", "Warn ");
      return null;
    }

    const gameState = createNewGameState();

    // Copy primitive and array properties
    for (const [key, value] of Object.entries(loadedData.state)) {
      if (key === "characters") {
        // Reconstruct the Map for characters
        gameState.characters = new Map();
        if (value && typeof value === "object") {
          Object.entries(value).forEach(([charName, charData]) => {
            gameState.characters.set(charName, charData as any);
          });
        }
      } else if (key === "themes") {
        // Reconstruct the Set for themes
        gameState.themes = new Set(value as string[]);
      } else if (Array.isArray(value)) {
        // Copy arrays
        gameState[key] = [...value];
      } else if (value && typeof value === "object") {
        // Copy objects
        gameState[key] = { ...value };
      } else {
        // Copy primitives
        gameState[key] = value;
      }
    }

    log("Game state loaded successfully", "Info ");
    return gameState;
  } catch (error) {
    log(
      `Error details: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );

    return null;
  }
}
