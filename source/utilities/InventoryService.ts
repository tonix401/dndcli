import chalk from "chalk";
import inquirer from "inquirer";
import { IItem } from "types/IITem.js";

/**
 * Returns starting items based on the character class.
 * Notice that consumable items (which can be used in combat) are flagged.
 */
export function getStartingItems(characterClass: string): IItem[] {
  if (characterClass.toLowerCase() === "mage") {
    return [
      {
        id: "item1",
        name: "Wooden Staff",
        description: "A basic staff for magical focus.",
        effect: "",
        rarity: "Common",
        quantity: 1,
        consumable: false, // equipment
      },
      {
        id: "item2",
        name: "Cloth Robe",
        description: "A simple robe offering little protection.",
        effect: "",
        rarity: "Common",
        quantity: 1,
        consumable: false, // equipment
      },
      {
        id: "item3",
        name: "Mana Potion",
        description: "Restores 10 mana.",
        effect: "restoreMana",
        rarity: "Common",
        quantity: 2,
        consumable: true, // can be used in combat
      },
    ];
  } else if (characterClass.toLowerCase() === "swordsman") {
    return [
      {
        id: "item1",
        name: "Basic Sword",
        description: "A rusty sword that still cuts.",
        effect: "",
        rarity: "Common",
        quantity: 1,
        consumable: false,
      },
      {
        id: "item2",
        name: "Leather Armor",
        description: "Provides minimal protection.",
        effect: "",
        rarity: "Common",
        quantity: 1,
        consumable: false,
      },
      {
        id: "item3",
        name: "Healing Potion",
        description: "Restores 10 HP.",
        effect: "restoreHP",
        rarity: "Common",
        quantity: 2,
        consumable: true,
      },
    ];
  }
  // Default items if character class doesn't match
  return [
    {
      id: "item1",
      name: "Old Dagger",
      description: "A basic dagger.",
      effect: "",
      rarity: "Common",
      quantity: 1,
      consumable: false,
    },
    {
      id: "item2",
      name: "Healing Potion",
      description: "Restores 10 HP.",
      effect: "restoreHP",
      rarity: "Common",
      quantity: 1,
      consumable: true,
    },
  ];
}

/**
 * Item effect handlers.
 * Each function takes the character and item as parameters and applies the effect.
 */
const itemEffectHandlers: {
  [key in Exclude<IItem["effect"], "">]?: (
    character: any,
    item: IItem
  ) => Promise<void>;
} = {
  restoreHP: async (character, item) => {
    const restoreAmount = 10; // You can also make this dynamic.
    character.hp = Math.min(
      character.hp + restoreAmount,
      character.abilities.maxhp
    );
    console.log(
      chalk.greenBright(
        `You used ${item.name} and restored ${restoreAmount} HP.`
      )
    );
  },
  restoreMana: async (character, item) => {
    const restoreAmount = 10;
    character.mana = Math.min(
      character.mana + restoreAmount,
      character.abilities.mana
    );
    console.log(
      chalk.greenBright(
        `You used ${item.name} and restored ${restoreAmount} Mana.`
      )
    );
  },
  // Add additional effect handlers as needed (for boostStrength, etc.)
};

/**
 * Displays a dedicated inventory menu and processes the selected item.
 * Consumable items (with a defined effect) are processed; equipment items are not usable in combat.
 */
export async function inventoryMenu(character: any): Promise<void> {
  if (
    !character.inventory ||
    !Array.isArray(character.inventory) ||
    character.inventory.length === 0
  ) {
    console.log(chalk.redBright("Your inventory is empty."));
    return;
  }

  // Build the list of inventory choices. We mark equipment with a gray label.
  const inventoryChoices = character.inventory.map(
    (item: IItem, index: number) => {
      const usability =
        item.consumable === false || item.effect === ""
          ? chalk.gray("(Equipment)")
          : "";
      return {
        name: `${chalk.bold(item.name)} (x${item.quantity}) - ${
          item.description
        } ${usability}`,
        value: index,
      };
    }
  );

  inventoryChoices.push({ name: "🔙 Back to combat", value: -1 });

  const { selectedItemIndex } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedItemIndex",
      message: "Select an item to use:",
      choices: inventoryChoices,
    },
  ]);

  if (selectedItemIndex === -1) return;

  const selectedItem: IItem = character.inventory[selectedItemIndex];

  // Check if the item is consumable (i.e. has an effect).
  if (selectedItem.effect === "" || selectedItem.consumable === false) {
    console.log(
      chalk.yellowBright(
        `You cannot use ${selectedItem.name} during combat. Consider equipping it instead.`
      )
    );
    return;
  }

  // Process the item's effect if a handler exists.
  const effectHandler =
    itemEffectHandlers[selectedItem.effect as Exclude<IItem["effect"], "">];
  if (effectHandler) {
    await effectHandler(character, selectedItem);
  } else {
    console.log(
      chalk.yellowBright(`You used ${selectedItem.name}, but nothing happened.`)
    );
  }

  // Decrease quantity and remove the item if the quantity reaches 0.
  selectedItem.quantity--;
  if (selectedItem.quantity <= 0) {
    character.inventory.splice(selectedItemIndex, 1);
  }
}

/**
 * (Optional) Displays a brief inventory overview.
 */
export function displayInventory(character: any): void {
  console.log(chalk.whiteBright.bold("=== Inventory ==="));
  if (!character.inventory || character.inventory.length === 0) {
    console.log(chalk.gray("(empty)"));
  } else {
    character.inventory.forEach((item: IItem, idx: number) => {
      console.log(chalk.white(`${idx + 1}. ${item.name} (x${item.quantity})`));
    });
  }
  console.log(chalk.whiteBright("=================\n"));
}
