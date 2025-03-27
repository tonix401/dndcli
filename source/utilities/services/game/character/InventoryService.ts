/**
 *
 * A comprehensive service for managing the player's inventory and equipment.
 * providing a unified interface for item management, equipment handling, and stat calculations.
 *
 * Key features:
 * - Inventory management with capacity limits and item stacking
 * - Equipment system with stat bonuses from equipped items
 * - Interactive UI for inventory navigation
 * - Consumable item effects for both combat and exploration
 * - Starting item generation based on character class
 * - Loot generation system
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { IItem } from "@utilities/IITem.js";
import ICharacter from "@utilities/ICharacter.js";
import { saveDataToFile, getDataFromFile } from "@core/StorageService.js";
import { generateRandomItem } from "@game/character/ItemGenerator.js";
import { getTerm } from "@core/LanguageService.js";

/**
 * Constants for inventory management
 */
export const INVENTORY_CAPACITY = 20; // Maximum number of unique items a character can carry

/**
 * Returns starting items and automatically equips default class items.
 * Equipment includes damage/defense stats and stat bonuses appropriate for each class.
 *
 * @param characterClass - The character's class (e.g., "mage", "swordsman")
 * @returns An object with both inventory items and initially equipped items
 */
export function getStartingItems(characterClass: string): {
  inventory: IItem[];
  equipped: IItem[];
} {
  const inventory: IItem[] = [];
  const equipped: IItem[] = [];

  if (characterClass.toLowerCase() === "mage") {
    // Wooden Staff (weapon)
    const staff: IItem = {
      id: "item1",
      name: "Wooden Staff",
      description: "A basic staff for magical focus.",
      effect: "",
      rarity: "Common",
      quantity: 1,
      consumable: false,
      type: "weapon",
      damage: 3, // Base damage for mage weapon
      stats: {
        mana: 2, // Bonus mana from staff
      },
    };
    inventory.push({ ...staff }); // Add copy to inventory
    equipped.push(staff); // Add original to equipped

    // Cloth Robe (armor)
    const robe: IItem = {
      id: "item2",
      name: "Cloth Robe",
      description: "A simple robe offering little protection.",
      effect: "",
      rarity: "Common",
      quantity: 1,
      consumable: false,
      type: "armor",
      defense: 1, // Small defense bonus
      stats: {
        mana: 3, // Bonus mana from robe
      },
    };
    inventory.push({ ...robe });
    equipped.push(robe);

    // Starting consumables
    inventory.push({
      id: "item3",
      name: "Mana Potion",
      description: "Restores 10 mana.",
      effect: "restoreMana",
      rarity: "Common",
      quantity: 2,
      consumable: true,
    });
  } else if (characterClass.toLowerCase() === "swordsman") {
    // Basic Sword (weapon)
    const sword: IItem = {
      id: "item1",
      name: "Basic Sword",
      description: "A rusty sword that still cuts.",
      effect: "",
      rarity: "Common",
      quantity: 1,
      consumable: false,
      type: "weapon",
      damage: 5, // Higher base damage for swordsman
      stats: {
        strength: 1, // Small strength bonus
      },
    };
    inventory.push({ ...sword });
    equipped.push(sword);

    // Leather Armor (armor)
    const armor: IItem = {
      id: "item2",
      name: "Leather Armor",
      description: "Provides minimal protection.",
      effect: "",
      rarity: "Common",
      quantity: 1,
      consumable: false,
      type: "armor",
      defense: 3, // Better defense than mage robe
      stats: {
        maxhp: 5, // Small HP bonus
      },
    };
    inventory.push({ ...armor });
    equipped.push(armor);

    // Starting consumables
    inventory.push({
      id: "item3",
      name: "Healing Potion",
      description: "Restores 10 HP.",
      effect: "restoreHP",
      rarity: "Common",
      quantity: 2,
      consumable: true,
    });
  } else {
    // Default equipment for other classes
    // Dagger (weapon)
    const dagger: IItem = {
      id: "item1",
      name: "Old Dagger",
      description: "A basic dagger.",
      effect: "",
      rarity: "Common",
      quantity: 1,
      consumable: false,
      type: "weapon",
      damage: 2, // Low damage
      stats: {
        dexterity: 1, // Small dexterity bonus
      },
    };
    inventory.push({ ...dagger });
    equipped.push(dagger);

    // Starting consumables
    inventory.push({
      id: "item2",
      name: "Healing Potion",
      description: "Restores 10 HP.",
      effect: "restoreHP",
      rarity: "Common",
      quantity: 1,
      consumable: true,
    });
  }

  return { inventory, equipped };
}

