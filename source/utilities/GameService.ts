import chalk from "chalk";
import ora from "ora";
import {
  generateChatNarrative,
  generateEnemyFromNarrative,
  ChatCompletionRequestMessage,
  summarizeImportantEvents,
} from "@utilities/AIService.js";
import { rollDice } from "@utilities/DiceService.js";
import { log } from "@utilities/LogService.js";
import { generateRandomItem } from "@utilities/ItemGenerator.js";
import { saveGameState, loadGameState } from "@utilities/SaveLoadService.js";
import { getStartingItems } from "@utilities/InventoryService.js";
import { getLanguage, getTheme } from "@utilities/CacheService.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";
import { GameState } from "src/gameState.js";
import { runCombat } from "src/combat.js";
import { getTerm } from "@utilities/LanguageService.js";
import {
  pause,
  primaryColor,
  secondaryColor,
  pressEnter,
} from "@utilities/ConsoleService.js";
import {
  getArcGuidelines,
  getChapterTitle,
  validateChapterProgression,
  detectNarrativeLoop,
  getEnhancedAIInstructions,
} from "@utilities/NarrativeService.js";
import {
  enforceStoryRequirements,
  extractNewObjectives,
  extractInitialObjectives,
  checkObjectiveCompletion,
} from "@utilities/ObjectiveService.js";
import { dungeonMinigame } from "@components/DungeonMinigame.js";
import { analyzePlayerChoice } from "@utilities/CharacterAnalysisService.js";
import {
  promptForChoice,
  displayRecap,
} from "@utilities/UIInteractionService.js";
import { determineNextArc } from "@utilities/NarrativeService.js";
import Config from "./Config.js";

/**
 * Main campaign loop.
 */
