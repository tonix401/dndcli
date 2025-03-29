/**
 * Event Handler Service - Manages special game events
 *
 * This service handles special events like combat encounters,
 * dungeon exploration, shop interactions, and dice rolls.
 */

import chalk from "chalk";
import {
  AI,
  Console,
  Dice,
  Inventory,
  ItemGen,
  Log,
  Storage,
  Cache,
} from "../../Services.js";
import { runCombat } from "../../../src/combat.js";
import { IGameState } from "../../types/IGameState.js";

/**
 * Handles special events based on their type and narrative context
 *
 * @param specialEvent The special event object with type and details
 * @param narrative The current narrative text
 * @param characterData Character data
 * @param gameState Current game state
 * @returns Promise that resolves when the event has been handled
 */
export async function handleSpecialEvent(
  specialEvent: { type: string; details: string },
  narrative: string,
  characterData: any,
  gameState: IGameState
): Promise<void> {
  // Check if this is a combat event
  if (
    narrative.toLowerCase().includes("combat encounter:") ||
    specialEvent.type === "combat"
  ) {
    await handleCombatEvent(narrative, characterData);
  }
  // Check if this is a dungeon event
  else if (
    narrative.toLowerCase().includes("start dungeon:") ||
    specialEvent.type === "dungeon"
  ) {
    await handleDungeonEvent(characterData);
  }
  // Check if this is a shop event
  else if (
    narrative.toLowerCase().includes("shop") ||
    narrative.toLowerCase().includes("store") ||
    specialEvent.type === "shop"
  ) {
    await handleShopEvent(characterData);
  }
  // Check if this is a dice roll event
  else if (
    narrative.toLowerCase().includes("roll a d20") ||
    specialEvent.type === "dice_roll"
  ) {
    const rollResult = await handleDiceRollEvent();
    gameState.addConversation({
      role: "user",
      content: `I rolled a ${rollResult} on a d20.`,
    });
  }
}

/**
 * Handles a combat encounter
 *
 * @param narrative The narrative containing combat context
 * @param characterData Character data
 */
async function handleCombatEvent(
  narrative: string,
  characterData: any
): Promise<void> {
  await Console.pressEnter({
    message: "Press Enter when you're ready for combat...",
  });

  try {
    // Generate an enemy based on the narrative and player data
    const enemy = await AI.generateEnemyFromNarrative(narrative, characterData);

    console.log(
      chalk.hex(Cache.getTheme().accentColor)(
        `\n⚔️ Combat encounter triggered!`
      )
    );

    console.log(
      Console.secondaryColor(`A ${enemy.name} appears before you...`)
    );

    await Console.pause(1500);

    const combatResult = await runCombat(characterData, enemy);

    if (!combatResult) {
      console.log(
        Console.secondaryColor("You have been defeated or fled. Game over.")
      );
      return;
    } else {
      // Update player XP after victory
      characterData.xp = String(Number(characterData.xp) + enemy.xpReward);

      console.log(
        Console.primaryColor(`Victory! You gained ${enemy.xpReward} XP.`)
      );

      // Chance to receive a random item after combat
      if (Math.random() < 0.5) {
        const newItem = ItemGen.generateRandomItem(Number(characterData.level));

        const added = Inventory.addItemToInventory(characterData, newItem);

        if (added) {
          console.log(
            Console.primaryColor(
              `You found a new item: ${newItem.name} (Rarity: ${newItem.rarity}).`
            )
          );
        } else {
          console.log(
            Console.secondaryColor(
              "Your inventory is full. The item was left behind."
            )
          );
        }

        Storage.saveDataToFile("character", characterData);
      }
    }
  } catch (error) {
    Log.log(
      `Error in combat: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
  }

  await Console.pressEnter({
    message: "Press Enter to continue your journey...",
  });
}

/**
 * Handles dungeon exploration
 *
 * @param characterData Character data
 */
async function handleDungeonEvent(characterData: any): Promise<void> {
  try {
    // Import and use the dungeon minigame component
    const { dungeonMinigame } = await import("@components/DungeonMinigame.js");

    await dungeonMinigame();

    // After a dungeon, add loot drops
    const loot = Inventory.generateLootDrop(characterData.level);

    if (loot.length > 0) {
      console.log(Console.primaryColor("\nYou found some items!"));

      loot.forEach((item) => {
        const added = Inventory.addItemToInventory(characterData, item);

        if (added) {
          console.log(
            Console.primaryColor(`Found: ${item.name} (${item.rarity})`)
          );
        } else {
          console.log(
            Console.secondaryColor("Your inventory is full. Item left behind.")
          );
        }
      });

      Storage.saveDataToFile("character", characterData);
    }
  } catch (error) {
    Log.log(
      `Error in dungeon minigame: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );

    await Console.pressEnter({
      message:
        "There was an issue with the dungeon. Press Enter to continue your journey...",
    });
  }
}

/**
 * Handles shop interactions
 *
 * @param characterData Character data
 */
async function handleShopEvent(characterData: any): Promise<void> {
  console.log(
    Console.primaryColor("\nYou've encountered a merchant willing to trade.")
  );

  const { handleShopInteraction } = await import(
    "@utilities/world/ShopService.js"
  );

  await handleShopInteraction(characterData);
}

/**
 * Handles dice roll events
 *
 * @returns The result of the dice roll
 */
async function handleDiceRollEvent(): Promise<number> {
  console.log(Console.secondaryColor("A dice roll is required..."));

  const [rollResult] = Dice.rollDice(20, 1);

  console.log(Console.secondaryColor(`You rolled: ${rollResult}`));

  return rollResult;
}
