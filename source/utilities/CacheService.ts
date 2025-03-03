import { ITheme } from "@utilities/ITheme.js";
import { IThemeOverride } from "@utilities/IThemeOverides.js";
import Config from "@utilities/Config.js";
import {
  Dungeon,
  initiateDungeonMapWithHallways,
} from "@utilities/DungeonService.js";
import { getTerm, Language } from "@utilities/LanguageService.js";
import { log } from "@utilities/LogService.js";
import {
  getSettingsData,
  saveSettingsData,
} from "@utilities/SettingsService.js";

const standardTheme = Config.STANDARD_THEME;
const standardLanguage = Config.STANDARD_LANGUAGE;
const standardPassword = Config.STANDARD_PASSWORD;

let cachedDungeon: Dungeon = initiateDungeonMapWithHallways();
let cachedLanguage: Language;
let cachedTheme: ITheme;
let cachedPassword: string;

load();

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

// #endregion
function load() {
  let settings = null;
  try {
    settings = getSettingsData();
  } catch (error) {
    log("Cache Service: " + error);
  }
  cachedLanguage = settings?.language || standardLanguage;
  cachedTheme = settings?.theme || standardTheme;
  cachedPassword = settings?.password || standardPassword;
}

function save() {
  saveSettingsData({
    language: cachedLanguage,
    theme: cachedTheme,
    password: cachedPassword,
  });
  log("Cache Service: Settings synced");
}
