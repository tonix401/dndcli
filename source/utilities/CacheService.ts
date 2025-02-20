import { Dungeon, initiateDungeonMapWithHallways } from "./DungeonService.js";
import { getTerm, Language } from "./LanguageService.js";
import { log } from "./LogService.js";
import { getSettingsData, saveSettingsData } from "./SettingsService.js";
import { ITheme, IThemeOverride, standardTheme } from "./ThemingService.js";

let cachedDungeon: Dungeon = initiateDungeonMapWithHallways();
let cachedLanguage: Language = "de";
let cachedTheme: ITheme = standardTheme;
let cachedPassword: string =
  "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

loadData();

// #region Getters
export function getDungeon() {
  return cachedDungeon;
}

export function renewDungeon() {
  cachedDungeon = initiateDungeonMapWithHallways();
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
// #endregion

// #region Setters
export function setDungeon(dungeon: Dungeon) {
  cachedDungeon = dungeon;
  saveData();
  log("Cache Service: Dungeon updated");
}

export function setLanguage(language: Language): void {
  cachedLanguage = language;
  log("Cache service: Language set to " + getTerm(language));
  saveData();
}

export function setTheme(theme: IThemeOverride) {
  log(`Cache Service: Theme set to ${theme.name.en}`);

  cachedTheme = {
    name: { de: theme.name.de, en: theme.name.en },
    prefix: theme.prefix || standardTheme.prefix,
    primaryColor: theme.primaryColor || standardTheme.primaryColor,
    secondaryColor: theme.secondaryColor || standardTheme.secondaryColor,
    cursor: theme.cursor || standardTheme.cursor,
  };
  saveData();
}

export function setPassword(password: string) {
  cachedPassword = password;
  saveData();
  log("Cache Service: Password updated");
}

// #endregion

function saveData() {
  saveSettingsData({
    language: cachedLanguage,
    theme: cachedTheme,
    password: cachedPassword,
  });
}

function loadData() {
  let settings = null;
  try {
    settings = getSettingsData();
  } catch (error) {
    log("Cache Service: " + error);
  }
  cachedLanguage = settings?.language || "de";
  cachedTheme = settings?.theme || standardTheme;
  cachedPassword =
    settings?.password ||
    "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
}
