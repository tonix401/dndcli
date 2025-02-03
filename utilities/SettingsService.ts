import fs from "fs";
import { log } from "./LogService.js";
import LogTypes from "../types/LogTypes.js";
import { ISettings } from "../types/ISettings.js";

const filename = "../dndcli/data/settings.json";
/**
 * Reads the saved settings from the settings.json file
 * @returns The settings as an object
 * @example
 * { language: "de" }
 */
export function getSettingsData(): ISettings | null {
  try {
    const data = fs.readFileSync(filename, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Error while loading ${filename}: Something went wrong`,
        LogTypes.ERROR
      );
    }
    return null
  }
}

/**
 * Saves settings data
 * @param settingsData The settings object to write to the settings.json file
 * @example
 * { language: "en" }
 */
export function saveSettingsData(settingsData: ISettings): void {
  try {
    fs.writeFileSync(filename, JSON.stringify(settingsData, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      log(`Error while saving ${filename}: ${error.message}`, LogTypes.ERROR);
    }
  }
}
