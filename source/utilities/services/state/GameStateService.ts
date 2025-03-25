/**
 * Game State Service - Manages game state updates and persistence
 *
 * This service handles updating, analyzing, and saving game state,
 * including player choices, objectives, and chapter progression.
 */

import chalk from "chalk";
import {
  CharacterAnalysis,
  Console,
  Log,
  Narrative,
  Objective,
  SaveLoad,
  Cache,
} from "../../Services.js";
import { IGameState } from "../../types/IGameState.js";

/**
 * Updates game state based on player choice and saves it
 *
 * @param gameState Current game state
 * @param choice Player's choice
 * @returns Promise that resolves when state is updated and saved
 */
export async function updateAndSaveState(
  gameState: IGameState,
  choice: string
): Promise<void> {
  try {
    console.log(Console.secondaryColor(`You chose: ${choice}`));

    // Analyze the player's choice for narrative insights
    await CharacterAnalysis.analyzePlayerChoice(choice, gameState);

    // Add choice to conversation and narrative history
    gameState.addConversation({
      role: "user",
      content: `Player choice: ${choice}`,
    });
    gameState.addNarrative(`Player choice: ${choice}`);

    // Check if the choice fulfills any objectives
    await Objective.checkObjectiveCompletion(choice, gameState);

    // Deduplicate game state before saving to ensure clean data
    SaveLoad.deduplicateGameState(gameState);

    // Save the game state
    await SaveLoad.saveGameState(gameState);
  } catch (error) {
    Log.log(
      `Error updating game state: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
    console.log(chalk.yellow("Warning: Could not save game state."));
  }
}

/**
 * Checks if conditions are met to advance to the next chapter
 * and handles the transition
 *
 * @param gameState Current game state
 * @returns Promise that resolves when chapter check is complete
 */
export async function checkAndHandleChapterProgression(
  gameState: IGameState
): Promise<void> {
  if (gameState.shouldAdvanceChapter()) {
    const validation = Narrative.validateChapterProgression(gameState);

    if (validation.canProgress) {
      const currentArc = gameState.getCurrentChapter().arc;
      const nextArc = Narrative.determineNextArc(currentArc);

      // Determine the current chapter number
      const currentChapterTitle = gameState.getCurrentChapter().title;
      const chapterMatch = currentChapterTitle.match(/Chapter (\d+):/);
      const currentChapterNum = chapterMatch ? parseInt(chapterMatch[1]) : 0;
      const chapterNumber = currentChapterNum + 1;

      // Get arc transition guidance text
      const transitionGuidance = Narrative.getArcTransitionGuidance(
        currentArc,
        nextArc
      );

      // Begin the new chapter
      gameState.beginNewChapter(
        `Chapter ${chapterNumber}: ${Narrative.getChapterTitle(nextArc)}`,
        transitionGuidance,
        nextArc
      );

      console.log(
        chalk
          .hex(Cache.getTheme().accentColor)
          .bold(`\n📖 Beginning ${gameState.getCurrentChapter().title}...`)
      );

      await Console.pressEnter({
        message: "Press Enter to start the new chapter...",
      });
    } else {
      console.log(
        chalk
          .hex(Cache.getTheme().accentColor)
          .bold(
            `\n⚠️ Not ready to advance to next chapter yet:\n${validation.reasons.join(
              "\n"
            )}`
          )
      );

      // Provide a hint to help the player progress
      gameState.addConversation({
        role: "system",
        content: `The story cannot advance to the next chapter yet due to: ${validation.reasons.join(
          ", "
        )}. Provide narrative content that helps address these requirements.`,
      });
    }
  }
}

/**
 * Generates a textual progress bar for objectives
 *
 * @param current Current count of completed objectives
 * @param max Total number of objectives
 * @returns String representing the progress bar
 */
export function generateProgressBar(current: number, max: number): string {
  const filledChar = "█";
  const emptyChar = "░";
  const percentage = Math.floor((current / max) * 10);
  return filledChar.repeat(percentage) + emptyChar.repeat(10 - percentage);
}

/**
 * Displays the current objective progress to the player
 *
 * @param gameState Current game state
 */
export function showObjectiveProgress(gameState: IGameState): void {
  const completedCount =
    gameState.getCurrentChapter().completedObjectives.length;
  const totalCount =
    completedCount + gameState.getCurrentChapter().pendingObjectives.length;

  if (totalCount > 0) {
    console.log(
      chalk.hex(Cache.getTheme().accentColor)(
        `Chapter progress: ${completedCount}/${totalCount} ${generateProgressBar(
          completedCount,
          totalCount
        )}`
      )
    );
  }
}

/**
 * Updates plot stage when certain conditions are met
 *
 * @param gameState Current game state
 */
export function updatePlotStageIfNeeded(gameState: IGameState): void {
  if (gameState.getChoices().length >= 5 && gameState.getPlotStage() === 1) {
    gameState.updatePlot(
      2,
      "New clues emerge slowly. Your challenges remain significant, but time lets you breathe and decide your path carefully."
    );
  }
}
