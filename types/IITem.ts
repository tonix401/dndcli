// types/IItem.ts
export interface IItem {
  id: string;
  name: string;
  description: string;
  effect: "restoreHP" | "restoreMana" | "boostStrength" | "boostDexterity" | "";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  quantity: number;
}
