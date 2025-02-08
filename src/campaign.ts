// src/campaign.ts
import inquirer from "inquirer";
import { generateChatNarrative } from "./aiAssistant.js";
import { rollDice } from "../utilities/DiceService.js";
import { GameState } from "./gameState.js";
import { promptForChoice } from "./gameMaster.js";
import { log, LogTypes } from "../utilities/LogService.js";
import { runCombat } from "./combat.js";
import { generateRandomItem } from "../utilities/ItemGenerator.js";
import { saveGameState, loadGameState } from "../utilities/SaveLoadService.js";

/**
 * Remove numbered option lines from narrative.
 */
function removeOptionsFromNarrative(narrative: string): string {
  return narrative
    .split("\n")
    .filter((line) => !line.trim().match(/^(\d+)\.\s+/))
    .join("\n");
}

/**
 * Pause function: waits for Enter.
 */
async function pauseForReflection(
  message = "Press Enter to continue..."
): Promise<void> {
  await inquirer.prompt({ type: "input", name: "pause", message });
}

/**
 * Introduction Narrative:
 * Builds an immersive world introduction.
 */
export async function introductionNarrative(
  gameState: GameState,
  characterData: any
): Promise<string> {
  const baseMessage = {
    role: "system",
    content: `
You are an experienced Dungeon Master for an epic Dungeons & Dragons adventure set in the world of Eldoria.
Welcome to Eldoria—a vast realm filled with ancient magic, sprawling kingdoms, and mysterious ruins. In Lysoria, legends of both wondrous miracles and dark curses echo throughout the streets and forests.
This is the beginning of a deep and compelling plot. Dark rumors of an ancient evil have begun to surface.
Incorporate the following character info:
  - Character: ${characterData.name}, a level ${characterData.level} ${
      characterData.class
    }.
  - Origin: ${characterData.origin || "Unknown"}.
  - Stats: HP ${characterData.hp}/${characterData.abilities.maxhp}, Strength ${
      characterData.abilities.strength
    }, Mana ${characterData.abilities.mana}, Dexterity ${
      characterData.abilities.dexterity
    }, Charisma ${characterData.abilities.charisma}, Luck ${
      characterData.abilities.luck
    }.
Current Plot: ${gameState.plotSummary}
Describe the world in vivid, evocative detail, introducing the first scene and emphasizing the character’s humble origins and realistic limitations.
Break the narrative into small, deliberate steps. At the end, present three clear choices plus a fourth option: "Return to main menu".
Respond in English.
    `,
  };

  gameState.conversationHistory = [baseMessage];
  const narrative = await generateChatNarrative(gameState.conversationHistory, {
    maxTokens: 500,
    temperature: 0.85,
  });
  gameState.conversationHistory.push({ role: "assistant", content: narrative });
  return narrative;
}

/**
 * Campaign Loop:
 * Runs the campaign, handles combat, random item drops, and saves the game state.
 */
