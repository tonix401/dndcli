import LogTypes from "../types/LogTypes.js";
import { Language } from "./LanguageService.js";
import { log } from "./LogService.js";

let language: Language = "de";
let primaryColor = "#E04500";
let secondaryColor = "#ffffff";
const hexColorRegex = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;

export function getLanguage() {
  return language;
}

export function getPrimaryColor() {
  return primaryColor;
}

export function getSecondaryColor() {
  return secondaryColor;
}

export function setLanguage(lang: Language) {
  language = lang;
  log("CacheService: Language set to " + lang);
}

export function setPrimaryColor(color: string) {
  if (hexColorRegex.test(color)) {
    primaryColor = color;
    log("CacheService: Primary color set to " + color);
  } else {
    log(
      "CacheService: Invalid Color Format, while trying to set primary color " +
        color,
      LogTypes.ERROR
    );
  }
}

export function setSecondaryColor(color: string) {
  if (hexColorRegex.test(color)) {
    secondaryColor = color;
    log("CacheService: Secondary color set to " + color);
  } else {
    log(
      "CacheService: Invalid Color Format, while trying to set secondary color: " +
        color,
      LogTypes.ERROR
    );
  }
}
