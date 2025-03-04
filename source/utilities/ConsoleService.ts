import readline from "readline";
import { log } from "@utilities/LogService.js";
import { input, password, select } from "@inquirer/prompts";
import chalk from "chalk";
import { getTerm } from "@utilities/LanguageService.js";
import { getTheme } from "@utilities/CacheService.js";
import ansiRegex from "ansi-regex";
import getTemplateRoomAscii from "@resources/templates.js";
import util from "util";
import boxen from "boxen";
import getEmptyAscii from "@resources/rooms/emptyAscii.js";

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
 */
export async function pause(time: number): Promise<void> {
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
    indented = true,
  } = config;

  let isSkipping: boolean = forceSkip;

  // Enable raw mode to capture key presses
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (_str, key) => {
    if (key.name === "return") {
      log("Console Service: Skipping text...");
      isSkipping = true;
    }
  });

  const ansiPattern = ansiRegex();
  const lines = message.split("\n");

  for (let i = 0; i < lines.length; i++) {
    let fullLine = (indented ? " " : "") + lines[i];
    const tokens: { text: string; isAnsi: boolean }[] = [];
    let lastIndex = 0;

    // Tokenize the fullLine using ansi-regex
    for (const match of fullLine.matchAll(ansiPattern)) {
      const index = match.index!;
      if (index > lastIndex) {
        // Plain text before the ANSI token
        tokens.push({
          text: fullLine.substring(lastIndex, index),
          isAnsi: false,
        });
      }
      // The ANSI token itself
      tokens.push({ text: match[0], isAnsi: true });
      lastIndex = index + match[0].length;
    }
    if (lastIndex < fullLine.length) {
      tokens.push({
        text: fullLine.substring(lastIndex),
        isAnsi: false,
      });
    }

    // Process tokens: apply formatting only to plain text
    for (const token of tokens) {
      if (token.isAnsi) {
        process.stdout.write(token.text);
      } else {
        for (const char of token.text) {
          process.stdout.write(char);
          if (!isSkipping && charDelay !== 0) {
            await pause(charDelay);
          }
        }
      }
    }
    process.stdout.write("\n");
    if (!isSkipping && lineDelay !== 0) {
      await pause(lineDelay);
    }
  }

  if (isSkipping && hasSafetyBuffer) {
    await pause(500);
  }

  process.stdin.removeAllListeners("keypress");
  return;
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
      message: (text: string) => primaryColor(chalk.bold(text)),
      highlight: (text: string) => chalk.bold(secondaryColor(text)),
      disabled: (text: string) =>
        chalk.hex(getTheme().secondaryColor).dim("  " + text),
      error: (text: string) => chalk.hex(getTheme().errorColor)(text),
    },
    helpMode: "never",
  };
  return await select(
    { ...config, pageSize: 50, theme: theme },
    { clearPromptOnDone: true }
  );
}

/**
 * A version of the input from inquirer that used the custom theme and current colors
 * @param config The same config input from inquirer/prompt uses
 * @returns The value of the input the user entered
 */
export async function themedInput(config: {
  message: string;
  default?: string;
  required?: boolean;
  validate?: (value: string) => boolean | string | Promise<string | boolean>;
}): Promise<string> {
  const theme = {
    prefix: getTheme().prefix,
    style: {
      message: (text: string) => primaryColor(chalk.bold(text)),
    },
    helpMode: "never",
  };
  return await input({ ...config, theme }, { clearPromptOnDone: true });
}

/**
 * A version of the password from inquirer that used the custom theme and current colors
 * @param config The same config password from inquirer/prompt uses
 * @returns The value of the password the user entered
 */
export function themedPassword(config: { message: string }): Promise<string> {
  const theme = {
    prefix: getTheme().prefix,
    style: {
      message: (text: string) => primaryColor(chalk.bold(text)),
    },
    helpMode: "never",
  };
  return password({ ...config, theme, mask: "*" }, { clearPromptOnDone: true });
}

/**
 * Formats text with the primary color
 * @param text The text to format
 * @returns Formatted string
 */
export function primaryColor(text: string) {
  return chalk.hex(getTheme().primaryColor)(text);
}

/**
 * Formats text with the secondary color
 * @param text The text to format
 * @returns Formatted string
 */
export function secondaryColor(text: string) {
  return chalk.hex(getTheme().secondaryColor)(text);
}

/**
 * Prompt the user to press enter to continue
 */
