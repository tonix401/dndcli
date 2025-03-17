import { IItem } from "@utilities/IITem.js";
import { IAbility } from "@utilities/IAbility.js";

export default interface ICharacter {
  name: string;
  class: string;
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
  losesTurn?: boolean; // Flag to indicate if player loses a turn (e.g. from a scare move)
  isDefending?: boolean; // Indicates if the player is defending this turn
}
