import fs from "fs";
import ICharacterData from "../types/ICharacterData";
import { log } from "./LogService.js";
import LogTypes from "../types/LogTypes.js";

const filename = "../dndcli/storage/character.json";

/**
 * Reads the saved character data from the character.json file
 * @returns The character data as an object
 * @example
 * {
 * name: "Manfred",
 * class: "Mage",
 * level: "1",
 * xp: "0",
 * hp: "10",
 * abilities: { maxhp: "10", strength: "1", mana: "1", dexterity: "1", charisma: "1", luck: "1" },
 * inventory: { item1: "", item2: "", item3: "", item4: "", item5: "" },
 * lastPlayed: "3.2.2025"
 * }
 */
export function getCharacterData(): ICharacterData | null {
  try {
    const data = fs.readFileSync(filename, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Character Service: Error while loading ${filename}: No Character yet saved`,
        LogTypes.ERROR
      );
    }
    return null;
  }
}

/**
 * saved the character data to the character.json file
 * @param characterData The character data as an object
 * @example
 * {
 * name: "Wilbert",
 * class: "Archer",
 * level: "1",
 * xp: "0",
 * hp: "10",
 * abilities: { maxhp: "10", strength: "1", mana: "1", dexterity: "1", charisma: "1", luck: "1" },
 * inventory: { item1: "", item2: "", item3: "", item4: "", item5: "" },
 * lastPlayed: "3.2.2025"
 * }
 */
export function saveCharacterData(characterData: ICharacterData): void {
  try {
    fs.writeFileSync(filename, JSON.stringify(characterData, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      log(
        `Character Service: Error while saving ${filename}: ${error.message}`,
        LogTypes.ERROR
      );
    }
  }
}
