import { getAdminSession } from "../../../../lib/auth/admin";
import { getSupabaseUserClient } from "../../../../lib/supabase/server";

// Admin: approve / unapprove / feature a testimonial.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const updates: { approved?: boolean; featured?: boolean; updated_at: string } = { updated_at: new Date().toISOString() };
  if (typeof body.approved === "boolean") updates.approved = body.approved;
  if (typeof body.featured === "boolean") updates.featured = body.featured;
  if (updates.approved === undefined && updates.featured === undefined) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }
  const { data, error } = await getSupabaseUserClient(session.accessToken)!
    .from("testimonials")
    .update(updates)
    .eq("id", id)
    .select("id,client_name,service,rating,quote,approved,featured,created_at")
    .maybeSingle();
  if (error || !data) return Response.json({ error: "Testimonial was not updated" }, { status: 500 });
  return Response.json({ ok: true, item: data });
}

// Admin: delete a testimonial.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await getSupabaseUserClient(session.accessToken)!
    .from("testimonials")
    .delete()
    .eq("id", id);
  if (error) return Response.json({ error: "Testimonial was not deleted" }, { status: 500 });
  return Response.json({ ok: true });
}
