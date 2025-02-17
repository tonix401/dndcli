// types/ICharacterData.ts

import { IItem } from "../types/IItem.js";


export default interface ICharacterData {
  name: string;
  class: string;
  origin: string;
  level: string;
  xp: string;
  hp: string;
  abilities: {
    maxhp: string;
    strength: string;
    mana: string;
    dexterity: string;
    charisma: string;
    luck: string;
  };
  inventory: IItem[];
  lastPlayed: string;
}
