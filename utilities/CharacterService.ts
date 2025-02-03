import fs from "fs";
import ICharacterData from "../types/ICharacterData";

const filename = "../data/context.json";

export function getCharacterData() {
  try {
    const data = fs.readFileSync(filename, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error.message);
    return false;
  }
}

export function saveCharacterData(characterData: ICharacterData) {
  try {
    fs.writeFileSync(filename, JSON.stringify(characterData, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving ${filename}:`, error.message);
    return false;
  }
}
