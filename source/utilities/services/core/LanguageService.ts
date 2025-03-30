import { log } from "@utilities/LogService.js";
import { getLanguage } from "@utilities/CacheService.js";
import chalk from "chalk";

export type Language = "de" | "en" | "ch";
export type ITerm = Record<Language, string>;
export type TermKey = keyof typeof terms;

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
export function getTerm(key: TermKey, indented: boolean = false): string {
  const term = terms[key];
  if (!term) {
    log(`Language Service: Term not found: ${key}`, "Error");
    return "NO TERM";
  }

  const translation = term[getLanguage()];

  return (indented ? "  " : "") + translation;
}

const terms = {
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
  checkTheLogs: {
    de: "Überprüfe die Logs für weitere Informationen",
    en: "Check the logs for more information",
    ch: "Überprüef d'Logs für meh Informatione",
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
    de: "Schwertkämpfer",
    en: "Sword fighter",
    ch: "Schwärtchämpfer",
  },
  archer: {
    de: "Bogenschütze",
    en: "Archer",
    ch: "Bogeschütz",
  },
  mage: {
    de: "Magier",
    en: "Mage",
    ch: "Zauberer",
  },
  thief: {
    de: "Dieb",
    en: "Thief",
    ch: "Dieb",
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
  // Item types
  type: {
    de: "Typ",
    en: "Type",
    ch: "Typ",
  },
  unknown: {
    de: "Unbekannt",
    en: "Unknown",
    ch: "Unbekannt",
  },
  equipped: {
    de: "Ausgerüstet",
    en: "Equipped",
    ch: "Usgrustet",
  },
  consumable: {
    de: "Verbrauchbar",
    en: "Consumable",
    ch: "Verbruchbar",
  },
  weapon: {
    de: "Waffe",
    en: "Weapon",
    ch: "Waffe",
  },
  armor: {
    de: "Rüstung",
    en: "Armor",
    ch: "Rüschtig",
  },

  // Equipment actions
  equip: {
    de: "Ausrüsten",
    en: "Equip",
    ch: "Usrüschte",
  },
  unequip: {
    de: "Ablegen",
    en: "Unequip",
    ch: "Ablege",
  },
  use: {
    de: "Benutzen",
    en: "Use",
    ch: "Benutze",
  },
  slot: {
    de: "Slot",
    en: "Slot",
    ch: "Slot",
  },

  // Inventory messages
  inventoryTitle: {
    de: "=== Inventar ===",
    en: "=== Inventory ===",
    ch: "=== Inventar ===",
  },
  equippedTitle: {
    de: "=== Ausgerüstet ===",
    en: "=== Equipped ===",
    ch: "=== Usgrüstet ===",
  },
  inventoryFull: {
    de: "Dein Inventar ist voll",
    en: "Your inventory is full",
    ch: "Dis Inventar isch voll",
  },
  inventoryEmpty: {
    de: "Dein Inventar ist leer",
    en: "Your Inventory is empty",
    ch: "Dis Inventar isch leer",
  },
  itemAdded: {
    de: "Gegenstand hinzugefügt",
    en: "Item added",
    ch: "Gegestand hinzuegfüegt",
  },
  itemEquipped: {
    de: "Gegenstand ausgerüstet",
    en: "Item equipped",
    ch: "Gegestand usgrüschtet",
  },
  itemUnequipped: {
    de: "Gegenstand abgelegt",
    en: "Item unequipped",
    ch: "Gegestand abgleit",
  },
  itemUsed: {
    de: "Gegenstand benutzt",
    en: "Item used",
    ch: "Gegestand brucht",
  },
  noEffect: {
    de: "Keine Wirkung",
    en: "No effect",
    ch: "Kei Wirkig",
  },
  requiredLevel: {
    de: "Benötigtes Level",
    en: "Required Level",
    ch: "Benötigts Level",
  },
  damage: {
    de: "Schaden",
    en: "Damage",
    ch: "Schade",
  },
  defense: {
    de: "Verteidigung",
    en: "Defense",
    ch: "Verteidigung",
  },
  equipment: {
    de: "Ausrüstung",
    en: "Equipment",
    ch: "Usrüstig",
  },
  statBonuses: {
    de: "Statusboni",
    en: "Stat bonuses",
    ch: "Statusboni",
  },
  usage: {
    de: "Verwendung",
    en: "Usage",
    ch: "Verwendig",
  },
  gold: {
    de: "Gold",
    en: "Gold",
    ch: "Gold",
  },
  value: {
    de: "Wert",
    en: "Value",
    ch: "Wert",
  },
  page: {
    de: "Seite",
    en: "Page",
    ch: "Siite",
  },
  previousPage: {
    de: "Vorherige",
    en: "Previous",
    ch: "Vorig",
  },
  nextPage: {
    de: "Nächste",
    en: "Next",
    ch: "Nächscht",
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
  saveStateData: {
    de: "Spielstanddaten",
    en: "Save state data",
    ch: "Spilstanddate",
  },
  testing: {
    de: "Tests",
    en: "Tests",
    ch: "Tests",
  },
  experimentalWarning: {
    de: "Tests: (inklusive experimenteller Features)",
    en: "Tests: (including experimental features)",
    ch: "Tests: (inklusive experimentelle Features)",
  },
  animations: {
    de: "Animationen",
    en: "Animations",
    ch: "Animatione",
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
  playAll: {
    de: "Alle abspielen",
    en: "Play all",
    ch: "All abspiele",
  },
  // lets hope we don't ever get to see this one :)
  undefined: {
    de: "undefiniert",
    en: "undefined",
    ch: "undefiniert",
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
  notTheSame: {
    de: "Das ist nicht dasselbe",
    en: "That is not the same",
    ch: "Das isch nöd s'gleiche",
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
  fellIntoTrap: {
    de: `Du bist in eine Falle gefallen und landest in einer tieferen Ebene. Drücke ${arrowRight} oder [Enter], um fortzufahren`,
    en: `You fell into a trap and land in a deeper level. Press ${arrowRight} or [Enter] to continue`,
    ch: `Du bisch i e Falle gfalle und landisch i ere tieferere Ebene. Drück ${arrowRight} oder [Enter], um witermache`,
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
  confirmDungeonExit: {
    de: "Bist Du sicher, dass du den Dungeon verlassen willst?",
    en: "Are you sure you want to exit the dungeon?",
    ch: "Bisch sicher, dass Du de Dungeon verlah willsch?",
  },
  fleeDungeon: {
    de: "Du nimmst Deine Beine in die Hand und fliehst so schnell du kannst aus dem Dungeon.\nDie Decke und Wände beginnen zu bröckeln und machen merkwürdige Geräusche.\nMit deinem letzten Atemzug schaffst du es nach draußen, während der Dungeon hinter dir in sich zusammenfällt.",
    en: "You take to your heels and flee the dungeon as fast as you can.\nThe ceiling and walls start to crumble, making strange noises.\nWith your last breath, you make it outside just as the dungeon collapses behind you.",
    ch: "Du nimmst Di Bei id Hand und flüesch so schnäll wie Du chasch us em Dungeon.\nD'Wänd und d'Decki fanged ah az brösmle und mache komischi Gäräusche.\nMit äm letschte Schnauf schaffsch es usse, grad wänn de Dungeon hinder Di zämäfallt.",
  },
  bossCleared: {
    de: "Herzlichen Glückwunsch, Du hast den Boss besiegt und damit den Dungeon beendet.\n Viel Glück auf Deinen weiteren Abenteuern.",
    en: "Congratulations, you have defeated the boss and completed the dungeon.\n Good luck on your future adventures!",
    ch: "Grautulation, Du hesch de Boss bsiigt und de Dungeon gschlosse.\n Viel Glück uf Dini wiiteri Abentüür!",
  },
  // #endregion

  // #region Combat
  chooseCombatOption: {
    de: "Wähle eine Aktion aus:",
    en: "Choose an action:",
    ch: "Wähl en Aktion us:",
  },
  attack: {
    de: "Angreifen",
    en: "Attack",
    ch: "Aagriffe",
  },
  defend: {
    de: "Verteidigen",
    en: "Defend",
    ch: "Verteidige",
  },
  useAbility: {
    de: "Fähigkeit benutzen",
    en: "Use Ability",
    ch: "Fähigkeit bruuche",
  },
  useItem: {
    de: "Item benutzen",
    en: "Use Item",
    ch: "Gegenstand bruuche",
  },
  runAway: {
    de: "Weg rennen",
    en: "Run Away",
    ch: "Flüechte",
  },
  // #endregion

  // #region Campaign
  exploreFurther: {
    de: "Erkunde die Umgebung weiter",
    en: "Explore the area further",
    ch: "Erforscht d'Gegend witer",
  },
  askForMoreInfo: {
    de: "Frage jemanden nach mehr Informationen",
    en: "Ask someone for more information",
    ch: "Frag öpper nach meh Informatione",
  },
  openInventory: {
    de: "📦Öffne dein Inventar",
    en: "📦Open your inventory",
    ch: "📦Öpfne dis Inventar",
  },
  reviewScene: {
    de: "📚Aktuelle Szene nochmal ansehen",
    en: "📚Review current scene",
    ch: "📚Aktuelli Szenerie nochma aaluege",
  },
  returnToMenu: {
    de: "🏠Zurück zum Hauptmenü",
    en: "🏠Back to main menu",
    ch: "🏠Zrugg zum Hauptmenü",
  },
  whatNext: {
    de: "✧ Was möchtest Du als nächstes tun? ✧",
    en: "✧ What would you like to do next? ✧",
    ch: "✧ Was wotsch du als nächscht mache? ✧",
  },
  chooseNextOption: {
    de: "Wähle eine Option",
    en: "Choose an option",
    ch: "Wähl e Option",
  },
  savingBeforeExit: {
    de: "💾 Spiel wird gespeichert...",
    en: "💾 Saving game...",
    ch: "💾 Spiel wird gspichere...",
  },
  savedSuccessfully: {
    de: "💾 Spiel erfolgreich gespeichert",
    en: "💾 Game saved successfully",
    ch: "💾 Spiel erfolgrich gspichere",
  },
  saveFailed: {
    de: "💾 Spiel konnte nicht gespeichert werden",
    en: "💾 Game could not be saved",
    ch: "💾 Spiel cha nöd gspichere werde",
  },
  cannotOpenInventory: {
    de: "Kann das Inventar im Moment nicht öffnen",
    en: "Unable to access inventory at this time",
    ch: "Kann s'Inventar im Moment nöd öffne",
  },
  closedInventory: {
    de: "Du schliesst dein Inventar und überlegst dir deinen nächsten Schritt...",
    en: "You close your inventory and consider your next move...",
    ch: "Du schliesst dis Inventar und überlegsch dir din nöchschti Schritt...",
  },

  // Objective related
  objective: {
    de: "Ziel",
    en: "Objective",
    ch: "Ziil",
  },
  pendingObjectives: {
    de: "Ausstehende Ziele",
    en: "Pending Objectives",
    ch: "Usstehendi Ziil",
  },
  completedObjectives: {
    de: "Abgeschlossene Ziele",
    en: "Completed Objectives",
    ch: "Abgschlosseni Ziil",
  },
  staleObjectives: {
    de: "Veraltete Ziele",
    en: "Stale Objectives",
    ch: "Veralteti Ziil",
  },
  newObjectives: {
    de: "Neue Ziele",
    en: "New Objectives",
    ch: "Neui Ziil",
  },
  objectiveCompleted: {
    de: "Ziel abgeschlossen",
    en: "Objective completed",
    ch: "Ziil abgschlosse",
  },
  // Story pace
  fast: {
    de: "Schnell",
    en: "Fast",
    ch: "Schnäll",
  },
  medium: {
    de: "Mittel",
    en: "Medium",
    ch: "Mittel",
  },
  slow: {
    de: "Langsam",
    en: "Slow",
    ch: "Langsam",
  },
  // Campaign messages
  startingCampaign: {
    de: "Kampagne wird gestartet...",
    en: "Starting campaign...",
    ch: "Kampagne wird gstartet...",
  },
  newCampaign: {
    de: "Neue Kampagne",
    en: "New campaign",
    ch: "Neui Kampagne",
  },
  continuingCampaign: {
    de: "Bestehende Kampagne wird fortgesetzt",
    en: "Continuing existing campaign",
    ch: "Bestehendi Kampagne wird fortgsetzt",
  },
  generatingIntroduction: {
    de: "Einführung wird generiert...",
    en: "Generating introduction...",
    ch: "Iifüehrig wird generiert...",
  },
  introductionReady: {
    de: "Einführung bereit!",
    en: "Introduction ready!",
    ch: "Iifüehrig parat!",
  },
  failedToGenerateIntro: {
    de: "Fehler beim Generieren der Einführung",
    en: "Failed to generate introduction",
    ch: "Fehler bim Generiere vo dr Iifüehrig",
  },
  weavingStory: {
    de: "Der nächste Teil deiner Geschichte wird erstellt...",
    en: "Weaving the next part of your story...",
    ch: "Dr nöchscht Teil vo dinere Gschicht wird erstellt...",
  },
  storyReady: {
    de: "Der nächste Teil deiner Geschichte ist bereit!",
    en: "Next part of your story ready!",
    ch: "Dr nöchscht Teil vo dinere Gschicht isch parat!",
  },
  storytellingIssue: {
    de: "Problem beim Erzählen der Geschichte",
    en: "Storytelling encountered an issue",
    ch: "Problem bim Verzelle vo dr Gschicht",
  },
  ensuringNarrativeContinuity: {
    de: "Narrative Kontinuität wird sichergestellt...",
    en: "Ensuring narrative continuity...",
    ch: "Narrativi Kontinuität wird sichergstellt...",
  },
  narrativeFlowSecured: {
    de: "Narrativer Fluss gesichert",
    en: "Narrative flow secured",
    ch: "Narrative Fluss gsicheret",
  },
  narrativeContinuityIssue: {
    de: "Problem mit der narrativen Kontinuität",
    en: "Issue with narrative continuity",
    ch: "Problem mit dr narrative Kontinuität",
  },
  // Scene types
  battle: {
    de: "Schlacht",
    en: "Battle",
    ch: "Schlacht",
  },
  tavern: {
    de: "Taverne",
    en: "Tavern",
    ch: "Taverne",
  },
  castle: {
    de: "Schloss",
    en: "Castle",
    ch: "Schloss",
  },
  forest: {
    de: "Wald",
    en: "Forest",
    ch: "Wald",
  },
  mountain: {
    de: "Berg",
    en: "Mountain",
    ch: "Bärg",
  },
  dungeon: {
    de: "Verlies",
    en: "Dungeon",
    ch: "Verliess",
  },
  shop: {
    de: "Laden",
    en: "Shop",
    ch: "Lade",
  },
  // Error messages
  failedToExtractObjectives: {
    de: "Fehler beim Extrahieren der Ziele",
    en: "Failed to extract objectives",
    ch: "Fehler bim Extrahiere vo de Ziil",
  },
  failedToSaveGameState: {
    de: "Fehler beim Speichern des Spielstandes",
    en: "Failed to save game state",
    ch: "Fehler bim Spichere vom Spielstand",
  },
  campaignLoopError: {
    de: "Fehler in der Kampagnen-Schleife",
    en: "Campaign loop error",
    ch: "Fehler i dr Kampagne-Schleife",
  },
  gameStateSaved: {
    de: "Spielstand gespeichert. Du kannst später weiterspielen.",
    en: "Game state saved. You can continue later.",
    ch: "Spielstand gspicheret. Du chasch spöter wiiterspiele.",
  },
  // Other campaign terms
  chapter: {
    de: "Kapitel",
    en: "Chapter",
    ch: "Kapitel",
  },
  previously: {
    de: "Zuvor",
    en: "Previously",
    ch: "Vorhär",
  },
  recentDecisions: {
    de: "Letzte Entscheidungen",
    en: "Recent decisions",
    ch: "Letschti Entscheidigä",
  },
  adventureContinues: {
    de: "Dein Abenteuer geht weiter...",
    en: "Your adventure continues...",
    ch: "Dis Abentüür gaht witer...",
  },
  narrative: {
    de: "Erzählung",
    en: "Narrative",
    ch: "Verzählig",
  },
  story: {
    de: "Geschichte",
    en: "Story",
    ch: "Gschicht",
  },
  arc: {
    de: "Handlungsbogen",
    en: "Arc",
    ch: "Handligsboge",
  },
  scene: {
    de: "Szene",
    en: "Scene",
    ch: "Szene",
  },
  yourAdventureSoFar: {
    de: "Dein Abenteuer bisher",
    en: "Your Adventure So Far",
    ch: "Dis Abentüür bis jetzt",
  },
  // #endregion

  // #region Chapter and Arc Titles
  chapterTitleIntroduction: {
    de: "Der Anfang",
    en: "The Beginning",
    ch: "De Afang",
  },
  chapterTitleRisingAction: {
    de: "Die Herausforderung wächst",
    en: "The Challenge Grows",
    ch: "D'Useforderig wachst",
  },
  chapterTitleClimax: {
    de: "Der Moment der Wahrheit",
    en: "The Moment of Truth",
    ch: "De Moment vo de Wahrheit",
  },
  chapterTitleFallingAction: {
    de: "Die Nachwirkungen",
    en: "The Aftermath",
    ch: "D'Nachwürkige",
  },
  chapterTitleResolution: {
    de: "Der Abschluss",
    en: "The Conclusion",
    ch: "De Abschluss",
  },
  chapterTitleDefault: {
    de: "Ein neues Kapitel",
    en: "A New Chapter",
    ch: "Es neus Kapitel",
  },
  storyPaceWarning: {
    de: "WICHTIG: Die Erzähltempo kann nur einmal pro Kampagne ausgewählt werden und kann später nicht mehr geändert werden.",
    en: "IMPORTANT: Story pace can only be selected once per campaign and cannot be changed later.",
    ch: "WICHTIG: S'Erzähltempo cha nur einisch pro Kampagne usgwählt werde und cha spöter nümme gänderet werde.",
  },
  chooseStoryPace: {
    de: "Wähle dein Erzähltempo:",
    en: "Choose your story pace:",
    ch: "Wähl dis Erzähltempo:",
  },
  storyPaceSet: {
    de: "Erzähltempo festgelegt. Dein Abenteuer beginnt...",
    en: "Story pace set. Your adventure begins...",
    ch: "Erzähltempo festgleit. Dis Abentüür beginnt...",
  },
  pressEnterToReturnToMenu: {
    de: "Drücke Enter, um zum Hauptmenü zurückzukehren...",
    en: "Press Enter to return to the main menu...",
    ch: "Drück Enter zum zum Hauptmenü zruggkehre...",
  },
  noCharacterDataFound: {
    de: "Keine Charakterdaten gefunden. Bitte erstelle zuerst einen Charakter.",
    en: "No character data found. Please create a character first.",
    ch: "Kei Charakterdate gfunde. Bitte erstell zerscht en Charakter.",
  },
  failedToStartCampaign: {
    de: "Kampagne konnte nicht gestartet werden. Kehre zum Hauptmenü zurück...",
    en: "Failed to start campaign. Returning to main menu...",
    ch: "Kampagne het nöd chönne gstartet werde. Kehr zum Hauptmenü zrugg...",
  },

  // #endregion

  // #region Arc Guidelines
  arcGuidelineIntroduction: {
    de: "Etabliere den Schauplatz, stelle wichtige Charaktere vor und präsentiere den ersten Konflikt",
    en: "Establish setting, introduce key characters, and present initial conflict",
    ch: "Etablier de Schauplatz, stell wichtigi Charaktere vor und zeig de erst Konflikt",
  },
  arcGuidelineRisingAction: {
    de: "Steigere die Herausforderungen, führe Komplikationen ein, vertiefe Charakterbeziehungen",
    en: "Escalate challenges, introduce complications, deepen character relationships",
    ch: "Steiger d'Useforderige, füehr Komplikatione i, vertief d'Beziehige zwüsche de Charaktere",
  },
  arcGuidelineClimax: {
    de: "Arbeite auf eine große Konfrontation hin, maximiere Spannung, erschaffe hohe Einsätze",
    en: "Build toward major confrontation, maximize tension, create high stakes",
    ch: "Arbeit uf e grossi Konfrontation hee, maximier d'Spannig, schaff hohi Isätz",
  },
  arcGuidelineFallingAction: {
    de: "Zeige die Konsequenzen des Höhepunkts, beginne Konflikte zu lösen",
    en: "Show consequences of climax, begin resolving conflicts",
    ch: "Zeig d'Konsequenze vom Höhepunkt, fang a Konflikt z'löse",
  },
  arcGuidelineResolution: {
    de: "Biete Abschluss für Handlungsstränge, deute auf zukünftige Abenteuer hin",
    en: "Provide closure to story arcs, hint at future adventures",
    ch: "Biet Abschluss für d'Gschicht, düt uf zukünftigi Abentüür hee",
  },
  arcGuidelineDefault: {
    de: "Entwickle die Geschichte mit bedeutungsvollen Entscheidungen weiter",
    en: "Continue developing the story with meaningful choices",
    ch: "Entwickel d'Gschicht mit bedütigsolle Entscheidig witer",
  },
  // #endregion

  // #region Arc Transitions
  arcTransitionIntroToRising: {
    de: "Baue auf etablierte Elemente, indem du Komplikationen einführst. Erhöhe die Einsätze für den Charakter und vertiefe NPC-Beziehungen. Schaffe Hindernisse auf dem Weg zu den Hauptzielen.",
    en: "Build upon established elements by introducing complications. Increase stakes for the character and deepen NPC relationships. Create roadblocks toward the main objectives.",
    ch: "Bau uf etablierti Element uf, indem du Komplikatione iiführsch. Erhöh d'Isätz für de Charakter und vertief d'NPC-Beziehige. Schaff Hinderniss uf em Wäg zu de Hauptziel.",
  },
  arcTransitionRisingToClimax: {
    de: "Steigere die Spannung zu einem Höhepunkt. Führe eine entscheidende Konfrontation ein. Teste die Fähigkeiten und Entschlossenheit des Protagonisten.",
    en: "Escalate tension toward a climactic point. Introduce a decisive confrontation. Test the protagonist's skills and resolve.",
    ch: "Steiger d'Spannig zu eme Höhepunkt. Füehr e entscheidendi Konfrontation ii. Test d'Fähigkeite und Entschlosseheit vom Protagonist.",
  },
  arcTransitionClimaxToFalling: {
    de: "Zeige die unmittelbaren Folgen der Klimax. Beginne mit der Auflösung der Hauptkonflikte. Lasse den Protagonisten die Konsequenzen seiner Entscheidungen reflektieren.",
    en: "Show the immediate aftermath of the climax. Begin resolving major conflicts. Let the protagonist reflect on the consequences of their decisions.",
    ch: "Zeig d'direkte Folge vo de Klimax. Fang mit de Uflösig vo de Hauptkonflikte aa. La de Protagonist d'Konsequenze vo sine Entscheidig reflektiere.",
  },
  arcTransitionFallingToResolution: {
    de: "Löse verbleibende Handlungsstränge auf. Runde die Charakterentwicklung ab. Biete befriedigende Abschlüsse für die Hauptthemen.",
    en: "Resolve remaining story threads. Round out character development. Provide satisfying conclusions to major themes.",
    ch: "Lös verblibendi Handligsstrang uf. Rund d'Charakterentwicklig ab. Biet befriedigendi Abschlüss für d'Haupttheme.",
  },
  arcTransitionResolutionToIntro: {
    de: "Deute auf neue Abenteuer hin. Führe subtil neue Elemente oder Charaktere ein. Bereite den Boden für einen frischen Anfang.",
    en: "Hint at new adventures. Subtly introduce new elements or characters. Set the stage for a fresh beginning.",
    ch: "Düt uf neui Abentüür hii. Füehr subtil neui Element oder Charakter ii. Bereit de Bode für en frische Afang.",
  },
  arcTransitionDefault: {
    de: "Entwickle die Geschichte auf natürliche Weise weiter, indem Du auf bisherigen Ereignissen aufbaust.",
    en: "Advance the story naturally, building upon previous events.",
    ch: "Entwickel d'Gschicht uf natürlichi Art wiiter, indem du uf bisheriige Ereigniss ufbausch.",
  },
  // #endregion

  // #region Campaign
  returningToMainMenu: {
    de: "Zurück zum Hauptmenü...",
    en: "Returning to main menu...",
    ch: "Zrugg zum Hauptmenü...",
  },
  loadedSavedCampaignState: {
    de: "✅ Gespeicherter Kampagnen-Status geladen.",
    en: "✅ Loaded saved campaign state.",
    ch: "✅ Gspicherte Kampagne-Status glade.",
  },
  introduction: {
    de: "Einführung",
    en: "Introduction",
    ch: "Iifüehrig",
  },
  // #endregion

  // #region NarrativeService
  generatingNextScene: {
    de: "Nächste Szene wird generiert...",
    en: "Generating next scene...",
    ch: "Nöchsti Szene wird generiert...",
  },
  processingChoice: {
    de: "Deine Entscheidung wird verarbeitet...",
    en: "Processing your choice...",
    ch: "Dini Entscheidig wird verarbeitet...",
  },
  generatingRecap: {
    de: "Zusammenfassung wird erstellt...",
    en: "Generating recap...",
    ch: "Zämmefassig wird erstellt...",
  },
  enhancingNarrative: {
    de: "Erzählung wird verbessert...",
    en: "Enhancing narrative...",
    ch: "Verzählig wird verbesseret...",
  },
  // #endregion

  // #region EventHandlerService
  pressEnterForCombat: {
    de: "Drücke [Enter], um den Kampf zu beginnen",
    en: "Press [Enter] to start combat",
    ch: "Drück [Enter] zum de Kampf starte",
  },
  combatEncounterTriggered: {
    de: "Kampfbegegnung ausgelöst!",
    en: "Combat encounter triggered!",
    ch: "Kampfbegegnig usglöst!",
  },
  enemyAppears: {
    de: "{enemy} erscheint vor dir!",
    en: "{enemy} appears before you!",
    ch: "{enemy} erschiint vor dir!",
  },
  combatDefeat: {
    de: "Du wurdest besiegt...",
    en: "You have been defeated...",
    ch: "Du bisch besiegt worde...",
  },
  combatVictory: {
    de: "Sieg! Du erhältst {xp} Erfahrungspunkte.",
    en: "Victory! You gain {xp} experience points.",
    ch: "Sieg! Du überchunsch {xp} Erfahrigspünkt.",
  },
  foundNewItem: {
    de: "Du hast einen neuen Gegenstand gefunden: {name} ({rarity})",
    en: "You found a new item: {name} ({rarity})",
    ch: "Du hesch en neue Gegestand gfunde: {name} ({rarity})",
  },
  pressContinueJourney: {
    de: "Drücke [Enter], um deine Reise fortzusetzen",
    en: "Press [Enter] to continue your journey",
    ch: "Drück [Enter] zum dini Reis fortsetze",
  },
  foundItems: {
    de: "Du hast folgende Gegenstände gefunden:",
    en: "You found the following items:",
    ch: "Du hesch die folgende Gegeständ gfunde:",
  },
  inventoryFullItemLeft: {
    de: "Dein Inventar ist voll. Der Gegenstand wurde zurückgelassen.",
    en: "Your inventory is full. The item was left behind.",
    ch: "Dis Inventar isch voll. De Gegestand isch zrugglah worde.",
  },
  dungeonIssue: {
    de: "Es gab ein Problem mit dem Dungeon. Kehre zur Hauptgeschichte zurück.",
    en: "There was an issue with the dungeon. Return to the main story.",
    ch: "Es het es Problem mit em Dungeon geh. Kehr zur Hauptgschicht zrugg.",
  },
  merchantEncounter: {
    de: "Du triffst einen Händler auf deinem Weg.",
    en: "You encounter a merchant on your path.",
    ch: "Du triffsch en Händler uf dim Wäg.",
  },
  diceRollRequired: {
    de: "Eine Würfelprobe ist erforderlich. Werfe einen W20...",
    en: "A dice roll is required. Rolling a d20...",
    ch: "En Würfelprobe isch erforderlich. Wirfe en W20...",
  },
  youRolled: {
    de: "Du hast eine {roll} gewürfelt!",
    en: "You rolled a {roll}!",
    ch: "Du hesch e {roll} gwürflet!",
  },
  // #endregion

  // #region EquipmentService
  equipmentSlots: {
    de: "Ausrüstungsslots",
    en: "Equipment slots",
    ch: "Usrüstigsslots",
  },
  head: {
    de: "Kopf",
    en: "Head",
    ch: "Chopf",
  },
  body: {
    de: "Körper",
    en: "Body",
    ch: "Körper",
  },
  mainHand: {
    de: "Haupthand",
    en: "Main hand",
    ch: "Haupthand",
  },
  offHand: {
    de: "Nebenhand",
    en: "Off hand",
    ch: "Nebehand",
  },
  accessory: {
    de: "Zubehör",
    en: "Accessory",
    ch: "Zubehör",
  },
  statBonus: {
    de: "Statusbonus",
    en: "Stat bonus",
    ch: "Statusbonus",
  },
  equipmentEffect: {
    de: "Ausrüstungseffekt",
    en: "Equipment effect",
    ch: "Usrüstigseffekt",
  },
  currentlyEquipped: {
    de: "Aktuell ausgerüstet",
    en: "Currently equipped",
    ch: "Aktuell usgrüstet",
  },
  cannotEquip: {
    de: "Kann nicht ausgerüstet werden",
    en: "Cannot equip",
    ch: "Cha nöd usgrüstet werde",
  },
  invalidItemSelection: {
    de: "Ungültige Gegenstandsauswahl",
    en: "Invalid item selection",
    ch: "Ungültigi Gegestandsuswahl",
  },
  cannotEquipItem: {
    de: "{name} kann nicht ausgerüstet werden",
    en: "{name} cannot be equipped",
    ch: "{name} cha nöd usgrüstet werde",
  },
  levelRequirementEquip: {
    de: "Du benötigst Level {level}, um diesen Gegenstand auszurüsten",
    en: "You need to be level {level} to equip this item",
    ch: "Du muesch Level {level} sii zum de Gegestand usrüste",
  },
  invalidEquipmentSelection: {
    de: "Ungültige Ausrüstungsauswahl",
    en: "Invalid equipment selection",
    ch: "Ungültigi Usrüstigsuswahl",
  },
  equippedItems: {
    de: "Ausgerüstete Gegenstände",
    en: "Equipped Items",
    ch: "Usgrüsteti Gegeständ",
  },
  noItemsEquipped: {
    de: "Keine Gegenstände ausgerüstet",
    en: "No items equipped",
    ch: "Kei Gegeständ usgrüstet",
  },
  equipmentMenu: {
    de: "Ausrüstungsmenü",
    en: "Equipment Menu",
    ch: "Usrüstigsmenü",
  },
  equipItem: {
    de: "Gegenstand ausrüsten",
    en: "Equip item",
    ch: "Gegestand usrüste",
  },
  unequipItem: {
    de: "Gegenstand ablegen",
    en: "Unequip item",
    ch: "Gegestand ablege",
  },
  return: {
    de: "Zurück",
    en: "Return",
    ch: "Zrugg",
  },
  whatWouldYouLikeToDo: {
    de: "Was möchtest du tun?",
    en: "What would you like to do?",
    ch: "Was wotsch mache?",
  },
  noEquippableItems: {
    de: "Keine ausrüstbaren Gegenstände im Inventar",
    en: "No equippable items in inventory",
    ch: "Kei usrüstbari Gegeständ im Inventar",
  },
  chooseItemToEquip: {
    de: "Wähle einen Gegenstand zum Ausrüsten",
    en: "Choose an item to equip",
    ch: "Wähl en Gegestand zum Usrüste",
  },
  noItemsToUnequip: {
    de: "Keine Gegenstände zum Ablegen",
    en: "No items to unequip",
    ch: "Kei Gegeständ zum Ablege",
  },
  chooseItemToUnequip: {
    de: "Wähle einen Gegenstand zum Ablegen",
    en: "Choose an item to unequip",
    ch: "Wähl en Gegestand zum Ablege",
  },
  // #endregion

  // #region MenuService
  loading: {
    de: "Wird geladen...",
    en: "Loading...",
    ch: "Wird glade...",
  },
  mainMenuTitle: {
    de: "⚔️ DnD Command Line Interface ⚔️",
    en: "⚔️ DnD Command Line Interface ⚔️",
    ch: "⚔️ DnD Command Line Interface ⚔️",
  },
  chooseOption: {
    de: "Wähle eine Option",
    en: "Choose an option",
    ch: "Wähl e Option",
  },
  noSelectableChoices: {
    de: "Keine auswählbaren Optionen",
    en: "No selectable choices",
    ch: "Kei uswählbari Optione",
  },
  disabled: {
    de: "(deaktiviert)",
    en: "(disabled)",
    ch: "(deaktiviert)",
  },

  useArrowKeys: {
    de: "Benutze ↑/↓ für Navigation, ↵ zum Auswählen",
    en: "Use ↑/↓ to navigate, ↵ to select",
    ch: "Bruuch ↑/↓ zum Navigiere, ↵ zum Uswähle",
  },
  // #endregion

  // #region NarrativeDisplayService
  pressRightForStory: {
    de: "Drücke → für die Geschichte",
    en: "Press → for the story",
    ch: "Drück → für d'Gschicht",
  },
  storyBeginsHere: {
    de: "Die Geschichte beginnt hier",
    en: "The story begins here",
    ch: "D'Gschicht fängt do a",
  },
  pressEnterForChoices: {
    de: "Drücke [Enter] für Auswahlmöglichkeiten",
    en: "Press [Enter] for choices",
    ch: "Drück [Enter] für Uswahlmöglichkeite",
  },
  useArrowKeysNavigation: {
    de: "Verwende ← und → zum Navigieren, [Enter] zum Fortfahren",
    en: "Use ← and → to navigate, [Enter] to continue",
    ch: "Benutz ← und → zum Navigiere, [Enter] zum Fortfahre",
  },
  pressEnterToContinue: {
    de: "Drücke [Enter] zum Fortfahren",
    en: "Press [Enter] to continue",
    ch: "Drück [Enter] zum Fortfahre",
  },
  adventureRecap: {
    de: "Zusammenfassung des Abenteuers",
    en: "Adventure Recap",
    ch: "Zämmefassig vom Abentüür",
  },
  // #endregion

  // #region ImageService
  usingCachedImage: {
    de: "Verwende gecachtes Bild für: ",
    en: "Using cached image for: ",
    ch: "Verwände gspicherets Bild für: ",
  },
  forceNewGeneration: {
    de: "Erzwinge neue Bildgenerierung",
    en: "Forcing new image generation",
    ch: "Erzwinge neui Bildgenerierig",
  },
  imageGenerationLimitReached: {
    de: "Bildgenerierungslimit erreicht. Bitte versuche es später erneut.",
    en: "Image generation limit reached. Please try again later.",
    ch: "Bildgenerierigslimit erreicht. Bitte versuech's spöter nomal.",
  },
  generatingSceneImage: {
    de: "Erzeuge Szenenbild...",
    en: "Generating scene image...",
    ch: "Generiere Szenebild...",
  },
  sceneImageGenerated: {
    de: "Szenenbild erzeugt",
    en: "Scene image generated",
    ch: "Szenebild generiert",
  },
  failedToGenerateImage: {
    de: "Fehler bei der Bilderzeugung",
    en: "Failed to generate image",
    ch: "Fehler bide Bildgenerierig",
  },
  errorGeneratingImage: {
    de: "Fehler beim Erzeugen des Bildes",
    en: "Error generating image",
    ch: "Fehler bim Generiere vom Bild",
  },
  // #endregion
};
