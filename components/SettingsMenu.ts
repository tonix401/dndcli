import { totalClear } from "../utilities/ConsoleService.js";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { getTerm, Language } from "../utilities/LanguageService.js";
import {
  getSettingsData,
  saveSettingsData,
} from "../utilities/SettingsService.js";
import { ISettings } from "../types/ISettings.js";
import { select } from "@inquirer/prompts";


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
  let settings: ISettings = await getSettingsData();
  const settingsLog = `
  ${chalk.bold(getTerm("settings", lang))}
  ${getTerm("language", lang)}: ${getTerm(settings.language, lang)}
  `;

  // actions
  totalClear();
  console.log(settingsLog);
  const chosenLang: Language = await select(
    {
      message: getTerm("chooseLang", lang),
      choices: langChoices,
    }
  );

  settings.language = chosenLang;

  return await input(
    {
      message: getTerm("backToMenu", lang),
    }
  );
}

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
    console.log(`${getTerm("currentLang", lang)} ${getTerm(lang, lang)}`);
    const chosenLang = await select({
      message: getTerm("chooseLang", lang),
      choices: langChoices,
    });

    return chosenLang;
}
