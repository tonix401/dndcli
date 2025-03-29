import { Chapter, IGameState } from "@utilities/IGameState.js";
import { STORY_PACE } from "../GameService.js";
import { ChatCompletionRequestMessage } from "../../ai/AIService.js";
import { getTerm } from "@utilities/LanguageService.js";

/**
 * Generate a chapter title based on the arc
 */
export function getChapterTitle(arc: string): string {
  switch (arc) {
    case "introduction":
      return getTerm("chapterTitleIntroduction");
    case "rising-action":
      return getTerm("chapterTitleRisingAction");
    case "climax":
      return getTerm("chapterTitleClimax");
    case "falling-action":
      return getTerm("chapterTitleFallingAction");
    case "resolution":
      return getTerm("chapterTitleResolution");
    default:
      return getTerm("chapterTitleDefault");
  }
}

/**
 * Validates if the story is ready to progress to the next chapter
 */
export function validateChapterProgression(gameState: IGameState): {
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
export function detectNarrativeLoop(gameState: IGameState): boolean {
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
      return getTerm("arcGuidelineIntroduction");
    case "rising-action":
      return getTerm("arcGuidelineRisingAction");
    case "climax":
      return getTerm("arcGuidelineClimax");
    case "falling-action":
      return getTerm("arcGuidelineFallingAction");
    case "resolution":
      return getTerm("arcGuidelineResolution");
    default:
      return getTerm("arcGuidelineDefault");
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
    return getTerm("arcTransitionIntroToRising");
  } else if (previousArc === "rising-action" && newArc === "climax") {
    return getTerm("arcTransitionRisingToClimax");
  } else if (previousArc === "climax" && newArc === "falling-action") {
    return getTerm("arcTransitionClimaxToFalling");
  } else if (previousArc === "falling-action" && newArc === "resolution") {
    return getTerm("arcTransitionFallingToResolution");
  } else if (previousArc === "resolution" && newArc === "introduction") {
    return getTerm("arcTransitionResolutionToIntro");
  }
  return getTerm("arcTransitionDefault");
}

/**
 * Summarizes important events from the game state for AI context
 */
