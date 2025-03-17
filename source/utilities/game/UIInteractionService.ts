import { GameState } from "src/gameState.js";
import { log } from "@utilities/LogService.js";
import { sanitizeJsonString } from "@utilities/ConsoleService.js";
import { pressEnter } from "@utilities/ConsoleService.js";
import { themedSelect } from "@utilities/MenuService.js";
import { primaryColor, secondaryColor } from "@utilities/ConsoleService.js";
import chalk from "chalk";
import {
  ChatCompletionResponse,
  generateChatNarrative,
} from "@utilities/AIService.js";

/**
 * Extracts choices from narrative text and prompts the user to select one.
 * Choices are expected to be in the format: "1.{Choice description}"
 * @param {string} narrative - The narrative text containing choices
 * @param {boolean} includeInventoryOption - Whether to include inventory option (defaults to true)
 */
export async function promptForChoice(
  narrative: string,
  includeInventoryOption: boolean = true
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
      log("No choices found in narrative. Generating options...", "Warn ");

      // Generate choices based on current narrative context
      const generatedChoices = await generateChoices(narrative);

      if (generatedChoices && generatedChoices.length > 0) {
        choices.push(...generatedChoices);
      } else {
        // Fallback if choice generation fails
        choices.push(
          {
            name: "Explore the area further",
            value: "Explore the area further",
          },
          {
            name: "Ask someone for more information",
            value: "Ask someone for more information",
          }
        );
      }
    }

    // Always add inventory option if requested
    if (includeInventoryOption) {
      choices.push({
        name: "📦 Open Inventory",
        value: "Open Inventory",
      });
    }

    // Always add an exit option
    choices.push({
      name: "Return to main menu",
      value: "Return to main menu",
    });

    // Use existing themedSelect function
    return await themedSelect({
      message: "Choose your next action:",
      choices: choices,
    });
  } catch (error) {
    // Handle any errors and provide a fallback
    log(
      `Error parsing choices: ${
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
  // Define function schema for generating choices
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
        log(`Failed to parse function arguments: ${jsonError}`, "Error");
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
        log(`Failed to parse choices JSON: ${jsonError}`, "Error");
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
    log("Failed to generate choices: " + e, "Error");

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
 * Displays a recap of the previous narrative.
 */
export async function displayRecap(gameState: GameState): Promise<void> {
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
}
