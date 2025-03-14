import { GameState } from "src/gameState.js";
import { getTheme } from "./CacheService.js";
import chalk from "chalk";
import { sanitizeJsonString } from "./ConsoleService.js";
import { log } from "./LogService.js";
import { generateChatNarrative } from "./AIService.js";

/**
 * Extract potential objectives from the intro narrative
 */
export async function extractInitialObjectives(
  narrative: string,
  gameState: GameState
): Promise<void> {
  try {
    // Define the function schema for initial objectives
    const functionsConfig = {
      functions: [
        {
          name: "createInitialObjectives",
          description: "Create initial objectives based on the narrative",
          parameters: {
            type: "object",
            properties: {
              objectives: {
                type: "array",
                description: "List of 2-3 clear objectives for the player",
                items: {
                  type: "string",
                },
              },
            },
            required: ["objectives"],
          },
        },
      ],
      function_call: { name: "createInitialObjectives" },
    };

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
        ...functionsConfig,
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

  try {
    // Define the function schema for new objectives
    const functionsConfig = {
      functions: [
        {
          name: "updateObjectives",
          description: "Update objectives based on the narrative",
          parameters: {
            type: "object",
            properties: {
              newObjectives: {
                type: "array",
                description: "New objectives introduced in this narrative",
                items: {
                  type: "string",
                },
              },
              completedObjectives: {
                type: "array",
                description: "Objectives that were completed in this narrative",
                items: {
                  type: "string",
                },
              },
            },
            required: ["newObjectives", "completedObjectives"],
          },
        },
      ],
      function_call: { name: "updateObjectives" },
    };

    const response = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Based on the following narrative, identify any new objectives and completed objectives.`,
        },
        {
          role: "user",
          content: narrative,
        },
      ],
      {
        maxTokens: 150,
        temperature: 0.3,
        ...functionsConfig,
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

    // Define the function schema for objective completion
    const functionsConfig = {
      functions: [
        {
          name: "checkObjectiveCompletion",
          description:
            "Check which objectives are completed by the player's choice",
          parameters: {
            type: "object",
            properties: {
              completedIndices: {
                type: "array",
                description: "Indices of completed objectives (zero-based)",
                items: {
                  type: "integer",
                },
              },
            },
            required: ["completedIndices"],
          },
        },
      ],
      function_call: { name: "checkObjectiveCompletion" },
    };

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
        ...functionsConfig,
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
          console.log(
            chalk
              .hex(getTheme().accentColor)
              .bold(`\n✅ Objective completed: ${objective}`)
          );
        }
      }
    }
  } catch (e) {
    log(`Failed to check objective completion: ${e}`, "Error");
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