/**
 * Helper function to get multiplier based on item rarity
 * This is used to scale item effects based on their rarity
 *
 * @param rarity - The rarity level of the item
 * @returns A numeric multiplier value
 */
export function getRarityMultiplier(rarity: IItem["rarity"]): number {
  switch (rarity) {
    case "Common":
      return 1;
    case "Uncommon":
      return 1.5;
    case "Rare":
      return 2;
    case "Epic":
      return 3;
    case "Legendary":
      return 5;
    default:
      return 1;
  }
}

/**
 * Centralized handlers for item effects
 * These work both in and out of combat with consistent behavior
 * Each handler returns an object with success status and message
 */
export const itemEffectHandlers: {
  [key in Exclude<IItem["effect"], "">]: (
    character: ICharacter,
    item: IItem,
    inCombat?: boolean
  ) => Promise<{ success: boolean; message: string }>;
} = {
  /**
   * Restores HP based on item rarity
   */
  restoreHP: async (character, item) => {
    // Calculate restoration amount based on item rarity and level
    const rarityMultiplier = getRarityMultiplier(item.rarity);
    const restoreAmount = Math.floor(10 * rarityMultiplier);

    // Apply the effect
    character.hp = Math.min(
      character.hp + restoreAmount,
      character.abilities.maxhp
    );

    return {
      success: true,
      message: `You used ${item.name} and restored ${restoreAmount} HP.`,
    };
  },

  /**
   * Restores mana based on item rarity
   */
  restoreMana: async (character, item) => {
    const rarityMultiplier = getRarityMultiplier(item.rarity);
    const restoreAmount = Math.floor(10 * rarityMultiplier);

    // Ensure the character has a mana property
    if (!character.abilities.mana) {
      return {
        success: false,
        message: "You don't have mana abilities to restore.",
      };
    }

    character.abilities.mana = Math.min(
      character.abilities.mana + restoreAmount,
      character.abilities.mana // Max mana should be stored somewhere
    );

    return {
      success: true,
      message: `You used ${item.name} and restored ${restoreAmount} Mana.`,
    };
  },

  /**
   * Temporarily boosts strength (more in combat, less but permanent outside)
   */
  boostStrength: async (character, item, inCombat = false) => {
    const rarityMultiplier = getRarityMultiplier(item.rarity);
    const boostAmount = Math.floor(2 * rarityMultiplier);

    // For combat, apply a temporary buff
    if (inCombat) {
      character.tempStrengthBuff =
        (character.tempStrengthBuff || 0) + boostAmount;
      return {
        success: true,
        message: `You feel a surge of strength! +${boostAmount} strength for this battle.`,
      };
    }

    // Outside combat, give a longer-lasting but smaller effect
    character.abilities.strength += Math.ceil(boostAmount / 2);
    return {
      success: true,
      message: `Your muscles swell with newfound power. +${Math.ceil(
        boostAmount / 2
      )} to strength.`,
    };
  },

  /**
   * Temporarily boosts dexterity (more in combat, less but permanent outside)
   */
  boostDexterity: async (character, item, inCombat = false) => {
    const rarityMultiplier = getRarityMultiplier(item.rarity);
    const boostAmount = Math.floor(2 * rarityMultiplier);

    if (inCombat) {
      // Add a temporary buff property if needed
      character.tempDexterityBuff =
        (character.tempDexterityBuff || 0) + boostAmount;
      return {
        success: true,
        message: `You feel more agile! +${boostAmount} dexterity for this battle.`,
      };
    }

    character.abilities.dexterity += Math.ceil(boostAmount / 2);
    return {
      success: true,
      message: `Your movements become more fluid. +${Math.ceil(
        boostAmount / 2
      )} to dexterity.`,
    };
  },

  // Additional effect handlers can be added here...
};

