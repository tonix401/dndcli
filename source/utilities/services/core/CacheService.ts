import { getTerm, Language } from "@utilities/LanguageService.js";
import { ITheme } from "@utilities/ITheme.js";
import { IThemeOverride } from "@utilities/IThemeOveride.js";
import Config, { StoryPaceKey } from "@utilities/Config.js";
import fs from "fs-extra";
import {
  Dungeon,
  initiateDungeonMapWithHallways,
} from "@utilities/world/DungeonService.js";
import { log } from "@utilities/LogService.js";
import { getDataFromFile, saveDataToFile } from "./StorageService.js";
import {
  Chapter,
  Character,
  CharacterTrait,
  ConversationMessage,
  IGameState,
} from "@utilities/IGameState.js";

// #region Initiate
let settings = getDataFromFile("settings");

// Don't try to load game state directly here - defer to SaveLoadService instead
// This prevents conflicts between different loading mechanisms
let gameState = null;
// Removed direct gameState loading via getDataFromFile

let cachedLanguage: Language = settings?.language || Config.STANDARD_LANGUAGE;
let cachedTheme: ITheme = settings?.theme || Config.STANDARD_THEME;
let cachedDungeon = initiateDungeonMapWithHallways();
let cachedPassword: string = settings?.password || Config.STANDARD_PASSWORD;

// Create a new game state with proper Map and Set objects - will be populated by SaveLoadService
let cachedGameState: IGameState = createNewGameState();

