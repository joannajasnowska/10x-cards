import type { APIRoute } from "astro";
import { z } from "zod";
import { supabaseClient, DEFAULT_USER_ID } from "@/db/supabase.client";
import type { CreateFlashcardsCommand, FlashcardsListResponseDTO } from "@/types";

// Schema for query parameters
const flashcardsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(10),
  filter: z.string().optional(),
  sort: z.enum(["created_at", "updated_at"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Schema for flashcard creation
const createFlashcardSchema = z.object({
  front: z.string().max(200, "Przód fiszki nie może być dłuższy niż 200 znaków"),
  back: z.string().max(500, "Tył fiszki nie może być dłuższy niż 500 znaków"),
  source: z.enum(["manual", "ai-complete", "ai-with-updates"]),
  generation_id: z.number().nullable(),
});

const createFlashcardsCommandSchema = z.object({
  flashcards: z.array(createFlashcardSchema),
});

export const prerender = false;

// GET handler for listing flashcards
export const GET: APIRoute = async ({ request }) => {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const { page, limit, filter, sort, order } = flashcardsQuerySchema.parse(params);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseClient
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", DEFAULT_USER_ID)
      .order(sort, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    // Apply search filter if provided
    if (filter) {
      query = query.or(`front.ilike.%${filter}%,back.ilike.%${filter}%`);
    }

    // Execute query
    const { data, count, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // Prepare response
    const response: FlashcardsListResponseDTO = {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400 }
    );
  }
};

// POST handler for creating flashcards
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate request body
    const { flashcards } = createFlashcardsCommandSchema.parse(body);

    // Add user_id to each flashcard
    const flashcardsWithUser = flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: DEFAULT_USER_ID,
    }));

    // Insert flashcards
    const { data, error } = await supabaseClient.from("flashcards").insert(flashcardsWithUser).select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating flashcards:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400 }
    );
  }
};
