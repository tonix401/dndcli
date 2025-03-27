import { getTerm } from "@core/LanguageService.js";
import { createCharacterMenu } from "@components/CreateCharacterMenu.js";
import { inspectCharacter } from "@components/InspectCharacter.js";
import {
  primaryColor,
  skippableSlowWrite,
  totalClear,
} from "@core/ConsoleService.js";
import { log } from "@core/LogService.js";
import { settingsMenu } from "@components/SettingsMenu.js";
import {
  getLanguage,
  getPassword,
  getTheme,
  setLanguage,
  setTheme,
} from "@core/CacheService.js";
import { secretDevMenu } from "@components/DeveloperMenu.js";
import { inspectInventory } from "@components/InspectInventory.js";
import { titleScreen } from "@components/TitleScreen.js";
import { startCampaign } from "@game/GameService.js";
import { tutorial } from "@components/Tutorial.js";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { getErrorMessage } from "@resources/generalScreens/errorMessage.js";
import { getDataFromFile, saveDataToFile } from "@core/StorageService.js";
import Config from "@utilities/Config.js";

const getMenuOptions = () => [
  { name: getTerm("createCharacter"), value: "createChar" },
  { name: getTerm("inspectCharacter"), value: "inspectChar" },
  { name: getTerm("inspectInventory"), value: "inspectInv" },
  { name: getTerm("startCampaign"), value: "startCampaign" },
  { name: getTerm("settings"), value: "settings" },
  { name: getTerm("devMenu"), value: "devMenu" },
  { name: getTerm("tutorial"), value: "tutorial" },
  { name: getTerm("exit"), value: "goBack" },
];

/**
 * Handles the user's choice in the main menu
 * @param choice The choice made by the user in the menu
 */
async function handleMenuChoice(choice: string) {
  switch (choice) {
    case "createChar":
      log("Index: Creating new Character");
      await createCharacterMenu();
      break;
    case "inspectChar":
      log("Index: Inspecting Character");
      await inspectCharacter();
      break;
    case "startCampaign":
      log("Index: Campaign Start");
      await startCampaign();
      break;
    case "settings":
      log("Index: Opening Settings");
      await settingsMenu();
      break;
    case "devMenu":
      await secretDevMenu();
      break;
    case "inspectInv":
      await inspectInventory();
      break;
    case "tutorial":
      await tutorial(false);
      break;
    case "goBack":
      totalClear();
      const isSure = await themedSelectInRoom({
        message: getTerm("confirmExit"),
        choices: [
          { name: getTerm("yes"), value: "yes" },
          { name: getTerm("no"), value: "goBack" },
        ],
        canGoBack: true,
        default: "goBack",
      });
      if (isSure === "yes") {
        await exitProgram();
      }
    default:
      log("Index: Unexpected menu choice", "Error");
  }
}

/**
 * The main menu and game loop of the app
 */
async function main() {
  log("Index: Program started");

  const settings = getDataFromFile("settings");
  setLanguage(settings?.language || "de");
  setTheme(settings?.theme || Config.STANDARD_THEME);

  await titleScreen();

  while (true) {
    totalClear();
    const choice = await themedSelectInRoom({
      message: getTerm("mainMenu"),
      choices: getMenuOptions(),
      canGoBack: true,
    });
    await handleMenuChoice(choice);
  }
}

/**
 * Exits the program and clears the console
 */
async function exitProgram() {
  totalClear();
  log("Index: Program ended");
  saveDataToFile("settings", {
    language: getLanguage(),
    theme: getTheme(),
    password: getPassword(),
  });
  await skippableSlowWrite(primaryColor(getTerm("goodbye")));
  process.exit(0);
}

///////////////////////////////////////////// MAIN PROGRAM /////////////////////////////////////////////////

main().catch(async (error) => {
  totalClear();
  log("Index: Error in main function, " + error, "Error");
  console.log(getErrorMessage(error));
  process.exit(0);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////
