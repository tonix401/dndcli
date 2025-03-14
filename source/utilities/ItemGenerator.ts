/**
 * ItemGenerator.ts
 *
 * This module handles the procedural generation of game items including:
 * - Consumables (potions, elixirs)
 * - Equipment (weapons, armor, accessories)
 *
 * The generation system supports various rarities with associated probabilities,
 * stat bonuses that scale with player level, and effect descriptions.
 */
import { IItem, ItemType, ItemEffect, ItemRarity } from "@utilities/IITem.js";

/**
 * Rarity configuration for item generation
 * - tier: The rarity name
 * - chance: Probability of getting this rarity (values add up to 1.0)
 * - multiplier: Power multiplier for the item's effects based on rarity
 */
const rarities = [
  { tier: "Common", chance: 0.6, multiplier: 1 }, // 60% chance, normal strength
  { tier: "Uncommon", chance: 0.25, multiplier: 1.5 }, // 25% chance, 1.5x strength
  { tier: "Rare", chance: 0.1, multiplier: 2 }, // 10% chance, 2x strength
  { tier: "Epic", chance: 0.04, multiplier: 3 }, // 4% chance, 3x strength
  { tier: "Legendary", chance: 0.01, multiplier: 5 }, // 1% chance, 5x strength
];

/**
 * Equipment types and their associated stat bonuses
 * Each equipment type focuses on boosting specific character attributes
 */
const equipmentTypes = [
  { type: "Weapon", statFocus: ["strength"] },
  { type: "Shield", statFocus: ["maxhp"] },
  { type: "Armor", statFocus: ["maxhp", "dexterity"] },
  { type: "Amulet", statFocus: ["mana", "luck"] },
  { type: "Ring", statFocus: ["charisma", "luck"] },
];

/**
 * Generate a random item (either consumable or equipment)
 *
 * @param level - Player level used to scale item power
 * @returns A complete item object ready to be added to inventory
 */
export function generateRandomItem(level: number): IItem {
  // 70% chance for consumable, 30% chance for equipment
  const isConsumable = Math.random() < 0.7;

  if (isConsumable) {
    return generateConsumableItem(level);
  } else {
    return generateEquipmentItem(level);
  }
}

/**
 * Generate a random consumable item (potion, elixir, etc.)
 *
 * @param level - Player level used to scale item power
 * @returns A consumable item with appropriate effect
 */
function generateConsumableItem(level: number): IItem {
  // Select rarity using weighted probability
  let rand = Math.random();
  let cumulativeChance = 0;
  let selectedRarity = "Common";
  let multiplier = 1;
  for (const rarity of rarities) {
    cumulativeChance += rarity.chance;
    if (rand < cumulativeChance) {
      selectedRarity = rarity.tier;
      multiplier = rarity.multiplier;
      break;
    }
  }

  // Available consumable item templates
  const consumableEffects = [
    {
      effect: "restoreHP",
      name: "Healing Potion",
      description: "Restores health",
    },
    {
      effect: "restoreMana",
      name: "Mana Potion",
      description: "Restores mana",
    },
    {
      effect: "boostStrength",
      name: "Strength Elixir",
      description: "Temporarily increases strength",
    },
    {
      effect: "boostDexterity",
      name: "Agility Potion",
      description: "Temporarily increases dexterity",
    },
    {
      effect: "removeCurse",
      name: "Holy Water",
      description: "Removes negative effects",
    },
    {
      effect: "revive",
      name: "Revival Herb",
      description: "Can bring someone back from unconsciousness",
    },
  ];

  // Select a random effect from available templates
  const selectedEffect =
    consumableEffects[Math.floor(Math.random() * consumableEffects.length)];

  // Calculate effect potency based on level and rarity
  const effectStrength = Math.floor(level * multiplier) + 2;

  // Quality adjectives for different rarities to enhance item names
  const rarityAdjectives: { [key: string]: string[] } = {
    Common: ["Basic", "Simple", "Crude"],
    Uncommon: ["Quality", "Fine", "Decent"],
    Rare: ["Superior", "Excellent", "Refined"],
    Epic: ["Exceptional", "Masterwork", "Potent"],
    Legendary: ["Mythical", "Legendary", "Divine"],
  };

  // Select an appropriate adjective based on rarity
  const adjectives =
    rarityAdjectives[selectedRarity] || rarityAdjectives["Common"];
  const rarityAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];

  const itemName = `${rarityAdjective} ${selectedEffect.name}`;

  // Generate detailed description based on effect type and strength
  let description;
  switch (selectedEffect.effect) {
    case "restoreHP":
      description = `Restores ${effectStrength * 5} health when consumed.`;
      break;
    case "restoreMana":
      description = `Restores ${effectStrength * 3} mana when consumed.`;
      break;
    case "boostStrength":
      description = `Increases strength by ${effectStrength} for the duration of combat.`;
      break;
    case "boostDexterity":
      description = `Increases dexterity by ${effectStrength} for the duration of combat.`;
      break;
    case "removeCurse":
      description = `Removes negative status effects.`;
      break;
    case "revive":
      description = `Brings an ally back with ${effectStrength * 10}% health.`;
      break;
    default:
      description = selectedEffect.description;
  }

  // Generate unique item ID (timestamp + random number)
  const id =
    Date.now().toString() + Math.floor(Math.random() * 1000).toString();

  // Calculate gold value based on rarity and level
  const baseValue =
    5 * rarities.findIndex((r) => r.tier === selectedRarity) + 5;
  const value = Math.floor(baseValue * multiplier * (level / 2 + 1));

  // Higher rarity items tend to appear in smaller quantities
  const quantity = Math.max(1, Math.floor(5 / multiplier));

  // Assemble the final consumable item object
  const item: IItem = {
    id,
    name: itemName,
    description,
    effect: selectedEffect.effect as ItemEffect,
    rarity: selectedRarity as ItemRarity,
    quantity,
    consumable: true,
    type: "consumable" as ItemType,
    value,
    requiredLevel: Math.max(1, level - 2), // Can use items slightly below your level
  };

  return item;
}