export async function campaignLoop(
  gameState: GameState,
  characterData: any
): Promise<void> {
  try {
    // Load saved state if available.
    const loadedState = await loadGameState();
    if (loadedState) {
      Object.assign(gameState, loadedState);
      console.log(
        chalk
          .hex(getTheme().accentColor)
          .bold("✅ Loaded saved campaign state.")
      );
      await displayRecap(gameState);
    }

    // Ensure inventory is set.
    if (
      !Array.isArray(characterData.inventory) ||
      characterData.inventory.length === 0
    ) {
      characterData.inventory = getStartingItems(characterData.class);
    }

    // Start with an introduction if no narrative yet.
    if (gameState.getNarrativeHistory().length === 0) {
      /*   displayStatusBar(characterData); */
      const introNarrative = await generateChatNarrative(
        [
          {
            role: "system",
            content: `
Act as the Dungeon Master for an immersive, book-like AD&D 2nd Edition game. You are to strictly follow the AD&D 2nd Edition ruleset for all mechanics—including character progression, combat, dice rolls, experience, and currency management. You must never break character, make decisions for the player, or refer to yourself in any way. All in-game actions that require dice rolls must be initiated by the player using curly braces {like this}.

General Guidelines:

World Building & Narrative:
- Randomly generate the setting, theme, place, current year, and cultural/historical context for the adventure.
- Provide detailed, immersive descriptions that include at least three sentences per location. Descriptions must mention the time of day, weather, natural environment, notable landmarks, and any relevant historical or cultural details.
- For dungeon sequences or special encounters, start with "START DUNGEON:" and transition seamlessly into the next scene after the encounter.

Combat & Special Encounters:
- When a combat situation arises, begin your narrative with "COMBAT ENCOUNTER:".
- When the player enters a dungeon start with "START DUNGEON:"
- Do not provide in-game choices during combat or dungeon encounters.

Player Actions & In-Game Syntax:
- The player's in-game actions must be enclosed in curly braces {like this}. Only perform dice rolls or game mechanics when the player uses the correct syntax.
- In-character dialogue must be enclosed in quotation marks "like this".
- Out-of-character instructions will be provided in angle brackets <like this>.
- For non-combat scenes, always end with exactly three numbered choices enclosed in curly braces (e.g.,
  1.{Search the area}
  2.{Talk to the local}
  3.{Return to main menu}) to indicate the next available actions.
- This format is critical: the word CHOICES: on its own line, it should only be the word CHOICES:,nothing more and nothing less, followed by exactly three numbered options.
  - Each choice must start with a number, followed by period, then curly braces with no spaces.
  - NEVER include choice options directly in your narrative text - they must ONLY appear after the CHOICES: marker.

Character Sheet & Tracking:
- At the very start of the game, output the full character sheet, including:
  Name: ${characterData.name}
  Origin: ${characterData.origin}
  Level & Class: ${characterData.level} ${characterData.class}
  Stats: HP ${characterData.hp}/${characterData.abilities.maxhp}, STR ${
              characterData.abilities.strength
            }, MANA ${characterData.abilities.mana}, DEX ${
              characterData.abilities.dexterity
            }, CHA ${characterData.abilities.charisma}, LUCK ${
              characterData.abilities.luck
            }
  XP: ${characterData.xp} (displayed as "XP: current/next", e.g., "0/100")
  Currency: ${
    characterData.currency
  } (generate the entire currency system with prices for all transactions strictly according to AD&D 2e)
  Inventory: ${characterData.inventory
    .map(
      (item: { name: string; quantity: number }) =>
        `${item.name} (x${item.quantity})`
    )
    .join(", ")}
- Always update and display the character sheet after each narrative response, including any changes from events, combat, or transactions.
- Always display additional details such as Proficiency Points, Ability Score Improvements, and Weapon Proficiencies as per AD&D 2e rules.

Rules & Mechanics:
- Strictly adhere to AD&D 2e rules for all events, combat, and skill checks.
- When an action requiring a dice roll is not correctly enclosed in curly braces by the player, do not perform the roll or process the action.
- Reward the player with experience, currency, and track their progression as dictated by the AD&D 2e ruleset.
- Ensure that the player is allowed to defeat any NPC if they are capable, without making choices on their behalf.

Response Structure:
- Begin by outputting the full character sheet and an introductory narrative that sets the scene.
- In non-combat scenes, conclude with exactly three numbered in-game choices (using curly braces) for what the player can do next.
- For combat or dungeon sequences, follow the special encounter formatting instructions (i.e., "COMBAT ENCOUNTER:" or "START DUNGEON:") and transition smoothly between scenes once the encounter concludes.
- This format is critical: the word CHOICES: on its own line, it should only be the word CHOICES:,nothing more and nothing less, followed by exactly three numbered options.
- Each choice must start with a number, followed by period, then curly braces with no spaces.
- NEVER include choice options directly in your narrative text - they must ONLY appear after the CHOICES: marker.
- Please respond in clear, concise ${getTerm(
              getLanguage()
            )} STICK TO THIS LANGUAGE AND DO NOT CHANGE BASED ON THIS.

Starting Instructions:
- Begin the session by displaying the full character sheet as described above, followed by an introductory narrative that establishes the initial location, setting, and context for the adventure. Make sure to have the introductory narrative as detailed as possible to help with the initial world building that comes with the story and origin of the character.
- Wait for the player to provide their first in-game command using the correct syntax.
          `,
          },
        ],
        { maxTokens: 500, temperature: 0.8 }
      );
      const narrativeParts = introNarrative.split("CHOICES:");
      const storyText = narrativeParts[0].trim();
      console.log("\n" + secondaryColor(storyText) + "\n");

      await pressEnter({
        message:
          "Reflect on the introduction and then choose your first action...",
      });
      const initialChoice = await promptForChoice(introNarrative);
      if (
        initialChoice.toLowerCase().includes("return to main menu") ||
        initialChoice.toLowerCase() === "exit"
      ) {
        console.log(secondaryColor("Returning to main menu..."));
        return;
      }
      gameState.addNarrative(introNarrative);
      gameState.addConversation({
        role: "user",
        content: `Player choice: ${initialChoice}`,
      });

      // Extract potential objectives from intro narrative
      await extractInitialObjectives(introNarrative, gameState);

      await saveGameState(gameState);
    }
  } catch (error) {
    log(
      `Campaign loop initial setup error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
    console.log(
      secondaryColor(
        "An error occurred during campaign setup. Returning to main menu..."
      )
    );
    // Try to save game state if possible
    try {
      await saveGameState(gameState);
    } catch (saveError) {
      log(
        `Failed to save game state: ${
          saveError instanceof Error ? saveError.message : String(saveError)
        }`,
        "Error"
      );
    }
    return; // Return to prevent further execution
  }

  // Main narrative loop.
  while (true) {
    try {
      /*       displayStatusBar(characterData); */

      // Check if we should advance to a new chapter
      if (gameState.shouldAdvanceChapter()) {
        const validation = validateChapterProgression(gameState);

        if (validation.canProgress) {
          const nextArc = determineNextArc(gameState.getCurrentChapter().arc);
          // Get chapter count another way instead of accessing private property
          const currentChapterTitle = gameState.getCurrentChapter().title;
          const chapterMatch = currentChapterTitle.match(/Chapter (\d+):/);
          const currentChapterNum = chapterMatch
            ? parseInt(chapterMatch[1])
            : 0;
          const chapterNumber = currentChapterNum + 1;

          gameState.beginNewChapter(
            `Chapter ${chapterNumber}: ${getChapterTitle(nextArc)}`,
            `The adventure continues with new challenges and revelations.`,
            nextArc
          );

          console.log(
            chalk
              .hex(getTheme().accentColor)
              .bold(`\n📖 Beginning ${gameState.getCurrentChapter().title}...`)
          );
          await pressEnter({
            message: "Press Enter to start the new chapter...",
          });
        } else {
          console.log(
            chalk
              .hex(getTheme().accentColor)
              .bold(
                `\n⚠️ Not ready to advance to next chapter yet:\n${validation.reasons.join(
                  "\n"
                )}`
              )
          );
          // Add a hint to help the player progress
          gameState.addConversation({
            role: "system",
            content: `The story cannot advance to the next chapter yet due to: ${validation.reasons.join(
              ", "
            )}. Provide narrative content that helps address these requirements.`,
          });
        }
      }

      // Optionally update the plot if enough choices have been made.
      if (
        gameState.getChoices().length >= 5 &&
        gameState.getPlotStage() === 1
      ) {
        gameState.updatePlot(
          2,
          "New clues emerge slowly. Your challenges remain significant, but time lets you breathe and decide your path carefully."
        );
      }

      const baseScenarioMessage: ChatCompletionRequestMessage = {
        role: "system",
        content: `
      Welcome to Chapter ${gameState.getCurrentChapter()?.title || "1"}!
      
      **Narrative Guidelines:**
      - Current Arc: ${gameState.getCurrentChapter().arc || "introduction"}
      - Pending Plot Points: ${
        gameState.getCurrentChapter().pendingObjectives.join(", ") || ""
      }
      - Current Exchange Count: ${gameState.getNarrativeHistory().length} 
      - Progress Requirements: ${JSON.stringify(
        enforceStoryRequirements(gameState)
      )}
      
      **Character Development:**
      - Focus on consistent personalities and motivations based on past choices
      - Create character growth opportunities through meaningful decisions
      - Reference previous events for narrative continuity (see Memory section)
      
      **Plot Structure:**
      - For ${
        gameState.getCurrentChapter().arc || "introduction"
      } stage: ${getArcGuidelines(gameState.getCurrentChapter().arc)}
      - Balance player agency with the overarching narrative
      - Create rising tension through progressively challenging obstacles
      - Please respond in clear, concise ${getTerm(
        getLanguage()
      )} STICK TO THIS LANGUAGE AND DO NOT CHANGE BASED ON THIS.
      ${
        detectNarrativeLoop(gameState)
          ? "- URGENT: Break the current narrative loop with new elements"
          : ""
      }
      
      **Memory:** 
      ${summarizeImportantEvents(gameState)}
      
      ${getEnhancedAIInstructions(gameState)}
      `,
      };

      const messages: ChatCompletionRequestMessage[] = [
        baseScenarioMessage,
        ...gameState
          .getConversationHistory()
          .slice(-9)
          .map((msg) => ({
            role: msg.role as "system" | "user" | "assistant",
            content: msg.content,
          })),
      ];

      const spinner = ora(
        chalk.hex(getTheme().accentColor)("Generating next scene...")
      ).start();
      let narrative = await generateChatNarrative(messages, {
        maxTokens: 500,
        temperature: 0.7,
      });
      spinner.succeed(chalk.hex(getTheme().accentColor)("Scene generated."));
      if (
        narrative.toLowerCase().includes("the end") ||
        narrative.toLowerCase().includes("congratulations") ||
        narrative.toLowerCase().includes("your quest is complete")
      ) {
        const { canResolveQuest, requiredElementsMissing } =
          enforceStoryRequirements(gameState);

        if (!canResolveQuest) {
          // Modify the narrative to prevent premature ending
          console.log(
            chalk
              .hex(getTheme().accentColor)
              .bold(
                `\n⚠️ Story cannot end yet. Missing: ${requiredElementsMissing.join(
                  ", "
                )}`
              )
          );

          // Re-generate the narrative with stricter instructions
          gameState.addConversation({
            role: "system",
            content: `DO NOT end the story yet. Missing requirements: ${requiredElementsMissing.join(
              ", "
            )}. Continue the adventure with new challenges.`,
          });

          // Re-generate without the ending
          narrative = await generateChatNarrative(
            [
              ...messages,
              {
                role: "system",
                content:
                  "IMPORTANT: Do not end the story yet. Continue the adventure.",
              },
            ],
            {
              maxTokens: 500,
              temperature: 0.7,
            }
          );
        }
      }

      gameState.addConversation({
        role: "assistant",
        content: narrative,
      });
      gameState.addNarrative(narrative);

      // Extract any potential new objectives from the narrative
      await extractNewObjectives(narrative, gameState);

      const narrativeParts = narrative.split("CHOICES:");
      const storyText = narrativeParts[0].trim();
      console.log("\n" + secondaryColor(storyText) + "\n");

      // Handle special encounters
      if (narrative.toLowerCase().includes("start dungeon:")) {
        try {
          await dungeonMinigame();
        } catch (error) {
          log(
            `Error in dungeon minigame: ${
              error instanceof Error ? error.message : String(error)
            }`,
            "Error"
          );
          await pressEnter({
            message:
              "There was an issue with the dungeon. Press Enter to continue your journey...",
          });
        }
      } else if (narrative.toLowerCase().includes("combat encounter:")) {
        await pressEnter({
          message: "Press Enter when you're ready for combat...",
        });
        try {
          const enemy = await generateEnemyFromNarrative(
            narrative,
            characterData
          );
          console.log(
            chalk.hex(getTheme().accentColor)(
              `\n⚔️ Combat encounter triggered!`
            )
          );
          console.log(secondaryColor(`A ${enemy.name} appears before you...`));
          await pause(1500);
          const combatResult = await runCombat(characterData, enemy);
          if (!combatResult) {
            console.log(
              secondaryColor("You have been defeated or fled. Game over.")
            );
            return;
          } else {
            characterData.xp = String(
              Number(characterData.xp) + enemy.xpReward
            );
            console.log(
              primaryColor(`Victory! You gained ${enemy.xpReward} XP.`)
            );
            if (Math.random() < 0.5) {
              const newItem = generateRandomItem(Number(characterData.level));
              console.log(
                primaryColor(
                  `You found a new item: ${newItem.name} (Rarity: ${newItem.rarity}).`
                )
              );
              characterData.inventory.push(newItem);
            }
            saveDataToFile("character", characterData);
          }
        } catch (error) {
          log(
            `Error in combat: ${
              error instanceof Error ? error.message : String(error)
            }`,
            "Error"
          );
        }
        await pressEnter({
          message: "Press Enter to continue your journey...",
        });
      } else if (narrative.toLowerCase().includes("roll a d20")) {
        console.log(secondaryColor("A dice roll is required..."));
        const [rollResult] = rollDice(20, 1);
        console.log(secondaryColor(`You rolled: ${rollResult}`));
        gameState.addConversation({
          role: "user",
          content: `I rolled a ${rollResult} on a d20.`,
        });
      }

      await pressEnter({
        message:
          "Take a moment to reflect on this scene and then choose your next action.",
      });
      let choice;
      try {
        choice = await promptForChoice(narrative);
      } catch (error) {
        log(
          `Error processing choice: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Error"
        );
        choice = "Continue the adventure";
      }

      if (
        choice.toLowerCase().includes("return to main menu") ||
        choice.toLowerCase() === "exit"
      ) {
        console.log(
          chalk.hex(getTheme().accentColor)("Returning to main menu...")
        );
        await saveGameState(gameState);
        return;
      }
      console.log(secondaryColor(`You chose: ${choice}`));

      // Analyze the player choice for narrative insights
      await analyzePlayerChoice(choice, gameState);

      gameState.addConversation({
        role: "user",
        content: `Player choice: ${choice}`,
      });
      gameState.addNarrative(`Player choice: ${choice}`);

      // Check if the choice completes any objectives
      await checkObjectiveCompletion(choice, gameState);

      await saveGameState(gameState);
    } catch (error: any) {
      log("Campaign loop error: " + error.message, "Error");
      console.log(secondaryColor("An error occurred in the main game loop."));

      try {
        await saveGameState(gameState);
        console.log(
          secondaryColor("Game state saved. You can continue later.")
        );
      } catch (saveError) {
        log(
          `Failed to save game state: ${
            saveError instanceof Error ? saveError.message : String(saveError)
          }`,
          "Error"
        );
      }

      await pressEnter({
        message: "Press Enter to return to the main menu...",
      });
      return;
    }
  }
}

/**
 * Starts the campaign by loading character data and persistent game state,
 * then entering the main campaign loop.
 */
export async function startCampaign(): Promise<void> {
  try {
    const characterData = getDataFromFile("character");
    if (!characterData) {
      log("No character data found. Please create a character first.", "Error");
      return;
    }
    if (
      !Array.isArray(characterData.inventory) ||
      characterData.inventory.length === 0
    ) {
      const { getStartingItems } = await import(
        "@utilities/InventoryService.js"
      );
      characterData.inventory = getStartingItems(characterData.class);
    }

    console.log(chalk.hex(getTheme().accentColor)("Starting campaign..."));
    const gameState = new GameState();
    await campaignLoop(gameState, characterData);
  } catch (error) {
    log(
      `Campaign start error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
    console.log(
      secondaryColor("Failed to start campaign. Returning to main menu...")
    );
  }
}

//TODO: Implement the missing terms T_T
//TODO: Add the shop mechanic
//TODO: Rework the inventory mechanics
//TODO:Improve items and their effects
//TODO: Ensure that the story is complete and all the requirements are met
//TODO: Finish up the test file for the story
