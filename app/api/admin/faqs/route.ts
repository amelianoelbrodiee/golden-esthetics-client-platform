import { getAdminSession } from "../../../lib/auth/admin";
import { getSupabaseUserClient } from "../../../lib/supabase/server";

const COLUMNS = "id,question,answer,sort_order,published,created_at";

// Admin: list every FAQ (published and hidden) for management.
export async function GET() {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await getSupabaseUserClient(session.accessToken)!
    .from("faqs")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return Response.json({ error: "FAQs could not be loaded" }, { status: 500 });
  return Response.json({ faqs: data ?? [] });
}

// Admin: create a new FAQ.
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";
  if (!question || !answer) {
    return Response.json({ error: "Both a question and an answer are required" }, { status: 400 });
  }
  const insert = {
    question: question.slice(0, 300),
    answer: answer.slice(0, 4000),
    sort_order: Number.isFinite(body.sort_order) ? Math.trunc(body.sort_order) : 0,
    published: body.published === false ? false : true,
  };
  const { data, error } = await getSupabaseUserClient(session.accessToken)!
    .from("faqs")
    .insert(insert)
    .select(COLUMNS)
    .maybeSingle();
  if (error || !data) return Response.json({ error: "FAQ could not be created" }, { status: 500 });
  return Response.json({ ok: true, item: data });
}
