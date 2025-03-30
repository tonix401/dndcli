/**
 * Campaign Service - Main campaign loop and startup routines for the D&D CLI application.
 *
 * This module handles the core game loop including campaign initialization,
 * narrative generation, combat, objectives tracking, shop encounters, and player interactions.
 * It integrates various services such as AI narrative generation, dice rolling, inventory management,
 * and persistent game state saving/loading.
 *
 */

import chalk from "chalk";
import ora from "ora";
import { getTerm } from "@utilities/LanguageService.js";
import {
  AI,
  ArtService,
  Cache,
  Choice,
  Console,
  Equipment,
  EventHandlerService,
  GameStateService,
  Inventory,
  Language,
  Log,
  NarrativeDisplay,
  NarrativeService,
  Objective,
  SaveLoad,
  Storage,
} from "@utilities/Services.js";
import { IGameState } from "@utilities/IGameState.js";
import Config, { StoryPaceOptionsKey } from "@utilities/Config.js";
import { ChatCompletionRequestMessage } from "@utilities/AIService.js";
import { themedSelectInRoom } from "components/GeneralTEMP/ThemedSelectInRoom.js";

// Re-export StoryPaceKey for external usage
export type StoryPaceKey = StoryPaceOptionsKey;

/**
 * Story pace options available from the configuration.
 */
export const STORY_PACE = Config.STORY_PACE_OPTIONS;

/**
 * Main campaign loop that drives the game narrative.
 *
 * This function loads any saved game state, initializes character inventory if needed,
 * generates introductory narrative content, processes player choices, triggers combat,
 * manages chapter progression, and handles shop and dungeon encounters.
 *
 * @param {IGameState} gameState - The current game state instance.
 * @param {any} characterData - The player character's data.
 * @param {string} introArt - Optional ASCII art to display in introduction
 * @returns {Promise<void>} A promise that resolves when the campaign loop exits.
 *
 * @example
 * await campaignLoop(gameState, characterData);
 */
