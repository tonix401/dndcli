import { LogTypes, log } from "./LogService.js";
import { getLanguage } from "./CacheService.js";

export type ITerm = Record<Language, string>;
export type IColorTerm = Record<Language | "hex", string>;
export type Language = "de" | "en";

/**
 * Takes a term key and returns the term translated and formatted depending on parameters
 * @param key Defines the key of the term
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
  invalid: {
    de: "Invalide!",
    en: "Invalid!",
  },
  goBack: {
    de: "Zurück",
    en: "Go back",
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
  items: {
    de: "Items",
    en: "Items",
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
  theme: {
    de: "Farbschema",
    en: "Color theme",
  },
  en: {
    de: "Englisch",
    en: "English",
  },
  de: {
    de: "Deutsch",
    en: "German",
  },
  // #endregion

  // #region Menu options
  mainMenu: {
    de: "Hauptmenü",
    en: "Main menu",
  },
  createCharacter: {
    de: "Charakter erstellen",
    en: "Create Character",
  },
  inspectCharacter: {
    de: "Charakter anzeigen",
    en: "Inspect Character",
  },
  inspectInventory: {
    de: "Inventar anzeigen",
    en: "Inspect Inventory",
  },
  startCampaign: {
    de: "Kampagne starten",
    en: "Start Campaign",
  },
  exit: {
    de: "Beenden",
    en: "Exit",
  },
  error: {
    de: "Upps, da ist wohl etwas schief gelaufen 🤔",
    en: "Whoops, seems like something went wrong 🤔",
  },
  enterPassword: {
    de: "Bitte Passwort eingeben",
    en: "PLease enter the password",
  },
  wrongPassword: {
    de: "Falsches Passwort, übrige Versuche: ",
    en: "Wrong password, remaining attempts: "
  },
  // #endregion

  //#region
  devMenu: {
    de: "Entwicklermenü",
    en: "Developer menu",
  },
  showSettingsData: {
    de: "Einstellungensdaten",
    en: "Settings data",
  },
  showCharacterData: {
    de: "Charakterdaten",
    en: "Character data",
  },
  saveData: {
    de: "Cache-Daten speichern",
    en: "Commit cached data",
  },
  cursor: {
    de: "Zeiger",
    en: "Cursor",
  },
  prefix: {
    de: "Präfix",
    en: "Prefix",
  },
  cacheData: {
    de: "Cache Daten",
    en: "Cache Data",
  },
  dataFromJson: {
    de: "Gespeicherte Daten",
    en: "Saved Data",
  },
  currentlyInDev: {
    de: "🚧 Zurzeit noch in Arbeit 🚧",
    en: "🚧 Currently in developement 🚧",
  },
  flip: {
    de: "Flip",
    en: "Flip",
  },
  // lets hope we don't ever get to see this one :)
  undefined: {
    de: "undefined",
    en: "undefined",
  },
  //#endregion
};
