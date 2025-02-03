import inquirer from "inquirer";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import { generateChatNarrative } from "./aiAssistant.js";
import { GameState } from "./gameState.js";

/**
 * Prompts the user for the adventure theme and generates an initial narrative.
 *
 * @param gameState - The current game state.
 * @returns A promise that resolves with the generated narrative.
 */
export async function promptThemedGMNarrative(
  gameState: GameState
): Promise<string> {
  // Prompt for a theme if one isn’t already set.
  let theme = gameState.theme;
  if (!theme) {
    const { themeInput } = await inquirer.prompt([
      {
        type: "input",
        name: "themeInput",
        message:
          "Enter the theme for this adventure (e.g., horror, mystery, high fantasy):",
        validate: (input: string) =>
          input.trim() !== "" || "Theme cannot be empty",
      },
    ]);
    theme = themeInput;
    gameState.theme = theme;
  }

  // Create a conversation for the Chat Completion API.
  const messages = [
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        "You are an experienced Dungeon Master for a Dungeons & Dragons adventure.",
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `Create a unique and immersive narrative for a ${theme} adventure. The party of adventurers has just arrived at the entrance of a long-forgotten dungeon, hidden deep within an ancient forest. The entrance is adorned with intricate carvings, overgrown with vines, and a cool mist clings to the stone walls.
      
Describe this scene in vivid detail and present the adventurers with at least three distinct options for how to proceed. For example:
1. Explore the left corridor shrouded in darkness.
2. Inspect the ancient carvings on the entrance wall.
3. Proceed into the central hall where eerie sounds echo.
      
Ensure that your narrative is engaging, immersive, and uniquely influenced by the ${theme} theme.`,
    },
  ];

  try {
    const narrative = await generateChatNarrative(messages, {
      maxTokens: 300,
      temperature: 0.85,
    });
    return narrative;
  } catch (error) {
    console.error("Error generating narrative:", error);
    throw error;
  }
}

/**
 * Extracts option lines from the narrative and prompts the user to make a choice.
 *
 * @param narrative - The narrative text containing options.
 * @returns A promise that resolves with the player's chosen option.
 */
export async function promptForChoice(narrative: string): Promise<string> {
  // Use regex to extract numbered options (e.g., "1. Option text")
  const optionRegex = /(\d+)\.\s+(.*)/g;
  const options: string[] = [];
  let match;
  while ((match = optionRegex.exec(narrative)) !== null) {
    options.push(match[0]);
  }

  if (options.length === 0) {
    // If no options were found, fall back to a free text input.
    const { choice } = await inquirer.prompt([
      {
        type: "input",
        name: "choice",
        message: "Enter your next action:",
      },
    ]);
    return choice;
  }

  const { selectedOption } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedOption",
      message: "Choose an option:",
      choices: options,
    },
  ]);
  return selectedOption;
}
