import { IItem } from "../types/IItem.js";
import chalk from "chalk";
import inquirer from "inquirer";

/**
 * Returns starting items based on the character class.
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
      },
      {
        id: "item2",
        name: "Cloth Robe",
        description: "A simple robe offering little protection.",
        effect: "",
        rarity: "Common",
        quantity: 1,
      },
      {
        id: "item3",
        name: "Mana Potion",
        description: "Restores 10 mana.",
        effect: "restoreMana",
        rarity: "Common",
        quantity: 2,
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
      },
      {
        id: "item2",
        name: "Leather Armor",
        description: "Provides minimal protection.",
        effect: "",
        rarity: "Common",
        quantity: 1,
      },
      {
        id: "item3",
        name: "Healing Potion",
        description: "Restores 10 HP.",
        effect: "restoreHP",
        rarity: "Common",
        quantity: 2,
      },
    ];
  }
  return [
    {
      id: "item1",
      name: "Old Dagger",
      description: "A basic dagger.",
      effect: "",
      rarity: "Common",
      quantity: 1,
    },
    {
      id: "item2",
      name: "Healing Potion",
      description: "Restores 10 HP.",
      effect: "restoreHP",
      rarity: "Common",
      quantity: 1,
    },
  ];
}

/**
 * Displays a dedicated inventory menu and processes the selected item.
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

  const inventoryChoices = character.inventory.map(
    (item: IItem, index: number) => ({
      name: `${chalk.bold(item.name)} (x${item.quantity}) - ${
        item.description
      }`,
      value: index,
    })
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

  if (selectedItem.effect === "restoreHP") {
    const restored = 10;
    character.hp = String(
      Math.min(
        Number(character.hp) + restored,
        Number(character.abilities.maxhp)
      )
    );
    console.log(
      chalk.greenBright(
        `You used ${selectedItem.name} and restored ${restored} HP.`
      )
    );
    selectedItem.quantity--;
    if (selectedItem.quantity <= 0) {
      character.inventory.splice(selectedItemIndex, 1);
    }
  } else if (selectedItem.effect === "restoreMana") {
    const restored = 10;
    character.mana = String(
      Math.min(
        Number(character.mana) + restored,
        Number(character.abilities.mana)
      )
    );
    console.log(
      chalk.greenBright(
        `You used ${selectedItem.name} and restored ${restored} Mana.`
      )
    );
    selectedItem.quantity--;
    if (selectedItem.quantity <= 0) {
      character.inventory.splice(selectedItemIndex, 1);
    }
  } else {
    console.log(
      chalk.yellowBright(`You used ${selectedItem.name} but nothing happened.`)
    );
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
