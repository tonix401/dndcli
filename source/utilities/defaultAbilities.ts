// defaultAbilities.ts
import type { IAbility } from "@utilities/IAbility.js";

export const defaultAbilities: Record<string, IAbility[]> = {
  swordsman: [
    {
      name: "Power Strike",
      manaCost: 0,
      type: "attack",
      multiplier: 1.2,
      description: "A powerful melee attack that deals extra damage.",
    },
    {
      name: "Battle Cry",
      manaCost: 0,
      type: "buff",
      buffAmount: 2,
      description: "A cry that temporarily boosts your strength.",
    },
  ],
  mage: [
    {
      name: "Fireball",
      manaCost: 3,
      type: "attack",
      multiplier: 1.5,
      description: "Hurls a fiery ball that explodes on impact.",
    },
    {
      name: "Healing Light",
      manaCost: 2,
      type: "heal",
      healAmount: 8,
      description: "Summons a gentle light to restore your health.",
    },
  ],
  thief: [
    {
      name: "Backstab",
      manaCost: 0,
      type: "attack",
      multiplier: 1.8,
      description:
        "A stealthy attack from behind that deals significant damage.",
    },
    {
      name: "Smoke Bomb",
      manaCost: 0,
      type: "buff",
      buffAmount: 3,
      description: "Creates a smokescreen to help you evade attacks.",
    },
  ],
};

export function getDefaultAbilitiesForClass(
  characterClass: string
): IAbility[] {
  return defaultAbilities[characterClass] || [];
}