/**
 * Add item to inventory with stacking and capacity management
 * Stacks identical items to save inventory slots
 *
 * @param character - The character to add the item to
 * @param newItem - The item to be added
 * @returns Boolean indicating success or failure (full inventory)
 */
export function addItemToInventory(
  character: ICharacter,
  newItem: IItem
): boolean {
  if (!character.inventory) {
    character.inventory = [];
  }

  // Check if a similar item exists to stack it
  const existingItemIndex = character.inventory.findIndex(
    (item) => item.name === newItem.name && item.rarity === newItem.rarity
  );

  if (existingItemIndex >= 0) {
    // Stack with existing item
    character.inventory[existingItemIndex].quantity += newItem.quantity;
    return true;
  }

  // Check inventory capacity before adding
  if (character.inventory.length >= INVENTORY_CAPACITY) {
    return false; // Inventory is full
  }

  // Add as new item
  character.inventory.push(newItem);
  return true;
}

/**
 * Get stat bonuses from equipped items
 * Calculates all benefits provided by equipped gear
 *
 * @param character - The character whose equipment is analyzed
 * @returns Object containing total bonuses for each stat
 */
export function getEquippedStatBonuses(
  character: ICharacter
): Record<string, number> {
  // Initialize with zero values for all possible stats
  const bonuses: Record<string, number> = {
    strength: 0,
    dexterity: 0,
    charisma: 0,
    luck: 0,
    maxhp: 0,
    mana: 0,
    damage: 0,
    defense: 0,
  };

  if (!character.equippedItems || character.equippedItems.length === 0) {
    return bonuses;
  }

  // Add up all stat bonuses from equipped items
  for (const item of character.equippedItems) {
    // Add stats bonuses
    if (item.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (value && bonuses.hasOwnProperty(stat)) {
          bonuses[stat] += value;
        }
      });
    }

    // Add weapon damage and armor defense
    if (item.type === "weapon" && item.damage) {
      bonuses.damage += item.damage;
    } else if (item.type === "armor" && item.defense) {
      bonuses.defense += item.defense;
    }
  }

  return bonuses;
}

/**
 * Equip an item to the character
 * Replaces any item in the same slot
 *
 * @param character - The character equipping the item
 * @param itemIndex - The index of the item in character's inventory
 * @returns Object with success status and message
 */
export function equipItem(
  character: ICharacter,
  itemIndex: number
): { success: boolean; message: string } {
  if (!character.inventory || itemIndex >= character.inventory.length) {
    return { success: false, message: "Invalid item selection." };
  }

  const item = character.inventory[itemIndex];

  // Check if item is equipment
  if (
    item.consumable !== false ||
    !item.type ||
    (item.type !== "weapon" && item.type !== "armor")
  ) {
    return { success: false, message: "This item cannot be equipped." };
  }

  // Initialize equipment array if needed
  if (!character.equippedItems) {
    character.equippedItems = [];
  }

  // Check if we need to unequip something in the same slot
  const existingEquipped = character.equippedItems.findIndex(
    (equip) => equip.type === item.type
  );

  if (existingEquipped >= 0) {
    character.equippedItems.splice(existingEquipped, 1);
  }

  // Add the new item to equipped items
  character.equippedItems.push(item);

  // Save the character
  saveDataToFile("character", character);

  return { success: true, message: `${item.name} has been equipped.` };
}

/**
 * Use an item outside of combat
 * Applies the item's effect and consumes it if successful
 *
 * @param character - The character using the item
 * @param itemIndex - The index of the item in character's inventory
 * @returns Promise with success status and result message
 */
