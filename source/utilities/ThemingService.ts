import chalk from "chalk";
import { Language } from "./LanguageService";

export const standardTheme: ITheme = {
  name: { de: "Standard", en: "Standard" },
  prefix: " ",
  primaryColor: "#00a4ff",
  secondaryColor: "#F0FFFF",
  cursor: "👉",
};

export function getAllThemeOverrides() {
  return themes;
}

export type ITheme = {
  name: Record<Language, string>;
  prefix: string;
  primaryColor: string;
  secondaryColor: string;
  cursor: string;
};

export type IThemeOverride = {
  name: Record<Language, string>;
  prefix?: string;
  primaryColor?: string;
  secondaryColor?: string;
  cursor?: string;
};

const themes: Record<string, IThemeOverride> = {
  pirate: {
    name: { de: "Pirat", en: "Pirate" },
    primaryColor: "#FFFFFF",
    secondaryColor: "#FF0000",
    cursor: "☠️ ",
  },
  frog: {
    name: { de: "Frosch", en: "Frog" },
    primaryColor: "#00FF00",
    secondaryColor: "#00B000",
    cursor: "🐸",
    prefix: "💚",
  },
  hacker: {
    name: { de: "Hacker", en: "Hacker" },
    primaryColor: "#00FF00",
    secondaryColor: "#444444",
    cursor: chalk.whiteBright("0"),
    prefix: chalk.bold(chalk.hex("#00FF00")("System \\")),
  },
  fire: {
    name: { de: "Feuer", en: "Fire" },
    primaryColor: "#ff3a00",
    secondaryColor: "#ff7e00",
    cursor: "🔥",
  },
  neon: {
    name: { de: "Neon", en: "Neon" },
    prefix: "😎",
    primaryColor: "#FF00DD",
    secondaryColor: "#00FF00",
    cursor: "(👉ﾟヮﾟ)👉",
  },
  unicorn: {
    name: { de: "Einhorn", en: "Unicorn" },
    primaryColor: "#FF69B4",
    secondaryColor: "#FFD700",
    cursor: "🦄",
    prefix: "🌈",
  },
  galaxy: {
    name: { de: "Galaxie", en: "Galaxy" },
    primaryColor: "#4B0082",
    secondaryColor: "#8A2BE2",
    prefix: "🌒",
    cursor: "⭐",
  },
  noir: {
    name: { de: "Noir", en: "Noir" },
    primaryColor: "#444444",
    secondaryColor: "#444444",
    cursor: chalk.hex("#444444")("•"),
  },
  standard: {
    name: { de: "Standard", en: "Standard" },
  },
};

