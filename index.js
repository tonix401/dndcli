import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { totalClear } from "./js/utilities/ConsoleService.js";
import LogTypes from "./js/types/LogTypes.js";
import { log } from "./js/utilities/LogService.js";
import { createCharacterMenu } from "./js/components/CreateCharacterMenu.js";
import { inspectCharacter } from "./js/components/InspectCharacter.js";
import { startCampaign } from "./js/src/campaign.js";
import {
  getSettingsData,
  saveSettingsData,
} from "./js/utilities/SettingsService.js";
import { changeLanguage } from "./js/components/SettingsMenu.js";
import { getTerm } from "./js/utilities/LanguageService.js";

const dataDir = path.join(process.cwd(), "data");
fs.ensureDirSync(dataDir);

// Initialize settings
const initializeSettings = () => {
  try {
    const settings = getSettingsData();
    return settings?.language || "en";
  } catch (error) {
    log("Could not load language settings, using default", LogTypes.ERROR);
    return "en";
  }
};

const menuOptions = [
  { name: "Create your Character", value: "1", group: "Character" },
  { name: "Inspect your Character", value: "2", group: "Character" },
  { name: "Start Campaign", value: "3", group: "Game" },
  { name: "Change Language", value: "4", group: "Settings" },
  { name: "End Game", value: "9", group: "System" },
];

async function handleMenuChoice(choice, currentLanguage) {
  try {
    switch (choice) {
      case "1":
        log("Creating new Character");
        await createCharacterMenu(currentLanguage);
        break;
      case "2":
        log("Inspecting Character");
        await inspectCharacter(currentLanguage);
        break;
      case "3":
        log("Campaign Start");
        await startCampaign(currentLanguage);
        break;
      case "4":
        const newLanguage = await changeLanguage(currentLanguage);
        log("Changed Language to " + newLanguage);
        return newLanguage;
      case "9":
        await cleanup(currentLanguage);
        process.exit(0);
      default:
        log("Invalid option selected", LogTypes.ERROR);
    }
    return currentLanguage;
  } catch (error) {
    log(`Error in menu operation: ${error.message}`, LogTypes.ERROR);
    return currentLanguage;
  }
}

async function cleanup(currentLanguage) {
  try {
    log("Program ended");
    await saveSettingsData({ language: currentLanguage });
    console.log(getTerm("goodbye", currentLanguage));
  } catch (error) {
    log("Error during cleanup: " + error.message, LogTypes.ERROR);
  }
}

async function main() {
  let language = initializeSettings();

  try {
    log("Program started");

    while (true) {
      totalClear();
      const { choice } = await inquirer.prompt({
        type: "list",
        name: "choice",
        message: "Please choose:",
        choices: menuOptions,
      });

      language = await handleMenuChoice(choice, language);
    }
  } catch (error) {
    log("Fatal error: " + error.message, LogTypes.ERROR);
    await cleanup(language);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await cleanup(language);
  process.exit(0);
});

main();
