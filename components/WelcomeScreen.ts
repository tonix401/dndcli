import { input } from "@inquirer/prompts";
import { getTerm, Language } from "../utilities/LanguageService.js";
import chalk from "chalk";
import { skippableSlowWrite, totalClear } from "../utilities/ConsoleService.js";

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

  /**
   * If the user skips during the "welcome" line, the "welcomeText" line is also written out instantly,
   * so the user doesnt have to skip twice in the same screen. I hope that makes sense ¯\_(ツ)_/¯
   */
  await skippableSlowWrite(
    getTerm("welcome", lang),
    undefined,
    undefined,
    (char) => chalk.bold(chalk.cyan(char))
  );
  await skippableSlowWrite(getTerm("welcomeText", lang));
  await input({ message: getTerm("pressEnter", lang) });
}
