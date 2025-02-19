import inquirer from "inquirer";
import chalk from "chalk";
import { rollDice } from "../utilities/DiceService.js";
import { inventoryMenu } from "../utilities/InventoryService.js";
import ICharacterData from "../types/ICharacterData.js";
import { IEnemy } from "../types/IEnemy.js";

interface CombatResult {
  success: boolean;
  fled: boolean;
}

function displayCombatStatus(character: ICharacterData, enemy: IEnemy, round: number): void {
  console.clear();
  console.log(
    chalk.bgBlackBright.white.bold(`=== Battle Status (Round ${round}) ===`)
  );
  console.log(
    chalk.whiteBright(
      `Hero: ${character.name} | HP: ${Number(character.hp)}/${Number(
        character.abilities.maxhp
      )} | XP: ${character.xp || 0}`
    )
  );
  console.log(chalk.whiteBright(`${enemy.name} | HP: ${enemy.hp}`));
  console.log(
    chalk.bgBlackBright.white.bold("=============================\n")
  );
}

async function pause(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export async function runCombat(
  character: any,
  enemy: {
    name: string;
    hp: number;
    attack: number;
    defense: number;
    xpReward: number;
  }
): Promise<CombatResult> {
  enemy.hp = enemy.hp < 30 ? 30 : enemy.hp;
  console.clear();
  console.log(
    chalk.redBright(`\n⚔️ A wild ${enemy.name} appears with ${enemy.hp} HP!`)
  );
  await pause(1000);

  let round = 1;
  while (enemy.hp > 0 && Number(character.hp) > 0) {
    displayCombatStatus(character, enemy, round);

    console.log(chalk.redBright(`\n${enemy.name} is preparing a strike...`));
    await pause(800);

    const { combatAction } = await inquirer.prompt([
      {
        type: "list",
        name: "combatAction",
        message: "Choose your combat action:",
        choices: ["⚔️  Attack", "🛡️  Defend", "🎒  Use Item", "🏃  Run Away"],
      },
    ]);

    if (combatAction.includes("Attack")) {
      const [playerRoll] = rollDice(4, 1);
      const critMultiplier = playerRoll === 4 ? 2 : 1;
      const damage =
        (Number(character.abilities.strength) + playerRoll) * critMultiplier;
      console.log(chalk.greenBright(`\nYou attack and deal ${damage} damage.`));
      enemy.hp -= damage;
    } else if (combatAction.includes("Defend")) {
      console.log(
        chalk.blueBright("\nYou brace for the enemy's attack, reducing damage.")
      );
      character.isDefending = true;
    } else if (combatAction.includes("Use Item")) {
      await inventoryMenu(character);
    } else if (combatAction.includes("Run Away")) {
      const [runRoll] = rollDice(20, 1);
      const escapeChance = runRoll + Number(character.abilities.dexterity);

      if (escapeChance > 15) {
        console.log(chalk.yellowBright("\nYou manage to escape from combat!"));
        await pause(1000);
        return { success: false, fled: true };
      } else {
        console.log(chalk.yellowBright("\nYou fail to escape!"));
      }
    }

    if (enemy.hp > 0) {
      console.log(chalk.redBright(`\n${enemy.name} launches its attack!`));
      const [enemyRoll] = rollDice(6, 1);
      let enemyDamage = Math.max(
        enemy.attack + enemyRoll - Number(character.abilities.strength),
        1
      );

      if (character.isDefending) {
        enemyDamage = Math.floor(enemyDamage * 0.5);
        console.log(chalk.blueBright("Your defense reduces the damage!"));
        character.isDefending = false;
      }

      character.hp = String(Math.max(Number(character.hp) - enemyDamage, 0));
      console.log(chalk.redBright(`You take ${enemyDamage} damage!`));

      if (Number(character.hp) <= 0) {
        console.log(chalk.redBright("\n💀 You have been defeated!"));
        await pause(1500);
        return { success: false, fled: false };
      }
    }

    await pause(1000);
    round++;
  }

  console.log(chalk.greenBright(`\n🎉 You have defeated ${enemy.name}!`));
  await pause(1500);
  return { success: true, fled: false };
}
