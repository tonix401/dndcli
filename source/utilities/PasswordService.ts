import crypto from "crypto";
import chalk from "chalk";
import { input, password } from "@inquirer/prompts";
import { getTerm } from "./LanguageService.js";
import { getTheme, setPassword } from "./CacheService.js";
import { themedSelect, totalClear } from "./ConsoleService.js";
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
    chalk.hex(getTheme().primaryColor)(getTerm("wrongPassword", true) + attempts)
  );
  return await checkPasswordScreen(attempts);
}

/**
 * A screen to set the password
 */
export async function setPasswordScreen() {
  if (!(await checkPasswordScreen(3))) {
    return;
  }

  let isPasswordConfirmed = false;
  let resultPassword = "";

  do {
    const newPassword = await input({
      message: getTerm("choosePassword"),
      theme: getTheme(),
    });
    const confirmPassword = await input({
      message: getTerm("confirmPassword"),
      theme: getTheme(),
    });

    isPasswordConfirmed = newPassword === confirmPassword;

    if (!isPasswordConfirmed) {
      console.log(chalk.hex(getTheme().primaryColor)(getTerm("notTheSame", true)));
      if (
        (await themedSelect({
          message: getTerm("tryAgain"),
          choices: [
            { name: getTerm("yes"), value: "yes" },
            { name: getTerm("no"), value: "no" },
          ],
        })) === "no"
      ) {
        return;
      }
    } else {
      resultPassword = newPassword;
    }
  } while (!isPasswordConfirmed);

  setPassword(crypto.createHash("sha256").update(resultPassword).digest("hex"));
}
