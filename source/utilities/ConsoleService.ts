import readline from "readline";
import { log } from "@utilities/LogService.js";
import { input } from "@inquirer/prompts";
import chalk from "chalk";
import { getTerm } from "@utilities/LanguageService.js";
import { getTheme } from "@utilities/CacheService.js";
import ansiRegex from "ansi-regex";
import getTemplateRoomAscii from "@resources/templates/templates.js";
import util from "util";
import boxen from "boxen";
import getEmptyAscii from "@resources/rooms/emptyAscii.js";
import fs from "fs-extra";
import Config from "./Config.js";
import path from "path";
import { themedSingleKeyPrompt } from "@utilities/MenuService.js";

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

export function primaryColor(text: string) {
  return chalk.hex(getTheme().primaryColor)(text);
}
export function secondaryColor(text: string) {
  return chalk.hex(getTheme().secondaryColor)(text);
}
export function accentColor(text: string) {
  return chalk.hex(getTheme().accentColor)(text);
}
export function errorColor(text: string) {
  return errorColor(text);
}

/**
 * Prompt the user to press enter or right to continue
 */
export async function pressEnter(
  config?: { message?: string; allowLeft?: boolean }
): Promise<void> {
  let keybindings;
  const message = config?.message ?? getTerm("pressEnter");
  const allowLeft = config?.allowLeft ?? false;

  // Left is only allowed for info screen where you can go back
  if (allowLeft) {
    keybindings = {
      return: true,
      right: true,
      left: true,
    };
  } else {
    keybindings = {
      return: true,
      right: true,
    };
  }

  return await themedSingleKeyPrompt({
    message: message,
    keybindings: keybindings,
    theme: {
      prefix: getTheme().cursor,
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

  let width = Math.max(
    ...rows.map((row) => removeFormatting(row.join("")).string.length)
  );
  width = width >= internalMinWidth ? width : internalMinWidth;

  const result = rows.map(
    (row) =>
      formattedMargin +
      row[0] +
      separator +
      " ".repeat(width - removeFormatting(row.join("")).string.length) +
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
 * alignTextAsMultiTable([[["Firstname", "Jon"],["Lastname", "Doe"]][["Firstname", "Peter"],["Lastname", "Poe"]], " | ")
 *
 * Firstname  Jon | Firstname  Peter
 * Lastname   Doe | Lastname     Poe
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

  // Example: Firstname  Jon | Firstname  Peter
  //          Lastname   Doe | Lastname     Poe
  const multitableRows = alignedTables[0].map((_l, yIndex) => {
    let line = "";
    for (let xIndex = 0; xIndex < tables.length; xIndex++) {
      line += alignedTables[xIndex][yIndex];
      if (xIndex < tables.length - 1) {
        line += tableSeparator;
      }
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
      overlayTextOnLineAndFormat(line, textLines[index - margin] || "")
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
    .map((line, index) =>
      overlayTextOnLineAndFormat(line, textLines[index - y] || "")
    )
    .join("\n");
}

/**
 * Overlays text on the middle of a different line, the resulting line will be the same length as the first one
 * @note THE EMPTY LINE WILL BE REFORMATTED WITH THE SECONDARY COLOR
 * @param emptyLine The empty line to overlay on
 * @param text The text to overlay
 * @returns The text on the line
 * @example
 * overlayTextOnLine("//////////////////////", "Hello")
 * -> "////////Hello/////////"
 */
export function overlayTextOnLineAndFormat(
  emptyLine: string,
  text: string
): string {
  const noFormatEmptyLine = removeFormatting(emptyLine).string;
  const { string, hadFormatting } = removeFormatting(text);
  const noFormatText = string;

  if (noFormatText.length > noFormatEmptyLine.length) {
    return text;
  }

  const middlePosition = Math.floor(noFormatEmptyLine.length / 2);
  const startPosition = middlePosition - Math.floor(noFormatText.length / 2);

  const firstPart = noFormatEmptyLine.substring(0, startPosition);
  const lastPart = noFormatEmptyLine.substring(
    startPosition + noFormatText.length
  );

  const resultLine =
    secondaryColor(firstPart) +
    (hadFormatting ? text : primaryColor(text)) +
    secondaryColor(lastPart);
  return resultLine;
}

/**
 * Removes all formatting from a string
 * @param text The text to remove formatting from
 * @returns Text without formatting
 */
export function removeFormatting(text: string): {
  string: string;
  hadFormatting: boolean;
} {
  const result = util.stripVTControlCharacters(text);
  return { string: result, hadFormatting: result.length !== text.length };
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

/**
 * Plays an animation from the frames in the given file
 * @param file A file name in the resources/animations folder
 * @param loops How often the animation should be played
 */
export async function playAnimation(
  file: string,
  loops: number = 1
): Promise<void> {
  const filePath = path.join(Config.RESOURCES_DIR, "animations", file);

  totalClear();
  const data = await fs.readFile(filePath, "utf-8");

  if (!data) {
    throw new Error("No data found in file");
  }

  const parsed = JSON.parse(data);

  if (!parsed.frames || !parsed.frameTime || !Array.isArray(parsed.frames)) {
    throw new Error(
      "File is missing some required properties: frames or frameTime"
    );
  }

  parsed.frames = parsed.frames.map((frame: string[]) =>
    frame.map((line: string) => line.replaceAll(".", " "))
  );

  for (let index = 0; index < loops; index++) {
    for (const frameIndex in parsed.frames) {
      totalClear();
      // escape character to try and hide the cursor
      console.log(
        "\u001B[?25l" + secondaryColor(parsed.frames[frameIndex].join("\n"))
      );
      await pause(parsed.frameTime);
    }
  }
  totalClear();
}
