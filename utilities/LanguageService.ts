import LogTypes from "../types/LogTypes.js";
import { log } from "./LogService.js";

interface ITranslation {
  de: string;
  en: string;
}

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
export function getTerm(
  key: string,
  language: Language,
  indented: boolean = false
): string {
  const term = terms[key][language];

  if (!term) {
    log(`Term not found: ${key}`, LogTypes.ERROR);
    return "";
  }

  return (indented ? "  " : "") + term;
}
const terms: Record<string, ITranslation> = {
  // #region Welcome Sequence and Menu
  welcome: {
    de: "Willkommen zu DnD-CLI",
    en: "Welcome to DnD-CLI",
  },
  welcomeText: {
    de: "Das ist doch wohl der beste Name, den Du je gehört hast!\nRichtig?\nEgal! Das Abenteuer wartet!\nVon Julian Thäsler und Tom Weise",
    en: "That must be the best name you have ever heard!\nRight?\nNevermind that! Adventure awaits!\nBy Julian Thaesler and Tom Weise",
  },
  goodbye: {
    de: "Wir werden uns wiedersehen!👋",
    en: "We shall meet again!👋",
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

  // #region Character Creation
  namePrompt: {
    de: "Wie soll dein Charakter heißen?",
    en: "What should your character be named?",
  },
  classPrompt: {
    de: "Welche Klasse soll dein Charakter haben?",
    en: "Which class should your character be?",
  },
  characterSuccess: {
    de: "Charakter erfolgreich erstellt",
    en: "Character successfuly created",
  },
  noCharacter: {
    de: "Es wurde noch kein Charakter gespeichert",
    en: "There is no character saved yet",
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
