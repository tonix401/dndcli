import fs from "fs";
import { LogTypes, log } from "./LogService.js";
import { ISettings } from "../types/ISettings.js";
import { Language } from "./LanguageService.js";
import { ITheme } from "./ThemingService.js";
import { Hash } from "crypto";

const filename = "../dndcli/storage/settings.json";
/**
 * Reads the saved settings from the settings.json file
 * @returns The settings as an object
 * @example
 * { language: "de", color: "#E04500" }
 */
export function getSettingsData(): ISettings | null {
  try {
    const data = fs.readFileSync(filename, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Settings Service: Error while loading ${filename}: ${error.message}`,
        LogTypes.ERROR
      );
    }
    return null;
  }
}

/**
 * Saves settings data
 * @param settingsData The settings object to write to the settings.json file
 * @example
 * { language: "en", color: "#E04500" }
 */
export function saveSettingsData(settingsData: ISettings): void {
  try {
    fs.writeFileSync(filename, JSON.stringify(settingsData, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Settings Service: Error while saving ${filename}: ${error.message}`,
        LogTypes.ERROR
      );
    }
  }
}
