import { log, LogTypes } from "../utilities/LogService.js";
import { pressEnter, themedSelect } from "../utilities/ConsoleService.js";
import { getTerm } from "../utilities/LanguageService.js";

export async function secretDevMenu() {
  const devMenuOptions: {
    name: string;
    value: string;
    description?: string;
  }[] = [
    {
      name: getTerm("showSavedData"),
      value: "showSavedData",
      description: getTerm("showSavedDataDesc"),
    },
    {
      name: getTerm("saveDataToJson"),
      value: "saveDataToJson",
      description: getTerm("saveDataToJsonDesc"),
    },
    {
      name: getTerm("goBack"),
      value: "goBack",
    },
  ];

  while (true) {
    const chosenOption = await themedSelect({
      message: getTerm("devMenu"),
      choices: devMenuOptions,
    });

    switch (chosenOption) {
      case "showSavedData":
        break;
      case "saveDataToJson":
        break;
      case "goBack":
        return;
      default:
        log("Secret Dev Menu: Unexpected menu choice", LogTypes.ERROR);
        console.log(getTerm("invalid"));
        await pressEnter();
    }
  }
}
