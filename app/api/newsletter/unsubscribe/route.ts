import { getSupabasePublicClient } from "../../../lib/supabase/server";

function tokenFrom(request: Request, body?: FormData) {
  return String(body?.get("token") || new URL(request.url).searchParams.get("token") || "");
}

async function unsubscribe(token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return false;
  const db = getSupabasePublicClient();
  if (!db) return false;
  const { data, error } = await db.rpc("unsubscribe_newsletter", { p_token: token });
  return !error && Boolean(data);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("form") ? await request.formData() : undefined;
  const ok = await unsubscribe(tokenFrom(request, body));
  if (contentType.includes("form")) return Response.redirect(new URL(`/unsubscribe?status=${ok ? "success" : "invalid"}`, request.url), 303);
  return Response.json({ ok }, { status: ok ? 200 : 400 });
}

