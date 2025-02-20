import { log, LogTypes } from "../utilities/LogService.js";
import {
  alignTextAsMultiTable,
  pressEnter,
  themedSelect,
  totalClear,
} from "../utilities/ConsoleService.js";
import { getTerm } from "../utilities/LanguageService.js";
import {
  getLanguage,
  getPassword,
  getTheme,
} from "../utilities/CacheService.js";
import chalk from "chalk";
import { exitProgram } from "../utilities/ErrorService.js";
import {
  getSettingsData,
  saveSettingsData,
} from "../utilities/SettingsService.js";
import { flipATable } from "./OminousFlip.js";
import {
  checkPasswordScreen,
  setPasswordScreen,
} from "../utilities/PasswordService.js";
import { runCombat } from "../src/combat.js";
import {
  getCharacterData,
  saveCharacterData as saveCharData,
} from "../utilities/CharacterService.js";
import { getStartingItems } from "../utilities/InventoryService.js";
import { showSettingsData } from "./ShowSettingsData.js";
import { showLogsMenu } from "./ShowLogsMenu.js";

// ----------------- (Temporary) Test Combat Section -----------------

const testEnemy = {
  name: "Test Dummy",
  hp: 80,
  maxhp: 80,
  attack: 8,
  defense: 3,
  xpReward: 50,
  moves: [
    {
      name: "Curse Strike",
      type: "attack" as "attack",
      multiplier: 1.3,
      description: "A dark, cursed attack.",
    },
    {
      name: "Defensive Ward",
      type: "defend" as "defend",
      description: "Raises its defenses for a short time.",
    },
    {
      name: "Intimidating Howl",
      type: "scare" as "scare",
      description: "Attempts to frighten you, making you lose your next turn.",
    },
    {
      name: "Healing Ritual",
      type: "heal" as "heal",
      healAmount: 12,
      description: "Calls on dark forces to heal itself.",
    },
  ],
};

async function testCombat() {
  let character = getCharacterData();
  if (!character) {
    console.log(chalk.hex(getTheme().primaryColor)(getTerm("noCharacter")));
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
      character.xp = Number(character.xp) + testEnemy.xpReward;
      saveCharData(character);
    } else if (result.fled) {
      console.log(chalk.yellowBright("\nYou fled from combat!"));
    } else {
      console.log(chalk.redBright("\nYou were defeated!"));
    }
  }

  await pressEnter();
}

// ----------------- Old Developer Menu Section -----------------

async function showWorkInProgress() {
  console.log(chalk.hex(getTheme().primaryColor)(getTerm("currentlyInDev")));
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
      name: getTerm("showSettingsData"),
      value: "showSettingsData",
    },
    {
      name: getTerm("showCharacterData"),
      value: "showCharacterData",
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
      name: getTerm("flip"),
      value: "flip",
    },
    {
      name: "Test Combat",
      value: "testCombat",
    },
    {
      name: getTerm("goBack"),
      value: "goBack",
    },
  ];

  if (!(await checkPasswordScreen(3))) {
    console.log(chalk.hex(getTheme().primaryColor)(getTerm("invalid")));
    return;
  }

  while (true) {
    totalClear();
    try {
      const chosenOption = await themedSelect({
        message: getTerm("devMenu"),
        choices: devMenuOptions,
      });
      switch (chosenOption) {
        case "showSettingsData":
          log("Dev Menu: showing saved data");
          await showSettingsData();
          break;
        case "showCharacterData":
          log("Dev Menu: showing character data");
          await showWorkInProgress();
          break;
        case "showLogs":
          log("Dev Menu: showing log options");
          await showLogsMenu();
          break;
        case "setPassword":
          await setPasswordScreen();
          break;
        case "flip":
          await flipATable();
          break;
        case "testCombat":
          await testCombat();
          break;
        case "goBack":
          return;
        default:
          log("Secret Dev Menu: Unexpected menu choice", LogTypes.ERROR);
          console.log(getTerm("invalid"));
          await pressEnter();
      }
    } catch (error) {
      await exitProgram();
      log("Dev menu: User force closed the prompt", LogTypes.WARNING);
    }
  }
}
