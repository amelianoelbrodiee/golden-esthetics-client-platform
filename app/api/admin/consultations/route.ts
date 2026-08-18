import { getAdminSession } from "../../../lib/auth/admin";
import { getSupabaseUserClient } from "../../../lib/supabase/server";

// Admin: list completed Sparrow Skin Match results (photo-free — the table never
// stores an image, only whether a photo was used). Newest first.
export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await getSupabaseUserClient(session.accessToken)!
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) return Response.json({ error: "Skin test results could not be loaded" }, { status: 500 });
  return Response.json({ consultations: data ?? [] });
}
