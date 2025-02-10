import { getLanguage, getTheme } from "./CacheService.js";
import { skippableSlowWrite, totalClear } from "./ConsoleService.js";
import { getTerm } from "./LanguageService.js";
import { log } from "./LogService.js";
import { saveSettingsData } from "./SettingsService.js";

export async function exitProgram() {
  totalClear();
  log("Index: Program ended");
  saveSettingsData({
    language: getLanguage(),
    theme: getTheme(),
  });
  await skippableSlowWrite(getTerm("goodbye"));
  process.exit(0);
}
