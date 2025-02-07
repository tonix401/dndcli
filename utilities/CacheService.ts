import { getTerm, Language } from "./LanguageService.js";
import { log, LogTypes } from "./LogService.js";
import {
  getAllThemeOverrides,
  IThemeOverride,
  standardTheme,
} from "./ThemingService.js";

let cachedlanguage: Language = "de";
let cachedTheme = standardTheme;

export function getLanguage() {
  return cachedlanguage;
}

export function getTheme() {
  return cachedTheme;
}

export function setLanguage(language: Language): void {
  cachedlanguage = language;
  log("Cache service: Language set to " + getTerm(language));
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
}
