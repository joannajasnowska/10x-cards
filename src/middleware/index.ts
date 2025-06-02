import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register"];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Initialize supabase client for this request
  const supabase = createSupabaseServerClient({
    cookies,
    headers: request.headers,
  });

  // Store supabase client in locals for use in routes
  locals.supabase = supabase;

  // Check if the route is public
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Get the current session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Add user data to locals for use in routes
    locals.user = {
      id: user.id,
      email: user.email,
    };
    return next();
  } else {
    // Redirect to login for protected routes
    return redirect("/login");
  }
});
