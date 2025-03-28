/**
 * AIService - Core AI integration for D&D CLI application
 *
 * This service manages interactions with OpenAI's API to generate game narratives,
 * analyze player choices, create enemies, and enhance game instructions based on
 * the current game state. It handles API configuration, retries, error handling,
 * and content formatting.
 *
 */

import { OpenAI } from "openai";
import dotenv from "dotenv";
import ICharacter from "@utilities/ICharacter.js";
import { IGameState } from "@utilities/IGameState.js";
import { detectNarrativeLoop } from "@utilities/NarrativeService.js";
import { enforceStoryRequirements } from "@utilities/ObjectiveService.js";
import { sanitizeJsonString } from "@utilities/ConsoleService.js";
import { log } from "@utilities/LogService.js";

/**
 * Structure for chat completion messages sent to the API
 *
 * @interface ChatCompletionRequestMessage
 * @property {string} role - The role of the message author (system, user, assistant)
 * @property {string} content - The content of the message
 */
export interface ChatCompletionRequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Structure for function call results returned from the API
 *
 * @interface FunctionCallResult
 * @property {string} name - The name of the called function
 * @property {string} arguments - JSON string of arguments for the function
 */
export interface FunctionCallResult {
  name: string;
  arguments: string;
}

/**
 * Structure for chat completion responses from the API
 *
 * @interface ChatCompletionResponse
 * @property {string | null} content - The text response content (null if only function call)
 * @property {FunctionCallResult} [function_call] - Function call details if available
 */
export interface ChatCompletionResponse {
  content: string | null;
  function_call?: FunctionCallResult;
}

/**
 * Custom error class for chat generation failures
 * Provides better error identification and handling for AI-specific errors
 */
class ChatGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatGenerationError";
  }
}

/**
 * State variable tracking if OpenAI client has been configured
 */
let isItConfigured = false;

/**
 * OpenAI client instance
 */
let openai: OpenAI;

/**
 * Ensures that OpenAI API is properly configured before use
 * Loads environment variables and initializes the client
 *
 * @throws {Error} If OPENAI_API_KEY is missing from environment variables
 */
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

/**
 * Options for text generation API calls
 *
 * @interface GenerateTextOptions
 * @property {string} [model] - The AI model to use (defaults to gpt-4o)
 * @property {number} [maxTokens] - Maximum tokens in the response
 * @property {number} [temperature] - Randomness of response (0-1)
 * @property {number} [topP] - Nucleus sampling parameter (0-1)
 * @property {number} [maxRetries] - Maximum number of retry attempts
 * @property {number} [retryDelay] - Delay between retries in milliseconds
 * @property {Array<Object>} [functions] - Function definitions for structured outputs
 * @property {Object|string} [function_call] - Function call configuration
 */
export interface GenerateTextOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  maxRetries?: number;
  retryDelay?: number;
  functions?: Array<{
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  }>;
  function_call?: { name: string } | "auto" | "none";
}

/**
 * Generates narrative text using OpenAI's Chat Completion API
 *
 * Features:
 * - Handles automatic retries for network/API issues
 * - Supports function calling for structured outputs
 * - Configurable temperature and token limits
 * - Error handling with meaningful messages
 *
 * Retry strategy:
 * - Automatically retries on network issues, timeouts, and rate limits
 * - Implements exponential backoff (delay increases with each attempt)
 * - Distinguishes between retriable and non-retriable errors
 *
 * @param {ChatCompletionRequestMessage[]} messages - Array of conversation messages for context
 * @param {GenerateTextOptions} [options] - Configuration options for the API call
 * @returns {Promise<ChatCompletionResponse>} Promise resolving to the AI-generated response
 * @throws {ChatGenerationError} on generation failure after retries or non-retriable errors
 *
 * @example
 * // Basic narrative generation
 * const response = await generateChatNarrative([
 *   { role: "system", content: "You are a storyteller." },
 *   { role: "user", content: "Tell me about a hero's journey." }
 * ]);
 *
 * // With function calling
 * const response = await generateChatNarrative(messages, {
 *   functions: [{ name: "createCharacter", parameters: {...} }],
 *   function_call: { name: "createCharacter" }
 * });
 */
