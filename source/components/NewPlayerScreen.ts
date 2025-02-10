import {
  getCharacterData,
  saveCharacterData,
} from "../utilities/CharacterService.js";
import { getTerm } from "../utilities/LanguageService.js";
import {
  pause,
  pressEnter,
  skippableSlowWrite,
  totalClear,
} from "../utilities/ConsoleService.js";
import { log, LogTypes } from "../utilities/LogService.js";
import chalk from "chalk";
import { getTheme } from "../utilities/CacheService.js";
import path from "path";
import fs from "fs-extra";
import { input } from "@inquirer/prompts";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The standard character for new players
const newPlayerChar = {
  name: "Hans",
  class: "swordsman",
  level: "4",
  xp: "21",
  hp: "3",
  origin: "unknown",
  abilities: {
    maxhp: "10",
    strength: "0",
    mana: "0",
    dexterity: "0",
    charisma: "10",
    luck: "7",
  },
  inventory: [],
  lastPlayed: new Date().toLocaleDateString(),
};

await newPlayerScreen();
await pressEnter();

/**
 * Initializes the settings and a character in case there is none yet
 * @returns Whether the player is new
 */
export async function newPlayerScreen(): Promise<boolean> {
  totalClear();
  await ensureFilesExist();

  let isNew = false;
  const charData = getCharacterData();
  isNew = !charData;

  if (isNew) {
    log("New Player Screen: New Player detected");
    saveCharacterData(newPlayerChar);
    await skippableSlowWrite(getTerm("helloNewPlayer"), {
      formattings: [(char) => chalk.hex(getTheme().secondaryColor)(char)],
    });
    await pause(500);
    await pressEnter();
  }
  return isNew;
}

async function ensureFilesExist() {
  dotenv.config();

  const filePathsToCheck = {
    env: path.resolve(__dirname, "../../.env"),
    log: path.resolve(__dirname, "../../storage/log.txt"),
    settings: path.resolve(__dirname, "../../storage/settings.json"),
    character: path.resolve(__dirname, "../../storage/character.json"),
  };

  Object.values(filePathsToCheck).forEach((filePath) => {
    try {
      fs.ensureFileSync(filePath);
    } catch(error) {
      log("New Player Screen: " + error, LogTypes.ERROR)
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
  const apiKeyRegex = /^sk-[a-zA-Z0-9]{48}$/;

  do {
    userInput = await input({
      message: getTerm("enterApiKey"),
      theme: getTheme(),
    });

    isCorrectFormat = !apiKeyRegex.test(userInput);

    if (!isCorrectFormat) {
      totalClear();
      console.log(chalk.hex(getTheme().secondaryColor)(getTerm("wrongFormat")));
    }
  } while (!isCorrectFormat);

  return userInput;
}
