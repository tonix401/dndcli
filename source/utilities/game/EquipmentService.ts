import { IItem } from "@utilities/IITem.js";
import ICharacter from "@utilities/ICharacter.js";
import { saveDataToFile } from "@utilities/StorageService.js";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { pressEnter, primaryColor, secondaryColor } from "@utilities/ConsoleService.js";

/**
 * Check if an item can be equipped
 */
export function canEquipItem(item: IItem): boolean {
  return (
    item.type === "weapon" ||
    item.type === "armor" ||
    (item.consumable === false && item.effect === "")
  );
}

/**
 * Get total stat bonuses from equipped items
 */
export function getEquippedStatBonuses(character: ICharacter): {
  [key: string]: number;
} {
  const bonuses: { [key: string]: number } = {
    strength: 0,
    dexterity: 0,
    charisma: 0,
    luck: 0,
    maxhp: 0,
    mana: 0,
  };

  if (!character.equippedItems) return bonuses;

  for (const item of character.equippedItems) {
    if (item.stats) {
      for (const [stat, value] of Object.entries(item.stats)) {
        if (bonuses[stat] !== undefined) {
          bonuses[stat] += value;
        }
      }
    }
  }

  return bonuses;
}

/**
 * Equip an item from inventory
 */
export async function equipItem(
  character: ICharacter,
  itemIndex: number
): Promise<{ success: boolean; message: string }> {
  if (!character.inventory || itemIndex >= character.inventory.length) {
    return { success: false, message: "Invalid item selection." };
  }

  const item = character.inventory[itemIndex];

  // Check if the item is equipment
  if (!canEquipItem(item)) {
    return {
      success: false,
      message: `${item.name} cannot be equipped.`,
    };
  }

  // Check level requirement
  if (item.requiredLevel && character.level < item.requiredLevel) {
    return {
      success: false,
      message: `You need to be level ${item.requiredLevel} to equip this item.`,
    };
  }

  // Initialize equipped items if it doesn't exist
  if (!character.equippedItems) {
    character.equippedItems = [];
  }

  // Add to equipped items (simple implementation - no slot restrictions)
  character.equippedItems.push(item);

  // Remove from inventory
  character.inventory.splice(itemIndex, 1);

  // Save character data
  saveDataToFile("character", character);

  return {
    success: true,
    message: `Equipped ${item.name}.`,
  };
}

/**
 * Unequip an item and return it to inventory
 */
export async function unequipItem(
  character: ICharacter,
  equipIndex: number
): Promise<{ success: boolean; message: string }> {
  if (
    !character.equippedItems ||
    equipIndex >= character.equippedItems.length
  ) {
    return { success: false, message: "Invalid equipment selection." };
  }

  const item = character.equippedItems[equipIndex];

  // Initialize inventory if it doesn't exist
  if (!character.inventory) {
    character.inventory = [];
  }

  // Add item back to inventory
  character.inventory.push(item);

  // Remove from equipped items
  character.equippedItems.splice(equipIndex, 1);

  // Save character data
  saveDataToFile("character", character);

  return {
    success: true,
    message: `Unequipped ${item.name} and placed it in your inventory.`,
  };
}

/**
 * Show equipment management interface
 */
export async function showEquipmentMenu(character: ICharacter): Promise<void> {
  while (true) {
    // Display current equipped items
    console.log(primaryColor("\n=== EQUIPPED ITEMS ==="));

    if (!character.equippedItems || character.equippedItems.length === 0) {
      console.log(secondaryColor("No items equipped."));
    } else {
      character.equippedItems.forEach((item, index) => {
        console.log(
          primaryColor(`${index + 1}. ${item.name} - ${item.description}`)
        );
      });
    }

    console.log(primaryColor("\n=== EQUIPMENT MENU ==="));

    const options = [
      { name: "Equip an Item", value: "equip" },
      { name: "Unequip an Item", value: "unequip" },
      { name: "Return", value: "return" },
    ];

    const choice = await themedSelectInRoom({
      message: "What would you like to do?",
      choices: options,
    });

    if (choice === "return") {
      return;
    }

    if (choice === "equip") {
      // Show inventory items that can be equipped
      const equipChoices = character.inventory
        .map((item, index) => {
          if (canEquipItem(item)) {
            return {
              name: `${item.name} - ${item.description}`,
              value: index,
            };
          }
          return null;
        })
        .filter(
          (choice): choice is { name: string; value: number } => choice !== null
        );

      if (equipChoices.length === 0) {
        console.log(
          secondaryColor("\nYou don't have any items that can be equipped.")
        );
        await pressEnter();
        continue;
      }

      equipChoices.push({ name: "Cancel", value: -1 });

      const selectedIndex = await themedSelectInRoom({
        message: "Choose an item to equip:",
        choices: equipChoices,
      });

      if (selectedIndex === -1) continue;

      const result = await equipItem(character, selectedIndex);
      console.log(
        result.success
          ? primaryColor(`\n${result.message}`)
          : secondaryColor(`\n${result.message}`)
      );
      await pressEnter();
    }

    if (choice === "unequip") {
      if (!character.equippedItems || character.equippedItems.length === 0) {
        console.log(
          secondaryColor("\nYou don't have any equipped items to unequip.")
        );
        await pressEnter();
        continue;
      }

      const unequipChoices = character.equippedItems.map((item, index) => {
        return {
          name: `${item.name} - ${item.description}`,
          value: index,
        };
      });

      unequipChoices.push({ name: "Cancel", value: -1 });

      const selectedIndex = await themedSelectInRoom({
        message: "Choose an item to unequip:",
        choices: unequipChoices,
      });

      if (selectedIndex === -1) continue;

      const result = await unequipItem(character, selectedIndex);
      console.log(
        result.success
          ? primaryColor(`\n${result.message}`)
          : secondaryColor(`\n${result.message}`)
      );
      await pressEnter();
    }
  }
}
