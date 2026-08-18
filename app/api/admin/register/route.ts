import { getSupabaseAuthClient } from "../../../lib/auth/admin";
import { cleanText, isEmail } from "../../../lib/forms";
import { isSupabaseConfigured } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return Response.json({ error: "Admin access has not been configured yet." }, { status: 503 });
  try {
    const body = await request.json();
    const email = cleanText(body.email, 254).toLowerCase();
    const password = String(body.password ?? "");
    const displayName = cleanText(body.displayName, 100);
    if (!isEmail(email) || password.length < 10 || !displayName) {
      return Response.json({ error: "Enter your name, approved email, and a password with at least 10 characters." }, { status: 400 });
    }
    const auth = getSupabaseAuthClient()!;
    const { data, error } = await auth.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName }, emailRedirectTo: new URL("/admin", request.url).toString() },
    });
    if (error) return Response.json({ error: "Account activation could not be completed. If you already activated, use Sign in." }, { status: 400 });
    if (data.session) await auth.auth.signOut();
    return Response.json({
      ok: true,
      message: data.session ? "Access activated. You can sign in now." : "Check your email to confirm the account, then return here to sign in.",
    });
  } catch {
    return Response.json({ error: "Account activation is unavailable right now." }, { status: 500 });
  }
}
