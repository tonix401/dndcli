import { input } from "@inquirer/prompts";
import {
  getCharacterData,
  saveCharacterData,
} from "../utilities/CharacterService.js";
import { getTerm, Language } from "../utilities/LanguageService.js";
import { pause, slowWrite, totalClear } from "../utilities/ConsoleService.js";
import { log } from "../utilities/LogService.js";

// The standard character for new players
const newPlayerChar = {
  name: "Hans",
  class: "swordsman",
  level: "4",
  xp: "21",
  hp: "3",
  abilities: {
    maxhp: "10",
    strength: "0",
    mana: "0",
    dexterity: "0",
    charisma: "10",
    luck: "7",
  },
  inventory: {
    item1: "Holzschwert",
    item2: "",
    item3: "",
    item4: "",
    item5: "",
  },
  lastPlayed: "1.1.1970",
};

/**
 * Initializes the settings and a character in case there is none yet
 * @returns Whether the player is new
 */
export async function newPlayerScreen(lang: Language): Promise<boolean> {
  totalClear();
  
  let isNew = false;
  const charData = getCharacterData();
  isNew = !charData;

  log(`IsNew: ${isNew}`);
  log(`Character data: ${charData}`)


  if (isNew) {
    saveCharacterData(newPlayerChar);
    await slowWrite(getTerm("helloNewPlayer", lang));
    await pause(500);
    await input({ message: getTerm("pressEnter", lang) });
  }
  return isNew;
}
