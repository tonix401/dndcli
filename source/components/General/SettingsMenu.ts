import {
  getLanguage,
  getTheme,
  setLanguage,
  setTheme,
} from "@core/CacheService.js";
import { getTerm, Language } from "@core/LanguageService.js";
import { log } from "@core/LogService.js";
import { pressEnter, totalClear } from "@core/ConsoleService.js";
import { getAllThemeOverrides } from "@core/ThemingService.js";
import chalk from "chalk";
import Config from "@utilities/Config.js";
import { themedSelectInRoom } from "./ThemedSelectInRoom.js";

export async function settingsMenu() {
  while (true) {
    totalClear();
    const subSettingChoice = await themedSelectInRoom({
      message: getTerm("settings"),
      canGoBack: true,
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
  totalClear();
  const langChoices: { name: string; value: Language }[] = [
    {
      name: getTerm("de"),
      value: "de",
    },
    {
      name: getTerm("en"),
      value: "en",
    },
    {
      name: getTerm("ch"),
      value: "ch",
    },
  ];
  const chosenLang: Language | string = await themedSelectInRoom({
    message: `${getTerm("language")}`,
    canGoBack: true,
    choices: langChoices,
    default: getLanguage(),
  });
  if (chosenLang === "goBack") {
    return;
  }
  setLanguage(chosenLang as Language);
  log("Settings Menu: Switched language to: " + getTerm(chosenLang));
}

async function changeThemeMenu() {
  totalClear();
  const themes = Object.values(getAllThemeOverrides());

  const themeChoice = await themedSelectInRoom({
    canGoBack: true,
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
  if (themeChoice === "goBack") {
    return;
  }

  if (selectedTheme) {
    setTheme(selectedTheme);
  } else {
    log("Setting Menu: Theme selection failed", "Error");
  }
}
