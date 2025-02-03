import { input } from "@inquirer/prompts";
import { getTerm, Language } from "../utilities/LanguageService.js";
import chalk from "chalk";
import { pause, slowWrite, totalClear } from "../utilities/ConsoleService.js";

/**
 * Initiates the title sequence / welcome screen of the app
 * @param lang The current language code, to show the sequence in
 * @example
 *   Welcome to DnD-CLI
 *   That must be the best name you have ever heard!
 *   Right?
 *   Nevermind that! Adventure awaits!
 *   by Julian Thaesler and Tom Weise
 * ? Press [Enter] to go to the menu
 */
export async function welcomeScreen(lang: Language) {
  totalClear();
  await slowWrite(
    getTerm("welcome", lang),
    undefined,
    undefined,
    false,
    (char) => chalk.bold(chalk.cyan(char))
  );
  await slowWrite(getTerm("welcomeText", lang));
  await input({ message: getTerm("pressEnter", lang) });
}
