// utilities/SaveLoadService.ts
import fs from "fs-extra";
import path from "path";
import { IGameState, ConversationMessage } from "@utilities/IGameState.js";
import { createNewGameState } from "./CacheService.js";
import { log } from "./LogService.js";

// Define the storage directory and file path.
const SAVE_DIR = path.join(process.cwd(), "storage");
const SAVE_FILE_PATH = path.join(SAVE_DIR, "gamestate.json");
// Backup file path - this is used for recovery if main save gets corrupted
const BACKUP_FILE_PATH = SAVE_FILE_PATH + ".bak";

// Ensure that the save directory exists.
async function ensureSaveDirectory(): Promise<void> {
  await fs.ensureDir(SAVE_DIR);
}

// Define the structure of the saved data.
interface SaveData {
  version: number; // Version tracker - can be used for migration logic when save format changes
  savedAt: string; // Timestamp when the save was created
  state: any; // The actual game state data (serialized)
}
/**
 * ---------------------------------------------------------
 * WHAT THIS CODE DOES IN SIMPLE TERMS
 * ---------------------------------------------------------
 *
 * Imagine we have a complex Lego creation. When we save our game:
 *
 * 1. Takes a Photo: The game takes a "photo" of our current progress
 * 2. Disassembles Special Parts: Some pieces can't be photographed properly
 *    (like Maps and Sets), so it converts them to simpler forms
 * 3. Saves to File: Writes everything to a file on our computer
 *
 * When we load our game:
 *
 * 1. Checks for Photo: Looks for our saved game file
 * 2. Creates Empty Frame: Starts with a blank game state (like an empty Lego baseplate)
 * 3. Rebuilds Everything: Carefully reconstructs our game piece by piece:
 *    - Regular Pieces: Numbers, text, and basic arrays are easy to copy back
 *    - Special Pieces: Maps (like our character list) and Sets (like themes) need special rebuilding
 * 4. Returns Complete Model: Gives we back a fully working game state with all our progress
 *
 * THE TRICKY PART
 *
 * The most important part of this code is handling those special pieces (Maps and Sets):
 *
 * - Maps (like characters): In our save file, they're stored as simple lists of names
 *   and values. The code rebuilds the proper Map structure by reading each name and
 *   creating a proper connection.
 *
 * - Sets (like themes): These are stored as simple lists but need to be converted
 *   back to Sets that don't allow duplicates.
 * ---------------------------------------------------------
 */

/**
 * SAVE FILE BACKUP SYSTEM
 *
 * This function creates a backup copy of the current save file
 * It's called before writing a new save to ensure we have a fallback
 * if something goes wrong during the save process.
 *
 * If the main save file gets corrupted, we may be able to recover
 * from this backup during the load process.
 */
