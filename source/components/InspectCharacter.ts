import ICharacterData from "../types/ICharacterData.js";
import { getCharacterData } from "../utilities/CharacterService.js";
import {
  alignText,
  alignTextAsTable,
  pressEnter,
  totalClear,
} from "../utilities/ConsoleService.js";
import chalk from "chalk";
import { getTerm } from "../utilities/LanguageService.js";
import { getTheme } from "../utilities/CacheService.js";

export async function inspectCharacter() {
  totalClear();
  const charData: ICharacterData | null = getCharacterData();

  if (!charData) {
    console.log(getTerm("noCharacter"));
    await pressEnter();
    return;
  }

  // Sum of items in inventory
  const inventorySum: number = charData.inventory.reduce(
    (sum: number, item: { quantity: number }): number => sum + item.quantity,
    0
  );

  // Define title and body texts
  const title = `${charData.name} - ${getTerm("level")} ${
    charData.level
  } ${getTerm(charData.class)}`;

  const bodyArray: [string, string][] = [
    [getTerm("hp"), `${charData.hp} / ${charData.abilities.maxhp}`],
    [getTerm("xp"), `${charData.xp}`],
    [getTerm("strength"), `${charData.abilities.strength}`],
    [getTerm("mana"), `${charData.abilities.mana}`],
    [getTerm("dexterity"), `${charData.abilities.dexterity}`],
    [getTerm("charisma"), `${charData.abilities.charisma}`],
    [getTerm("luck"), `${charData.abilities.luck}`],
    [getTerm("items"), `${inventorySum}`],
    [getTerm("lastPlayed"), `${charData.lastPlayed}`],
  ];

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
