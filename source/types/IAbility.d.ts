export interface IAbility {
  name: string;
  manaCost: number;
  type: "attack" | "heal" | "buff";
  /**
   * Applicable for attack abilities to scale damage
   */
  multiplier?: number;
  /**
   * Applicable for healing abilities
   */
  healAmount?: number;
  /**
   * Applicable for buff abilities to increase character stats
   */
  buffAmount?: number;
  description: string;
}
