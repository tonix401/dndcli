// src/gameMaster.ts
import inquirer from "inquirer";

/**
 * Extracts option lines from narrative and prompts the user to choose one.
 * Always includes "Return to main menu" as an option.
 */
export async function promptForChoice(narrative: string): Promise<string> {
  const optionRegex = /(\d+)\.\s+(.*)/g;
  const options: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = optionRegex.exec(narrative)) !== null) {
    options.push(match[0]);
  }
  if (
    !options.some((opt) => opt.toLowerCase().includes("return to main menu"))
  ) {
    options.push("Return to main menu");
  }
  const { selectedOption } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedOption",
      message: "Choose an option (or type 'exit' to cancel):",
      choices: options,
    },
  ]);
  return selectedOption;
}
