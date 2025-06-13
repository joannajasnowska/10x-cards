import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";
import { loginSchema } from "../../../schemas/auth";
import { ZodError } from "zod";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage = "Wystąpił błąd podczas logowania";

      // Provide more specific error messages based on error code
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Nieprawidłowy adres email lub hasło";
      }

      return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
    }

    // Return success response with redirect URL - without exposing sensitive user data
    return new Response(
      JSON.stringify({
        isAuthenticated: true,
        redirect: "/generator",
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
