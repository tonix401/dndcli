import fs from "fs";
import ICharacterData from "../types/ICharacterData";
import { log } from "./LogService";
import LogTypes from "../types/LogTypes";

const filename = "../dndcli/data/context.json";

export function getContextData() {
  try {
    const data = fs.readFileSync(filename, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      log(`Error while loading ${filename}: error.message`, LogTypes.ERROR);
    }
    return false;
  }
}

export function saveContextData(characterData: ICharacterData) {
  try {
    fs.writeFileSync(filename, JSON.stringify(characterData, null, 2));
    return true;
  } catch (error) {
    if (error instanceof Error) {
      log(`Error while saving ${filename}: error.message`, LogTypes.ERROR);
    }
    return false;
  }
}
