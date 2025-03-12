import { GameState } from "src/gameState.js";
import { getTheme } from "./CacheService.js";
import chalk from "chalk";
import { generateChatNarrative } from "./AIService.js";

/**
 * Extract potential objectives from the intro narrative
 */
export async function extractInitialObjectives(
  narrative: string,
  gameState: GameState
): Promise<void> {
  const objectivesPrompt = await generateChatNarrative(
    [
      {
        role: "system",
        content: `Based on the following narrative, identify 2-3 key objectives that 
        the player should accomplish. Return just a JSON array of strings, each representing 
        a clear objective. For example: ["Find the ancient artifact in the caves", 
        "Discover who murdered the village elder"]`,
      },
      {
        role: "user",
        content: narrative,
      },
    ],
    { maxTokens: 150, temperature: 0.3 }
  );

  try {
    const objectives = JSON.parse(objectivesPrompt);
    if (Array.isArray(objectives)) {
      objectives.forEach((objective) => {
        gameState.addObjective(objective);
      });
    }
  } catch (e) {
    // Silently fail if parsing error
    console.error("Failed to extract initial objectives:", e);
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

  const objectivesPrompt = await generateChatNarrative(
    [
      {
        role: "system",
        content: `Based on the following narrative, identify any new objectives that 
        may have been introduced. Return a JSON object with two arrays:
        {
          "newObjectives": ["New objective 1", "New objective 2"],
          "completedObjectives": ["Completed objective 1"]
        }
        If no new objectives or completions, return empty arrays.`,
      },
      {
        role: "user",
        content: narrative,
      },
    ],
    { maxTokens: 150, temperature: 0.3 }
  );

  try {
    const result = JSON.parse(objectivesPrompt);

    if (result.newObjectives && Array.isArray(result.newObjectives)) {
      result.newObjectives.forEach((objective: string) => {
        // Check if this objective is already in the list
        const existingObjectives = [
          ...gameState.getCurrentChapter().pendingObjectives,
          ...gameState.getCurrentChapter().completedObjectives,
        ];

        if (
          !existingObjectives.some(
            (obj) => obj.toLowerCase() === objective.toLowerCase()
          )
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
        const matchingObjective = pendingObjectives.find(
          (obj) =>
            obj.toLowerCase().includes(objective.toLowerCase()) ||
            objective.toLowerCase().includes(obj.toLowerCase())
        );

        if (matchingObjective) {
          gameState.completeObjective(matchingObjective);
        }
      });
    }
  } catch (e) {
    // Silently fail if parsing error
    console.error("Failed to extract new objectives:", e);
  }
}

/**
 * Check if a player choice completes any objectives
 */
export async function checkObjectiveCompletion(
  choice: string,
  gameState: GameState
): Promise<void> {
  const completionPrompt = await generateChatNarrative(
    [
      {
        role: "system",
        content: `Given the player's choice and these pending objectives, determine if any objectives
        are now completed. Return a JSON array of indices of completed objectives, or an empty array if none.
        Pending objectives: ${JSON.stringify(
          gameState.getCurrentChapter().pendingObjectives
        )}`,
      },
      {
        role: "user",
        content: choice,
      },
    ],
    { maxTokens: 100, temperature: 0.2 }
  );

  try {
    const completedIndices = JSON.parse(completionPrompt);
    if (Array.isArray(completedIndices) && completedIndices.length > 0) {
      // We need to complete from end to start to not mess up indices
      completedIndices.sort((a, b) => b - a);

      for (const index of completedIndices) {
        if (
          index >= 0 &&
          index < gameState.getCurrentChapter().pendingObjectives.length
        ) {
          const objective =
            gameState.getCurrentChapter().pendingObjectives[index];
          gameState.completeObjective(objective);
          console.log(
            chalk
              .hex(getTheme().accentColor)
              .bold(`\n✅ Objective completed: ${objective}`)
          );
        }
      }
    }
  } catch (e) {
    // Silently fail if parsing error
    console.error("Failed to check objective completion:", e);
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

  // Base requirements by arc
  const arcRequirements = {
    introduction: { minNarrative: 5, minObjectives: 1 },
    "rising-action": { minNarrative: 10, minObjectives: 2 },
    climax: { minNarrative: 15, minObjectives: 3 },
    "falling-action": { minNarrative: 20, minObjectives: 4 },
    resolution: { minNarrative: 25, minObjectives: 5 },
  };

  // Get requirements for current arc
  const requirements = arcRequirements[currentArc] || {
    minNarrative: 10,
    minObjectives: 2,
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
