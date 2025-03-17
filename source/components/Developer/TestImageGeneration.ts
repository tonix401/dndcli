import {
  errorColor,
  pressEnter,
  primaryColor,
  secondaryColor,
} from "@utilities/ConsoleService.js";
import {
  canGenerateImage,
  generateSceneImage,
} from "@utilities/ImageService.js";
import chalk from "chalk";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { themedInput } from "@components/ThemedInput.js";
import { log } from "console";

export async function testImageGeneration() {
  console.log(primaryColor("Testing image generation..."));

  // Check if we can generate images (quota limit)
  if (!(await canGenerateImage())) {
    log("Image generation quota reached. Try again later.", "Error");
    console.log(errorColor("Image generation quota reached. Try again later."));
    await pressEnter();
    return;
  }

  // Ask for custom prompt or use default
  const useCustom = await themedSelectInRoom({
    message: "Choose image prompt source:",
    choices: [
      { name: "Use default test prompt", value: "default" },
      { name: "Enter custom prompt", value: "custom" },
    ],
  });

  let prompt =
    "A medieval fantasy castle on a hill with dragons flying in the sky";

  if (useCustom === "custom") {
    prompt = await themedInput({
      message: primaryColor("Enter your image prompt: "),
    });
    if (!prompt || prompt.trim().length < 5) {
      console.log(
        secondaryColor("Prompt too short, using default prompt instead.")
      );
      prompt =
        "A medieval fantasy castle on a hill with dragons flying in the sky";
    }
  }

  console.log(primaryColor("Generating image from prompt:"));
  console.log(secondaryColor(prompt));
  console.log(primaryColor("This may take a few moments..."));

  try {
    const asciiArt = await generateSceneImage(prompt);
    console.log(chalk.green(asciiArt));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(chalk.redBright(`Error generating image: ${errorMessage}`));
  }

  await pressEnter();
}
