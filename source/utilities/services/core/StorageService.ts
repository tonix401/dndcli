import { configDotenv } from "dotenv";
import Config from "@utilities/Config.js";
import { log } from "@core/LogService.js";
import fs from "fs-extra";
import { inputValidators } from "@ui/MenuService.js";
import { getTerm } from "@core/LanguageService.js";
import { themedInput } from "@components/ThemedInput.js";

const files = {
  character: Config.CHARACTER_FILE,
  context: Config.CONTEXT_FILE,
  settings: Config.SETTINGS_FILE,
  gameState: Config.GAME_STATE_FILE,
  dungeon: Config.DUNGEON_FILE,
};

type File = keyof typeof files;

export function getDataFromFile(file: File): any {
  const sourceFile = files[file];
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

export function saveDataToFile(file: File, data: string | object): void {
  const destinationFile = files[file];
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
