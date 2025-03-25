import crypto from "crypto";
import { getTerm } from "@core/LanguageService.js";
import { getPassword, setPassword } from "@core/CacheService.js";
import { primaryColor, totalClear } from "@core/ConsoleService.js";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { themedPasswordInput } from "@components/ThemedPasswordInput.js";

/**
 * A Screen to check for a password
 * @param attempts How many attempts are left
 * @returns If the password was correct
 */
export async function checkPasswordScreen(attempts: number) {
  totalClear();
  const passwordToCheck = await themedPasswordInput({
    message: getTerm("enterPassword"),
    canGoBack: true,
  });

  if (passwordToCheck === "goBack") {
    return false;
  }

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
    const newPassword = await themedPasswordInput({
      message: getTerm("choosePassword"),
    });
    const confirmPassword = await themedPasswordInput({
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
