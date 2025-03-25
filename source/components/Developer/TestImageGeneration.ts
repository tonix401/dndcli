import {
  pressEnter,
  primaryColor,
  secondaryColor,
} from "@core/ConsoleService.js";
import { canGenerateImage, generateSceneImage } from "@core/ImageService.js";
import chalk from "chalk";
import { themedSelectInRoom } from "@components/ThemedSelectInRoom.js";
import { themedInput } from "@components/ThemedInput.js";

export async function testImageGeneration() {
  console.log(primaryColor("Testing image generation..."));

  try {
    if (!(await canGenerateImage())) {
      console.log(
        chalk.redBright("Image generation quota reached. Try again later.")
      );
      await pressEnter();
      return;
    }

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
    const asciiStyle = await themedSelectInRoom({
      message: "Choose ASCII art style:",
      choices: [
        { name: "Standard (detailed)", value: "detailed" },
        { name: "Simple (fewer characters)", value: "simple" },
        { name: "Inverted (for dark backgrounds)", value: "inverted" },
        { name: "Edge Detection", value: "edge" },
      ],
    });

    const sizePreference = await themedSelectInRoom({
      message: "Choose size:",
      choices: [
        { name: "Small (100x50)", value: "small" },
        { name: "Medium (160x80)", value: "medium" },
        { name: "Large (200x100)", value: "large" },
        { name: "Perfect Square (120x120)", value: "square" },
      ],
    });

    const squareShape = await themedSelectInRoom({
      message: "Aspect ratio handling:",
      choices: [
        {
          name: "Visually correct (adjust for terminal characters)",
          value: false,
        },
        { name: "Exact square shape (equal character count)", value: true },
      ],
    });

    const forceFresh = await themedSelectInRoom({
      message: "Image generation mode:",
      choices: [
        { name: "Use cached image if available", value: false },
        { name: "Force new generation", value: true },
      ],
    });

    console.log(primaryColor("Generating image from prompt:"));
    console.log(secondaryColor(prompt));
    console.log(primaryColor(`Style: ${asciiStyle}, Size: ${sizePreference}`));
    console.log(primaryColor("This may take a few moments..."));

    const options: {
      width?: number;
      height?: number;
      highContrast?: boolean;
      inverted?: boolean;
      useEdgeDetection?: boolean;
      forceNewGeneration?: boolean;
      preserveSquareShape?: boolean;
    } = {};

    switch (sizePreference) {
      case "small":
        options.width = 100;
        options.height = 50;
        break;
      case "large":
        options.width = 200;
        options.height = 100;
        break;
      case "square":
        options.width = 60;
        options.height = 60;
        break;
      default:
        options.width = 160;
        options.height = 80;
    }

    switch (asciiStyle) {
      case "simple":
        options.highContrast = true;
        break;
      case "inverted":
        options.inverted = true;
        options.highContrast = true;
        break;
      case "edge":
        options.useEdgeDetection = true;
        options.highContrast = true;
        break;
      default:
        options.highContrast = true;
    }

    options.preserveSquareShape = squareShape as boolean;

    options.forceNewGeneration = forceFresh as boolean;

    const asciiArt = await generateSceneImage(prompt, options);
    console.log(asciiArt);
  } catch (error: unknown) {
  } finally {
    await pressEnter();
  }
}
