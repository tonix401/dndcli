import inquirer from "inquirer";

/**
 * Extracts option lines from the narrative using a regex in multiline mode.
 * If at least three numbered options are found, they are used.
 * Otherwise, a default set of options is provided.
 * "Return to main menu" is always included.
 */
export async function promptForChoice(narrative: string): Promise<string> {
  // Regex to capture lines that start with a number and a period.
  const optionRegex = /^\s*\d+\.\s+(.*)$/gm;
  const options: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = optionRegex.exec(narrative)) !== null) {
    if (match[1] && match[1].trim().length > 0) {
      options.push(match[1].trim());
    }
  }

  // If less than three options were found, fallback to default choices.
  if (options.length < 3) {
    options.length = 0; // Clear any partial results.
    options.push("🛡️  Option 1: Proceed further into the ruins");
    options.push("🔍  Option 2: Examine your surroundings");
    options.push("📦  Option 3: Check your inventory");
  }

  // Ensure "Return to main menu" is always added.
  if (
    !options.some((opt) => opt.toLowerCase().includes("return to main menu"))
  ) {
    options.push("🔙 Return to main menu");
  }

  const { selectedOption } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedOption",
      message: "👉 Choose an option:",
      choices: options,
    },
  ]);
  return selectedOption;
}
