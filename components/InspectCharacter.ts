import ICharacterData from "../types/ICharacterData";
import { getCharacterData } from "../utilities/CharacterService.js";
import { totalClear } from "../utilities/ConsoleService.js";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { getTerm } from "../utilities/LanguageService.js";

type Language = "de" | "en";

export async function inspectCharacter(lang: Language = "de") {
  totalClear();
  const charData: ICharacterData = await getCharacterData();

  if (!charData) {
    console.log(getTerm("noCharacter", lang));
    await input({
      message: getTerm("pressEnter", lang),
    });
  }

  const charLog = `
    ${chalk.bold(
      `${charData.name} - ${getTerm("level", lang)} ${charData.level} ${getTerm(
        charData.class,
        lang
      )}`
    )}

    ${getTerm("hp", lang)}: ${charData.hp} of ${charData.abilities.maxhp}
    ${getTerm("xp", lang)}: ${charData.xp}

    ${getTerm("strength", lang)}: ${charData.abilities.strength}
    ${getTerm("mana", lang)}: ${charData.abilities.mana}
    ${getTerm("dexterity", lang)}: ${charData.abilities.dexterity}
    ${getTerm("charisma", lang)}: ${charData.abilities.charisma}
    ${getTerm("luck", lang)}: ${charData.abilities.luck}

    ${getTerm("inventory", lang)}:
    | ${charData.inventory.item1 || getTerm("empty", lang)} | ${
    charData.inventory.item2 || getTerm("empty", lang)
  } | ${charData.inventory.item3 || getTerm("empty", lang)} | ${
    charData.inventory.item4 || getTerm("empty", lang)
  } | ${charData.inventory.item5 || getTerm("empty", lang)} |

    ${getTerm("lastPlayed", lang)}: ${charData.lastPlayed}
    `;
  console.log(charLog);
  await input({
    message: getTerm("pressEnter", lang),
  });
}
