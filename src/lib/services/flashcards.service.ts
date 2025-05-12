import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateFlashcardAiDTO,
  CreateFlashcardsCommand,
  FlashcardDTO,
  UpdateFlashcardCommand,
} from "../../types";

export class FlashcardsService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Logs errors specific to AI flashcard creation for monitoring and debugging
   * @param error The error that occurred
   * @param userId The ID of the user who initiated the request
   * @param flashcardData The data of the AI flashcard that caused the error
   */
  private async logAiFlashcardError(error: any, userId: string, flashcardData: CreateFlashcardAiDTO) {
    try {
      // Fetch generation data if generation_id is provided
      let generationData = null;
      if (flashcardData.generation_id) {
        const { data, error: generationError } = await this.supabase
          .from("generations")
          .select("source_text_hash, source_text_length, model")
          .eq("id", flashcardData.generation_id)
          .single();

        if (!generationError) {
          generationData = data;
        }
      }

      // Create a log entry in generation_logs table
      await this.supabase.from("generation_logs").insert({
        user_id: userId,
        generation_id: flashcardData.generation_id || 0, // Default to 0 if null
        error_code: error.code || "UNKNOWN_ERROR",
        error_message: error.message || "Unknown error during AI flashcard creation",
        model: generationData?.model || "unknown",
        source_text_hash: generationData?.source_text_hash || "",
        source_text_length: generationData?.source_text_length || 0,
      });
    } catch (logError) {
      // If logging fails, at least log to console for debugging
      console.error("Error while logging AI flashcard error:", logError);
    }
  }

  /**
   * Verifies that a generation belongs to the specified user
   * @param generationId The ID of the generation to check
   * @param userId The ID of the user
   * @returns True if the generation belongs to the user, false otherwise
   */
  private async verifyGenerationBelongsToUser(generationId: number, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("generations")
      .select("id")
      .eq("id", generationId)
      .eq("user_id", userId)
      .single();

    return !error && data !== null;
  }

  /**
   * Creates multiple flashcards in a batch operation
   * @param command The command containing the flashcards to create
   * @param userId The ID of the user creating the flashcards
   * @returns The created flashcards
   */
  async createFlashcards(command: CreateFlashcardsCommand, userId: string): Promise<FlashcardDTO[]> {
    // Map the flashcards and add user_id to each
    const flashcardsToInsert = command.flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: userId,
    }));

    // For AI flashcards, verify that the generations belong to the user
    const aiFlashcards = flashcardsToInsert.filter(
      (f) => f.source === "ai-complete" || f.source === "ai-with-updates"
    ) as (CreateFlashcardAiDTO & { user_id: string })[];

    // Check all generation_ids at once to reduce database queries
    for (const flashcard of aiFlashcards) {
      if (flashcard.generation_id !== null) {
        const isValid = await this.verifyGenerationBelongsToUser(flashcard.generation_id, userId);
        if (!isValid) {
          const error = new Error(`Generation with ID ${flashcard.generation_id} does not belong to the user`);
          error.name = "UNAUTHORIZED_GENERATION_ACCESS";

          // Log the error for AI flashcards
          await this.logAiFlashcardError(error, userId, flashcard);

          throw error;
        }
      }
    }

    // Perform the batch insert operation
    const { data, error } = await this.supabase.from("flashcards").insert(flashcardsToInsert).select();

    if (error) {
      // Log errors for AI flashcards
      for (const flashcard of aiFlashcards) {
        await this.logAiFlashcardError(error, userId, flashcard);
      }

      throw error;
    }

    return data as FlashcardDTO[];
  }

  /**
   * Retrieves a paginated list of flashcards for a user with optional sorting and filtering
   * @param userId The ID of the user whose flashcards to retrieve
   * @param page The page number to retrieve (1-indexed)
   * @param limit The number of items per page
   * @param sort The field to sort by
   * @param order The direction to sort (asc or desc)
   * @param filter Optional search query for front or back text
   * @param source Optional filter by flashcard source
   * @param createdAfter Optional filter for flashcards created after a date
   * @param createdBefore Optional filter for flashcards created before a date
   * @param hasGeneration Optional filter for flashcards with or without a generation_id
   * @returns The flashcards data and total count
   */
  async listFlashcards(
    userId: string,
    page = 1,
    limit = 10,
    sort = "created_at",
    order: "asc" | "desc" = "desc",
    filter?: string,
    source?: "manual" | "ai-complete" | "ai-with-updates",
    createdAfter?: string,
    createdBefore?: string,
    hasGeneration?: boolean
  ): Promise<{ data: FlashcardDTO[]; total: number }> {
    // Calculate range for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Start building the query
    let query = this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at", { count: "exact" })
      .eq("user_id", userId)
      .order(sort, { ascending: order === "asc" })
      .range(from, to);

    // Apply text filtering if provided
    if (filter && filter.trim()) {
      const sanitizedFilter = filter.trim();
      query = query.or(`front.ilike.%${sanitizedFilter}%,back.ilike.%${sanitizedFilter}%`);
    }

    // Filter by source if provided
    if (source) {
      query = query.eq("source", source);
    }

    // Filter by creation date range if provided
    if (createdAfter) {
      query = query.gte("created_at", createdAfter);
    }
    if (createdBefore) {
      query = query.lte("created_at", createdBefore);
    }

    // Filter by presence of generation_id if provided
    if (hasGeneration !== undefined) {
      if (hasGeneration) {
        query = query.not("generation_id", "is", null);
      } else {
        query = query.is("generation_id", null);
      }
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data as unknown as FlashcardDTO[],
      total: count || 0,
    };
  }

  /**
   * Retrieves a single flashcard by ID
   * @param id The ID of the flashcard to retrieve
   * @param userId The ID of the user requesting the flashcard
   * @returns The flashcard data or null if not found
   */
  async getFlashcardById(id: number, userId: string): Promise<FlashcardDTO | null> {
    const { data, error } = await this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      // Check if this is a "not found" error
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as FlashcardDTO;
  }

  /**
   * Updates a flashcard with the given ID
   * @param id The ID of the flashcard to update
   * @param command The update command containing fields to update
   * @param userId The ID of the user performing the update
   * @returns The updated flashcard
   * @throws Error if the flashcard is not found or user does not have access
   */
  async updateFlashcard(id: number, command: UpdateFlashcardCommand, userId: string): Promise<FlashcardDTO> {
    // Check if the flashcard exists and belongs to the user
    const { data: existingFlashcard, error: checkError } = await this.supabase
      .from("flashcards")
      .select("id, generation_id, source")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        throw new Error("Flashcard not found");
      }
      throw checkError;
    }

    // If updating to ai-with-updates, verify generation access
    if (command.source === "ai-with-updates" && command.generation_id) {
      const isValid = await this.verifyGenerationBelongsToUser(command.generation_id, userId);
      if (!isValid) {
        const error = new Error(`Generation with ID ${command.generation_id} does not belong to the user`);
        error.name = "UNAUTHORIZED_GENERATION_ACCESS";
        throw error;
      }
    }

    // Update the flashcard
    const { data, error } = await this.supabase
      .from("flashcards")
      .update(command)
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    return data as FlashcardDTO;
  }

  /**
   * Deletes a flashcard with the given ID
   * @param id The ID of the flashcard to delete
   * @param userId The ID of the user performing the deletion
   * @returns void
   * @throws Error if the flashcard is not found or user does not have access
   */
  async deleteFlashcard(id: number, userId: string): Promise<void> {
    // Check if flashcard exists and belongs to user
    const { data, error: findError } = await this.supabase
      .from("flashcards")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !data) {
      throw new Error("Flashcard not found");
    }

    // Perform the delete operation
    const { error: deleteError } = await this.supabase.from("flashcards").delete().eq("id", id).eq("user_id", userId);

    if (deleteError) {
      throw deleteError;
    }
  }
}
