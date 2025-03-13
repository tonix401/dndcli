import {
  boxItUp,
  getTextOnBackground,
  primaryColor,
  secondaryColor,
} from "@utilities/ConsoleService.js";

export function getErrorMessage(error: Error) {
  const background = secondaryColor(
    [
      "*******************************************************************************",
      " _________|___________________|__________________|__________________|_________ ",
      "|                   |                   |                   |                 |",
      "|                   |                   |                   |                 |",
      "|___________________|___________________|___________________|_________________|",
      "          |                   |                  |                  |          ",
      "*******************************************************************************",
    ].join("\n")
  );

  const errorMessage = primaryColor(boxItUp(error.message ?? error));

  return getTextOnBackground(errorMessage, background);
}
