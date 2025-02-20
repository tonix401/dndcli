import chalk from "chalk";
import path from "path";

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

export default {
  ROOT_DIR,
  ENV_FILE,
  STORAGE_DIR,
  LOG_FILE,
  SETTINGS_FILE,
  CHARACTER_FILE,
  ATTACK_FRAMES_FILE,
  SELECT_SEPARATOR,
};
