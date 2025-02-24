import chalk from "chalk"; // added missing chalk import
import type ICharacterData from "../types/ICharacterData.js";
import { saveCharacterData } from "../utilities/CharacterService.js";
import { input } from "@inquirer/prompts";
import {
  generateChatNarrative,
  ChatCompletionRequestMessage,
} from "../src/aiAssistant.js";
import { getStartingItems } from "../utilities/InventoryService.js";
import { getTerm } from "../utilities/LanguageService.js";
import { getClassChoices } from "../types/ClassChoices.js";
import { log, LogTypes } from "../utilities/LogService.js";
import { pressEnter, themedInput, themedSelect } from "../utilities/ConsoleService.js";
import { standardTheme } from "../utilities/ThemingService.js";
import { getDefaultAbilitiesForClass } from "../utilities/defaultAbilities.js";
import { rollDiceTotal } from "../utilities/DiceService.js";
import { ITheme } from "../types/ITheme.js";

async function validateOrigin(origin: string): Promise<string> {
  const systemMessage =
    "You are an expert storyteller and narrative validator for a Dungeons & Dragons adventure. " +
    "Evaluate the following character origin for plausibility and appropriateness in a realistic fantasy backstory. " +
    "If the origin is acceptable, respond with 'Valid'. Otherwise, provide a clarification request.";
  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: origin },
  ];
  try {
    const response = await generateChatNarrative(messages, {
      maxTokens: 50,
      temperature: 0.3,
    });
    return response.trim();
  } catch (error) {
    console.error("Error validating origin:", error);
    return "Valid"; // Fallback in case of AI service failure
  }
}

export async function createCharacterMenu(): Promise<void> {
  try {
    // Get current theme (using standardTheme here; you could allow selection later)
    const theme: ITheme = standardTheme;

    const charData: ICharacterData = {
      name: "",
      class: "",
      origin: "",
      level: 1,
      xp: 0,
      hp: 10,
      abilities: {
        maxhp: 10,
        strength: 1,
        mana: 1,
        dexterity: 1,
        charisma: 1,
        luck: 1,
      },
      inventory: [],
      lastPlayed: "",
      abilitiesList: [],
      currency: 0, // Added new property for starting currency
    };

    // Get character name using themed prompt
    const namePrompt = chalk.hex(theme.primaryColor)(getTerm("namePrompt"));
    charData.name = await themedInput(
      { message: namePrompt }
    );
    if (charData.name.toLowerCase() === "exit") return;

    // Get character class (the selection itself can be themed using your themedSelect helper)
    charData.class = await themedSelect({
      message: chalk.hex(theme.primaryColor)(getTerm("classPrompt")),
      choices: getClassChoices(),
    });

    // Map the selected class to the key used in defaultAbilities
    // For example, if getClassChoices() returns "swordsman", we map it to "Warrior"
    const classMapping: Record<string, string> = {
      swordsman: "Warrior",
      mage: "Mage",
      rogue: "Rogue",
    };
    const normalizedClass =
      classMapping[charData.class.toLowerCase()] || charData.class;
    // Now assign default abilities
    charData.abilitiesList = getDefaultAbilitiesForClass(normalizedClass);

    // Ask user if they want default stats or custom allocation
    const statMethod = await themedSelect({
      message: chalk.hex(theme.primaryColor)(
        "Do you want the default stat distribution or allocate custom points?"
      ),
      choices: [
        { name: "Default", value: "default" },
        { name: "Customize", value: "custom" },
      ],
    });

    // Define default stat mappings for example classes
    const defaultStats: Record<string, typeof charData.abilities> = {
      Warrior: {
        maxhp: 20,
        strength: 5,
        mana: 2,
        dexterity: 3,
        charisma: 2,
        luck: 3,
      },
      Mage: {
        maxhp: 12,
        strength: 2,
        mana: 8,
        dexterity: 3,
        charisma: 3,
        luck: 4,
      },
      Rogue: {
        maxhp: 15,
        strength: 3,
        mana: 3,
        dexterity: 7,
        charisma: 2,
        luck: 5,
      },
    };

    if (statMethod === "default") {
      // Map class to default stats if available
      charData.abilities = defaultStats[normalizedClass] || charData.abilities;
    } else if (statMethod === "custom") {
      let pool = 20;
      console.log(
        chalk.hex(theme.secondaryColor)(
          `You have ${pool} points to distribute among your stats.`
        )
      );
      const stats = [
        "maxhp",
        "strength",
        "mana",
        "dexterity",
        "charisma",
        "luck",
      ];
      for (const stat of stats) {
        const promptMsg = chalk.hex(theme.primaryColor)(
          `Allocate points for ${stat} (points left: ${pool}): `
        );
        let allocationStr = await themedInput(
          { message: promptMsg }
        );
        let allocation = parseInt(allocationStr);
        if (isNaN(allocation) || allocation < 0) {
          allocation = 0;
        }
        if (allocation > pool) {
          allocation = pool;
        }
        (charData.abilities as any)[stat] = allocation;
        pool -= allocation;
        if (pool === 0) break;
      }
      // Add remaining points to maxhp if any
      if (pool > 0) {
        (charData.abilities as any).maxhp += pool;
      }
    }

    // Get character origin
    const originPrompt = chalk.hex(theme.primaryColor)(getTerm("originPrompt"));
    let originInput = await themedInput(
      { message: originPrompt }
    );
    if (originInput.toLowerCase() === "exit") return;

    // If no origin is provided, default to "unknown"
    if (!originInput.trim()) {
      originInput = "unknown";
    } else {
      // Validate origin only if provided
      let validationResponse = await validateOrigin(originInput);
      while (!validationResponse.toLowerCase().includes("valid")) {
        console.log(chalk.hex(theme.secondaryColor)(validationResponse));
        const clarMsg = chalk.hex(theme.primaryColor)(
          getTerm("originClarification")
        );
        originInput = await themedInput(
          { message: clarMsg }
        );
        if (originInput.toLowerCase() === "exit") return;
        // If the user clears the input on subsequent prompts, default to unknown
        if (!originInput.trim()) {
          originInput = "unknown";
          break;
        }
        validationResponse = await validateOrigin(originInput);
      }
    }
    charData.origin = originInput;

    // Set metadata and starting items
    charData.lastPlayed = new Date().toLocaleDateString("de-DE");
    charData.inventory = getStartingItems(charData.class);

    // Add a random starting currency using a dice roll mechanic.
    // For example, roll 2 six-sided dice and multiply the total by 10 to determine gold coins.
    charData.currency = rollDiceTotal(6, 2) * 10;

    // Save character
    saveCharacterData(charData);

    console.log(
      chalk.hex(theme.primaryColor)(
        `${getTerm("characterSuccess")} You start with ${
          charData.currency
        } gold coins!`
      )
    );
    await pressEnter();
  } catch (error) {
    if (error instanceof Error) {
      log("Create Character Menu: " + error.message, LogTypes.ERROR);
    }
  }
}
