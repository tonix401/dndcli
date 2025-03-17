import { GameState, Chapter } from "src/gameState.js";
import { STORY_PACE, StoryPaceKey } from "./GameService.js";

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
  const paceMultiplier = STORY_PACE[gameState.getStoryPace()].multiplier;

  // Check pending objectives - adjust completion ratio based on total count
  if (currentChapter.pendingObjectives.length > 0) {
    const totalObjectives =
      currentChapter.pendingObjectives.length +
      currentChapter.completedObjectives.length;
    const completedRatio =
      currentChapter.completedObjectives.length / totalObjectives;

    // Lower the requirement if there are many objectives or using fast pace
    const requiredRatio = Math.max(
      0.1,
      (totalObjectives > 8 ? 0.25 : totalObjectives > 5 ? 0.3 : 0.4) *
        paceMultiplier
    );

    if (completedRatio < requiredRatio) {
      reasons.push(
        `Only ${Math.round(completedRatio * 100)}% of objectives completed`
      );
    }
  }

  // Check minimum narrative exchanges - adjusted by pace
  const minExchanges: Record<Chapter["arc"], number> = {
    introduction: Math.ceil(5 * paceMultiplier),
    "rising-action": Math.ceil(8 * paceMultiplier),
    climax: Math.ceil(6 * paceMultiplier),
    "falling-action": Math.ceil(4 * paceMultiplier),
    resolution: Math.ceil(3 * paceMultiplier),
  };

  const narrativeCount = gameState
    .getNarrativeHistory()
    .filter((n) => !n.startsWith("Player choice:")).length;

  const minRequired =
    minExchanges[currentChapter.arc] || Math.ceil(5 * paceMultiplier);
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

/**
 * Returns guidelines for narrative development in each story arc
 */
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
 * Provides specific guidance when transitioning between story arcs
 */
export function getArcTransitionGuidance(
  previousArc: string,
  newArc: string
): string {
  if (previousArc === "introduction" && newArc === "rising-action") {
    return "Build upon established elements by introducing complications. Increase stakes for the character and deepen NPC relationships. Create roadblocks toward the main objectives.";
  } else if (previousArc === "rising-action" && newArc === "climax") {
    return "Bring all major storylines to a head. Force crucial decisions that have significant consequences. Introduce the main antagonist or challenge directly.";
  } else if (previousArc === "climax" && newArc === "falling-action") {
    return "Show immediate consequences of the climactic decisions. Begin resolving secondary conflicts while maintaining tension. Create space for character reflection.";
  } else if (previousArc === "falling-action" && newArc === "resolution") {
    return "Provide closure to major story threads. Show character growth and the new status quo. Plant subtle seeds for potential future adventures.";
  } else if (previousArc === "resolution" && newArc === "introduction") {
    return "Create a clear narrative break with a new setting or time jump. Introduce new challenges while referencing past adventures. Establish fresh objectives while honoring character history.";
  }
  return "Smoothly transition the narrative while maintaining story consistency.";
}

/**
 * Summarizes important events from the game state for AI context
 */
export function summarizeImportantEvents(gameState: GameState): string {
  const narrativeHistory = gameState.getNarrativeHistory();
  const currentChapter = gameState.getCurrentChapter();

  // Extract key elements
  const recentNarratives = narrativeHistory.slice(-7);
  const completedObjectives = currentChapter.completedObjectives;

  // Filter out player choices for this summary
  const narrativeOnly = recentNarratives
    .filter((n) => !n.startsWith("Player choice:"))
    .slice(-4);

  if (narrativeOnly.length === 0) {
    return "No significant events have occurred yet.";
  }

  // Combine narratives
  const narrativeContent = narrativeOnly.join(" ");

  // Extract locations from narrative (simple heuristic)
  const locationRegex =
    /(?:in|at|to) (?:the |a |an )?([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*)/g;
  let match;
  const locations = new Set<string>();
  while ((match = locationRegex.exec(narrativeContent)) !== null) {
    locations.add(match[1]);
  }

  // Extract character names (likely capitalized words not at start of sentence)
  const nameRegex = /(?:^|[.!?]\s+)(?!the|a|an)([A-Z][a-zA-Z]+)/g;
  const names = new Set<string>();
  while ((match = nameRegex.exec(narrativeContent)) !== null) {
    names.add(match[1]);
  }

  let summary = "Recent events: " + narrativeContent;

  if (locations.size > 0) {
    summary += `\nKey locations: ${Array.from(locations).join(", ")}`;
  }

  if (names.size > 0) {
    summary += `\nKey characters: ${Array.from(names).join(", ")}`;
  }

  if (completedObjectives.length > 0) {
    summary += `\nRecent achievements: ${completedObjectives
      .slice(-2)
      .join(", ")}`;
  }

  return summary;
}

/**
 * Returns enhanced AI instructions based on game state
 */
export function getEnhancedAIInstructions(gameState: GameState): string {
  const currentChapter = gameState.getCurrentChapter();
  const currentArc = currentChapter.arc;
  const narrativeCount = gameState.getNarrativeHistory().length;

  const minExchanges: Record<Chapter["arc"], number> = {
    introduction: 5,
    "rising-action": 8,
    climax: 6,
    "falling-action": 4,
    resolution: 3,
  };

  const arcMinNarrative = minExchanges[currentArc] || 5;
  const arcProgress = Math.min(
    100,
    Math.round((narrativeCount / arcMinNarrative) * 100)
  );

  // Base instructions always included
  let instructions = `
    Maintain narrative consistency with previous exchanges.
    Remember player choices and refer to them when relevant.
    Follow the current arc guidelines: ${getArcGuidelines(currentArc)}
    Current arc progress: ${arcProgress}%
  `;

  // Add special instructions based on game state conditions
  if (detectNarrativeLoop(gameState)) {
    instructions += `
      IMPORTANT: Introduce a new element or character to break the current loop.
      Change the setting or circumstances to create new options.
      ENSURE that it still narratively connects to the current story.
    `;
  }

  if (currentChapter.pendingObjectives.length > 0) {
    const objectiveCount = currentChapter.pendingObjectives.length;
    const completedCount = currentChapter.completedObjectives.length;
    const totalCount = objectiveCount + completedCount;
    const completionRatio = completedCount / (totalCount || 1);

    if (completionRatio < 0.3) {
      instructions += `
        IMPORTANT: Focus on creating opportunities to complete objectives.
        Current pending objectives: ${currentChapter.pendingObjectives.join(
          ", "
        )}
      `;
    }
  }

  // Custom arc-specific instructions
  if (currentArc === "climax" && arcProgress > 50) {
    instructions += `
      Begin building toward the story's climactic moment.
      Raise the stakes and intensify the central conflict.
    `;
  } else if (currentArc === "resolution" && arcProgress > 70) {
    instructions += `
      Begin wrapping up remaining plot threads and provide closure.
    `;
  }

  return instructions;
}
