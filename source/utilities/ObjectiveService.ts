import { GameState } from "src/gameState.js";
import { getTheme } from "./CacheService.js";
import chalk from "chalk";
import { sanitizeJsonString } from "./ConsoleService.js";
import { log } from "./LogService.js";
import { generateChatNarrative } from "./AIService.js";
import { StoryPaceOptionsKey } from "./Config.js";
import Config from "./Config.js";

/**
 * Helper function to determine if two objectives are similar
 */
function isSimilarObjective(obj1: string, obj2: string): boolean {
  // Normalize both strings
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, "");
  const str1 = normalize(obj1);
  const str2 = normalize(obj2);

  // Check for direct inclusion
  if (str1.includes(str2) || str2.includes(str1)) return true;

  // Check for significant word overlap (over 60%)
  const words1 = str1.split(/\s+/).filter((w) => w.length > 3);
  const words2 = str2.split(/\s+/).filter((w) => w.length > 3);
  const commonWords = words1.filter((w) => words2.includes(w));

  return commonWords.length >= Math.min(words1.length, words2.length) * 0.6;
}

/**
 * Extract potential objectives from the intro narrative
 */
export async function extractInitialObjectives(
  narrative: string,
  gameState: GameState
): Promise<void> {
  try {
    const response = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Based on the following narrative, identify 2-3 key objectives that 
          the player should accomplish.`,
        },
        {
          role: "user",
          content: narrative,
        },
      ],
      {
        maxTokens: 150,
        temperature: 0.3,
        ...Config.OBJECTIVE_FUNCTION_SCHEMAS.initialObjectives,
      }
    );

    // Try to get objectives from function call first
    if (response.function_call && response.function_call.arguments) {
      try {
        const args = JSON.parse(response.function_call.arguments);
        const objectives = args.objectives;
        if (Array.isArray(objectives)) {
          objectives.forEach((objective) => {
            gameState.addObjective(objective);
          });
        }
      } catch (jsonError) {
        log(`Failed to parse function arguments: ${jsonError}`, "Error");
      }
    }
    // Fall back to content parsing if function call isn't available
    else if (response.content) {
      try {
        const sanitized = sanitizeJsonString(response.content);
        const objectives = JSON.parse(sanitized);
        if (Array.isArray(objectives)) {
          objectives.forEach((objective) => {
            gameState.addObjective(objective);
          });
        }
      } catch (jsonError) {
        log(`Failed to parse objectives JSON: ${jsonError}`, "Error");
      }
    }
  } catch (e) {
    log(`Failed to extract initial objectives: ${e}`, "Error");
  }
}

/**
 * Extract potential new objectives from the ongoing narrative
 */
export async function extractNewObjectives(
  narrative: string,
  gameState: GameState
): Promise<void> {
  // Don't extract objectives from player choices
  if (narrative.startsWith("Player choice:")) return;

  // Don't add new objectives if we already have too many pending ones
  if (
    gameState.getCurrentChapter().pendingObjectives.length >=
    Config.OBJECTIVE_CONFIG.MAX_PENDING_OBJECTIVES
  ) {
    return;
  }

  try {
    // Get current arc for AI context
    const currentArc = gameState.getCurrentChapter().arc;
    const narrativeCount = gameState.getNarrativeHistory().length;

    // Base requirements by arc (referenced from enforceStoryRequirements)
    const arcRequirements = Config.ARC_REQUIREMENTS;

    const requirements = arcRequirements[currentArc] || {
      minNarrative: 10,
      minObjectives: 2,
    };

    const response = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Based on the following narrative, identify any new objectives and completed objectives.
          IMPORTANT GUIDELINES:
          - Early in the story, focus on creating clear objectives
          - As the story progresses, focus more on completing existing objectives rather than creating new ones
          - Only add critically important new objectives after ${Math.round(
            requirements.minNarrative / 2
          )} narrative exchanges
          - Current narrative count: ${narrativeCount}
          - Current phase: ${currentArc}`,
        },
        {
          role: "user",
          content: narrative,
        },
      ],
      {
        maxTokens: 150,
        temperature: 0.3,
        ...Config.OBJECTIVE_FUNCTION_SCHEMAS.updateObjectives,
      }
    );

    let result;

    // Try to get objectives from function call first
    if (response.function_call && response.function_call.arguments) {
      result = JSON.parse(response.function_call.arguments);
    }
    // Fall back to content parsing if function call isn't available
    else if (response.content) {
      const sanitized = sanitizeJsonString(response.content);
      result = JSON.parse(sanitized);
    } else {
      // No valid response
      return;
    }

    if (result.newObjectives && Array.isArray(result.newObjectives)) {
      result.newObjectives.forEach((objective: string) => {
        // Check if this objective is already in the list
        const existingObjectives = [
          ...gameState.getCurrentChapter().pendingObjectives,
          ...gameState.getCurrentChapter().completedObjectives,
        ];

        if (
          !existingObjectives.some((obj) => isSimilarObjective(obj, objective))
        ) {
          gameState.addObjective(objective);
        }
      });
    }

    if (
      result.completedObjectives &&
      Array.isArray(result.completedObjectives)
    ) {
      result.completedObjectives.forEach((objective: string) => {
        // Find similar objectives by substring matching
        const pendingObjectives =
          gameState.getCurrentChapter().pendingObjectives;
        const matchingObjective = pendingObjectives.find((obj) =>
          isSimilarObjective(obj, objective)
        );

        if (matchingObjective) {
          gameState.completeObjective(matchingObjective);
        }
      });
    }
  } catch (e) {
    log(`Failed to extract new objectives: ${e}`, "Error");
  }
}

