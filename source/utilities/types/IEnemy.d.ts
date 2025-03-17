export type EnemyMoveType = "attack" | "defend" | "scare" | "heal";

export interface EnemyMove {
  name: string;
  type: EnemyMoveType;
  multiplier?: number;
  healAmount?: number;
  description: string;
}

export interface IEnemy {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  xpReward: number;
  maxhp: number;
  moves?: EnemyMove[];
  isDefending?: boolean;
}
