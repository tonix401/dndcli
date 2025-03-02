// @utilities/IItem.ts
export interface IItem {
  id: string;
  name: string;
  description: string;
  effect: "restoreHP" | "restoreMana" | "boostStrength" | "boostDexterity" | ""; // Empty string for equipment
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  quantity: number;
  consumable?: boolean;
}