export async function generateChatNarrative(
  messages: ChatCompletionRequestMessage[],
  options?: GenerateTextOptions
): Promise<ChatCompletionResponse> {
  ensureConfig();

  if (!messages?.length) {
    throw new ChatGenerationError("Messages array cannot be empty");
  }

  // Setup retry configuration
  const maxRetries = options?.maxRetries || 3;
  const retryDelay = options?.retryDelay || 1000; // ms
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // Prepare API request parameters
      const requestParams: any = {
        model: options?.model || "gpt-4o",
        messages,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.85,
        top_p: options?.topP ?? 0.7,
      };

      // Add function calling parameters if provided
      if (options?.functions) {
        requestParams.functions = options.functions;
      }
      if (options?.function_call) {
        requestParams.function_call = options.function_call;
      }

      // Make API call
      const response = await openai.chat.completions.create(requestParams);

      const messageResponse = response.choices[0]?.message;

      // Return structured response with content and function_call if available
      return {
        content: messageResponse?.content ?? null,
        function_call: messageResponse?.function_call
          ? {
              name: messageResponse.function_call.name,
              arguments: messageResponse.function_call.arguments,
            }
          : undefined,
      };
    } catch (error) {
      attempt++;

      // Check if this is a retriable error (network issues typically)
      const isRetriable =
        error instanceof Error &&
        (error.message.includes("network") ||
          error.message.includes("timeout") ||
          error.message.includes("rate limit") ||
          error.message.includes("429") ||
          error.message.includes("500") ||
          error.message.includes("503"));

      // If it's our last attempt or not retriable, throw the error
      if (attempt > maxRetries || !isRetriable) {
        if (error instanceof ChatGenerationError) {
          throw error;
        }
        if (error instanceof Error) {
          log(
            `Failed to generate chat narrative after ${attempt} attempts: ${error.message}`,
            "Error"
          );
          throw new ChatGenerationError(
            `Failed to generate chat narrative: ${error.message}`
          );
        }
        throw new ChatGenerationError(
          "An unknown error occurred while generating chat narrative"
        );
      }

      // Log retry attempt
      log(
        `Attempt ${attempt}/${maxRetries} failed, retrying in ${retryDelay}ms: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "Warn "
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
    }
  }

  // This should never be reached due to the throw in the catch block on the last attempt
  throw new ChatGenerationError("Failed to generate narrative after retries");
}

/**
 * Generates a balanced enemy based on narrative context and player stats
 *
 * Uses structured function calling to ensure enemy stats are appropriate
 * for the player's level. Includes fallback logic if generation fails.
 *
 * Generation logic:
 * 1. Extracts combat context from narrative
 * 2. Sends request with function calling to create balanced enemy
 * 3. Validates and adjusts stats to ensure balanced gameplay:
 *    - HP: 50-150% of player's max HP
 *    - Attack: Balanced against player's strength
 *    - Defense: Lower than player's strength to ensure damage is possible
 *    - XP: Scales with enemy difficulty and player level
 * 4. Falls back to default enemy if generation fails
 *
 * @param {string} narrative - The current game narrative containing combat context
 * @param {ICharacter} characterData - Player character data for balancing
 * @returns {Promise<Object>} Promise resolving to enemy stats object
 *
 * @example
 * const enemy = await generateEnemyFromNarrative(
 *   "COMBAT ENCOUNTER: A massive troll emerges from the cave",
 *   playerCharacter
 * );
 * console.log(`You encounter a ${enemy.name} with ${enemy.hp} HP!`);
 */
export async function generateEnemyFromNarrative(
  narrative: string,
  characterData: ICharacter
): Promise<{
  name: string;
  hp: number;
  maxhp: number;
  attack: number;
  defense: number;
  xpReward: number;
}> {
  ensureConfig();
  const combatSection =
    narrative.split("COMBAT ENCOUNTER:")[1]?.split("\n")[0] || narrative;

  // Define function schema for enemy generation
  const enemyGenerationFunction = {
    name: "generateEnemy",
    description:
      "Generate a balanced enemy for combat based on player stats and narrative context",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Enemy name based on narrative context",
        },
        hp: {
          type: "integer",
          description: `Enemy HP between ${Math.floor(
            Number(characterData.abilities.maxhp) * 0.5
          )}-${Math.floor(Number(characterData.abilities.maxhp) * 1.5)}`,
        },
        attack: {
          type: "integer",
          description: `Attack value between ${Math.max(
            1,
            Number(characterData.abilities.strength) - 2
          )}-${Number(characterData.abilities.strength) + 3}`,
        },
        defense: {
          type: "integer",
          description: `Defense value between 1-${Math.max(
            2,
            Number(characterData.abilities.strength) - 1
          )}`,
        },
        xpReward: {
          type: "integer",
          description: `XP reward between ${
            10 + Number(characterData.level) * 3
          }-${20 + Number(characterData.level) * 5}`,
        },
      },
      required: ["name", "hp", "attack", "defense", "xpReward"],
    },
  };

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
      - XP reward should scale with enemy difficulty and player level`,
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
      functions: [enemyGenerationFunction],
      function_call: { name: "generateEnemy" },
    });

    let enemy;

    // Try to get enemy data from function call result first
    if (response.function_call && response.function_call.arguments) {
      enemy = JSON.parse(response.function_call.arguments);
    }
    // Fall back to parsing content if function call is not available
    else if (response.content) {
      enemy = JSON.parse(sanitizeJsonString(response.content));
    }
    // Default enemy if parsing fails
    else {
      throw new Error("Failed to generate enemy data");
    }

    const hp = Math.min(
      Math.max(
        Math.floor(Number(characterData.abilities.maxhp) * 0.5),
        enemy.hp
      ),
      Math.floor(Number(characterData.abilities.maxhp) * 1.5)
    );

    // Validate and adjust enemy stats if necessary
    return {
      name: enemy.name,
      hp: hp,
      maxhp: hp,
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
    log(`Failed to generate enemy: ${error}`, "Error");
    const hp = Math.floor(Number(characterData.abilities.maxhp) * 0.75);

    // Fallback enemy with balanced stats based on player
    return {
      name: "Mysterious Creature",
      hp: hp,
      maxhp: hp,
      attack: Math.max(1, Number(characterData.abilities.strength) - 1),
      defense: Math.max(
        1,
        Math.floor(Number(characterData.abilities.strength) / 2)
      ),
      xpReward: 15 + Number(characterData.level) * 4,
    };
  }
}

