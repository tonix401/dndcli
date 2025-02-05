import { input } from "@inquirer/prompts";
import { getTerm, Language } from "../utilities/LanguageService.js";
import chalk from "chalk";
import { skippableSlowWrite, totalClear } from "../utilities/ConsoleService.js";

/**
 * Initiates the title sequence / welcome screen of the app
 * @param lang The current language code, to show the sequence in
 * @example
 *   Welcome to DnD-CLI
 *   by Julian Thaesler and Tom Weise
 * ? Press [Enter]
 */
export async function welcomeScreen(lang: Language) {
  totalClear();

  await skippableSlowWrite(
    getTerm("welcome", lang),
    {formattings: [(char) => chalk.bold(chalk.cyan(char)), char => char]}
  );
  await input({ message: getTerm("pressEnter", lang) });
}
