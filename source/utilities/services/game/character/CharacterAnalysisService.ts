/**
 * CharacterAnalysisService
 *
 * This service analyzes player choices to extract important narrative elements
 * including characters, locations, player intent, and emotional tone. It serves as
 * the narrative intelligence layer that builds up the world state over time.
 *
 * Key responsibilities:
 * - Detects characters mentioned in player choices
 * - Identifies locations referenced in narrative
 * - Determines player intent (explore, fight, talk, etc.)
 * - Analyzes emotional tone of player decisions
 * - Updates game state with discovered entities
 */

import { IGameState } from "@utilities/IGameState.js";
import {
  generateChatNarrative,
  ChatCompletionResponse,
} from "@utilities/AIService.js";
import { sanitizeJsonString } from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";

/**
 * Structure representing the analyzed components of a player choice
 * Used for AI response parsing and game state updates
 */
interface ChoiceAnalysis {
  characters?: string[]; // Character names detected in the choice
  locations?: string[]; // Location names mentioned or implied
  intent?: string; // Primary action intent (explore, fight, talk, etc.)
  tone?: string; // Emotional tone (cautious, brave, friendly, etc.)
}

/**
 * Analyzes player choices to extract key narrative information and update game state
 *
 * When a player makes a choice, this function:
 * 1. Sends the choice text to the AI for analysis
 * 2. Extracts characters, locations, intent and tone
 * 3. Updates the current chapter with discovered entities
 * 4. Adds new characters to the main character registry with appropriate metadata
 *
 * @param choice - The player's chosen action text
 * @param gameState - Current game state to be updated with analysis results
 */
export async function analyzePlayerChoice(
  choice: string,
  gameState: IGameState
): Promise<void> {
  // Skip trivial choices to avoid unnecessary AI calls
  if (choice.toLowerCase() === "continue" || choice.length < 5) return;

  // AI function schema definition for structured choice analysis
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
    // Request AI analysis of the player choice
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

    let analysis: ChoiceAnalysis = {};

    // Extract analysis data with fallback options for different response formats
    if (response.function_call && response.function_call.arguments) {
      try {
        analysis = JSON.parse(response.function_call.arguments);
      } catch (jsonError) {
        log(`Failed to parse function arguments: ${jsonError}`, "Error");
      }
    } else if (response.content) {
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

    // Update game state with discovered characters
    // Characters are added both to chapter records and the main character registry
    if (analysis.characters && Array.isArray(analysis.characters)) {
      analysis.characters.forEach((character: string) => {
        if (
          character &&
          !gameState.getCurrentChapter().characters.includes(character)
        ) {
          // Add to chapter's characters list
          gameState.getCurrentChapter().characters.push(character);

          // Add to the main characters Map with details
          gameState.addOrUpdateCharacter(character, {
            description: "A character encountered during your adventure",
            relationship: analysis.tone === "friendly" ? "friendly" : "neutral",
            lastSeen: analysis.locations?.[0] || "Recently",
            importance: 7, // High enough to be considered important
          });
        }
      });
    }

    // Update locations in the current chapter
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

    // Store player intent and tone in chapter metadata for narrative context
    if (analysis.intent) {
      gameState.getCurrentChapter().metadata.lastIntent = analysis.intent;
    }

    if (analysis.tone) {
      gameState.getCurrentChapter().metadata.lastTone = analysis.tone;
    }
  } catch (error) {
    log(`Error analyzing player choice: ${error}`, "Error");
  }
}
