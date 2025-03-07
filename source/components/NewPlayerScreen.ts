import { getTerm } from "@utilities/LanguageService.js";
import {
  pause,
  pressEnter,
  secondaryColor,
  skippableSlowWrite,
  themedInput,
  totalClear,
} from "@utilities/ConsoleService.js";
import { log, LogTypes } from "@utilities/LogService.js";
import fs from "fs-extra";
import dotenv from "dotenv";
import Config from "@utilities/Config.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";

/**
 * Initializes the settings and a character in case there is none yet
 * @returns Whether the player is new
 */
export async function newPlayerScreen(): Promise<boolean> {
  totalClear();
  await ensureFilesExist();

  let isNew = false;
  const charData = getDataFromFile("character");
  isNew = !charData;

  if (isNew) {
    totalClear();
    log("New Player Screen: New Player detected");
    saveDataToFile("character", Config.START_CHARACTER);
    await skippableSlowWrite(secondaryColor(getTerm("helloNewPlayer")));
    await pause(500);
    await pressEnter();
  }
  return isNew;
}

async function ensureFilesExist() {
  dotenv.config();

  // Use the file paths defined in Config.ts
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
      log("New Player Screen: " + error, "Error");
    }
  });

  if (!process.env.OPENAI_API_KEY) {
    fs.writeFileSync(
      filePathsToCheck.env,
      "OPENAI_API_KEY=" + (await promptForApiKey())
    );
  }
}

async function promptForApiKey(): Promise<string> {
  let isCorrectFormat: boolean = false;
  let userInput: string;
  const apiKeyRegex = /^sk-[a-zA-Z0-9_-]{40,}$/;

  do {
    userInput = await themedInput({
      message: getTerm("enterApiKey"),
    });

    isCorrectFormat = apiKeyRegex.test(userInput);

    if (!isCorrectFormat) {
      totalClear();
      console.log(secondaryColor(getTerm("wrongFormat")));
    }
  } while (!isCorrectFormat);

  return userInput;
}
