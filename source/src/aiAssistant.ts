import { OpenAI } from "openai";
import dotenv from "dotenv";

export interface ChatCompletionRequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

class ChatGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatGenerationError";
  }
}

let isItConfigured = false;
let openai: OpenAI;

function ensureConfig() {
  if (!isItConfigured) {
    dotenv.config();
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY in environment variables");
    }
    openai = new OpenAI();
    isItConfigured = true;
  }
}

export interface GenerateTextOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * Generates narrative text using the Chat Completion API.
 *
 * @param messages - The conversation messages to send.
 * @param options - Optional parameters to customize the API call.
 * @returns A promise that resolves with the generated narrative.
 */
export async function generateChatNarrative(
  messages: ChatCompletionRequestMessage[],
  options?: GenerateTextOptions
): Promise<string> {
  ensureConfig();

  if (!messages?.length) {
    throw new ChatGenerationError("Messages array cannot be empty");
  }

  try {
    const response = await openai.chat.completions.create({
      model: options?.model || "gpt-3.5-turbo",
      messages,
      max_tokens: options?.maxTokens ?? 300,
      temperature: options?.temperature ?? 0.85,
      top_p: options?.topP ?? 1.0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new ChatGenerationError(
        "No valid response content received from OpenAI API"
      );
    }

    return content.trim();
  } catch (error) {
    if (error instanceof ChatGenerationError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ChatGenerationError(
        `Failed to generate chat narrative: ${error.message}`
      );
    }
    throw new ChatGenerationError(
      "An unknown error occurred while generating chat narrative"
    );
  }
}

/**
 * Generates an enemy based on the provided narrative and player character data.
 */
export async function generateEnemyFromNarrative(
  narrative: string,
  characterData: any
): Promise<{
  name: string;
  hp: number;
  attack: number;
  defense: number;
  xpReward: number;
}> {
  ensureConfig();
  const combatSection =
    narrative.split("COMBAT ENCOUNTER:")[1]?.split("\n")[0] || narrative;

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: `You are an enemy generator for a fantasy RPG. Create a balanced enemy based on player stats and narrative context.
      Player Stats:
      - Level: ${characterData.level}
      - HP: ${characterData.hp}/${characterData.abilities.maxhp}
      - Strength: ${characterData.abilities.strength}
      - Class: ${characterData.class}
      
      Balance Guidelines:
      - Enemy HP should be 50-150% of player's maxhp
      - Attack should be balanced against player's strength
      - Defense should be lower than player's strength to ensure damage is possible
      - XP reward should scale with enemy difficulty and player level
      
      Response must be in JSON format with fields:
      - name: string (based on narrative context)
      - hp: number (${Math.floor(
        Number(characterData.abilities.maxhp) * 0.5
      )}-${Math.floor(Number(characterData.abilities.maxhp) * 1.5)})
      - attack: number (${Math.max(
        1,
        Number(characterData.abilities.strength) - 2
      )}-${Number(characterData.abilities.strength) + 3})
      - defense: number (1-${Math.max(
        2,
        Number(characterData.abilities.strength) - 1
      )})
      - xpReward: number (${10 + Number(characterData.level) * 3}-${
        20 + Number(characterData.level) * 5
      })`,
    },
    {
      role: "user",
      content: `Combat Description: ${combatSection}\nGenerate an appropriate enemy that matches the narrative tone and provides a balanced challenge.`,
    },
  ];

  try {
    const response = await generateChatNarrative(messages, {
      temperature: 0.7,
      maxTokens: 150,
    });
    const enemy = JSON.parse(response);

    // Validate and adjust enemy stats if necessary
    return {
      name: enemy.name,
      hp: Math.min(
        Math.max(
          Math.floor(Number(characterData.abilities.maxhp) * 0.5),
          enemy.hp
        ),
        Math.floor(Number(characterData.abilities.maxhp) * 1.5)
      ),
      attack: Math.min(
        Math.max(
          Math.max(1, Number(characterData.abilities.strength) - 2),
          enemy.attack
        ),
        Number(characterData.abilities.strength) + 3
      ),
      defense: Math.min(
        Math.max(1, enemy.defense),
        Math.max(2, Number(characterData.abilities.strength) - 1)
      ),
      xpReward: Math.min(
        Math.max(10 + Number(characterData.level) * 3, enemy.xpReward),
        20 + Number(characterData.level) * 5
      ),
    };
  } catch (error) {
    // Fallback enemy with balanced stats based on player
    return {
      name: "Mysterious Creature",
      hp: Math.floor(Number(characterData.abilities.maxhp) * 0.75),
      attack: Math.max(1, Number(characterData.abilities.strength) - 1),
      defense: Math.max(
        1,
        Math.floor(Number(characterData.abilities.strength) / 2)
      ),
      xpReward: 15 + Number(characterData.level) * 4,
    };
  }
}
