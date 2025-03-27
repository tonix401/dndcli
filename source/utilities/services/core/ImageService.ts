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

import { getOpenAI } from "../ai/AIService.js";
import { log } from "./LogService.js";
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
const IMAGE_GENERATION_LIMIT = 100;

/**
 * Time window for image generation rate limiting (3 hours in milliseconds), this is a bit excessive but whatever
 * I heard that the limit resets every 3 hours so I just set it to that
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
 * @param {boolean} [options.saveImage=true] - Whether to save the raw image to diskd
 * @param {string} [options.savePath] - Custom path to save the image
 * @param {boolean} [options.forceNewGeneration=false] - Whether to bypass cache and force a new image
 * @param {boolean} [options.preserveSquareShape=false] - New option to maintain exact square shape
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
    useEdgeDetection?: boolean; // New option
    inverted?: boolean; // New option
    asciiStyle?: "detailed" | "simple" | "inverted";
    forceNewGeneration?: boolean;
    preserveSquareShape?: boolean; // New option to maintain exact square shape
  }
): Promise<string> {
  try {
    // Check cache first to avoid redundant API calls, unless forceNewGeneration is true
    if (!options?.forceNewGeneration && imageCache[sceneDescription]) {
      log(
        "Using cached image for prompt: " +
          sceneDescription.substring(0, 30) +
          "..."
      );
      return imageCache[sceneDescription];
    }

    if (options?.forceNewGeneration) {
      log("Force new generation enabled, bypassing cache...");
    }

    // Verify we haven't exceeded rate limits
    if (!(await canGenerateImage())) {
      throw new Error(
        "Image generation limit reached. Please try again later."
      );
    }

    log("Generating scene image...");

    // Create a new OpenAI instance to avoid potential state issues
    const openai = getOpenAI();

    // Optimize prompt for ASCII conversion by emphasizing contrast and clarity
    const optimizedPrompt = `
    A high-contrast black and white image designed for ASCII conversion. 
    The scene depicts: ${sceneDescription}. 
    Use bold, well-defined edges with strong lighting contrasts. 
    Keep it simple and avoid excessive noise or clutter.
    Avoid excessive fine details or textures. 
    Ensure distinct silhouettes with minimal shading and a balanced composition.`;

    // Call OpenAI's image generation API with b64_json format instead of URL
    const response = await openai.images.generate({
      prompt: optimizedPrompt,
      n: 1,
      model: "dall-e-3",
      response_format: "b64_json",
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
    const targetWidth = options?.width || 160;
    const targetHeight = options?.height || 160;
    const highContrast = options?.highContrast ?? true;
    const useInverted = options?.inverted ?? false;
    const useEdgeDetection = options?.useEdgeDetection ?? false;
    const preserveSquareShape = options?.preserveSquareShape ?? false; // New parameter
    const asciiResult = await convertImageToAscii(
      imageBase64,
      targetWidth,
      targetHeight,
      highContrast,
      useInverted,
      useEdgeDetection,
      preserveSquareShape // Pass the new parameter
    );

    // Cache the result to avoid regeneration, using a unique key if forceNewGeneration is true
    const cacheKey = options?.forceNewGeneration
      ? `${sceneDescription}_${Date.now()}`
      : sceneDescription;

    imageCache[cacheKey] = asciiResult;
    imagesGenerated++;
    log("Scene image generated successfully.");
    return asciiResult;
  } catch (error: any) {
    log("Failed to generate scene image:", error);
    console.error("Failed to generate scene image:", error);
    throw new Error(`Error generating image: ${error.message}`);
  } finally {
    // Clean up resources to prevent memory leaks and ensure next generation works
    try {
      // Force garbage collection hints (Node.js can't directly force GC, but this helps)
      if (global.gc) {
        global.gc();
      }
    } catch (cleanupError) {
      log(
        "Note: Cleanup optimization unavailable, but operation should still succeed"
      );
    }
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

function applyEdgeDetection(
  data: Uint8ClampedArray,
  width: number,
  height: number
): void {
  // Create a copy of the data to work with
  const original = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i++) {
    original[i] = data[i];
  }

  // Sobel operator for edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // Pixel positions
      const idx = (y * width + x) * 4;
      const idxTop = ((y - 1) * width + x) * 4; // This was missing
      const idxBottom = ((y + 1) * width + x) * 4;
      const idxLeft = (y * width + (x - 1)) * 4;
      const idxRight = (y * width + (x + 1)) * 4;
      const idxTopLeft = ((y - 1) * width + (x - 1)) * 4;
      const idxTopRight = ((y - 1) * width + (x + 1)) * 4;
      const idxBottomLeft = ((y + 1) * width + (x - 1)) * 4;
      const idxBottomRight = ((y + 1) * width + (x + 1)) * 4;

      // Sobel X component (using red channel as we're in grayscale)
      const edgeX =
        original[idxTopLeft] +
        2 * original[idxLeft] +
        original[idxBottomLeft] -
        original[idxTopRight] -
        2 * original[idxRight] -
        original[idxBottomRight];

      // Sobel Y component
      const edgeY =
        original[idxTopLeft] +
        2 * original[idxTop] +
        original[idxTopRight] -
        original[idxBottomLeft] -
        2 * original[idxBottom] -
        original[idxBottomRight];

      // Magnitude of gradient
      const magnitude = Math.sqrt(edgeX * edgeX + edgeY * edgeY);

      // Apply back to image (all channels as we're in grayscale)
      data[idx] = data[idx + 1] = data[idx + 2] = Math.min(255, magnitude);
    }
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
 * @param {boolean} [inverted=false] - Whether to use inverted character set
 * @param {boolean} [useEdgeDetection=false] - Whether to apply edge detection
 * @param {boolean} [preserveSquareShape=false] - Whether to bypass terminal ratio correction
 * @returns {Promise<string>} A string of ASCII art representing the image
 * @private
 */
