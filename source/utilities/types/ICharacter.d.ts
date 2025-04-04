import { IItem } from "@utilities/IITem.js";
import { IAbility } from "@utilities/IAbility.js";
import { ICharacterClass } from "./ICharacterClass.js";

export default interface ICharacter {
  name: string;
  class: ICharacterClass;
  origin?: string;
  level: number;
  xp: number;
  hp: number;
  currency: number;
  abilities: {
    maxhp: number;
    strength: number;
    mana: number;
    dexterity: number;
    charisma: number;
    luck: number;
  };
  inventory: IItem[];
  lastPlayed: string;
  // New properties for dynamic combat:
  abilitiesList?: IAbility[]; // List of special abilities
  tempStrengthBuff?: number; // Temporary bonus from buffs
  tempDexterityBuff?: number; // Temporary bonus for dexterity
  losesTurn?: boolean; // Flag to indicate if player loses a turn (e.g. from a scare move)
  isDefending?: boolean; // Indicates if the player is defending this turn

  // Simplified equipment system - just an array of equipped items
  equippedItems?: IItem[];
}
