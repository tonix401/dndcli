import ICharacter from "@utilities/ICharacter.js";
import { getTerm } from "@utilities/LanguageService.js";
import {
  alignTextAsMultiTable,
  boxItUp,
  getTextInRoomAsciiIfNotTooLong,
  pressEnter,
  primaryColor,
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
    " | "
  );
  const overlayedOnRoom = getTextInRoomAsciiIfNotTooLong(
    boxItUp(primaryColor(multiTable.text))
  );
  console.log(overlayedOnRoom);
  await pressEnter();
}
