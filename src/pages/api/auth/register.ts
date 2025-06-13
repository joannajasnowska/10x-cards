import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";
import { registerSchema } from "../../../schemas/auth";
import { ZodError } from "zod";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validatedData = registerSchema.parse(body);
    const { email, password } = validatedData;

    // Create Supabase server client
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    // Register the user without email verification (as per requirements)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login`,
        // No email verification needed as per requirements
        data: {},
      },
    });

    if (error) {
      let errorMessage = "Wystąpił błąd podczas rejestracji";

      // Provide more specific error messages based on error code
      if (error.message.includes("already registered")) {
        errorMessage = "Użytkownik z tym adresem email już istnieje";
      } else if (error.message.includes("password")) {
        errorMessage = "Hasło nie spełnia wymagań bezpieczeństwa";
      }

      return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
    }

    // Return success response with redirect URL - without exposing sensitive user data
    return new Response(
      JSON.stringify({
        success: true,
        redirect: "/login",
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      // Return validation errors
      const firstError = error.errors[0];
      return new Response(JSON.stringify({ error: firstError.message }), { status: 400 });
    }

    // Handle other errors
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas przetwarzania żądania" }), { status: 500 });
  }
};
