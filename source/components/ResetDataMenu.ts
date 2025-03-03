import { checkbox } from "@inquirer/prompts";
import { getTerm } from "@utilities/LanguageService.js";
import { getTheme, setLanguage, setTheme } from "@utilities/CacheService.js";
import Config from "@utilities/Config.js";
import { clearLogs } from "@utilities/LogService.js";
import { primaryColor } from "@utilities/ConsoleService.js";
import { saveDataToFile } from "@utilities/StorageService.js";

/**
 * Menu component that handles resetting different types of data
 */
export async function resetDataMenu(): Promise<void> {
  const options = [
    { name: getTerm("showCharacterData"), value: "character" },
    { name: getTerm("showSettingsData"), value: "settings" },
    { name: getTerm("logs"), value: "logs" },
    { name: getTerm("cancel"), value: "cancel" },
  ];

  const choice = await checkbox(
    {
      message: getTerm("resetData"),
      choices: options,
      instructions: getTerm(""),
      theme: {
        icon: {
          cursor: getTheme().cursor,
          checked: `(${primaryColor("x")})`,
          unchecked: "( )",
        },
        helpMode: "never",
        prefix: getTheme().prefix,
      },
    },
    { clearPromptOnDone: true }
  );

  if (choice.includes("cancel")) return;
  if (choice.includes("character")) {
    saveDataToFile("character", Config.START_CHARACTER);
  }
  if (choice.includes("settings")) {
    setLanguage("de");
    setTheme(Config.STANDARD_THEME);
  }
  if (choice.includes("logs")) {
    clearLogs();
  }
}
