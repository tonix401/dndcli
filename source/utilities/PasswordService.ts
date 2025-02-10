import crypto from "crypto";
import chalk from "chalk";
import { password } from "@inquirer/prompts";
import { getTerm } from "./LanguageService.js";
import { getTheme } from "./CacheService.js";
import { totalClear } from "./ConsoleService.js";
import { getSettingsData } from "./SettingsService.js";

/**
 * A Screen to check for a password
 * @param attempts How many attempts are left
 * @returns If the password was correct
 */
export async function checkPasswordScreen(attempts: number) {
  const passwordToCheck = await password({
    message: getTerm("enterPassword"),
    mask: "*",
    theme: getTheme(),
  });

  const passwordToCheckHash = crypto
    .createHash("sha256")
    .update(passwordToCheck)
    .digest("hex");

  const passwordHash = getSettingsData()?.password;
  attempts--;
  if (attempts <= 0) {
    return false;
  } else if (passwordToCheckHash === passwordHash) {
    return true;
  }

  totalClear();
  console.log(
    chalk.hex(getTheme().primaryColor)(getTerm("wrongPassword") + attempts)
  );
  return await checkPasswordScreen(attempts);
}
