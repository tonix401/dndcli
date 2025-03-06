import ICharacter from "@utilities/ICharacter.js";
import { getTerm } from "@utilities/LanguageService.js";
import {
  alignTextAsMultiTable,
  pressEnter,
  secondaryColor,
  skippableSlowWrite,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getDataFromFile } from "@utilities/StorageService.js";

export async function inspectInventory() {
  totalClear();
  const charData: ICharacter | null = getDataFromFile("character");

  if (!charData) {
    console.log(getTerm("noCharacter"));
    await pressEnter();
    return;
  }

  if (charData.inventory.length === 0) {
    await skippableSlowWrite(getTerm("empty"));
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
