import { rollDice } from "@utilities/DiceService.js";
import { inventoryMenu } from "@utilities/InventoryService.js";
import { generateRandomItem } from "@utilities/ItemGenerator.js";
import ICharacter from "@utilities/ICharacter.js";
import { IEnemy } from "@utilities/IEnemy.js";
import { IAbility } from "@utilities/IAbility.js";
import {
  accentColor,
  playAnimation,
  pressEnter,
  primaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { saveDataToFile } from "@utilities/StorageService.js";
import { getCombatStatusBar } from "@resources/generalScreens/combatStatusBar.js";
import { pause } from "@utilities/ConsoleService.js";
import { themedSelect } from "@utilities/MenuService.js";

interface CombatResult {
  success: boolean;
  fled: boolean;
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

async function enemyTurn(enemy: IEnemy, character: ICharacter): Promise<void> {
  totalClear();
  console.log(getCombatStatusBar(character, enemy));
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

  console.log(accentColor(`${enemy.name} uses ${move.name}...`));

  if (move.type === "attack") {
    const [enemyRoll] = rollDice(6, 1);
    let damage = Math.max(
      enemy.attack + enemyRoll - character.abilities.strength,
      1
    );
    damage = Math.floor(damage * (move.multiplier || 1));
    character.hp = Math.max(character.hp - damage, 0);
    console.log(
      accentColor(
        `\n${enemy.name}'s ${move.name} deals ${damage} damage to you!`
      )
    );
  } else if (move.type === "defend") {
    enemy.isDefending = true;
    console.log(
      accentColor(
        `\n${enemy.name} is defending, reducing incoming damage this turn!`
      )
    );
  } else if (move.type === "scare") {
    const scareChance = Math.random();
    if (scareChance > 0.7) {
      console.log(
        accentColor(
          `\n${enemy.name}'s taunt terrifies you! You lose your next turn!`
        )
      );
      character.losesTurn = true;
    } else {
      console.log(
        accentColor(
          `\n${enemy.name} tries to scare you, but you remain unfazed!`
        )
      );
    }
  } else if (move.type === "heal") {
    const healAmount = move.healAmount || 10;
    enemy.hp = Math.min(enemy.hp + healAmount, enemy.maxhp || 10);
    console.log(accentColor(`\n${enemy.name} heals for ${healAmount} HP!`));
  }
  await pressEnter();
}

export async function runCombat(
  character: ICharacter,
  enemy: {
    name: string;
    hp: number;
    attack: number;
    defense: number;
    xpReward: number;
    maxhp: number;
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

  totalClear();
  console.log(
    accentColor(`\n⚔️  A wild ${enemy.name} appears with ${enemy.hp} HP!`)
  );

  let round = 1;
  while (enemy.hp > 0 && character.hp > 0) {
    totalClear();
    console.log(getCombatStatusBar(character, enemy, round));

    if (character.losesTurn) {
      console.log(accentColor("\nYou are too frightened to act this turn!"));
      character.losesTurn = false;
      await pause(1000);
      if (enemy.hp > 0) {
        await enemyTurn(enemy, character);
        if (character.hp <= 0) {
          console.log(accentColor("\n💀 You have been defeated!"));
          await pause(1500);
          return { success: false, fled: false };
        }
      }
      await pause(1000);
      round++;
      continue;
    }

    console.log(accentColor("\nYour turn!"));
    await pause(800);

    const combatAction = await themedSelect({
      message: "Choose your combat action:",
      choices: [
        { name: "⚔️  Attack", value: "Attack" },
        { name: "🛡️  Defend", value: "Defend" },
        { name: "🌀 Use Ability", value: "Ability" },
        { name: "🎒  Use Item", value: "Item" },
        { name: "🏃  Run Away", value: "Run" },
      ],
    });

    switch (combatAction) {
      case "Attack":
        await doAttack(character, enemy);
        break;
      case "Defend":
        await doDefend(character);
        break;
      case "Ability":
        await useAbility(character, enemy);
        break;
      case "Item":
        await inventoryMenu(character);
        break;
      case "Run":
        await tryToRunAway(character);
    }

    if (enemy.hp > 0) {
      await enemyTurn(enemy, character);
      if (character.hp <= 0) {
        console.log(accentColor("\n💀 You have been defeated!"));
        await pause(1500);
        return { success: false, fled: false };
      }
    }
    await pause(1000);
    round++;
  }

  console.log(accentColor(`\n🎉 You have defeated ${enemy.name}!`));
  await pause(1500);

  // Award XP and process level-up.
  const xpReward = enemy.xpReward;
  character.xp = character.xp + xpReward;
  console.log(accentColor(`Victory! You gained ${xpReward} XP.`));

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
      accentColor(
        `\n✨ Level Up! You are now level ${character.level}! Your stats have increased.`
      )
    );
    character.xp = character.xp - xpThreshold;
  }

  // Award an item reward with a 50% chance.
  if (Math.random() < 0.5) {
    const newItem = generateRandomItem(character.level);
    console.log(
      accentColor(
        `\nYou found a new item: ${newItem.name} (Rarity: ${newItem.rarity}).`
      )
    );
    character.inventory.push(newItem);
  }

  // Save updated character data.
  saveDataToFile("character", character);

  await pressEnter();
  return { success: true, fled: false };
}

async function doAttack(character: ICharacter, enemy: IEnemy): Promise<void> {
  await playAnimation("attack.json");
  const [playerRoll] = rollDice(4, 1);
  const critMultiplier = playerRoll === 4 ? 2 : 1;
  const strengthBonus = getStrengthBonus(character);
  const tempBuff = character.tempStrengthBuff || 0;
  character.tempStrengthBuff = 0;
  const baseDamage =
    character.abilities.strength + playerRoll + strengthBonus + tempBuff;
  const damage = Math.floor(baseDamage * critMultiplier);
  console.log(accentColor(`\nYou attack and deal ${damage} damage.`));
  enemy.hp -= damage;
}

async function doDefend(character: ICharacter): Promise<void> {
  await playAnimation("defend.json");
  console.log(
    accentColor("\nYou brace for the enemy's attack, reducing damage.")
  );
  character.isDefending = true;
}

async function useAbility(character: ICharacter, enemy: IEnemy): Promise<void> {
  if (!character.abilitiesList || character.abilitiesList.length === 0) {
    console.log(primaryColor("You have no abilities available!"));
    await pressEnter();
    return;
  }
  const choices = character.abilitiesList.map(
    (ability: IAbility, index: number) => ({
      name: `${ability.name} (Cost: ${ability.manaCost} mana) - ${ability.description}`,
      value: index,
    })
  );
  const abilityIndexOrGoBack: string = (
    await themedSelect({
      canGoBack: true,
      message: "Choose an ability to use:",
      choices: choices,
    })
  ).toString();

  if (abilityIndexOrGoBack === "goBack") {
    return;
  }

  const chosenAbility: IAbility = character.abilitiesList[Number(abilityIndexOrGoBack)];
  if (character.abilities.mana < chosenAbility.manaCost) {
    console.log(accentColor("Not enough mana!"));
    await pressEnter();
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
      accentColor(`\nYou use ${chosenAbility.name} and deal ${damage} damage.`)
    );
    enemy.hp -= damage;
  } else if (chosenAbility.type === "heal") {
    const healAmount = chosenAbility.healAmount || 0;
    character.hp = Math.min(
      character.hp + healAmount,
      character.abilities.maxhp
    );
    console.log(
      accentColor(
        `\nYou use ${chosenAbility.name} and restore ${healAmount} HP.`
      )
    );
  } else if (chosenAbility.type === "buff") {
    const buff = chosenAbility.buffAmount || 0;
    console.log(
      accentColor(
        `\nYou use ${chosenAbility.name} and gain a temporary +${buff} strength boost for your next attack.`
      )
    );
    character.tempStrengthBuff = buff;
  }
  await pause(1000);
}

async function tryToRunAway(character: ICharacter) {
  await playAnimation("running.json");
  const [runRoll] = rollDice(20, 1);
  const escapeChance = runRoll + character.abilities.dexterity;
  if (escapeChance > 15) {
    console.log(accentColor("\nYou manage to escape from combat!"));
    await pressEnter();
    return { success: false, fled: true };
  } else {
    console.log(accentColor("\nYou fail to escape!"));
  }
}