export async function backupGameState(): Promise<void> {
  try {
    const exists = await fs.pathExists(SAVE_FILE_PATH);
    if (!exists) {
      return; // Nothing to backup
    }

    // Copy directly to backup path with overwrite option
    // This is more reliable than the unlink + rename approach
    await fs.copy(SAVE_FILE_PATH, BACKUP_FILE_PATH, { overwrite: true });
    log("Game state backed up successfully", "Info ");
  } catch (error) {
    // If direct copy fails due to file locks, try with retry logic
    let retries = 3;
    let delay = 100; // Start with 100ms delay

    while (retries > 0) {
      try {
        await fs.copy(SAVE_FILE_PATH, BACKUP_FILE_PATH, { overwrite: true });
        log("Game state backed up successfully", "Info ");
        return;
      } catch (retryError) {
        retries--;
        if (retries === 0) {
          log(
            `Backup failed after multiple attempts: ${
              error instanceof Error ? error.message : String(error)
            }`,
            "Error"
          );
          return;
        }

        // Wait with increasing delay before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
}

/**
 * SAVE SYSTEM - COMPLETE PROCESS
 *
 * This function handles the entire save process with several key steps:
 *
 * 1. VALIDATION - Checks if the state is worth saving (not empty)
 * 2. PREPARATION - Ensures directories exist and creates a backup
 * 3. TRANSFORMATION - Converts special data structures (Maps, Sets) to JSON-friendly formats
 * 4. ATOMIC WRITING - Uses a temporary file + move approach to prevent corruption
 * 5. ERROR HANDLING - Handles permissions and other common issues
 *
 * The atomic write process is important: we write to a temp file first, then
 * move it to the final location. This ensures the save file is never in a
 * partially-written state if something goes wrong.
 */
export async function saveGameState(gameState: IGameState): Promise<void> {
  try {
    // Step 1: VALIDATION - Don't save empty states
    // This prevents overwriting good saves with empty ones if something goes wrong
    if (
      (!gameState.narrativeHistory ||
        gameState.narrativeHistory.length === 0) &&
      (!gameState.conversationHistory ||
        gameState.conversationHistory.length === 0) &&
      (!gameState.choices || gameState.choices.length === 0) &&
      gameState.plotStage <= 1
    ) {
      log("Prevented saving empty game state", "Warn ");
      return;
    }

    // Step 2a: PREPARATION - Ensure the save directory exists
    await ensureSaveDirectory();

    // Step 2b: Check if we have write permission before proceeding
    try {
      await fs.access(SAVE_FILE_PATH, fs.constants.W_OK).catch(() => {
        // If file doesn't exist or isn't writable, we'll create/overwrite it
      });
    } catch (e) {
      // Continue - we'll try to write anyway
    }

    // Step 2c: Create backup before saving
    await backupGameState();

    // Step 3a: Create a unique temporary filename to prevent collisions
    const timestamp = Date.now();
    const tempPath = `${SAVE_FILE_PATH}.tmp.${timestamp}`;

    // Step 3b: TRANSFORMATION - Convert Maps and Sets to serializable formats
    // JavaScript Maps and Sets cannot be directly serialized to JSON
    // We convert them to arrays or objects first
    const serializableState = {
      theme: gameState.theme,
      narrativeHistory: gameState.narrativeHistory,
      conversationHistory: gameState.conversationHistory,
      choices: gameState.choices,
      plotStage: gameState.plotStage,
      plotSummary: gameState.plotSummary,
      currentChapter: gameState.currentChapter,
      chapters: gameState.chapters,
      characterTraits: gameState.characterTraits,
      // Map → Object conversion for characters
      characters: Object.fromEntries(
        gameState.characters instanceof Map ? gameState.characters : new Map()
      ),
      // Set → Array conversion for themes
      themes: Array.from(
        gameState.themes instanceof Set ? gameState.themes : new Set()
      ),
      maxHistoryItems: gameState.maxHistoryItems || 50,
      storyPace: gameState.storyPace,
    };

    // Step 3c: Create the save data wrapper with metadata
    const saveData = {
      version: 1, // Increment this when you change the structure of IGameState
      savedAt: new Date().toISOString(),
      state: serializableState,
    };

    // Step 4a: ATOMIC WRITING - Write to a temporary file first
    await fs.writeJson(tempPath, saveData, { spaces: 2 });

    // Step 4b: Move the temporary file to the final location
    // This operation is atomic on most file systems
    let retries = 3;
    while (retries > 0) {
      try {
        await fs.move(tempPath, SAVE_FILE_PATH, { overwrite: true });
        log("Game state saved successfully", "Info ");
        return;
      } catch (moveError) {
        retries--;
        if (retries === 0) {
          throw moveError;
        }
        // Wait a moment before retrying - file might be locked temporarily
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    // Step 5: ERROR HANDLING - Log errors and provide helpful messages
    console.error("Error saving game state:", error);
    log(
      `Error details: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );

    // Special handling for permission errors which are common
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "EPERM" || error.code === "EACCES")
    ) {
      console.error(
        "Permission error: The save file might be in use by another program or requires admin privileges."
      );
    }
  }
}

/**
 * LOAD SYSTEM - COMPLETE PROCESS
 *
 * This function handles the entire load process with several key steps:
 *
 * 1. VERIFICATION - Checks if save file exists
 * 2. PARSING - Reads and parses the JSON file
 * 3. VALIDATION - Verifies the data structure and contents
 * 4. RECONSTRUCTION - Rebuilds special data structures (Maps, Sets)
 * 5. ERROR HANDLING - Handles missing/corrupted files or invalid formats
 *
 * The most complex part is rebuilding Maps and Sets, which aren't directly
 * serializable to JSON and must be reconstructed from plain objects/arrays.
 */
export async function loadGameState(): Promise<IGameState | null> {
  try {
    // Step 1: VERIFICATION - Make sure directory exists and check if file exists
    await ensureSaveDirectory();
    const exists = await fs.pathExists(SAVE_FILE_PATH);

    // If no save file exists, return null (caller should create a new game state)
    if (!exists) {
      log("No save file found. Created new game state.", "Info ");
      return null;
    }

    // Step 2: PARSING - Load and parse the save file
    let loadedData: SaveData;
    try {
      loadedData = await fs.readJson(SAVE_FILE_PATH);
      log(
        `Successfully loaded save file with version ${
          loadedData.version || "unknown"
        }`,
        "Info "
      );
    } catch (readError) {
      log(
        `Failed to read save file: ${
          readError instanceof Error ? readError.message : String(readError)
        }`,
        "Error"
      );

      // Try to recover from backup
      const backupExists = await fs.pathExists(BACKUP_FILE_PATH);
      if (backupExists) {
        log("Attempting to restore from backup file...", "Info ");
        try {
          loadedData = await fs.readJson(BACKUP_FILE_PATH);
          log("Successfully recovered save data from backup!", "Info ");
        } catch (backupError) {
          log(
            `Failed to read backup file as well, creating new game state`,
            "Error"
          );
          return null;
        }
      } else {
        return null;
      }
    }

    // Step 3a: VALIDATION - Check basic structure is valid
    if (
      typeof loadedData.version !== "number" ||
      typeof loadedData.savedAt !== "string" ||
      typeof loadedData.state !== "object" ||
      !loadedData.state
    ) {
      log("Save file format is invalid. Creating new game state.", "Warn ");
      return null;
    }

    const state = loadedData.state;

    // Step 3b: VALIDATION - Log state details for debugging
    log(
      `State contains: ${
        state.narrativeHistory?.length || 0
      } narrative entries, ${
        state.conversationHistory?.length || 0
      } conversation entries`,
      "Info "
    );
    // Step 3c: Fix duplicate entries in the loaded state
    if (state.narrativeHistory && Array.isArray(state.narrativeHistory)) {
      state.narrativeHistory = removeDuplicates(state.narrativeHistory);
      log(
        `Deduplicated narrative history, now has ${state.narrativeHistory.length} entries`,
        "Info "
      );
    }

    if (state.conversationHistory && Array.isArray(state.conversationHistory)) {
      state.conversationHistory = removeDuplicateConversations(
        state.conversationHistory
      );
      log(
        `Deduplicated conversation history, now has ${state.conversationHistory.length} entries`,
        "Info "
      );
    }

    // Only consider it empty if truly empty across ALL progress indicators
    const isCompletelyEmpty =
      (!state.narrativeHistory || state.narrativeHistory.length === 0) &&
      (!state.conversationHistory || state.conversationHistory.length === 0) &&
      (!state.choices || state.choices.length === 0) &&
      (!state.currentChapter ||
        !state.currentChapter.title ||
        (!state.currentChapter.completedObjectives?.length &&
          !state.currentChapter.pendingObjectives?.length));

    // If truly empty, attempt backup recovery
    if (isCompletelyEmpty) {
      log("Main save appears to be empty or at initial state", "Warn ");

      // Try to recover from backup if it exists
      const backupExists = await fs.pathExists(BACKUP_FILE_PATH);
      if (backupExists) {
        log("Attempting to restore from backup file...", "Info ");
        try {
          const backupData = await fs.readJson(BACKUP_FILE_PATH);

          // Verify backup actually has more content than the main save
          const backupState = backupData?.state;
          if (backupState && typeof backupState === "object") {
            const hasMoreContent =
              backupState.narrativeHistory?.length >
                (state.narrativeHistory?.length || 0) ||
              backupState.conversationHistory?.length >
                (state.conversationHistory?.length || 0) ||
              backupState.currentChapter?.completedObjectives?.length >
                (state.currentChapter?.completedObjectives?.length || 0);

            if (hasMoreContent) {
              log(
                "Backup has more content than main save, using backup instead",
                "Info "
              );
              loadedData = backupData;
            } else {
              log(
                "Backup doesn't contain more progress than main save",
                "Info "
              );
            }
          }
        } catch (backupError) {
          log(
            `Could not restore from backup: ${
              backupError instanceof Error
                ? backupError.message
                : String(backupError)
            }`,
            "Error"
          );
        }
      }

      // If still completely empty after backup attempt, return null
      if (
        isCompletelyEmpty &&
        !state.narrativeHistory?.length &&
        !state.conversationHistory?.length
      ) {
        log("No usable save data found. Creating new game state.", "Info ");
        return null;
      }
    }

    // Step 4a: RECONSTRUCTION - Start with a fresh game state as a base
    const gameState = createNewGameState();

    // Step 4b: Copy all properties from the loaded state to the new game state
    // This requires special handling for Maps and Sets which need rebuilding
    for (const [key, value] of Object.entries(loadedData.state)) {
      if (key === "characters") {
        // Rebuild the Map for characters from the plain object
        gameState.characters = new Map();
        if (value && typeof value === "object") {
          Object.entries(value).forEach(([charName, charData]) => {
            gameState.characters.set(charName, charData as any);
          });
        }
        if (
          gameState.characters.size === 0 &&
          loadedData.state.currentChapter?.characters
        ) {
          const chapterCharacters = loadedData.state.currentChapter.characters;
          if (Array.isArray(chapterCharacters)) {
            chapterCharacters.forEach((name: string) => {
              if (!gameState.characters.has(name)) {
                gameState.addOrUpdateCharacter(name, {
                  description: "A character encountered during your adventure",
                  relationship: "neutral",
                  lastSeen: "Recently",
                  importance: 7,
                });
              }
            });
          }
        }
      } else if (key === "themes") {
        // Rebuild the Set for themes from the array
        gameState.themes = new Set(value as string[]);
      } else if (Array.isArray(value)) {
        // Copy arrays (creates new array instances to avoid reference issues)
        gameState[key] = [...value];
      } else if (value && typeof value === "object") {
        // Copy objects (creates new object instances to avoid reference issues)
        gameState[key] = { ...value };
      } else {
        // Copy primitives directly
        gameState[key] = value;
      }
    }

    log("Game state loaded successfully", "Info ");
    return gameState;
  } catch (error) {
    // Step 5: ERROR HANDLING - Log errors and return null (caller should create new game state)
    log(
      `Error details: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );

    return null;
  }
}

/**
 * Remove duplicate entries from an array of strings
 * @param array The array to deduplicate
 * @returns Deduplicated array
 */
export function removeDuplicates(array: string[]): string[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    // For larger text entries, use just the first 100 chars as the signature
    const signature = item.length > 100 ? item.substring(0, 100) : item;
    if (seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  });
}

/**
 * Remove duplicate entries from an array of conversation messages
 * @param array The array to deduplicate
 * @returns Deduplicated array
 */
export function removeDuplicateConversations(
  array: ConversationMessage[]
): ConversationMessage[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    // For conversations, use role + first 100 chars of content as the signature
    const content = item.content || "";
    const signature =
      item.role +
      ":" +
      (content.length > 100 ? content.substring(0, 100) : content);
    if (seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  });
}

/**
 * Deduplicates all history arrays in a game state (in memory only)
 * Does NOT save the state - caller is responsible for saving if needed
 *
 * @param gameState The game state to deduplicate
 * @returns The deduplicated game state (same object, modified in place)
 */
export function deduplicateGameState(gameState: IGameState): IGameState {
  if (gameState.narrativeHistory && Array.isArray(gameState.narrativeHistory)) {
    const originalLength = gameState.narrativeHistory.length;
    gameState.narrativeHistory = removeDuplicates(gameState.narrativeHistory);

    if (originalLength !== gameState.narrativeHistory.length) {
      log(
        `Removed ${
          originalLength - gameState.narrativeHistory.length
        } duplicate narrative entries`,
        "Info "
      );
    }
  }

  if (
    gameState.conversationHistory &&
    Array.isArray(gameState.conversationHistory)
  ) {
    const originalLength = gameState.conversationHistory.length;
    gameState.conversationHistory = removeDuplicateConversations(
      gameState.conversationHistory
    );

    if (originalLength !== gameState.conversationHistory.length) {
      log(
        `Removed ${
          originalLength - gameState.conversationHistory.length
        } duplicate conversation entries`,
        "Info "
      );
    }
  }

  return gameState;
}
