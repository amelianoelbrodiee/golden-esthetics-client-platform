import { getAdminSession } from "../../../lib/auth/admin";
import { cleanText, isEmail } from "../../../lib/forms";
import { getSupabaseUserClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "owner") return Response.json({ error: "Owner access required." }, { status: 403 });
  try {
    const body = await request.json();
    const email = cleanText(body.email, 254).toLowerCase();
    const displayName = cleanText(body.displayName, 100);
    if (!isEmail(email) || !displayName) return Response.json({ error: "Enter a valid name and email." }, { status: 400 });
    const db = getSupabaseUserClient(session.accessToken)!;
    const { data, error } = await db.from("admin_users").insert({ email, display_name: displayName, role: "admin", active: true }).select("id,user_id,email,role,display_name,active").single();
    if (error) return Response.json({ error: error.code === "23505" ? "That email is already approved." : "Access could not be added." }, { status: 400 });
    return Response.json({ ok: true, admin: data });
  } catch {
    return Response.json({ error: "Access could not be added." }, { status: 500 });
  }
}
