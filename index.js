import { LogTypes } from "./js/types/LogTypes.js";
import { log } from "./js/utilities/LogService.js";
import { select } from "@inquirer/prompts";

const menuOptions = {
  option1: {
    name: "Dance",
    value: "1",
  },
  option2: {
    name: "Option 2",
    value: "2",
  },
  option3: {
    name: "Option 3",
    value: "3",
  },
  option9: {
    name: "Exit",
    value: "9",
  },
};

// program loop
main();

async function main() {
  try {
    log("Program started");

    while (true) {
      clear();

      const input = await select({
        message: "Select an option",
        choices: Object.values(menuOptions).map((o) => o.name),
      });

      clear();

      switch (input) {
        case menuOptions.option1.value:
          log("Option 1 selected");
          break;
        case menuOptions.option2.value:
          log("Option 2 selected");
          break;
        case menuOptions.option3.value:
          log("Option 3 selected");
          break;
        default:
          log("test", LogTypes.ERROR);
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
