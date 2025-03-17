import { log } from "@utilities/LogService.js";
import {
  pressEnter,
  primaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { exitProgram } from "@utilities/ErrorService.js";
import { flipATable } from "@components/Developer/OminousFlip.js";
import {
  checkPasswordScreen,
  setPasswordScreen,
} from "@utilities/PasswordService.js";
import { showSettingsData } from "@components/Developer/ShowSettingsData.js";
import { showLogsMenu } from "@components/Developer/ShowLogsMenu.js";
import { showCharacterData } from "@components/Developer/ShowCharacterData.js";
import { resetDataMenu } from "@components/Developer/ResetDataMenu.js";
import { getDataFromFile } from "@utilities/StorageService.js";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { dungeonMinigame } from "@components/DungeonMinigame.js";
import { testImageGeneration } from "./TestImageGeneration.js";
import { handleShopInteraction } from "@utilities/ShopService.js";
import Config from "@utilities/Config.js";
import { testCombat } from "./TestCombat.js";

async function _showWorkInProgress() {
  console.log(primaryColor(getTerm("currentlyInDev")));
  await pressEnter();
}

export async function secretDevMenu() {
  const devMenuOptions: {
    name: string;
    value: string;
  }[] = [
    {
      name: getTerm("settingsData"),
      value: "settings",
    },
    {
      name: getTerm("characterData"),
      value: "character",
    },
    {
      name: getTerm("logsMenu"),
      value: "showLogs",
    },
    {
      name: getTerm("setPassword"),
      value: "setPassword",
    },
    {
      name: getTerm("resetData"),
      value: "resetData",
    },
    {
      name: getTerm("flip"),
      value: "flip",
    },
    {
      name: "Test Combat",
      value: "testCombat",
    },
    {
      name: "Test Shop",
      value: "testShop",
    },
    {
      name: "Test Dungeon",
      value: "testDungeon",
    },
    {
      name: "Test Image Generation",
      value: "testImage",
    },
    {
      name: getTerm("goBack"),
      value: "goBack",
    },
  ];

  if (!(await checkPasswordScreen(3))) {
    console.log(primaryColor(getTerm("invalid")));
    return;
  }

  while (true) {
    try {
      totalClear();
      const chosenOption = await themedSelectInRoom({
        message: getTerm("devMenu"),
        choices: devMenuOptions,
        canGoBack: true,
      });
      totalClear();
      switch (chosenOption) {
        case "settings":
          log("Dev Menu: showing saved data");
          await showSettingsData();
          break;
        case "character":
          log("Dev Menu: showing character data");
          await showCharacterData();
          break;
        case "showLogs":
          log("Dev Menu: showing log options");
          await showLogsMenu();
          break;
        case "setPassword":
          await setPasswordScreen();
          break;
        case "resetData":
          log("Dev Menu: Showing reset Data Menu");
          await resetDataMenu();
          break;
        case "flip":
          await flipATable();
          break;
        case "testCombat":
          await testCombat();
          break;
        case "testShop":
          await handleShopInteraction(
            getDataFromFile("character") || Config.START_CHARACTER
          );
          break;
        case "testDungeon":
          await dungeonMinigame();
          break;
        case "testImage":
          await testImageGeneration();
          break;
        case "goBack":
          return;
        default:
          log("Dev Menu: Unexpected menu choice", "Error");
          console.log(getTerm("invalid"));
          await pressEnter();
      }
    } catch (error) {
      await exitProgram();
      log("Dev menu: User force closed the prompt", "Warn ");
    }
  }
}