export function summarizeImportantEvents(gameState: IGameState): string {
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
export function getEnhancedAIInstructions(gameState: IGameState): string {
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

/**
 * Creates the base message for narrative generation that includes
 * important context about the current game state and story arc
 */
export function createBaseNarrativeMessage(gameState: IGameState): {
  role: string;
  content: string;
} {
  const currentChapter = gameState.getCurrentChapter();
  const enhancedInstructions = getEnhancedAIInstructions(gameState);
  const eventSummary = summarizeImportantEvents(gameState);

  return {
    role: "system",
    content: `
You are the AI Dungeon Master for an immersive AD&D 2nd Edition game.
Current chapter: ${currentChapter.title || "Introduction"}
Current arc: ${currentChapter.arc}

${enhancedInstructions}

GAME CONTEXT:
${eventSummary}

RESPONSE INSTRUCTIONS:
- Provide an engaging narrative continuation
- Include detailed descriptions of the environment
- For non-combat scenes, end with exactly 3 choices numbered as:
  1. {First choice description}
  2. {Second choice description}
  3. {Third choice description}
- For special encounters, use appropriate format markers (COMBAT ENCOUNTER: or START DUNGEON:)
- Maintain consistency with previous narrative
    `,
  };
}

/**
 * Generates the next scene narrative and any special events
 */
export async function generateNextSceneNarrative(
  gameState: IGameState,
  messages: ChatCompletionRequestMessage[]
): Promise<{
  narrative: string;
  specialEvent: { type: string; details?: string };
}> {
  const { generateChatNarrative } = await import("../../ai/AIService.js");
  const { log } = await import("@utilities/LogService.js");

  try {
    const storyPace = gameState.getStoryPace();
    const temperature =
      storyPace === "SLOW" ? 0.7 : storyPace === "MEDIUM" ? 0.8 : 0.9;

    const response = await generateChatNarrative(messages, {
      temperature,
      maxTokens: 2048,
    });

    // Try to parse function call if available
    if (response.function_call && response.function_call.arguments) {
      try {
        const args = JSON.parse(response.function_call.arguments);
        return {
          narrative: args.narrative,
          specialEvent: args.specialEvent || { type: "none" },
        };
      } catch (error) {
        log(`Error parsing narrative function response: ${error}`, "Error");
      }
    }

    // Fall back to content extraction if function call failed
    const content = response.content || "";

    // Check for special events in the content
    let specialEventType = "none";
    let specialEventDetails = "";

    if (content.includes("COMBAT ENCOUNTER:")) {
      specialEventType = "combat";
      specialEventDetails =
        content.split("COMBAT ENCOUNTER:")[1]?.split("\n")[0] || "";
    } else if (content.includes("START DUNGEON:")) {
      specialEventType = "dungeon";
      specialEventDetails =
        content.split("START DUNGEON:")[1]?.split("\n")[0] || "";
    } else if (content.includes("DICE ROLL:")) {
      specialEventType = "dice_roll";
      specialEventDetails =
        content.split("DICE ROLL:")[1]?.split("\n")[0] || "";
    }

    return {
      narrative: content,
      specialEvent: {
        type: specialEventType,
        details: specialEventDetails,
      },
    };
  } catch (error) {
    log(
      `Failed to generate narrative: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
    return {
      narrative:
        "The narrator pauses for a moment, collecting their thoughts...",
      specialEvent: { type: "none" },
    };
  }
}

/**
 * Ensures the narrative continues properly without premature endings
 */
export async function ensureNarrativeContinuity(
  narrative: string,
  specialEvent: { type: string; details?: string },
  gameState: IGameState,
  messages: ChatCompletionRequestMessage[]
): Promise<{
  narrative: string;
  specialEvent: { type: string; details?: string };
}> {
  // Only do continuity checks for regular narrative, not special events
  if (specialEvent.type !== "none") {
    return { narrative, specialEvent };
  }

  // Check if narrative contains choices indicator - match both formats with and without space
  if (!narrative.includes("CHOICES:") && !narrative.match(/\d+\.?\s*\{.+\}/)) {
    // If no choices found, try to generate them
    const { log } = await import("@utilities/LogService.js");

    try {
      log(
        "No choices found in narrative. Attempting to ensure continuity...",
        "Warn "
      );

      // Append request for choices
      const continuityMessages: ChatCompletionRequestMessage[] = [
        ...messages,
        {
          role: "assistant",
          content: narrative,
        },
        {
          role: "user",
          content:
            "Please continue and provide exactly 3 numbered choices using the format: 1. {Choice description}",
        },
      ];

      const { generateChatNarrative } = await import("../../ai/AIService.js");
      const choicesResponse = await generateChatNarrative(continuityMessages, {
        temperature: 0.7,
        maxTokens: 1024,
      });

      let choicesContent = choicesResponse.content || "";

      // If we got function call format, parse it
      if (choicesResponse.function_call?.arguments) {
        try {
          const args = JSON.parse(choicesResponse.function_call.arguments);
          if (args.choices && Array.isArray(args.choices)) {
            choicesContent = args.choices
              .map((choice: string, i: number) => `${i + 1}.{${choice}}`)
              .join("\n");
          }
        } catch (error) {
          log(`Error parsing choices function response: ${error}`, "Error");
        }
      }

      // Extract just the choices part if needed
      if (choicesContent.includes("CHOICES:")) {
        const choicesParts = choicesContent.split("CHOICES:");
        if (choicesParts.length > 1) {
          choicesContent = choicesParts[1].trim();
        }
      }

      // Validate that we have properly formatted choices
      const choicesLines = choicesContent
        .split("\n")
        .filter((line) => line.trim());
      const validChoices = choicesLines.filter((line) =>
        /^\d+\.?\s*\{.+\}$/.test(line.trim())
      );

      if (validChoices.length >= 3) {
        // We have at least 3 valid choices, use those
        const updatedNarrative =
          narrative + "\n\nCHOICES:\n" + validChoices.slice(0, 3).join("\n");
        return {
          narrative: updatedNarrative,
          specialEvent,
        };
      } else {
        // Not enough valid choices, use generic ones
        log("Failed to generate valid choices, using generic options", "Warn ");
        return {
          narrative: narrative + generateGenericChoices(),
          specialEvent,
        };
      }
    } catch (error) {
      log(
        `Failed to ensure narrative continuity: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "Error"
      );

      return {
        narrative: narrative + generateGenericChoices(),
        specialEvent,
      };
    }
  }

  // No changes needed
  return { narrative, specialEvent };
}

/**
 * Generates generic choices when we can't get specific ones
 */
function generateGenericChoices(): string {
  return `

CHOICES:
1. {Continue exploring}
2. {Talk to someone nearby}
3. {Rest and consider your options}`;
}
