import { LogTypes } from "./js/types/LogTypes.js";
import { log } from "./js/utilities/LogService.js";
import { select } from "@inquirer/prompts";

const menuOptions = [
  {
    name: "Dance",
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

// program loop
main();

async function main() {
  try {
    log("Program started");

    while (true) {
      clear();

      const input = await select({
        message: "Bitte wählen:",
        choices: menuOptions,
      });

      clear();

      switch (input) {
        case "1":
          log("Option 1 selected");
          break;
        case "2":
          log("Option 2 selected");
          break;
        case "3":
          log("Option 3 selected");
          break;
        default:
          console.log(`${input} ist keine valide Eingabe`);
      }
      break;
    }
    log("Program ended");
  } catch (error) {
    log(error, LogTypes.ERROR);
  }
}

function clear() {
  // Clears the console completely, without leaving any annoying scroll-up buffer behind
  process.stdout.write("\x1Bc\x1B[3J\x1B[H\x1B[2J");
}
