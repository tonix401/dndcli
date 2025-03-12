import { GameState } from "src/gameState.js";
import { generateChatNarrative } from "./AIService.js";
import { sanitizeJsonString } from "./ConsoleService.js";
import { log } from "./LogService.js";

/**
 * Analyzes player choices to extract key information for game state
 */
export async function analyzePlayerChoice(
  choice: string,
  gameState: GameState
): Promise<void> {
  // Only analyze substantive choices
  if (choice.toLowerCase() === "continue" || choice.length < 5) return;

  try {
    const analysisPrompt = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Analyze this player choice and extract:
          1. Key character(s) mentioned
          2. Location(s) mentioned
          3. Action intent (explore, fight, talk, etc.)
          4. Any emotional tone (cautious, brave, etc.)
          
          Return as JSON with these keys: {"characters": [], "locations": [], "intent": "", "tone": ""}`,
        },
        {
          role: "system",
          content: choice,
        },
      ],
      { maxTokens: 150, temperature: 0.3 }
    );

    // Parse the analysis
    const analysis = JSON.parse(sanitizeJsonString(analysisPrompt));

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
  } catch (error) {
    // Silently log errors but don't interrupt gameplay
    log(`Error analyzing player choice: ${error}`, "Error");
  }
}
