import readline from "readline";
import { log } from "@utilities/LogService.js";
import chalk from "chalk";
import { getTerm } from "@utilities/LanguageService.js";
import { getTheme } from "@utilities/CacheService.js";
import ansiRegex from "ansi-regex";
import util from "util";
import boxen from "boxen";
import getEmptyAscii from "@resources/rooms/emptyAscii.js";
import fs from "fs-extra";
import Config from "@utilities/Config.js";
import path from "path";
import {
  isConfirmKey,
  isRightKey,
  themedSingleKeyPrompt,
} from "@utilities/MenuService.js";
import ansiEscapes from "ansi-escapes";
import { IAnimation } from "@utilities/IAnimation.js";

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
    if (isConfirmKey(key) || isRightKey(key)) {
      log("Console Service: Skipping text...");
      isSkipping = true;
    }
  });

  process.stdout.write(ansiEscapes.cursorHide);
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
  return chalk.hex(getTheme().errorColor)(text);
}

/**
 * Prompt the user to press enter or right to continue
 */
export async function pressEnter(config?: {
  message?: string;
  allowLeft?: boolean;
}): Promise<void> {
  const message = config?.message ?? getTerm("pressEnter");
  const allowLeft = config?.allowLeft ?? false;

  // Normal confirmation keys
  let keybindings: Record<string, string | boolean> = {
    return: true,
    right: true,
    space: true,
  };

  // Add left keybindings if allowed
  if (allowLeft) {
    keybindings = {
      ...keybindings,
      left: true,
      q: true,
      escape: true,
    };
  }

  process.stdout.write(ansiEscapes.cursorHide);
  return await themedSingleKeyPrompt({
    message: message,
    keybindings: keybindings,
    theme: {
      prefix: getTheme().cursor,
    },
  });
}

/**
 * Navigation helper for menu interfaces with pagination
 * Returns the key pressed by the user
 * @param config Optional configuration for the navigation prompt
 * @returns The key that was pressed
 */
export async function navigationPrompt(config?: {
  message?: string;
  allowNumbers?: boolean;
  allowArrows?: boolean;
  allowEscape?: boolean;
  currentPage?: number;
  totalPages?: number;
}): Promise<string> {
  const message = config?.message ?? "";
  const allowNumbers = config?.allowNumbers ?? true;
  const allowArrows = config?.allowArrows ?? true;
  const allowEscape = config?.allowEscape ?? true;
  const currentPage = config?.currentPage;
  const totalPages = config?.totalPages;

  const keybindings: Record<string, string> = {
    return: "enter",
  };

  if (allowNumbers) {
    keybindings["0"] = "0";
    keybindings["1"] = "1";
    keybindings["2"] = "2";
  }

  if (allowArrows) {
    // Only allow navigation keys if they make sense in the current context
    if (
      currentPage === undefined ||
      totalPages === undefined ||
      currentPage > 1
    ) {
      keybindings.left = "left";
    }

    if (
      currentPage === undefined ||
      totalPages === undefined ||
      currentPage < totalPages
    ) {
      keybindings.right = "right";
    }

    keybindings.up = "up";
    keybindings.down = "down";
  }

  if (allowEscape) {
    keybindings.escape = "escape";
    keybindings.q = "q";
  }

  process.stdout.write(ansiEscapes.cursorHide);
  return await themedSingleKeyPrompt({
    message: message,
    keybindings: keybindings,
    theme: {
      prefix: getTheme().cursor,
    },
  });
}

/**
 * Wraps text to fit within a specified width, respecting explicit line breaks
 * @param text The text to wrap
 * @param width Maximum line width
 * @param options Configuration options for word wrapping
 * @returns Wrapped text with line breaks
 */
