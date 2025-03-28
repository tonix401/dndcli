import { IGameState } from "../../types/IGameState.js";
import { log } from "@utilities/LogService.js";
import {
  sanitizeJsonString,
  pause,
  accentColor,
  errorColor,
} from "@utilities/ConsoleService.js";
import { primaryColor, secondaryColor } from "../core/ConsoleService.js";
import { themedSelect } from "@utilities/MenuService.js";
import {
  generateChatNarrative,
  ChatCompletionResponse,
} from "../ai/AIService.js";
import { inventoryMenu } from "../game/character/InventoryService.js";
import chalk from "chalk";
import { getTheme } from "@utilities/CacheService.js";
import {
  getAsciiArtContent,
  displayTextInBookFormat,
} from "./NarrativeDisplayService.js";
import { getTerm } from "@utilities/LanguageService.js";

/**
 * Extracts choices from narrative text and prompts the user to select one.
 * Choices are expected to be in the format: "1.{Choice description}"
 * @param {string} narrative - The narrative text containing choices
 * @param {boolean} includeInventoryOption - Whether to include inventory option (defaults to true)
 * @param {any} characterData - The character data needed for inventory (required when includeInventoryOption is true)
 */
export async function promptForChoice(
  narrative: string,
  includeInventoryOption: boolean = true,
  characterData?: any,
  gameState?: IGameState
): Promise<string> {
  try {
    // Extract choices from the narrative text (improved pattern to be more flexible)
    const choiceRegex = /\d+\s*\.\s*\{([^}]+)\}/g;
    const matches = [...narrative.matchAll(choiceRegex)];

    // Map the choices into the format expected by themedSelect
    const choices = matches.map((match) => ({
      name: match[1].trim(),
      value: match[1].trim(),
    }));

    // If no choices were found or extraction failed, generate new choices
    if (choices.length === 0) {
      log(
        "Choice Service: No choices found in narrative. Generating options...",
        "Warn "
      );

      // Generate choices based on current narrative context
      const generatedChoices = await generateChoices(narrative);

      if (generatedChoices && generatedChoices.length > 0) {
        choices.push(...generatedChoices);
      } else {
        // Fallback if choice generation fails
        choices.push(
          {
            name: getTerm("exploreFurther"),
            value: "Explore the area further",
          },
          {
            name: getTerm("askForMoreInfo"),
            value: "Ask someone for more information",
          }
        );
      }
    }

    // Always add inventory option if requested
    if (includeInventoryOption) {
      choices.push({
        name: getTerm("openInventory"),
        value: "Open Inventory",
      });
    }

    choices.push({
      name: getTerm("reviewScene"),
      value: "Reread Story",
    });

    // Always add an exit option
    choices.push({
      name: getTerm("returnToMenu"),
      value: "Return to main menu",
    });

    // Use the choices presentation function
    const selectedChoice = await presentChoicesAfterNarrative(
      narrative,
      choices,
      characterData,
      gameState
    );
    return selectedChoice;
  } catch (error) {
    // Handle any errors and provide a fallback
    log(
      `Choice Service: Error parsing choices: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return "Continue the adventure";
  }
}

/**
 * Generates choices based on the current narrative context if choices weren't found
 */
async function generateChoices(
  narrative: string
): Promise<Array<{ name: string; value: string }>> {
  const functionsConfig = {
    functions: [
      {
        name: "generatePlayerChoices",
        description:
          "Generate appropriate player choices based on the narrative",
        parameters: {
          type: "object",
          properties: {
            choices: {
              type: "array",
              description: "Exactly 3 relevant and interesting player choices",
              items: {
                type: "string",
                description:
                  "A possible player action that fits the narrative context",
              },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: ["choices"],
        },
      },
    ],
    function_call: { name: "generatePlayerChoices" },
  };

  try {
    const response: ChatCompletionResponse = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Based on the following narrative, generate exactly 3 relevant and interesting player choices.
            Make sure choices are specific to the current situation and location described in the narrative.`,
        },
        {
          role: "user",
          content: narrative,
        },
      ],
      {
        maxTokens: 150,
        temperature: 0.7,
        ...functionsConfig,
      }
    );

    let choices: string[] = [];

    // Try to get choices from function call first
    if (response.function_call && response.function_call.arguments) {
      try {
        const args = JSON.parse(response.function_call.arguments);
        if (
          args.choices &&
          Array.isArray(args.choices) &&
          args.choices.length > 0
        ) {
          choices = args.choices;
        }
      } catch (jsonError) {
        log(
          `Choice Service: Failed to parse function arguments: ${jsonError}`,
          "Error"
        );
      }
    }
    // Fall back to content parsing if function call isn't available
    else if (response.content) {
      try {
        const sanitized = sanitizeJsonString(response.content);
        const parsedChoices = JSON.parse(sanitized);
        if (Array.isArray(parsedChoices) && parsedChoices.length > 0) {
          choices = parsedChoices;
        }
      } catch (jsonError) {
        log(
          `Choice Service: Failed to parse choices JSON: ${jsonError}`,
          "Error"
        );
      }
    }

    // If we got valid choices, return them formatted for the UI
    if (choices.length > 0) {
      return choices.map((choice: string) => ({
        name: choice,
        value: choice,
      }));
    }

    // If we reach here, we need fallback options
    throw new Error("No valid choices generated");
  } catch (e) {
    log("Choice Service: Failed to generate choices: " + e, "Error");

    // Provide fallback options if JSON parsing fails
    const fallbackChoices = [
      "Explore the surrounding area",
      "Talk to someone nearby",
      "Consider your next move carefully",
    ];

    return fallbackChoices.map((choice) => ({
      name: choice,
      value: choice,
    }));
  }
}