// Try to load save file if it exists
(async () => {
  try {
    const { loadGameState } = await import("./SaveLoadService.js");
    const loadedState = await loadGameState();
    if (loadedState) {
      log("Cache Service: Successfully loaded game state from file", "Info ");
      // Replace the default state with the loaded state
      cachedGameState = loadedState;
    }
  } catch (error) {
    log(
      `Cache Service: Error loading game state: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
  }
})();
// #endregion
// #region Getters
export function getDungeon() {
  return cachedDungeon;
}

export function getPassword() {
  return cachedPassword;
}

export function getLanguage() {
  return cachedLanguage;
}

export function getTheme() {
  return cachedTheme;
}

export function getGameState() {
  return cachedGameState;
}

export function getGameStateProperty<K extends keyof IGameState>(property: K) {
  return cachedGameState[property];
}

// #endregion

// #region Setters
export function renewDungeon() {
  cachedDungeon = initiateDungeonMapWithHallways();
  log("Cache Service: Dungeon renewed");
  save();
}

export function setDungeon(dungeon: Dungeon) {
  cachedDungeon = dungeon;
  log("Cache Service: Dungeon updated");
  save();
}

export function setLanguage(language: Language): void {
  cachedLanguage = language;
  log("Cache service: Language set to " + getTerm(language));
  save();
}

export function setTheme(theme: IThemeOverride) {
  log(`Cache Service: Theme set to ${theme.name.en}`);
  const standardTheme = Config.STANDARD_THEME;

  cachedTheme = {
    name: {
      de: theme.name.de,
      en: theme.name.en,
      ch: theme.name.ch || theme.name.de,
    },
    prefix: theme.prefix || standardTheme.prefix,
    primaryColor: theme.primaryColor || standardTheme.primaryColor,
    secondaryColor: theme.secondaryColor || standardTheme.secondaryColor,
    cursor: theme.cursor || standardTheme.cursor,
    accentColor: theme.accentColor || standardTheme.accentColor,
    backgroundColor: theme.backgroundColor || standardTheme.backgroundColor,
    errorColor: theme.errorColor || standardTheme.errorColor,
  };
  save();
}

export function setPassword(password: string) {
  cachedPassword = password;
  log("Cache Service: Password updated");
  save();
}

export function setGameState(gameState: IGameState) {
  cachedGameState = gameState;
  log("Cache Service: Game State updated");
  save();
}

/**
 * Sets a specific property in the game state.
 * @param property A property of the game state. Like: "theme" or "narrativeHistory"
 * @param value The value to set.
 */
export function setGameStateProperty<K extends keyof IGameState>(
  property: K,
  value: IGameState[K]
) {
  cachedGameState[property] = value;
  log("Cache Service: Game State Property updated", "Info ");
  save();
}

// #region Migrated GameState methods

// Narrative management
export function addNarrative(narrative: string): void {
  // Check if this entry would be a duplicate before adding
  const signature =
    narrative.length > 100 ? narrative.substring(0, 100) : narrative;

  // Create a set of existing signatures for quick lookup
  const existingSignatures = new Set(
    cachedGameState.narrativeHistory.map((item) =>
      item.length > 100 ? item.substring(0, 100) : item
    )
  );

  // Only add if not a duplicate
  if (!existingSignatures.has(signature)) {
    cachedGameState.narrativeHistory.push(narrative);
  } else {
    log("Cache Service: Prevented duplicate narrative entry", "Info ");
  }

  const maxItems = cachedGameState.maxHistoryItems || 50;
  if (cachedGameState.narrativeHistory.length > maxItems) {
    cachedGameState.narrativeHistory.shift();
  }
  save();
}

export function getNarrativeHistory(): string[] {
  return cachedGameState.narrativeHistory;
}

// Conversation management
export function addConversation(message: ConversationMessage): void {
  // Check if this entry would be a duplicate
  const content = message.content || "";
  const signature =
    message.role +
    ":" +
    (content.length > 100 ? content.substring(0, 100) : content);

  // Create a set of existing signatures
  const existingSignatures = new Set(
    cachedGameState.conversationHistory.map((item) => {
      const itemContent = item.content || "";
      return (
        item.role +
        ":" +
        (itemContent.length > 100 ? itemContent.substring(0, 100) : itemContent)
      );
    })
  );

  // Only add if not a duplicate
  if (!existingSignatures.has(signature)) {
    cachedGameState.conversationHistory.push(message);
  } else {
    log("Cache Service: Prevented duplicate conversation entry", "Info ");
  }

  const maxItems = cachedGameState.maxHistoryItems || 50;
  if (cachedGameState.conversationHistory.length > maxItems) {
    cachedGameState.conversationHistory.shift();
  }
  save();
}

export function getConversationHistory(): ConversationMessage[] {
  return cachedGameState.conversationHistory;
}

// Choice management
export function addChoice(choice: string): void {
  cachedGameState.choices.push(choice);
  save();
}

export function getChoices(): string[] {
  return cachedGameState.choices;
}

// Plot management
export function updatePlot(newStage: number, newSummary: string): void {
  cachedGameState.plotStage = newStage;
  cachedGameState.plotSummary = newSummary;
  save();
}

export function getPlotStage(): number {
  return cachedGameState.plotStage;
}

export function getPlotSummary(): string {
  return cachedGameState.plotSummary;
}

export function summarizeHistory(): string {
  const summaryCount = 3;
  return cachedGameState.narrativeHistory.slice(-summaryCount).join("\n");
}

// Chapter management
export function getChapters(): Chapter[] {
  return [...cachedGameState.chapters];
}

export function beginNewChapter(
  title: string,
  summary: string,
  arc: Chapter["arc"]
): void {
  if (cachedGameState.currentChapter) {
    cachedGameState.chapters.push(cachedGameState.currentChapter);
  }

  cachedGameState.currentChapter = {
    title,
    summary,
    arc,
    completedObjectives: [],
    pendingObjectives: [],
    characters: [],
    locations: [],
    metadata: {},
  };

  save();
}

export function getCurrentChapter(): Chapter {
  // Initialize a default chapter if none exists
  if (!cachedGameState.currentChapter) {
    beginNewChapter(
      "Chapter 1: The Beginning",
      "Your adventure begins",
      "introduction"
    );
  }

  return cachedGameState.currentChapter;
}

export function addObjective(objective: string): void {
  if (!cachedGameState.currentChapter) {
    beginNewChapter("Chapter 1", "Your adventure begins", "introduction");
  }

  cachedGameState.currentChapter.pendingObjectives.push(objective);
  save();
}

export function completeObjective(objective: string): void {
  if (!cachedGameState.currentChapter) return;

  const index = cachedGameState.currentChapter.pendingObjectives.findIndex(
    (obj) => obj === objective
  );

  if (index !== -1) {
    const completed = cachedGameState.currentChapter.pendingObjectives.splice(
      index,
      1
    )[0];
    cachedGameState.currentChapter.completedObjectives.push(completed);
    save();
  }
}

export function shouldAdvanceChapter(): boolean {
  // Logic to determine if chapter should advance
  // Example: if 75% of objectives are complete
  if (!cachedGameState.currentChapter) return false;

  const totalObjectives =
    cachedGameState.currentChapter.pendingObjectives.length +
    cachedGameState.currentChapter.completedObjectives.length;

  if (totalObjectives === 0) return false;

  const completionRate =
    cachedGameState.currentChapter.completedObjectives.length / totalObjectives;
  return completionRate >= 0.75;
}

// Character management
export function addOrUpdateCharacter(
  name: string,
  info: Partial<Character>
): void {
  const existing = cachedGameState.characters.get(name) || {
    description: "",
    relationship: "neutral",
    lastSeen: "",
    importance: 5,
  };

  cachedGameState.characters.set(name, { ...existing, ...info });

  // Add to chapter characters if important
  if (
    (info.importance || existing.importance) > 7 &&
    cachedGameState.currentChapter &&
    !cachedGameState.currentChapter.characters.includes(name)
  ) {
    cachedGameState.currentChapter.characters.push(name);
  }

  save();
}

export function getImportantCharacters(): Array<{
  name: string;
  relationship: string;
  lastSeen: string;
}> {
  return Array.from(cachedGameState.characters.entries())
    .filter(([_, info]) => info.importance > 6)
    .map(([name, info]) => ({
      name,
      relationship: info.relationship,
      lastSeen: info.lastSeen,
    }));
}

// Character trait management
export function updateCharacterTrait(trait: string, delta: number): void {
  const existing = cachedGameState.characterTraits.find(
    (t) => t.name.toLowerCase() === trait.toLowerCase()
  );

  if (existing) {
    existing.level = Math.max(1, Math.min(10, existing.level + delta));
  } else {
    cachedGameState.characterTraits.push({
      name: trait,
      level: 5 + delta,
      description: `Your character has demonstrated ${trait}`,
    });
  }

  save();
}

export function getCharacterTraits(): CharacterTrait[] {
  return cachedGameState.characterTraits;
}

// Theme management
export function addTheme(theme: string): void {
  cachedGameState.themes.add(theme);
  save();
}

export function getThemes(): string[] {
  return Array.from(cachedGameState.themes);
}

// #endregion

/**
 * Creates a fresh game state object with all required methods
 */
export function createNewGameState(): IGameState {
  // Use the default game state from Config
  const defaultState = Config.DEFAULT_GAME_STATE;

  const freshState: IGameState = {
    // Properties from default state
    theme: defaultState.theme || null,
    narrativeHistory: [],
    conversationHistory: [],
    choices: [],
    plotStage: defaultState.plotStage || 1,
    plotSummary: defaultState.plotSummary || "",
    currentChapter: {
      title: "Chapter 1: The Beginning",
      summary: "Your adventure begins",
      arc: "introduction",
      completedObjectives: [],
      pendingObjectives: [],
      characters: [],
      locations: [],
      metadata: {},
    },
    chapters: [],
    characters: new Map(),
    characterTraits: [],
    themes: new Set(),
    maxHistoryItems: defaultState.maxHistoryItems || 50,
    storyPace: defaultState.storyPace || "MEDIUM",

    // Direct implementation of methods
    addNarrative(narrative: string): void {
      // Check for duplicates
      const signature =
        narrative.length > 100 ? narrative.substring(0, 100) : narrative;
      const existingSignatures = new Set(
        this.narrativeHistory.map((item) =>
          item.length > 100 ? item.substring(0, 100) : item
        )
      );

      // Only add if not a duplicate
      if (!existingSignatures.has(signature)) {
        this.narrativeHistory.push(narrative);
      }

      const maxItems = this.maxHistoryItems || 50;
      if (this.narrativeHistory.length > maxItems) {
        this.narrativeHistory.shift();
      }
    },

    getNarrativeHistory(): string[] {
      return this.narrativeHistory;
    },

    addConversation(message: ConversationMessage): void {
      this.conversationHistory.push(message);
      const maxItems = this.maxHistoryItems || 50;
      if (this.conversationHistory.length > maxItems) {
        this.conversationHistory.shift();
      }
    },

    getConversationHistory(): ConversationMessage[] {
      return this.conversationHistory;
    },

    addChoice(choice: string): void {
      this.choices.push(choice);
    },

    getChoices(): string[] {
      return this.choices;
    },

    updatePlot(newStage: number, newSummary: string): void {
      this.plotStage = newStage;
      this.plotSummary = newSummary;
    },

    getPlotStage(): number {
      return this.plotStage;
    },

    getPlotSummary(): string {
      return this.plotSummary;
    },

    summarizeHistory(): string {
      const summaryCount = 3;
      return this.narrativeHistory.slice(-summaryCount).join("\n");
    },

    getCurrentChapter(): Chapter {
      return this.currentChapter;
    },

    beginNewChapter(title: string, summary: string, arc: Chapter["arc"]): void {
      if (this.currentChapter) {
        this.chapters.push(this.currentChapter);
      }

      this.currentChapter = {
        title,
        summary,
        arc,
        completedObjectives: [],
        pendingObjectives: [],
        characters: [],
        locations: [],
        metadata: {},
      };
    },

    addObjective(objective: string): void {
      if (!this.currentChapter) {
        this.beginNewChapter(
          "Chapter 1",
          "Your adventure begins",
          "introduction"
        );
      }
      this.currentChapter.pendingObjectives.push(objective);
    },

    completeObjective(objective: string): void {
      if (!this.currentChapter) return;

      const index = this.currentChapter.pendingObjectives.findIndex(
        (obj) => obj === objective
      );

      if (index !== -1) {
        const completed = this.currentChapter.pendingObjectives.splice(
          index,
          1
        )[0];
        this.currentChapter.completedObjectives.push(completed);
      }
    },

    removeObjective(objective: string): void {
      if (!this.currentChapter) return;

      const index = this.currentChapter.pendingObjectives.indexOf(objective);
      if (index !== -1) {
        this.currentChapter.pendingObjectives.splice(index, 1);
      }
    },

    getImportantCharacters(): Array<{
      name: string;
      relationship: string;
      lastSeen: string;
    }> {
      return Array.from(this.characters.entries())
        .filter(([_, info]) => info.importance > 6)
        .map(([name, info]) => ({
          name,
          relationship: info.relationship,
          lastSeen: info.lastSeen,
        }));
    },

    shouldAdvanceChapter(): boolean {
      if (!this.currentChapter) return false;

      const totalObjectives =
        this.currentChapter.pendingObjectives.length +
        this.currentChapter.completedObjectives.length;

      if (totalObjectives === 0) return false;

      const completionRate =
        this.currentChapter.completedObjectives.length / totalObjectives;
      return completionRate >= 0.75;
    },

    setStoryPace(pace: StoryPaceKey): void {
      this.storyPace = pace;
    },

    getTheme(): string | null {
      return this.theme;
    },

    setTheme(theme: string): void {
      this.theme = theme;
    },

    getChapters(): Chapter[] {
      return [...this.chapters];
    },

    addOrUpdateCharacter(name: string, info: Partial<Character>): void {
      const existing = this.characters.get(name) || {
        description: "",
        relationship: "neutral",
        lastSeen: "",
        importance: 5,
      };

      this.characters.set(name, { ...existing, ...info });

      // Add to chapter characters if important
      if (
        (info.importance || existing.importance) > 7 &&
        this.currentChapter &&
        !this.currentChapter.characters.includes(name)
      ) {
        this.currentChapter.characters.push(name);
      }
    },

    updateCharacterTrait(trait: string, delta: number): void {
      const existing = this.characterTraits.find(
        (t) => t.name.toLowerCase() === trait.toLowerCase()
      );

      if (existing) {
        existing.level = Math.max(1, Math.min(10, existing.level + delta));
      } else {
        this.characterTraits.push({
          name: trait,
          level: 5 + delta,
          description: `Your character has demonstrated ${trait}`,
        });
      }
    },

    getCharacterTraits(): CharacterTrait[] {
      return this.characterTraits;
    },

    addTheme(theme: string): void {
      this.themes.add(theme);
    },

    getThemes(): string[] {
      return Array.from(this.themes);
    },

    getStoryPace(): StoryPaceKey {
      return this.storyPace;
    },
  };

  return freshState;
}

/**
 * Saves the current settings and game state to the file system.
 */
async function save() {
  try {
    saveDataToFile("settings", {
      language: cachedLanguage,
      theme: cachedTheme,
      password: cachedPassword,
    });

    const isEmpty =
      (!cachedGameState.narrativeHistory ||
        cachedGameState.narrativeHistory.length === 0) &&
      (!cachedGameState.conversationHistory ||
        cachedGameState.conversationHistory.length === 0) &&
      (!cachedGameState.choices || cachedGameState.choices.length === 0) &&
      cachedGameState.plotStage <= 1;

    if (isEmpty) {
      log("Cache Service: Prevented saving empty game state", "Warn ");
      return;
    }

    const { saveGameState } = await import("./SaveLoadService.js");
    await saveGameState(cachedGameState);
  } catch (error) {
    log(
      `Failed to save game state: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
  }
}

export async function resetCachedGameState(
  confirmReset = false
): Promise<void> {
  if (!confirmReset) {
    log("Cache Service: Reset prevented - confirmation required", "Warn ");
    return;
  }

  cachedGameState = createNewGameState();
  log("Cache Service: Game state reset to defaults (confirmed)", "Info ");

  try {
    const { saveGameState } = await import("./SaveLoadService.js");
    await saveGameState(cachedGameState);

    // Delete backup file if it exists
    if (await fs.pathExists(Config.BACKUP_FILE)) {
      await fs.remove(Config.BACKUP_FILE);
      log("Cache Service: Backup file deleted successfully", "Info ");
    }
  } catch (error) {
    log(
      `Failed to save reset game state or delete backup: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
  }
}

// #endregion

export function setStoryPace(pace: StoryPaceKey): void {
  cachedGameState.storyPace = pace;
  log("Cache Service: Story pace updated to " + Config.STORY_PACE[pace].name);
  save();
}

export function getStoryPace(): StoryPaceKey {
  return (cachedGameState.storyPace || "FAST") as StoryPaceKey;
}
