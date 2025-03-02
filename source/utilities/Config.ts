import chalk from "chalk";
import path from "path";
import { ITheme } from "@utilities/ITheme.js";
import ICharacterData from "@utilities/ICharacterData.js";

// #region Paths
// Base directory (assumes process.cwd() is the project root)
const ROOT_DIR = process.cwd();

// Environment configuration file
const ENV_FILE = path.join(ROOT_DIR, ".env");

// Directory for storing logs, settings, characters, animations etc.
const STORAGE_DIR = path.join(ROOT_DIR, "storage");

// Log file path
const LOG_FILE = path.join(STORAGE_DIR, "log.txt");

// Settings file path
const SETTINGS_FILE = path.join(STORAGE_DIR, "settings.json");

// Character data file path
const CHARACTER_FILE = path.join(STORAGE_DIR, "character.json");

// Animation frames file path (e.g., for attack animations)
const ATTACK_FRAMES_FILE = path.join(STORAGE_DIR, "attackframes.json");
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
const STANDARD_CHARACTER: ICharacterData = {
  name: "Hans",
  class: "swordsman",
  level: 4,
  xp: 21,
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
const STANDARD_CHARACTER_STATS: Record<string, ICharacterData["abilities"]> = {
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
// #endregion

// #region Choices
const CHARACTER_CLASSES = ["swordsman", "mage", "archer", "thief"];
//#endregion

export default {
  ROOT_DIR,
  ENV_FILE,
  STORAGE_DIR,
  LOG_FILE,
  SETTINGS_FILE,
  CHARACTER_FILE,
  ATTACK_FRAMES_FILE,
  SELECT_SEPARATOR,
  STANDARD_THEME,
  STANDARD_CHARACTER,
  CHARACTER_CLASSES,
  STANDARD_CHARACTER_STATS,
};
