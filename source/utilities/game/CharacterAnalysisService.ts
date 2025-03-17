import { GameState } from "src/gameState.js";
import { generateChatNarrative, ChatCompletionResponse } from "@utilities/AIService.js";
import { sanitizeJsonString } from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";

/**
 * Analyzes player choices to extract key information for game state
 */
export async function analyzePlayerChoice(
  choice: string,
  gameState: GameState
): Promise<void> {
  // Only analyze substantive choices
  if (choice.toLowerCase() === "continue" || choice.length < 5) return;

  // Define the character analysis function schema
  const choiceAnalysisFunctionConfig = {
    functions: [
      {
        name: "analyzePlayerChoice",
        description:
          "Extract key information from player choices to enhance game state",
        parameters: {
          type: "object",
          properties: {
            characters: {
              type: "array",
              description: "Names of key characters mentioned in the choice",
              items: {
                type: "string",
              },
            },
            locations: {
              type: "array",
              description:
                "Names of locations mentioned or implied in the choice",
              items: {
                type: "string",
              },
            },
            intent: {
              type: "string",
              description: "Primary action intent (explore, fight, talk, etc.)",
            },
            tone: {
              type: "string",
              description:
                "Emotional tone of the choice (cautious, brave, friendly, etc.)",
            },
          },
          required: ["characters", "locations", "intent", "tone"],
        },
      },
    ],
    function_call: { name: "analyzePlayerChoice" },
  };

  try {
    const response: ChatCompletionResponse = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Analyze this player choice to extract key information for enhancing the game state.`,
        },
        {
          role: "user",
          content: choice,
        },
      ],
      {
        maxTokens: 150,
        temperature: 0.3,
        ...choiceAnalysisFunctionConfig,
      }
    );

    let analysis;

    // Try to get analysis from function call first
    if (response.function_call && response.function_call.arguments) {
      try {
        analysis = JSON.parse(response.function_call.arguments);
      } catch (jsonError) {
        log(`Failed to parse function arguments: ${jsonError}`, "Error");
      }
    }
    // Fall back to content parsing if function call isn't available
    else if (response.content) {
      try {
        const sanitized = sanitizeJsonString(response.content);
        analysis = JSON.parse(sanitized);
      } catch (jsonError) {
        log(`Failed to parse JSON from content: ${jsonError}`, "Error");
        return; // Exit if we can't parse anything
      }
    } else {
      // No valid response
      return;
    }

    // Add discovered characters to the current chapter
    if (analysis.characters && Array.isArray(analysis.characters)) {
      analysis.characters.forEach((character: string) => {
        if (
          character &&
          !gameState.getCurrentChapter().characters.includes(character)
        ) {
          gameState.getCurrentChapter().characters.push(character);
        }
      });
    }

    // Add discovered locations to the current chapter
    if (analysis.locations && Array.isArray(analysis.locations)) {
      analysis.locations.forEach((location: string) => {
        if (
          location &&
          !gameState.getCurrentChapter().locations.includes(location)
        ) {
          gameState.getCurrentChapter().locations.push(location);
        }
      });
    }

    // Store the intent and tone for potential future use
    if (analysis.intent) {
      gameState.getCurrentChapter().metadata.lastIntent = analysis.intent;
    }

    if (analysis.tone) {
      gameState.getCurrentChapter().metadata.lastTone = analysis.tone;
    }
  } catch (error) {
    // Silently log errors but don't interrupt gameplay
    log(`Error analyzing player choice: ${error}`, "Error");
  }
}
