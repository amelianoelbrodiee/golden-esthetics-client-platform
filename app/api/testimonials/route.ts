import { cleanText } from "../../lib/forms";
import { getSupabasePublicClient, isSupabaseConfigured } from "../../lib/supabase/server";

// Public: list approved testimonials (featured first, newest next).
export async function GET() {
  if (!isSupabaseConfigured()) return Response.json({ testimonials: [], demo: true });
  const { data, error } = await getSupabasePublicClient()!
    .from("testimonials")
    .select("id,client_name,service,rating,quote,featured,created_at")
    .eq("approved", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);
  if (error) return Response.json({ testimonials: [] });
  return Response.json({ testimonials: data ?? [] });
}

// Public: submit a review. Always stored unapproved until McKinnley approves it.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clientName = cleanText(body.clientName, 80);
    const service = cleanText(body.service, 120);
    const quote = cleanText(body.quote, 1000);
    const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating) || 5)));
    if (!clientName) return Response.json({ error: "Please add your name." }, { status: 400 });
    if (quote.length < 4) return Response.json({ error: "Please share a little more about your visit." }, { status: 400 });
    if (!isSupabaseConfigured()) return Response.json({ ok: true, demo: true, message: "Demo mode: your review was received but not stored." });
    const { data, error } = await getSupabasePublicClient()!.rpc("submit_testimonial", {
      p_client_name: clientName,
      p_service: service || null,
      p_rating: rating,
      p_quote: quote,
    });
    if (error || !data) throw error || new Error("submit");
    return Response.json({ ok: true, demo: false, message: "Thank you ✦ Your review will appear once McKinnley approves it." });
  } catch {
    return Response.json({ error: "We couldn’t submit that just now. Please try again." }, { status: 500 });
  }
}
