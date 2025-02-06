import ICharacterData from "../types/ICharacterData";
import { getCharacterData } from "../utilities/CharacterService.js";
import { pressEnter, totalClear } from "../utilities/ConsoleService.js";
import chalk from "chalk";
import { getTerm } from "../utilities/LanguageService.js";
import {
  getPrimaryColor,
  getSecondaryColor,
} from "../utilities/CacheService.js";

export async function inspectCharacter() {
  totalClear();
  const charData: ICharacterData | null = getCharacterData();

  if (!charData) {
    console.log(getTerm("noCharacter"));
    await pressEnter();
    return;
  }
  const charLogTitle = chalk.bold(
    `${charData.name} - ${getTerm("level")} ${charData.level} ${getTerm(
      charData.class
    )}`
  );

  const charLogBody = `
  ${getTerm("hp")}: ${charData.hp} / ${charData.abilities.maxhp}
  ${getTerm("xp")}: ${charData.xp}

  ${getTerm("strength")}: ${charData.abilities.strength}
  ${getTerm("mana")}: ${charData.abilities.mana}
  ${getTerm("dexterity")}: ${charData.abilities.dexterity}
  ${getTerm("charisma")}: ${charData.abilities.charisma}
  ${getTerm("luck")}: ${charData.abilities.luck}

  ${getTerm("inventory")}:
  [ ${charData.inventory.join(" ][ ")} ]

  ${getTerm("lastPlayed")}: ${charData.lastPlayed}
  `;

  console.log(chalk.hex(getPrimaryColor())(charLogTitle));
  console.log(chalk.hex(getSecondaryColor())(charLogBody));

  await pressEnter();
}
