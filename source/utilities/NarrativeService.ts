import { GameState, Chapter } from "src/gameState.js";
import { generateChatNarrative } from "./AIService.js";

/**
 * Determines if a plot twist should be generated
 * Fun little things to keep the story interesting but will have it disabled for now since its quite unpredictable
 */
/*
export async function shouldGeneratePlotTwist(
  gameState: GameState
): Promise<boolean> {
  // Count narrative exchanges (excluding player choices)
  const narrativeCount = gameState.getNarrativeHistory().length;

  // Consider creating a plot twist:
  // 1. Every 5-7 narrative exchanges
  // 2. With higher probability during climax phase
  // 3. No more than once per 5 exchanges
  if (narrativeCount < 5) return false;

  // Check if any recent narratives contain a plot twist
  const recentNarratives = gameState.getNarrativeHistory().slice(-5);
  const containsTwist = recentNarratives.some((narrative) =>
    narrative.includes("PLOT TWIST:")
  );

  if (containsTwist) return false;

  // Higher chance during climax
  const baseProbability =
    gameState.getCurrentChapter().arc === "climax" ? 0.4 : 0.2;

  // Random chance based on narrative cadence
  return narrativeCount % 6 === 0 && Math.random() < baseProbability;
}
  */

/**
 * Generate a plot twist based on the current narrative
 * Fun little things to keep the story interesting but will have it disabled for now since its quite unpredictable
 * Once Campaign is stable will consider re-enabling it again.
 */
/*
export async function generatePlotTwist(gameState: GameState): Promise<string> {
  const twistTypes = [
    "character betrayal",
    "unexpected ally appearance",
    "hidden identity revealed",
    "environmental disaster",
    "magical anomaly",
    "prophecy fulfillment",
    "surprising information revealed",
    "enemy becomes ally",
    "ally becomes enemy",
    "ambush or trap",
  ];

  const selectedType =
    twistTypes[Math.floor(Math.random() * twistTypes.length)];

  const twistPrompt = await generateChatNarrative(
    [
      {
        role: "system",
        content: `Generate a dramatic plot twist of type "${selectedType}" that 
        builds on existing narrative elements but would be surprising to the player.
        The twist should significantly change the direction of the story without 
        completely invalidating player choices. Include relevant details about how
        it connects to existing characters or plot elements.`,
      },
      ...gameState.getConversationHistory().slice(-5),
    ],
    { maxTokens: 150, temperature: 0.8 }
  );

  return twistPrompt;
}
*/

/**
 * Generate a chapter title based on the arc
 */
export function getChapterTitle(arc: string): string {
  switch (arc) {
    case "introduction":
      return "The Beginning";
    case "rising-action":
      return "The Challenge Grows";
    case "climax":
      return "The Moment of Truth";
    case "falling-action":
      return "The Aftermath";
    case "resolution":
      return "The Conclusion";
    default:
      return "A New Chapter";
  }
}

/**
 * Validates if the story is ready to progress to the next chapter
 */
export function validateChapterProgression(gameState: GameState): {
  canProgress: boolean;
  reasons: string[];
} {
  const currentChapter = gameState.getCurrentChapter();
  const reasons: string[] = [];

  // Check pending objectives
  if (currentChapter.pendingObjectives.length > 0) {
    const completedRatio =
      currentChapter.completedObjectives.length /
      (currentChapter.completedObjectives.length +
        currentChapter.pendingObjectives.length);

    // Require at least 30% of objectives to be completed - will adjust in final version thirty percent if temporary and is quite low imo
    if (completedRatio < 0.3) {
      reasons.push(
        `Only ${Math.round(completedRatio * 100)}% of objectives completed`
      );
    }
  }

  // Check minimum narrative exchanges
  const minExchanges: Record<Chapter["arc"], number> = {
    introduction: 5,
    "rising-action": 8,
    climax: 6,
    "falling-action": 4,
    resolution: 3,
  };

  const narrativeCount = gameState
    .getNarrativeHistory()
    .filter((n) => !n.startsWith("Player choice:")).length;

  const minRequired = minExchanges[currentChapter.arc] || 5;
  if (narrativeCount < minRequired) {
    reasons.push(
      `Not enough narrative development (${narrativeCount}/${minRequired})`
    );
  }

  return {
    canProgress: reasons.length === 0,
    reasons,
  };
}

/**
 * Detects and prevents narrative loops
 */
export function detectNarrativeLoop(gameState: GameState): boolean {
  // Get last few narrative exchanges
  const recentNarratives = gameState.getNarrativeHistory().slice(-5);

  // Look for repetition in choices
  const recentChoices = recentNarratives
    .filter((n) => n.startsWith("Player choice:"))
    .map((n) => n.replace("Player choice:", "").trim());

  // Check if the same choice appears multiple times in recent history
  const choiceCounts = recentChoices.reduce((counts, choice) => {
    counts[choice] = (counts[choice] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // If any choice appears 3+ times in the last 5 exchanges, consider it a loop
  return Object.values(choiceCounts).some((count) => count >= 3);
}

export function getArcGuidelines(arc: string): string {
  switch (arc) {
    case "introduction":
      return "Establish setting, introduce key characters, and present initial conflict";
    case "rising-action":
      return "Escalate challenges, introduce complications, deepen character relationships";
    case "climax":
      return "Build toward major confrontation, maximize tension, create high stakes";
    case "falling-action":
      return "Show consequences of climax, begin resolving conflicts";
    case "resolution":
      return "Provide closure to story arcs, hint at future adventures";
    default:
      return "Continue developing the story with meaningful choices";
  }
}

/**
 * Determine the next arc in the story progression
 */
export function determineNextArc(currentArc: string): Chapter["arc"] {
  // Story progression follows a classic dramatic structure
  switch (currentArc) {
    case "introduction":
      return "rising-action";
    case "rising-action":
      return "climax";
    case "climax":
      return "falling-action";
    case "falling-action":
      return "resolution";
    case "resolution":
      return "introduction"; // Loop back for potential new story - NOTE: cool little concept to keep the story going but have to test if its reliable
    default:
      return "introduction"; // Default to start if unexpected value
  }
}

/**
 * Summarizes important events from the game state for AI context
 */
export function summarizeImportantEvents(gameState: GameState): string {
  const recentNarratives = gameState.getNarrativeHistory().slice(-7);

  // Filter out player choices for this summary
  const narrativeOnly = recentNarratives
    .filter((n) => !n.startsWith("Player choice:"))
    .slice(-4);

  if (narrativeOnly.length === 0) {
    return "No significant events have occurred yet.";
  }

  return `Recent events: ${narrativeOnly.join(" ")}`;
}

/**
 * Returns enhanced AI instructions based on game state
 */
export function getEnhancedAIInstructions(gameState: GameState): string {
  const currentArc = gameState.getCurrentChapter().arc;

  // Base instructions always included
  let instructions = `
    Maintain narrative consistency with previous exchanges.
    Remember player choices and refer to them when relevant.
    Follow the current arc guidelines for ${currentArc}.
  `;

  // Add special instructions based on game state conditions
  if (detectNarrativeLoop(gameState)) {
    instructions += `
      IMPORTANT: Introduce a new element or character to break the current loop.
      Change the setting or circumstances to create new options.
      ENSURE that it still narratively connects to the current story.
    `;
  }

  return instructions;
}
