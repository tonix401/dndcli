export interface IAbility {
  name: string;
  manaCost: number;
  type: "attack" | "heal" | "buff";
  multiplier?: number; // Applicable for attack abilities to scale damage
  healAmount?: number; // Applicable for healing abilities
  buffAmount?: number; // Applicable for buff abilities (temporary strength boost)
  description: string;
}
