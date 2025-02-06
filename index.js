import fs from "fs-extra";
import path from "path";
import { createCharacterMenu } from "./js/components/CreateCharacterMenu.js";
import { inspectCharacter } from "./js/components/InspectCharacter.js";
import { startCampaign } from "./js/src/campaign.js";
import {
  slowWrite,
  themedSelect,
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
import { getLanguage, getPrimaryColor, getSecondaryColor, setLanguage, setPrimaryColor, setSecondaryColor } from "./js/utilities/CacheService.js";

const getMenuOptions = () => [
  { name: getTerm("createCharacter"), value: "1" },
  { name: getTerm("inspectCharacter"), value: "2" },
  { name: getTerm("startCampaign"), value: "3" },
  { name: getTerm("changeLang"), value: "4" },
  { name: getTerm("exit"), value: "9" },
];

async function handleMenuChoice(choice) {
  try {
    switch (choice) {
      case "1":
        log("Creating new Character");
        await createCharacterMenu();
        break;
      case "2":
        log("Inspecting Character");
        await inspectCharacter();
        break;
      case "3":
        log("Campaign Start");
        await startCampaign();
        break;
      case "4":
        await changeLanguage();
        break;
      case "9":
        await exitProgram();
      default:
        log("Invalid option selected", LogTypes.ERROR);
    }
  } catch (error) {
    log(`Error in menu operation: ${error.message}`, LogTypes.ERROR);
  }
}

/**
 * The main menu and game loop of the app
 */
async function main() {
  try {
    while (true) {
      totalClear();
      const choice = await themedSelect({
        message: getTerm("chooseOption"),
        choices: getMenuOptions(),
      });

      await handleMenuChoice(choice);
    }
  } catch (error) {
    log("Error: " + error, LogTypes.ERROR);
    main();
  }
}

process.on("SIGINT", async () => {
  log("Exiting Program via Ctrl-C", LogTypes.WARN);
  await exitProgram();
});

async function exitProgram() {
  log("Program ended");
  saveSettingsData({
    language: getLanguage(),
    primaryColor: getPrimaryColor(),
    secondaryColor: getSecondaryColor(),
  });
  await slowWrite(getTerm("goodbye"));
  process.exit(0);
}

export function getCurrentColor() {
  return color || "white";
}

///////////////////////////////////////////// MAIN PROGRAM /////////////////////////////////////////////////
const dataDir = path.join(process.cwd(), "storage");
fs.ensureDirSync(dataDir);
log("Program started");

let settings = await getSettingsData();
setLanguage(settings?.language || "de");
setPrimaryColor(settings?.primaryColor || "#E04500");
setSecondaryColor(settings?.secondaryColor || "#FFFFFF")

await newPlayerScreen();
await welcomeScreen();

main();
////////////////////////////////////////////////////////////////////////////////////////////////////////////
