// utilities/InventoryService.ts
import { IItem } from "../types/IITem.js";

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
