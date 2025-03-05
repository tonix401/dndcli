import { totalClear } from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import inquirer from "inquirer";
import ora from "ora";

totalClear();
/////////////////////////




async function main() {
  

  // Ask for input using inquirer
  const { userInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'userInput',
      message: 'Enter some text:',
    }
  ]);

  console.log(`You entered: ${userInput}`);
}

main().catch(error => {
  console.error('An unexpected error occurred:', error);
});

/////////////////////////