export async function useItem(
  character: ICharacter,
  itemIndex: number
): Promise<{ success: boolean; message: string }> {
  if (!character.inventory || itemIndex >= character.inventory.length) {
    return { success: false, message: "Invalid item selection." };
  }

  const item = character.inventory[itemIndex];

  // Handle non-consumable items
  if (item.consumable === false || item.effect === "") {
    return {
      success: false,
      message: `${item.name} is equipment and cannot be consumed.`,
    };
  }

  // Get the appropriate effect handler
  const effectHandler =
    itemEffectHandlers[item.effect as Exclude<IItem["effect"], "">];
  if (!effectHandler) {
    return {
      success: false,
      message: `You try to use ${item.name}, but nothing happens.`,
    };
  }

  // Apply the item effect
  const result = await effectHandler(character, item, false);

  // Consume the item if it was used successfully
  if (result.success) {
    item.quantity--;
    if (item.quantity <= 0) {
      character.inventory.splice(itemIndex, 1);
    }

    // Save the updated character
    saveDataToFile("character", character);
  }

  return result;
}

/**
 * Checks if an item is currently equipped by the character
 *<
 * @param character - The character to check
 * @param item - The item to check if equipped
 * @returns Boolean indicating if the item is equipped
 */
export function isItemEquipped(character: ICharacter, item: IItem): boolean {
  if (!character.equippedItems || character.equippedItems.length === 0) {
    return false;
  }

  return character.equippedItems.some(
    (equippedItem) => equippedItem.id === item.id
  );
}

/**
 * Displays a dedicated inventory menu and processes the selected item.
 * Consumable items (with a defined effect) are processed; equipment items are offered to equip.
 *
 * @param character - The character whose inventory to display
 * @param inCombat - Whether this menu is being accessed during combat
 * @returns Promise that resolves when the inventory interaction is complete
 */
export async function inventoryMenu(
  character: ICharacter,
  inCombat: boolean = false
): Promise<void> {
  // Check if inventory is empty
  if (
    !character.inventory ||
    !Array.isArray(character.inventory) ||
    character.inventory.length === 0
  ) {
    console.log(chalk.redBright("Your inventory is empty."));
    return;
  }

  const { themedSelect } = await import("@ui/MenuService.js");

  // Build the list of inventory choices with color coding and stat information
  const inventoryChoices = character.inventory.map(
    (item: IItem, index: number) => {
      // For combat, we only want to show usable items
      if (inCombat && (item.consumable === false || item.effect === "")) {
        return {
          name: `${chalk.bold(item.name)} (x${item.quantity}) - ${
            item.description
          } ${chalk.gray("(Cannot use in combat)")}`,
          value: index,
          disabled: true, // This makes the item unselectable in combat
        };
      }

      // Show damage/defense stats for equipment
      let statsInfo = "";
      if (item.type === "weapon" && item.damage) {
        statsInfo = chalk.red(` [DMG: ${item.damage}]`);
      } else if (item.type === "armor" && item.defense) {
        statsInfo = chalk.blue(` [DEF: ${item.defense}]`);
      }

      // Check if the item is equipment and show equipped status
      let usability = "";
      if (item.consumable === false || item.effect === "") {
        const equipped = isItemEquipped(character, item);
        usability = equipped
          ? chalk.green("(Equipped)") + statsInfo
          : chalk.gray("(Unequipped)") + statsInfo;
      }

      return {
        name: `${chalk.bold(item.name)} (x${item.quantity}) - ${
          item.description
        } ${usability}`,
        value: index,
      };
    }
  );

  // Add back option with context-aware text
  const backText = inCombat ? "🔙 Back to combat" : "🔙 Back to menu";
  inventoryChoices.push({ name: backText, value: -1 });

  // Use our themed select component for consistency
  const selectedItemIndex = Number(
    await themedSelect({
      message: "Select an item to use:",
      choices: inventoryChoices,
    })
  );

  // Handle back selection
  if (selectedItemIndex === -1) return;

  const selectedItem: IItem = character.inventory[selectedItemIndex];

  // Check if the item is consumable
  if (selectedItem.effect === "" || selectedItem.consumable === false) {
    // If equipment, offer to equip it
    if (selectedItem.type === "weapon" || selectedItem.type === "armor") {
      const { confirm } = await import("@inquirer/prompts");
      const shouldEquip = await confirm({
        message: `Do you want to equip ${selectedItem.name}?`,
        default: true,
      });

      if (shouldEquip) {
        const result = equipItem(character, selectedItemIndex);
        console.log(chalk.greenBright(result.message));
      }
      return;
    }

    console.log(
      chalk.yellowBright(
        `You cannot use ${selectedItem.name} directly. Consider equipping it instead.`
      )
    );
    return;
  }

  // Process the item through the unified item system
  const result = await useItem(character, selectedItemIndex);
  console.log(
    chalk[result.success ? "greenBright" : "yellowBright"](result.message)
  );
}

