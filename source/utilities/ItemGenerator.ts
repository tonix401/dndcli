// utilities/ItemGenerator.ts
import { IItem } from "types/IITem.js";

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
    restoreHP: ["Healing Potion", "Elixir of Vitality", "Crimson Flask"],
    restoreMana: ["Mana Potion", "Elixir of Focus", "Azure Vial"],
    boostStrength: ["Strength Tonic", "Berserker Brew", "Might Elixir"],
    boostDexterity: ["Agility Serum", "Quickness Draught", "Dexterity Tonic"],
  };

  const nameOptions = names[effect];
  const itemName = nameOptions[Math.floor(Math.random() * nameOptions.length)];

  // Calculate a dynamic bonus value based on level and multiplier.
  const bonusValue = Math.floor(level * multiplier * (Math.random() * 0.5 + 1));

  // Build a description based on the effect.
  let effectDescription = "";
  if (effect === "restoreHP") {
    effectDescription = `restores ${bonusValue} HP`;
  } else if (effect === "restoreMana") {
    effectDescription = `restores ${bonusValue} Mana`;
  } else if (effect === "boostStrength") {
    effectDescription = `increases Strength by ${bonusValue} points`;
  } else if (effect === "boostDexterity") {
    effectDescription = `boosts Dexterity by ${bonusValue} points`;
  }

  const description = `${itemName} of ${selectedRarity} quality. ${effectDescription}. It scales with your level (${level}) with a multiplier of ${multiplier}.`;

  // Improved unique ID using current timestamp and a random number.
  const id =
    Date.now().toString() + Math.floor(Math.random() * 1000).toString();

  const item: IItem = {
    id,
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
