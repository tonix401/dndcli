import { log, LogTypes } from "../utilities/LogService.js";
import {
  alignTextAsMultiTable,
  pressEnter,
  themedSelect,
  totalClear,
} from "../utilities/ConsoleService.js";
import { getTerm } from "../utilities/LanguageService.js";
import {
  getLanguage,
  getPassword,
  getTheme,
} from "../utilities/CacheService.js";
import chalk from "chalk";
import { exitProgram } from "../utilities/ErrorService.js";
import {
  getSettingsData,
  saveSettingsData,
} from "../utilities/SettingsService.js";
import { flipATable } from "./Flip.js";
import {
  checkPasswordScreen,
  setPasswordScreen,
} from "../utilities/PasswordService.js";

/**
 * The Developer menu, with choices like manipulating the cache and storage data etc...
 */
export async function secretDevMenu() {
  const devMenuOptions: {
    name: string;
    value: string;
    description?: string;
  }[] = [
    {
      name: getTerm("showSettingsData"),
      value: "showSettingsData",
    },
    {
      name: getTerm("showCharacterData"),
      value: "showCharacterData",
    },
    {
      name: getTerm("setPassword"),
      value: "setPassword",
    },
    {
      name: getTerm("flip"),
      value: "flip",
    },
    {
      name: getTerm("goBack"),
      value: "goBack",
    },
  ];

  if (!(await checkPasswordScreen(3))) {
    console.log(chalk.hex(getTheme().primaryColor)(getTerm("invalid")));
    return;
  }

  while (true) {
    totalClear();
    try {
      const chosenOption = await themedSelect({
        message: getTerm("devMenu"),
        choices: devMenuOptions,
      });
      switch (chosenOption) {
        case "showSettingsData":
          log("Dev Menu: showing saved data");
          await showSettingsData();
          break;
        case "showCharacterData":
          log("Dev Menu: showing saved data");
          console.log(
            chalk.hex(getTheme().primaryColor)(getTerm("currentlyInDev"))
          );
          await pressEnter();
          break;
        case "setPassword":
          await setPasswordScreen();
          break;
        case "flip":
          await flipATable();
          break;
        case "goBack":
          return;
        default:
          log("Secret Dev Menu: Unexpected menu choice", LogTypes.ERROR);
          console.log(getTerm("invalid"));
          await pressEnter();
      }
    } catch (error) {
      await exitProgram();
      log("Dev menu: User force closed the prompt", LogTypes.WARNING);
    }
  }
}

async function showSettingsData() {
  // Data tables
  const cacheDataTable: [string, string][] = [
    [getTerm("cacheData"), ""],
    [getTerm("language"), getTerm(getLanguage())],
    [getTerm("theme"), getTheme().name[getLanguage()]],
    [getTerm("primaryColor"), getTheme().primaryColor],
    [getTerm("secondaryColor"), getTheme().secondaryColor],
    [getTerm("cursor"), '"' + getTheme().cursor + '"'],
    [getTerm("prefix"), '"' + getTheme().prefix + '"'],
  ];

  const settingsData = getSettingsData();

  const settingsDataTable: [string, string][] = [
    [getTerm("dataFromJson"), ""],
    [getTerm("language"), getTerm(settingsData?.language || "undefined")],
    [getTerm("theme"), settingsData?.theme?.name[getLanguage()] + ""],
    [getTerm("primaryColor"), settingsData?.theme?.primaryColor + ""],
    [getTerm("secondaryColor"), settingsData?.theme?.secondaryColor + ""],
    [getTerm("cursor"), '"' + settingsData?.theme?.cursor + '"'],
    [getTerm("prefix"), '"' + settingsData?.theme?.prefix + '"'],
  ];

  // Show formatted data
  const multiTable = alignTextAsMultiTable(
    [cacheDataTable, settingsDataTable],
    "|"
  );

  console.log(
    chalk.hex(getTheme().secondaryColor)(
      "/" + "‾".repeat(multiTable.width - 2) + "\\"
    )
  );
  console.log(chalk.hex(getTheme().secondaryColor)(multiTable.text));
  console.log(
    chalk.hex(getTheme().secondaryColor)(
      "\\" + "_".repeat(multiTable.width - 2) + "/"
    )
  );

  // Options
  const chosenOption = await themedSelect({
    message: "",
    choices: [
      { name: getTerm("saveData"), value: "commit" },
      { name: getTerm("goBack"), value: "goBack" },
    ],
  });

  if (chosenOption === "commit") {
    saveSettingsData({
      language: getLanguage(),
      theme: getTheme(),
      password: getPassword(),
    });
    totalClear();
    await showSettingsData();
  }
}
