import inquirer from "inquirer";
import chalk from "chalk";
import chalkAnimation from "chalk-animation";
import { rollDice } from "@utilities/DiceService.js";
import { inventoryMenu } from "@utilities/InventoryService.js";
import { generateRandomItem } from "@utilities/ItemGenerator.js";
import readline from "readline";
import fs from "fs/promises";
import path from "path";
import ICharacter from "@utilities/ICharacter.js";
import { IEnemy } from "@utilities/IEnemy.js";
import { IAbility } from "@utilities/IAbility.js";
import { primaryColor, secondaryColor, totalClear } from "@utilities/ConsoleService.js";
import { saveDataToFile } from "@utilities/StorageService.js";
import { getTheme } from "@utilities/CacheService.js";
import Config from "@utilities/Config.js";

interface CombatResult {
  success: boolean;
  fled: boolean;
}

function renderHealthBar(current: number, max: number): string {
  const barLength = 20;
  const rawFilled = Math.round((current / max) * barLength);
  const filledLength = Math.min(rawFilled, barLength);
  const emptyLength = Math.max(barLength - filledLength, 0);
  return `[${"█".repeat(filledLength)}${" ".repeat(emptyLength)}]`;
}

function displayCombatStatus(
  character: ICharacter,
  enemy: IEnemy,
  round: number
): void {
  console.clear();
  console.log(
    chalk.bold(secondaryColor(`=== Battle Status (Round ${round}) ===`))
  );
  console.log(
    `Hero: ${character.name} | HP: ${renderHealthBar(
      character.hp,
      character.abilities.maxhp
    )} (${character.hp}/${character.abilities.maxhp}) | Mana: ${
      character.abilities.mana
    } | XP: ${character.xp || 0}`
  );
  console.log(
    `${enemy.name} | HP: ${renderHealthBar(enemy.hp, enemy.maxhp || 10)} (${
      enemy.hp
    }/${enemy.maxhp})`
  );
  console.log(
    chalk.bold(secondaryColor("=============================\n"))
  );
}

async function pause(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

async function promptContinue(): Promise<void> {
  await inquirer.prompt([
    { type: "input", name: "continue", message: "Press ENTER to continue..." },
  ]);
}

async function loadAttackFrames(): Promise<string[][]> {
  const filePath = Config.ATTACK_FRAMES_FILE;

  try {
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);

    // Check if the JSON has the expected structure
    if (!parsed.frames || !Array.isArray(parsed.frames)) {
      throw new Error("Animation JSON must contain a 'frames' array.");
    }

    return parsed.frames;
  } catch (error) {
    console.error(chalk.hex(getTheme().errorColor)(`Failed to load animation from: ${filePath}`));
    console.error(
      chalk.hex(getTheme().errorColor)(
        `Make sure the file exists at: ${filePath}`
      )
    );
    throw error;
  }
}

/**
 * Plays the attack animation using ASCII frames loaded from JSON.
 */
export async function playAttackAnimation() {
  const frameTime = 100; // milliseconds
  let stop = false;

  // Set up readline to listen for the user pressing Enter.
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", () => {
    stop = true;
    rl.close();
  });

  try {
    const framesData = await loadAttackFrames();
    if (!Array.isArray(framesData)) {
      throw new Error("Animation JSON does not contain an array of frames.");
    }

    // Animation loop: continuously loop through the frames
    while (!stop) {
      for (let i = 0; i < framesData.length; i++) {
        if (stop) break;
        // Clear the console using ANSI escape codes:
        totalClear();
        const frame = framesData[i];
        const frameArt = Array.isArray(frame) ? frame.join("\n") : frame;
        console.log(secondaryColor(frameArt));
        await pause(frameTime);
      }
    }
    // Final clear after animation stops.
    totalClear();
  } catch (error) {
    console.error(
      chalk.hex(getTheme().accentColor)(
        "Error loading attack animation frames:"
      ),
      error
    );
  }
}

function getStrengthBonus(character: ICharacter): number {
  let bonus = 0;
  if (character.inventory && Array.isArray(character.inventory)) {
    for (const item of character.inventory) {
      if (item.effect === "boostStrength" && item.quantity > 0) {
        bonus += 2 * item.quantity;
      }
    }
  }
  return bonus;
}

