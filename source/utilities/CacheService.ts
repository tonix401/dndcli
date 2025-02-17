import { Dungeon, DungeonSize, initiateDungeonMap } from "./DungeonService.js";
import { getTerm, Language } from "./LanguageService.js";
import { log, LogTypes } from "./LogService.js";
import { saveSettingsData } from "./SettingsService.js";
import {
  getAllThemeOverrides,
  IThemeOverride,
  standardTheme,
} from "./ThemingService.js";

const rawDungeonSizes = Object.values(DungeonSize);
const dungeonSizes: DungeonSize[] = rawDungeonSizes.filter(
  (size) => typeof size === "number"
) as DungeonSize[];
let cachedDungeon: Dungeon = initiateDungeonMap(5);
let cachedPlayerPosition: { x: number; y: number } = { x: 0, y: 0 };
let cachedLanguage: Language = "de";
let cachedTheme = standardTheme;
let cachedPassword: string =
  "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

export function getPlayerPosition() {
  return cachedPlayerPosition;
}

export function getDungeon() {
  return cachedDungeon;
}

export function setDungeon(dungeon: Dungeon) {
  cachedDungeon = dungeon;
}

export function renewDungeon() {
  cachedDungeon = initiateDungeonMap(
    dungeonSizes[Math.floor(Math.random() * dungeonSizes.length)]
  );
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

export function setLanguage(language: Language): void {
  cachedLanguage = language;
  log("Cache service: Language set to " + getTerm(language));
  commitToJson();
}

export function setThemeByKey(key: string): void {
  const themeOverrides = getAllThemeOverrides();
  const tempTheme = themeOverrides[key];

  if (tempTheme) {
    log(`Cache Service: Theme set to ${tempTheme.name.en}`);
    cachedTheme = {
      name: { de: tempTheme.name.de, en: tempTheme.name.en },
      prefix: tempTheme.prefix || standardTheme.prefix,
      primaryColor: tempTheme.primaryColor || standardTheme.primaryColor,
      secondaryColor: tempTheme.secondaryColor || standardTheme.secondaryColor,
      cursor: tempTheme.cursor || standardTheme.cursor,
    };
  } else {
    log(
      `Cache Service: There is no theme overide called: "${key}"`,
      LogTypes.ERROR
    );
  }
  commitToJson();
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
  commitToJson();
}

export function setPassword(password: string) {
  cachedPassword = password;
  commitToJson();
}

function commitToJson() {
  saveSettingsData({
    language: cachedLanguage,
    theme: cachedTheme,
    password: cachedPassword,
  });
}
