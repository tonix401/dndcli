import {
  boxItUp,
  getTextOnBackground,
  primaryColor,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import { getTerm } from "@utilities/LanguageService.js";

export function getErrorMessage(errorMessage: string) {
  const background = secondaryColor(
    [
      "*******************************************************************************",
      " _________|___________________|__________________|__________________|_________ ",
      "|                   |                   |                   |                 |",
      "|___________________|___________________|___________________|_________________|",
      "          |                   |                  |                  |          ",
      " _________|___________________|__________________|__________________|_________ ",
      "|                   |                   |                   |                 |",
      "*******************************************************************************",
    ].join("\n")
  );

  if (errorMessage.length > 55) {
    errorMessage = errorMessage.split("").slice(0, 55).join("") + "...";
  }

  errorMessage = "Error: " + errorMessage + "\n" + getTerm("checkTheLogs");
  const messageBox = primaryColor(boxItUp(errorMessage ?? "Unknown Error"));
  return getTextOnBackground(messageBox, background);
}
