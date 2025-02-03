import ICharacterData from "../types/ICharacterData";
import { getCharacterData } from "../utilities/CharacterService.js";
import { totalClear } from "../utilities/ConsoleService.js";
import chalk from "chalk";
import { confirm } from "@inquirer/prompts";
import { log } from "../utilities/LogService";
import LogTypes from "../types/LogTypes";

export async function inspectCharacter() {
  totalClear();
  const charData: ICharacterData = await getCharacterData();

  if (!charData) {
    console.log("There is no character saved yet");
    await confirm({
      message: "Do you want to go back to the menu?",
    });
  }

  const charLog = `
  ${chalk.bold(`${charData.name} - Level ${charData.level} ${charData.class}`)}
  
  HP: ${charData.hp} of ${charData.abilities.maxhp}
  XP: ${charData.xp}

  Strength: ${charData.abilities.strength}
  Mana: ${charData.abilities.mana}
  Dexterity: ${charData.abilities.dexterity}
  Charisma: ${charData.abilities.charisma}
  Luck: ${charData.abilities.luck}

  Inventory:
  | ${charData.inventory.item1 || "empty"} | ${
    charData.inventory.item2 || "empty"
  } | ${charData.inventory.item3 || "empty"} | ${
    charData.inventory.item4 || "empty"
  } | ${charData.inventory.item5 || "empty"} |

  Last played: ${charData.lastPlayed}
  `;
  console.log(charLog);
  await confirm({
    message: "Do you want to go back to the menu?",
  });
}
