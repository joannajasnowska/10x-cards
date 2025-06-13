import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      // Even if Supabase logout fails, we should clear cookies
    }

    // Clear auth cookies
    cookies.delete("sb-access-token", {
      path: "/",
    });

    cookies.delete("sb-refresh-token", {
      path: "/",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Wylogowanie pomyślne",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);

    // Always clear cookies even if there's an error
    cookies.delete("sb-access-token", {
      path: "/",
    });

    cookies.delete("sb-refresh-token", {
      path: "/",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Wylogowanie zakończone (z błędami)",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
