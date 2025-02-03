import ICharacterData from "../types/ICharacterData.js";
import { saveCharacterData } from "../utilities/CharacterService.js";
import { input, select } from "@inquirer/prompts";
import { classChoices } from "../types/ClassChoices.js";
import { generateChatNarrative } from "../src/aiAssistant.js";
import { getStartingItems } from "../utilities/InventoryService.js";
import { getTerm, Language } from "../utilities/LanguageService.js";

async function validateOrigin(origin: string): Promise<string> {
  const systemMessage =
    "You are an expert storyteller and narrative validator for a Dungeons & Dragons adventure. " +
    "Evaluate the following character origin for plausibility and appropriateness in a realistic fantasy backstory. " +
    "If the origin is acceptable, respond with 'Valid'. Otherwise, provide a clarification request.";

  const messages = [
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

export async function createCharacterMenu(lang: Language): Promise<void> {
  try {
    const charData: ICharacterData = {
      name: "",
      class: "",
      origin: "",
      level: "1",
      xp: "0",
      hp: "10",
      abilities: {
        maxhp: "10",
        strength: "1",
        mana: "1",
        dexterity: "1",
        charisma: "1",
        luck: "1",
      },
      inventory: [],
      lastPlayed: "",
    };

    // Get character name
    charData.name = await input(
      { message: getTerm("namePrompt", lang) },
      { clearPromptOnDone: true }
    );
    if (charData.name.toLowerCase() === "exit") return;

    // Get character class
    charData.class = await select(
      {
        message: getTerm("classPrompt", lang),
        choices: classChoices,
      },
      { clearPromptOnDone: true }
    );

    // Get character origin
    let originInput = await input(
      { message: getTerm("originPrompt", lang) },
      { clearPromptOnDone: true }
    );
    if (originInput.toLowerCase() === "exit") return;

    // Validate origin
    let validationResponse = await validateOrigin(originInput);
    while (!validationResponse.toLowerCase().includes("valid")) {
      console.log(validationResponse);
      originInput = await input(
        {
          message: getTerm("originClarification", lang),
        },
        { clearPromptOnDone: true }
      );
      if (originInput.toLowerCase() === "exit") return;
      validationResponse = await validateOrigin(originInput);
    }
    charData.origin = originInput;

    // Set metadata
    charData.lastPlayed = new Date().toLocaleDateString();
    charData.inventory = getStartingItems(charData.class);

    // Save character
    await saveCharacterData(charData);

    console.log(getTerm("characterSuccess", lang));
    await input({ message: getTerm("backToMenu", lang) });
  } catch (error) {
    console.error("Error creating character:", error);
    await input({ message: getTerm("errorMessage", lang) });
  }
}
