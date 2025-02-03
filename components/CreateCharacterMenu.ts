import ICharacterData from "../types/ICharacterData";
import { saveCharacterData } from "../utilities/CharacterService.js";
import { input, select } from "@inquirer/prompts";
import { getClassChoices } from "../types/ClassChoices.js";
import { getTerm, Language } from "../utilities/LanguageService.js";

let charData: ICharacterData = {
  name: "",
  class: "",
  level: "1",
  xp: "0",
  hp: "10",
  abilities: {
    maxhp: "10",
    strength: "1",
    mana: "1",
    dexterity: "1",
    charisma: "1",
    luck: "1",
  },
  inventory: {
    item1: "",
    item2: "",
    item3: "",
    item4: "",
    item5: "",
  },
  lastPlayed: "",
};

export async function createCharacterMenu(lang: Language) {
  charData.name = await input(
    { message: getTerm("namePrompt", lang) },
    { clearPromptOnDone: true }
  );
  charData.class = await select(
    {
      message: getTerm("classPrompt", lang),
      choices: getClassChoices(lang),
    },
    { clearPromptOnDone: true }
  );
  charData.lastPlayed = new Date().toLocaleDateString();
  saveCharacterData(charData);

  console.log(getTerm("characterSuccess", lang));
  await input({ message: getTerm("pressEnter", lang) });
}
