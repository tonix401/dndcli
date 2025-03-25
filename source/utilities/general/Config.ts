import chalk from "chalk";
import path from "path";
import crypto from "crypto";
import { ITheme } from "@utilities/ITheme.js";
import ICharacter from "@utilities/ICharacter.js";
import { Language } from "@core/LanguageService.js";
import { IAbility } from "@utilities/IAbility.js";
import { LogTypes } from "@core/LogService.js";
import { EnemyMove } from "@utilities/IEnemy.js";
import { IGameStateData } from "@utilities/IGameState.js";

// #region Paths
// Base directory (assumes process.cwd() is the project root)
const ROOT_DIR = process.cwd();

// Environment configuration file
const ENV_FILE = path.join(ROOT_DIR, ".env");

// Directory for storing logs, settings, characters, animations etc.
const STORAGE_DIR = path.join(ROOT_DIR, "storage");

// Directory of main source files
const SOURCE_DIR = path.join(ROOT_DIR, "source");

// Directory for storing resources like images, sounds, etc.
const RESOURCES_DIR = path.join(SOURCE_DIR, "resources");

// Log file path
const LOG_FILE = path.join(STORAGE_DIR, "log.txt");

// Settings file path
const SETTINGS_FILE = path.join(STORAGE_DIR, "settings.json");

// Character data file path
const CHARACTER_FILE = path.join(STORAGE_DIR, "character.json");

// Character data file path
const CONTEXT_FILE = path.join(STORAGE_DIR, "context.json");

// Game state file path
const GAME_STATE_FILE = path.join(STORAGE_DIR, "gamestate.json");

// Dungeon data file path
const DUNGEON_FILE = path.join(STORAGE_DIR, "dungeon.json");

// Animation frames file path (e.g., for attack animations)
const ATTACK_FRAMES_FILE = path.join(
  RESOURCES_DIR,
  "animations/attackframes.json"
);
// #endregion

// #region Strings
// Separator for select options
const SELECT_SEPARATOR = chalk.dim(" ──────────");
// #endregion

// #region Standard Settings
const LOG_LEVELS: LogTypes[] = ["Info ", "Warn ", "Error"];

const STANDARD_THEME: ITheme = {
  name: { de: "Standard", en: "Standard" },
  prefix: " ",
  primaryColor: "#00a4ff",
  secondaryColor: "#F0FFFF",
  cursor: "👉",
  accentColor: "#FFAA00",
  backgroundColor: "#222222",
  errorColor: "#FF5555",
};
const STANDARD_LANGUAGE: Language = "de";
const STANDARD_PASSWORD: string = crypto
  .createHash("sha256")
  .update("123")
  .digest("hex");
// #endregion

// #region Character
/**
 * List of available character classes
 */
const CHARACTER_CLASSES = ["swordsman", "mage", "archer", "thief"];

/**
 * The default character data
 */
const START_CHARACTER: ICharacter = {
  name: "Hans",
  class: "swordsman",
  level: 1,
  xp: 0,
  hp: 10,
  origin: "unknown",
  currency: 0,
  abilities: {
    maxhp: 10,
    strength: 0,
    mana: 0,
    dexterity: 0,
    charisma: 10,
    luck: 7,
  },
  inventory: [
    {
      id: "default-sword",
      name: "Basic Sword",
      description: "A rusty sword that still cuts.",
      effect: "",
      rarity: "Common",
      quantity: 1,
      consumable: false,
      type: "weapon",
      damage: 5,
      stats: {
        strength: 1,
      },
    },
    {
      id: "default-potion",
      name: "Healing Potion",
      description: "Restores 10 HP.",
      effect: "restoreHP",
      rarity: "Common",
      quantity: 2,
      consumable: true,
    },
  ],
  equippedItems: [], // Adding empty equipped items array
  lastPlayed: new Date().toLocaleDateString("de-DE"),
};
/**
 * The default character stats by class
 */
const START_CHARACTER_STATS: Record<string, ICharacter["abilities"]> = {
  swordsman: {
    maxhp: 20,
    strength: 5,
    mana: 2,
    dexterity: 3,
    charisma: 2,
    luck: 3,
  },
  mage: {
    maxhp: 12,
    strength: 2,
    mana: 8,
    dexterity: 3,
    charisma: 3,
    luck: 4,
  },
  archer: {
    maxhp: 5,
    strength: 4,
    mana: 3,
    dexterity: 10,
    charisma: 4,
    luck: 5,
  },
  thief: {
    maxhp: 15,
    strength: 3,
    mana: 3,
    dexterity: 7,
    charisma: 9,
    luck: 8,
  },
};
/**
 * The default character abilities by class
 */
