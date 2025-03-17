import { rollDice } from "@utilities/DiceService.js";
import { inventoryMenu } from "@utilities/InventoryService.js";
import { generateRandomItem } from "@utilities/ItemGenerator.js";
import { addItemToInventory } from "@utilities/InventoryService.js";
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
import { pause } from "@utilities/ConsoleService.js";
import { themedSelect } from "@utilities/MenuService.js";
import { combatStatusSelect } from "@components/CombatStatusSelect.js";
import { getEquippedStatBonuses } from "@utilities/EquipmentService.js";

interface CombatResult {
  success: boolean;
  fled: boolean;
}

function getStrengthBonus(character: ICharacter): number {
  const equipBonuses = getEquippedStatBonuses(character);
  return (character.tempStrengthBuff || 0) + (equipBonuses.strength || 0);
}

function getDexterityBonus(character: ICharacter): number {
  const equipBonuses = getEquippedStatBonuses(character);
  return (character.tempDexterityBuff || 0) + (equipBonuses.dexterity || 0);
}

async function enemyTurn(enemy: IEnemy, character: ICharacter): Promise<void> {
  totalClear();
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

    // Apply damage reduction if character is defending
    if (character.isDefending) {
      damage = Math.floor(damage * 0.5);
      character.isDefending = false; // Reset defending status
      console.log(accentColor("Your defensive stance reduces the damage!"));
    }

    character.hp = Math.max(character.hp - damage, 0);
    console.log(
      accentColor(
        `\n${enemy.name}'s ${move.name} deals ${damage} damage to you!`
      )
    );
  } else if (move.type === "defend") {
    enemy.isDefending = true;
    console.log(accentColor(`\n${enemy.name} ${move.description}`));
  } else if (move.type === "scare") {
    const [enemyRoll] = rollDice(20, 1);
    const resistRoll =
      character.abilities.charisma + Math.floor(character.abilities.luck / 2);
    if (enemyRoll > resistRoll) {
      character.losesTurn = true;
      console.log(
        accentColor(
          `\n${enemy.name}'s ${move.name} terrifies you! You'll lose your next turn.`
        )
      );
    } else {
      console.log(
        accentColor(
          `\n${enemy.name} tries to scare you with ${move.name}, but you resist!`
        )
      );
    }
  } else if (move.type === "heal") {
    const healAmount = move.healAmount || 5;
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
  // Reset temporary combat buffs
  character.tempStrengthBuff = 0;
  character.tempDexterityBuff = 0;
  character.losesTurn = false;
  character.isDefending = false;

  totalClear();
  console.log(
    accentColor(`\n⚔️  A wild ${enemy.name} appears with ${enemy.hp} HP!`)
  );

  let round = 1;
  while (enemy.hp > 0 && character.hp > 0) {
    totalClear();

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

    const combatAction = await combatStatusSelect({
      message: "Choose your combat action:",
      choices: [
        { name: "Attack", value: "Attack" },
        { name: "Defend", value: "Defend" },
        { name: "Use Ability", value: "Ability" },
        { name: "Use Item", value: "Item" },
        { name: "Run Away", value: "Run" },
      ],
      enemy: enemy,
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
        await useCombatItem(character, enemy);
        break;
      case "Run":
        const runResult = await tryToRunAway(character);
        if (runResult && runResult.fled) {
          return runResult;
        }
        break;
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

  // Generate loot using the imported generateRandomItem function
  if (Math.random() < 0.7) {
    const lootItem = generateRandomItem(character.level);
    const added = addItemToInventory(character, lootItem);

    if (added) {
      console.log(accentColor(`\n💰 You found: ${lootItem.name}!`));
      console.log(primaryColor(`   "${lootItem.description}"`));
      if (lootItem.rarity) {
        console.log(primaryColor(`   Rarity: ${lootItem.rarity}`));
      }
    } else {
      console.log(
        accentColor(
          `\n💰 You found ${lootItem.name}, but your inventory is full!`
        )
      );
    }
    saveDataToFile("character", character);
  }

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

  await pressEnter();
  return { success: true, fled: false };
}

/**
 * Do an attack on the enemy.
 */
async function doAttack(character: ICharacter, enemy: IEnemy): Promise<void> {
  await playAnimation("attack.json");
  const [attackRoll] = rollDice(20, 1);
  const strengthBonus = getStrengthBonus(character);

  let damage =
    character.abilities.strength + strengthBonus + Math.floor(attackRoll / 5);

  // Check if enemy is defending
  if (enemy.isDefending) {
    damage = Math.floor(damage * 0.5);
    console.log(accentColor("The enemy's defense reduces your damage!"));
    enemy.isDefending = false;
  }

  enemy.hp = Math.max(enemy.hp - damage, 0);
  console.log(
    accentColor(
      `\nYou attack ${enemy.name} for ${damage} damage! (Attack roll: ${attackRoll})`
    )
  );
  await pressEnter();
}

/**
 * Defend against the enemy's attack.
 * This reduces the damage taken from the next attack.
 */
async function doDefend(character: ICharacter): Promise<void> {
  await playAnimation("defend.json");
  console.log(
    accentColor("\nYou brace for the enemy's attack, reducing damage.")
  );
  character.isDefending = true;
}

/**
 * Use an ability during combat.
 */
async function useAbility(character: ICharacter, enemy: IEnemy): Promise<void> {
  if (!character.abilitiesList || character.abilitiesList.length === 0) {
    console.log(accentColor("\nYou don't have any special abilities yet."));
    await pressEnter();
    return;
  }

  const abilities = character.abilitiesList.map((ability) => {
    return {
      name: `${ability.name} (Mana: ${ability.manaCost}) - ${ability.description}`,
      value: ability,
    };
  });

  const selectedAbility = await themedSelect<IAbility>({
    message: "Choose an ability to use:",
    choices: abilities,
  });

  // Check if the selected ability is actually the cancel option
  if (!selectedAbility || selectedAbility === (null as unknown as IAbility))
    return;

  if (
    selectedAbility.manaCost > 0 &&
    character.abilities.mana < selectedAbility.manaCost
  ) {
    console.log(
      accentColor("\nYou don't have enough mana to use that ability.")
    );
    await pressEnter();
    return;
  }

  character.abilities.mana -= selectedAbility.manaCost;

  if (selectedAbility.type === "attack") {
    const [abilityRoll] = rollDice(20, 1);
    let damage =
      character.abilities.strength +
      Math.floor(abilityRoll / 3) +
      Math.floor(character.abilities.mana / 2);
    damage = Math.floor(damage * (selectedAbility.multiplier || 1));
    enemy.hp = Math.max(enemy.hp - damage, 0);
    console.log(
      accentColor(
        `\nYou use ${selectedAbility.name} on ${enemy.name} for ${damage} damage!`
      )
    );
  } else if (selectedAbility.type === "heal") {
    const healAmount = selectedAbility.healAmount || 0;
    character.hp = Math.min(
      character.hp + healAmount,
      character.abilities.maxhp
    );
    console.log(
      accentColor(
        `\nYou use ${selectedAbility.name} and heal for ${healAmount} HP.`
      )
    );
  } else if (selectedAbility.type === "buff") {
    const buffAmount = selectedAbility.buffAmount || 0;
    character.tempStrengthBuff = (character.tempStrengthBuff || 0) + buffAmount;
    console.log(
      accentColor(
        `\nYou use ${selectedAbility.name} and gain +${buffAmount} strength for this battle.`
      )
    );
  }

  await pressEnter();
}

/**
 * Use items in combat with the imported inventoryMenu function
 */
async function useCombatItem(
  character: ICharacter,
  enemy: IEnemy
): Promise<void> {
  // Use the imported inventoryMenu function instead of custom implementation
  // Pass true to indicate we're in combat (if your inventoryMenu accepts this parameter)
  await inventoryMenu(character, true);

  // Save character data after using the item
  saveDataToFile("character", character);
  await pressEnter();
}

/**
 * Try to run away from combat.
 * This has a chance to succeed based on the character's dexterity.
 */
async function tryToRunAway(
  character: ICharacter
): Promise<CombatResult | void> {
  console.log(accentColor("\nYou try to escape..."));
  await pause(1000);

  const dexterityBonus = getDexterityBonus(character);
  const [escapeRoll] = rollDice(20, 1);

  // Calculate escape chance using dexterity + bonuses
  const escapeChance =
    character.abilities.dexterity +
    dexterityBonus +
    Math.floor(character.abilities.luck / 2);

  if (escapeRoll + escapeChance > 15) {
    console.log(accentColor("\nYou managed to escape!"));
    await pause(1000);
    return { success: false, fled: true };
  } else {
    console.log(accentColor("\nYou failed to escape!"));
    await pause(1000);
    return; // Return undefined since the escape failed and combat continues
  }
}
