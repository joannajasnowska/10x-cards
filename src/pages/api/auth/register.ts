import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password, passwordConfirm } = await request.json();

  // Basic input validation
  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Adres email i hasło są wymagane" }), { status: 400 });
  }

  if (password !== passwordConfirm) {
    return new Response(JSON.stringify({ error: "Hasła nie są identyczne" }), { status: 400 });
  }

  // Create Supabase server client
  const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

  // Register the user without email verification (as per requirements)
  const { data, error } = await supabase.auth.signUp({
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
      errorMessage = "Hasło nie spełnia wymagań bezpieczeństwa (min. 6 znaków)";
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
};
