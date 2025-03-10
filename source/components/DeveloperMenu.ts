import { log } from "@utilities/LogService.js";
import {
  pressEnter,
  primaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import chalk from "chalk";
import { exitProgram } from "@utilities/ErrorService.js";
import { flipATable } from "@components/OminousFlip.js";
import {
  checkPasswordScreen,
  setPasswordScreen,
} from "@utilities/PasswordService.js";
import { runCombat } from "../src/combat.js";
import { getStartingItems } from "@utilities/InventoryService.js";
import { showSettingsData } from "@components/ShowSettingsData.js";
import { showLogsMenu } from "@components/ShowLogsMenu.js";
import { showCharacterData } from "@components/ShowCharacterData.js";
import { resetDataMenu } from "@components/ResetDataMenu.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";
import ICharacter from "@utilities/ICharacter.js";
import { IEnemy } from "@utilities/IEnemy.js";
import { getRandomEnemy } from "@utilities/GameService.js";
import { themedSelectInRoom } from "./ThemedSelectInRoom.js";
import { dungeonMinigame } from "./DungeonMinigame.js";

// ----------------- (Temporary) Test Combat Section -----------------

const testEnemy: IEnemy = getRandomEnemy(
  getDataFromFile("character")?.level ?? 1
);

async function testCombat() {
  let character: ICharacter = getDataFromFile("character");
  if (!character) {
    console.log(primaryColor(getTerm("noCharacter")));
    await pressEnter();
    return;
  }

  // Ensure character has required properties
  if (!character.inventory) {
    character.inventory = getStartingItems(character.class);
  }
  if (!character.abilities) {
    character.abilities = {
      maxhp: 100,
      strength: 10,
      mana: 10,
      dexterity: 10,
      charisma: 10,
      luck: 10,
    };
  }
  if (!character.xp) {
    character.xp = 0;
  }

  // Run combat
  const result = await runCombat(character, testEnemy);

  // Handle combat results
  if (result) {
    if (result.success) {
      console.log(chalk.greenBright("\nCombat test completed successfully!"));
      console.log(chalk.greenBright(`XP gained: ${testEnemy.xpReward}`));
      character.xp = character.xp + testEnemy.xpReward;
      saveDataToFile("character", character);
    } else if (result.fled) {
      console.log(chalk.yellowBright("\nYou fled from combat!"));
    } else {
      console.log(chalk.redBright("\nYou were defeated!"));
    }
  }

  await pressEnter();
}

// ----------------- Developer Menu Section -----------------

async function showWorkInProgress() {
  console.log(primaryColor(getTerm("currentlyInDev")));
  await pressEnter();
}

export async function secretDevMenu() {
  // Merge old options with the new Test Combat option.
  const devMenuOptions: {
    name: string;
    value: string;
    description?: string;
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
      name: "Test Dungeon",
      value: "testDungeon",
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
        case "testDungeon":
          await dungeonMinigame();
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
