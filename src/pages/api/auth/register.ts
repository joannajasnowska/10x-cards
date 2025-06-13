import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

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

    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          error: "Hasło musi mieć co najmniej 8 znaków",
          field: "password",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split("@")[0],
        },
      },
    });

    if (error) {
      let errorMessage = "Rejestracja nie powiodła się";
      let field = "general";

      if (error.message.includes("User already registered")) {
        errorMessage = "Konto z tym adresem email już istnieje";
        field = "email";
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Hasło jest zbyt słabe";
        field = "password";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Proszę wprowadzić prawidłowy adres email";
        field = "email";
      } else if (error.message.includes("Sign ups not allowed")) {
        errorMessage = "Rejestracja jest obecnie wyłączona";
        field = "general";
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          field,
          code: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({
          error: "Rejestracja nie powiodła się - nie utworzono użytkownika",
          field: "general",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If session is created (auto-login after registration)
    if (data.session) {
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
          message: "Registration successful",
          requiresEmailConfirmation: false,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Email confirmation required
      return new Response(
        JSON.stringify({
          success: true,
          message: "Registration successful. Please check your email to confirm your account.",
          requiresEmailConfirmation: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        field: "general",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
