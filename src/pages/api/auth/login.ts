import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: "Email i hasło są wymagane",
          field: !email ? "email" : "password",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage = "Uwierzytelnienie nie powiodło się";
      let field = "general";

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Nieprawidłowy email lub hasło";
        field = "credentials";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Proszę potwierdzić swój adres email";
        field = "email";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Zbyt wiele prób logowania. Spróbuj ponownie później";
        field = "rate_limit";
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          field,
          code: error.message,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.user || !data.session) {
      return new Response(
        JSON.stringify({
          error: "Logowanie nie powiodło się - nie utworzono sesji",
          field: "general",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Set auth cookies
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

    // Return user data for client-side store synchronization
    const userData = {
      id: data.user.id,
      email: data.user.email || "",
      name: data.user.user_metadata?.name || (data.user.email ? data.user.email.split("@")[0] : "User"),
      avatar_url: data.user.user_metadata?.avatar_url,
      created_at: data.user.created_at,
    };

    return new Response(
      JSON.stringify({
        success: true,
        user: userData,
        sessionExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        message: "Logowanie pomyślne",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
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