/**
 * Base instructions for the AI game master
 *
 * These instructions define the core behavior of the AI as a Dungeon Master,
 * including guidelines for:
 * - World building and narrative structure
 * - Storytelling pacing across different narrative phases
 * - Combat and special encounter handling
 * - Player action parsing and formatting
 * - Story completion requirements
 *
 * The instructions use specific formatting markers like "COMBAT ENCOUNTER:",
 * "CHOICES:", etc. to structure the AI's responses for easier parsing.
 */
export const existingInstructions = `
Act as the Dungeon Master for an immersive, book-like AD&D 2nd Edition game. You are to strictly follow the AD&D 2nd Edition ruleset for all mechanics—including character progression, combat, dice rolls, experience, and currency management. You must never break character, make decisions for the player, or refer to yourself in any way. All in-game actions that require dice rolls must be initiated by the player using curly braces {like this}.

General Guidelines:

World Building & Narrative:
- Randomly generate the setting, theme, place, current year, and cultural/historical context for the adventure.
- Provide detailed, immersive descriptions that include at least three sentences per location. Descriptions must mention the time of day, weather, natural environment, notable landmarks, and any relevant historical or cultural details.
- For dungeon sequences or special encounters, start with "START DUNGEON:" and transition seamlessly into the next scene after the encounter.
- Follow proper narrative structure with clear rising action, climax, and resolution.
- Do not rush story progression - ensure adequate character development and world-building.

Storytelling Pacing:
- Introduction phase: Focus on world-building, establishing characters, and presenting initial small challenges.
- Rising Action phase: Escalate challenges, introduce complications, and develop relationships.
- Climax phase: Present major confrontations, create high stakes, and reveal important information.
- Falling Action phase: Show consequences of the climax and begin resolving plot threads.
- Resolution phase: Provide closure to story arcs and resolve character relationships.
- IMPORTANT: DO NOT skip phases or rush through them - each requires multiple narrative exchanges.

Combat & Special Encounters:
- When a combat situation arises, begin your narrative with "COMBAT ENCOUNTER:".
- When the player enters a dungeon start with "START DUNGEON:"
- Do not provide in-game choices during combat or dungeon encounters.
- Ensure at least one meaningful combat encounter during the Rising Action phase.
- Include a significant "boss" encounter during the Climax phase.

Player Actions & In-Game Syntax:
- The player's in-game actions must be enclosed in curly braces {like this}.
- In-character dialogue must be enclosed in quotation marks "like this".
- Out-of-character instructions will be provided in angle brackets <like this>.
- For non-combat scenes, always end your response with a "CHOICES:" section that contains exactly three numbered choices enclosed in curly braces, like this:
  CHOICES:
  1.{Search the area}
  2.{Talk to the local}
  3.{Continue along the path}
- This format is critical: the word CHOICES: on its own line, it should only be the word CHOICES:,nothing more and nothing less, followed by exactly three numbered options.
- Each choice must start with a number, followed by period, then curly braces with no spaces.
- NEVER include choice options directly in your narrative text - they must ONLY appear after the CHOICES: marker.
- Ensure choices are substantive and progress the narrative.
-I REPEAT, ENSURE THE FORMAT IS CORRECT, THE WORD CHOICES: ON ITS OWN LINE, FOLLOWED BY EXACTLY THREE NUMBERED OPTIONS, EACH STARTING WITH A NUMBER, FOLLOWED BY A PERIOD, THEN CURLY BRACES WITH NO SPACES 1.{Choice description}.

Story Completion Guidelines:
- DO NOT end the story prematurely. A complete story must progress through all narrative phases.
- The main quest should only be fully resolved in the Resolution phase.
- Ensure all major plot threads are addressed before concluding the story.
- Only use "THE END" when the story has properly concluded after meaningful progression.
`;

