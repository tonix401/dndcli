// src/combat.ts
import inquirer from "inquirer";
import { rollDice } from "../utilities/DiceService.js";
import ICharacterData from "../types/ICharacterData.js";
import { IEnemy } from "../types/IEnemy.js";

/**
 * Runs a turn-based combat encounter between the player and an enemy.
 * Returns true if the player wins, false if defeated or if the player flees.
 */
export async function runCombat(
  character: ICharacterData,
  enemy: IEnemy
): Promise<boolean> {
  console.log(`\nA wild ${enemy.name} appears!`);
  console.log(`Enemy HP: ${enemy.hp}\n`);

  while (enemy.hp > 0 && Number(character.hp) > 0) {
    console.log(`Your HP: ${character.hp}/${character.abilities.maxhp}`);
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Choose your action:",
      choices: ["Attack", "Use Item", "Defend", "Run"],
    });

    if (action === "Attack") {
      const [playerRoll] = rollDice(6, 1);
      const playerDamage = Number(character.abilities.strength) + playerRoll;
      console.log(`You attack and deal ${playerDamage} damage.`);
      enemy.hp -= playerDamage;
    } else if (action === "Use Item") {
      const healingPotion = character.inventory.find(
        (item) => item.effect === "restoreHP" && item.quantity > 0
      );
      if (healingPotion) {
        console.log(`You use a ${healingPotion.name} and restore 10 HP.`);
        healingPotion.quantity--;
        character.hp = String(
          Math.min(Number(character.abilities.maxhp), Number(character.hp) + 10)
        );
        console.log(
          `Your HP is now ${character.hp}/${character.abilities.maxhp}.`
        );
      } else {
        console.log("You have no healing items!");
      }
    } else if (action === "Defend") {
      console.log("You brace yourself, reducing incoming damage this turn.");
      // Implement defense mechanics as needed.
    } else if (action === "Run") {
      const [runRoll] = rollDice(6, 1);
      if (runRoll > 3) {
        console.log("You successfully escape from combat!");
        return false;
      } else {
        console.log("You failed to escape!");
      }
    }

    if (enemy.hp <= 0) {
      console.log(`\nYou have defeated the ${enemy.name}!\n`);
      return true;
    }

    // Enemy's turn.
    console.log(`\nThe ${enemy.name} attacks!`);
    const [enemyRoll] = rollDice(6, 1);
    const enemyDamage = Math.max(
      enemy.attack + enemyRoll - Number(character.abilities.strength),
      0
    );
    console.log(`The enemy deals ${enemyDamage} damage.`);
    character.hp = String(Math.max(Number(character.hp) - enemyDamage, 0));
    if (Number(character.hp) <= 0) {
      console.log("You have been defeated by the enemy.");
      return false;
    }
  }
  return true;
}
