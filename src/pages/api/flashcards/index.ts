import type { APIRoute } from "astro";
import { z } from "zod";
import { supabaseClient } from "@/db/supabase.client";
import type { FlashcardsListResponseDTO } from "@/types";

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

// GET handler for flashcards listing
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    // Validate and parse query parameters
    const validatedParams = flashcardsQuerySchema.parse(params);
    const { page, limit, filter, sort, order } = validatedParams;

    // Get authenticated user from session
    const { supabase } = locals;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to access flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabaseClient
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order(sort, { ascending: order === "asc" })
      .range(from, to);

    // Apply text filtering if provided
    if (filter) {
      query = query.or(`front.ilike.%${filter}%,back.ilike.%${filter}%`);
    }

    // Execute query
    const { data, error, count } = await query;

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
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    // Validate request body
    const { flashcards } = createFlashcardsCommandSchema.parse(body);

    // Get authenticated user from session
    const { supabase } = locals;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to create flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Add user_id to each flashcard
    const flashcardsWithUser = flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: user.id,
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
