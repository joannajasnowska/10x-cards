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
      // Return full email for proper user data synchronization
      userEmail: user?.email || null,
    }),
    { status: 200 }
  );
};