/**
 * Check if a player choice completes any objectives
 */
export async function checkObjectiveCompletion(
  choice: string,
  gameState: GameState
): Promise<void> {
  try {
    const pendingObjectives = gameState.getCurrentChapter().pendingObjectives;

    const response = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Given the player's choice and these pending objectives, determine if any objectives
          are now completed.
          Pending objectives: ${JSON.stringify(pendingObjectives)}`,
        },
        {
          role: "user",
          content: choice,
        },
      ],
      {
        maxTokens: 100,
        temperature: 0.2,
        ...Config.OBJECTIVE_FUNCTION_SCHEMAS.checkCompletion,
      }
    );

    let completedIndices;

    // Try to get completed indices from function call first
    if (response.function_call && response.function_call.arguments) {
      const args = JSON.parse(response.function_call.arguments);
      completedIndices = args.completedIndices;
    }
    // Fall back to content parsing if function call isn't available
    else if (response.content) {
      const sanitized = sanitizeJsonString(response.content);
      completedIndices = JSON.parse(sanitized);
    } else {
      // No valid response
      return;
    }

    if (Array.isArray(completedIndices) && completedIndices.length > 0) {
      // We need to complete from end to start to not mess up indices
      completedIndices.sort((a, b) => b - a);

      for (const index of completedIndices) {
        if (index >= 0 && index < pendingObjectives.length) {
          const objective = pendingObjectives[index];
          gameState.completeObjective(objective);
          /* console.log(
            chalk
              .hex(getTheme().accentColor)
              .bold(`\n✅ Objective completed: ${objective}`)
          ); */
        }
      }
    }
  } catch (e) {
    log(`Failed to check objective completion: ${e}`, "Error");
  }
}

export function pruneStaleObjectives(gameState: GameState): void {
  const currentChapter = gameState.getCurrentChapter();
  const narrativeCount = gameState.getNarrativeHistory().length;

  // Create a mapping to convert from StoryPaceKey to multiplier
  const paceMultipliers = {
    FAST: 0.5,
    MEDIUM: 1.0,
    SLOW: 1.5,
  };

  const paceMultiplier = paceMultipliers[gameState.getStoryPace()] || 1.0;

  // Only prune if we have many objectives and are well into the story
  // Faster pace means prune earlier (lower threshold)
  const narrativeThreshold = Math.ceil(
    Config.OBJECTIVE_CONFIG.PRUNE_NARRATIVE_THRESHOLD * paceMultiplier
  );

  if (
    currentChapter.pendingObjectives.length >
      Config.OBJECTIVE_CONFIG.MIN_OBJECTIVES_FOR_PRUNING &&
    narrativeCount > narrativeThreshold
  ) {
    // Keep more objectives for detailed pace, fewer for fast
    const toKeep = Math.max(
      3,
      Math.ceil(
        currentChapter.pendingObjectives.length *
          (Config.OBJECTIVE_CONFIG.OBJECTIVE_RETENTION_RATE / paceMultiplier)
      )
    );

    // Remove the oldest objectives (they're likely no longer relevant)
    while (currentChapter.pendingObjectives.length > toKeep) {
      const removedObjective = currentChapter.pendingObjectives.shift();
      if (removedObjective) {
        // If removeObjective method doesn't exist, you can modify the array directly
        if (typeof gameState.removeObjective === "function") {
          gameState.removeObjective(removedObjective);
        }
      }
    }
  }
}

/**
 * Enforces minimum story requirements based on the current narrative arc
 */
export function enforceStoryRequirements(gameState: GameState): {
  canResolveQuest: boolean;
  minimumNarrativeCount: number;
  requiredElementsMissing: string[];
} {
  const currentArc = gameState.getCurrentChapter().arc;
  const narrativeCount = gameState.getNarrativeHistory().length;
  const completedObjectives =
    gameState.getCurrentChapter().completedObjectives.length;
  const requiredElementsMissing: string[] = [];

  // Create a mapping to convert from StoryPaceKey to multiplier
  const paceMultipliers = {
    FAST: 0.5,
    MEDIUM: 1.0,
    SLOW: 1.5,
  };

  const paceMultiplier = paceMultipliers[gameState.getStoryPace()] || 1.0;

  // Get requirements for current arc
  const baseRequirements = Config.ARC_REQUIREMENTS[
    currentArc as keyof typeof Config.ARC_REQUIREMENTS
  ] || {
    minNarrative: 10,
    minObjectives: 2,
  };

  // Adjust requirements based on pace
  const requirements = {
    minNarrative: Math.ceil(baseRequirements.minNarrative * paceMultiplier),
    minObjectives: Math.max(
      1,
      Math.ceil(baseRequirements.minObjectives * paceMultiplier)
    ),
  };

  // Check for combat encounters in appropriate arcs
  const hasCombat = gameState
    .getNarrativeHistory()
    .some((n) => n.toLowerCase().includes("combat encounter:"));

  if (
    (currentArc === "rising-action" || currentArc === "climax") &&
    !hasCombat
  ) {
    requiredElementsMissing.push("combat encounter");
  }

  // Check for minimum narrative exchanges
  if (narrativeCount < requirements.minNarrative) {
    requiredElementsMissing.push(
      `minimum narrative exchanges (${narrativeCount}/${requirements.minNarrative})`
    );
  }

  // Check for minimum completed objectives
  if (completedObjectives < requirements.minObjectives) {
    requiredElementsMissing.push(
      `completed objectives (${completedObjectives}/${requirements.minObjectives})`
    );
  }

  // Special requirements for resolution
  if (currentArc === "resolution") {
    const hasClimax = gameState.getChapters().some((c) => c.arc === "climax");
    if (!hasClimax) {
      requiredElementsMissing.push("climax chapter");
    }
  }

  // Can only resolve quest if all requirements are met
  return {
    canResolveQuest: requiredElementsMissing.length === 0,
    minimumNarrativeCount: requirements.minNarrative,
    requiredElementsMissing,
  };
}
