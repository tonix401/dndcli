import {
  getLanguage,
  getPrimaryColor,
  getSecondaryColor,
  setLanguage,
  setPrimaryColor,
  setSecondaryColor,
} from "../utilities/CacheService.js";
import {
  getAllColors,
  getColorTerm,
  getTerm,
  IColorTerm,
  Language,
} from "../utilities/LanguageService.js";
import { log } from "../utilities/LogService.js";
import { pressEnter, themedSelect } from "../utilities/ConsoleService.js";
import LogTypes from "../types/LogTypes.js";
import chalk from "chalk";

/**
 * Shows a menu to change the language setting
 * @param lang The current language code, to show the menu in
 * @returns The chosen language code
 * @example
 * Your current language is English
 * Which language would you like?
 * >German
 *  English
 */
async function changeLanguage() {
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
    message: `${getTerm("chooseLang")}`,
    choices: langChoices,
  });
  setLanguage(chosenLang as Language);
  log("Switched language to: " + getTerm(chosenLang));
}

export async function settingsMenu() {
  const primaryColorSettingDescription: string =
    getTerm("primaryColor") +
    ": " +
    Object.values(getAllColors()).find(
      (colorTerm: IColorTerm) => colorTerm.hex === getPrimaryColor()
    )?.[getLanguage()];

  const secondaryColorSettingDescription: string =
    getTerm("secondaryColor") +
    ": " +
    Object.values(getAllColors()).find(
      (colorTerm: IColorTerm) => colorTerm.hex === getSecondaryColor()
    )?.[getLanguage()];

  const subSettingChoice = await themedSelect({
    message: getTerm("settings"),
    choices: [
      {
        name: getTerm("language") + ": " + getTerm(getLanguage()),
        value: "languageSetting",
      },
      {
        name: primaryColorSettingDescription,
        value: "primaryColorSetting",
      },
      {
        name: secondaryColorSettingDescription,
        value: "secondaryColorSetting",
      },
      {
        name: getTerm("goBack"),
        value: "goBack",
      },
    ],
  });

  switch (subSettingChoice) {
    case "languageSetting":
      await changeLanguage();
      break;
    case "primaryColorSetting":
      await colorMenu("primaryColor");
      break;
    case "secondaryColorSetting":
      await colorMenu("secondaryColor");
      break;
    case "goBack":
      break;
    default:
      log("Settings menu: Unexpected sub setting choice", LogTypes.ERROR);
      console.log(getTerm("invalid"));
      await pressEnter();
      settingsMenu();
  }
}

async function colorMenu(prio: "primaryColor" | "secondaryColor") {
  const colorChoice = await themedSelect({
    message: getTerm(prio),
    choices: Object.values(getAllColors()).map((color: IColorTerm) => ({
      name: chalk.hex(color.hex)(color[getLanguage()]),
      value: color.hex,
    })),
  });

  if (prio === "primaryColor") {
    setPrimaryColor(colorChoice);
  } else {
    setSecondaryColor(colorChoice);
  }
}
