import { getTerm } from "../utilities/LanguageService.js";
import chalk from "chalk";
import {
  pressEnter,
  skippableSlowWrite,
  totalClear,
} from "../utilities/ConsoleService.js";
import { getTheme } from "../utilities/CacheService.js";

/**
 * Initiates the title sequence / welcome screen of the app
 * @example
 *   Welcome to DnD-CLI
 *   by Julian Thaesler and Tom Weise
 * ? Press [Enter]
 */
export async function welcomeScreen() {
  totalClear();

  await skippableSlowWrite(getTerm("welcome"), {
    formattings: [
      (char) => chalk.bold(chalk.hex(getTheme().primaryColor)(char)),
      (char) => chalk.hex(getTheme().secondaryColor)(char),
    ],
  });
  await pressEnter();
}
