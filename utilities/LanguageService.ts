import LogTypes from "../types/LogTypes.js";
import { getLanguage } from "./CacheService.js";
import { log } from "./LogService.js";

export type ITerm = Record<Language, string>;
export type IColorTerm = Record<Language | "hex", string>;
export type Language = "de" | "en";

/**
 * Takes a term key and returns the term translated and formatted depending on parameters
 * @param key Defines the key of the term
 * @param language Defines the language to translate the term into
 * @param indented Defines whether or not two spaces get added at the front of the returned term, to align normal output with inquirer prompts
 * @returns The term in the given language and format as a string
 *
 * @example
 * key = "pressEnter",
 * language = "de",
 * indented = true,
 * returns "  Drücke [Enter], um ins Menü zu kommen",
 */
export function getTerm(key: string, indented: boolean = false): string {
  const term = terms[key];

  if (!term) {
    log(`Language Service: Term not found: ${key}`, LogTypes.ERROR);
    return "";
  }

  const translation = term[getLanguage()];

  return (indented ? "  " : "") + translation;
}
const terms: Record<string, ITerm> = {
  // #region Welcome Sequence and Menu
  welcome: {
    de: "Willkommen zu DnD-CLI\n\nDas ist doch wohl der beste Name, den Du je gehört hast\nRichtig?\nEgal! Das Abenteuer wartet! Lass uns loslegen!\n\nVon Julian Thäsler und Tom Weise",
    en: "Welcome to DnD-CLI\n\nThat must be the best name you've ever heard\nRight?\nNevermind! Adventures are awaiting us! Let's go!\n\nBy Julian Thaesler and Tom Weise",
  },
  goodbye: {
    de: "Wir werden uns wiedersehen!",
    en: "We shall meet again!",
  },
  pressEnter: {
    de: "Drücke [Enter]",
    en: "Press [Enter]",
  },
  helloNewPlayer: {
    de: "Es sieht aus, als wärst Du zum ersten Mal hier.\nWir haben Dir schon einmal einen Charakter vorbereitet, damit Du gleich loslegen kannst.\nErstelle Dir aber gerne auch einen eigenen.\nGenieß die Show!",
    en: "It looks like it's your first time around here.\nWe've prepared a character for you, so you can get right into the game.\nFeel free to make yourself a custom one though.\nEnjoy the show!",
  },
  // #endregion

  // #region Character Classes
  swordFighter: {
    de: "Schwertkämpfer",
    en: "Sword fighter",
  },
  archer: {
    de: "Bogenschütze",
    en: "Archer",
  },
  mage: {
    de: "Magier",
    en: "Mage",
  },
  thief: {
    de: "Dieb",
    en: "Thief",
  },
  // #endregion

  // #region Character Data
  namePrompt: {
    de: "Wie soll dein Charakter heißen",
    en: "What should your character be named",
  },
  classPrompt: {
    de: "Welche Klasse soll dein Charakter haben",
    en: "Which class should your character be",
  },
  originPrompt: {
    de: "Beschreibe die Herkunft deines Charakters",
    en: "Describe your character's origin",
  },
  originClarification: {
    de: "Bitte präzisiere die Herkunft deines Charakters",
    en: "Please clarify your character's origin",
  },
  characterSuccess: {
    de: "Charakter erfolgreich erstellt",
    en: "Character successfully created",
  },
  noCharacter: {
    de: "Es wurde noch kein Charakter gespeichert",
    en: "There is no character saved yet",
  },

  // Character Stats
  hp: {
    de: "HP",
    en: "HP",
  },
  level: {
    de: "Level",
    en: "Level",
  },
  xp: {
    de: "XP",
    en: "XP",
  },
  strength: {
    de: "Stärke",
    en: "Strength",
  },
  mana: {
    de: "Mana",
    en: "Mana",
  },
  dexterity: {
    de: "Geschicklichkeit",
    en: "Dexterity",
  },
  charisma: {
    de: "Charisma",
    en: "Charisma",
  },
  luck: {
    de: "Glück",
    en: "Luck",
  },
  inventory: {
    de: "Inventar",
    en: "Inventory",
  },
  empty: {
    de: "leer",
    en: "empty",
  },
  lastPlayed: {
    de: "Zuletzt gespielt",
    en: "Last played",
  },
  // #endregion

  // #region Settings
  settings: {
    de: "Einstellungen",
    en: "Settings",
  },
  language: {
    de: "Sprache",
    en: "Language",
  },
  primaryColor: {
    de: "Hauptfarbe",
    en: "Primary color",
  },
  secondaryColor: {
    de: "Nebenfarbe",
    en: "Secondary color",
  },
  en: {
    de: "Englisch",
    en: "English",
  },
  de: {
    de: "Deutsch",
    en: "German",
  },
  chooseLang: {
    de: "Welche Sprache hättest Du gerne?",
    en: "Which language would you like?",
  },
  currentLang: {
    de: "Deine aktuelle Sprache ist",
    en: "Your current language is",
  },
  invalid: {
    de: "Invalide!",
    en: "Invalid!",
  },
  goBack: {
    de: "Zurück",
    en: "Go back",
  },
  // #endregion

  // #region Menu options
  chooseOption: {
    de: "Bitte wähle:",
    en: "Please choose:",
  },
  createCharacter: {
    de: "Erstelle deinen Charakter",
    en: "Create your Character",
  },
  inspectCharacter: {
    de: "Charakterinfo anzeigen",
    en: "Inspect your Character",
  },
  startCampaign: {
    de: "Kampagne starten",
    en: "Start Campaign",
  },
  changeLang: {
    de: "Sprache ändern",
    en: "Change language",
  },
  exit: {
    de: "Beenden",
    en: "Exit",
  },
  // #endregion
};

