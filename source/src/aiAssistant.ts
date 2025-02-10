import * as dotenv from "dotenv";
import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
} from "openai";

dotenv.config();
class ChatGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatGenerationError";
  }
}
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables");
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
  if (!messages?.length) {
    throw new ChatGenerationError("Messages array cannot be empty");
  }

  const requestPayload: CreateChatCompletionRequest = {
    model: options?.model || "gpt-3.5-turbo",
    messages,
    max_tokens: options?.maxTokens ?? 300,
    temperature: options?.temperature ?? 0.85,
    top_p: options?.topP ?? 1.0,
  };

  try {
    const response = await openai.createChatCompletion(requestPayload);

    if (!response.data.choices?.[0]?.message?.content) {
      throw new ChatGenerationError(
        "No valid response content received from OpenAI API"
      );
    }

    return response.data.choices[0].message.content.trim();
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
