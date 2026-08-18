import { getAdminSession } from "../../../../lib/auth/admin";
import { getSupabaseUserClient } from "../../../../lib/supabase/server";

const COLUMNS = "id,question,answer,sort_order,published,created_at";

// Admin: edit a FAQ's text, order, or published state.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const updates: { question?: string; answer?: string; sort_order?: number; published?: boolean; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };
  if (typeof body.question === "string" && body.question.trim()) updates.question = body.question.trim().slice(0, 300);
  if (typeof body.answer === "string" && body.answer.trim()) updates.answer = body.answer.trim().slice(0, 4000);
  if (typeof body.published === "boolean") updates.published = body.published;
  if (Number.isFinite(body.sort_order)) updates.sort_order = Math.trunc(body.sort_order);
  if (Object.keys(updates).length === 1) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }
  const { data, error } = await getSupabaseUserClient(session.accessToken)!
    .from("faqs")
    .update(updates)
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error || !data) return Response.json({ error: "FAQ was not updated" }, { status: 500 });
  return Response.json({ ok: true, item: data });
}

// Admin: delete a FAQ.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await getSupabaseUserClient(session.accessToken)!
    .from("faqs")
    .delete()
    .eq("id", id);
  if (error) return Response.json({ error: "FAQ was not deleted" }, { status: 500 });
  return Response.json({ ok: true });
}
