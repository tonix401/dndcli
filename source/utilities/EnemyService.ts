import { EnemyMove, EnemyMoveType, IEnemy } from "@utilities/IEnemy.js";
import Config from "./Config.js";

/**
 * Generates a random enemy scaled to the player's level
 */
export function getRandomEnemyByPlayerLevel(playerLevel: number): IEnemy {
  // Determine difficulty based on player level
  let difficultyIndex = 0; // Easy by default

  if (playerLevel >= 15) {
    difficultyIndex = 3; // Boss enemies
  } else if (playerLevel >= 10) {
    difficultyIndex = 2; // Hard enemies
  } else if (playerLevel >= 5) {
    difficultyIndex = 1; // Medium enemies
  }

  // Get the appropriate enemy list
  const enemyList = Config.ENEMY_NAMES_ARRAY[difficultyIndex];

  // Select a random enemy name
  const enemyType = enemyList[Math.floor(Math.random() * enemyList.length)];

  // Determine stats based on player level
  const baseHp = 10 + playerLevel * 2;
  const variableHp = Math.floor(Math.random() * (playerLevel * 3));

  return {
    name: enemyType,
    hp: baseHp + variableHp,
    maxhp: baseHp + variableHp,
    attack: Math.max(
      1,
      Math.floor(playerLevel * 0.8) + Math.floor(Math.random() * 3)
    ),
    defense: Math.max(
      1,
      Math.floor(playerLevel * 0.5) + Math.floor(Math.random() * 2)
    ),
    xpReward: 5 + playerLevel * 3 + Math.floor(Math.random() * playerLevel * 2),
    moves: generateEnemyMoves(enemyType.toLowerCase()),
    isDefending: false,
  };
}

/**
 * Generates a random enemy scaled by difficulty parameter
 */
export function getRandomEnemy(difficulty: number): IEnemy {
  const maxhp =
    difficulty > 10 ? Math.floor(difficulty * getRandomNumber(0.75, 1.25)) : 10;
  const hp = getRandomNumber(maxhp * 0.5, maxhp);
  const name = getEnemyName(difficulty);

  const enemy: IEnemy = {
    hp: hp,
    maxhp: maxhp,
    name: name,
    attack: Math.floor(difficulty * getRandomNumber(0.75, 1.25)),
    defense: Math.floor(difficulty * getRandomNumber(0.75, 1.25)),
    xpReward: Math.floor(difficulty * getRandomNumber(0.75, 1.25) * 10),
    moves: getEnemyMoves(),
    isDefending: false,
  };

  return enemy;
}

/**
 * Selects an enemy name based on difficulty level
 */
function getEnemyName(difficulty: number): string {
  const enemies = Config.ENEMY_NAMES_ARRAY;

  const randomizedDifficulty = Math.floor(
    (difficulty * getRandomNumber(0.95, 1.05)) / 25
  );

  if (randomizedDifficulty < 0) {
    return "Small Slime";
  }
  if (randomizedDifficulty > 3) {
    return "Ancient Dragon";
  }

  return getRandomItemFromArray(enemies[randomizedDifficulty]);
}

/**
 * Generates a set of 4 random enemy moves from Config
 */
function getEnemyMoves(): IEnemy["moves"] {
  let moves: EnemyMove[] = [];
  for (let i = 0; i < 4; i++) {
    moves.push(getRandomItemFromArray(Config.ENEMY_MOVES_ARRAY));
  }
  return moves;
}

/**
 * Generate enemy moves based on enemy type
 */
function generateEnemyMoves(enemyType: string): EnemyMove[] {
  const basicAttack: EnemyMove = {
    name: "Attack",
    type: "attack",
    multiplier: 1.2,
    description: "A standard attack",
  };

  // Custom move sets for specific enemy types
  const moves: Record<string, EnemyMove[]> = {
    // Keep your existing custom enemy moves
    goblin: [
      basicAttack,
      {
        name: "Sneak Attack",
        type: "attack",
        multiplier: 1.5,
        description: "A sneaky strike that deals more damage",
      },
    ],
    orc: [
      basicAttack,
      {
        name: "Rage",
        type: "attack",
        multiplier: 1.7,
        description: "A powerful rage-fueled attack",
      },
    ],
  };

  // If we don't have custom moves for this enemy type
  if (!moves[enemyType]) {
    // Create a set of random moves from the Config arrays
    const attackMove = Config.ENEMY_MOVES_ARRAY.filter(
      (move) => move.type === "attack"
    );
    const randomAttack =
      attackMove[Math.floor(Math.random() * attackMove.length)];

    // 30% chance to get a special ability
    if (Math.random() < 0.3) {
      const specialMoves = [
        ...Config.ENEMY_MOVES_ARRAY.filter(
          (move) =>
            move.type === "heal" ||
            move.type === "defend" ||
            move.type === "scare"
        ),
      ];
      const randomSpecial =
        specialMoves[Math.floor(Math.random() * specialMoves.length)];
      return [basicAttack, randomAttack, randomSpecial];
    }

    return [basicAttack, randomAttack];
  }

  return moves[enemyType];
}

/**
 * Gets a random item from an array
 */
function getRandomItemFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gets a random number between min and max
 */
function getRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
