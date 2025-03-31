import { getTerm } from "@utilities/LanguageService.js";
import { createCharacterMenu } from "@components/CreateCharacterMenu.js";
import { inspectCharacter } from "@components/InspectCharacter.js";
import {
  primaryColor,
  skippableSlowWrite,
  totalClear,
} from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";
import { settingsMenu } from "@components/SettingsMenu.js";
import {
  getLanguage,
  getPassword,
  getTheme,
  setLanguage,
  setTheme,
} from "@utilities/CacheService.js";
import { secretDevMenu } from "@components/DeveloperMenu.js";
import { inspectInventory } from "@components/InspectInventory.js";
import { titleScreen } from "@components/TitleScreen.js";
import { startCampaign } from "@utilities/GameService.js";
import { tutorial } from "@components/Tutorial.js";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { getErrorMessage } from "@resources/generalScreens/errorMessage.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";
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
      break;
    default:
      log(
        `Dev Menu: Unexpected menu choice: '${choice}', fallback onto default, showing error`,
        "Error"
      );
      throw new TypeError("Unexpected menu choice is not handled correctly");
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
  log(error, "Error");
  console.log(getErrorMessage(error));
  process.exit(0);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////
