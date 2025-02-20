import readline from "readline";
import { log } from "./LogService.js";
import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { getTerm } from "./LanguageService.js";
import { getTheme } from "./CacheService.js";
import { ITheme } from "../types/ITheme.js";

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
  indented?: boolean;
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
    formattings = [(char) => chalk.hex(getTheme().secondaryColor)(char)],
    indented = true,
  } = config;

  let isSkipping: boolean = forceSkip;

  // Enable raw mode to capture key presses
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  // DO NOT REMOVE "str", OTHERWISE STUFF BREAKS
  process.stdin.on("keypress", (str, key) => {
    if (key.name === "return") {
      log("Console Service: Skipping text...");
      isSkipping = true;
    }
  });

  const lines = message.split("\n");
  for (let i in lines) {
    const line = ((indented ? " " : "") + lines[i]).split("");
    for (let j in line) {
      // for some weird reason i is a string here, so it has to be parsed into a number
      process.stdout.write(
        getFormattingFunction(parseInt(i), formattings)(line[j])
      );
      if (!isSkipping && charDelay !== 0) {
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

// for skippableSlowWrite()
function getFormattingFunction(
  index: number,
  formattings: formattingFunction[]
): formattingFunction {
  if (formattings[index]) {
    return formattings[index];
  }
  return formattings[formattings.length - 1];
}


/**
 * A version of the select from inquirer that used the custom theme and current colors
 * @param config The same config select from inquirer/prompt uses
 * @returns The value of the choice the user made
 */
export async function themedSelect(config: any): Promise<string> {
  const theme = {
    prefix: getTheme().prefix,
    icon: {
      cursor: getTheme().cursor,
    },
    style: {
      message: (text: string) =>
        chalk.hex(getTheme().primaryColor)(chalk.bold(text)),
      highlight: (text: string) =>
        chalk.bold(chalk.hex(getTheme().secondaryColor)(text)),
      disabled: (text: string) =>
        chalk.hex(getTheme().secondaryColor).dim("  " + text),
      error: (text: string) => chalk.hex(getTheme().errorColor)(text),

      // doesnt work like i hoped it would
      help: () => "",
    },
    helpMode: "never",
  };
  return await select({ ...config, pageSize: 50, theme: theme }, { clearPromptOnDone: true });
}

export async function themedInput(config: {
  message: string;
  default?: string;
  required?: boolean;
  validate?: (value: string) => boolean | string | Promise<string | boolean>;
}): Promise<string> {
  const theme = {
    prefix: getTheme().prefix,
    style: {
      message: (text: string) =>
        chalk.hex(getTheme().primaryColor)(chalk.bold(text)),
    },
    helpMode: "never",
  };
  return await input({ ...config, theme }, { clearPromptOnDone: true });
}

/**
 * Prompt the user to press enter to continue
 */
export async function pressEnter() {
  await input({
    message: getTerm("pressEnter"),
    theme: {
      style: {
        message: (text: string) =>
          chalk.bold(chalk.hex(getTheme().secondaryColor)(text)),
      },
      prefix: chalk.bold(
        chalk.hex(getTheme().secondaryColor)(getTheme().cursor)
      ),
    },
  });
}

/**
 * A function that adds spaces to align multi line text to the center or right, relative to the longest line in the text
 * @param text The text you want to align
 * @param direction Center or right, (you don't need this for left)
 * @param [margin=""] A string that gets added on both sides, mirrored
 * @param [minWidth=0] The minimum width of the resulting text
 */
export function alignText(
  text: string,
  direction: "left" | "center" | "right",
  margin = "",
  minWidth = 0
) {
  // Setup
  const formattedMargin = chalk.hex(getTheme().secondaryColor)(margin);
  const reverseformattedMargin = chalk.hex(getTheme().secondaryColor)(
    margin.split("").reverse().join("")
  );
  let lines = text.split("\n");

  // Determine Width
  const internalMinWidth = minWidth - margin.length * 2;
  let width = Math.max(...lines.map((line) => line.length));
  width = width >= internalMinWidth ? width : internalMinWidth;

  // Format lines
  lines = lines.map((line) => {
    const space = " ".repeat(Math.floor((width - line.length) / 2));
    let result;
    switch (direction) {
      case "left":
        result = line + " ".repeat(width - line.length);
        break;
      case "center":
        result = " ".repeat(width - line.length - space.length) + line + space;
        break;
      case "right":
        result = " ".repeat(width - line.length) + line;
        break;
    }
    return formattedMargin + result + reverseformattedMargin;
  });

  // Return joined lines
  return lines.join("\n");
}

/**
 * A function to format a console.log as a table
 * @param rows An Array of name/value pairs that will be displayed in the "table" format
 * @param margin A string that will be added on both sides of the table, mirrored
 * @param separator A string that will be added between the name and value, recommended is an amount of spaces
 * @param [minWidth=0] The minimum width of the resulting table
 * @returns An object containing the result and its width and height
 * @example
 * console.log(alignTextAsTable([["First name:", "Jonathan"],["Last name:", "Doe"]], "| ", "  "));
 *
 * | First name  Jonathan |
 * | Last name        Doe |
 */
export function alignTextAsTable(
  rows: [string, string][],
  margin: string = "| ",
  separator: string = "   ",
  minWidth: number = 0
): { text: string; width: number; height: number } {
  const internalMinWidth = minWidth - margin.length * 2 - separator.length;
  const formattedMargin = chalk.hex(getTheme().secondaryColor)(margin);
  const reverseformattedMargin = chalk.hex(getTheme().secondaryColor)(
    margin.split("").reverse().join("")
  );

  let width = Math.max(...rows.map((row) => row.join("").length));
  width = width >= internalMinWidth ? width : internalMinWidth;

  const result = rows.map(
    (row) =>
      formattedMargin +
      row[0] +
      separator +
      " ".repeat(width - row.join("").length) +
      row[1] +
      reverseformattedMargin
  );

  const resultWidth = width + margin.length * 2 + separator.length;
  const resultHeight = result.length;

  return {
    text: result.join("\n"),
    width: resultWidth,
    height: resultHeight,
  };
}

/**
 * Aligns text in several side by side tables
 * @param tables The strings to process into a multi table
 * @param tableSeparator The separator between the tables, please use symmetric ones for best outcomes, a space will be added between any separator and data
 * @example
 * alignTextAsMultiTable([[["Firstname", "Jon"],["Lastname", "Doe"]][["Firstname", "Peter"],["Lastname", "Poe"]], "|")
 *
 * | Firstname  Jon | Firstname  Peter |
 * | Lastname   Doe | Lastname     Poe |
 */
export function alignTextAsMultiTable(
  tables: [string, string][][],
  tableSeparator: string
): { text: string; width: number; height: number } {
  // Adjust for differing table heights by adding empty rows
  const height = Math.max(...tables.map((table) => table.length));
  const heightAdjustedTables = tables.map((table) => {
    let heightAdjustment: [string, string][] = [];
    for (let i = 0; i < height - table.length; i++) {
      heightAdjustment.push(["", ""]);
    }
    table.push(...heightAdjustment);
    return table;
  });

  // Example: [["Firstname  Jon", "Lastname   Doe"],["Firstname  Peter","Lastname     Poe"]]
  const alignedTables = heightAdjustedTables.map((table) =>
    alignTextAsTable(table, "", "   ").text.split("\n")
  );

  // Example: | Firstname  Jon | Firstname  Peter |
  //          | Lastname   Doe | Lastname     Poe |
  const multitableRows = alignedTables[0].map((l, yIndex) => {
    let line = tableSeparator;
    for (let xIndex = 0; xIndex < tables.length; xIndex++) {
      line = line + " " + alignedTables[xIndex][yIndex] + " " + tableSeparator;
    }
    return line;
  });

  // they are all the same length
  const resultWidth = multitableRows[0].length;

  return {
    text: multitableRows.join("\n"),
    width: resultWidth,
    height: height,
  };
}
