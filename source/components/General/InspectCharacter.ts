import ICharacter from "@utilities/ICharacter.js";
import {
  alignText,
  alignTextAsTable,
  boxItUp,
  getTextOnBackground,
  pressEnter,
  primaryColor,
  secondaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import chalk from "chalk";
import { getTerm } from "@utilities/LanguageService.js";
import { getDataFromFile } from "@utilities/StorageService.js";
import { getEquippedStatBonuses } from "@utilities/EquipmentService.js";

export async function inspectCharacter() {
  totalClear();
  const charData: ICharacter | null = getDataFromFile("character");

  if (!charData) {
    console.log(getTerm("noCharacter"));
    await pressEnter({ allowLeft: true });
    return;
  }

  // Sum of items in inventory
  const inventorySum: number = charData.inventory.reduce(
    (sum: number, item: { quantity: number }): number => sum + item.quantity,
    0
  );

  const equipBonuses = getEquippedStatBonuses(charData);

  // Define title and body texts
  const title = `${charData.name} - ${getTerm("level")} ${
    charData.level
  } ${getTerm(charData.class)}`;

  const bodyArray: [string, string][] = [
    [
      getTerm("hp"),
      `${charData.hp} / ${
        charData.abilities.maxhp + (equipBonuses.maxhp || 0)
      }`,
    ],
    [getTerm("xp"), `${charData.xp}`],
    [
      getTerm("strength"),
      `${charData.abilities.strength} + ${equipBonuses.strength || 0}`,
    ],
    [getTerm("mana"), `${charData.abilities.mana} + ${equipBonuses.mana || 0}`],
    [
      getTerm("dexterity"),
      `${charData.abilities.dexterity} + ${equipBonuses.dexterity || 0}`,
    ],
    [
      getTerm("charisma"),
      `${charData.abilities.charisma} + ${equipBonuses.charisma || 0}`,
    ],
    [getTerm("luck"), `${charData.abilities.luck} + ${equipBonuses.luck || 0}`],
    [getTerm("items"), `${inventorySum}`],
    [getTerm("lastPlayed"), `${charData.lastPlayed}`],
  ];

  // Calculate total width
  const margin = "";
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
  const formattedTitle = primaryColor(
    chalk.bold(alignText(title, "center", margin, totalMaxWidth))
  );
  const bodyTable = alignTextAsTable(
    bodyArray,
    margin,
    separator,
    totalMaxWidth
  ).text;
  const formattedBodyTable = secondaryColor(alignText(bodyTable, "center"));

  console.log(
    getTextOnBackground(boxItUp(formattedTitle + "\n" + formattedBodyTable))
  );

  await pressEnter({ allowLeft: true });
}
