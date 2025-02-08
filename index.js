import fs from "fs-extra";
import path from "path";
import { createCharacterMenu } from "./js/components/CreateCharacterMenu.js";
import { inspectCharacter } from "./js/components/InspectCharacter.js";
import { startCampaign } from "./js/src/campaign.js";
import {
  pressEnter,
  skippableSlowWrite,
  themedSelect,
  totalClear,
} from "./js/utilities/ConsoleService.js";
import { log } from "./js/utilities/LogService.js";
import LogTypes from "./js/types/LogTypes.js";
import { getSettingsData } from "./js/utilities/SettingsService.js";
import { settingsMenu } from "./js/components/SettingsMenu.js";
import { newPlayerScreen } from "./js/components/NewPlayerScreen.js";
import { welcomeScreen } from "./js/components/WelcomeScreen.js";
import { saveSettingsData } from "./js/utilities/SettingsService.js";
import { getTerm } from "./js/utilities/LanguageService.js";
import {
  getLanguage,
  getTheme,
  setLanguage,
  setTheme,
} from "./js/utilities/CacheService.js";
import { standardTheme } from "./js/utilities/ThemingService.js";

const getMenuOptions = () => [
  { name: getTerm("createCharacter"), value: "1" },
  { name: getTerm("inspectCharacter"), value: "2" },
  { name: getTerm("startCampaign"), value: "3" },
  { name: getTerm("settings"), value: "4" },
  { name: getTerm("exit"), value: "9" },
];

async function handleMenuChoice(choice) {
  try {
    switch (choice) {
      case "1":
        log("Index: Creating new Character");
        await createCharacterMenu();
        break;
      case "2":
        log("Index: Inspecting Character");
        await inspectCharacter();
        break;
      case "3":
        log("Index: Campaign Start");
        await startCampaign();
        break;
      case "4":
        log("Index: Opening Settings");
        await settingsMenu();
        break;
      case "9":
        await exitProgram();
      default:
        log("Index: Unexpected menu choice", LogTypes.ERROR);
    }
  } catch (error) {
    if (error instanceof ExitPromptError) {
      await exitProgram();
      log("Index/handleMenuChoices: User force closed the prompt", LogTypes.WARN);
    }
    else {
      log(`Index/handleMenuChoices: ${error}`, LogTypes.ERROR);
    }
  }
}

/**
 * The main menu and game loop of the app
 */
async function main() {
  while (true) {
    try {
      totalClear();
      const choice = await themedSelect({
        message: getTerm("mainMenu"),
        choices: getMenuOptions(),
      });

      await handleMenuChoice(choice);
    } catch (error) {
      log("Index/main: " + error, LogTypes.ERROR);
      console.log(getTerm("error"));
      await pressEnter();
    }
  }
}

process.on("SIGINT", async () => {
  log("Index: Exiting Program via Ctrl-C", LogTypes.WARN);
  await exitProgram();
});

async function exitProgram() {
  totalClear();
  log("Index: Program ended");
  saveSettingsData({
    language: getLanguage(),
    theme: getTheme(),
  });
  await skippableSlowWrite(getTerm("goodbye"));
  process.exit(0);
}

export function getCurrentColor() {
  return color || "white";
}

///////////////////////////////////////////// MAIN PROGRAM /////////////////////////////////////////////////
const dataDir = path.join(process.cwd(), "storage");
fs.ensureDirSync(dataDir);
log("Index: Program started");

let settings = await getSettingsData();
setLanguage(settings?.language || "de");
setTheme(settings?.theme || standardTheme);

await newPlayerScreen();
await welcomeScreen();

main();
////////////////////////////////////////////////////////////////////////////////////////////////////////////