export function getColorTerm(key: string) {
  const color = colors[key];
  if (!color) {
    log(`Language Service: Color not found: ${key}`, LogTypes.ERROR);
    return "";
  }
  return color[getLanguage()];
}

export function getColorHex(key: string) {
  const color = colors[key];
  if (!color) {
    log(`Language Service: Color not found: ${key}`, LogTypes.ERROR);
    return "";
  }
  return color.hex;
}

export function getAllColors(): Record<string, IColorTerm> {
  return colors;
}

const colors: Record<string, IColorTerm> = {
  red0: { de: "rot 0", en: "red 0", hex: "#FF0000" },
  red1: { de: "rot 1", en: "red 1", hex: "#FF3333" },
  red2: { de: "rot 2", en: "red 2", hex: "#FF6666" },
  red3: { de: "rot 3", en: "red 3", hex: "#FF9999" },
  red4: { de: "rot 4", en: "red 4", hex: "#FFCCCC" },

  blue0: { de: "blau 0", en: "blue 0", hex: "#0000FF" },
  blue1: { de: "blau 1", en: "blue 1", hex: "#3333FF" },
  blue2: { de: "blau 2", en: "blue 2", hex: "#6666FF" },
  blue3: { de: "blau 3", en: "blue 3", hex: "#9999FF" },
  blue4: { de: "blau 4", en: "blue 4", hex: "#CCCCFF" },

  yellow0: { de: "gelb 0", en: "yellow 0", hex: "#FFFF00" },
  yellow1: { de: "gelb 1", en: "yellow 1", hex: "#FFFF33" },
  yellow2: { de: "gelb 2", en: "yellow 2", hex: "#FFFF66" },
  yellow3: { de: "gelb 3", en: "yellow 3", hex: "#FFFF99" },
  yellow4: { de: "gelb 4", en: "yellow 4", hex: "#FFFFCC" },

  green0: { de: "grün 0", en: "green 0", hex: "#00FF00" },
  green1: { de: "grün 1", en: "green 1", hex: "#33FF33" },
  green2: { de: "grün 2", en: "green 2", hex: "#66FF66" },
  green3: { de: "grün 3", en: "green 3", hex: "#99FF99" },
  green4: { de: "grün 4", en: "green 4", hex: "#CCFFCC" },

  grey0: { de: "grau 0", en: "grey 0", hex: "#909090" },
  grey1: { de: "grau 1", en: "grey 1", hex: "#B0B0B0" },
  grey2: { de: "grau 2", en: "grey 2", hex: "#D0D0D0" },
  grey3: { de: "grau 3", en: "grey 3", hex: "#E0E0E0" },
  grey4: { de: "grau 4", en: "grey 4", hex: "#FFFFFF" },
};