/**
 * Formats choices for display in the book UI
 * @param choices Array of choice objects
 * @returns Formatted string with choices
 */
function formatChoicesForDisplay(
  choices: Array<{ name: string; value: string }>
): string {
  let result = "";

  // Add each choice with formatting and numbers
  choices.forEach((choice, index) => {
    const choiceNumber = accentColor(`${index + 1}.`);
    result += `${choiceNumber} ${primaryColor(choice.name)}\n`;
  });

  return result;
}

/**
 * Presents choices to the player after a narrative has been displayed
 * @param narrative The narrative text containing choices
 * @param choices Array of choice options for the player to select from
 * @param characterData Character data for inventory handling functionality
 * @param gameState Current game state (needed for save functionality)
 * @returns The selected choice text
 */
export async function presentChoicesAfterNarrative(
  narrative: string,
  choices: Array<{ name: string; value: string }>,
  characterData?: any,
  gameState?: IGameState
): Promise<string> {
  // Split narrative to separate story from other content
  const narrativeParts = narrative.split("CHOICES:");
  const storyText = narrativeParts[0].trim();

  // Try to get appropriate ASCII art for the choices
  let choicesAsciiArt = "";
  try {
    // Look for these files in order until one is found
    const artOptions = [
      "decision.txt",
      "crossroads.txt",
      "choices.txt",
      "compass.txt",
    ];

    for (const artFile of artOptions) {
      const art = await getAsciiArtContent(artFile);
      if (art) {
        choicesAsciiArt = art;
        break;
      }
    }
  } catch (error) {
    log(`Choice Service: Could not load choices ASCII art: ${error}`, "Info ");
  }

  // Format choices for display
  const choicesText = formatChoicesForDisplay(choices);

  // If we have choices ASCII art, add it before the choices text
  let fullChoicesContent = choicesText;
  if (choicesAsciiArt) {
    // Add the ASCII art with some padding
    fullChoicesContent = choicesAsciiArt + "\n\n" + choicesText;
  }

  // Now display choices in a book format
  console.log(accentColor(getTerm("whatNext")));

  // Use themed select for choice selection
  const selectedChoice = await themedSelect({
    message: getTerm("chooseNextOption"),
    choices: choices,
  });

  if (selectedChoice === "Return to main menu" && gameState) {
    try {
      const { saveGameState } = await import("../core/SaveLoadService.js");

      // Show saving indicator
      console.log(accentColor(getTerm("savingBeforeExit")));

      // Deduplicate game state before saving
      const { deduplicateGameState } = await import(
        "../core/SaveLoadService.js"
      );
      deduplicateGameState(gameState);

      await saveGameState(gameState);
      console.log(accentColor(getTerm("savedSuccessfully")));
      await pause(1000); // Brief pause to show the message
    } catch (error) {
      log(`Choice Service: Error saving game during exit: ${error}`, "Error");
      console.log(errorColor(getTerm("saveFailed")));
      await pause(1500);
    }
  }

  if (selectedChoice === "Reread Story") {
    // Display the narrative text using the book format
    await displayTextInBookFormat(storyText, {
      title: "Your Adventure",
      clearConsole: true,
      pageSize: 15,
      exitOnLastPage: true,
    });

    // After reading is complete, re-prompt for a choice
    return presentChoicesAfterNarrative(
      narrative,
      choices,
      characterData,
      gameState
    );
  }

  // Handle inventory as a special case that doesn't advance the narrative
  if (selectedChoice === "Open Inventory") {
    if (!characterData) {
      log(
        "Choice Service: Character data required for inventory access",
        "Error"
      );
      console.log(errorColor(getTerm("cannotOpenInventory")));
      // Re-prompt for a choice
      return presentChoicesAfterNarrative(
        narrative,
        choices,
        characterData,
        gameState
      );
    }

    // Open the inventory without advancing narrative
    await inventoryMenu(characterData, false);
    console.log(secondaryColor(getTerm("closedInventory")));

    // After inventory interaction is complete, re-prompt for a choice
    return presentChoicesAfterNarrative(
      narrative,
      choices,
      characterData,
      gameState
    );
  }

  return selectedChoice;
}
