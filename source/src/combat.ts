import { rollDice } from "@utilities/combat/DiceService.js";
import { inventoryMenu } from "@utilities/character/InventoryService.js";
import { generateRandomItem } from "@utilities/character/ItemGenerator.js";
import { addItemToInventory } from "@utilities/character/InventoryService.js";
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
import { getEquippedStatBonuses } from "@utilities/character/EquipmentService.js";
import { getTerm } from "@utilities/LanguageService.js";

export interface CombatResult {
  success: boolean;
  fled: boolean;
  gameOver?: boolean;
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

  console.log(
    accentColor(
      getTerm("enemyUsesMove")
        .replace("{enemy}", enemy.name)
        .replace("{move}", move.name)
    )
  );

  if (move.type === "attack") {
    const [enemyRoll] = rollDice(6, 1);

    let damage = Math.max(
      enemy.attack + enemyRoll - Math.floor(character.abilities.strength / 5),
      1
    );
    damage = Math.floor(damage * (move.multiplier || 1));

    if (character.isDefending) {
      damage = Math.max(Math.floor(damage * 0.5), 1);
      character.isDefending = false;
      console.log(accentColor(getTerm("defensiveStanceReducesDamage")));
    }

    character.hp = Math.max(character.hp - damage, 0);
    console.log(
      accentColor(
        getTerm("enemyMoveDealsDamage")
          .replace("{enemy}", enemy.name)
          .replace("{move}", move.name)
          .replace("{damage}", damage.toString())
      )
    );
    saveDataToFile("character", character);
  } else if (move.type === "defend") {
    enemy.isDefending = true;
    console.log(
      accentColor(
        getTerm("enemyDescription")
          .replace("{enemy}", enemy.name)
          .replace("{description}", move.description)
      )
    );
  } else if (move.type === "scare") {
    const [enemyRoll] = rollDice(20, 1);
    const resistRoll =
      character.abilities.charisma + Math.floor(character.abilities.luck / 2);
    if (enemyRoll > resistRoll) {
      character.losesTurn = true;
      console.log(
        accentColor(
          getTerm("enemyMoveTerrifies")
            .replace("{enemy}", enemy.name)
            .replace("{move}", move.name)
        )
      );
    } else {
      console.log(
        accentColor(
          getTerm("enemyMoveResisted")
            .replace("{enemy}", enemy.name)
            .replace("{move}", move.name)
        )
      );
    }
  } else if (move.type === "heal") {
    const healAmount = move.healAmount || 5;
    enemy.hp = Math.min(enemy.hp + healAmount, enemy.maxhp || 10);
    console.log(
      accentColor(
        getTerm("enemyHeals")
          .replace("{enemy}", enemy.name)
          .replace("{amount}", healAmount.toString())
      )
    );
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
  character.tempStrengthBuff = 0;
  character.tempDexterityBuff = 0;
  character.losesTurn = false;
  character.isDefending = false;

  totalClear();
  console.log(
    accentColor(
      getTerm("enemyAppears")
        .replace("{enemy}", enemy.name)
        .replace("{hp}", enemy.hp.toString())
    )
  );

  let round = 1;
  while (enemy.hp > 0 && character.hp > 0) {
    totalClear();

    if (character.losesTurn) {
      console.log(accentColor(getTerm("tooFrightenedToAct")));
      character.losesTurn = false;
      await pause(1000);
      if (enemy.hp > 0) {
        await enemyTurn(enemy, character);
        if (character.hp <= 0) {
          console.log(accentColor(getTerm("youHaveBeenDefeated")));
          await pause(1500);
          return { success: false, fled: false };
        }
      }
      await pause(1000);
      round++;
      saveDataToFile("character", character);
      continue;
    }

    console.log(accentColor("\n" + getTerm("yourTurn")));
    await pause(800);
    totalClear();
    const combatAction = await combatStatusSelect({
      message: getTerm("chooseCombatOption"),
      choices: [
        { name: getTerm("attack"), value: "Attack" },
        { name: getTerm("defend"), value: "Defend" },
        { name: getTerm("useAbility"), value: "Ability" },
        { name: getTerm("useItem"), value: "Item" },
        { name: getTerm("runAway"), value: "Run" },
      ],
      enemy: enemy,
      canGoBack: true,
    });

    switch (combatAction) {
      case "goBack":
        return { success: false, fled: true };
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
        console.log(accentColor(getTerm("youHaveBeenDefeated")));
        await pause(1500);
        return { success: false, fled: false };
      }
    }
    await pause(1000);
    round++;
  }

