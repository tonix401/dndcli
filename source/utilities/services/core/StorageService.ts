import dotenv, { configDotenv } from "dotenv";
import Config from "@utilities/Config.js";
import { log } from "@utilities/LogService.js";
import fs from "fs-extra";
import path from "path";
import { inputValidators } from "@utilities/MenuService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { themedInput } from "@components/ThemedInput.js";

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

  let apiKeyValid = false;
  let firstAttempt = true;

  while (!apiKeyValid) {
    // Clear console on subsequent attempts (not on first run)
    if (!firstAttempt) {
      console.clear();
      console.log(getTerm("apiKeyInvalid"));
    } else {
      firstAttempt = false;
    }

    // Check if API key exists and validate it
    if (!process.env.OPENAI_API_KEY) {
      log("No API key found, prompting user for input...", "Info ");

      const newApiKey = await themedInput({
        message: getTerm("enterApiKey"),
        validate: inputValidators.apiKey,
      });

      // Write the API key to the .env file
      fs.writeFileSync(filePathsToCheck.env, `OPENAI_API_KEY=${newApiKey}`);

      // Update the environment variable in the current process
      process.env.OPENAI_API_KEY = newApiKey;

      // Reload environment variables
      dotenv.config();
    }

    // Validate the API key
    log("Validating OpenAI API key...", "Info ");
    try {
      // Force the OpenAI client to reinitialize with the new key
      // We need to modify the AIService.ts to add a resetConfig function
      const { validateApiKey, resetOpenAIClient } = await import(
        "@utilities/AIService.js"
      );
      resetOpenAIClient(); // Reset the OpenAI client configuration before validating

      const validationResult = await validateApiKey();

      if (validationResult.isValid) {
        apiKeyValid = true;
        log("API key validation successful", "Info ");
      } else {
        log(`API key validation failed: ${validationResult.error}`, "Error");
        // Clear the invalid key so we prompt for a new one
        process.env.OPENAI_API_KEY = "";
        fs.writeFileSync(filePathsToCheck.env, `OPENAI_API_KEY=`);

        // Wait briefly before retrying to avoid too rapid prompts
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    } catch (error) {
      log(
        `API key validation error: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "Error"
      );
      // Clear the invalid key
      process.env.OPENAI_API_KEY = "";
      fs.writeFileSync(filePathsToCheck.env, `OPENAI_API_KEY=`);

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  if (getDataFromFile("character") === null) {
    saveDataToFile("character", Config.START_CHARACTER);
    return true;
  }
  return false;
}
