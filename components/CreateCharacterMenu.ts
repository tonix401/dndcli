import ICharacterData from "../types/ICharacterData";
import { saveCharacterData } from "../utilities/CharacterService.js";
import { input, select } from "@inquirer/prompts";

let charData: ICharacterData = {
  name: "",
  class: "",
  level: "1",
  xp: "0",
  hp: "10",
  abilities: {
    maxhp: "1",
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

const classChoices = [
  {
    name: "Swordsman",
    value: "swordsman",
  },
  {
    name: "Mage",
    value: "mage",
  },
  {
    name: "Archer",
    value: "archer",
  },
];

export async function createCharacterMenu() {
  charData.name = await input({ message: "Wie soll dein Charakter heißen" });
  charData.class = await select({
    message: "Welche Klasse soll dein Charakter haben",
    choices: classChoices,
  });
  charData.lastPlayed = new Date().toLocaleDateString();
  saveCharacterData(charData);
}
