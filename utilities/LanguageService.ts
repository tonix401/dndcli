import LogTypes from "../types/LogTypes.js";
import { log } from "./LogService.js";

interface ITranslation {
  de: string;
  en: string;
}

export type Language = "de" | "en";

export function getTerm(key: string, language: Language) {
  const term = terms[key][language];

  if (!term) {
    log(`Term not found: ${key}`, LogTypes.ERROR);
    return "";
  }

  return term;
}
const terms: Record<string, ITranslation> = {
  // #region General terms and Menu
  goodbye: {
    de: "Bis bald!👋",
    en: "See ya!👋",
  },
  backToMenu: {
    de: "Drücke [Enter], um zurück ins Menü zu kommen",
    en: "Press [Enter] to go back to the menu",
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
  namePrompt: {
    de: "Wie soll dein Charakter heißen",
    en: "What should your character be named",
  },
  classPrompt: {
    de: "Welche Klasse soll dein Charakter haben",
    en: "Which class should your character be",
  },
  characterSuccess: {
    de: "Charakter erfolgreich erstellt",
    en: "Character successfuly created"
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

  // #region menu options
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
