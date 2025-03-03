import ICharacter from "@utilities/ICharacter.js";
import { getCharacterData } from "@utilities/CharacterService.js";
import chalk from "chalk";
import { getTerm } from "@utilities/LanguageService.js";
import { getTheme } from "@utilities/CacheService.js";
import {
  alignTextAsMultiTable,
  pressEnter,
  secondaryColor,
  slowWrite,
  totalClear,
} from "@utilities/ConsoleService.js";

export async function inspectInventory() {
  totalClear();
  const charData: ICharacter | null = getDataFromFile("character");

  if (!charData) {
    console.log(getTerm("noCharacter"));
    await pressEnter();
    return;
  }

  if (charData.inventory.length === 0) {
    await slowWrite(getTerm("empty"));
    await pressEnter();
    return;
  }

  const multiTable = alignTextAsMultiTable(
    charData.inventory.map((item) => {
      return [
        [getTerm("name"), item.name],
        [getTerm("effect"), item.effect],
        [getTerm("rarity"), item.rarity],
        [getTerm("quantity"), item.quantity.toString()],
      ];
    }),
    "|"
  );

  console.log(secondaryColor("/" + "‾".repeat(multiTable.width - 2) + "\\"));
  console.log(secondaryColor(multiTable.text));
  console.log(secondaryColor("\\" + "_".repeat(multiTable.width - 2) + "/"));
  await pressEnter();
}
