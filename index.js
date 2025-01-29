import logTypes from "./types/logTypes.js";
import LogService from "./utilities/logService.js";
import { select } from "@inquirer/prompts";

const option1 = "OPTION1";
const option2 = "OPTION2";
const option3 = "OPTION3";
const option4 = "OPTION4";
const option5 = "OPTION5";
const option6 = "OPTION6";
const option7 = "OPTION7";
const option8 = "OPTION8";
const option9 = "OPTION9";

const menuOptions = [
  {
    name: "Option 1",
    value: option1,
  },
  {
    name: "Option 2",
    value: option2,
  },
  {
    name: "Option 3",
    value: option3,
  },
];

// program loop
main();

async function main() {
  try {
    LogService.log("Program started");

    while (true) {
        clear();

        const input = await select({
            message: "Select an option",
            choices: menuOptions,
        });

        clear();

        switch (input) {
            case option1:
                LogService.log("Option 1 selected");
                break;
            case option2:             
                LogService.log("Option 2 selected");
                break;
            case option3:
                LogService.log("Option 3 selected");
                break;
                default:
                console.log("Invalid option");
        }
      break;
    }
    LogService.log("Program ended");
  } catch (error) {
    LogService.log(error, logTypes.ERROR);
  }
}

function clear() {
    // Clears the console completely, without leaving any annoying scroll-up buffer behind
    process.stdout.write("\x1Bc\x1B[3J\x1B[H\x1B[2J");
}
