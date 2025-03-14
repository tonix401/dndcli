export type ItemEffect =
  | "restoreHP"
  | "restoreMana"
  | "boostStrength"
  | "boostDexterity"
  | "";

export type ItemRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type ItemType = "weapon" | "armor" | "consumable" | "key" | "quest";

export type EquipmentSlot = "weapon" | "armor" | "accessory";

export interface IItem {
  id: string;
  name: string;
  description: string;
  effect: ItemEffect;
  rarity: ItemRarity;
  quantity: number;
  consumable?: boolean;
  type?: ItemType;
  value?: number;
  requiredLevel?: number;
  damage?: number;
  defense?: number;
  slot?: EquipmentSlot;

  stats?: {
    strength?: number;
    dexterity?: number;
    charisma?: number;
    luck?: number;
    maxhp?: number;
    mana?: number;
  };
}

export interface IEquippable extends IItem {
  type: "weapon" | "armor";
  slot: EquipmentSlot;
  isEquipped?: boolean;
}