/**
 * Generates character-specific introduction prompt for the AI
 *
 * Creates a formatted character sheet prompt containing:
 * - Character name, origin, and class
 * - Current stats and abilities
 * - XP and currency
 * - Inventory items
 *
 * This prompt is used to provide the AI with necessary context about
 * the player character for narrative generation.
 *
 * @param {any} characterData - Player character information
 * @returns {string} Formatted character intro prompt string
 *
 * @example
 * const characterPrompt = generateCharacterIntroPrompt(player);
 * const initialMessages = [
 *   { role: "system", content: "You are a Dungeon Master." },
 *   { role: "user", content: characterPrompt + "\nStart our adventure." }
 * ];
 */
export function generateCharacterIntroPrompt(characterData: any): string {
  return `
Character Sheet:
Name: ${characterData.name}
Origin: ${characterData.origin}
Level & Class: ${characterData.level} ${characterData.class}
Stats: HP ${characterData.hp}/${characterData.abilities.maxhp}, STR ${
    characterData.abilities.strength
  }, MANA ${characterData.abilities.mana}, DEX ${
    characterData.abilities.dexterity
  }, CHA ${characterData.abilities.charisma}, LUCK ${
    characterData.abilities.luck
  }
XP: ${characterData.xp} 
Currency: ${characterData.currency}
Inventory: ${characterData.inventory
    .map(
      (item: { name: string; quantity: number }) =>
        `${item.name} (x${item.quantity})`
    )
    .join(", ")}
  `;
}

/**
 * Analyzes player choices to update character traits and relationships
 *
 * This function serves as the "personality engine" of the game by:
 * - Identifying personality traits from choices (brave, cautious, etc.)
 * - Tracking relationship changes with NPCs
 * - Identifying thematic elements in the story
 *
 * The analysis results are used to:
 * 1. Build character personality over time (traits accrue with similar choices)
 * 2. Adjust NPC relationship status (friendly, neutral, hostile)
 * 3. Track story themes for narrative consistency
 *
 * Relationship values are scaled from 1-10 where:
 * - 1-3: Hostile relationship
 * - 4-6: Neutral relationship
 * - 7-10: Friendly relationship
 *
 * @param {string} choice - The player's chosen action text
 * @param {IGameState} gameState - Current game state to update
 * @returns {Promise<void>} Promise that resolves when analysis is complete
 *
 * @example
 * await analyzePlayerChoice("{Search the abandoned temple}", gameState);
 * // This might add "curious" trait and "exploration" theme to character
 */
