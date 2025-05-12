import { z } from "zod";

/**
 * Schema for manually created flashcards
 */
export const createFlashcardManualSchema = z.object({
  front: z.string().max(200, "Front text cannot exceed 200 characters"),
  back: z.string().max(500, "Back text cannot exceed 500 characters"),
  source: z.literal("manual"),
  generation_id: z.null(),
});

/**
 * Schema for AI-generated flashcards (complete or with updates)
 */
export const createFlashcardAiSchema = z.object({
  front: z.string().max(200, "Front text cannot exceed 200 characters"),
  back: z.string().max(500, "Back text cannot exceed 500 characters"),
  source: z.enum(["ai-complete", "ai-with-updates"]),
  generation_id: z.number(),
});

/**
 * Combined schema for any flashcard type using discriminated union based on source
 */
export const createFlashcardSchema = z.discriminatedUnion("source", [
  createFlashcardManualSchema,
  createFlashcardAiSchema,
]);

/**
 * Schema for a batch of flashcards creation request
 */
export const createFlashcardsSchema = z.object({
  flashcards: z
    .array(createFlashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(50, "Maximum 50 flashcards allowed per request"),
});

/**
 * Schema for validating query parameters when listing flashcards
 */
export const listFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z.enum(["id", "created_at", "updated_at", "front", "back"]).optional().default("id"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  filter: z.string().optional(),
  source: z.enum(["manual", "ai-complete", "ai-with-updates"]).optional(),
  created_after: z.coerce.string().datetime().optional(),
  created_before: z.coerce.string().datetime().optional(),
  has_generation: z.enum(["true", "false"]).optional(),
});

/**
 * Schema for validating flashcard ID parameter
 * Ensures the ID is a positive integer
 */
export const flashcardIdSchema = z.number().int().positive("Flashcard ID must be a positive integer");

/**
 * Schema for validating flashcard updates
 * At least one field must be provided for update
 */
export const updateFlashcardSchema = z
  .object({
    front: z.string().max(200, "Front text cannot exceed 200 characters").optional(),
    back: z.string().max(500, "Back text cannot exceed 500 characters").optional(),
    source: z
      .enum(["manual", "ai-with-updates"], {
        errorMap: () => ({ message: "Source must be either 'manual' or 'ai-with-updates'" }),
      })
      .optional(),
    generation_id: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
