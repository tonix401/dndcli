import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import {
  generateChatNarrative,
  generateEnemyFromNarrative,
  ChatCompletionRequestMessage,
} from "./aiAssistant.js";
import { rollDice } from "../utilities/DiceService.js";
import { GameState } from "./gameState.js";
import { promptForChoice } from "./gameMaster.js";
import { log, LogTypes } from "../utilities/LogService.js";
import { runCombat } from "./combat.js";
import { generateRandomItem } from "../utilities/ItemGenerator.js";
import { saveGameState, loadGameState } from "../utilities/SaveLoadService.js";
import { getStartingItems } from "../utilities/InventoryService.js";
import { saveCharacterData } from "../utilities/CharacterService.js";
import { getLanguage } from "../utilities/CacheService.js";

/**
 * Displays a persistent status bar showing key character stats.
 */
/* function displayStatusBar(character: any): void {
  console.clear();
  console.log(chalk.bgBlueBright.black.bold("=== Status ==="));
  const inventorySummary =
    character.inventory &&
    Array.isArray(character.inventory) &&
    character.inventory.length > 0
      ? character.inventory.map((item: any) => item.name).join(", ")
      : "None";
  console.log(
    chalk.blueBright(
      `Name: ${character.name} | HP: ${Number(character.hp)}/${Number(
        character.abilities.maxhp
      )} | XP: ${character.xp || 0} | Inventory: ${inventorySummary}`
    )
  );
  console.log(chalk.bgBlueBright.black.bold("===============\n"));
} */

/**
 * Pauses until user input.
 */
async function pauseForReflection(
  message = "⏳ Press Enter to continue..."
): Promise<void> {
  await inquirer.prompt({
    type: "input",
    name: "pause",
    message: chalk.yellowBright.bold(message),
  });
}