  console.log(
    accentColor(getTerm("youDefeatedEnemy").replace("{enemy}", enemy.name))
  );
  await pause(1500);

  const xpReward = enemy.xpReward;
  character.xp = character.xp + xpReward;
  console.log(
    accentColor(getTerm("victoryGainedXp").replace("{xp}", xpReward.toString()))
  );

  if (Math.random() < 0.7) {
    const lootItem = generateRandomItem(character.level);
    const added = addItemToInventory(character, lootItem);

    if (added) {
      console.log(
        accentColor(getTerm("foundItemLoot").replace("{item}", lootItem.name))
      );
      console.log(primaryColor(`   "${lootItem.description}"`));
      if (lootItem.rarity) {
        console.log(primaryColor(`   Rarity: ${lootItem.rarity}`));
      }
    } else {
      console.log(
        accentColor(
          getTerm("foundItemInventoryFull").replace("{item}", lootItem.name)
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
        getTerm("levelUp").replace("{level}", character.level.toString())
      )
    );
    character.xp = character.xp - xpThreshold;
  }

  await pressEnter();
  return { success: true, fled: false };
}

async function doAttack(character: ICharacter, enemy: IEnemy): Promise<void> {
  await playAnimation("attack.json");
  const [attackRoll] = rollDice(20, 1);
  const strengthBonus = getStrengthBonus(character);

  let damage =
    character.abilities.strength + strengthBonus + Math.floor(attackRoll / 5);

  if (enemy.isDefending) {
    damage = Math.floor(damage * 0.5);
    console.log(accentColor(getTerm("enemyDefenseReducesDamage")));
    enemy.isDefending = false;
  }

  enemy.hp = Math.max(enemy.hp - damage, 0);
  console.log(
    accentColor(
      "\n" +
        getTerm("youAttackForDamage", false)
          .replace("{enemy}", enemy.name)
          .replace("{damage}", damage.toString())
          .replace("{roll}", attackRoll.toString())
    )
  );
  await pressEnter();
}

async function doDefend(character: ICharacter): Promise<void> {
  await playAnimation("defend.json");
  console.log(accentColor("\n" + getTerm("braceForAttack")));
  character.isDefending = true;
  saveDataToFile("character", character);
}

async function useAbility(character: ICharacter, enemy: IEnemy): Promise<void> {
  if (!character.abilitiesList || character.abilitiesList.length === 0) {
    console.log(accentColor("\n" + getTerm("noSpecialAbilities")));
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
    message: getTerm("chooseAbility"),
    choices: abilities,
  });

  if (!selectedAbility || selectedAbility === (null as unknown as IAbility))
    return;

  if (
    selectedAbility.manaCost > 0 &&
    character.abilities.mana < selectedAbility.manaCost
  ) {
    console.log(accentColor("\n" + getTerm("notEnoughMana")));
    saveDataToFile("character", character);
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
        getTerm("useAbilityForDamage")
          .replace("{ability}", selectedAbility.name)
          .replace("{enemy}", enemy.name)
          .replace("{damage}", damage.toString())
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
        getTerm("useAbilityForHealing")
          .replace("{ability}", selectedAbility.name)
          .replace("{amount}", healAmount.toString())
      )
    );
  } else if (selectedAbility.type === "buff") {
    const buffAmount = selectedAbility.buffAmount || 0;
    character.tempStrengthBuff = (character.tempStrengthBuff || 0) + buffAmount;
    console.log(
      accentColor(
        getTerm("useAbilityForBuff")
          .replace("{ability}", selectedAbility.name)
          .replace("{amount}", buffAmount.toString())
      )
    );
  }

  await pressEnter();
}

async function useCombatItem(
  character: ICharacter,
  enemy: IEnemy
): Promise<void> {
  await inventoryMenu(character, true);

  saveDataToFile("character", character);
  await pressEnter();
}

async function tryToRunAway(
  character: ICharacter
): Promise<CombatResult | void> {
  console.log(accentColor(getTerm("tryToEscape")));
  await pause(1000);

  const dexterityBonus = getDexterityBonus(character);
  const [escapeRoll] = rollDice(20, 1);

  const escapeChance =
    character.abilities.dexterity +
    dexterityBonus +
    Math.floor(character.abilities.luck / 2);

  if (escapeRoll + escapeChance > 15) {
    console.log(accentColor(getTerm("escapeSuccessful")));
    await pause(1000);
    return { success: false, fled: true };
  } else {
    console.log(accentColor(getTerm("escapeFailed")));
    await pause(1000);
    return;
  }
}
