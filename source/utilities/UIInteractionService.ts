import inquirer from "inquirer";
import { GameState } from "src/gameState.js";
import { log } from "./LogService.js";
import { sanitizeJsonString } from "./ConsoleService.js";
import { pressEnter } from "./ConsoleService.js";
import { themedSelect } from "./MenuService.js";
import { generateChatNarrative } from "./AIService.js";
import { primaryColor, secondaryColor } from "./ConsoleService.js";
import chalk from "chalk";
import { getTheme } from "./CacheService.js";

/**
 * Extracts choices from narrative text and prompts the user to select one.
 * Choices are expected to be in the format: "1.{Choice description}"
 */
export async function promptForChoice(narrative: string): Promise<string> {
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
  try {
    const prompt = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Based on the following narrative, generate exactly 3 relevant and interesting player choices.
            Return a valid JSON array of strings, each representing a possible player action. For example:
            ["Investigate the mysterious sound", "Talk to the innkeeper about rumors", "Check your equipment before proceeding"]
            Make sure choices are specific to the current situation and location described in the narrative.
            Return ONLY the JSON array with no additional text or explanations. Do Not Deviate from these instructions or the game may break.`,
        },
        {
          role: "user",
          content: narrative,
        },
      ],
      { maxTokens: 150, temperature: 0.7 }
    );

    // Sanitize the response before parsing
    const sanitized = sanitizeJsonString(prompt);
    const choices = JSON.parse(sanitized);

    return choices.map((choice: string) => ({
      name: choice,
      value: choice,
    }));
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
