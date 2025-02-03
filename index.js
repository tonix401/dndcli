import { getCharacterData } from "./js/utilities/CharacterService.js";
import { createCharacterMenu } from "./js/components/CreateCharacterMenu.js";
import LogTypes from "./js/types/LogTypes.js";
import { log } from "./js/utilities/LogService.js";
import { select } from "@inquirer/prompts";
import { totalClear } from "./js/utilities/ConsoleService.js";
import { inspectCharacter } from "./js/components/InspectCharacter.js";
import { promptForChoice } from "./js/src/gameMaster.js";
import { GameState } from "./js/src/gameState.js";
import { generateChatNarrative } from "./js/src/aiAssistant.js";
import { ChatCompletionRequestMessageRoleEnum } from "openai";

const menuOptions = [
  {
    name: "Create your Character",
    value: "1",
  },
  {
    name: "Inspect your Character",
    value: "2",
  },
  {
    name: "Start Campaign",
    value: "3",
  },
  {
    name: "End Game",
    value: "9",
  },
];

async function campaignLoop(gameState, characterData) {
  if (!gameState || !characterData) {
    log("Invalid game state or character data", LogTypes.ERROR);
    return;
  }

  while (true) {
    try {
      const messages = [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: `You are an experienced Dungeon Master for an English Dungeons & Dragons adventure.
          
          Here’s an example of the expected output:
          
          "The ancient hall is dimly lit by flickering torches. Cobwebs hang from the ceiling and the scent of damp stone fills the air.
          1. Explore the left corridor.
          2. Inspect the strange markings on the wall.
          3. Proceed down the central passage.
          4. Return to main menu"
          
          Now, based on the following character info and situation, generate a narrative with exactly three options followed by a fourth option: "Return to main menu". Use clear numbered lines for each option.
          
          Character Info:
          Level: ${characterData.level} ${characterData.class} named ${characterData.name}
          HP: ${characterData.hp}/${characterData.abilities.maxhp}
          ... (other stats)
          
          Please respond in English.`,
        },
      ];

      // Add previous choices to influence story
      if (gameState.choices.length > 0) {
        messages.push({
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: `The player chose: ${
            gameState.choices[gameState.choices.length - 1]
          }`,
        });
      }

      const narrative = await generateChatNarrative(messages, {
        maxTokens: 300,
        temperature: 0.85,
      });

      console.log("\n" + narrative + "\n");
      gameState.addNarrative(narrative);

      const choice = await promptForChoice(narrative);

      // Check if player wants to return to main menu
      if (choice.includes("Return to main menu")) {
        console.log("\nReturning to main menu...\n");
        return;
      }

      gameState.addChoice(choice);
      console.log("\nYou chose:", choice, "\n");
    } catch (error) {
      log("Error in campaign: " + error.message, LogTypes.ERROR);
      return;
    }
  }
}

async function startCampaign() {
  const gameState = new GameState();
  const characterData = getCharacterData();

  if (!characterData) {
    log(
      "No character data found. Please create a character first.",
      LogTypes.ERROR
    );
    return;
  }

  await campaignLoop(gameState, characterData);
}

// Program loop
main();

async function main() {
  try {
    log("Program started");

    while (true) {
      totalClear();
      const input = await select(
        {
          message: "Please choose:",
          choices: menuOptions,
        },
        { clearPromptOnDone: true }
      );

      switch (input) {
        case "1":
          try {
            log("Option 1 selected");
            await createCharacterMenu();
          } catch (error) {
            log("Error creating character: " + error.message, LogTypes.ERROR);
          }
          break;
        case "2":
          log("Option 2 selected");
          await inspectCharacter();
          break;
        case "3":
          log("Campaign Start");
          await startCampaign();
          break;
        case "9":
          log("Program ended");
          console.log("See ya!👋");
          process.exit();
      }
    }
  } catch (error) {
    log(error, LogTypes.ERROR);
  }
}
