import fs from "fs";
import { log } from "./LogService.js";
import LogTypes from "../types/LogTypes.js";
import { ISettings } from "../types/ISettings.js";

const filename = "../dndcli/data/settings.json";

export function getSettingsData(): ISettings {
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
    // incase of error return german language settings
    return {
      language: "de",
    };
  }
}

export function saveSettingsData(settingsData: ISettings) {
  try {
    fs.writeFileSync(filename, JSON.stringify(settingsData, null, 2));
    return true;
  } catch (error) {
    if (error instanceof Error) {
      log(`Error while saving ${filename}: ${error.message}`, LogTypes.ERROR);
    }
    return false;
  }
}