export async function analyzePlayerChoice(
  choice: string,
  gameState: IGameState
): Promise<void> {
  // Define function for choice analysis
  const analysisFunction = {
    name: "analyzePlayerChoice",
    description:
      "Analyze player choice to determine traits, relationships and themes",
    parameters: {
      type: "object",
      properties: {
        traits: {
          type: "object",
          description:
            "Character traits affected by this choice, with values from -2 to 2",
          additionalProperties: { type: "number" },
        },
        relationships: {
          type: "object",
          description:
            "Character relationships affected by this choice, with values from -2 to 2",
          additionalProperties: { type: "number" },
        },
        themes: {
          type: "array",
          description: "Thematic elements present in this choice",
          items: { type: "string" },
        },
      },
      required: ["traits", "themes"],
    },
  };

  try {
    const response = await generateChatNarrative(
      [
        {
          role: "system",
          content: `Analyze this player choice and determine what it reveals about 
          the character's traits and relationships. Answer in JSON format with:
          {
            "traits": {"trait1": -2 to 2, "trait2": -2 to 2},
            "relationships": {"character1": -2 to 2, "character2": -2 to 2},
            "themes": ["theme1", "theme2"]
          }
          Do NOT use + signs before positive numbers as this breaks JSON parsing.
          Keep the response concise with 1-3 traits, 0-2 relationships, and 1-2 themes.`,
        },
        {
          role: "user",
          content: choice,
        },
      ],
      {
        maxTokens: 150,
        temperature: 0.4,
        functions: [analysisFunction],
        function_call: { name: "analyzePlayerChoice" },
      }
    );

    let result;

    // Try to get analysis from function call first
    if (response.function_call && response.function_call.arguments) {
      result = JSON.parse(response.function_call.arguments);
    }
    // Fall back to content parsing if function call isn't available
    else if (response.content) {
      const sanitizedAnalysis = sanitizeJsonString(response.content);
      result = JSON.parse(sanitizedAnalysis);
    } else {
      // If neither is available, exit silently
      return;
    }

    // Update character traits based on choice
    if (result.traits) {
      Object.entries(result.traits).forEach(([trait, value]) => {
        gameState.updateCharacterTrait(trait, Number(value));
      });
    }

    // Track thematic elements
    if (result.themes) {
      result.themes.forEach((theme: string) => {
        gameState.addTheme(theme);
      });
    }

    // Update relationships if present
    if (result.relationships) {
      Object.entries(result.relationships).forEach(([character, value]) => {
        // Get current relationship status or default to neutral
        const existing = gameState
          .getImportantCharacters()
          .find(
            (c: { name: string; relationship: string }) =>
              c.name.toLowerCase() === character.toLowerCase()
          );

        const currentValue = existing
          ? existing.relationship === "friendly"
            ? 7
            : existing.relationship === "hostile"
            ? 3
            : 5
          : 5;

        // Determine new relationship value and string
        const newValue = Math.max(
          1,
          Math.min(10, currentValue + Number(value))
        );
        let relationshipStr = "neutral";
        if (newValue > 6) relationshipStr = "friendly";
        if (newValue < 4) relationshipStr = "hostile";

        // Update character
        gameState.addOrUpdateCharacter(character, {
          relationship: relationshipStr,
          importance: existing ? undefined : 6, // Default importance if new
          lastSeen: "current scene",
        });
      });
    }
  } catch (e) {
    // Handle parsing error silently - don't break game flow
    log(`Failed to analyze player choice: ${e}`, "Error");
  }
}

/**
 * Summarizes important game events and state for AI context
 *
 * Creates a concise summary of:
 * - Recent narrative events (last 3)
 * - Key NPCs and their relationships
 * - Character personality traits
 * - Story themes and objectives
 *
 * This summary helps maintain narrative coherence between AI responses
 * by providing essential context without exceeding token limits.
 *
 * @param {IGameState} gameState - Current game state to summarize
 * @returns {string} Formatted summary string
 *
 * @example
 * const memorySummary = summarizeImportantEvents(gameState);
 * messages.push({ role: "system", content: memorySummary });
 */
export function summarizeImportantEvents(gameState: IGameState): string {
  // Get recent narratives (last 3)
  const recentNarratives = gameState
    .getNarrativeHistory()
    .slice(-3)
    .map((narrative) =>
      narrative.length > 300 ? narrative.substring(0, 300) + "..." : narrative
    )
    .join("\n");

  // Get important characters
  const importantCharacters = gameState
    .getImportantCharacters()
    .map(
      (c: { name: string; relationship: string; lastSeen?: string }) =>
        `${c.name} (${c.relationship}): Last seen ${c.lastSeen || "recently"}`
    )
    .join("\n");

  // Get character traits
  const characterTraits = gameState
    .getCharacterTraits()
    .filter((t: { level: number }) => t.level > 6)
    .map((t: { name: string; level: number }) => `${t.name} (Level ${t.level})`)
    .join(", ");

  // Get themes
  const themes = gameState.getThemes().join(", ");

  return `
RECENT EVENTS:
${recentNarratives || "No significant recent events."}

KEY CHARACTERS:
${importantCharacters || "No key characters established yet."}

CHARACTER TRAITS:
${characterTraits || "No strong character traits established yet."}

STORY THEMES:
${themes || "No established themes yet."}

CURRENT OBJECTIVES:
${
  gameState.getCurrentChapter().pendingObjectives.join(", ") ||
  "No active objectives."
}
`;
}

