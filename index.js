import { createCharacterMenu } from "./js/components/CreateCharacterMenu.js";
import LogTypes from "./js/types/LogTypes.js";
import { log } from "./js/utilities/LogService.js";
import { select } from "@inquirer/prompts";

const menuOptions = [
  {
    name: "Einen neuen Charakter erstellen",
    value: "1",
  },
  {
    name: "Option 2",
    value: "2",
  },
  {
    name: "Option 3",
    value: "3",
  },
  {
    name: "Exit",
    value: "9",
  },
];

// Program loop
main();

async function main() {
  try {
    log("Program started");

    while (true) {
      const input = await select({
        message: "Bitte wählen:",
        choices: menuOptions,
      });

      switch (input) {
        case "1":
          log("Option 1 selected");
          await createCharacterMenu();
          break;
        case "2":
          log("Option 2 selected");
          break;
        case "3":
          log("Option 3 selected");
          break;
        case "9":
          log("Program ended");
          console.log("Bis bald!👋");
          process.exit();
      }
    }
  } catch (error) {
    log(error, LogTypes.ERROR);
  }
}