const START_CHARACTER_ABILITIES: Record<string, IAbility[]> = {
  default: [
    {
      name: "Punch",
      manaCost: 0,
      type: "attack",
      multiplier: 1.2,
      description: "A basic punch that deals damage to the enemy.",
    },
  ],
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
// #endregion

// #region AI-Prompts
const ORIGIN_STORIES = [""];
// #endregion

// #region Enemies
const easyEnemies = [
  "Goblin Scout",
  "Kobold",
  "Giant Rat",
  "Skeleton",
  "Sprite",
  "Giant Ant",
  "Feral Cat",
  "Bandit",
  "Swarm of Bats",
  "Slime",
  "Shadow Imp",
  "Zombie Dog",
  "Bog Lurker",
  "Cave Spider",
  "Mischievous Pixie",
  "Mud Crab",
  "Rogue Squire",
  "Giant Beetle",
  "Vermin Swarm",
  "Dust Mephit",
  "Wild Boar",
  "Angry Peasant",
  "Scrawny Thief",
  "Haunted Doll",
  "Possessed Toy",
  "Rabid Raccoon",
  "Cursed Frog",
  "Lost Soul",
  "Undead Servant",
  "Maggot Swarm",
  "Fungal Crawler",
  "Goblin Pyromaniac",
  "Crazed Cultist",
  "Angry Drunkard",
  "Tavern Brawler",
  "Swamp Leech",
  "Will-o'-the-Wisp",
];

const mediumEnemies = [
  "Orc Warrior",
  "Zombie",
  "Wolf",
  "Ghoul",
  "Hobgoblin",
  "Bugbear",
  "Imp",
  "Gnoll",
  "Warg",
  "Lizardman",
  "Dark Elf Rogue",
  "Gargoyle",
  "Skeletal Archer",
  "Vampire Thrall",
  "Plague Bearer",
  "Werebat",
  "Drowned Spirit",
  "Forest Warden",
  "Stone Golem",
  "Cursed Knight",
  "Flesh Golem",
  "Demonic Hound",
  "Venomous Serpent",
  "Ghostly Assassin",
  "Trollkin",
  "Ghast",
  "Revenant",
  "Cursed Monk",
  "Fire Salamander",
  "Brutal Enforcer",
  "Chaos Cultist",
  "Fungal Horror",
  "Lich Acolyte",
  "Drider Spawn",
  "Frost Revenant",
  "Wraithling",
  "Ooze Horror",
];

const hardEnemies = [
  "Troll",
  "Werewolf",
  "Wraith",
  "Ogre",
  "Wyvern",
  "Minotaur",
  "Manticore",
  "Vampire Spawn",
  "Lich",
  "Dread Knight",
  "Fire Elemental",
  "Frost Giant",
  "Void Specter",
  "Dark Paladin",
  "Blackfang Assassin",
  "Chimera",
  "Shadow Reaper",
  "Infernal Behemoth",
  "Necromancer",
  "Cursed Samurai",
  "Stone Titan",
  "Swamp Hydra",
  "Elder Basilisk",
  "Corrupt Archmage",
  "Stormborn Harbinger",
  "Hellhound Alpha",
  "Warlord of the Wastes",
  "Demon Berserker",
  "Frost Wraith",
  "Blood Golem",
  "Bone Colossus",
  "Ancient Wight",
  "Feral Drider",
  "Cave Behemoth",
  "Chaos Knight",
  "Gorgon",
];

const bossEnemies = [
  "Dragon",
  "Giant",
  "Lich King",
  "Vampire Lord",
  "Beholder",
  "Mind Flayer",
  "Demon Prince",
  "Kraken",
  "Tarrasque",
  "Grand Demon",
  "Archlich",
  "Void Dragon",
  "Titan of Destruction",
  "Eldritch Horror",
  "Leviathan",
  "The Shadow Tyrant",
  "Blood Emperor",
  "Dread Wyrm",
  "The Nightmare King",
  "Abyssal Colossus",
  "Demon Overlord",
  "God of War",
  "Chaos Dragon",
  "The Fallen God",
  "Lord of the Void",
  "Ancient Cosmic Horror",
  "The Corrupt Celestial",
  "The Death Bringer",
  "Primordial Devourer",
  "The Unchained Titan",
  "Abyssal Warlord",
  "The Eternal Lich",
  "Riftborn Leviathan",
  "The Ever-Hungering Maw",
  "The Doom Herald",
  "The Forgotten One",
];

const ENEMY_NAMES_ARRAY = [
  easyEnemies,
  mediumEnemies,
  hardEnemies,
  bossEnemies,
];

const healingMoves: EnemyMove[] = [
  {
    name: "Healing Ritual",
    type: "heal",
    healAmount: 10,
    description: "Calls on dark forces to heal itself.",
  },
  {
    name: "Dark Regeneration",
    type: "heal",
    healAmount: 15,
    description: "Regenerates health using dark magic.",
  },
  {
    name: "Life Drain",
    type: "heal",
    healAmount: 8,
    description: "Absorbs nearby life essence to restore vitality.",
  },
  {
    name: "Natural Remedy",
    type: "heal",
    healAmount: 12,
    description: "Quickly consumes herbs from the surroundings for healing.",
  },
  {
    name: "Moonlight Bath",
    type: "heal",
    healAmount: 14,
    description: "Bathes in mystical moonlight that repairs wounds.",
  },
  {
    name: "Blood Feast",
    type: "heal",
    healAmount: 11,
    description: "Consumes a vial of crimson liquid for rapid healing.",
  },
  {
    name: "Elemental Mending",
    type: "heal",
    healAmount: 16,
    description: "Channels elemental energy to close wounds and restore flesh.",
  },
  {
    name: "Shadow Weaving",
    type: "heal",
    healAmount: 9,
    description: "Weaves shadows into physical form to patch injuries.",
  },
];

const defendMoves: EnemyMove[] = [
  {
    name: "Shield Wall",
    type: "defend",
    description: "Raises a barrier to absorb incoming damage.",
  },
  {
    name: "Fortify",
    type: "defend",
    description: "Temporarily increases defense against attacks.",
  },
  {
    name: "Evasive Maneuver",
    type: "defend",
    description: "Dodges the next attack, reducing damage taken.",
  },
  {
    name: "Iron Skin",
    type: "defend",
    description: "Hardens skin to reduce damage from physical attacks.",
  },
  {
    name: "Mystic Barrier",
    type: "defend",
    description: "Creates a magical shield that absorbs damage.",
  },
  {
    name: "Defensive Stance",
    type: "defend",
    description: "Adopts a stance that increases defense for a short time.",
  },
  {
    name: "Guardian's Shield",
    type: "defend",
    description: "Summons a protective spirit to absorb damage.",
  },
  {
    name: "Stone Form",
    type: "defend",
    description: "Transforms into stone to reduce damage taken.",
  },
  {
    name: "Shadow Cloak",
    type: "defend",
    description: "Wraps the body in shadows to become harder to hit.",
  },
  {
    name: "Arcane Ward",
    type: "defend",
    description: "Projects a magical field that nullifies incoming spells.",
  },
  {
    name: "Spectral Shift",
    type: "defend",
    description: "Briefly phases out of physical reality to avoid harm.",
  },
  {
    name: "Protective Scales",
    type: "defend",
    description: "Grows hardened scales that deflect attacks.",
  },
];

const attackMoves: EnemyMove[] = [
  {
    name: "Savage Strike",
    type: "attack",
    multiplier: 1.2,
    description: "A powerful blow that causes significant damage.",
  },
  {
    name: "Venomous Bite",
    type: "attack",
    multiplier: 0.9,
    description: "Bites with poisoned fangs that cause lingering pain.",
  },
  {
    name: "Flame Breath",
    type: "attack",
    multiplier: 1.25,
    description: "Exhales a cone of searing flames.",
  },
  {
    name: "Shadow Bolt",
    type: "attack",
    multiplier: 1.1,
    description: "Fires a bolt of dark energy that seeks its target.",
  },
  {
    name: "Crushing Blow",
    type: "attack",
    multiplier: 1.25,
    description: "Smashes down with incredible force.",
  },
  {
    name: "Soul Drain",
    type: "attack",
    multiplier: 0.8,
    description: "Attempts to extract life force from the victim.",
  },
  {
    name: "Ice Spike",
    type: "attack",
    multiplier: 1.15,
    description: "Launches a jagged spike of ice that impales the target.",
  },
  {
    name: "Thunder Clap",
    type: "attack",
    multiplier: 1.0,
    description:
      "Creates a deafening sound wave that causes concussive damage.",
  },
  {
    name: "Arcane Blast",
    type: "attack",
    multiplier: 1.05,
    description:
      "Releases a burst of magical energy that disrupts the target's senses.",
  },
  {
    name: "Whirling Blades",
    type: "attack",
    multiplier: 1.2,
    description:
      "Spins rapidly with blades extended, slashing everything nearby.",
  },
  {
    name: "Acid Spray",
    type: "attack",
    multiplier: 0.7,
    description: "Ejects corrosive fluid that burns through armor and flesh.",
  },
  {
    name: "Bone Shatter",
    type: "attack",
    multiplier: 1.15,
    description:
      "A precise strike aimed at breaking bones and crippling the target.",
  },
  {
    name: "Necrotic Touch",
    type: "attack",
    multiplier: 0.85,
    description: "A touch that causes flesh to wither and decay on contact.",
  },
  {
    name: "Mind Spike",
    type: "attack",
    multiplier: 0.95,
    description:
      "Sends a painful psychic lance directly into the target's thoughts.",
  },
  {
    name: "Void Tentacles",
    type: "attack",
    multiplier: 1.1,
    description:
      "Summons dark appendages from another dimension to entangle and crush.",
  },
  {
    name: "Feral Charge",
    type: "attack",
    multiplier: 1.0,
    description:
      "Rushes forward with incredible speed to slam into the target.",
  },
];

const scareMoves: EnemyMove[] = [
  {
    name: "Intimidating Howl",
    type: "scare",
    description: "Attempts to frighten you, making you lose your next turn.",
  },
  {
    name: "Terrifying Roar",
    type: "scare",
    description: "Unleashes a bone-chilling roar that instills fear.",
  },
  {
    name: "Shadowy Apparition",
    type: "scare",
    description: "Summons a ghostly figure that terrifies the target.",
  },
  {
    name: "Mind Fracture",
    type: "scare",
    description: "Creates a psychic disturbance that causes panic.",
  },
  {
    name: "Creeping Dread",
    type: "scare",
    description: "Instills a deep sense of dread that paralyzes the target.",
  },
  {
    name: "Nightmare Visions",
    type: "scare",
    description: "Projects horrifying images into the target's mind.",
  },
];

const ENEMY_MOVES_ARRAY: EnemyMove[] = [
  ...attackMoves,
  ...defendMoves,
  ...healingMoves,
  ...scareMoves,
];
// #endregion

// #region Game State
/**
 * Default structure for game state
 */
const DEFAULT_GAME_STATE: IGameStateData = {
  theme: null,
  narrativeHistory: [],
  conversationHistory: [],
  choices: [],
  plotStage: 1,
  plotSummary: "",
  currentChapter: {
    title: "Chapter 1: The Beginning",
    summary: "Your adventure begins",
    arc: "introduction",
    completedObjectives: [],
    pendingObjectives: [],
    characters: [],
    locations: [],
    metadata: {},
  },
  chapters: [],
  characters: {},
  characterTraits: [],
  themes: [],
  maxHistoryItems: 50,
  storyPace: "FAST",
};
/**
 * Story pace settings
 */
const STORY_PACE = {
  FAST: {
    name: "Fast",
    narrativeLength: "short",
    detailLevel: "low",
    eventFrequency: "high",
  },
  MEDIUM: {
    name: "Medium",
    narrativeLength: "moderate",
    detailLevel: "moderate",
    eventFrequency: "moderate",
  },
  SLOW: {
    name: "Slow",
    narrativeLength: "long",
    detailLevel: "high",
    eventFrequency: "low",
  },
};
// #endregion

// #region Game Service
/**
 * Story pace options control the speed of narrative progression
 */
const STORY_PACE_OPTIONS = {
  FAST: {
    name: "Fast",
    multiplier: 0.5,
    description: "Rapid story progression with fewer exchanges required",
  },
  MEDIUM: {
    // Changed from NORMAL to MEDIUM
    name: "Medium",
    multiplier: 1.0,
    description: "Standard pacing with balanced narrative development",
  },
  SLOW: {
    // Changed from DETAILED to SLOW
    name: "Detailed",
    multiplier: 1.5,
    description: "Extended pacing with more thorough story development",
  },
};

/**
 * Schema for narrative generation function configuration
 */
const NARRATIVE_GENERATION_SCHEMA = {
  functions: [
    {
      name: "generateNarrative",
      description: "Generate the next narrative scene in the adventure",
      parameters: {
        type: "object",
        properties: {
          narrative: {
            type: "string",
            description:
              "The main narrative content describing the scene, events, and characters",
          },
          choices: {
            type: "array",
            description:
              "Exactly 3 choices the player can make, in format: 'Action description'",
            items: {
              type: "string",
            },
            minItems: 3,
            maxItems: 3,
          },
          specialEvent: {
            type: "object",
            description: "Optional special event details",
            properties: {
              type: {
                type: "string",
                enum: ["combat", "dungeon", "dice_roll", "none"],
                description: "Type of special event in this narrative",
              },
              details: {
                type: "string",
                description: "Additional details about the special event",
              },
            },
          },
        },
        required: ["narrative", "choices"],
      },
    },
  ],
  function_call: { name: "generateNarrative" },
};
// #endregion

// #region Objective Service
/**
 * Configuration for objective management in the game
 */
const OBJECTIVE_CONFIG = {
  // Maximum number of pending objectives allowed before pruning
  MAX_PENDING_OBJECTIVES: 7,

  // Narrative threshold before pruning can occur
  PRUNE_NARRATIVE_THRESHOLD: 15,

  // Minimum objectives to have before considering pruning
  MIN_OBJECTIVES_FOR_PRUNING: 5,

  // What percentage of objectives to keep when pruning (adjusted by pace)
  OBJECTIVE_RETENTION_RATE: 0.7,
};

/**
 * Base requirements for story progression by arc
 */
const ARC_REQUIREMENTS = {
  introduction: {
    minNarrative: 5,
    minObjectives: 1,
  },
  "rising-action": {
    minNarrative: 10,
    minObjectives: 2,
  },
  climax: {
    minNarrative: 15,
    minObjectives: 3,
  },
  "falling-action": {
    minNarrative: 20,
    minObjectives: 4,
  },
  resolution: {
    minNarrative: 25,
    minObjectives: 5,
  },
};

/**
 * Function schemas for AI objective extraction and management
 */
const OBJECTIVE_FUNCTION_SCHEMAS = {
  initialObjectives: {
    functions: [
      {
        name: "createInitialObjectives",
        description: "Create initial objectives based on the narrative",
        parameters: {
          type: "object",
          properties: {
            objectives: {
              type: "array",
              description: "List of 2-3 clear objectives for the player",
              items: {
                type: "string",
              },
            },
          },
          required: ["objectives"],
        },
      },
    ],
    function_call: { name: "createInitialObjectives" },
  },

  updateObjectives: {
    functions: [
      {
        name: "updateObjectives",
        description: "Update objectives based on the narrative",
        parameters: {
          type: "object",
          properties: {
            newObjectives: {
              type: "array",
              description: "New objectives introduced in this narrative",
              items: {
                type: "string",
              },
            },
            completedObjectives: {
              type: "array",
              description: "Objectives that were completed in this narrative",
              items: {
                type: "string",
              },
            },
          },
          required: ["newObjectives", "completedObjectives"],
        },
      },
    ],
    function_call: { name: "updateObjectives" },
  },

  checkCompletion: {
    functions: [
      {
        name: "checkObjectiveCompletion",
        description:
          "Check which objectives are completed by the player's choice",
        parameters: {
          type: "object",
          properties: {
            completedIndices: {
              type: "array",
              description: "Indices of completed objectives (zero-based)",
              items: {
                type: "integer",
              },
            },
          },
          required: ["completedIndices"],
        },
      },
    ],
    function_call: { name: "checkObjectiveCompletion" },
  },
};
// #endregion

export default {
  // Paths
  ROOT_DIR,
  STORAGE_DIR,
  ENV_FILE,
  LOG_FILE,
  SETTINGS_FILE,
  CHARACTER_FILE,
  CONTEXT_FILE,
  GAME_STATE_FILE,
  ATTACK_FRAMES_FILE,
  SOURCE_DIR,
  RESOURCES_DIR,
  DUNGEON_FILE,

  // Strings
  SELECT_SEPARATOR,

  // Standard Settings
  LOG_LEVELS,
  STANDARD_THEME,
  STANDARD_LANGUAGE,
  STANDARD_PASSWORD,

  // Character
  START_CHARACTER,
  START_CHARACTER_STATS,
  START_CHARACTER_ABILITIES,

  // Enemies
  ENEMY_NAMES_ARRAY,
  ENEMY_MOVES_ARRAY,

  // Choices
  CHARACTER_CLASSES,

  // AI-Prompts
  ORIGIN_STORIES,

  // Game State
  DEFAULT_GAME_STATE,
  STORY_PACE,

  // Game Service
  STORY_PACE_OPTIONS,
  NARRATIVE_GENERATION_SCHEMA,

  // Objective Service
  OBJECTIVE_CONFIG,
  ARC_REQUIREMENTS,
  OBJECTIVE_FUNCTION_SCHEMAS,
};

// Export types directly to be used elsewhere
export type StoryPaceKey = keyof typeof STORY_PACE;
export type StoryPaceOptionsKey = keyof typeof STORY_PACE_OPTIONS;
export type ArcType = keyof typeof ARC_REQUIREMENTS;
