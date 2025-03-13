import ICharacter from "@utilities/ICharacter.js";
import { getTerm } from "@utilities/LanguageService.js";
import {
  alignTextAsMultiTable,
  boxItUp,
  getTextOnBackground,
  pressEnter,
  primaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getDataFromFile } from "@utilities/StorageService.js";
import Config from "@utilities/Config.js";
import { getErrorMessage } from "@resources/generalScreens/errorMessage.js";

export async function inspectInventory() {
  totalClear();
  const charData: ICharacter =
    getDataFromFile("character") ?? Config.START_CHARACTER;

  if (!charData) {
    console.log(getTerm("noCharacter"));
    await pressEnter({ allowLeft: true });
    return;
  }

  if (charData.inventory.length === 0) {
    console.log(getErrorMessage(getTerm("empty")));
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
  const overlayedOnRoom = getTextOnBackground(
    boxItUp(primaryColor(multiTable.text))
  );
  console.log(overlayedOnRoom);
  await pressEnter({ allowLeft: true });
}
