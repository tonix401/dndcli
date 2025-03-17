/**
 * @fileoverview ImageService - Handles image generation, processing, and ASCII art conversion
 *
 * This service provides functionality to:
 * - Generate images using OpenAI's DALL-E model
 * - Convert images to ASCII art for terminal display
 * - Save generated images to disk
 * - Manage quotas and rate limiting for API usage
 * @version 1.0.0-ONHOLD
 */

import { getOpenAI } from "@utilities/AIService.js";
import { log } from "@utilities/LogService.js";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import crypto from "crypto";

/**
 * In-memory cache to store previously generated ASCII art by prompt
 * Reduces duplicate API calls and improves performance for repeated requests
 * @type {Object<string, string>}
 */
const imageCache: { [prompt: string]: string } = {};

/**
 * Rate limiting configuration for image generation
 * Tracks number of images generated in the current time window
 */
let imagesGenerated = 0;

/**
 * Maximum number of images that can be generated in a time window
 * Adjust based on API quotas and cost considerations
 */
const IMAGE_GENERATION_LIMIT = 50;

/**
 * Time window for image generation rate limiting (3 hours in milliseconds)
 */
const LIMIT_WINDOW_MS = 3 * 60 * 60 * 1000;

/**
 * Timestamp when the current rate limiting window started
 */
let windowStart = Date.now();

/**
 * ASCII density string - characters arranged from darkest to lightest
 * Used for mapping pixel brightness values to ASCII characters
 * The space at the end represents the brightest/white areas
 */
const ASCII_DENSITY = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'. `;

/**
 * Resets the image generation quota if the current time window has elapsed
 * Called internally before checking if more images can be generated
 * @private
 */
function resetQuotaIfNeeded() {
  const now = Date.now();
  if (now - windowStart >= LIMIT_WINDOW_MS) {
    imagesGenerated = 0;
    windowStart = now;
  }
}

/**
 * Checks if more images can be generated within the current rate limit window
 * @returns {Promise<boolean>} True if image generation is allowed, false if quota reached
 */
export async function canGenerateImage(): Promise<boolean> {
  resetQuotaIfNeeded();
  return imagesGenerated < IMAGE_GENERATION_LIMIT;
}

/**
 * Generates an image using OpenAI's API based on a scene description,
 * then converts that image to ASCII art using our custom converter.
 *
 * @param {string} sceneDescription - Text description of the scene to generate
 * @param {Object} [options] - Configuration options
 * @param {number} [options.width=120] - Width of ASCII art in characters
 * @param {number} [options.height=60] - Height of ASCII art in characters
 * @param {boolean} [options.highContrast=true] - Whether to enhance contrast
 * @param {boolean} [options.saveImage=true] - Whether to save the raw image to disk
 * @param {string} [options.savePath] - Custom path to save the image
 * @returns {Promise<string>} ASCII art representation of the generated image
 */
export async function generateSceneImage(
  sceneDescription: string,
  options?: {
    width?: number;
    height?: number;
    highContrast?: boolean;
    saveImage?: boolean;
    savePath?: string;
  }
): Promise<string> {
  try {
    // Check cache first to avoid redundant API calls
    if (imageCache[sceneDescription]) {
      return imageCache[sceneDescription];
    }

    // Verify we haven't exceeded rate limits
    if (!(await canGenerateImage())) {
      throw new Error(
        "Image generation limit reached. Please try again later."
      );
    }

    log("Generating scene image...");
    const openai = getOpenAI();

    // Optimize prompt for ASCII conversion by emphasizing contrast and clarity
    const optimizedPrompt = `${sceneDescription}, monochrome, high contrast, simplified shapes, clear outlines, minimal detail, optimized for ASCII art conversion`;

    // Call OpenAI's image generation API with b64_json format instead of URL
    const response = await openai.images.generate({
      prompt: optimizedPrompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json", // Request base64 data instead of URL
    });

    // Cast the response to the expected type with base64 data
    const imagesResponse = response as unknown as {
      data: Array<{ b64_json: string }>;
    };

    const imageBase64 = imagesResponse.data[0].b64_json;
    if (!imageBase64) {
      throw new Error("No image data returned from the API");
    }

    log(`Received image data: ${imageBase64.length} bytes`);

    // Always save the image by default unless explicitly set to false
    const shouldSaveImage = options?.saveImage !== false;

    // Save the image to disk
    if (shouldSaveImage) {
      try {
        const savedImagePath = await saveImageToDisk(
          imageBase64,
          sceneDescription,
          options?.savePath
        );
        log(`Image saved to: ${savedImagePath}`);

        // Verify the image was actually saved
        if (!fs.existsSync(savedImagePath)) {
          log(
            `Warning: Image file does not exist at ${savedImagePath} after save operation`
          );
        }
      } catch (saveError: any) {
        log(`Error saving image: ${saveError.message}`);
        console.error("Error saving image:", saveError);
      }
    }

    // Convert the base64 image to ASCII art
    // Larger default dimensions for more detail
    const targetWidth = options?.width || 120;
    const targetHeight = options?.height || 60;
    const highContrast = options?.highContrast ?? true;
    const asciiResult = await convertImageToAscii(
      imageBase64,
      targetWidth,
      targetHeight,
      highContrast
    );

    // Cache the result to avoid regeneration
    imageCache[sceneDescription] = asciiResult;
    imagesGenerated++;
    log("Scene image generated successfully.");
    return asciiResult;
  } catch (error: any) {
    log("Failed to generate scene image:", error);
    console.error("Failed to generate scene image:", error);
    return `Error generating image: ${error.message}`;
  }
}

