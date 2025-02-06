import { getTerm } from "../utilities/LanguageService.js";
import chalk from "chalk";
import {
  pressEnter,
  skippableSlowWrite,
  totalClear,
} from "../utilities/ConsoleService.js";
import { getPrimaryColor, getSecondaryColor } from "../utilities/CacheService.js";

/**
 * Initiates the title sequence / welcome screen of the app
 * @param lang The current language code, to show the sequence in
 * @example
 *   Welcome to DnD-CLI
 *   by Julian Thaesler and Tom Weise
 * ? Press [Enter]
 */
export async function welcomeScreen() {
  totalClear();

  await skippableSlowWrite(getTerm("welcome"), {
    formattings: [
      (char) => chalk.bold(chalk.hex(getPrimaryColor())(char)),
      (char) => chalk.hex(getSecondaryColor())(char),
    ]
  });
  await pressEnter();
}
