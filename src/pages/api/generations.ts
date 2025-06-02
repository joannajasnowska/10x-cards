import { z } from "zod";
import type { APIRoute } from "astro";
import type { InitiateGenerationCommand } from "../../types";
import { GenerationsService } from "../../lib/services/generations.service";

// Validation schema for the generation request
const GenerationRequestSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text cannot exceed 10000 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { supabase } = locals;

    // Get authenticated user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to generate flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = GenerationRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command = validationResult.data as InitiateGenerationCommand;
    const generationsService = new GenerationsService(supabase);

    // Pass the authenticated user's ID to the service
    const result = await generationsService.initiateGeneration(command, user.id);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
