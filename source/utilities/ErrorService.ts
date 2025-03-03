import { getLanguage, getPassword, getTheme } from "@utilities/CacheService.js";
import { skippableSlowWrite, totalClear } from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { log } from "@utilities/LogService.js";
import { saveDataToFile } from "./StorageService.js";

export async function exitProgram() {
  totalClear();
  log("Index: Program ended");
  saveDataToFile("settings", {
    language: getLanguage(),
    theme: getTheme(),
    password: getPassword(),
  });
  await skippableSlowWrite(getTerm("goodbye"));
  process.exit(0);
}
