import { getStartingItems } from "@utilities/character/InventoryService.js";
import { getTerm } from "@utilities/LanguageService.js";
import { log } from "@utilities/LogService.js";
import {
  pressEnter,
  primaryColor,
  secondaryColor,
  totalClear,
} from "@utilities/ConsoleService.js";
import { rollDiceTotal } from "@utilities/combat/DiceService.js";
import Config from "@utilities/Config.js";
import {
  ChatCompletionRequestMessage,
  generateChatNarrative,
} from "@utilities/AIService.js";
import ICharacter from "@utilities/ICharacter.js";
import { saveDataToFile } from "@utilities/StorageService.js";
import { getLanguage } from "@utilities/CacheService.js";
import { inputValidators } from "@utilities/MenuService.js";
import { themedSelectInRoom } from "./ThemedSelectInRoom.js";
import { themedInput } from "./ThemedInput.js";

export async function createCharacterMenu(): Promise<void> {
  try {
    const charData: ICharacter = Config.START_CHARACTER;

    // Get character name using themed prompt
    totalClear();
    const namePrompt = primaryColor(getTerm("namePrompt"));
    charData.name = await themedInput({
      message: namePrompt,
      validate: inputValidators.name,
      canGoBack: true,
    });
    if (charData.name === "goBack") return;

    // Get character class
    totalClear();
    charData.class = await themedSelectInRoom({
      message: primaryColor(getTerm("classPrompt")),
      choices: Config.CHARACTER_CLASSES.map((cls) => ({
        name: getTerm(cls),
        value: cls,
      })),
    });

    // Ask user if they want default stats or custom allocation
    totalClear();
    const statMethod = await themedSelectInRoom({
      message: primaryColor(getTerm("defaultStats")),
      choices: [
        { name: getTerm("default"), value: "default" },
        { name: getTerm("custom"), value: "custom" },
      ],
    });

    charData.abilitiesList =
      Config.START_CHARACTER_ABILITIES[charData.class] ||
      Config.START_CHARACTER_ABILITIES["default"];

    if (statMethod === "default") {
      // Map class to default stats if available
      charData.abilities =
        Config.START_CHARACTER_STATS[charData.class] || charData.abilities;
    } else if (statMethod === "custom") {
      let pool = 20;
      console.log(secondaryColor(getTerm("pointPool") + ": " + pool));
      const stats: (
        | "maxhp"
        | "strength"
        | "mana"
        | "dexterity"
        | "charisma"
        | "luck"
      )[] = ["maxhp", "strength", "mana", "dexterity", "charisma", "luck"];
      for (const stat of stats) {
        const promptMsg = primaryColor(
          `${getTerm("appointPoints")} ${getTerm(stat)} (${getTerm(
            "pointsLeft"
          )}: ${pool})`
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

    if (charData.hp > charData.abilities.maxhp) {
      charData.hp = charData.abilities.maxhp;
    }

    // Get character origin
    totalClear();
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
    const startingItems = getStartingItems(charData.class);
    charData.inventory = startingItems.inventory;
    charData.equippedItems = startingItems.equipped;

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
    "IT IS REALLY IMPORTANT THAT YOU RESPOND IN " +
    getTerm(getLanguage()) +
    "\n" +
    "If the origin story is non existent or giberish do not create your own but explain it in your answer.";

  // Define validation function schema
  const functionsConfig = {
    functions: [
      {
        name: "validateOrigin",
        description:
          "Validate if a character origin is appropriate for a fantasy game",
        parameters: {
          type: "object",
          properties: {
            isValid: {
              type: "boolean",
              description: "Whether the origin story is valid",
            },
            reason: {
              type: "string",
              description:
                "If invalid, the reason why. Should be witty and brief. MUST BE IN " +
                getTerm(getLanguage()),
            },
          },
          required: ["isValid"],
        },
      },
    ],
    function_call: { name: "validateOrigin" },
  };

  const messages: ChatCompletionRequestMessage[] = [
    { role: "system", content: systemMessage },
    { role: "user", content: "'" + origin + "'" },
  ];

  try {
    const response = await generateChatNarrative(messages, {
      maxTokens: 80,
      temperature: 0.3,
      ...functionsConfig,
    });

    if (response.function_call?.arguments) {
      try {
        const result = JSON.parse(response.function_call.arguments);
        if (result.isValid) {
          return "Valid";
        } else {
          // Return in the same format you had before
          return `${getTerm("invalid")}: ${result.reason}`;
        }
      } catch (error) {
        log(
          "Create Character Menu: Error parsing function call arguments",
          "Error"
        );
        return "Valid"; // Fallback if JSON parsing fails
      }
    }

    // Fallback to text response if function calling fails
    if (response.content) {
      return response.content.trim();
    }

    return "Valid"; // Ultimate fallback XD
  } catch (err) {
    log("Create Character Menu: " + err, "Error");
    return "Valid"; // Fallback in case of AI service failure
  }
}
