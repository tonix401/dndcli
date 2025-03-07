import { LogTypes, log } from "@utilities/LogService.js";
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
 * indented = true,
 * returns "  Drücke [Enter], um ins Menü zu kommen",
 */
export function getTerm(key: string, indented: boolean = false): string {
  const term = terms[key];
  if (!term) {
    log(`Language Service: Term not found: ${key}`, "Error");
    return "NO TERM";
  }

  const translation = term[getLanguage()];

  return (indented ? "  " : "") + translation;
}

const terms: Record<string, ITerm> = {
  // #region Welcome Sequence and Menu
  welcome: {
    de: "Von Julian Thäsler und Tom Weise",
    en: "By Julian Thaesler and Tom Weise",
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
  enlargeWindowPrompt: {
    de: "Oh, dein Fenster ist etwas zu klein. Bitte vergrößere das Fenster auf mindestens 100 x 35 Zeichen. Aktuell: ",
    en: "Oh, your window is a bit too small. Please enlarge the window to at least 100 x 35 characters. Currently: ",
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
  swordsman: {
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
  class: {
    de: "Klasse",
    en: "Class",
  },
  hp: {
    de: "HP",
    en: "HP",
  },
  maxhp: {
    de: "Max HP",
    en: "Max HP",
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

  // #region Inventory Data
  id: {
    de: "ID",
    en: "ID",
  },
  name: {
    de: "Name",
    en: "Name",
  },
  description: {
    de: "Beschreibung",
    en: "Description",
  },
  effect: {
    de: "Effekt",
    en: "Effect",
  },
  rarity: {
    de: "Seltenheit",
    en: "Rarity",
  },
  quantity: {
    de: "Anzahl",
    en: "Quantity",
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
  backToMainMenu: {
    de: "Zurück zum Hauptmenü",
    en: "Back to main menu",
  },
  enterPassword: {
    de: "Bitte Passwort eingeben",
    en: "Please enter the password",
  },
  wrongPassword: {
    de: "Falsches Passwort, übrige Versuche: ",
    en: "Wrong password, remaining attempts: ",
  },
  yes: {
    de: "Ja",
    en: "Yes",
  },
  no: {
    de: "Nein",
    en: "No",
  },

  // #endregion

  //#region Dev Menu
  devMenu: {
    de: "Entwicklermenü",
    en: "Developer menu",
  },
  settingsData: {
    de: "Einstellungensdaten",
    en: "Settings data",
  },
  characterData: {
    de: "Charakterdaten",
    en: "Character data",
  },
  setPassword: {
    de: "Passwort ändern",
    en: "Change password",
  },
  choosePassword: {
    de: "Neues Passwort",
    en: "New password",
  },
  confirmPassword: {
    de: "Passwort bestätigen",
    en: "Confirm password",
  },
  tryAgain: {
    de: "Erneut versuchen?",
    en: "Try again?",
  },
  logsMenu: {
    de: "Log Optionen",
    en: "Log options",
  },
  logs: {
    de: "Logs",
    en: "Logs",
  },
  showLogs: {
    de: "Logs der letzten Stunde",
    en: "Logs of the last hour",
  },
  clearLogs: {
    de: "Logs löschen",
    en: "Clear logs",
  },
  logsCleared: {
    de: "Logs gelöscht",
    en: "Logs cleared",
  },
  noLogs: {
    de: "Keine Logs vorhanden",
    en: "No logs found",
  },
  resetData: {
    de: "Daten zurücksetzen",
    en: "Reset data",
  },
  resetDone: {
    de: "Daten zurückgesetzt",
    en: "Data reset",
  },
  none: {
    de: "Keine",
    en: "None",
  },
  checkboxHelp: {
    de: " Drücke [Space], um auszuwählen und [Enter], um fortzufahren",
    en: " Press [Space] to select and [Enter] to continue",
  },
  areYouSure: {
    de: "Bist Du dir sicher?",
    en: "Are you sure?",
  },
  cancel: {
    de: "Abbrechen",
    en: "Cancel",
  },
  cursor: {
    de: "Zeiger",
    en: "Cursor",
  },
  prefix: {
    de: "Präfix",
    en: "Prefix",
  },
  accentColor: {
    de: "Akzentfarbe",
    en: "Accent color",
  },
  backgroundColor: {
    de: "Hintergrundfarbe",
    en: "Background color",
  },
  errorColor: {
    de: "Fehlerfarbe",
    en: "Error color",
  },
  invalidColor: {
    de: "Das ist keine gültige Farbe, denk an das #HexFormat",
    en: "That is not a valid color, remember the #HexFormat",
  },
  invalidLanguage: {
    de: "Das ist keine gültige Sprache: 'de' oder 'en'",
    en: "That is not a valid language: 'de' or 'en'",
  },
  tooLong: {
    de: "Das ist zu lang: maximal ",
    en: "That is too long: maximum ",
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
  // #endregion

  // #region Setup
  enterApiKey: {
    de: "Bitte OPENAI_API_KEY eingeben",
    en: "Please enter your OPENAI_API_KEY",
  },
  wrongFormat: {
    de: "Das scheint nicht das richtige Format zu sein. Bitte versuche es nochmal",
    en: "That doesn't seem to be the right format, please try again",
  },
  //#endregion

  //#region Dungeon
  north: {
    de: "Norden",
    en: "North",
  },
  south: {
    de: "Süden",
    en: "South",
  },
  east: {
    de: "Osten",
    en: "East",
  },
  west: {
    de: "Westen",
    en: "West",
  },
  emptyRoomDiscovered: {
    de: "Du hast einen leeren Raum entdeckt",
    en: "You discovered an empty room",
  },
  inspectRoom: {
    de: "Hier könnten noch versteckte Schätze sein, willst Du Dir den Raum genauer ansehen?",
    en: "There could be hidden treasures here, would you like to inspect the room more closely?",
  },
  nothingHere: {
    de: "Scheint als wäre wirklich nichts hier... schade",
    en: "Seems like there is really nothing here... sad",
  },
  enemyRoomDiscovered: {
    de: "Du hast einen Raum mit Gegnern entdeckt",
    en: "You discovered a room with enemies",
  },
  enterToFight: {
    de: "Drücke [Enter], um den Kampf zu beginnen",
    en: "Press [Enter] to start the fight",
  },
  chestRoomDiscovered: {
    de: "Du hast eine Schatzkiste entdeckt",
    en: "You discovered a treasure chest",
  },
  bossRoomDiscovered: {
    de: "Du hast den BOSS-Raum entdeckt",
    en: "You discovered the BOSS room",
  },
  engageFight: {
    de: "Willst Du kämpfen?",
    en: "Would you like to fight?",
  },
  // #endregion
};