/**
 * Enhances base AI instructions based on current narrative needs
 *
 * This function adapts the AI's behavior based on:
 * - Current story arc (introduction, rising-action, climax, etc.)
 * - Story requirements and completion status
 * - Narrative loop detection to prevent repetitive content
 *
 * Each narrative phase gets specific guidance to ensure proper
 * storytelling structure and pacing throughout the game.
 *
 * Visualization:
 * [Introduction] → [Rising Action] → [Climax] → [Falling Action] → [Resolution]
 * Each phase has specific requirements that this function enforces.
 *
 * @param {IGameState} gameState - Current game state
 * @returns {string} Enhanced instruction string for AI
 *
 * @example
 * const instructions = getEnhancedAIInstructions(gameState);
 * messages.unshift({ role: "system", content: instructions });
 */
export function getEnhancedAIInstructions(gameState: IGameState): string {
  const currentArc = gameState.getCurrentChapter().arc;
  const { canResolveQuest, requiredElementsMissing } =
    enforceStoryRequirements(gameState);

  // Base instructions
  let enhancedInstructions = existingInstructions;

  // Add pacing guidance
  enhancedInstructions += `\nCurrent Narrative Phase: ${currentArc.toUpperCase()}\n`;

  // Enforce minimum story requirements
  if (!canResolveQuest) {
    enhancedInstructions += `\nIMPORTANT: The story is not ready for resolution yet. Required elements missing: ${requiredElementsMissing.join(
      ", "
    )}.\n`;
  }

  // Add specific instructions by arc
  switch (currentArc) {
    case "introduction":
      enhancedInstructions += `
      For this INTRODUCTION phase:
      - Focus on world-building and establishing the setting
      - Introduce key NPCs that will be relevant later
      - Present initial small challenges to build character
      - DO NOT resolve any major plot elements yet
      `;
      break;
    case "rising-action":
      enhancedInstructions += `
      For this RISING ACTION phase:
      - Escalate challenges and stakes
      - Introduce complications to the main quest
      - If no combat has occurred yet, create a compelling combat encounter
      - Develop relationships with key NPCs
      - DO NOT resolve the main quest yet
      `;
      break;
    case "climax":
      enhancedInstructions += `
      For this CLIMAX phase:
      - Present a major challenge or confrontation
      - Include a significant combat encounter if none has occurred yet
      - Create high stakes and tension
      - Reveal important information or twists
      - Allow for meaningful character decisions
      `;
      break;
    case "falling-action":
      enhancedInstructions += `
      For this FALLING ACTION phase:
      - Show immediate consequences of the climax
      - Begin resolving major plot threads
      - Allow character reflection
      - Set up the final resolution
      `;
      break;
    case "resolution":
      enhancedInstructions += `
      For this RESOLUTION phase:
      - Provide closure to story arcs
      - Resolve remaining character relationships
      - Reflect on the journey and growth
      - Only now may you conclude the main quest fully
      - Hint at potential future adventures
      `;
      break;
  }

  // Add anti-loop protection
  if (detectNarrativeLoop(gameState)) {
    enhancedInstructions += `
    IMPORTANT: The narrative appears to be in a repetitive loop. Please:
    - Change the scene significantly in your next response
    - Introduce a new character, location, or event
    - Progress the main plot with new information
    - DO NOT repeat similar options or scenarios
    `;
  }

  return enhancedInstructions;
}

/**
 * Provides access to the configured OpenAI client
 *
 * Ensures the OpenAI client is properly configured before returning it,
 * allowing other modules to make direct API calls if needed.
 *
 * @returns {OpenAI} The configured OpenAI client instance
 * @throws {Error} If OpenAI API is not configured properly
 *
 * @example
 * // For advanced use cases requiring direct API access
 * const openaiClient = getOpenAI();
 * const models = await openaiClient.models.list();
 */
export function getOpenAI(): OpenAI {
  ensureConfig();
  return openai;
}
