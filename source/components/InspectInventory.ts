import ICharacterData from "../types/ICharacterData.js";
import { getCharacterData } from "../utilities/CharacterService.js";
import chalk from "chalk";
import { getTerm } from "../utilities/LanguageService.js";
import { getTheme } from "../utilities/CacheService.js";
import {
  alignText,
  alignTextAsTable,
  pressEnter,
  totalClear,
} from "../utilities/ConsoleService.js";

export async function inspectInventory() {
  totalClear();
  const charData: ICharacterData | null = getCharacterData();

  if (!charData) {
    console.log(getTerm("noCharacter"));
    await pressEnter();
    return;
  }

  if (charData.inventory.length === 0) {
    console.log(getTerm("empty"));
    await pressEnter();
    return;
  }

  // Define title and body texts
  const title = `${charData.name} - ${getTerm("inventory")}`;

  const bodyArray: [string, string][] = charData.inventory.map((item) => [
    item.name,
    `${item.quantity}x`,
  ]);

  // Calculate total width
  const margin = "| ";
  const separator = ":  ";
  const maxWidthOfBody =
    Math.max(
      ...bodyArray.map((nameValuePair) => nameValuePair.join("").length)
    ) +
    margin.length * 2 +
    separator.length;
  const maxWidthOfTitle = title.length + margin.length * 2;
  const totalMaxWidth = Math.max(maxWidthOfBody, maxWidthOfTitle);

  // Format title and body
  const formattedTitle = chalk.hex(getTheme().primaryColor)(
    chalk.bold(alignText(title, "center", margin, totalMaxWidth))
  );
  const bodyTable = alignTextAsTable(
    bodyArray,
    margin,
    separator,
    totalMaxWidth
  ).text;
  const formattedBodyTable = chalk.hex(getTheme().secondaryColor)(
    alignText(bodyTable, "center")
  );

  // Log out
  console.log(
    chalk.hex(getTheme().secondaryColor)(
      "/" + "‾".repeat(totalMaxWidth - 2) + "\\"
    )
  );
  console.log(formattedTitle + "\n" + formattedBodyTable);
  console.log(
    chalk.hex(getTheme().secondaryColor)(
      "\\" + "_".repeat(totalMaxWidth - 2) + "/"
    )
  );

  await pressEnter();
}