export async function campaignLoop(
  gameState: GameState,
  characterData: any
): Promise<void> {
  if (!gameState || !characterData) {
    log("Campaign: Invalid game state or character data", LogTypes.ERROR);
    return;
  }

  // Try to load an existing game state (if any)
  const loadedState = await loadGameState();
  if (loadedState) {
    // Replace current gameState values with the loaded ones.
    Object.assign(gameState, loadedState);
    console.log("Campaign: Loaded saved campaign state.");
  }

  // If no introduction has been recorded, start with one.
  if (gameState.narrativeHistory.length === 0) {
    const intro = await introductionNarrative(gameState, characterData);
    const cleanedIntro = removeOptionsFromNarrative(intro);
    console.log("\n" + cleanedIntro + "\n");
    await pauseForReflection(
      "Reflect on the introduction and then press Enter to choose your first step..."
    );
    const initialChoice = await promptForChoice(intro);
    if (
      initialChoice.toLowerCase().includes("return to main menu") ||
      initialChoice.toLowerCase() === "exit"
    ) {
      console.log("Campaign: Returning to main menu...");
      return;
    }
    gameState.narrativeHistory.push(intro);
    gameState.conversationHistory.push({
      role: "user",
      content: `Player choice: ${initialChoice}`,
    });
    // Save state after the introduction.
    await saveGameState(gameState);
  }

  // Main loop for subsequent scenarios.
  while (true) {
    try {
      // Update plot after milestones.
      if (gameState.choices.length >= 5 && gameState.plotStage === 1) {
        gameState.updatePlot(
          2,
          "Clues now point to a hidden cult aiming to awaken an ancient evil. Your journey faces tougher challenges, testing your skills, limitations, and origins."
        );
      }

      const baseScenarioMessage = {
        role: "system",
        content: `
You are an experienced Dungeon Master for an epic Dungeons & Dragons adventure in Eldoria.
Current Plot (Chapter ${gameState.plotStage}): ${gameState.plotSummary}
Based on previous events and the following character info:
  - Character: ${characterData.name}, a level ${characterData.level} ${
          characterData.class
        }.
  - Origin: ${characterData.origin || "Unknown"}.
  - Stats: HP ${characterData.hp}/${characterData.abilities.maxhp}, Strength ${
          characterData.abilities.strength
        }, Mana ${characterData.abilities.mana}, Dexterity ${
          characterData.abilities.dexterity
        }, Charisma ${characterData.abilities.charisma}, Luck ${
          characterData.abilities.luck
        }.
Generate the next scene in a step-by-step, realistic manner. Describe a clear event or decision point reflecting your character’s limitations.
The scene should be paced like a chapter in a well-developed story, then prompt the player.
Include a dice roll mechanic where appropriate.
Present exactly three numbered choices, followed by "Return to main menu".
Ensure NPCs and enemies behave realistically.
Respond in English.
        `,
      };

      const messages = [
        baseScenarioMessage,
        ...gameState.conversationHistory.slice(-9),
      ];

      const narrative = await generateChatNarrative(messages, {
        maxTokens: 500,
        temperature: 0.85,
      });

      gameState.conversationHistory.push({
        role: "assistant",
        content: narrative,
      });
      gameState.narrativeHistory.push(narrative);

      const cleanedNarrative = removeOptionsFromNarrative(narrative);
      console.log("\n" + cleanedNarrative + "\n");

      // --- Combat and Item Drop Handling ---
      if (narrative.toLowerCase().includes("combat encounter")) {
        const enemy = {
          name: "Goblin Raider",
          hp: 15,
          attack: 3,
          defense: 1,
          xpReward: 20,
        };

        console.log("\nCombat encounter detected.");
        const combatResult = await runCombat(characterData, enemy);
        if (!combatResult) {
          console.log("You have been defeated or fled. Campaign over.");
          return;
        } else {
          characterData.xp = String(Number(characterData.xp) + enemy.xpReward);
          console.log(`Your XP is now ${characterData.xp}.`);
          // 50% chance for an item drop.
          if (Math.random() < 0.5) {
            const newItem = generateRandomItem(Number(characterData.level));
            console.log(
              `You found a new item: ${newItem.name} (Rarity: ${newItem.rarity})!`
            );
            characterData.inventory.push(newItem);
          }
        }
      } else if (narrative.toLowerCase().includes("roll a d20")) {
        console.log("A dice roll is needed to determine the outcome...");
        const [rollResult] = rollDice(20, 1);
        console.log(`You rolled: ${rollResult}`);
        gameState.conversationHistory.push({
          role: "user",
          content: `I rolled a ${rollResult} on a d20.`,
        });
      }
      // --- End Combat Handling ---

      await pauseForReflection(
        "Take a moment to reflect on this scene. Press Enter to view your choices."
      );
      const choice = await promptForChoice(narrative);
      if (
        choice.toLowerCase().includes("return to main menu") ||
        choice.toLowerCase() === "exit"
      ) {
        console.log("\nReturning to main menu...\n");
        // Save the game state before returning.
        await saveGameState(gameState);
        return;
      }

      console.log("\nYou chose:", choice, "\n");
      gameState.conversationHistory.push({
        role: "user",
        content: `Player choice: ${choice}`,
      });
      gameState.narrativeHistory.push(`Player choice: ${choice}`);

      // Save the game state at the end of each iteration.
      await saveGameState(gameState);
    } catch (error: any) {
      log("Campaign: Error in campaign: " + error.message, LogTypes.ERROR);
      return;
    }
  }
}

/**
 * Starts the campaign:
 * Loads character data and persistent game state, then enters the campaign loop.
 */
export async function startCampaign(): Promise<void> {
  const { getCharacterData } = await import("../utilities/CharacterService.js");
  const characterData = getCharacterData();
  if (!characterData) {
    log(
      "Campaign: No character data found. Please create a character first.",
      LogTypes.ERROR
    );
    return;
  }
  const gameState = new GameState();
  gameState.conversationHistory = [];
  await campaignLoop(gameState, characterData);
}
