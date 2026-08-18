import { cleanText, isEmail } from "../../lib/forms";
import { getSupabasePublicClient, isSupabaseConfigured } from "../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = cleanText(body.email, 254).toLowerCase();
    const firstName = cleanText(body.firstName, 80);
    if (!isEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!isSupabaseConfigured()) return Response.json({ ok: true, demo: true, message: "Demo mode: your signup was accepted but not stored." });
    const { data, error } = await getSupabasePublicClient()!.rpc("subscribe_newsletter", {
      p_email: email,
      p_first_name: firstName || null,
      p_source: cleanText(body.source, 80) || "website",
    });
    if (error || !data) throw error || new Error("signup");
    return Response.json({ ok: true, demo: false, message: "You’re on the Golden List ✦" });
  } catch {
    return Response.json({ error: "Signup is unavailable right now. Please try again." }, { status: 500 });
  }
}

