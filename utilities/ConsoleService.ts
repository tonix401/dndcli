import readline from "readline";
import { log } from "./LogService.js";

/**
 * Clears the console completely, without leaving any annoying scroll-up buffer behind
 */
export function totalClear(): void {
  process.stdout.write("\x1Bc\x1B[3J\x1B[H\x1B[2J");
}

/**
 * Pauses for a given number of milliseconds
 * @example
 * await pause(2000);
 * -> pauses the app for 2 seconds
 */
export async function pause(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * The coolest console writing ever
 * @param message The message to print
 * @param charDelay The delay between characters
 * @param lineDelay The delay between lines
 * @param formatting A formatting function
 * @example slowWrite("Some text", 40, 500, false, (char) => chalk.bold(chalk.cyan(char)));
 */
export async function slowWrite(
  message: string,
  charDelay: number = 40,
  lineDelay: number = 500,
  formatting = (char: string) => char
) {
  const lines = message.split("\n");
  for (let i in lines) {
    const line = lines[i].split("");
    for (let j in line) {
      process.stdout.write(formatting(line[j]));
      await pause(charDelay);
    }
    process.stdout.write("\n");
    await pause(lineDelay);
  }
}

/**
 * Type for a text formatting function
 * @example
 * (char) => chalk.bold(chalk.blue(char))
 */
type formattingFunction = (char: string) => string;

/**
 * The config for the skippableSlowWrite function
 */
type slowWriteConfig = {
  charDelay?: number;
  lineDelay?: number;
  formattings?: formattingFunction[];
  forceSkip?: boolean;
  hasSafetyBuffer?: boolean;
};

/**
 * The coolest console writing ever
 * @param message The message to print
 * @param hasSafetyBuffer Defines whether there is a short delay after skipping to prevent accidental input from affecting the next part of the CLI
 * @param charDelay The delay between characters
 * @param lineDelay The delay between lines
 * @param formatting A formatting function
 * @example slowWrite("Some text", 40, 500, false, (char) => chalk.bold(chalk.cyan(char)));
 */
export async function skippableSlowWrite(
  message: string,
  config: slowWriteConfig = {}
) {
  const {
    charDelay = 40,
    lineDelay = 500,
    forceSkip = false,
    hasSafetyBuffer = true,
    formattings = [(char) => char],
  } = config;

  let isSkipping: boolean = forceSkip;

  // Enable raw mode to capture key presses
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  // DO NOT REMOVE "str", OTHERWISE STUFF BREAKS
  process.stdin.on("keypress", (str, key) => {
    if (key.name === "return") {
      log("Skipping text...");
      isSkipping = true;
    }
  });

  const lines = message.split("\n");
  for (let i in lines) {
    const line = lines[i].split("");
    for (let j in line) {
      // for some weird reason i is a string here, so it has to be parsed into a number
      process.stdout.write(
        getFormattingFunction(parseInt(i), formattings)(line[j])
      );
      if (!isSkipping) {
        await pause(charDelay);
      }
    }
    process.stdout.write("\n");
    if (!isSkipping) {
      await pause(lineDelay);
    }
  }

  // Prevent accidental input from affecting the next part of the CLI
  if (isSkipping && hasSafetyBuffer) {
    await pause(500);
  }

  // Restore terminal settings
  process.stdin.setRawMode(false);
  process.stdin.removeAllListeners("keypress");

  return;
}

function getFormattingFunction(
  index: number,
  formattings: formattingFunction[]
): formattingFunction {
  if (formattings[index]) {
    return formattings[index];
  }
  return formattings[formattings.length - 1];
}