export function wordWrap(
  text: string,
  width: number,
  options: {
    condenseEmptyLines?: boolean;
    maxConsecutiveEmptyLines?: number;
  } = {}
): string {
  if (!text) return "";

  const { condenseEmptyLines = true, maxConsecutiveEmptyLines = 2 } = options;

  // Normalize line endings
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const words = text.split(" ");
  let lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    // Handle explicit newlines in the text
    if (word.includes("\n")) {
      const parts = word.split("\n");
      parts.forEach((part, i) => {
        if (i === 0) {
          // First part goes with the current line
          if (currentLine.length + part.length + 1 <= width) {
            currentLine += (currentLine ? " " : "") + part;
          } else {
            lines.push(currentLine);
            currentLine = part;
          }
        } else {
          // Other parts start new lines
          if (currentLine) {
            lines.push(currentLine);
            currentLine = "";
          }
          if (part) {
            if (part.length <= width) {
              currentLine = part;
            } else {
              lines.push(part.substring(0, width));
              currentLine = part.substring(width);
            }
          } else {
            // Add empty line but avoid consecutive empty lines
            if (lines.length === 0 || lines[lines.length - 1] !== "") {
              lines.push("");
            }
          }
        }
      });
    } else {
      // Normal word, add to current line if it fits
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  // Optional condensing of empty lines
  if (condenseEmptyLines) {
    const condensedLines: string[] = [];
    let emptyLineCount = 0;

    for (const line of lines) {
      if (line.trim() === "") {
        emptyLineCount++;
        if (emptyLineCount <= maxConsecutiveEmptyLines) {
          condensedLines.push(line);
        }
      } else {
        emptyLineCount = 0;
        condensedLines.push(line);
      }
    }

    return condensedLines.join("\n");
  }

  return lines.join("\n");
}

/**
 * A function that adds spaces to align multi line text to the center or right, relative to the longest line in the text
 * @param text The text you want to align
 * @param direction Center, right or left, default is left
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
  let width = Math.max(
    ...lines.map((line) => removeFormatting(line).text.length)
  );
  width = width >= internalMinWidth ? width : internalMinWidth;

  // Format lines
  lines = lines.map((line) => {
    const lineLength = removeFormatting(line).text.length;
    const space = " ".repeat(Math.floor((width - lineLength) / 2));
    let result;
    switch (direction) {
      case "left":
        result = line + " ".repeat(width - lineLength);
        break;
      case "center":
        result = " ".repeat(width - lineLength - space.length) + line + space;
        break;
      case "right":
        result = " ".repeat(width - lineLength) + line;
        break;
    }
    return formattedMargin + result + reverseformattedMargin;
  });

  // Return joined lines
  return lines.join("\n");
}

export function alignTextSideBySide(
  text1: string,
  text2: string,
  separator: string = ""
) {
  const height1 = text1.split("\n").length;
  const height2 = text2.split("\n").length;

  const width1 = Math.max(
    ...removeFormatting(text1)
      .text.split("\n")
      .map((line: string) => line.length)
  );
  const width2 = Math.max(
    ...removeFormatting(text2)
      .text.split("\n")
      .map((line: string) => line.length)
  );
  const width = Math.max(width1, width2);

  const height = Math.max(height1, height2);
  const lines1 = alignText(text1, "left").split("\n");
  const lines2 = alignText(text2, "left").split("\n");

  if (height1 < height) {
    for (let i = 0; i < height - height1; i++) {
      lines1.push(" ".repeat(width1));
    }
  }
  if (height2 < height) {
    for (let i = 0; i < height - height2; i++) {
      lines2.push(" ".repeat(width2));
    }
  }

  const result = [];
  for (let i = 0; i < height; i++) {
    const line1 = lines1[i] || "";
    const line2 = lines2[i] || "";
    result.push(line1 + separator + line2);
  }

  return result.join("\n");
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
    ...rows.map((row) => removeFormatting(row.join("")).text.length)
  );
  width = width >= internalMinWidth ? width : internalMinWidth;

  const result = rows.map(
    (row) =>
      formattedMargin +
      row[0] +
      separator +
      " ".repeat(width - removeFormatting(row.join("")).text.length) +
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
 * @param background The background to overlay the text on, if not given, the empty room ascii will be used
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
export function getTextOnBackground(text: string, background?: string): string {
  const bg = background ?? getEmptyAscii();
  const bgLines = bg.split("\n").filter((line) => line.length > 0);
  const textLines = text.split("\n").filter((line) => line.length > 0);
  const margin = Math.round((bgLines.length - textLines.length) / 2);

  if (margin < 2) {
    return text;
  }

  return bgLines
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
  const room = getEmptyAscii();
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
  const noFormatEmptyLine = removeFormatting(emptyLine).text;
  const { text: string, hadFormatting } = removeFormatting(text);
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
  text: string;
  hadFormatting: boolean;
} {
  const result = util.stripVTControlCharacters(text);
  return { text: result, hadFormatting: result.length !== text.length };
}

/**
 * Surrounds text with a box
 * @param text The text to box
 * @param padding The padding to add to the box
 * @returns boxed up string
 */
export function boxItUp(
  text: string,
  padding?: { top: number; bottom: number; left: number; right: number }
): string {
  const pTop = padding?.top ?? 0;
  const pBottom = padding?.bottom ?? 0;
  const pLeft = padding?.left ?? 1;
  const pRight = padding?.right ?? 1;

  return boxen(text, {
    padding: {
      top: pTop,
      bottom: pBottom,
      left: pLeft,
      right: pRight,
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

  const parsed: IAnimation = JSON.parse(data);

  if (!parsed.frames || !parsed.frameTime || !Array.isArray(parsed.frames)) {
    throw new Error(
      "File is missing some required properties: frames or frameTime"
    );
  }

  for (let index = 0; index < loops; index++) {
    for (const frameIndex in parsed.frames) {
      totalClear();
      console.log(
        ansiEscapes.cursorHide +
          secondaryColor(parsed.frames[frameIndex].join("\n"))
      );
      await pause(parsed.frameTime);
    }
  }
  totalClear();
}

/**
 * Sanitizes a JSON string to fix common formatting issues
 */
export function sanitizeJsonString(jsonString: string): string {
  // Remove any leading/trailing non-JSON content
  let sanitized = jsonString.trim();

  // Try to extract just the JSON object if there's text around it
  const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    sanitized = jsonMatch[0];
  }

  // Fix the '+' before numbers issue
  sanitized = sanitized.replace(/:\s*\+(\d+)/g, ": $1");

  // Fix any other common JSON formatting issues
  sanitized = sanitized
    .replace(/,\s*}/g, "}") // Remove trailing commas
    .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
    .replace(/[']/g, '"') // Replace single quotes with double quotes
    .replace(/\\'/g, "'"); // Fix escaped single quotes

  return sanitized;
}
