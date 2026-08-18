import { cleanText } from "../../lib/forms";
import { getSupabasePublicClient, isSupabaseConfigured } from "../../lib/supabase/server";

const allowedGoals = new Set(["breakouts", "dryness", "dullness", "visible redness", "sensitivity", "uneven-looking tone", "dark spots", "hyperpigmentation", "sun spots", "fine lines", "smoother-looking texture", "hydration", "glow", "preventative skincare", "not sure"]);

export async function POST(request: Request) {
  try {
    const b = await request.json();
    const goals = Array.isArray(b.goals) ? b.goals.filter((x: unknown) => typeof x === "string" && allowedGoals.has(x)).slice(0, 15) : [];
    const base = {
      goals,
      skin_type: cleanText(b.skinType, 40),
      sensitivity: cleanText(b.sensitivity, 40),
      recommended_service_id: cleanText(b.recommendation, 80),
      photo_used: Boolean(b.photoUsed),
      analysis_mode: cleanText(b.analysisMode, 20) || null,
    };
    const name = cleanText(b.name, 80) || null;
    if (!isSupabaseConfigured()) return Response.json({ ok: true, demo: true });
    const client = getSupabasePublicClient()!;
    // Insert with the name. If the `name` column hasn't been added yet, retry
    // without it so the quiz keeps working through the migration window.
    let { error } = await client.from("consultations").insert({ ...base, name });
    if (error && name !== null) ({ error } = await client.from("consultations").insert(base));
    if (error) throw error;
    return Response.json({ ok: true, demo: false });
  } catch {
    return Response.json({ error: "Consultation insight was not stored" }, { status: 400 });
  }
}
