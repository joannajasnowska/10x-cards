import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    // Validation
    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Email jest wymagany",
          field: "email",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password-confirm`,
    });

    if (error) {
      let errorMessage = "Nie udało się wysłać emaila resetującego hasło";

      if (error.message.includes("rate limit")) {
        errorMessage = "Zbyt wiele prób resetowania hasła. Spróbuj ponownie później";
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          field: "email",
          code: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Link do resetowania hasła został wysłany na Twój adres email",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return new Response(
      JSON.stringify({
        error: "Błąd wewnętrzny serwera",
        field: "general",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
