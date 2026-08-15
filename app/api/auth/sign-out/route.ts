import { createSupabaseServerClient } from "@/server/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  return Response.json({ destination: "/sign-in" });
}