export async function campaignLoop(
  gameState: IGameState,
  characterData: any,
  introArt: string = ""
): Promise<void> {
  try {
    // Load saved state if available.
    const loadedState = await SaveLoad.loadGameState();
    if (loadedState) {
      Object.assign(gameState, loadedState);
      console.log(
        chalk
          .hex(Cache.getTheme().accentColor)
          .bold(getTerm("loadedSavedCampaignState"))
      );

      // Get both recap text and ASCII art for the recap book display
      const recapText = await ArtService.generateGameRecap(gameState);
      let recapArt = "";

      // Try to get a thematic ASCII art for the recap based on chapter/class
      try {
        if (gameState.getCurrentChapter()?.arc) {
          // Get art based on current story arc
          const arcMap: Record<string, string> = {
            introduction: "scroll.txt",
            quest: "map.txt",
            journey: "castle.txt",
            confrontation: "sword.txt",
            resolution: "crown.txt",
            // Add more as needed
          };

          const artFile =
            arcMap[gameState.getCurrentChapter().arc] || "book.txt";
          recapArt = await NarrativeDisplay.getAsciiArtContent(artFile);
        }
      } catch (error) {
        Log.log(
          `Non-critical: Failed to load recap ASCII art: ${error}`,
          "Info "
        );
      }

      // Display recap with the ASCII art embedded in the book
      await NarrativeDisplay.displayRecapInBookFormat(recapText, {
        title: getTerm("yourAdventureSoFar"),
        clearConsole: true,
        asciiArt: recapArt,
      });
    }

    // Ensure the character's inventory is initialized.
    if (
      !Array.isArray(characterData.inventory) ||
      characterData.inventory.length === 0
    ) {
      characterData.inventory = Inventory.getStartingItems(characterData.class);
    }

    // Calculate effective character stats including equipped bonuses.
    const equipBonuses = Equipment.getEquippedStatBonuses(characterData);
    const effectiveStats = {
      maxhp: characterData.abilities.maxhp + (equipBonuses.maxhp || 0),
      strength: characterData.abilities.strength + (equipBonuses.strength || 0),
      mana: characterData.abilities.mana + (equipBonuses.mana || 0),
      dexterity:
        characterData.abilities.dexterity + (equipBonuses.dexterity || 0),
      charisma: characterData.abilities.charisma + (equipBonuses.charisma || 0),
      luck: characterData.abilities.luck + (equipBonuses.luck || 0),
    };

    // Start with an introduction if no narrative exists.
    if (gameState.getNarrativeHistory().length === 0) {
      // For new games, combine the intro ASCII art with class-specific art if available
      let classArt = "";
      try {
        classArt = await ArtService.getIntroAsciiArt(characterData.class);
      } catch (error) {
        Log.log(`Failed to load class ASCII art: ${error}`, "Warn ");
      }

      // Use the intro art passed from startCampaign if available, otherwise use class art
      const combinedArt = introArt || classArt;

      // Generate introductory narrative via AI service.
      const spinner = ora({
        text: chalk.hex(Cache.getTheme().accentColor)(
          getTerm("generatingIntroduction")
        ),
        spinner: "dots",
      }).start();

      let introResponse;
      try {
        introResponse = await AI.generateChatNarrative(
          [
            {
              role: "system",
              content: `
Act as the Dungeon Master for an immersive, book-like AD&D 2nd Edition game. You are to strictly follow the AD&D 2nd Edition ruleset for all mechanics—including character progression, combat, dice rolls, experience, and currency management. You must never break character, make decisions for the player, or refer to yourself in any way. All in-game actions that require dice rolls must be initiated by the player using curly braces {like this}.

General Guidelines:

World Building & Narrative:
- Randomly generate the setting, theme, place, current year, and cultural/historical context for the adventure.
- Provide detailed, immersive descriptions that include at least three sentences per location. Descriptions must mention the time of day, weather, natural environment, notable landmarks, and any relevant historical or cultural details.
- For dungeon sequences or special encounters, start with "START DUNGEON:" and transition seamlessly into the next scene after the encounter.

Combat & Special Encounters:
- When a combat situation arises, begin your narrative with "COMBAT ENCOUNTER:".
- When the player enters a dungeon start with "START DUNGEON:"
- Do not provide in-game choices during combat or dungeon encounters.

Player Actions & In-Game Syntax:
- The player's in-game actions must be enclosed in curly braces {like this}. Only perform dice rolls or game mechanics when the player uses the correct syntax.
- In-character dialogue must be enclosed in quotation marks "like this".
- Out-of-character instructions will be provided in angle brackets <like this>.
- For non-combat scenes, always end with exactly three numbered choices enclosed in curly braces (e.g.,
  1.{Search the area}
  2.{Talk to the local}
  3.{Return to main menu}) to indicate the next available actions.

Character Sheet & Tracking:
- At the very start of the game, output the full character sheet, including:
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
  XP: ${characterData.xp} (displayed as "XP: current/next", e.g., "0/100")
  Currency: ${
    characterData.currency
  } (generate the entire currency system with prices for all transactions strictly according to AD&D 2e)
  Inventory: ${characterData.inventory
    .map(
      (item: { name: string; quantity: number }) =>
        `${item.name} (x${item.quantity})`
    )
    .join(", ")}
- Always update and display the character sheet after each narrative response, including any changes from events, combat, or transactions.

Rules & Mechanics:
- Strictly adhere to AD&D 2e rules for all events, combat, and skill checks.
- When an action requiring a dice roll is not correctly enclosed in curly braces by the player, do not perform the roll or process the action.
- Reward the player with experience, currency, and track their progression as dictated by the AD&D 2e ruleset.
- Ensure that the player is allowed to defeat any NPC if they are capable, without making choices on their behalf.

Response Structure:
- Begin by outputting the full character sheet and an introductory narrative that sets the scene.
- In non-combat scenes, conclude with exactly three numbered in-game choices (using curly braces) for what the player can do next.
- For combat or dungeon sequences, follow the special encounter formatting instructions (i.e., "COMBAT ENCOUNTER:" or "START DUNGEON:") and transition smoothly between scenes once the encounter concludes.
- Please respond in clear, concise ${Language.getTerm(
                Cache.getLanguage()
              )} and STICK TO THIS LANGUAGE.

Starting Instructions:
- Begin the session by displaying the full character sheet as described above, followed by an introductory narrative that establishes the initial location, setting, and context for the adventure. Make sure to have the introductory narrative as detailed as possible to help with the initial world building that comes with the story and origin of the character.
- Wait for the player to provide their first in-game command using the correct syntax.
          `,
            } as ChatCompletionRequestMessage,
          ],
          {
            maxTokens: 2048,
            temperature: 0.8,
            ...Config.NARRATIVE_GENERATION_SCHEMA,
          }
        );

        spinner.succeed(
          chalk.hex(Cache.getTheme().accentColor)(getTerm("introductionReady"))
        );
      } catch (error) {
        spinner.fail(
          chalk.hex(Cache.getTheme().errorColor)(
            getTerm("failedToGenerateIntro")
          )
        );
        Log.log(`Failed to generate introduction: ${error}`, "Error");
        throw error;
      }

      let introNarrative = "";
      let choices = [];

      // Process response based on whether function calling was used.
      if (introResponse.function_call?.arguments) {
        try {
          const args = JSON.parse(introResponse.function_call.arguments);
          introNarrative = args.narrative;
          choices = args.choices
            .map((choice: string, index: number) => `${index + 1}.{${choice}}`)
            .join("\n");
        } catch (e) {
          Log.log(`Error parsing intro function arguments: ${e}`, "Error");
          // Fall back to using the content property if parsing fails.
          introNarrative = introResponse.content || "";
        }
      } else {
        // Use traditional content approach if function calling is not available.
        introNarrative = introResponse.content || "";
      }

      // Append CHOICES: marker if missing.
      if (!introNarrative.includes("CHOICES:") && choices.length > 0) {
        introNarrative += "\n\nCHOICES:\n" + choices;
      }

      // Split narrative text and choices.
      const narrativeParts = introNarrative.split("CHOICES:");
      const storyText = narrativeParts[0].trim();

      // Now we include the ASCII art directly in the book display
      await NarrativeDisplay.displayTextInBookFormat(storyText, {
        title: getTerm("introduction"),
        clearConsole: true,
        pageSize: 15,
        asciiArt: combinedArt,
      });
      const initialChoice = await Choice.promptForChoice(
        introNarrative,
        true,
        characterData,
        gameState
      );
      if (
        initialChoice.toLowerCase().includes("return to main menu") ||
        initialChoice.toLowerCase() === "exit"
      ) {
        console.log(Console.secondaryColor(getTerm("returningToMainMenu")));
        return;
      }
      gameState.addNarrative(introNarrative);
      gameState.addConversation({
        role: "user",
        content: `Player choice: ${initialChoice}`,
      });

      // Extract potential objectives from the introductory narrative.
      await Objective.extractInitialObjectives(introNarrative, gameState);

      await SaveLoad.saveGameState(gameState);
    }
  } catch (error) {
    Log.log(
      `Campaign loop initial setup error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
    console.log(Console.secondaryColor(getTerm("campaignLoopError")));
    // Attempt to save game state before returning.
    try {
      await SaveLoad.saveGameState(gameState);
    } catch (saveError) {
      Log.log(
        `Failed to save game state: ${
          saveError instanceof Error ? saveError.message : String(saveError)
        }`,
        "Error"
      );
    }
    return; // Prevent further execution.
  }

  // Main narrative loop.
  while (true) {
    try {
      // Remove any stale objectives.
      Objective.pruneStaleObjectives(gameState);

      // Check if conditions are met to advance to a new chapter.
      await GameStateService.checkAndHandleChapterProgression(gameState);

      // Update plot stage if needed
      GameStateService.updatePlotStageIfNeeded(gameState);

      // Create base message for narrative generation
      // In the main campaign loop, where it creates the base narrative message

      const baseScenarioMessage =
        NarrativeService.createBaseNarrativeMessage(gameState);

      const currentLanguage = Cache.getLanguage();
      const languageNames: Record<string, string> = {
        en: "English",
        de: "German",
        ch: "Swiss German",
      };
      const languageName = languageNames[currentLanguage] || "English";

      let updatedContent = baseScenarioMessage.content;
      if (typeof updatedContent === "string") {
        if (updatedContent.includes("STICK TO THIS LANGUAGE")) {
          updatedContent = updatedContent.replace(
            /respond in clear, concise .* and STICK TO THIS LANGUAGE/,
            `respond in clear, concise ${languageName} and STICK TO THIS LANGUAGE`
          );
        } else {
          updatedContent += `\n- IMPORTANT: Please respond in ${languageName} regardless of previous conversation language.`;
        }
      }
      const updatedBaseMessage: ChatCompletionRequestMessage = {
        role: "system",
        content: updatedContent,
      };

      const messages: ChatCompletionRequestMessage[] = [
        updatedBaseMessage,
        ...gameState
          .getConversationHistory()
          .slice(-9)
          .map((msg): ChatCompletionRequestMessage => {
            const role =
              msg.role === "system" ||
              msg.role === "user" ||
              msg.role === "assistant"
                ? msg.role
                : "user";

            return {
              role: role,
              content: msg.content,
            };
          }),
      ];

      // Generate the next scene narrative
      const spinner = ora({
        text: chalk.hex(Cache.getTheme().accentColor)(getTerm("weavingStory")),
        spinner: "dots",
      }).start();

      let narrative, specialEvent;

      try {
        const result = await NarrativeService.generateNextSceneNarrative(
          gameState,
          messages
        );
        narrative = result.narrative;
        specialEvent = result.specialEvent;
        spinner.succeed(
          chalk.hex(Cache.getTheme().accentColor)(getTerm("storyReady"))
        );
      } catch (error) {
        spinner.fail(
          chalk.hex(Cache.getTheme().errorColor)(getTerm("storytellingIssue"))
        );
        throw error;
      }

      // Ensure narrative continuity (prevent premature endings)
      const continuitySpinner = ora({
        text: chalk.hex(Cache.getTheme().accentColor)(
          getTerm("ensuringNarrativeContinuity")
        ),
        spinner: "dots",
      }).start();

      let finalNarrative, finalSpecialEvent;

      try {
        const result = await NarrativeService.ensureNarrativeContinuity(
          narrative,
          specialEvent,
          gameState,
          messages
        );
        finalNarrative = result.narrative;
        finalSpecialEvent = result.specialEvent;
        continuitySpinner.succeed(
          chalk.hex(Cache.getTheme().accentColor)(
            getTerm("narrativeFlowSecured")
          )
        );
      } catch (error) {
        continuitySpinner.fail(
          chalk.hex(Cache.getTheme().errorColor)(
            getTerm("narrativeContinuityIssue")
          )
        );
        throw error;
      }

      // Save the generated narrative into game history
      gameState.addConversation({
        role: "assistant",
        content: finalNarrative,
      });
      gameState.addNarrative(finalNarrative);

      // Extract any new objectives from the narrative
      await Objective.extractNewObjectives(finalNarrative, gameState);

      const narrativeParts = finalNarrative.split("CHOICES:");
      const storyText = narrativeParts[0].trim();

      // Use enhanced book display with possible ASCII art
      let asciiArt = "";

      // Check if narrative contains ASCII art between special markers
      const asciiArtMatch = storyText.match(/```ascii\s+([\s\S]+?)\s+```/);
      if (asciiArtMatch && asciiArtMatch[1]) {
        asciiArt = asciiArtMatch[1];
      }
      // If no embedded ASCII art, try to load arc-specific ASCII art
      else {
        try {
          // Get appropriate ASCII art for the current arc/chapter
          asciiArt = await ArtService.getSceneAsciiArt(
            gameState.getCurrentChapter()?.arc || "introduction",
            finalSpecialEvent.type,
            finalNarrative
          );
        } catch (error) {
          Log.log(
            `Non-critical: Could not load scene ASCII art: ${error}`,
            "Info "
          );
        }
      }

      await NarrativeDisplay.displayTextInBookFormat(
        storyText.replace(/```ascii[\s\S]+?```/, ""),
        {
          title:
            gameState.getCurrentChapter()?.title || getTerm("chapter") + " 1",
          clearConsole: true,
          pageSize: 15,
          asciiArt: asciiArt,
        }
      );

      // Handle special events (combat, dungeon, shop, etc.)
      await EventHandlerService.handleSpecialEvent(
        {
          type: finalSpecialEvent.type,
          details: finalSpecialEvent.details || "",
        },
        finalNarrative,
        characterData,
        gameState
      );

      /* Display objective progress
      Disabled for now
      GameStateService.showObjectiveProgress(gameState);
      */

      // Prompt for player choice
      let choice;
      try {
        choice = await Choice.promptForChoice(
          finalNarrative,
          true,
          characterData,
          gameState
        );
      } catch (error) {
        Log.log(
          `Error processing choice: ${
            error instanceof Error ? error.message : String(error)
          }`,
          "Error"
        );
        choice = "Continue the adventure";
      }

      // Allow player to exit back to the main menu
      if (
        choice.toLowerCase().includes("return to main menu") ||
        choice.toLowerCase() === "exit"
      ) {
        console.log(
          chalk.hex(Cache.getTheme().accentColor)(
            getTerm("returningToMainMenu")
          )
        );
        await SaveLoad.saveGameState(gameState);
        return;
      }

      // Update game state based on player choice
      await GameStateService.updateAndSaveState(gameState, choice);
    } catch (error: any) {
      Log.log("Campaign loop error: " + error.message, "Error");
      console.log(Console.secondaryColor(getTerm("error")));

      try {
        await SaveLoad.saveGameState(gameState);
        console.log(Console.secondaryColor(getTerm("gameStateSaved")));
      } catch (saveError) {
        Log.log(
          `Failed to save game state: ${
            saveError instanceof Error ? saveError.message : String(saveError)
          }`,
          "Error"
        );
      }

      await Console.pressEnter({
        message: getTerm("pressEnterToReturnToMenu"),
      });
      return;
    }
  }
}

/**
 * Starts the campaign by loading character data and persistent game state,
 * then entering the main campaign loop.
 *
 * This function checks for existing character data, loads or initializes the game state,
 * allows the player to select their story pace (only once per campaign), and then
 * starts the campaign loop.
 *
 * @returns {Promise<void>} A promise that resolves when the campaign is started.
 *
 * @example
 * await startCampaign();
 */
export async function startCampaign(): Promise<void> {
  try {
    // Check internet connectivity first
    const isConnected = await AI.checkInternetConnectivity();
    if (!isConnected) {
      Log.log(getTerm("noInternetConnection"), "Error");
      console.log(Console.errorColor(getTerm("noInternetConnection")));
      console.log(Console.secondaryColor(getTerm("returningToMainMenu")));
      return;
    }
    // Retrieve character data from persistent storage.
    const characterData = Storage.getDataFromFile("character");
    if (!characterData) {
      Log.log(
        "No character data found. Please create a character first.",
        "Error"
      );
      return;
    }

    // Load existing game state or create new one
    const loadedState = await SaveLoad.loadGameState();
    let gameState = Cache.createNewGameState();

    // Determine if this is a new campaign or continuation
    let isNewCampaign = true;

    if (loadedState) {
      // For a more robust transfer of state, copy properties individually
      // This ensures we properly handle Maps and Sets
      Object.assign(gameState, loadedState);

      // A campaign is considered new ONLY if there's absolutely no progress indicators
      // This is a much more lenient check that prevents accidental resets
      isNewCampaign =
        gameState.getNarrativeHistory().length === 0 &&
        gameState.getConversationHistory().length === 0;

      // Log the decision for debugging
      Log.log(
        `Campaign continuation check: ${
          isNewCampaign ? "New campaign" : "Continuing existing campaign"
        }`,
        "Info "
      );
      Log.log(
        `Found ${gameState.getNarrativeHistory().length} narrative entries, ${
          gameState.getConversationHistory().length
        } conversation entries`,
        "Info "
      );

      // Save immediately to ensure we have an up-to-date save file
      await SaveLoad.saveGameState(gameState);
    }

    if (isNewCampaign) {
      console.log(Console.secondaryColor("\n" + getTerm("storyPaceWarning")));

      // Allow the player to select their preferred story pace.
      const paceChoice = await themedSelectInRoom({
        message: chalk.hex(Cache.getTheme().accentColor)(
          getTerm("chooseStoryPace")
        ),
        choices: Object.entries(STORY_PACE).map(([key, value]) => ({
          name: `${value.name} - ${value.description}`,
          value: key,
        })),
      });

      gameState.setStoryPace(paceChoice as StoryPaceKey);
      console.log(
        chalk.hex(Cache.getTheme().accentColor)(getTerm("storyPaceSet"))
      );
    } else {
      console.log(
        chalk.hex(Cache.getTheme().accentColor)(getTerm("continuingCampaign"))
      );
    }

    // Ensure inventory is set for the character.
    if (
      !Array.isArray(characterData.inventory) ||
      characterData.inventory.length === 0
    ) {
      characterData.inventory = Inventory.getStartingItems(characterData.class);
    }

    console.log(
      chalk.hex(Cache.getTheme().accentColor)(getTerm("startingCampaign"))
    );

    // Load the intro ASCII art, but don't display yet - it will be shown in the book
    let introAsciiArt = "";
    try {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.resolve(
        Config.RESOURCES_DIR,
        /*  "animations", */
        "alone.json"
      );

      const data = await fs.promises.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);

      if (
        parsed.frames &&
        Array.isArray(parsed.frames) &&
        parsed.frames.length > 0
      ) {
        const frame = parsed.frames[0];
        introAsciiArt = Array.isArray(frame) ? frame.join("\n") : String(frame);
      }
    } catch (error) {
      Log.log(`Failed to load intro ASCII art: ${error}`, "Warn ");
      // Continue without ASCII art if it fails
    }

    // Pass the loaded ASCII art to the campaign loop
    await campaignLoop(gameState, characterData, introAsciiArt);
  } catch (error) {
    Log.log(
      `Campaign start error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      "Error"
    );
    console.log(Console.secondaryColor(getTerm("failedToStartCampaign")));
  }
}
