import fs from "fs";
import ICharacterData from "../types/ICharacterData";

const filename = "../dndcli/data/character.json";

export function getCharacterData() {
  try {
    const data = fs.readFileSync(filename, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error loading ${filename}:`, error.message);
    }
    return false;
  }
}

export function saveCharacterData(characterData: ICharacterData) {
  try {
    fs.writeFileSync(filename, JSON.stringify(characterData, null, 2));
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error saving ${filename}:`, error.message);
    }
    return false;
  }
}