async function useAbility(character: ICharacter, enemy: IEnemy): Promise<void> {
  if (!character.abilitiesList || character.abilitiesList.length === 0) {
    console.log(primaryColor("You have no abilities available!"));
    await pause(1000);
    return;
  }
  const choices = character.abilitiesList.map(
    (ability: IAbility, index: number) => ({
      name: `${ability.name} (Cost: ${ability.manaCost} mana) - ${ability.description}`,
      value: index,
    })
  );
  const { abilityIndex } = await inquirer.prompt([
    {
      type: "list",
      name: "abilityIndex",
      message: "Choose an ability to use:",
      choices: choices,
    },
  ]);
  const chosenAbility: IAbility = character.abilitiesList[abilityIndex];
  if (character.abilities.mana < chosenAbility.manaCost) {
    console.log(chalk.hex(getTheme().accentColor)("Not enough mana!"));
    await pause(1000);
    return;
  }
  character.abilities.mana -= chosenAbility.manaCost;
  if (chosenAbility.type === "attack") {
    const [playerRoll] = rollDice(4, 1);
    const strengthBonus = getStrengthBonus(character);
    const tempBuff = character.tempStrengthBuff || 0;
    character.tempStrengthBuff = 0;
    const baseDamage =
      character.abilities.strength + playerRoll + strengthBonus + tempBuff;
    const damage = Math.floor(baseDamage * (chosenAbility.multiplier || 1));
    console.log(
      chalk.hex(getTheme().accentColor)(
        `\nYou use ${chosenAbility.name} and deal ${damage} damage.`
      )
    );
    enemy.hp -= damage;
  } else if (chosenAbility.type === "heal") {
    const healAmount = chosenAbility.healAmount || 0;
    character.hp = Math.min(
      character.hp + healAmount,
      character.abilities.maxhp
    );
    console.log(
      chalk.hex(getTheme().accentColor)(
        `\nYou use ${chosenAbility.name} and restore ${healAmount} HP.`
      )
    );
  } else if (chosenAbility.type === "buff") {
    const buff = chosenAbility.buffAmount || 0;
    console.log(
      chalk.hex(getTheme().accentColor)(
        `\nYou use ${chosenAbility.name} and gain a temporary +${buff} strength boost for your next attack.`
      )
    );
    character.tempStrengthBuff = buff;
  }
  await pause(1000);
}

async function enemyTurn(enemy: IEnemy, character: ICharacter): Promise<void> {
  let move;
  if (enemy.moves && enemy.moves.length > 0) {
    const index = Math.floor(Math.random() * enemy.moves.length);
    move = enemy.moves[index];
  } else {
    move = {
      name: "Basic Attack",
      type: "attack",
      multiplier: 1,
      description: "A standard attack",
    };
  }
  console.log(
    chalk.hex(getTheme().accentColor)(`\n${enemy.name} uses ${move.name}!`)
  );
  const enemyAnim = chalkAnimation.karaoke(
    `${enemy.name} is executing ${move.name}...`
  );
  await pause(800);
  enemyAnim.stop();

  if (move.type === "attack") {
    const [enemyRoll] = rollDice(6, 1);
    let damage = Math.max(
      enemy.attack + enemyRoll - character.abilities.strength,
      1
    );
    damage = Math.floor(damage * (move.multiplier || 1));
    character.hp = Math.max(character.hp - damage, 0);
    console.log(
      chalk.hex(getTheme().accentColor)(
        `\n${enemy.name}'s ${move.name} deals ${damage} damage to you!`
      )
    );
  } else if (move.type === "defend") {
    enemy.isDefending = true;
    console.log(
      chalk.hex(getTheme().accentColor)(
        `\n${enemy.name} is defending, reducing incoming damage this turn!`
      )
    );
  } else if (move.type === "scare") {
    const scareChance = Math.random();
    if (scareChance > 0.7) {
      console.log(
        chalk.hex(getTheme().accentColor)(
          `\n${enemy.name}'s taunt terrifies you! You lose your next turn!`
        )
      );
      character.losesTurn = true;
    } else {
      console.log(
        chalk.hex(getTheme().accentColor)(
          `\n${enemy.name} tries to scare you, but you remain unfazed!`
        )
      );
    }
  } else if (move.type === "heal") {
    const healAmount = move.healAmount || 10;
    enemy.hp = Math.min(enemy.hp + healAmount, enemy.maxhp || 10);
    console.log(
      chalk.hex(getTheme().accentColor)(
        `\n${enemy.name} heals for ${healAmount} HP!`
      )
    );
  }
  await promptContinue();
}

