import { getLanguage, setLanguage } from "../utilities/CacheService.js";
import { getTerm, Language } from "../utilities/LanguageService.js";
import { log } from "../utilities/LogService.js";
import { themedSelect } from "../utilities/ConsoleService.js";

/**
 * Shows a menu to change the language setting
 * @param lang The current language code, to show the menu in
 * @returns The chosen language code
 * @example
 * Your current language is English
 * Which language would you like? (use arrow keys)
 * >German
 *  English
 */
export async function changeLanguage() {
  const langChoices: { name: string; value: Language }[] = [
    {
      name: getTerm("de"),
      value: "de",
    },
    {
      name: getTerm("en"),
      value: "en",
    },
  ];
  console.log(`${getTerm("currentLang", true)} ${getTerm(getLanguage())}`);
  const chosenLang = await themedSelect({
    message: getTerm("chooseLang"),
    choices: langChoices,
  });
  setLanguage(chosenLang as Language);
  log("Switched language to: " + getTerm(chosenLang));
}
