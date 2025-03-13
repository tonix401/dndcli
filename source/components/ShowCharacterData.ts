import { primaryColor, totalClear } from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { Separator } from "@inquirer/prompts";
import config from "@utilities/Config.js";
import ICharacter from "@utilities/ICharacter.js";
import Config from "@utilities/Config.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";
import { inputValidators, themedInput } from "@utilities/MenuService.js";
import { themedSelectInRoom } from "./ThemedSelectInRoom.js";

const getCharacterOptions = (character: ICharacter) => {
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
    { name: getTerm("saveAndGoBack"), value: "goBack" },
  ];
};

export async function showCharacterData() {
  const character: ICharacter =
    getDataFromFile("character") || config.START_CHARACTER;

  while (true) {
    totalClear();
    const choice = await themedSelectInRoom({
      message: primaryColor(getTerm("characterData")),
      choices: getCharacterOptions(character),
      canGoBack: true,
    });

    if (choice === "goBack") {
      saveDataToFile("character", character);
      return;
    }

    switch (choice) {
      case "name":
        character.name = await themedInput({
          message: primaryColor(getTerm("name")),
          default: character.name,
          validate: inputValidators.name,
        });
        break;

      case "class":
        totalClear();
        character.class = await themedSelectInRoom({
          message: primaryColor(getTerm("class")),
          default: character.class,
          choices: Config.CHARACTER_CLASSES.map((cls) => ({
            name: getTerm(cls),
            value: cls,
          })),
        });
        break;

      case "level":
        const newLevel = await themedInput({
          message: primaryColor(getTerm("level")),
          default: character.level.toString(),
          validate: inputValidators.level,
        });
        character.level = parseInt(newLevel);
        break;

      case "hp":
        const newCurrentHp = await themedInput({
          message: primaryColor(getTerm("hp")),
          default: character.hp.toString(),
          validate: inputValidators.hp,
        });
        character.hp = parseInt(newCurrentHp);
      case "maxhp":
        const newMaxHp = await themedInput({
          message: primaryColor(getTerm("maxhp")),
          default: character.abilities.maxhp.toString(),
          validate: (value) => inputValidators.maxhp(value, character),
        });
        character.abilities.maxhp = parseInt(newMaxHp);
        break;

      case "xp":
        const newXp = await themedInput({
          message: primaryColor(getTerm("xp")),
          default: character.xp.toString(),
          validate: inputValidators.xp,
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
          validate: inputValidators.numericAbility,
        });
        character.abilities[choice] = parseInt(newValue);
        break;
    }

    // Update lastPlayed timestamp
    character.lastPlayed = new Date().toLocaleString();
  }
}
