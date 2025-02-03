import { createCharacterMenu } from "./js/components/CreateCharacterMenu.js";
import LogTypes from "./js/types/LogTypes.js";
import { log } from "./js/utilities/LogService.js";
import { select } from "@inquirer/prompts";
import { totalClear } from "./js/utilities/ConsoleService.js";
import { inspectCharacter } from "./js/components/InspectCharacter.js";

const menuOptions = [
  {
    name: "Create your Character",
    value: "1",
  },
  {
    name: "Inspect your Character",
    value: "2",
  },
  {
    name: "Start Campaign",
    value: "3",
  },
  {
    name: "End Game",
    value: "9",
  },
];

// Program loop
main();

async function main() {
  try {
    log("Program started");

    while (true) {
      totalClear();
      const input = await select(
        {
          message: "Please choose:",
          choices: menuOptions,
        },
        { clearPromptOnDone: true }
      );

      switch (input) {
        case "1":
          log("Option 1 selected");
          await createCharacterMenu();
          break;
        case "2":
          log("Option 2 selected");
          await inspectCharacter();
          break;
        case "3":
          log("Option 3 selected");
          break;
        case "9":
          log("Program ended");
          console.log("See ya!👋");
          process.exit();
      }
    }
  } catch (error) {
    log(error, LogTypes.ERROR);
  }
}
