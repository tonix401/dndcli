import {
  getLanguage,
  getTheme,
  setLanguage,
  setTheme,
} from "@utilities/CacheService.js";
import { getTerm, Language } from "@utilities/LanguageService.js";
import { log, LogTypes } from "@utilities/LogService.js";
import {
  pressEnter,
  themedSelect,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getAllThemeOverrides } from "@utilities/ThemingService.js";
import chalk from "chalk";
import Config from "@utilities/Config.js";

export async function settingsMenu() {
  while (true) {
    totalClear();
    const subSettingChoice = await themedSelect({
      message: getTerm("settings"),
      choices: [
        {
          name: getTerm("language") + ": " + getTerm(getLanguage()),
          value: "languageSetting",
        },
        {
          name: getTerm("theme") + ": " + getTheme().name[getLanguage()],
          value: "themeSetting",
        },
        {
          name: getTerm("goBack"),
          value: "goBack",
        },
      ],
    });

    switch (subSettingChoice) {
      case "languageSetting":
        await changeLanguageMenu();
        break;
      case "themeSetting":
        await changeThemeMenu();
        break;
      case "goBack":
        return;
      default:
        log("Settings menu: Unexpected sub setting choice", "Error");
        console.log(getTerm("invalid"));
        await pressEnter();
    }
  }
}

/**
 * Shows a menu to change the language setting
 * @returns The chosen language code
 * @example
 * Your current language is English
 * Which language would you like?
 * >German
 *  English
 */
async function changeLanguageMenu() {
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
  const chosenLang = await themedSelect({
    message: `${getTerm("language")}`,
    choices: langChoices,
    default: getLanguage(),
  });
  setLanguage(chosenLang as Language);
  log("Settings Menu: Switched language to: " + getTerm(chosenLang));
}

async function changeThemeMenu() {
  const themes = Object.values(getAllThemeOverrides());

  const themeChoice = await themedSelect({
    message: getTerm("theme"),
    choices: [
      ...themes.map((theme) => {
        return {
          name: chalk.hex(
            theme.primaryColor || Config.STANDARD_THEME.primaryColor
          )(theme.name[getLanguage()]),
          value: theme.name.en,
        };
      }),
    ],
    default: getTheme().name.en,
  });

  const selectedTheme = themes.find((theme) => theme.name.en === themeChoice);

  if (selectedTheme) {
    setTheme(selectedTheme);
  } else {
    log("Setting Menu: Theme selection failed", "Error");
  }
}
