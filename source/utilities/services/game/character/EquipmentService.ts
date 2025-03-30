import { IItem } from "@utilities/IITem.js";
import ICharacter from "@utilities/ICharacter.js";
import { saveDataToFile } from "@utilities/StorageService.js";
import { primaryColor, secondaryColor } from "@utilities/ConsoleService.js";
import { themedSelectInRoom } from "components/GeneralTEMP/ThemedSelectInRoom.js";
import { pressEnter } from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";

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
    return { success: false, message: getTerm("invalidItemSelection") };
  }

  const item = character.inventory[itemIndex];

  // Check if the item is equipment
  if (!canEquipItem(item)) {
    return {
      success: false,
      message: getTerm("cannotEquipItem").replace("{name}", item.name),
    };
  }

  // Check level requirement
  if (item.requiredLevel && character.level < item.requiredLevel) {
    return {
      success: false,
      message: getTerm("levelRequirementEquip").replace(
        "{level}",
        item.requiredLevel.toString()
      ),
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
    message: getTerm("itemEquipped").replace("{name}", item.name),
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
    return { success: false, message: getTerm("invalidEquipmentSelection") };
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
    message: getTerm("itemUnequipped").replace("{name}", item.name),
  };
}

/**
 * Show equipment management interface
 */
export async function showEquipmentMenu(character: ICharacter): Promise<void> {
  while (true) {
    // Display current equipped items
    console.log(primaryColor(`\n=== ${getTerm("equippedItems")} ===`));

    if (!character.equippedItems || character.equippedItems.length === 0) {
      console.log(secondaryColor(getTerm("noItemsEquipped")));
    } else {
      character.equippedItems.forEach((item, index) => {
        console.log(
          primaryColor(`${index + 1}. ${item.name} - ${item.description}`)
        );
      });
    }

    console.log(primaryColor(`\n=== ${getTerm("equipmentMenu")} ===`));

    const options = [
      { name: getTerm("equipItem"), value: "equip" },
      { name: getTerm("unequipItem"), value: "unequip" },
      { name: getTerm("return"), value: "return" },
    ];

    const choice = await themedSelectInRoom({
      message: getTerm("whatWouldYouLikeToDo"),
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
        console.log(secondaryColor(`\n${getTerm("noEquippableItems")}`));
        await pressEnter();
        continue;
      }

      equipChoices.push({ name: getTerm("cancel"), value: -1 });

      const selectedIndex = await themedSelectInRoom({
        message: getTerm("chooseItemToEquip"),
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
        console.log(secondaryColor(`\n${getTerm("noItemsToUnequip")}`));
        await pressEnter();
        continue;
      }

      const unequipChoices = character.equippedItems.map((item, index) => {
        return {
          name: `${item.name} - ${item.description}`,
          value: index,
        };
      });

      unequipChoices.push({ name: getTerm("cancel"), value: -1 });

      const selectedIndex = await themedSelectInRoom({
        message: getTerm("chooseItemToUnequip"),
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
