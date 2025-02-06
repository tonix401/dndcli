import { input } from "@inquirer/prompts";
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
import { log } from "../utilities/LogService.js";
import { getSecondaryColor } from "../utilities/CacheService.js";
import chalk from "chalk";

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

/**
 * Initializes the settings and a character in case there is none yet
 * @returns Whether the player is new
 */
export async function newPlayerScreen(): Promise<boolean> {
  totalClear();

  let isNew = false;
  const charData = getCharacterData();
  isNew = !charData;

  if (isNew) {
    log("New Player detected, showing new player screen...");
    saveCharacterData(newPlayerChar);
    await skippableSlowWrite(getTerm("helloNewPlayer"), {
      formattings: [(char) => chalk.hex(getSecondaryColor())(char)],
    });
    await pause(500);
    await pressEnter();
  }
  return isNew;
}