export async function pressEnter() {
  return await input({
    message: getTerm("pressEnter"),
    theme: {
      style: {
        message: (text: string) => chalk.bold(secondaryColor(text)),
      },
      prefix: chalk.bold(secondaryColor(getTheme().cursor)),
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
  const formattedMargin = secondaryColor(margin);
  const reverseformattedMargin = secondaryColor(
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
  const formattedMargin = secondaryColor(margin);
  const reverseformattedMargin = secondaryColor(
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
  const multitableRows = alignedTables[0].map((_l, yIndex) => {
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

/**
 * Overlays the given text over the template room ascii, the room is colored in the secondary color and the text in the primary color
 * @param text The text to display
 * @returns The text in the room ascii
 * @example
 * getTextInRoomAsciiIfNotTooLong(characterDataTable)
 * ->
 * *******************************************************************************
 *           |                   |                  |                  |
 *  _________|___________________|__________________|__________________|__________
 * |                   |                   |                   |
 * |___________________|___________________|___________________|__________________
 *           |                   |                  |                   |
 *  _________|___________________|__________________|___________________|_________
 * |                   |  | XP:                        21 |    |
 * |___________________|__| Stärke:                     0 |____|__________________
 *           |            | Mana:                       0 |               |
 *  _________|____________| Geschicklichkeit:           0 |_______________|_______
 * |                   |  | Charisma:                  10 |   |
 * |___________________|__| Glück:                      7 |___|___________________
 * ____/______/______/____| Items:                      0 |____/______/______/____
 * /______/______/______/_| Zuletzt gespielt:    3.3.2025 |/______/______/______/_
 * ____/______/______/______/______/______/______/______/______/______/______/____
 * /______/______/______/______/______/______/______/______/______/______/______/_
 * ____/______/______/______/______/______/______/______/______/______/______/____
 * /______/______/______/______/______/______/______/______/______/______/______/_
 * *******************************************************************************
 */
export function getTextInRoomAsciiIfNotTooLong(text: string): string {
  const room = getEmptyAscii();
  const roomLines = room.split("\n").filter((line) => line.length > 0);
  const textLines = text.split("\n").filter((line) => line.length > 0);
  const margin = Math.round((roomLines.length - textLines.length) / 2);

  if (margin < 3) {
    return text;
  }

  return roomLines
    .map((line, index) =>
      overlayTextOnLine(line, textLines[index - margin] || "")
    )
    .join("\n");
}

/**
 * Overlays the given text over the template room ascii, the room is colored in the secondary color and the text in the primary color
 * @param text The text to display
 * @param x The x position of the text relative to the left
 * @param y The y position of the text relative to the top
 * @returns
 */
export function getTextInRoomAsciiAtIndexIfNotTooLong(
  text: string,
  x: number,
  y: number
): string {
  const room = getTemplateRoomAscii();
  const roomLines = room.split("\n").filter((line) => line.length > 0);
  const textLines = text.split("\n").filter((line) => line.length > 0);
  // Add padding lines if needed
  for (let i = 0; i < x; i++) {
    textLines.push("");
  }

  if (y < 0) {
    return text;
  }

  return roomLines
    .map((line, index) => overlayTextOnLine(line, textLines[index - y] || ""))
    .join("\n");
}

/**
 * Overlays text on the middle of a different line, the resulting line will be the same length as the first one
 * @param emptyLine The empty line to overlay on
 * @param text The text to overlay
 * @returns The text on the line
 * @example
 * overlayTextOnLine("//////////////////////", "Hello")
 * -> "////////Hello/////////"
 */
export function overlayTextOnLine(emptyLine: string, text: string): string {
  emptyLine = removeFormatting(emptyLine);
  text = removeFormatting(text);

  if (text.length > emptyLine.length) {
    return text;
  }

  const middlePosition = Math.floor(emptyLine.length / 2);
  const startPosition = middlePosition - Math.floor(text.length / 2);
  const firstPart = emptyLine.substring(0, startPosition);
  const lastPart = emptyLine.substring(startPosition + text.length);
  const authorLine =
    secondaryColor(firstPart) + primaryColor(text) + secondaryColor(lastPart);

  return authorLine;
}

/**
 * Removes all formatting from a string
 * @param text The text to remove formatting from
 * @returns Text without formatting
 */
export function removeFormatting(text: string): string {
  return util.stripVTControlCharacters(text);
}

export function boxItUp(text: string): string {
  return boxen(text, {
    padding: {
      top: 0,
      bottom: 0,
      left: 1,
      right: 1,
    },
    borderStyle: {
      topLeft: "/",
      topRight: "\\",
      bottomLeft: "\\",
      bottomRight: "/",
      top: "‾",
      bottom: "_",
      left: "⎸",
      right: "⎹",
    },
    borderColor: getTheme().secondaryColor,
    textAlignment: "center",
  });
}