/**
 * Saves a base64 encoded image to disk with proper error handling and verification
 *
 * @param {string} imageBase64 - Base64 encoded image data
 * @param {string} description - Description of the image (used for filename)
 * @param {string} [customPath] - Optional custom path to save the image
 * @returns {Promise<string>} Path where the image was saved
 * @private
 */
async function saveImageToDisk(
  imageBase64: string,
  description: string,
  customPath?: string
): Promise<string> {
  try {
    // Create a timestamp-based filename to avoid collisions
    const timestamp = Date.now();
    const hash = crypto
      .createHash("md5")
      .update(description)
      .digest("hex")
      .substring(0, 10);
    const filename = `image_${timestamp}_${hash}.png`;

    // Determine save location - use storage/images directory by default
    const saveDir = customPath || path.join(process.cwd(), "storage", "images");

    log(`Preparing to save image to directory: ${saveDir}`);

    // Create directory if it doesn't exist
    if (!fs.existsSync(saveDir)) {
      log(`Creating directory: ${saveDir}`);
      fs.mkdirSync(saveDir, { recursive: true });
    }

    const filePath = path.join(saveDir, filename);
    log(`Writing image to: ${filePath}`);

    // Convert base64 to buffer and save
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // Use synchronous write to ensure file is written before function returns
    fs.writeFileSync(filePath, imageBuffer);

    // Double-check that the file was created
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      log(`Image file created: ${filePath} (${stats.size} bytes)`);
    } else {
      log(`Warning: Failed to verify file creation at ${filePath}`);
    }

    return filePath;
  } catch (error: any) {
    log(`Error in saveImageToDisk: ${error.message}`);
    if (error.code) {
      log(`Error code: ${error.code}`);
    }
    throw error;
  }
}

/**
 * Converts a base64 encoded image to ASCII art
 *
 * Algorithm:
 * 1. Load image using canvas
 * 2. Optionally enhance contrast
 * 3. Sample pixels at regular intervals
 * 4. Map brightness values to ASCII characters
 *
 * @param {string} imageBase64 - Base64 encoded image data
 * @param {number} targetWidth - Desired width of ASCII art in characters
 * @param {number} targetHeight - Desired height of ASCII art in characters
 * @param {boolean} [highContrast=true] - Whether to apply contrast enhancement
 * @returns {Promise<string>} A string of ASCII art representing the image
 * @private
 */
async function convertImageToAscii(
  imageBase64: string,
  targetWidth: number,
  targetHeight: number,
  highContrast: boolean = true
): Promise<string> {
  try {
    // Create a buffer from base64 data
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // Load the image using canvas
    const image = await loadImage(imageBuffer);

    // Calculate aspect ratio and dimensions
    const originalWidth = image.width;
    const originalHeight = image.height;
    const aspectRatio = originalWidth / originalHeight;

    // Adjust dimensions to maintain aspect ratio
    let width = targetWidth;
    let height = Math.round(width / aspectRatio / 2); // Divide by 2 because console characters are taller than wide

    // If height exceeds target, adjust width
    if (height > targetHeight) {
      height = targetHeight;
      width = Math.round(height * aspectRatio * 2);
    }

    // Create canvas and draw the image
    const canvas = createCanvas(originalWidth, originalHeight);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // Apply contrast enhancement if requested
    if (highContrast) {
      const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight);
      const data = imageData.data;

      // Find the min and max brightness values
      let min = 255;
      let max = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        min = Math.min(min, brightness);
        max = Math.max(max, brightness);
      }

      // Apply contrast stretching
      const range = max - min;
      if (range > 0) {
        for (let i = 0; i < data.length; i += 4) {
          for (let j = 0; j < 3; j++) {
            // Calculate brightness using luminance formula
            const brightness =
              0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Normalize brightness to 0-255 range
            const adjustedValue = ((brightness - min) / range) * 255;
            // Apply gamma correction for better mid-tone details
            data[i + j] = Math.pow(adjustedValue / 255, 0.8) * 255;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
    }

    // Get image data after potential contrast enhancement
    const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight);
    const pixels = imageData.data;

    // Create ASCII representation
    let asciiArt = "";

    // Sample the image at regular intervals to create ASCII art
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate the corresponding position in the original image
        const sampleX = Math.floor((x * originalWidth) / width);
        const sampleY = Math.floor((y * originalHeight) / height);

        // Calculate pixel index in the image data array (RGBA format)
        const pixelIndex = (sampleY * originalWidth + sampleX) * 4;

        // Calculate grayscale value (standard luminance formula)
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        // Map brightness to ASCII character
        const charIndex = Math.floor(
          (brightness / 255) * (ASCII_DENSITY.length - 1)
        );
        // Use a double character for each pixel to improve horizontal resolution
        // This compensates for terminal characters being taller than wide
        asciiArt += ASCII_DENSITY[charIndex];
        asciiArt += ASCII_DENSITY[charIndex];
      }
      // Add newline after each row
      asciiArt += "\n";
    }

    return asciiArt;
  } catch (error: any) {
    console.error("Error converting image to ASCII:", error);
    return `Failed to convert image to ASCII: ${error.message}`;
  }
}

