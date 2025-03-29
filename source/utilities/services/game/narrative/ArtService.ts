/**
 * Art Service - Handles ASCII art loading and selection
 *
 * This service provides functions to select and load appropriate ASCII art
 * based on game context, character class, story arc, and narrative content.
 */

import { log } from "@utilities/LogService.js";
import { getAsciiArtContent } from "@utilities/NarrativeDisplayService.js";
import { IGameState } from "@utilities/IGameState.js";
import { getTerm } from "@utilities/LanguageService.js";
import { getLanguage } from "@utilities/CacheService.js";
import { translateText } from "@utilities/AIService.js";

/**
 * Gets appropriate ASCII art for a character class intro
 *
 * @param characterClass The character's class
 * @returns ASCII art string or empty string if none available
 */
export async function getIntroAsciiArt(
  characterClass: string
): Promise<string> {
  try {
    // Map character classes to appropriate ASCII art
    const artMap: Record<string, string> = {
      warrior: "sword.txt",
      mage: "spell.txt",
      rogue: "dagger.txt",
      cleric: "holy_symbol.txt",
      ranger: "bow.txt",
      bard: "lute.txt",
    };

    // Get the relevant art file or use a default
    const artFile = artMap[characterClass.toLowerCase()] || "adventure.txt";
    return await getAsciiArtContent(artFile);
  } catch (error) {
    log(`Error loading intro ASCII art: ${error}`, "Warn ");
    return ""; // Return empty string on error
  }
}

/**
 * Gets appropriate ASCII art for a specific scene or arc
 *
 * @param arc Current story arc
 * @param eventType The type of special event (if any)
 * @param narrative The narrative text (to extract context)
 * @returns ASCII art content for the scene
 */
export async function getSceneAsciiArt(
  arc: string,
  eventType: string = "none",
  narrative: string = ""
): Promise<string> {
  try {
    let fileName = "";

    // First priority: special event-based art
    if (eventType === "combat") {
      fileName = "battle.txt";
    } else if (eventType === "dungeon") {
      fileName = "dungeon.txt";
    } else if (eventType === "shop") {
      fileName = "shop.txt";
    } else if (
      narrative.toLowerCase().includes("tavern") ||
      narrative.toLowerCase().includes("inn")
    ) {
      fileName = "tavern.txt";
    } else if (
      narrative.toLowerCase().includes("castle") ||
      narrative.toLowerCase().includes("palace")
    ) {
      fileName = "castle.txt";
    } else if (
      narrative.toLowerCase().includes("forest") ||
      narrative.toLowerCase().includes("woods")
    ) {
      fileName = "forest.txt";
    } else if (narrative.toLowerCase().includes("mountain")) {
      fileName = "mountain.txt";
    } else if (
      narrative.toLowerCase().includes("city") ||
      narrative.toLowerCase().includes("town")
    ) {
      fileName = "town.txt";
    }

    // Second priority: arc-based art if no specific scene art was found
    if (!fileName) {
      // Map story arcs to appropriate ASCII art files
      const arcMap: Record<string, string> = {
        introduction: "scroll.txt",
        quest: "map.txt",
        journey: "path.txt",
        confrontation: "sword.txt",
        battle: "crossed_swords.txt",
        resolution: "crown.txt",
        epilogue: "sunset.txt",
      };

      fileName = arcMap[arc] || "book.txt"; // Default to book.txt if arc not found
    }

    return await getAsciiArtContent(fileName);
  } catch (error) {
    log(`Error loading scene ASCII art: ${error}`, "Warn ");
    return ""; // Return empty string on error
  }
}

/**
 * Gets ASCII art based on the narrative content keywords
 *
 * @param narrative The narrative text to analyze
 * @returns Most appropriate ASCII art for the scene
 */
export async function getContextualAsciiArt(
  narrative: string
): Promise<string> {
  // List of scene keywords to look for and corresponding ASCII art files
  const sceneKeywords: Record<string, string[]> = {
    "battle.txt": ["battle", "fight", "combat", "attack", "defend"],
    "tavern.txt": ["tavern", "inn", "drink", "ale", "beer", "meal"],
    "castle.txt": ["castle", "palace", "throne", "king", "queen", "royal"],
    "forest.txt": ["forest", "woods", "trees", "wilderness", "jungle"],
    "mountain.txt": ["mountain", "hill", "climb", "peak", "summit"],
    "cave.txt": ["cave", "cavern", "underground", "tunnel"],
    "sea.txt": ["ocean", "sea", "ship", "boat", "sail", "beach"],
    "desert.txt": ["desert", "sand", "dune", "arid", "dry"],
    "town.txt": ["town", "city", "village", "settlement", "market"],
  };

  const narrativeLower = narrative.toLowerCase();

  // Find the art file with the most keyword matches
  let bestMatch = "";
  let maxMatches = 0;

  for (const [file, keywords] of Object.entries(sceneKeywords)) {
    let matches = 0;
    for (const keyword of keywords) {
      // Count occurrences of each keyword
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const occurrences = (narrativeLower.match(regex) || []).length;
      matches += occurrences;
    }

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = file;
    }
  }

  // If we found a match, load that art
  if (bestMatch && maxMatches > 0) {
    return await getAsciiArtContent(bestMatch);
  }

  return ""; // No matching scene found
}

/**
 * Generates a recap text from the game state
 *
 * @param gameState The current game state
 * @returns A formatted recap text
 */
export async function generateGameRecap(
  gameState: IGameState
): Promise<string> {
  let recap = "";

  try {
    const currentLanguage = getLanguage();

    // Get the narrative history
    const narrativeHistory = gameState.getNarrativeHistory();
    const completedObjectives =
      gameState.getCurrentChapter().completedObjectives;
    const choices = gameState.getChoices().slice(-5);

    // Generate a comprehensive recap that includes narrative content
    recap = `${getTerm("chapter")}: ${gameState.getCurrentChapter().title}\n\n`;

    // Include the last significant narrative entry (that isn't a player choice)
    const significantNarratives = narrativeHistory
      .filter((entry) => !entry.startsWith("Player choice:"))
      .slice(-2); // Get the last two significant narrative entries

    if (significantNarratives.length > 0) {
      // Extract key passages and summarize them
      let narrativeRecap = "";
      for (const narrative of significantNarratives) {
        // Extract the first 2-3 sentences from each narrative
        const sentences = narrative.split(/(?<=[.!?])\s+/);
        narrativeRecap += sentences.slice(0, 3).join(" ") + "\n\n";
      }

      recap += `${getTerm("previously")}:\n${narrativeRecap}\n`;
    }

    // Include recent decisions
    if (choices.length > 0) {
      recap += `${getTerm("recentDecisions")}:\n• ${choices
        .slice(-3)
        .join("\n• ")}`;
    }

    // Translate the entire recap to the current language if needed
    // This ensures all narrative content matches the user's language setting
    return await translateText(recap, currentLanguage);
  } catch (error) {
    log(`Error generating recap: ${error}`, "Error");
    return getTerm("adventureContinues");
  }
}
