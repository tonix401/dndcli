import { ITheme } from "@utilities/ITheme.js";
import { IThemeOverride } from "@utilities/IThemeOveride.js";
import Config from "@utilities/Config.js";
import {
  Dungeon,
  initiateDungeonMapWithHallways,
} from "@utilities/DungeonService.js";
import { getTerm, Language } from "@utilities/LanguageService.js";
import { log } from "@utilities/LogService.js";
import { getDataFromFile, saveDataToFile } from "./StorageService.js";
import { IGameState } from "@utilities/IGameState.js";

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
let cachedGameState: IGameState = gameState || {
  theme: null,
  narrativeHistory: [],
  conversationHistory: [],
  choices: [],
  plotStage: 0,
  plotSummary: "",
};
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
    name: { de: theme.name.de, en: theme.name.en },
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
  log("Cache Service: Game State Property updated");
  save();
}
// #endregion

// TODO: Implement all necessary functions from gamestate.ts

/**
 * Saves the current settings and game state to the file system.
 */
function save() {
  saveDataToFile("settings", {
    language: cachedLanguage,
    theme: cachedTheme,
    password: cachedPassword,
  });
  saveDataToFile("gameState", cachedGameState);
  log("Cache Service: Settings and GameState saved");
}

