import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../db/supabase.client";

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient({ cookies, headers: request.headers });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return new Response(
    JSON.stringify({
      isAuthenticated: !!user,
      // Only return minimal user info if needed for UI personalization
      userEmail: user?.email ? user.email.split("@")[0] : null,
    }),
    { status: 200 }
  );
};
