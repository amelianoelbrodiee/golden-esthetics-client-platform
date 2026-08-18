import { getAdminSession } from "../../../lib/auth/admin";
import { getSupabaseUserClient } from "../../../lib/supabase/server";

// Admin: list every testimonial (approved and pending) for moderation.
export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await getSupabaseUserClient(session.accessToken)!
    .from("testimonials")
    .select("id,client_name,service,rating,quote,approved,featured,created_at")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Testimonials could not be loaded" }, { status: 500 });
  return Response.json({ testimonials: data ?? [] });
}
