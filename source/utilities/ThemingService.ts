import chalk from "chalk";
import { Language } from "./LanguageService";

export type ITheme = {
  name: Record<Language, string>;
  prefix: string;
  primaryColor: string;
  secondaryColor: string;
  cursor: string;
  accentColor?: string;
  backgroundColor?: string;
  errorColor?: string;
};

export const standardTheme: ITheme = {
  name: { de: "Standard", en: "Standard" },
  prefix: " ",
  primaryColor: "#00a4ff",
  secondaryColor: "#F0FFFF",
  cursor: "👉",
  accentColor: "#FFAA00",
  backgroundColor: "#222222",
  errorColor: "#FF5555",
};

export function getAllThemeOverrides() {
  return themes;
}

export type IThemeOverride = {
  name: Record<Language, string>;
  prefix?: string;
  primaryColor?: string;
  secondaryColor?: string;
  cursor?: string;
  accentColor?: string;
  backgroundColor?: string;
  errorColor?: string;
};

const themes: Record<string, IThemeOverride> = {
  pirate: {
    name: { de: "Pirat", en: "Pirate" },
    primaryColor: "#FFFFFF",
    secondaryColor: "#FF0000",
    cursor: "☠️ ",
    accentColor: "#FFD700",
    backgroundColor: "#000000",
    errorColor: "#8B0000",
  },
  frog: {
    name: { de: "Frosch", en: "Frog" },
    primaryColor: "#00FF00",
    secondaryColor: "#00B000",
    cursor: "🐸",
    prefix: "💚",
    accentColor: "#ADFF2F",
    backgroundColor: "#004d00",
    errorColor: "#FF4500",
  },
  hacker: {
    name: { de: "Hacker", en: "Hacker" },
    primaryColor: "#00FF00",
    secondaryColor: "#444444",
    cursor: chalk.whiteBright("0"),
    prefix: chalk.bold(chalk.hex("#00FF00")("System \\")),
    accentColor: "#FF00FF",
    backgroundColor: "#000000",
    errorColor: "#FF5555",
  },
  fire: {
    name: { de: "Feuer", en: "Fire" },
    primaryColor: "#ff3a00",
    secondaryColor: "#ff7e00",
    cursor: "🔥",
    accentColor: "#FFD700",
    backgroundColor: "#330000",
    errorColor: "#FF6347",
  },
  neon: {
    name: { de: "Neon", en: "Neon" },
    prefix: "😎",
    primaryColor: "#FF00DD",
    secondaryColor: "#00FF00",
    cursor: "(👉ﾟヮﾟ)👉",
    accentColor: "#00FFFF",
    backgroundColor: "#222222",
    errorColor: "#FF1493",
  },
  unicorn: {
    name: { de: "Einhorn", en: "Unicorn" },
    primaryColor: "#FF69B4",
    secondaryColor: "#FFD700",
    cursor: "🦄",
    prefix: "🌈",
    accentColor: "#9400D3",
    backgroundColor: "#F8F8FF",
    errorColor: "#FF4500",
  },
  galaxy: {
    name: { de: "Galaxie", en: "Galaxy" },
    primaryColor: "#4B0082",
    secondaryColor: "#8A2BE2",
    prefix: "🌒",
    cursor: "⭐",
    accentColor: "#00CED1",
    backgroundColor: "#000033",
    errorColor: "#FF4500",
  },
  noir: {
    name: { de: "Noir", en: "Noir" },
    primaryColor: "#444444",
    secondaryColor: "#444444",
    cursor: chalk.hex("#444444")("•"),
    accentColor: "#888888",
    backgroundColor: "#000000",
    errorColor: "#FF0000",
  },
  standard: {
    name: { de: "Standard", en: "Standard" },
  },
};
