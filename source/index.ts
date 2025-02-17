import path from "path";
import fs from "fs-extra";
import { createCharacterMenu } from "./components/CreateCharacterMenu.js";
import { inspectCharacter } from "./components/InspectCharacter.js";
import { startCampaign } from "./src/campaign.js";
import {
  pressEnter,
  skippableSlowWrite,
  themedSelect,
  totalClear,
} from "./utilities/ConsoleService.js";
import { log, LogTypes } from "./utilities/LogService.js";
import { getSettingsData } from "./utilities/SettingsService.js";
import { settingsMenu } from "./components/SettingsMenu.js";
import { newPlayerScreen } from "./components/NewPlayerScreen.js";
import { saveSettingsData } from "./utilities/SettingsService.js";
import { getTerm } from "./utilities/LanguageService.js";
import {
  getLanguage,
  getPassword,
  getTheme,
  setLanguage,
  setTheme,
} from "./utilities/CacheService.js";
import { standardTheme } from "./utilities/ThemingService.js";
import { secretDevMenu } from "./components/SecretDevMenu.js";
import { inspectInventory } from "./components/InspectInventory.js";
import { titleScreen } from "./components/TitleScreen.js";
import Room from "./classes/Room.js";
import { getRoomVisual } from "./utilities/DungeonService.js";

const getMenuOptions = () => [
  { name: getTerm("createCharacter"), value: "1" },
  { name: getTerm("inspectCharacter"), value: "2" },
  { name: getTerm("inspectInventory"), value: "6" },
  { name: getTerm("startCampaign"), value: "3" },
  { name: getTerm("settings"), value: "4" },
  { name: getTerm("devMenu"), value: "5" },
  { name: getTerm("exit"), value: "9" },
];

async function handleMenuChoice(choice: string) {
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
      case "5":
        await secretDevMenu();
        break;
      case "6":
        await inspectInventory();
        break;
      case "9":
        await exitProgram();
      default:
        log("Index: Unexpected menu choice", LogTypes.ERROR);
    }
  } catch (error) {
    await exitProgram();
    log(
      "Index/handleMenuChoices: User force closed the prompt",
      LogTypes.WARNING
    );
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
  log("Index: Exiting Program via Ctrl-C", LogTypes.WARNING);
  await exitProgram();
});

export async function exitProgram() {
  totalClear();
  log("Index: Program ended");
  saveSettingsData({
    language: getLanguage(),
    theme: getTheme(),
    password: getPassword(),
  });
  await skippableSlowWrite(getTerm("goodbye"));
  process.exit(0);
}

///////////////////////////////////////////// MAIN PROGRAM /////////////////////////////////////////////////
const dataDir = path.join(process.cwd(), "storage");
fs.ensureDirSync(dataDir);
log("Index: Program started");

const settings = getSettingsData();
setLanguage(settings?.language || "de");
setTheme(settings?.theme || standardTheme);

async function startApp() {
  await titleScreen();
  await newPlayerScreen();
  main();
}

startApp();
////////////////////////////////////////////////////////////////////////////////////////////////////////////
