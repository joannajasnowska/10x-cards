import type { APIRoute } from "astro";
import { z } from "zod";
import { supabaseClient, DEFAULT_USER_ID } from "@/db/supabase.client";

// Schema for flashcard update
const updateFlashcardSchema = z.object({
  front: z.string().max(200, "Przód fiszki nie może być dłuższy niż 200 znaków").optional(),
  back: z.string().max(500, "Tył fiszki nie może być dłuższy niż 500 znaków").optional(),
  source: z.enum(["manual", "ai-complete", "ai-with-updates"]).optional(),
  generation_id: z.number().nullable().optional(),
});

export const prerender = false;

// GET handler for retrieving a single flashcard
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
        status: 400,
      });
    }

    const flashcardId = Number(id);

    // Retrieve the flashcard
    const { data, error } = await supabaseClient
      .from("flashcards")
      .select("*")
      .eq("id", flashcardId)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error retrieving flashcard:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400 }
    );
  }
};

// PUT handler for updating a flashcard
export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
        status: 400,
      });
    }

    const flashcardId = Number(id);
    const body = await request.json();

    // Validate request body
    const updateData = updateFlashcardSchema.parse(body);

    // Update the flashcard
    const { data, error } = await supabaseClient
      .from("flashcards")
      .update(updateData)
      .eq("id", flashcardId)
      .eq("user_id", DEFAULT_USER_ID) // Ensure user can only update their own flashcards
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400 }
    );
  }
};

// DELETE handler for deleting a flashcard
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(JSON.stringify({ error: "Invalid flashcard ID" }), {
        status: 400,
      });
    }

    const flashcardId = Number(id);

    // Delete the flashcard
    const { error } = await supabaseClient
      .from("flashcards")
      .delete()
      .eq("id", flashcardId)
      .eq("user_id", DEFAULT_USER_ID); // Ensure user can only delete their own flashcards

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // Return success with no content
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400 }
    );
  }
};