async function convertImageToAscii(
  imageBase64: string,
  targetWidth: number,
  targetHeight: number,
  highContrast: boolean = true,
  inverted: boolean = false,
  useEdgeDetection: boolean = false,
  preserveSquareShape: boolean = false
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

    // Handle aspect ratio correction based on preserveSquareShape option
    let width, height;

    if (preserveSquareShape) {
      // If we want exact dimensions, skip the terminal character ratio correction
      width = targetWidth;
      height = targetHeight;
    } else {
      // Apply terminal character ratio correction for visually correct output
      const terminalCharRatio = 0.5; // Terminal characters are about 1:2 (width:height)
      const correctedAspectRatio = aspectRatio * terminalCharRatio;

      // Calculate dimensions to maintain proper visual aspect ratio
      width = Math.min(
        targetWidth,
        Math.floor(targetHeight * correctedAspectRatio * 2)
      );
      height = Math.min(
        targetHeight,
        Math.floor(width / correctedAspectRatio / 2)
      );
    }

    // Create canvas and draw the image
    const canvas = createCanvas(originalWidth, originalHeight);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // Convert to grayscale first for better control
    const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight);
    const data = imageData.data;

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const brightness =
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = brightness;
    }

    // Apply edge detection if requested
    if (useEdgeDetection) {
      applyEdgeDetection(data, originalWidth, originalHeight);
    }

    // Apply contrast enhancement if requested with improved algorithm
    if (highContrast) {
      // Find the min and max brightness values
      let min = 255;
      let max = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = data[i]; // Already grayscale
        min = Math.min(min, brightness);
        max = Math.max(max, brightness);
      }

      // Apply enhanced contrast stretching with gamma
      const range = max - min;
      if (range > 0) {
        for (let i = 0; i < data.length; i += 4) {
          // Apply contrast stretching
          let normalized = (data[i] - min) / range;

          // Apply S-curve for more balanced contrast
          normalized =
            Math.pow(normalized, 0.7) * (1 - Math.pow(1 - normalized, 0.7));

          // Scale back to 0-255
          const adjustedValue = Math.min(255, Math.max(0, normalized * 255));

          // Apply to all RGB channels (already grayscale)
          data[i] = data[i + 1] = data[i + 2] = adjustedValue;
        }
      }
    }

    // Put processed image data back
    ctx.putImageData(imageData, 0, 0);

    // Define ASCII character sets
    const ASCII_DENSITY_DETAILED = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'. `;
    const ASCII_DENSITY_SIMPLE = `@%#*+=-:. `; // Fewer characters for cleaner look
    const ASCII_DENSITY_INVERTED = ` .'^\`",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$`;

    // Choose character set based on inverted parameter
    const asciiDensity = inverted
      ? ASCII_DENSITY_INVERTED
      : ASCII_DENSITY_DETAILED;

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

        // Get brightness (already grayscale)
        const brightness = data[pixelIndex];

        // Map brightness to ASCII character
        const charIndex = Math.floor(
          (brightness / 255) * (asciiDensity.length - 1)
        );

        // FIXED: Use single character for better proportions
        asciiArt += asciiDensity[charIndex];
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
 * Clears the image cache to free memory and force new generations
 * Call this if you encounter issues with image generation
 */
export function clearImageCache(): void {
  log("Clearing image cache...");
  for (const key in imageCache) {
    delete imageCache[key];
  }
  log("Image cache cleared successfully");
}
/**
 * Resets the image service state to allow for new image generations
 * Call this function when you encounter issues with multiple image generations
 */
export function resetImageServiceState(): void {
  try {
    // Clear any cached OpenAI clients that might be in a bad state
    log("Resetting image service state...");

    // Clear the image cache
    clearImageCache();

    // Reset rate limiting counters if needed
    imagesGenerated = 0;
    windowStart = Date.now();

    // Force garbage collection if available
    try {
      if (global.gc) {
        global.gc();
      }
    } catch (cleanupError) {
      log(
        "Note: Cleanup optimization unavailable, but operation should still succeed"
      );
    }
    log("Image service state reset successfully.");
  } catch (error) {
    log(
      "Failed to reset image service state: " +
        (error instanceof Error ? error.message : String(error))
    );
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
