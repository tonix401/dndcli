// utilities/ItemGenerator.ts
import { IItem } from "../types/IITem.js";

const rarities = [
  { tier: "Common", chance: 0.6, multiplier: 1 },
  { tier: "Uncommon", chance: 0.25, multiplier: 1.5 },
  { tier: "Rare", chance: 0.1, multiplier: 2 },
  { tier: "Epic", chance: 0.04, multiplier: 3 },
  { tier: "Legendary", chance: 0.01, multiplier: 5 },
];

export function generateRandomItem(level: number): IItem {
  let rand = Math.random();
  let cumulativeChance = 0;
  let selectedRarity = "Common";
  let multiplier = 1;
  for (const rarity of rarities) {
    cumulativeChance += rarity.chance;
    if (rand < cumulativeChance) {
      selectedRarity = rarity.tier;
      multiplier = rarity.multiplier;
      break;
    }
  }

  const effects: (
    | "restoreHP"
    | "restoreMana"
    | "boostStrength"
    | "boostDexterity"
  )[] = ["restoreHP", "restoreMana", "boostStrength", "boostDexterity"];
  const effect = effects[Math.floor(Math.random() * effects.length)];

  const names = {
    restoreHP: ["Healing Potion", "Elixir of Vitality", "Red Flask"],
    restoreMana: ["Mana Potion", "Elixir of Focus", "Blue Vial"],
    boostStrength: ["Strength Tonic", "Berserker Brew", "Power Elixir"],
    boostDexterity: ["Agility Serum", "Quickness Draught", "Dexterity Tonic"],
  };

  const nameOptions = names[effect];
  const itemName = nameOptions[Math.floor(Math.random() * nameOptions.length)];

  const description = `${itemName} of ${selectedRarity} quality. Its effect (${effect}) scales with your level (${level}) with a multiplier of ${multiplier}.`;
  const item: IItem = {
    id: Date.now().toString(), // unique id based on timestamp
    name: itemName,
    description,
    effect,
    rarity: selectedRarity as
      | "Common"
      | "Uncommon"
      | "Rare"
      | "Epic"
      | "Legendary",
    quantity: 1,
  };

  return item;
}
