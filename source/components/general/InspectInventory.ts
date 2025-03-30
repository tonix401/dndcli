import ICharacter from "@utilities/ICharacter.js";
import { getTerm } from "@utilities/LanguageService.js";
import {
  alignTextAsMultiTable,
  boxItUp,
  getTextOnBackground,
  pressEnter,
  primaryColor,
  secondaryColor,
  accentColor,
  errorColor,
  totalClear,
  navigationPrompt,
} from "@utilities/ConsoleService.js";
import { getDataFromFile } from "@utilities/StorageService.js";
import Config from "@utilities/Config.js";
import { getErrorMessage } from "@resources/generalScreens/errorMessage.js";
import chalk from "chalk";

/**
 * Display a detailed view of the character's inventory with pagination
 *
 * Features:
 * - Shows one item per page to prevent overflow in the room background
 * - Displays item properties with appropriate formatting and colors
 * - Indicates equipped items with ★ next to their name
 * - Indicates consumable items explicitly in their type field
 * - Supports navigation with arrow keys or number keys
 */
export async function inspectInventory() {
  totalClear();
  const charData: ICharacter =
    getDataFromFile("character") ?? Config.START_CHARACTER;

  // Handle cases where character data doesn't exist or inventory is empty
  if (!charData) {
    console.log(getErrorMessage(getTerm("noCharacter")));
    await pressEnter({ allowLeft: true });
    return;
  }

  if (!charData.inventory || charData.inventory.length === 0) {
    console.log(getErrorMessage(getTerm("empty")));
    await pressEnter();
    return;
  }

  // Helper function to truncate text
  function truncateText(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  // Check if an item is currently equipped
  const isItemEquipped = (itemName: string) => {
    if (!charData.equippedItems) return false;
    return charData.equippedItems.some((equip) => equip.name === itemName);
  };

  // Format all inventory items with their properties
  const formattedItems = charData.inventory.map((item) => {
    // Start with basic properties every item has
    const rows: [string, string][] = [
      [
        getTerm("name"),
        `${truncateText(item.name, 20)} (x${item.quantity})${
          isItemEquipped(item.name) ? " " + accentColor("★") : ""
        }`,
      ],
      [getTerm("description"), truncateText(item.description, 40)],
      [
        getTerm("type"),
        `${item.type || getTerm("unknown")}${
          item.consumable ? ` (${getTerm("consumable")})` : ""
        }`,
      ],
    ];

    // Add weapon-specific stats
    if (item.type === "weapon" && item.damage) {
      rows.push([getTerm("damage"), errorColor(item.damage.toString())]);
    }

    // Add armor-specific stats
    if (item.type === "armor" && item.defense) {
      rows.push([getTerm("defense"), primaryColor(item.defense.toString())]);
    }

    // Add stat bonuses if present
    if (item.stats) {
      const statBonuses = Object.entries(item.stats)
        .filter(([_, value]) => value && value > 0)
        .map(([stat, value]) => `${stat}: +${value}`)
        .join(", ");

      if (statBonuses) {
        rows.push([
          getTerm("statBonuses"),
          accentColor(truncateText(statBonuses, 20)),
        ]);
      }
    }

    // Add value if present
    if (item.value) {
      rows.push([
        getTerm("value"),
        secondaryColor(`${item.value} ${getTerm("gold")}`),
      ]);
    }

    // Add effect info if it exists
    if (item.effect) {
      rows.push([getTerm("effect"), truncateText(item.effect, 30)]);
    }

    return rows;
  });

  // Pagination setup - one item per page to prevent UI overflow
  const ITEMS_PER_PAGE = 1;
  let currentPage = 0;
  const totalPages = Math.ceil(formattedItems.length / ITEMS_PER_PAGE);

  // Main display loop
  while (true) {
    totalClear();

    // Get items for the current page
    const startIdx = currentPage * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, formattedItems.length);
    const currentPageItems = formattedItems.slice(startIdx, endIdx);

    // Create multi-table layout for current page items
    const multiTable = alignTextAsMultiTable(currentPageItems, " | ");

    // Create the page indicator
    const pageIndicator = secondaryColor(
      `\n${getTerm("page")} ${currentPage + 1}/${totalPages}`
    );

    // Add a title above the table
    const title = chalk.bold(`=== ${getTerm("inventory")} ===\n\n`);

    // Create simple legend for the star symbol
    const legendText = `${accentColor("★")} = ${getTerm("equipped")}`;

    // Create navigation menu options
    let navigationOptions = "";
    if (totalPages > 1) {
      const prevPageText =
        currentPage > 0
          ? accentColor(`[1] ${getTerm("previousPage")}`)
          : chalk.gray(`[1] ${getTerm("previousPage")}`);

      const nextPageText =
        currentPage < totalPages - 1
          ? accentColor(`[2] ${getTerm("nextPage")}`)
          : chalk.gray(`[2] ${getTerm("nextPage")}`);

      const exitText = accentColor(`[0] ${getTerm("exit")}`);
      navigationOptions = `\n\n${prevPageText}  |  ${nextPageText}  |  ${exitText}`;
    }

    // Create the boxed display with all components
    const finalDisplay = boxItUp(
      primaryColor(
        title +
          multiTable.text +
          pageIndicator +
          "\n\n" +
          legendText +
          navigationOptions
      )
    );

    // Overlay the display on the room background
    const overlayedOnRoom = getTextOnBackground(finalDisplay);

    console.log(overlayedOnRoom);

    // If only one page, exit on any key press
    if (totalPages <= 1) {
      await pressEnter();
      break;
    }

    // Input handling - supports both number keys and arrow keys
    const userInput = await navigationPrompt({ message: "" });

    // Navigation logic remains the same
    if (
      (userInput === "1" || userInput === "left" || userInput === "up") &&
      currentPage > 0
    ) {
      // Previous page
      currentPage--;
    } else if (
      (userInput === "2" || userInput === "right" || userInput === "down") &&
      currentPage < totalPages - 1
    ) {
      // Next page
      currentPage++;
    } else if (
      userInput === "0" ||
      userInput === "enter" ||
      userInput === "escape"
    ) {
      // Exit inventory view
      break;
    }
  }
}