async function pause(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

/**
 * Displays a recap of the previous narrative.
 */
async function displayRecap(gameState: GameState): Promise<void> {
  const narrativeHistory = gameState.getNarrativeHistory();
  if (narrativeHistory.length > 0) {
    const recap = narrativeHistory[narrativeHistory.length - 1];
    console.log(chalk.blueBright.bold("\n🔄 Recap of your previous session:"));
    console.log(chalk.blueBright(recap));
    await pauseForReflection(
      "Review the recap, then press Enter to continue..."
    );
  }
}

/**
 * Main campaign loop.
 */
export async function campaignLoop(
  gameState: GameState,
  characterData: any
): Promise<void> {
  // Load saved state if available.
  const loadedState = await loadGameState();
  if (loadedState) {
    Object.assign(gameState, loadedState);
    console.log(chalk.greenBright.bold("✅ Loaded saved campaign state."));
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
- When a combat situation arises, begin your narrative with "COMBAT ENCOUNTER:" followed by any necessary dice roll calculations (e.g., “(roll: 1d20+3)”).
- Do not provide in-game choices during combat or dungeon encounters.

Player Actions & In-Game Syntax:
- The player’s in-game actions must be enclosed in curly braces {like this}. Only perform dice rolls or game mechanics when the player uses the correct syntax.
- In-character dialogue must be enclosed in quotation marks "like this".
- Out-of-character instructions will be provided in angle brackets <like this>.
- For non-combat scenes, always end with exactly three numbered choices enclosed in curly braces (e.g.,
  1.{Search the area}
  2.{Talk to the local}
  3.{Return to main menu}) to indicate the next available actions.

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
- Show all dice roll calculations in parentheses immediately after any narrative that involves a dice roll (e.g., “(roll: 1d20+2)”).
- When an action requiring a dice roll is not correctly enclosed in curly braces by the player, do not perform the roll or process the action.
- Reward the player with experience, currency, and track their progression as dictated by the AD&D 2e ruleset.
- Ensure that the player is allowed to defeat any NPC if they are capable, without making choices on their behalf.

Response Structure:
- Begin by outputting the full character sheet and an introductory narrative that sets the scene.
- In non-combat scenes, conclude with exactly three numbered in-game choices (using curly braces) for what the player can do next.
- For combat or dungeon sequences, follow the special encounter formatting instructions (i.e., "COMBAT ENCOUNTER:" or "START DUNGEON:") and transition smoothly between scenes once the encounter concludes.

Starting Instructions:
- Begin the session by displaying the full character sheet as described above, followed by an introductory narrative that establishes the initial location, setting, and context for the adventure. Make sure to have the introductory narrative as detailed as possible to help with the initial world building that comes with the story and origin of the character.
- Wait for the player to provide their first in-game command using the correct syntax.
          `,
        },
      ],
      { maxTokens: 500, temperature: 0.8 }
    );
    console.log("\n" + chalk.cyanBright(introNarrative) + "\n");
    await pauseForReflection(
      "Reflect on the introduction and then choose your first action..."
    );
    const initialChoice = await promptForChoice(introNarrative);
    if (
      initialChoice.toLowerCase().includes("return to main menu") ||
      initialChoice.toLowerCase() === "exit"
    ) {
      console.log(chalk.blueBright("Returning to main menu..."));
      return;
    }
    gameState.addNarrative(introNarrative);
    gameState.addConversation({
      role: "user",
      content: `Player choice: ${initialChoice}`,
    });
    await saveGameState(gameState);
  }

  // Main narrative loop.
  while (true) {
    try {
      /*       displayStatusBar(characterData); */

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

      const contextSummary = gameState.summarizeHistory();
      const baseScenarioMessage: ChatCompletionRequestMessage = {
        role: "system",
        content: `
     Welcome to the next chapter of your adventure!

**Recent Context:**
${contextSummary}

**Chapter Stage ${gameState.getPlotStage()}**: ${gameState.getPlotSummary()}

**Character Info:**
- Name: ${characterData.name}
- Level & Class: ${characterData.level} ${characterData.class}
- Stats: HP ${characterData.hp}/${characterData.abilities.maxhp}, STR ${
          characterData.abilities.strength
        }, MANA ${characterData.abilities.mana}, DEX ${
          characterData.abilities.dexterity
        }, CHA ${characterData.abilities.charisma}, LUCK ${
          characterData.abilities.luck
        }

**Instructions:**
1. Generate an immersive, book-like narrative that unfolds slowly.
2. For combat situations, output a line beginning with "COMBAT ENCOUNTER:" (no choices).
3. For dungeon sequences, output a line beginning with "START DUNGEON:" (no choices).
4. For non-combat scenes, end with exactly three numbered in-game choices followed by "Return to main menu."
5. After any special encounter (combat or dungeon), the narrative should transition seamlessly into the next scene.

Please respond in clear, concise ${getLanguage}.
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

      const spinner = ora(chalk.cyan("Generating next scene...")).start();
      const narrative = await generateChatNarrative(messages, {
        maxTokens: 500,
        temperature: 0.7,
      });
      spinner.succeed(chalk.greenBright("Scene generated."));
      gameState.addConversation({
        role: "assistant",
        content: narrative,
      });
      gameState.addNarrative(narrative);
      console.log("\n" + chalk.cyanBright(narrative) + "\n");

      if (narrative.toLowerCase().includes("combat encounter:")) {
        await pauseForReflection("Press Enter when you're ready for combat...");
        const enemy = await generateEnemyFromNarrative(
          narrative,
          characterData
        );
        console.log(chalk.redBright(`\n⚔️ Combat encounter triggered!`));
        console.log(chalk.yellow(`A ${enemy.name} appears before you...`));
        await pause(1500);
        const combatResult = await runCombat(characterData, enemy);
        if (!combatResult) {
          console.log(
            chalk.redBright("You have been defeated or fled. Game over.")
          );
          return;
        } else {
          characterData.xp = String(Number(characterData.xp) + enemy.xpReward);
          console.log(
            chalk.greenBright(`Victory! You gained ${enemy.xpReward} XP.`)
          );
          if (Math.random() < 0.5) {
            const newItem = generateRandomItem(Number(characterData.level));
            console.log(
              chalk.magentaBright(
                `You found a new item: ${newItem.name} (Rarity: ${newItem.rarity}).`
              )
            );
            characterData.inventory.push(newItem);
          }
          saveCharacterData(characterData);
          await pauseForReflection("Press Enter to continue your journey...");
        }
      } else if (narrative.toLowerCase().includes("roll a d20")) {
        console.log(chalk.yellowBright("A dice roll is required..."));
        const [rollResult] = rollDice(20, 1);
        console.log(chalk.yellowBright(`You rolled: ${rollResult}`));
        gameState.addConversation({
          role: "user",
          content: `I rolled a ${rollResult} on a d20.`,
        });
      }

      await pauseForReflection(
        "Take a moment to reflect on this scene and then choose your next action."
      );
      const choice = await promptForChoice(narrative);
      if (
        choice.toLowerCase().includes("return to main menu") ||
        choice.toLowerCase() === "exit"
      ) {
        console.log(chalk.blueBright("Returning to main menu..."));
        await saveGameState(gameState);
        return;
      }
      console.log(chalk.greenBright(`You chose: ${choice}`));
      gameState.addConversation({
        role: "user",
        content: `Player choice: ${choice}`,
      });
      gameState.addNarrative(`Player choice: ${choice}`);
      await saveGameState(gameState);
    } catch (error: any) {
      log("Campaign loop error: " + error.message, LogTypes.ERROR);
      return;
    }
  }
}

/**
 * Starts the campaign by loading character data and persistent game state,
 * then entering the main campaign loop.
 */
export async function startCampaign(): Promise<void> {
  const { getCharacterData } = await import("../utilities/CharacterService.js");
  const characterData = getCharacterData();
  if (!characterData) {
    log(
      "No character data found. Please create a character first.",
      LogTypes.ERROR
    );
    return;
  }
  if (
    !Array.isArray(characterData.inventory) ||
    characterData.inventory.length === 0
  ) {
    const { getStartingItems } = await import(
      "../utilities/InventoryService.js"
    );
    characterData.inventory = getStartingItems(characterData.class);
  }
  const gameState = new GameState();
  await campaignLoop(gameState, characterData);
}
