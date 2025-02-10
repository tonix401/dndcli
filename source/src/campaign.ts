import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import {
  generateChatNarrative,
  generateEnemyFromNarrative,
} from "./aiAssistant.js";
import { rollDice } from "../utilities/DiceService.js";
import { GameState, promptForChoice } from "./gameMaster.js";
import { log, LogTypes } from "../utilities/LogService.js";
import { runCombat } from "./combat.js";
import { generateRandomItem } from "../utilities/ItemGenerator.js";
import { saveGameState, loadGameState } from "../utilities/SaveLoadService.js";
import { getStartingItems } from "../utilities/InventoryService.js";
import { saveCharacterData } from "../utilities/CharacterService.js";
/**
 * Displays a persistent status bar showing key character stats.
 */
function displayStatusBar(character: any): void {
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
}

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
  if (gameState.narrativeHistory.length > 0) {
    const recap =
      gameState.narrativeHistory[gameState.narrativeHistory.length - 1];
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
  if (gameState.narrativeHistory.length === 0) {
    displayStatusBar(characterData);
    const introNarrative = await generateChatNarrative(
      [
        {
          role: "system",
          content: `
${chalk.bold.underline("🌟 Welcome to Eldoria!")}
You are embarking on a measured, character-driven journey. The pacing here is like a well-planned novel – each scene unfolds deliberately, giving you time to reflect on the world and your choices.
**Character Details:**
  - Name: ${chalk.bold(characterData.name)}
  - Level: ${chalk.bold(characterData.level + " " + characterData.class)}
  - Origin: ${chalk.bold(characterData.origin || "Unknown")}
  - Stats: HP ${characterData.hp}/${characterData.abilities.maxhp}, Strength ${
            characterData.abilities.strength
          }, Mana ${characterData.abilities.mana}, Dexterity ${
            characterData.abilities.dexterity
          }, Charisma ${characterData.abilities.charisma}, Luck ${
            characterData.abilities.luck
          }.
${chalk.italic("Current Plot:")} ${gameState.plotSummary}
Please provide a narrative that builds slowly and ends with three carefully considered numbered choices followed by "Return to main menu."
Respond in English.
          `,
        },
      ],
      { maxTokens: 500, temperature: 0.7 }
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
    gameState.narrativeHistory.push(introNarrative);
    gameState.conversationHistory.push({
      role: "user",
      content: `Player choice: ${initialChoice}`,
    });
    await saveGameState(gameState);
  }

  // Main narrative loop.
  while (true) {
    try {
      displayStatusBar(characterData);

      // Optionally update the plot if enough choices have been made.
      if (gameState.choices.length >= 5 && gameState.plotStage === 1) {
        gameState.updatePlot(
          2,
          "New clues emerge slowly. Your challenges remain significant, but time lets you breathe and decide your path carefully."
        );
      }

      const baseScenarioMessage = {
        role: "system",
        content: `
      ${chalk.bold.underline("Next Chapter Begins:")}
      Chapter (Stage ${chalk.bold(
        gameState.plotStage.toString()
      )}): ${chalk.italic(gameState.plotSummary)}
      **Character Info:**
        - Name: ${chalk.bold(characterData.name)}, Level: ${chalk.bold(
          characterData.level + " " + characterData.class
        )}
        - Origin: ${chalk.bold(characterData.origin || "Unknown")}
        - Stats: HP ${characterData.hp}/${
          characterData.abilities.maxhp
        }, Strength ${characterData.abilities.strength}, Mana ${
          characterData.abilities.mana
        }, Dexterity ${characterData.abilities.dexterity}, Charisma ${
          characterData.abilities.charisma
        }, Luck ${characterData.abilities.luck}.
  
  Instructions:
  1. Generate narrative that unfolds at a measured pace
  2. For combat situations, use format: "COMBAT ENCOUNTER: [enemy description]" without providing choices
  3. For non-combat situations, end with exactly three numbered choices
  4. Only use "COMBAT ENCOUNTER:" at dramatic moments when combat is truly appropriate
  5. After a player flees combat, generate narrative about their escape and new situation
  
  Example combat format:
  "As you round the corner, COMBAT ENCOUNTER: A massive troll emerges from the shadows, its club dragging across the stone floor."
  
  Example non-combat format:
  "You find yourself in a quiet grove. What do you do?
  
  1. Investigate the ancient stones
  2. Listen for wildlife
  3. Search for herbs"
  `,
      };

      const messages = [
        baseScenarioMessage,
        ...gameState.conversationHistory.slice(-9),
      ];

      const spinner = ora(chalk.cyan("Generating next scene...")).start();
      const narrative = await generateChatNarrative(messages, {
        maxTokens: 500,
        temperature: 0.7,
      });
      spinner.succeed(chalk.greenBright("Scene generated."));
      gameState.conversationHistory.push({
        role: "assistant",
        content: narrative,
      });
      gameState.narrativeHistory.push(narrative);

      console.log("\n" + chalk.cyanBright(narrative) + "\n");

      // If the narrative indicates a combat encounter, engage combat.
      // In campaign.ts, modify the combat section:
      if (narrative.toLowerCase().includes("combat encounter:")) {
        // Let user read the narrative first
        await pauseForReflection("Press Enter when you're ready for combat...");

        const enemy = await generateEnemyFromNarrative(
          narrative,
          characterData
        );

        console.log(chalk.redBright(`\n⚔️ Combat encounter triggered!`));
        console.log(chalk.yellow(`A ${enemy.name} appears before you...`));

        // Additional dramatic pause
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
          // Save the updated character data
          saveCharacterData(characterData);
          // Pause after combat ends
          await pauseForReflection("Press Enter to continue your journey...");
        }
      } else if (narrative.toLowerCase().includes("roll a d20")) {
        console.log(chalk.yellowBright("A dice roll is required..."));
        const [rollResult] = rollDice(20, 1);
        console.log(chalk.yellowBright(`You rolled: ${rollResult}`));
        gameState.conversationHistory.push({
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
      gameState.conversationHistory.push({
        role: "user",
        content: `Player choice: ${choice}`,
      });
      gameState.narrativeHistory.push(`Player choice: ${choice}`);
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
  // Ensure inventory is initialized.
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
  gameState.conversationHistory = [];
  await campaignLoop(gameState, characterData);
}
