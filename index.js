import fs from "fs-extra";
import path from "path";
import { createCharacterMenu } from "./js/components/CreateCharacterMenu.js";
import { inspectCharacter } from "./js/components/InspectCharacter.js";
import { startCampaign } from "./js/src/campaign.js";
import {
  skippableSlowWrite,
  totalClear,
} from "./js/utilities/ConsoleService.js";
import { log } from "./js/utilities/LogService.js";
import LogTypes from "./js/types/LogTypes.js";
import { getSettingsData } from "./js/utilities/SettingsService.js";
import { changeLanguage } from "./js/components/SettingsMenu.js";
import { newPlayerScreen } from "./js/components/NewPlayerScreen.js";
import { welcomeScreen } from "./js/components/WelcomeScreen.js";
import { saveSettingsData } from "./js/utilities/SettingsService.js";
import { getTerm } from "./js/utilities/LanguageService.js";
import { select } from "@inquirer/prompts";

const getMenuOptions = (lang) => [
  { name: getTerm("createCharacter", lang), value: "1" },
  { name: getTerm("inspectCharacter", lang), value: "2" },
  { name: getTerm("startCampaign", lang), value: "3" },
  { name: getTerm("changeLang", lang), value: "4" },
  { name: getTerm("exit", lang), value: "9" },
];

async function handleMenuChoice(choice, language) {
  try {
    switch (choice) {
      case "1":
        log("Creating new Character");
        await createCharacterMenu(language);
        break;
      case "2":
        log("Inspecting Character");
        await inspectCharacter(language);
        break;
      case "3":
        log("Campaign Start");
        await startCampaign(language);
        break;
      case "4":
        const newLanguage = await changeLanguage(language);
        log("Changed Language to " + newLanguage);
        return newLanguage;
      case "9":
        await exitProgram(language);
      default:
        log("Invalid option selected", LogTypes.ERROR);
    }
    return language;
  } catch (error) {
    log(`Error in menu operation: ${error.message}`, LogTypes.ERROR);
    return language;
  }
}

/**
 * The main menu and game loop of the app
 */
async function main(language) {
  try {
    while (true) {
      totalClear();
      const choice = await select(
        {
          message: getTerm("chooseOption", language),
          choices: getMenuOptions(language),
        },
        { clearPromptOnDone: true }
      );

      language = await handleMenuChoice(choice, language);
    }
  } catch (error) {
    log("Error: " + error, LogTypes.ERROR);
    main();
  }
}

process.on("SIGINT", async () => {
  exitProgram(language);
});

async function exitProgram(language) {
  saveSettingsData({ language: language });
  await skippableSlowWrite(getTerm("goodbye", language));
  process.exit(0);
}

///////////////////////////////////////////// MAIN PROGRAM /////////////////////////////////////////////////
const dataDir = path.join(process.cwd(), "storage");
fs.ensureDirSync(dataDir);

log("Program started");

let settings = await getSettingsData();
let language = settings?.language || "de";

await newPlayerScreen(language);
await welcomeScreen(language);

main(language);
////////////////////////////////////////////////////////////////////////////////////////////////////////////
