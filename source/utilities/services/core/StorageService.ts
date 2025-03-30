import { configDotenv } from "dotenv";
import Config from "@utilities/Config.js";
import { log } from "@utilities/LogService.js";
import fs from "fs-extra";
import path from "path";
import { inputValidators } from "@utilities/MenuService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { themedInput } from "components/GeneralTEMP/ThemedInput.js";

const getFiles = (): Record<string, string> => {
  return {
    character: Config.CHARACTER_FILE,
    context: Config.CONTEXT_FILE,
    settings: Config.SETTINGS_FILE,
    gameState: Config.GAME_STATE_FILE,
    dungeon: Config.DUNGEON_FILE,
  };
};

type FileOptions =
  | "character"
  | "context"
  | "settings"
  | "gameState"
  | "dungeon";

/**
 * Gets the directory where game data files are stored
 * @returns The path to the data directory
 */
export function getDataDirectory(): string {
  // Use the character file path to determine the directory
  return path.dirname(Config.CHARACTER_FILE);
}

/**
 * Deletes a data file
 * @param file The file to delete
 * @returns True if successful, false otherwise
 */
export function deleteDataFile(file: FileOptions): boolean {
  const filePath = getFiles()[file];
  try {
    fs.unlinkSync(filePath);
    log(`Successfully deleted file: ${filePath}`, "Info ");
    return true;
  } catch (error) {
    if (error instanceof Error) {
      log(`Error deleting file ${filePath}: ${error.message}`, "Error");
    }
    return false;
  }
}

export function getDataFromFile(file: FileOptions): any {
  const sourceFile = getFiles()[file];
  try {
    const data = fs.readFileSync(sourceFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Storage Service: Error while loading ${sourceFile}: ${error.message}`,
        "Error"
      );
    }
    return null;
  }
}

export function saveDataToFile(file: FileOptions, data: string | object): void {
  const destinationFile = getFiles()[file];
  try {
    fs.writeFileSync(destinationFile, JSON.stringify(data, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Storage Service: Error while saving ${destinationFile}: ${error.message}`,
        "Error"
      );
    }
  }
}

/**
 * Ensures that the environment is set up and checks if the player is new
 * @returns Whether the player is new
 */
export async function ensureSetupAndCheckIsNew() {
  configDotenv();

  const filePathsToCheck = {
    env: Config.ENV_FILE,
    log: Config.LOG_FILE,
    settings: Config.SETTINGS_FILE,
    character: Config.CHARACTER_FILE,
  };

  Object.values(filePathsToCheck).forEach((filePath) => {
    try {
      fs.ensureFileSync(filePath);
    } catch (error) {
      log("New Player Intro: " + error, "Error");
    }
  });

  if (!process.env.OPENAI_API_KEY) {
    fs.writeFileSync(
      filePathsToCheck.env,
      "OPENAI_API_KEY=" +
        (await themedInput({
          message: getTerm("enterApiKey"),
          validate: inputValidators.apiKey,
        }))
    );
    return true;
  }
  if (getDataFromFile("character") === null) {
    saveDataToFile("character", Config.START_CHARACTER);
    return true;
  }
  return false;
}