/**
 * Generate a random equipment item (weapon, armor, accessory)
 *
 * @param level - Player level used to scale item power
 * @returns An equipment item with appropriate stats
 */
function generateEquipmentItem(level: number): IItem {
  // Select rarity using weighted probability (same as consumable items)
  let rand = Math.random();
  let cumulativeChance = 0;
  let selectedRarity = "Common";
  let multiplier = 1;
  for (const rarity of rarities) {
    cumulativeChance += rarity.chance;
    if (rand < cumulativeChance) {
      selectedRarity = rarity.tier;
      multiplier = rarity.multiplier;
      break;
    }
  }

  // Select random equipment type (weapon, armor, etc.)
  const equipType =
    equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];

  // Generate item name components
  const prefixes = [
    "Sturdy",
    "Gleaming",
    "Ancient",
    "Enchanted",
    "Runic",
    "Masterwork",
    "Crude",
    "Ornate",
    "Blessed",
  ];
  const weaponTypes = [
    "Sword",
    "Axe",
    "Mace",
    "Spear",
    "Dagger",
    "Staff",
    "Wand",
    "Bow",
  ];
  const armorTypes = ["Plate", "Chain Mail", "Leather Armor", "Robes", "Cloak"];
  const accessoryTypes = [
    "Pendant",
    "Ring",
    "Amulet",
    "Totem",
    "Charm",
    "Circlet",
  ];

  let itemName = "";
  let baseTypes: string[] = [];
  // Determine item type and appropriate base types
  let itemType: ItemType;

  switch (equipType.type) {
    case "Weapon":
      baseTypes = weaponTypes;
      itemType = "weapon";
      break;
    case "Shield":
      baseTypes = ["Shield", "Buckler", "Tower Shield", "Kite Shield"];
      itemType = "armor"; // Shields are considered armor for game mechanics
      break;
    case "Armor":
      baseTypes = armorTypes;
      itemType = "armor";
      break;
    case "Amulet":
    case "Ring":
      baseTypes = accessoryTypes;
      itemType = "armor"; // Accessories are considered armor for game mechanics
      break;
    default:
      baseTypes = ["Item"];
      itemType = "armor"; // Default fallback
  }

  // Construct item name from random components
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const baseType = baseTypes[Math.floor(Math.random() * baseTypes.length)];
  itemName = `${prefix} ${baseType}`;

  // Generate stat bonuses based on item type, rarity and player level
  const statBonus = Math.floor(level * multiplier * 0.5) + 1;
  const stats: { [key: string]: number } = {};

  // Add primary stats based on equipment type's focus
  for (const stat of equipType.statFocus) {
    stats[stat] = statBonus;
  }

  // 30% chance to add a bonus random stat
  if (Math.random() < 0.3) {
    const allStats = [
      "strength",
      "dexterity",
      "charisma",
      "luck",
      "maxhp",
      "mana",
    ];
    const bonusStat = allStats[Math.floor(Math.random() * allStats.length)];
    if (!stats[bonusStat]) {
      stats[bonusStat] = Math.floor(statBonus * 0.5); // Bonus stat is weaker
    }
  }

  // Create stat description for item tooltip
  let statDesc = Object.entries(stats)
    .map(
      ([stat, value]) =>
        `+${value} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`
    )
    .join(", ");

  const description = `${itemName} of ${selectedRarity} quality. ${statDesc}.`;

  // Generate unique item ID
  const id =
    Date.now().toString() + Math.floor(Math.random() * 1000).toString();

  // Calculate gold value (equipment is worth more than consumables)
  const baseValue =
    15 * rarities.findIndex((r) => r.tier === selectedRarity) + 10;
  const value = Math.floor(baseValue * multiplier * (level / 2 + 1));

  // Add damage for weapons or defense for armor
  let damage, defense;
  if (itemType === "weapon") {
    damage = Math.floor(level * multiplier * 0.7) + 2;
  } else if (itemType === "armor") {
    defense = Math.floor(level * multiplier * 0.5) + 1;
  }

  // Assemble the final equipment item object
  const item: IItem = {
    id,
    name: itemName,
    description,
    effect: "", // Equipment doesn't have active effects
    rarity: selectedRarity as ItemRarity,
    quantity: 1,
    consumable: false,
    type: itemType,
    value,
    requiredLevel: Math.max(1, level - 1),
    stats,
    damage,
    defense,
    // Add equipment slot based on type
    slot: itemType === "weapon" ? "weapon" : "armor",
  };

  return item;
}
