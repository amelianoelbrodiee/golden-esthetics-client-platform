import { getAdminSession } from "../../../../lib/auth/admin";
import { cleanText } from "../../../../lib/forms";
import { getSupabaseUserClient } from "../../../../lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.active === "boolean") updates.active = body.active;
    if (typeof body.featured === "boolean") updates.featured = body.featured;
    if (typeof body.caption === "string") updates.caption = cleanText(body.caption, 600) || null;
    const { data, error } = await getSupabaseUserClient(session.accessToken)!
      .from("gallery_items")
      .update(updates)
      .eq("id", id)
      .select("id,category,service_performed,caption,service_date,before_image_url,after_image_url,featured,active,photo_consent_confirmed,sort_order,created_at")
      .single();
    if (error) return Response.json({ error: "Gallery item was not updated." }, { status: 500 });
    return Response.json({ ok: true, item: data });
  } catch {
    return Response.json({ error: "Gallery item was not updated." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const db = getSupabaseUserClient(session.accessToken)!;
  const { data: item, error: readError } = await db.from("gallery_items").select("before_image_path,after_image_path").eq("id", id).maybeSingle();
  if (readError || !item) return Response.json({ error: "Gallery item was not found." }, { status: 404 });
  const { error: deleteError } = await db.from("gallery_items").delete().eq("id", id);
  if (deleteError) return Response.json({ error: "Gallery item was not deleted." }, { status: 500 });
  const paths = [item.before_image_path, item.after_image_path].filter((path): path is string => Boolean(path));
  if (paths.length) await db.storage.from("gallery").remove(paths);
  return Response.json({ ok: true });
}
