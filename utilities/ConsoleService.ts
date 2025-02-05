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
  charDelay: number = 40,
  lineDelay: number = 500,
  formatting = (char: string) => char
) {
  let isSkipping = false;
  let typedText = "";

  // Enable raw mode to capture key presses
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

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
      process.stdout.write(formatting(line[j]));
      typedText += line[j];
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
  if (isSkipping) {
    await pause(500);
  }

  // Restore terminal settings
  process.stdin.setRawMode(false);
  process.stdin.removeAllListeners("keypress");

  return;
}