import { getTheme } from "@utilities/CacheService.js";
import {
  boxItUp,
  getTextOnBackground,
  primaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { getTerm, TermKey } from "@utilities/LanguageService.js";
import { themedSingleKeyPrompt } from "@utilities/MenuService.js";

export async function tutorial(isNew: boolean) {
  let explanationsTerms = [
    "helloNewPlayer",
    "tutorialMenu",
    "tutorialEscape",
    "tutorialPremise",
    "tutorialCharacter",
    "tutorialSettings",
    "tutorialCampaign",
  ];

  if (!isNew) {
    // Remove the new player greeting if the player is not new
    explanationsTerms.shift();
  }

  let index = 0;
  while (index < explanationsTerms.length) {
    totalClear();
    console.log(
      getTextOnBackground(
        boxItUp(
          primaryColor(
            getTerm(explanationsTerms[index] as TermKey) +
              `\n(${index + 1}/${explanationsTerms.length})`
          )
        )
      )
    );
    index += parseInt(
      await themedSingleKeyPrompt({
        message: getTerm("pressEnter"),
        keybindings: {
          // Only put keybindings to increase or decrease the index
          return: "1",
          right: "1",
          left: "-1",
        },
        theme: {
          prefix: getTheme().cursor,
        },
      })
    );
    if (index < 0) {
      index = 0;
    }
  }
}