/**
 * Utility function to display ASCII art to the console with proper dimensions
 * Includes terminal width detection to warn about potential truncation
 *
 * @param {string} asciiArt - ASCII art string to display
 * @public
 */
export function displayAsciiArt(asciiArt: string): void {
  // Get terminal width to check if we need to warn about truncation
  const terminalWidth = process.stdout.columns || 80;
  const lines = asciiArt.split("\n");
  const maxLineWidth = Math.max(...lines.map((line) => line.length));

  if (maxLineWidth > terminalWidth) {
    console.log(
      `Note: ASCII art (${maxLineWidth} chars wide) may be truncated in your terminal (${terminalWidth} chars wide).`
    );
  }

  console.log(asciiArt);
}

/**
 * Generate and save an image without converting it to ASCII
 * Used when you only need the image file and not ASCII representation
 *
 * @param {string} prompt - Description of the image to generate
 * @param {string} [savePath] - Optional custom path to save the image
 * @returns {Promise<string>} Path to the saved image
 * @public
 */
export async function generateAndSaveImage(
  prompt: string,
  savePath?: string
): Promise<string> {
  try {
    if (!(await canGenerateImage())) {
      throw new Error(
        "Image generation limit reached. Please try again later."
      );
    }

    log("Generating and saving image...");
    const openai = getOpenAI();

    // Call OpenAI's image generation API
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json",
    });

    const imagesResponse = response as unknown as {
      data: Array<{ b64_json: string }>;
    };

    const imageBase64 = imagesResponse.data[0].b64_json;
    if (!imageBase64) {
      throw new Error("No image data returned from the API");
    }

    log(`Received image data for saving: ${imageBase64.length} bytes`);

    // Save image to disk with better error handling
    let savedImagePath;
    try {
      savedImagePath = await saveImageToDisk(imageBase64, prompt, savePath);

      // Verify the file was created
      if (!fs.existsSync(savedImagePath)) {
        throw new Error(`File was not created at ${savedImagePath}`);
      }
    } catch (saveError: any) {
      log(`Error in file saving process: ${saveError.message}`);
      throw saveError;
    }

    imagesGenerated++;

    log(`Image generated and saved to: ${savedImagePath}`);
    return savedImagePath;
  } catch (error: any) {
    log("Failed to generate and save image:", error);
    console.error("Failed to generate and save image:", error);
    throw error;
  }
}

/**
 * -------------------------------------------------------------------------
 * EXPERIMENTAL FEATURE WARNING
 * -------------------------------------------------------------------------
 *
 * The image generation and ASCII art conversion functionality in this module
 * is currently EXPERIMENTAL and should not be used with expectations of
 * a reliable outcome in production environments.
 *
 * Known limitations:
 *
 * 1. API rate limits - The OpenAI API has a limited number of requests haven't
 * personally encountered this but it's definitely there.
 *
 * 2. ASCII quality - The conversion to ASCII art is limited by terminal
 *    dimensions and character density, and is unreliable in terms of output T_T
 *
 * 3. File system dependencies - File saving operations may behave differently
 *    across environments and operating systems
 *
 * 4. Performance impact - Image generation and ASCII conversion are honestly
 *   quite slow and may not be suitable for our game but idk... maybe?
 *
 *
 * Considering on scrapping the idea but will leave it in for now
 */