export async function runCombat(
  character: ICharacter,
  enemy: {
    name: string;
    hp: number;
    attack: number;
    defense: number;
    xpReward: number;
    maxhp?: number;
    moves?: Array<{
      name: string;
      type: "attack" | "defend" | "scare" | "heal";
      multiplier?: number;
      healAmount?: number;
      description: string;
    }>;
  }
): Promise<CombatResult> {
  enemy.hp = enemy.hp < 30 ? 30 : enemy.hp;
  enemy.maxhp = enemy.maxhp || enemy.hp;
  character.losesTurn = false;

  console.clear();
  console.log(
    chalk.hex(getTheme().accentColor)(
      `\n⚔️  A wild ${enemy.name} appears with ${enemy.hp} HP!`
    )
  );
  await pause(1000);

  let round = 1;
  while (enemy.hp > 0 && character.hp > 0) {
    displayCombatStatus(character, enemy, round);

    if (character.losesTurn) {
      console.log(
        chalk.hex(getTheme().accentColor)(
          "\nYou are too frightened to act this turn!"
        )
      );
      character.losesTurn = false;
      await pause(1000);
      if (enemy.hp > 0) {
        await enemyTurn(enemy, character);
        if (character.hp <= 0) {
          console.log(
            chalk.hex(getTheme().accentColor)("\n💀 You have been defeated!")
          );
          await pause(1500);
          return { success: false, fled: false };
        }
      }
      await pause(1000);
      round++;
      continue;
    }

    console.log(chalk.hex(getTheme().accentColor)("\nYour turn!"));
    await pause(800);

    const { combatAction } = await inquirer.prompt([
      {
        type: "list",
        name: "combatAction",
        message: "Choose your combat action:",
        choices: [
          "⚔️  Attack",
          "🛡️  Defend",
          "🌀 Use Ability",
          "🎒  Use Item",
          "🏃  Run Away",
        ],
      },
    ]);

    if (combatAction.includes("Attack")) {
      const attackAnim = chalkAnimation.pulse("⚔️ Swinging your sword!");
      await pause(800);
      attackAnim.stop();
      await playAttackAnimation();
      const [playerRoll] = rollDice(4, 1);
      const critMultiplier = playerRoll === 4 ? 2 : 1;
      const strengthBonus = getStrengthBonus(character);
      const tempBuff = character.tempStrengthBuff || 0;
      character.tempStrengthBuff = 0;
      const baseDamage =
        character.abilities.strength + playerRoll + strengthBonus + tempBuff;
      const damage = Math.floor(baseDamage * critMultiplier);
      console.log(
        chalk.hex(getTheme().accentColor)(
          `\nYou attack and deal ${damage} damage.`
        )
      );
      enemy.hp -= damage;
    } else if (combatAction.includes("Defend")) {
      console.log(
        chalk.hex(getTheme().accentColor)(
          "\nYou brace for the enemy's attack, reducing damage."
        )
      );
      character.isDefending = true;
    } else if (combatAction.includes("Use Ability")) {
      await useAbility(character, enemy);
    } else if (combatAction.includes("Use Item")) {
      // Here, we call the updated inventoryMenu to handle item usage.
      await inventoryMenu(character);
    } else if (combatAction.includes("Run Away")) {
      const [runRoll] = rollDice(20, 1);
      const escapeChance = runRoll + character.abilities.dexterity;
      if (escapeChance > 15) {
        console.log(
          chalk.hex(getTheme().accentColor)(
            "\nYou manage to escape from combat!"
          )
        );
        await pause(1000);
        return { success: false, fled: true };
      } else {
        console.log(chalk.hex(getTheme().accentColor)("\nYou fail to escape!"));
      }
    }

    if (enemy.hp > 0) {
      await enemyTurn(enemy, character);
      if (character.hp <= 0) {
        console.log(
          chalk.hex(getTheme().accentColor)("\n💀 You have been defeated!")
        );
        await pause(1500);
        return { success: false, fled: false };
      }
    }
    await pause(1000);
    round++;
  }

  console.log(
    chalk.hex(getTheme().accentColor)(`\n🎉 You have defeated ${enemy.name}!`)
  );
  await pause(1500);

  // Award XP and process level-up.
  const xpReward = enemy.xpReward;
  character.xp = character.xp + xpReward;
  console.log(
    chalk.hex(getTheme().accentColor)(`Victory! You gained ${xpReward} XP.`)
  );

  const xpThreshold = character.level * 100;
  if (character.xp >= xpThreshold) {
    character.level = character.level + 1;
    character.abilities.maxhp += 5;
    character.abilities.strength += 1;
    character.abilities.mana += 1;
    character.abilities.dexterity += 1;
    character.abilities.charisma += 1;
    character.abilities.luck += 1;
    console.log(
      chalk.magentaBright(
        `\n✨ Level Up! You are now level ${character.level}! Your stats have increased.`
      )
    );
    character.xp = character.xp - xpThreshold;
  }

  // Award an item reward with a 50% chance.
  if (Math.random() < 0.5) {
    const newItem = generateRandomItem(character.level);
    console.log(
      chalk.hex(getTheme().accentColor)(
        `\nYou found a new item: ${newItem.name} (Rarity: ${newItem.rarity}).`
      )
    );
    character.inventory.push(newItem);
  }

  // Save updated character data.
  saveDataToFile("character", character);

  await promptContinue();
  return { success: true, fled: false };
}
