import {
  accentColor,
  pressEnter,
  primaryColor,
} from "@utilities/ConsoleService.js";
import { getRandomEnemy } from "@utilities/GameService.js";
import ICharacter from "@utilities/ICharacter.js";
import { IEnemy } from "@utilities/IEnemy.js";
import { getStartingItems } from "@utilities/InventoryService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";
import { runCombat } from "src/combat.js";

const testEnemy: IEnemy = getRandomEnemy(
  getDataFromFile("character")?.level ?? 1
);

export async function testCombat() {
  let character: ICharacter = getDataFromFile("character");
  if (!character) {
    console.log(primaryColor(getTerm("noCharacter")));
    await pressEnter();
    return;
  }

  // Ensure character has required properties
  if (!character.inventory) {
    const startingItems = getStartingItems(character.class);
    character.inventory = startingItems.inventory;
    character.equippedItems = startingItems.equipped;
  }
  if (!character.abilities) {
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
