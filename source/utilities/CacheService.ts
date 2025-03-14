import { getTerm, Language } from "@utilities/LanguageService.js";
import { ITheme } from "@utilities/ITheme.js";
import { IThemeOverride } from "@utilities/IThemeOveride.js";
import Config from "@utilities/Config.js";
import {
  Dungeon,
  initiateDungeonMapWithHallways,
} from "@utilities/DungeonService.js";
import { log } from "@utilities/LogService.js";
import { getDataFromFile, saveDataToFile } from "./StorageService.js";
import {
  IGameState,
  ConversationMessage,
  Chapter,
  Character,
  CharacterTrait,
} from "@utilities/IGameState.js";

// #region Initiate
let settings = null;
try {
  settings = getDataFromFile("settings");
} catch (error) {
  log("Cache Service: " + error);
}

let gameState = null;
try {
  gameState = getDataFromFile("gameState");
} catch (error) {
  log("Cache Service: " + error);
}

let cachedLanguage: Language = settings?.language || Config.STANDARD_LANGUAGE;
let cachedTheme: ITheme = settings?.theme || Config.STANDARD_THEME;
let cachedDungeon = initiateDungeonMapWithHallways();
let cachedPassword: string = settings?.password || Config.STANDARD_PASSWORD;

// Create a new game state with proper Map and Set objects
let cachedGameState: IGameState;

if (gameState) {
  // Initialize with loaded data but reconstruct Map and Set objects
  cachedGameState = {
    ...gameState,
    characters: new Map(
      // If gameState.characters is an object, convert it to Map entries
      gameState.characters instanceof Map
        ? gameState.characters
        : Object.entries(gameState.characters || {})
    ),
    themes: new Set(
      // If gameState.themes is an array, convert it to a Set
      gameState.themes instanceof Set
        ? gameState.themes
        : Array.isArray(gameState.themes)
        ? gameState.themes
        : []
    ),
    // Ensure other properties have valid defaults
    narrativeHistory: gameState.narrativeHistory || [],
    conversationHistory: gameState.conversationHistory || [],
    choices: gameState.choices || [],
    currentChapter: gameState.currentChapter || {
      title: "Chapter 1: The Beginning",
      summary: "Your adventure begins",
      arc: "introduction",
      completedObjectives: [],
      pendingObjectives: [],
      characters: [],
      locations: [],
      metadata: {},
    },
    chapters: gameState.chapters || [],
    characterTraits: gameState.characterTraits || [],
  };
} else {
  cachedGameState = {
    theme: null,
    narrativeHistory: [],
    conversationHistory: [],
    choices: [],
    plotStage: 1,
    plotSummary: "",
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
    maxHistoryItems: 50,
  };
}
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
  cachedGameState.narrativeHistory.push(narrative);

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
  cachedGameState.conversationHistory.push(message);

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
 * Creates a fresh game state object
 */
export function createNewGameState(): IGameState {
  return {
    theme: null,
    narrativeHistory: [],
    conversationHistory: [],
    choices: [],
    plotStage: 1,
    plotSummary: "",
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
    maxHistoryItems: 50,
  };
}

export function resetCachedGameState(): void {
  // Use the existing createNewGameState function
  cachedGameState = createNewGameState();
  log("Cache Service: Game state reset to defaults", "Info ");
  save();
}

/**
 * Saves the current settings and game state to the file system.
 */
function save() {
  saveDataToFile("settings", {
    language: cachedLanguage,
    theme: cachedTheme,
    password: cachedPassword,
  });

  // Convert Map and Set to serializable formats for storage
  const serializableGameState = {
    ...cachedGameState,
    characters: Object.fromEntries(cachedGameState.characters),
    themes: Array.from(cachedGameState.themes),
  };

  saveDataToFile("gameState", serializableGameState);
  log("Cache Service: Settings and GameState saved");
}
// #endregion
