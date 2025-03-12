import { log } from "@utilities/LogService.js";
import { getLanguage } from "./CacheService.js";
import chalk from "chalk";

export type Language = "de" | "en" | "ch";
export type ITerm = Record<Language, string>;
export type IColorTerm = Record<Language | "hex", string>;

const arrowUp = chalk.bold("▲");
const arrowDown = chalk.bold("▼");
const arrowRight = chalk.bold("►");
const arrowLeft = chalk.bold("◄");

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
  // #region Main
  welcome: {
    de: "Von Julian Thäsler und Tom Weise",
    en: "By Julian Thaesler and Tom Weise",
    ch: "Vo Julian Thäsler und Tom Weise",
  },
  goodbye: {
    de: "Wir werden uns wiedersehen!",
    en: "We shall meet again!",
    ch: "Mir gsehnd eus wieder!",
  },
  pressEnter: {
    de: `Drücke [${arrowRight}] oder [Enter]`,
    en: `Press [${arrowRight}] or [Enter]`,
    ch: `Drück [${arrowRight}] oder [Enter]`,
  },
  enlargeWindowPrompt: {
    de: "Oh, dein Fenster ist etwas zu klein. Bitte vergrößere das Fenster auf mindestens 100 x 35 Zeichen. Aktuell: ",
    en: "Oh, your window is a bit too small. Please enlarge the window to at least 100 x 35 characters. Currently: ",
    ch: "Oh, dis Fänschter isch chli z'chlii. Bitte mach s'Fänschter uf mindeschtens 100 x 35 Zeiche grösser. Aktuell: ",
  },
  invalid: {
    de: "Invalide!",
    en: "Invalid!",
    ch: "Ungültig!",
  },
  goBack: {
    de: "Zurück",
    en: "Go back",
    ch: "Zrugg",
  },
  saveAndGoBack: {
    de: "Speichern und zurück",
    en: "Save and go back",
    ch: "Spichere und zrugg",
  },
  // #endregion

  // #region Setup + Tutorial
  enterApiKey: {
    de: "Bitte OPENAI_API_KEY eingeben",
    en: "Please enter your OPENAI_API_KEY",
    ch: "Bitte OPENAI_API_KEY igäh",
  },
  apiKeyRequired: {
    de: "OPENAI_API_KEY ist erforderlich",
    en: "OPENAI_API_KEY is required",
    ch: "OPENAI_API_KEY isch erforderlich",
  },
  wrongFormat: {
    de: "Das scheint nicht das richtige Format zu sein. Bitte versuche es nochmal",
    en: "That doesn't seem to be the right format, please try again",
    ch: "Das schiint nöd s'richtige Format z'sii. Bitte versueche's nomal",
  },
  helloNewPlayer: {
    de:
      "Es sieht aus, als wärst Du zum ersten Mal hier.\n" +
      "Lass mich Dir kurz erklären wir alles funktioniert.",
    en:
      "It looks like it's your first time around here.\n" +
      "Let me explain how everything works.",
    ch:
      "Es gsehd so us, als wärsch du s'erschte Mal da.\n" +
      "La mich dir churz erkläre wie alles funktioniert.",
  },
  tutorial: {
    de: "Tutorial",
    en: "Tutorial",
    ch: "Tutorial",
  },
  tutorialMenu: {
    de:
      "Du wirst einige Menüs sehen, die Du mit den Pfeiltasten navigieren kannst.\n" +
      `Drücke [${arrowUp}] oder [${arrowDown}] um die Auswahl zu ändern,\n` +
      `[${arrowRight}] oder [Enter], um die Auswahl zu bestätigen,\n` +
      `[${arrowLeft}], um zurück zu gehen.`,
    en:
      "You will see some menus that you can navigate with the arrow keys.\n" +
      `Press [${arrowUp}] or [${arrowDown}] to change the selection,\n` +
      `[${arrowRight}] or [Enter] to confirm the selection,\n` +
      `[${arrowLeft}] to go back.`,
    ch:
      "Du wirsch es paar Menüs gseh, wo du mit de Pfiltaschte navigiere chasch.\n" +
      `Drück [${arrowUp}] oder [${arrowDown}] zum d'Uswahl ändere,\n` +
      `[${arrowRight}] oder [Enter] zum d'Uswahl bestätige,\n` +
      `[${arrowLeft}] zum zrugg gah.`,
  },
  tutorialPremise: {
    de:
      "Dieses Spiel ist hauptsächlich ein Open World Role Playing Game.\n" +
      "Du kannst einen Charakter erstellen und mit ihm die Welt erkunden.\n" +
      "Es gibt viel zu entdecken: \n" +
      "Gegner, Schätze, unerforschte Dungeons und vieles mehr wartet auf Dich.",
    en:
      "This game is mainly an Open World Role Playing Game.\n" +
      "You can create a character and explore the world with it.\n" +
      "There is a lot to discover: \n" +
      "Enemies, treasures, unexplored dungeons and much more awaits you.",
    ch:
      "Das Spiel isch hauptsächlich es Open World Role Playing Game.\n" +
      "Du chasch en Charakter erschaffe und mit ihm d'Wält erforsche.\n" +
      "Es git viel z'entdecke: \n" +
      "Gegner, Schätz, unerforschti Dungeons und vieles meh wartet uf dich.",
  },
  tutorialCharacter: {
    de:
      "Lass uns zuerst über Deinen Charakter reden.\n" +
      "Du kannst ihm einen Namen, eine Klasse und eine Herkunft geben.\n" +
      "Du kannst Deinen Charakter und sein Inventar später im Hauptmenü ansehen\n" +
      "Wenn Du es eilig hast kannst Du auch mit dem Standardcharakter anfangen.",
    en:
      "First let's talk about your character.\n" +
      "You can give them a name, a class and also an origin story.\n" +
      "You can inspect your character and their inventory through the main menu\n" +
      "If you're in a hurry, you can also start with our default character.",
    ch:
      "Zerscht redemer über din Charakter.\n" +
      "Du chasch ihm en Name, e Klass und e Herkunft gäh.\n" +
      "Du chasch din Charakter und sis Inventar spöter im Hauptmenü aluege\n" +
      "Wenn's pressiert, chasch au mit em Standardcharakter afange.",
  },
  tutorialSettings: {
    de:
      "In den Einstellungen kannst Du die Sprache und das Farbschema ändern.\n" +
      "Das Farbschema bestimmt das Design des Spiels.\n\n" +
      "Das Entwicklermenü ist auch sehr spanned, aber mit Magie versiegelt.\n" +
      "Es gibt Gerüchte unter den Zwergen in den hohen Bergen.\n" +
      "Es heißt um den Zauber zu lösen muss man 123 eingeben, aber wer weiß?",
    en:
      "In the settings you can change the language and the color scheme.\n" +
      "The color scheme determines the design of the game.\n\n" +
      "The developer menu is also very interesting, but sealed with magic.\n" +
      "There are rumors among the high mountain dwarves.\n" +
      "They say to release the spell you need to enter 123, but who knows?",
    ch:
      "I de Iistellige chasch d'Spraach und s'Farbschema ändere.\n" +
      "S'Farbschema bestimmt s'Design vom Spiel.\n\n" +
      "S'Entwicklermenü isch au sehr spannend, aber mit Magie versieglet.\n" +
      "Es git Grücht under de Zwerge ide hohe Berge.\n" +
      "Es heisst zum de Zauber z'löse muess mer 123 igäh, aber wer weiss?",
  },
  tutorialCampaign: {
    de:
      "Und schließlich kannst Du die Kampagne starten.\n" +
      "Hier kannst Du die Welt erkunden,\n" +
      "Dungeons betreten und gegen Monster kämpfen.\n" +
      "Das ist das Herzstück des Spiels.\n\n" +
      "Das ist alles, was Du wissen musst, um zu starten.\n" +
      "Viel Spaß beim Spielen!",
    en:
      "And finally you can start the campaign.\n" +
      "Here you can explore the world, enter dungeons and fight monsters.\n" +
      "This is the heart of the game.\n\n" +
      "That's all you need to know to get started.\n" +
      "Have fun playing!",
    ch:
      "Und schliesslich chasch d'Kampagne starte.\n" +
      "Da chasch d'Wält erforsche, Dungeons betrete und gege Monster kämpfe.\n" +
      "Das isch s'Herzstück vom Spiel.\n\n" +
      "Das isch alles, was du wüsse muesch zum starte.\n" +
      "Viel Spass bim Spiele!",
  },

  //#endregion

  // #region Character Classes
  swordsman: {
    de: "⚔️ Schwertkämpfer",
    en: "⚔️ Sword fighter",
    ch: "⚔️ Schwärtchämpfer",
  },
  archer: {
    de: "🏹 Bogenschütze",
    en: "🏹 Archer",
    ch: "🏹 Bogeschütz",
  },
  mage: {
    de: "🧙 Magier",
    en: "🧙 Mage",
    ch: "🧙 Zauberer",
  },
  thief: {
    de: "🗡️ Dieb",
    en: "🗡️ Thief",
    ch: "🗡️ Dieb",
  },
  // #endregion

  // #region Character Data
  namePrompt: {
    de: "Wie soll dein Charakter heißen",
    en: "What should your character be named",
    ch: "Wie söll din Charakter heisse",
  },
  classPrompt: {
    de: "Welche Klasse soll dein Charakter haben",
    en: "Which class should your character be",
    ch: "Weli Klass söll din Charakter ha",
  },
  originPrompt: {
    de: "Beschreibe die Herkunft deines Charakters",
    en: "Describe your character's origin",
    ch: "Beschriib d'Herkunft vo dim Charakter",
  },
  originClarification: {
    de: "Bitte präzisiere die Herkunft deines Charakters",
    en: "Please clarify your character's origin",
    ch: "Bitte präzisier d'Herkunft vo dim Charakter",
  },
  characterSuccess: {
    de: "Charakter erfolgreich erstellt",
    en: "Character successfully created",
    ch: "Charakter erfolgrich erstellt",
  },
  noCharacter: {
    de: "Es wurde noch kein Charakter gespeichert",
    en: "There is no character saved yet",
    ch: "Es isch no kei Charakter gspicheret worde",
  },

  // Character Stats
  class: {
    de: "Klasse",
    en: "Class",
    ch: "Klass",
  },
  hp: {
    de: "HP",
    en: "HP",
    ch: "HP",
  },
  maxhp: {
    de: "Max HP",
    en: "Max HP",
    ch: "Max HP",
  },
  level: {
    de: "Level",
    en: "Level",
    ch: "Level",
  },
  xp: {
    de: "XP",
    en: "XP",
    ch: "XP",
  },
  strength: {
    de: "Stärke",
    en: "Strength",
    ch: "Stärchi",
  },
  mana: {
    de: "Mana",
    en: "Mana",
    ch: "Mana",
  },
  dexterity: {
    de: "Geschicklichkeit",
    en: "Dexterity",
    ch: "Gschicklichkeit",
  },
  charisma: {
    de: "Charisma",
    en: "Charisma",
    ch: "Charisma",
  },
  luck: {
    de: "Glück",
    en: "Luck",
    ch: "Glück",
  },
  inventory: {
    de: "Inventar",
    en: "Inventory",
    ch: "Inventar",
  },
  items: {
    de: "Items",
    en: "Items",
    ch: "Items",
  },
  empty: {
    de: "leer",
    en: "empty",
    ch: "leer",
  },
  lastPlayed: {
    de: "Zuletzt gespielt",
    en: "Last played",
    ch: "Zletscht gspielt",
  },
  // #endregion

  // #region Inventory Data
  id: {
    de: "ID",
    en: "ID",
    ch: "ID",
  },
  name: {
    de: "Name",
    en: "Name",
    ch: "Name",
  },
  description: {
    de: "Beschreibung",
    en: "Description",
    ch: "Beschriebig",
  },
  effect: {
    de: "Effekt",
    en: "Effect",
    ch: "Effekt",
  },
  rarity: {
    de: "Seltenheit",
    en: "Rarity",
    ch: "Sälteheit",
  },
  quantity: {
    de: "Anzahl",
    en: "Quantity",
    ch: "Azahl",
  },
  // #endregion

  // #region Settings
  settings: {
    de: "Einstellungen",
    en: "Settings",
    ch: "Iistellige",
  },
  language: {
    de: "Sprache",
    en: "Language",
    ch: "Spraach",
  },
  primaryColor: {
    de: "Hauptfarbe",
    en: "Primary color",
    ch: "Hauptfarb",
  },
  secondaryColor: {
    de: "Nebenfarbe",
    en: "Secondary color",
    ch: "Nebefarb",
  },
  theme: {
    de: "Farbschema",
    en: "Color theme",
    ch: "Farbschema",
  },
  en: {
    de: "Englisch",
    en: "English",
    ch: "Änglisch",
  },
  de: {
    de: "Deutsch",
    en: "German",
    ch: "Düütsch",
  },
  ch: {
    de: "Schweizerdeutsch",
    en: "Swiss German",
    ch: "Schwiizerdüütsch",
  },
  // #endregion

  // #region Menu options
  mainMenu: {
    de: "Hauptmenü",
    en: "Main menu",
    ch: "Hauptmenü",
  },
  createCharacter: {
    de: "Charakter erstellen",
    en: "Create Character",
    ch: "Charakter erstelle",
  },
  inspectCharacter: {
    de: "Charakter anzeigen",
    en: "Inspect Character",
    ch: "Charakter azeige",
  },
  inspectInventory: {
    de: "Inventar anzeigen",
    en: "Inspect Inventory",
    ch: "Inventar azeige",
  },
  startCampaign: {
    de: "Kampagne starten",
    en: "Start Campaign",
    ch: "Kampagne starte",
  },
  exit: {
    de: "Beenden",
    en: "Exit",
    ch: "Beände",
  },
  error: {
    de: "Upps, da ist wohl etwas schief gelaufen 🤔",
    en: "Whoops, seems like something went wrong 🤔",
    ch: "Hoppla, da isch öppis schief gloffe 🤔",
  },
  backToMainMenu: {
    de: "Zurück zum Hauptmenü",
    en: "Back to main menu",
    ch: "Zrugg zum Hauptmenü",
  },
  enterPassword: {
    de: "Bitte Passwort eingeben",
    en: "Please enter the password",
    ch: "Bitte s'Passwort igäh",
  },
  wrongPassword: {
    de: "Falsches Passwort, übrige Versuche: ",
    en: "Wrong password, remaining attempts: ",
    ch: "Falschs Passwort, übrige Versüech: ",
  },
  yes: {
    de: "Ja",
    en: "Yes",
    ch: "Ja",
  },
  no: {
    de: "Nein",
    en: "No",
    ch: "Nei",
  },

  // #endregion

  //#region Dev Menu
  devMenu: {
    de: "Entwicklermenü",
    en: "Developer menu",
    ch: "Entwicklermenü",
  },
  settingsData: {
    de: "Einstellungensdaten",
    en: "Settings data",
    ch: "Iistelligsdaten",
  },
  characterData: {
    de: "Charakterdaten",
    en: "Character data",
    ch: "Charakterdate",
  },
  setPassword: {
    de: "Passwort ändern",
    en: "Change password",
    ch: "Passwort ändere",
  },
  choosePassword: {
    de: "Neues Passwort",
    en: "New password",
    ch: "Neus Passwort",
  },
  confirmPassword: {
    de: "Passwort bestätigen",
    en: "Confirm password",
    ch: "Passwort bestätige",
  },
  tryAgain: {
    de: "Erneut versuchen?",
    en: "Try again?",
    ch: "Nomol versueche?",
  },
  logsMenu: {
    de: "Log Optionen",
    en: "Log options",
    ch: "Log Optione",
  },
  logs: {
    de: "Logs",
    en: "Logs",
    ch: "Logs",
  },
  showLogs: {
    de: "Logs der letzten Stunde",
    en: "Logs of the last hour",
    ch: "Logs vo de letzte Stund",
  },
  clearLogs: {
    de: "Logs löschen",
    en: "Clear logs",
    ch: "Logs lösche",
  },
  logsCleared: {
    de: "Logs gelöscht",
    en: "Logs cleared",
    ch: "Logs glöscht",
  },
  noLogs: {
    de: "Keine Logs vorhanden",
    en: "No logs found",
    ch: "Kei Logs vorhande",
  },
  resetData: {
    de: "Daten zurücksetzen",
    en: "Reset data",
    ch: "Date zruggsetze",
  },
  resetDone: {
    de: "Daten zurückgesetzt",
    en: "Data reset",
    ch: "Date zruggsetzt",
  },
  none: {
    de: "Keine",
    en: "None",
    ch: "Kei",
  },
  checkboxHelp: {
    de: " Drücke [Space], um auszuwählen und [Enter], um fortzufahren",
    en: " Press [Space] to select and [Enter] to continue",
    ch: " Drück [Space] zum uswähle und [Enter] zum witermache",
  },
  areYouSure: {
    de: "Bist Du dir sicher?",
    en: "Are you sure?",
    ch: "Bisch dir sicher?",
  },
  confirmExit: {
    de: "Bist Du dir sicher, dass Du das Spiel beenden willst?",
    en: "Are you sure you want to exit the game?",
    ch: "Bisch dir sicher, dass du s'Spiel beände willsch?",
  },
  cancel: {
    de: "Abbrechen",
    en: "Cancel",
    ch: "Abbreche",
  },
  cursor: {
    de: "Zeiger",
    en: "Cursor",
    ch: "Zeiger",
  },
  prefix: {
    de: "Präfix",
    en: "Prefix",
    ch: "Präfix",
  },
  accentColor: {
    de: "Akzentfarbe",
    en: "Accent color",
    ch: "Akzentfarb",
  },
  backgroundColor: {
    de: "Hintergrundfarbe",
    en: "Background color",
    ch: "Hintergrundfarb",
  },
  errorColor: {
    de: "Fehlerfarbe",
    en: "Error color",
    ch: "Fehlerfarb",
  },
  cacheData: {
    de: "Cache Daten",
    en: "Cache Data",
    ch: "Cache Date",
  },
  dataFromJson: {
    de: "Gespeicherte Daten",
    en: "Saved Data",
    ch: "Gspicherti Date",
  },
  currentlyInDev: {
    de: "🚧 Zurzeit noch in Arbeit 🚧",
    en: "🚧 Currently in developement 🚧",
    ch: "🚧 Momentan no in Arbeit 🚧",
  },
  flip: {
    de: "Flip",
    en: "Flip",
    ch: "Flip",
  },
  // lets hope we don't ever get to see this one :)
  undefined: {
    de: "undefined",
    en: "undefined",
    ch: "undefined",
  },
  //#endregion

  //#region Validation
  characters: {
    de: " Zeichen",
    en: " characters",
    ch: " Zeiche",
  },
  invalidColor: {
    de: "Das ist keine gültige Farbe, denk an das #HexFormat",
    en: "That is not a valid color, remember the #HexFormat",
    ch: "Das isch kei gültigi Farb, denk a s'#HexFormat",
  },
  invalidLanguage: {
    de: "Das ist keine gültige Sprache: 'de' oder 'en'",
    en: "That is not a valid language: 'de' or 'en'",
    ch: "Das isch kei gültigi Spraach: 'de', 'en' oder 'ch'",
  },
  nameRequired: {
    de: "Name ist erforderlich",
    en: "Name is required",
    ch: "Name isch erforderlich",
  },
  tooLong: {
    de: "Das ist zu lang, maximal ",
    en: "That is too long, maximum ",
    ch: "Das isch z'lang, maximal ",
  },
  tooShort: {
    de: "Das ist zu kurz, mindestens ",
    en: "It is too short, minimum ",
    ch: "Das isch z'churz, mindeschtens ",
  },
  cantBeNumber: {
    de: "Das darf keine Zahl sein",
    en: "It can't be a number",
    ch: "Das darf kei Zahl sii",
  },
  mustBeNumber: {
    de: "Es muss eine Zahl sein",
    en: "It must be a number",
    ch: "Es mues e Zahl sii",
  },
  cantBeNegative: {
    de: "Das kann nicht negativ sein",
    en: "That can't be negative",
    ch: "Das cha nöd negativ sii",
  },
  tooHigh: {
    de: "Das ist zu hoch, maximal ",
    en: "That is too high, maximum ",
    ch: "Das isch z'hoch, maximal ",
  },
  mustBeHigherThanCurrentHp: {
    de: "Das muss höher sein als die aktuelle HP",
    en: "That must be higher than the current HP",
    ch: "Das mues höcher sii als d'aktuelli HP",
  },
  //#endregion

  //#region Dungeon
  north: {
    de: "Norden",
    en: "North",
    ch: "Norde",
  },
  south: {
    de: "Süden",
    en: "South",
    ch: "Süde",
  },
  east: {
    de: "Osten",
    en: "East",
    ch: "Oschte",
  },
  west: {
    de: "Westen",
    en: "West",
    ch: "Weschte",
  },
  emptyRoomDiscovered: {
    de: "Du hast einen leeren Raum entdeckt",
    en: "You discovered an empty room",
    ch: "Du hesch en leere Ruum entdeckt",
  },
  inspectRoom: {
    de: "Hier könnten noch versteckte Schätze sein, willst Du Dir den Raum genauer ansehen?",
    en: "There could be hidden treasures here, would you like to inspect the room more closely?",
    ch: "Do chönnte no versteckti Schätz sii, willsch de Ruum gnauer aluege?",
  },
  nothingHere: {
    de: "Scheint als wäre wirklich nichts hier... schade",
    en: "Seems like there is really nothing here... sad",
    ch: "Es schiint als wär würkli nüt do... schad",
  },
  enemyRoomDiscovered: {
    de: "Du hast einen Raum mit einem Gegner entdeckt",
    en: "You discovered a room with an enemy",
    ch: "Du hesch en Ruum mit eme Gegner entdeckt",
  },
  enterToFight: {
    de: "Drücke [Enter], um den Kampf zu beginnen",
    en: "Press [Enter] to start the fight",
    ch: "Drück [Enter] zum de Kampf starte",
  },
  chestRoomDiscovered: {
    de: "Du hast eine Schatzkiste entdeckt",
    en: "You discovered a treasure chest",
    ch: "Du hesch e Schatztruhe entdeckt",
  },
  bossRoomDiscovered: {
    de: "Du hast den BOSS-Raum entdeckt",
    en: "You discovered the BOSS room",
    ch: "Du hesch de BOSS-Ruum entdeckt",
  },
  engageFight: {
    de: "Willst Du kämpfen?",
    en: "Would you like to fight?",
    ch: "Willsch kämpfe?",
  },
  foundItem: {
    de: "Du hast einen Gegenstand gefunden: ",
    en: "You found an item: ",
    ch: "Du hesch en Gegestand gfunde: ",
  },
  // #endregion
};
