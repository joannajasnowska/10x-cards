import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  // Input validation
  if (!email || !password) {
    return new Response(
      JSON.stringify({
        error: "Adres email i hasło są wymagane",
      }),
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

  const { data, error } = await supabase.auth.signInWithPassword({
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
};
