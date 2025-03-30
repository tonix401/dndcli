import { checkbox } from "@inquirer/prompts";
import { getTerm, TermKey } from "@utilities/LanguageService.js";
import {
  resetCachedGameState,
  getTheme,
  setLanguage,
  setTheme,
} from "@utilities/CacheService.js";
import Config from "@utilities/Config.js";
import { clearLogs } from "@utilities/LogService.js";
import {
  pressEnter,
  primaryColor,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import { saveDataToFile } from "@utilities/StorageService.js";

/**
 * Menu component that handles resetting different types of data
 */
export async function resetDataMenu(): Promise<void> {
  const options = [
    { name: getTerm("characterData"), value: "characterData" },
    { name: getTerm("settingsData"), value: "settingsData" },
    { name: getTerm("logs"), value: "logs" },
    { name: getTerm("saveStateData"), value: "saveStateData" },
  ];

  const choices = await checkbox(
    {
      message: getTerm("resetData"),
      choices: options,
      instructions: getTerm("checkboxHelp"),
      theme: {
        style: {
          message: primaryColor,
          highlight: secondaryColor,
          help: secondaryColor,
        },
        icon: {
          cursor: getTheme().cursor,
          checked: "☑",
          unchecked: "☐",
        },
        prefix: getTheme().prefix,
      },
    },
    { clearPromptOnDone: true }
  );

  if (choices.includes("characterData")) {
    saveDataToFile("character", Config.START_CHARACTER);
  }
  if (choices.includes("settingsData")) {
    setLanguage("de");
    setTheme(Config.STANDARD_THEME);
  }
  if (choices.includes("logs")) {
    clearLogs();
  }
  if (choices.includes("saveStateData")) {
    await resetCachedGameState(true);
  }

  console.log(
    `${getTerm("resetDone")}: ${
      choices.length === 0
        ? getTerm("none")
        : choices.map((choice) => getTerm(choice as TermKey)).join(", ")
    }`
  );
  await pressEnter();
}
