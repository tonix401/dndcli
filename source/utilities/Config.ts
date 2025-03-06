import chalk from "chalk";
import path from "path";
import crypto from "crypto";
import { ITheme } from "@utilities/ITheme.js";
import ICharacter from "@utilities/ICharacter.js";
import { Language } from "@utilities/LanguageService.js";
import { IAbility } from "@utilities/IAbility.js";

// #region Paths
// Base directory (assumes process.cwd() is the project root)
const ROOT_DIR = process.cwd();

// Environment configuration file
const ENV_FILE = path.join(ROOT_DIR, ".env");

// Directory for storing logs, settings, characters, animations etc.
const STORAGE_DIR = path.join(ROOT_DIR, "storage");

const RESOURCES_DIR = path.join(ROOT_DIR, "resources");

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

// Animation frames file path (e.g., for attack animations)
const ATTACK_FRAMES_FILE = path.join(RESOURCES_DIR, "animations/attackframes.json");
// #endregion

// #region Strings
// Separator for select options
const SELECT_SEPARATOR = chalk.dim(" ──────────");
// #endregion

// #region Standard Settings
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
  hp: 3,
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
  inventory: [],
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

  // Strings
  SELECT_SEPARATOR,

  // Standard Settings
  STANDARD_THEME,
  STANDARD_LANGUAGE,
  STANDARD_PASSWORD,

  // Character
  START_CHARACTER,
  START_CHARACTER_STATS,
  START_CHARACTER_ABILITIES,

  // Choices
  CHARACTER_CLASSES,

  // AI-Prompts
  ORIGIN_STORIES,
};
