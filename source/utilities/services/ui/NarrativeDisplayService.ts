import { log } from "@utilities/LogService.js";
import {
  totalClear,
  pressEnter,
  navigationPrompt,
  removeFormatting,
  overlayTextOnLineAndFormat,
  wordWrap,
} from "@utilities/ConsoleService.js";
import { primaryColor, secondaryColor } from "@utilities/ConsoleService.js";
import chalk from "chalk";
import Config from "@utilities/Config.js";
import path from "path";
import { IGameState } from "@utilities/IGameState.js";
import { deduplicateGameState } from "@utilities/SaveLoadService.js";

/**
 * Displays ASCII art from a string or loads it from a file
 * @param source Either a string containing ASCII art or a path to a JSON file with frames
 * @param options Configuration options for displaying the ASCII art
 * @returns Promise that resolves when the ASCII art is displayed
 */
export async function displayAsciiArt(
  source: string | { frames: string[][] } | { filepath: string },
  options: {
    color?: string | ((text: string) => string);
    frameIndex?: number;
  } = {}
): Promise<void> {
  try {
    const { color = secondaryColor, frameIndex = 0 } = options;
    const colorFn =
      typeof color === "string"
        ? (text: string) => chalk.hex(color)(text)
        : color;

    let artText: string = "";

    // Handle different source types
    if (typeof source === "string") {
      // Source is direct ASCII art text
      artText = source;
    } else if ("frames" in source && Array.isArray(source.frames)) {
      // Source is a pre-loaded JSON object with frames
      if (source.frames.length > frameIndex) {
        const frame = source.frames[frameIndex];
        artText = Array.isArray(frame) ? frame.join("\n") : String(frame);
      }
    } else if ("filepath" in source) {
      // Source is a file path to load
      const fs = await import("fs");
      const path = await import("path");

      // Determine if it's an absolute path or relative to resources
      let filePath = source.filepath;
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(Config.RESOURCES_DIR, "animations", filePath);
      }

      const data = await fs.promises.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);

      if (
        parsed.frames &&
        Array.isArray(parsed.frames) &&
        parsed.frames.length > frameIndex
      ) {
        const frame = parsed.frames[frameIndex];
        artText = Array.isArray(frame) ? frame.join("\n") : String(frame);
      } else {
        throw new Error(`Invalid frame data in file: ${filePath}`);
      }
    }

    // Apply color function and display
    console.log(colorFn(artText));
  } catch (error) {
    log(
      `Narrative Display Service: Error displaying ASCII art: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Warn "
    );
  }
}

/**
 * Displays text in a book-style format with pagination
 * @param text The text content to display
 * @param options Configuration options for the book display
 * @returns Promise that resolves when the user exits the book view
 */
export async function displayTextInBookFormat(
  text: string,
  options: {
    title?: string;
    pageSize?: number;
    clearConsole?: boolean;
    asciiArt?: string;
    isRecap?: boolean;
    formatTextFn?: (text: string) => string;
    exitOnLastPage?: boolean; // New option to control whether to exit when reaching the last page
  } = {}
): Promise<void> {
  const {
    title = "",
    pageSize: initialPageSize = 15,
    clearConsole = true,
    asciiArt = "",
    isRecap = false,
    formatTextFn = null,
    exitOnLastPage = true, // Default is to exit the book view when on last page
  } = options;

  // If this is a recap, apply special formatting if no custom formatter is provided
  let displayText = text;
  if (isRecap && !formatTextFn) {
    displayText = text
      .replace(/\.\s+(?=[A-Z])/g, ".\n\n") // Add line breaks between sentences that start with capital letters
      .replace(/([.!?])\s+/g, "$1 "); // Ensure proper spacing after punctuation
  } else if (formatTextFn) {
    displayText = formatTextFn(text);
  }

  if (clearConsole) {
    totalClear();
  }

  // Fix potential "Chapter Chapter" duplication in title
  const cleanTitle = title.replace(/^Chapter\s+Chapter/, "Chapter");

  // Process ASCII art if provided to determine dimensions
  let asciiArtLines: string[] = [];
  let asciiArtWidth = 0;
  let asciiArtHeight = 0;

  if (asciiArt) {
    asciiArtLines = asciiArt.split("\n");
    asciiArtHeight = asciiArtLines.length;
    // Find the width of the widest line in the ASCII art
    asciiArtWidth = Math.max(
      ...asciiArtLines.map((line) => removeFormatting(line).text.length)
    );
  }

  // Process text to respect line breaks and word wrapping
  const processedText = wordWrap(
    displayText,
    Math.max(70, asciiArtWidth + 6) - 2,
    {
      condenseEmptyLines: true,
      maxConsecutiveEmptyLines: 2,
    }
  );
  const contentLines = processedText
    .split("\n")
    .filter((line) => line !== undefined);

  // Determine book dimensions based on content and ASCII art
  const CONTENT_WIDTH = Math.max(70, asciiArtWidth + 6); // Add padding
  const BOOK_WIDTH = CONTENT_WIDTH + 8; // Add border width

  // Calculate the optimal visible page size - make it large enough for the ASCII art
  // Use the full ASCII art height without any limits for the ASCII art page
  const contentPageSize = initialPageSize;
  const asciiPageSize = asciiArtHeight + 4; // Add a few lines of padding around the ASCII art

  // Create pages array - first add ASCII art as a special page if it exists
  const allContentPages: Array<{
    lines: string[];
    isAsciiArt: boolean;
    pageSize: number;
  }> = [];

  // If we have ASCII art, add it as a special page - we keep it all on one page regardless of size
  if (asciiArtLines.length > 0) {
    allContentPages.push({
      lines: asciiArtLines,
      isAsciiArt: true,
      pageSize: asciiPageSize,
    });
  }

  // Add text content pages
  for (let i = 0; i < contentLines.length; i += contentPageSize) {
    allContentPages.push({
      lines: contentLines.slice(i, i + contentPageSize),
      isAsciiArt: false,
      pageSize: contentPageSize,
    });
  }

  // Calculate total pages
  const totalPages = allContentPages.length;
  let currentPage = 1;

  // Generate book borders dynamically based on width
  const generateBorder = (width: number, char: string): string =>
    char.repeat(width);

  const displayPage = (page: number) => {
    if (clearConsole) {
      totalClear();
    }

    // Get current page data
    const currentPageData = allContentPages[page - 1];
    if (!currentPageData) return;

    const {
      lines: currentPageContent,
      isAsciiArt: isAsciiArtPage,
      pageSize: currentPageSize,
    } = currentPageData;

    // Generate dynamic borders that adjust to the current page content
    const topBorderChar = "═";
    const topBorder = generateBorder(CONTENT_WIDTH, topBorderChar);

    // Create book frame that expands vertically for ASCII art
    const bookTop = [
      `╔${topBorder}╗`,
      `║${" ".repeat(CONTENT_WIDTH)}║`,
      `╠${topBorder}╣`,
    ];

    const bookBottom = [
      `╠${topBorder}╣`,
      `║${" ".repeat(CONTENT_WIDTH)}║`,
      `╚${topBorder}╝`,
    ];

    // Display book top with title if provided
    const titleLine = bookTop[1];
    let displayTitle = cleanTitle;
    if (isAsciiArtPage) {
      displayTitle = "ASCII Art - " + cleanTitle;
    }
    bookTop[1] = overlayTextOnLineAndFormat(titleLine, displayTitle);

    console.log(secondaryColor(bookTop.join("\n")));

    // Display the actual content lines, making sure ASCII art is fully visible
    for (let i = 0; i < currentPageSize; i++) {
      // Get the content line or empty string if we're past the content
      const line = i < currentPageContent.length ? currentPageContent[i] : "";

      // Handle line length with respect to book width
      let displayLine = line || "";
      const rawLength = removeFormatting(displayLine).text.length;

      if (rawLength > CONTENT_WIDTH - 2) {
        // Trim long lines to ensure they fit
        displayLine = displayLine.substring(0, CONTENT_WIDTH - 5) + "...";
      }

      // Use different text color for recap text or ASCII art
      let colorFn;
      if (isRecap) {
        colorFn = chalk.italic;
      } else if (isAsciiArtPage) {
        colorFn = secondaryColor;
      } else {
        colorFn = primaryColor;
      }

      // Center ASCII art lines horizontally in the book
      if (isAsciiArtPage && rawLength < CONTENT_WIDTH - 2) {
        const padding = Math.floor((CONTENT_WIDTH - 2 - rawLength) / 2);
        displayLine = " ".repeat(padding) + displayLine;
      }

      // Output the line with proper formatting
      console.log(
        secondaryColor("║ ") +
          (displayLine
            ? colorFn(displayLine.padEnd(CONTENT_WIDTH - 2))
            : " ".repeat(CONTENT_WIDTH - 2)) +
          secondaryColor(" ║")
      );
    }

    // Display book bottom with page number and information
    let footerText = `Page ${page}/${totalPages}`;

    // Add helpful navigation hint if we have ASCII art pages
    if (asciiArtLines.length > 0) {
      if (page === 1 && totalPages > 1) {
        footerText += " - Press → for story text";
      } else if (page === 2 && allContentPages[0].isAsciiArt) {
        footerText += " - Story begins here";
      }
    }

    // Add a hint when on the last page if not exiting
    if (page === totalPages && !exitOnLastPage) {
      footerText += " - Press Enter for choices";
    }

    const pageInfoLine = bookBottom[1];
    bookBottom[1] = overlayTextOnLineAndFormat(pageInfoLine, footerText);

    console.log(secondaryColor(bookBottom.join("\n")));

    // Navigation instructions
    if (totalPages > 1) {
      console.log(
        secondaryColor(
          "  Use ← and → arrow keys to navigate pages, [Enter] to continue"
        )
      );
    } else {
      console.log(secondaryColor("  Press [Enter] to continue"));
    }
  };

  // Display initial page - always start with the first page (ASCII art if available)
  displayPage(currentPage);

  // Handle page navigation - keep existing implementation
  let isProcessingKey = false;

  while (true) {
    if (isProcessingKey) continue;
    isProcessingKey = true;

    const key = await navigationPrompt({
      allowArrows: true,
      message: "",
      currentPage: currentPage,
      totalPages: totalPages,
    });
    if (key === "right" && currentPage < totalPages) {
      currentPage++;
      displayPage(currentPage);
    } else if (key === "left" && currentPage > 1) {
      currentPage--;
      displayPage(currentPage);
    } else if (key === "up" || key === "down") {
      // No navigation action needed for these keys
      displayPage(currentPage);
    } else if (key === "enter") {
      if (clearConsole) {
        totalClear();
      }
      isProcessingKey = false;
      break;
    }

    isProcessingKey = false;
  }
}

/**
 * Displays a game recap in a book-style format
 * @param recap The recap text to display
 * @param options Configuration options for the book display
 * @returns Promise that resolves when the user exits the recap view
 */
export async function displayRecapInBookFormat(
  recap: string,
  options: {
    title?: string;
    clearConsole?: boolean;
    asciiArt?: string;
  } = {}
): Promise<void> {
  const {
    title = "Adventure Recap",
    clearConsole = true,
    asciiArt = "",
  } = options;

  // Use the unified display function with isRecap flag
  await displayTextInBookFormat(recap, {
    title: title,
    clearConsole: clearConsole,
    pageSize: 15,
    asciiArt: asciiArt,
    isRecap: true, // Apply special styling for recaps
  });
}

/**
 * Gets ASCII art content from a file
 * @param filename The name of the ASCII art file
 * @returns The ASCII art content as a string or empty string if not found
 */
export async function getAsciiArtContent(filename: string): Promise<string> {
  try {
    const fs = await import("fs");
    const filePath = path.resolve(Config.RESOURCES_DIR, "ascii_art", filename);

    if (
      await fs.promises
        .access(filePath)
        .then(() => true)
        .catch(() => false)
    ) {
      return await fs.promises.readFile(filePath, "utf-8");
    }

    return "";
  } catch (error) {
    log(
      `Narrative Display Service: Failed to load ASCII art from ${filename}: ${error}`,
      "Info "
    );
    return ""; // Return empty on error
  }
}

/**
 * Displays a recap of the previous narrative.
 * @deprecated Use displayRecapInBookFormat instead
 */
export async function displayRecap(gameState: IGameState): Promise<void> {
  const narrativeHistory = gameState.getNarrativeHistory();
  if (narrativeHistory.length > 0) {
    const recap = narrativeHistory[narrativeHistory.length - 1];
    console.log(
      chalk.bold(primaryColor("\n🔄 Recap of your previous session:"))
    );
    console.log(secondaryColor(recap));
    await pressEnter({
      message: "Review the recap, then press Enter to continue...",
    });
  }
  deduplicateGameState(gameState);
}
