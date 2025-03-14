import ICharacter from "@utilities/ICharacter.js";
import { getTerm } from "@utilities/LanguageService.js";
import {
  alignTextAsMultiTable,
  boxItUp,
  getTextOnBackground,
  pressEnter,
  primaryColor,
  secondaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getDataFromFile } from "@utilities/StorageService.js";
import Config from "@utilities/Config.js";
import { getErrorMessage } from "@resources/generalScreens/errorMessage.js";
import chalk from "chalk";

export async function inspectInventory() {
  totalClear();
  const charData: ICharacter =
    getDataFromFile("character") ?? Config.START_CHARACTER;

  if (!charData) {
    console.log(getTerm("noCharacter"));
    await pressEnter({ allowLeft: true });
    return;
  }

  if (!charData.inventory || charData.inventory.length === 0) {
    console.log(getErrorMessage(getTerm("empty")));
    await pressEnter();
    return;
  }

  // Check if an item is currently equipped
  const isItemEquipped = (itemName: string) => {
    if (!charData.equippedItems) return false;
    return charData.equippedItems.some((equip) => equip.name === itemName);
  };

  // Format inventory items using the alignTextAsMultiTable function
  const inventoryItems = charData.inventory.map((item) => {
    // Start with basic properties every item has
    const rows: [string, string][] = [
      [
        getTerm("name"),
        `${item.name} (x${item.quantity})${
          isItemEquipped(item.name) ? " " + chalk.green("★ Equipped") : ""
        }`,
      ],
      [getTerm("description"), item.description],
      [
        getTerm("type"),
        `${item.type || getTerm("unknown")}${
          item.consumable === false ? " (" + getTerm("equipment") + ")" : ""
        }`,
      ],
      [getTerm("rarity"), item.rarity],
    ];

    // Add effect info if it exists
    if (item.effect) {
      rows.push([getTerm("effect"), item.effect]);
    }

    // Add damage for weapons
    if (item.type === "weapon" && item.damage) {
      rows.push([getTerm("damage"), chalk.red(item.damage.toString())]);
    }

    // Add defense for armor
    if (item.type === "armor" && item.defense) {
      rows.push([getTerm("defense"), chalk.blue(item.defense.toString())]);
    }

    // Add value if present
    if (item.value) {
      rows.push([getTerm("value"), `${item.value} ${getTerm("gold")}`]);
    }

    // Add stat bonuses if present - match format used in displayInventory
    if (item.stats) {
      const statBonuses = Object.entries(item.stats)
        .filter(([_, value]) => value && value > 0)
        .map(([stat, value]) => `${stat}: +${value}`)
        .join(", ");

      if (statBonuses) {
        rows.push([getTerm("statBonuses"), chalk.cyan(statBonuses)]);
      }
    }
    return rows;
  });

  // Create multi-table layout
  const multiTable = alignTextAsMultiTable(inventoryItems, " | ");

  // Add a title above the table
  const title = chalk.bold(`=== ${getTerm("inventory")} ===\n\n`);

  // Create the boxed display with the title and inventory table
  const finalDisplay = boxItUp(primaryColor(title + multiTable.text));

  // Overlay the display on the room background
  const overlayedOnRoom = getTextOnBackground(finalDisplay);

  console.log(overlayedOnRoom);
  await pressEnter({ allowLeft: true });
}
