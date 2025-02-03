import { getTerm, Language } from "../utilities/LanguageService.js";
import { select } from "@inquirer/prompts";

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
export async function changeLanguage(lang: Language) {
  const langChoices: { name: string; value: Language }[] = [
    {
      name: getTerm("de", lang),
      value: "de",
    },
    {
      name: getTerm("en", lang),
      value: "en",
    },
  ];
  console.log(`${getTerm("currentLang", lang, true)} ${getTerm(lang, lang)}`);
  const chosenLang = await select({
    message: getTerm("chooseLang", lang),
    choices: langChoices,
  });

  return chosenLang;
}

// General settings in case we need them later:

/*
export async function changeSettings(lang: Language = "de") {
  // declarations
  const langChoices: { name: string; value: Language }[] = [
    {
      name: getTerm("de", lang),
      value: "de",
    },
    {
      name: getTerm("en", lang),
      value: "en",
    },
  ];
  let settings: ISettings = getSettingsData();
  const settingsLog = `
  ${chalk.bold(getTerm("settings", lang))}
  ${getTerm("language", lang)}: ${getTerm(settings.language, lang)}
  `;

  // actions
  totalClear();
  console.log(settingsLog);
  const chosenLang: Language = await select({
    message: getTerm("chooseLang", lang),
    choices: langChoices,
  });

  settings.language = chosenLang;

  return await input({
    message: getTerm("pressEnter", lang),
  });
}
*/
