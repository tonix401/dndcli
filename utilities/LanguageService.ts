import LogTypes from "../types/LogTypes";
import { log } from "./LogService";

interface ITranslation {
  de: string;
  en: string;
}

type Language = "de" | "en";

export function getTerm(key: string, language: Language) {
  const term = terms[key][language];

  if (!term) {
    log(`Term not found: ${key}`, LogTypes.ERROR);
    return "";
  }

  return term;
}
const terms: Record<string, ITranslation> = {
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
    endGame: {
        de: "Spiel beenden",
        en: "End Game",
    },
    goodbye: {
        de: "Bis bald!👋",
        en: "See ya!👋"
    },
    namePrompt: {
        de: "Wie soll dein Charakter heißen",
        en: "What should your character be named"
    },
    classPrompt: {
        de: "Welche Klasse soll dein Charakter haben",
        en: "Which class should your character be"
    },
    noCharacter: {
        de: "Es wurde noch kein Charakter gespeichert",
        en: "There is no character saved yet"
    },
    backToMenu: {
        de: "Möchtest du zurück zum Menü?",
        en: "Do you want to go back to the menu?"
    },
    hp: {
        de: "HP",
        en: "HP"
    },
    level: {
        de: "Level",
        en: "Level"
    },
    xp: {
        de: "XP",
        en: "XP"
    },
    strength: {
        de: "Stärke",
        en: "Strength"
    },
    mana: {
        de: "Mana",
        en: "Mana"
    },
    dexterity: {
        de: "Geschicklichkeit",
        en: "Dexterity"
    },
    charisma: {
        de: "Charisma",
        en: "Charisma"
    },
    luck: {
        de: "Glück",
        en: "Luck"
    },
    inventory: {
        de: "Inventar",
        en: "Inventory"
    },
    empty: {
        de: "leer",
        en: "empty"
    },
    lastPlayed: {
        de: "Zuletzt gespielt",
        en: "Last played"
    }
};
