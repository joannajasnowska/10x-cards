import { DEFAULT_USER_ID, type SupabaseClient } from "../../db/supabase.client";
import type {
  InitiateGenerationCommand,
  InitiateGenerationResponseDTO,
  GenerationFlashcardProposalDTO,
} from "../../types";
import { createHash } from "crypto";
import { AiService } from "./ai.service";

// Domyślny model AI używany do generacji
const DEFAULT_AI_MODEL = "openai/gpt-4o-mini";

export class GenerationsService {
  private readonly aiService: AiService;

  constructor(private readonly supabase: SupabaseClient) {
    this.aiService = new AiService(supabase);
  }

  private calculateTextHash(text: string): string {
    return createHash("md5").update(text).digest("hex");
  }

  private async createGenerationRecord(sourceText: string, sourceTextHash: string, sourceTextLength: number) {
    const startDate = new Date().toISOString();

    const { data: generation, error: insertError } = await this.supabase
      .from("generations")
      .insert({
        user_id: DEFAULT_USER_ID,
        model: DEFAULT_AI_MODEL,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        start_date: startDate,
        end_date: null,
        generation_time: 0,
        ai_complete_count: 0,
        ai_with_updates_count: 0,
        all_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create generation record: ${insertError.message}`);
    }

    return generation;
  }

  private async updateGenerationRecord(
    generationId: number,
    flashcardProposals: GenerationFlashcardProposalDTO[],
    startDate: string
  ) {
    const endDate = new Date().toISOString();
    const generationTime = new Date(endDate).getTime() - new Date(startDate).getTime();

    const { error: updateError } = await this.supabase
      .from("generations")
      .update({
        end_date: endDate,
        generation_time: generationTime,
        ai_complete_count: flashcardProposals.length,
        ai_with_updates_count: 0,
        all_count: flashcardProposals.length,
      })
      .eq("id", generationId);

    if (updateError) {
      throw new Error(`Failed to update generation record: ${updateError.message}`);
    }
  }

  async initiateGeneration(command: InitiateGenerationCommand): Promise<InitiateGenerationResponseDTO> {
    const sourceTextHash = this.calculateTextHash(command.source_text);
    const sourceTextLength = command.source_text.length;

    const generation = await this.createGenerationRecord(command.source_text, sourceTextHash, sourceTextLength);

    try {
      const flashcardProposals = await this.aiService.generateFlashcardProposals(command.source_text, DEFAULT_AI_MODEL);

      await this.updateGenerationRecord(generation.id, flashcardProposals, generation.start_date);

      return {
        generation_id: generation.id,
        flashcard_proposals: flashcardProposals,
        ai_complete_count: flashcardProposals.length,
      };
    } catch (error) {
      // Log error and update generation status
      await this.supabase.from("generation_logs").insert({
        generation_id: generation.id,
        error_code: "AI_PROCESSING_ERROR",
        error_message: error instanceof Error ? error.message : "Unknown error",
        model: DEFAULT_AI_MODEL,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        user_id: DEFAULT_USER_ID,
      });

      throw error;
    }
  }
}
