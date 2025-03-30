import {
  accentColor,
  pressEnter,
  primaryColor,
} from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { log } from "@utilities/LogService.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";
import { getStartingItems } from "@utilities/character/InventoryService.js";
import { getRandomEnemy } from "@utilities/combat/EnemyService.js";
import ICharacter from "@utilities/ICharacter.js";
import { IEnemy } from "@utilities/IEnemy.js";
import { runCombat } from "src/combat.js";

export async function testCombat() {
  const testEnemy: IEnemy = getRandomEnemy(
    getDataFromFile("character")?.level ?? 1
  );
  let character: ICharacter = getDataFromFile("character");
  if (!character) {
    log("Test Combat: No character", "Warn ");
    console.log(primaryColor(getTerm("noCharacter")));
    await pressEnter();
    return;
  }

  // Ensure character has required properties
  if (!character.inventory) {
    log("Test Combat: player did not have inventory", "Warn ");
    const startingItems = getStartingItems(character.class);
    character.inventory = startingItems.inventory;
    character.equippedItems = startingItems.equipped;
  }
  if (!character.abilities) {
    log(
      "Test Combat: player did not have required properties: abilities",
      "Warn "
    );
    character.abilities = {
      maxhp: 100,
      strength: 10,
      mana: 10,
      dexterity: 10,
      charisma: 10,
      luck: 10,
    };
  }
  if (!character.xp) {
    log("Test Combat: player did not have required properties: xp", "Warn ");
    character.xp = 0;
  }

  // Run combat
  const result = await runCombat(character, testEnemy);

  // Handle combat results
  if (result) {
    if (result.success) {
      console.log(accentColor("\nCombat test completed successfully!"));
      console.log(accentColor(`XP gained: ${testEnemy.xpReward}`));
      character.xp = character.xp + testEnemy.xpReward;
      saveDataToFile("character", character);
    } else if (result.fled) {
      console.log(accentColor("\nYou fled from combat!"));
    } else {
      console.log(accentColor("\nYou were defeated!"));
    }
  }

  await pressEnter();
}