/**
 * Displays a brief inventory overview in the console
 * Shows both carried items and equipped gear with stats
 *
 * @param character - The character whose inventory to display
 */
export function displayInventory(character: ICharacter): void {
  console.log(chalk.whiteBright.bold("=== Inventory ==="));
  if (!character.inventory || character.inventory.length === 0) {
    console.log(chalk.gray("(empty)"));
  } else {
    character.inventory.forEach((item: IItem, idx: number) => {
      // Show damage/defense stats for equipment
      let statsInfo = "";
      if (item.type === "weapon" && item.damage) {
        statsInfo = chalk.red(` [DMG: ${item.damage}]`);
      } else if (item.type === "armor" && item.defense) {
        statsInfo = chalk.blue(` [DEF: ${item.defense}]`);
      }

      // Add equipped status indicator
      const equippedStatus = isItemEquipped(character, item)
        ? chalk.green(" [E]")
        : "";

      console.log(
        chalk.white(
          `${idx + 1}. ${item.name} (x${
            item.quantity
          })${statsInfo}${equippedStatus}`
        )
      );
    });
  }

  // Display equipped items
  if (character.equippedItems && character.equippedItems.length > 0) {
    console.log(chalk.whiteBright.bold("\n=== Equipped ==="));
    character.equippedItems.forEach((item: IItem) => {
      let statsInfo = "";
      if (item.type === "weapon" && item.damage) {
        statsInfo = chalk.red(` [DMG: ${item.damage}]`);
      } else if (item.type === "armor" && item.defense) {
        statsInfo = chalk.blue(` [DEF: ${item.defense}]`);
      }

      // Display additional stat bonuses if present
      let bonusInfo = "";
      if (item.stats) {
        const bonuses = Object.entries(item.stats)
          .filter(([_, value]) => value && value > 0)
          .map(([stat, value]) => `${stat}: +${value}`)
          .join(", ");

        if (bonuses) {
          bonusInfo = chalk.cyan(` (${bonuses})`);
        }
      }

      console.log(chalk.green(`→ ${item.name}${statsInfo}${bonusInfo}`));
    });
  }

  console.log(chalk.whiteBright("=================\n"));
}

/**
 * Generate a random loot drop based on player level and difficulty
 * Higher difficulty means better chance of items and potentially higher level items
 *
 * @param playerLevel - Current level of the player
 * @param difficultyMultiplier - Difficulty multiplier affecting drop rates
 * @returns Array of generated item objects
 */
export function generateLootDrop(
  playerLevel: number,
  difficultyMultiplier: number = 1.0
): IItem[] {
  const lootTable: IItem[] = [];

  // Base chance of getting an item
  const itemChance = 0.6 * difficultyMultiplier;

  if (Math.random() < itemChance) {
    lootTable.push(generateRandomItem(playerLevel));
  }

  // Chance for bonus items on higher difficulty
  if (difficultyMultiplier > 1.2 && Math.random() < 0.3) {
    lootTable.push(generateRandomItem(playerLevel + 1));
  }

  return lootTable;
}

/**
 * Calculate total combat stats including equipment bonuses
 * Use in combat calculations to apply all relevant bonuses
 *
 * @param character - The character to calculate combat stats for
 * @returns Object containing final combat stats with all bonuses applied
 */
export function getCombatStats(character: ICharacter) {
  const equipBonuses = getEquippedStatBonuses(character);

  return {
    strength:
      character.abilities.strength +
      (equipBonuses.strength || 0) +
      (character.tempStrengthBuff || 0),
    dexterity:
      character.abilities.dexterity +
      (equipBonuses.dexterity || 0) +
      (character.tempDexterityBuff || 0),
    maxhp: character.abilities.maxhp + (equipBonuses.maxhp || 0),
    damage: equipBonuses.damage || 0,
    defense: equipBonuses.defense || 0,
    mana: character.abilities.mana + (equipBonuses.mana || 0),
  };
}
