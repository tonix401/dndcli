import crypto from "crypto";
import { getTerm } from "@utilities/LanguageService.js";
import { getPassword, setPassword } from "@utilities/CacheService.js";
import { primaryColor, totalClear } from "@utilities/ConsoleService.js";
import { themedInput, themedPassword } from "@utilities/MenuService.js";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";

/**
 * A Screen to check for a password
 * @param attempts How many attempts are left
 * @returns If the password was correct
 */
export async function checkPasswordScreen(attempts: number) {
  const passwordToCheck = await themedPassword({
    message: getTerm("enterPassword"),
  });

  const passwordToCheckHash = crypto
    .createHash("sha256")
    .update(passwordToCheck)
    .digest("hex");

  const passwordHash = getPassword();
  attempts--;
  if (attempts <= 0) {
    return false;
  } else if (passwordToCheckHash === passwordHash) {
    return true;
  }

  totalClear();
  console.log(primaryColor(getTerm("wrongPassword", true) + attempts));
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
    const newPassword = await themedInput({
      message: getTerm("choosePassword"),
    });
    const confirmPassword = await themedInput({
      message: getTerm("confirmPassword"),
    });

    isPasswordConfirmed = newPassword === confirmPassword;
    totalClear();
    if (!isPasswordConfirmed) {
      console.log(primaryColor(getTerm("notTheSame", true)));
      if (
        (await themedSelectInRoom({
          canGoBack: true,
          message: getTerm("tryAgain"),
          choices: [
            { name: getTerm("yes"), value: "yes" },
            { name: getTerm("no"), value: "goBack" },
          ],
        })) === "goBack"
      ) {
        return;
      }
    } else {
      resultPassword = newPassword;
    }
  } while (!isPasswordConfirmed);

  setPassword(crypto.createHash("sha256").update(resultPassword).digest("hex"));
}
