import {
  themedSelect,
  themedInput,
  primaryColor,
} from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { Separator } from "@inquirer/prompts";
import config from "@utilities/Config.js";
import {
  getCharacterData,
  saveCharacterData,
} from "@utilities/CharacterService.js";
import ICharacterData from "@utilities/ICharacterData.js";
import Config from "@utilities/Config.js";

const validators = {
  name: (input: string) => (input.length > 0 ? true : getTerm("nameRequired")),
  class: (input: string) =>
    input.length > 0 ? true : getTerm("classRequired"),
  level: (input: string) => {
    const num = parseInt(input);
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 1 || num > 20) return getTerm("levelRange");
    return true;
  },
  hp: (input: string) => {
    const num = parseInt(input);
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 0) return getTerm("cantBeNegative");
    return true;
  },
  xp: (input: string) => {
    const num = parseInt(input);
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 0) return getTerm("cantBeNegative");
    return true;
  },
  numericAbility: (input: string) => {
    const num = parseInt(input);
    if (isNaN(num)) return getTerm("mustBeNumber");
    if (num < 0) return getTerm("cantBeNegative");
    return true;
  },
};

const getCharacterOptions = (character: ICharacterData) => {
  // Calculate inventory sum
  const inventorySum: number = character.inventory.reduce(
    (sum: number, item: { quantity: number }): number => sum + item.quantity,
    0
  );

  return [
    {
      name: `${getTerm("name")}: ${character.name}`,
      value: "name",
    },
    {
      name: `${getTerm("class")}: ${getTerm(character.class)}`,
      value: "class",
    },
    {
      name: `${getTerm("level")}: ${character.level}`,
      value: "level",
    },
    {
      name: `${getTerm("xp")}: ${character.xp}`,
      value: "xp",
    },
    new Separator(config.SELECT_SEPARATOR),
    {
      name: `${getTerm("hp")}: ${character.hp}`,
      value: "hp",
    },
    {
      name: `${getTerm("maxhp")}: ${character.abilities.maxhp}`,
      value: "maxhp",
    },

    new Separator(config.SELECT_SEPARATOR),
    {
      name: `${getTerm("strength")}: ${character.abilities.strength}`,
      value: "strength",
    },
    {
      name: `${getTerm("mana")}: ${character.abilities.mana}`,
      value: "mana",
    },
    {
      name: `${getTerm("dexterity")}: ${character.abilities.dexterity}`,
      value: "dexterity",
    },
    {
      name: `${getTerm("charisma")}: ${character.abilities.charisma}`,
      value: "charisma",
    },
    {
      name: `${getTerm("luck")}: ${character.abilities.luck}`,
      value: "luck",
    },
    new Separator(config.SELECT_SEPARATOR),
    new Separator(` ${getTerm("items")}: ${inventorySum}`),
    new Separator(` ${getTerm("lastPlayed")}: ${character.lastPlayed}`),
    new Separator(config.SELECT_SEPARATOR),
    { name: getTerm("goBack"), value: "goBack" },
  ];
};

export async function showCharacterData() {
  const character = getCharacterData() || config.STANDARD_CHARACTER;

  while (true) {
    const choice = await themedSelect({
      message: primaryColor(getTerm("showCharacterData")),
      choices: getCharacterOptions(character),
    });

    if (choice === "goBack") {
      saveCharacterData(character);
      return;
    }

    switch (choice) {
      case "name":
        character.name = await themedInput({
          message: primaryColor(getTerm("name")),
          default: character.name,
          validate: validators.name,
        });
        break;

      case "class":
        character.class = await themedSelect({
          message: primaryColor(getTerm("class")),
          choices: Config.CHARACTER_CLASSES.map((className) => ({
            name: getTerm(className),
            value: className,
          })),
        });
        break;

      case "level":
        const newLevel = await themedInput({
          message: primaryColor(getTerm("level")),
          default: character.level.toString(),
          validate: validators.level,
        });
        character.level = parseInt(newLevel);
        break;

      case "hp":
        const newCurrentHp = await themedInput({
          message: primaryColor(getTerm("hp")),
          default: character.hp.toString(),
          validate: validators.hp,
        });
        character.hp = parseInt(newCurrentHp);
      case "maxhp":
        const newMaxHp = await themedInput({
          message: primaryColor(getTerm("maxhp")),
          default: character.abilities.maxhp.toString(),
          validate: validators.hp,
        });
        character.abilities.maxhp = parseInt(newMaxHp);
        break;

      case "xp":
        const newXp = await themedInput({
          message: primaryColor(getTerm("xp")),
          default: character.xp.toString(),
          validate: validators.xp,
        });
        character.xp = parseInt(newXp);
        break;

      case "strength":
      case "mana":
      case "dexterity":
      case "charisma":
      case "luck":
        const newValue = await themedInput({
          message: primaryColor(getTerm(choice)),
          default: character.abilities[choice].toString(),
          validate: validators.numericAbility,
        });
        character.abilities[choice] = parseInt(newValue);
        break;
    }

    // Update lastPlayed timestamp
    character.lastPlayed = new Date().toLocaleString();
  }
}
