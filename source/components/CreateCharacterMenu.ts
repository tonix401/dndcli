import { getStartingItems } from "@utilities/InventoryService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { log } from "@utilities/LogService.js";
import {
  pressEnter,
  primaryColor,
  secondaryColor
} from "@utilities/ConsoleService.js";
import { rollDiceTotal } from "@utilities/DiceService.js";
import Config from "@utilities/Config.js";
import {
  ChatCompletionRequestMessage,
  generateChatNarrative,
} from "@utilities/AIService.js";
import ICharacter from "@utilities/ICharacter.js";
import { saveDataToFile } from "@utilities/StorageService.js";
import { getLanguage } from "@utilities/CacheService.js";
import { inputValidators, themedInput, themedSelect } from "@utilities/MenuService.js";

export async function createCharacterMenu(): Promise<void> {
  try {
    const charData: ICharacter = Config.START_CHARACTER;

    // Get character name using themed prompt
    const namePrompt = primaryColor(getTerm("namePrompt"));
    charData.name = await themedInput({ message: namePrompt,  validate: inputValidators.name });

    // Get character class
    charData.class = await themedSelect({
      message: primaryColor(getTerm("classPrompt")),
      choices: Config.CHARACTER_CLASSES.map((cls) => ({
        name: getTerm(cls),
        value: cls,
      })),
    });

    // Ask user if they want default stats or custom allocation
    const statMethod = await themedSelect({
      message: primaryColor(
        "Do you want the default stat distribution or allocate custom points?"
      ),
      choices: [
        { name: "Default", value: "default" },
        { name: "Customize", value: "custom" },
      ],
    });

    if (statMethod === "default") {
      // Map class to default stats if available
      charData.abilities =
        Config.START_CHARACTER_STATS[charData.class] || charData.abilities;
    } else if (statMethod === "custom") {
      let pool = 20;
      console.log(
        secondaryColor(
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
        const promptMsg = primaryColor(
          `Allocate points for ${stat} (points left: ${pool}): `
        );
        let allocationStr = await themedInput({ message: promptMsg });
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
    const originPrompt = primaryColor(getTerm("originPrompt"));
    let originInput = await themedInput({ message: originPrompt });
    if (originInput.toLowerCase() === "exit") return;

    // If no origin is provided, default to "unknown"
    if (!originInput.trim()) {
      originInput = "unknown";
    } else {
      // Validate origin only if provided
      let validationResponse = await validateOrigin(originInput);
      while (!validationResponse.toLowerCase().includes("valid")) {
        console.log(secondaryColor(validationResponse));
        const clarMsg = primaryColor(getTerm("originClarification"));
        originInput = await themedInput({ message: clarMsg });
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
    saveDataToFile("character", charData);

    console.log(
      primaryColor(
        `${getTerm("characterSuccess")} You start with ${
          charData.currency
        } gold coins!`
      )
    );
    await pressEnter();
  } catch (error) {
    if (error instanceof Error) {
      log("Create Character Menu: " + error.message, "Error");
    }
  }
}

export async function validateOrigin(origin: string): Promise<string> {
  const systemMessage =
    "You are a game master of a text based rpg fantasy game.\n" +
    "You are given a character origin and you have to validate it.\n" +
    "Make sure the origin is not too long and fits the fantasy theme.\n" +
    "If the story is longer then a sentence and fantasy related it is automatically valid.\n" +
    "If the origin is valid, return only the word 'Valid'.\n" +
    "If the origin is invalid, return 'Invalid. This origin story is <reason why it's invalid>'.\n" +
    "You should make jokes and be witty, but dont say more than one or two short sentences\n" +
    "IT IS REALLY IMPORTANT THAT YOU RESPOND IN " +
    getTerm(getLanguage()) +
    "\nIf the origin story is non existent or giberish do not create your own but explain it in your answer.\n" +
    "The origin to validate is:";

  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: "'" + origin + "'" },
  ];

  try {
    const response = await generateChatNarrative(messages, {
      maxTokens: 80,
      temperature: 0.3,
    });
    return response.trim();
  } catch (err) {
    log("Create Character Menu: " + err, "Error");
    return "Valid"; // Fallback in case of AI service failure
  }
}
