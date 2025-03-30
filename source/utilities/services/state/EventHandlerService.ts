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
import { runCombat, CombatResult } from "../../../src/combat.js";
import { IGameState } from "../../types/IGameState.js";
import { getTerm } from "@utilities/LanguageService.js";

/**
 * Event result interface
 */
interface EventResult {
  combatResult: CombatResult;
}

/**
 * Handles special events based on their type and narrative context
 *
 * @param specialEvent The special event object with type and details
 * @param narrative The current narrative text
 * @param characterData Character data
 * @param gameState Current game state
 * @returns Promise that resolves with the event result
 */
export async function handleSpecialEvent(
  specialEvent: { type: string; details: string },
  narrative: string,
  characterData: any,
  gameState: IGameState
): Promise<EventResult | void> {
  // Check if this is a combat event
  if (
    narrative.toLowerCase().includes("combat encounter:") ||
    specialEvent.type === "combat"
  ) {
    const combatResult = await handleCombatEvent(narrative, characterData);
    return { combatResult };
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
 * Handles permanent character defeat by deleting saved game files
 */
export async function handleCharacterDefeat(): Promise<void> {
  try {
    console.log(Console.errorColor("\n💀 " + getTerm("characterDefeated")));
    await Console.pause(2000);

    console.log(Console.errorColor(getTerm("permadeathMessage")));
    await Console.pause(1500);

    // Delete save files using Storage service
    const characterDeleted = Storage.deleteDataFile("character");
    if (characterDeleted) {
      console.log(Console.secondaryColor("Character file deleted."));
    }

    const gameStateDeleted = Storage.deleteDataFile("gameState");
    if (gameStateDeleted) {
      console.log(Console.secondaryColor("Game state file deleted."));
    }

    console.log(Console.accentColor(getTerm("startNewAdventure")));
    await Console.pressEnter({
      message: getTerm("pressEnterToReturnToMenu"),
    });
  } catch (error) {
    Log.log(`Failed to handle character defeat: ${error}`, "Error");
    console.log(Console.errorColor(getTerm("errorDeletingSaves")));
  }
}

/**
 * Handles a combat encounter
 *
 * @param narrative The narrative containing combat context
 * @param characterData Character data
 * @returns Combat result indicating success or failure
 */
async function handleCombatEvent(
  narrative: string,
  characterData: any
): Promise<CombatResult> {
  await Console.pressEnter({
    message: getTerm("pressEnterForCombat"),
  });

  try {
    // Generate an enemy based on the narrative and player data
    const enemy = await AI.generateEnemyFromNarrative(narrative, characterData);

    console.log(
      chalk.hex(Cache.getTheme().accentColor)(
        `\n⚔️ ${getTerm("combatEncounterTriggered")}`
      )
    );

    console.log(
      Console.secondaryColor(
        `${getTerm("enemyAppears").replace("{enemy}", enemy.name)}`
      )
    );

    await Console.pause(1500);

    const combatResult = await runCombat(characterData, enemy);

    if (!combatResult || (!combatResult.success && !combatResult.fled)) {
      // Character was defeated in combat
      console.log(Console.secondaryColor(getTerm("combatDefeat")));
      await handleCharacterDefeat();
      return { success: false, fled: false };
    } else if (combatResult.fled) {
      // Player fled from combat
      console.log(Console.secondaryColor(getTerm("escapedCombat")));
      console.log(Console.secondaryColor(getTerm("noRewards")));
      await Console.pause(1500);
      return { success: false, fled: true };
    } else {
      // Combat victory - update player XP after victory
      characterData.xp = String(Number(characterData.xp) + enemy.xpReward);

      console.log(
        Console.primaryColor(
          getTerm("combatVictory").replace("{xp}", enemy.xpReward.toString())
        )
      );

      // Chance to receive a random item after combat
      if (Math.random() < 0.5) {
        const newItem = ItemGen.generateRandomItem(Number(characterData.level));

        const added = Inventory.addItemToInventory(characterData, newItem);

        if (added) {
          console.log(
            Console.primaryColor(
              getTerm("foundNewItem")
                .replace("{name}", newItem.name)
                .replace("{rarity}", newItem.rarity)
            )
          );
        } else {
          console.log(Console.secondaryColor(getTerm("inventoryFull")));
        }

        Storage.saveDataToFile("character", characterData);
      }

      return { success: true, fled: false };
    }
  } catch (error) {
    Log.log(
      `Error in combat: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
    return { success: false, fled: true };
  } finally {
    await Console.pressEnter({
      message: getTerm("pressContinueJourney"),
    });
  }
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

    // Capture the dungeon result
    const dungeonResult = await dungeonMinigame();

    // If player died in the dungeon, handle permadeath
    if (dungeonResult === "died") {
      console.log(Console.secondaryColor(getTerm("dungeonDefeat")));
      await handleCharacterDefeat();
      return; // Exit early - no loot for the dead
    }

    // If player fled, they get no rewards
    if (dungeonResult === "fled") {
      console.log(Console.secondaryColor(getTerm("dungeonFled")));
      console.log(Console.secondaryColor(getTerm("noRewards")));
      await Console.pause(1500);
      return; // Exit early - no loot for cowards
    }

    // Only award loot if the dungeon was completed successfully
    if (dungeonResult === "completed") {
      // After a successful dungeon run, add loot drops
      const loot = Inventory.generateLootDrop(characterData.level);

      if (loot.length > 0) {
        console.log(Console.primaryColor(`\n${getTerm("foundItems")}`));

        loot.forEach((item) => {
          const added = Inventory.addItemToInventory(characterData, item);

          if (added) {
            console.log(
              Console.primaryColor(
                getTerm("foundItem")
                  .replace("{name}", item.name)
                  .replace("{rarity}", item.rarity)
              )
            );
          } else {
            console.log(
              Console.secondaryColor(getTerm("inventoryFullItemLeft"))
            );
          }
        });

        Storage.saveDataToFile("character", characterData);
      }
    }
  } catch (error) {
    Log.log(
      `Error in dungeon minigame: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );

    await Console.pressEnter({
      message: getTerm("dungeonIssue"),
    });
  }
}

/**
 * Handles shop interactions
 *
 * @param characterData Character data
 */
async function handleShopEvent(characterData: any): Promise<void> {
  console.log(Console.primaryColor(`\n${getTerm("merchantEncounter")}`));

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
  console.log(Console.secondaryColor(getTerm("diceRollRequired")));

  const [rollResult] = Dice.rollDice(20, 1);

  console.log(
    Console.secondaryColor(
      getTerm("youRolled").replace("{roll}", rollResult.toString())
    )
  );

  return rollResult;
}
