import fs from "fs";
import { log } from "./LogService.js";
import LogTypes from "../types/LogTypes.js";
import { IContextData } from "../types/IContextData.js";

const filename = "../dndcli/storage/context.json";

/**
 * Get the current Story context from the context.json file
 * @returns The currently saved context data
 */
export function getContextData(): IContextData | null {
  try {
    const data = fs.readFileSync(filename, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      log(`Error while loading ${filename}: ${error.message}`, LogTypes.ERROR);
    }

    return null;
  }
}

/**
 * Saves context data into the context.json file
 * @param characterData The context data to be saved
 */
export function saveContextData(characterData: IContextData): void {
  try {
    fs.writeFileSync(filename, JSON.stringify(characterData, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      log(`Error while saving ${filename}: ${error.message}`, LogTypes.ERROR);
    }
  }
}
