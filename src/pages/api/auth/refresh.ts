import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    // Get the current session to check if refresh is needed
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({
          error: "Nie znaleziono ważnej sesji",
          requiresLogin: true,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      return new Response(
        JSON.stringify({
          error: "Nie udało się odświeżyć sesji",
          requiresLogin: true,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update cookies with new tokens
    cookies.set("sb-access-token", data.session.access_token, {
      path: "/",
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
    });

    cookies.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
    });

    // Return success with updated session info
    return new Response(
      JSON.stringify({
        success: true,
        sessionExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        message: "Sesja została pomyślnie odświeżona",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    return new Response(
      JSON.stringify({
        error: "Błąd wewnętrzny serwera podczas odświeżania sesji",
        requiresLogin: true,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
