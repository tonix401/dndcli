import { input } from "@inquirer/prompts";
import {
  getCharacterData,
  saveCharacterData,
} from "../utilities/CharacterService.js";
import { getContextData } from "../utilities/ContextService.js";
import { getTerm, Language } from "../utilities/LanguageService.js";
import {
  getSettingsData,
  saveSettingsData,
} from "../utilities/SettingsService.js";
import { pause, slowWrite, totalClear } from "../utilities/ConsoleService.js";

/**
 * Initializes the settings and a character in case there is none yet
 * @returns Whether the player is new
 */
export async function newPlayerScreen(): Promise<boolean> {
  let isNew = false;
  let lang: Language = "de";
  totalClear();
  try {
    lang = getSettingsData()?.language || "de";
  } catch (error) {
    saveSettingsData({ language: "de" });
    isNew = true;
  }
  try {
    getCharacterData();
  } catch (error) {
    isNew = true;
  }
  if (!getContextData()) {
    isNew = true;
  }
  if (isNew) {
    saveCharacterData({
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
    });
    await slowWrite(getTerm("helloNewPlayer", lang));
    await pause(500);
    await input({ message: getTerm("pressEnter", lang) });
  }
  return isNew;
}
