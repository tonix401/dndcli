import { getTerm } from "@utilities/LanguageService.js";
import {
  boxItUp,
  getTextInRoomAsciiIfNotTooLong,
  pressEnter,
  primaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";
import fs from "fs-extra";
import dotenv from "dotenv";
import Config from "@utilities/Config.js";
import { getDataFromFile, saveDataToFile } from "@utilities/StorageService.js";
import {
  inputValidators,
  themedInput,
  themedSelect,
  themedSingleKeyPrompt,
} from "@utilities/MenuService.js";

/**
 * Initializes the settings and a character in case there is none yet
 * @returns Whether the player is new
 */
export async function newPlayerScreen(): Promise<void> {
  const isNew = await ensureSetupAndCheckIsNew();
  log(isNew + "");

  if (isNew) {
    log("New Player Screen: New Player detected");
    await tutorial(isNew);
    saveDataToFile("character", Config.START_CHARACTER);
  }
}

/**
 * Ensures that the environment is set up and checks if the player is new
 * @returns Whether the player is new
 */
async function ensureSetupAndCheckIsNew() {
  dotenv.config();

  const filePathsToCheck = {
    env: Config.ENV_FILE,
    log: Config.LOG_FILE,
    settings: Config.SETTINGS_FILE,
    character: Config.CHARACTER_FILE,
  };

  Object.values(filePathsToCheck).forEach((filePath) => {
    try {
      fs.ensureFileSync(filePath);
    } catch (error) {
      log("New Player Intro: " + error, "Error");
    }
  });

  if (!process.env.OPENAI_API_KEY) {
    fs.writeFileSync(
      filePathsToCheck.env,
      "OPENAI_API_KEY=" +
        (await themedInput({
          message: getTerm("enterApiKey"),
          validate: inputValidators.apiKey,
        }))
    );
    return true;
  }
  if (getDataFromFile("character") === null) {
    saveDataToFile("character", Config.START_CHARACTER);
    return true;
  }
  return false;
}

export async function tutorial(isNew: boolean) {
  let explanationsTerms = [
    "helloNewPlayer",
    "tutorialMenu",
    "tutorialPremise",
    "tutorialCharacter",
    "tutorialSettings",
    "tutorialCampaign",
  ];

  if (!isNew) {
    // Remove the the new player greeting if the player is not new
    explanationsTerms.shift();
  }

  let index = 0;
  while (index < explanationsTerms.length) {
    totalClear();
    console.log(
      getTextInRoomAsciiIfNotTooLong(
        boxItUp(primaryColor(getTerm(explanationsTerms[index]) + `\n(${index + 1}/${explanationsTerms.length})`)),
      )
    );
    index += parseInt(
      await themedSingleKeyPrompt({
        message: getTerm("pressEnter"),
        keybindings: {
          // only put keybindings to increase or decrease the index
          return: "1",
          right: "1",
          left: "-1",
        },
      })
    );
    if (index < 0) {
      index = 0;
    }
  }
}
