import Config from "./Config.js";
import { log, LogTypes } from "./LogService.js";
import fs from "fs-extra";

const files = {
  character: Config.CHARACTER_FILE,
  context: Config.CONTEXT_FILE,
  settings: Config.SETTINGS_FILE,
  gameState: Config.GAME_STATE_FILE,
};

export function getDataFromFile(
  file: "character" | "context" | "settings" | "gameState"
): any {
  const sourceFile = files[file];
  try {
    const data = fs.readFileSync(sourceFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Storage Service: Error while loading ${sourceFile}: ${error.message}`,
        LogTypes.ERROR
      );
    }
    return null;
  }
}

export function saveDataToFile(
  file: "character" | "context" | "settings" | "gameState",
  data: string | object
): void {
  const destinationFile = files[file];
  try {
    fs.writeFileSync(destinationFile, JSON.stringify(data, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Storage Service: Error while saving ${destinationFile}: ${error.message}`,
        LogTypes.ERROR
      );
    }
  }
}
