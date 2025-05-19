import { OpenRouterService } from "../openrouter/service";
import type { GenerationFlashcardProposalDTO } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";

export class AiService {
  private readonly openRouter: OpenRouterService;

  constructor(supabase: SupabaseClient) {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set");
    }

    const jsonSchema = {
      type: "object",
      properties: {
        flashcards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              front: { type: "string", maxLength: 200 },
              back: { type: "string", maxLength: 500 },
            },
            required: ["front", "back"],
          },
        },
      },
      required: ["flashcards"],
    };

    this.openRouter = new OpenRouterService(supabase, {
      apiKey,
      modelName: "openai/gpt-4o-mini",
      modelParameters: {
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1.0,
      },
      systemMessage: `You are a flashcard generation assistant. Your task is to create educational flashcards from the provided text.
Each flashcard should have a front (question) and back (answer) side.
The front should be a clear, concise question or prompt.
The back should contain a complete, accurate answer based on the text. Focus on important facts, definitions, concepts, and relationships.

Follow these rules:
- Create 5-10 flashcards depending on the content
- Front side should be max 200 characters
- Back side should be max 500 characters
- Focus on key concepts, definitions, and important facts
- Make questions clear and unambiguous
- Ensure answers are accurate and complete
- Avoid overly complex or compound questions
- Format consistently across all flashcards

Your response must be a valid JSON object with a "flashcards" array containing the flashcard objects.
Do not include any other text or explanation in your response, only the JSON object.`,
    });

    // Set response format for JSON validation
    this.openRouter["currentResponseFormat"] = {
      type: "json_schema",
      json_schema: {
        name: "flashcards",
        strict: true,
        schema: jsonSchema,
      },
    };
  }

  async generateFlashcardProposals(sourceText: string, model: string): Promise<GenerationFlashcardProposalDTO[]> {
    // Set the model if it's different from current
    if (model !== this.openRouter.modelName) {
      this.openRouter.setModelConfig({
        name: model,
        parameters: {
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1.0,
        },
      });
    }

    // Send the request to generate flashcards
    const response = await this.openRouter.sendChatRequest(
      `Generate flashcards from the following text. Your response must be a valid JSON object with a "flashcards" array.

Text to process:
${sourceText}

Remember:
1. Response must be a valid JSON object with a "flashcards" array
2. Each flashcard object must have "front" and "back" properties
3. Front side must be max 200 characters
4. Back side must be max 500 characters
5. Focus on key concepts and facts
6. Make questions clear and unambiguous`
    );

    try {
      // Parse the response
      const data = JSON.parse(response.message);

      // Extract and validate flashcards
      const flashcards = data?.flashcards || [];

      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error("No valid flashcards found in response");
      }

      // Transform and validate each flashcard
      return flashcards.map((card: any) => ({
        front: String(card.front || "").slice(0, 200),
        back: String(card.back || "").slice(0, 500),
        source: "ai-complete" as const,
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse AI response: ${error.message}`);
      }
      throw new Error("Failed to parse AI response: Unknown error");
    }
  }
}
