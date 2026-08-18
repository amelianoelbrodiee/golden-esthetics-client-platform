import { getAdminSession } from "../../../lib/auth/admin";
import { cleanText } from "../../../lib/forms";
import { siteContentRows, type SiteContent } from "../../../lib/site-content";
import { getSupabaseUserClient } from "../../../lib/supabase/server";

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Authorized owner or admin access required." }, { status: 401 });
  try {
    const body = await request.json();
    const content: SiteContent = {
      heroHeadline: cleanText(body.heroHeadline, 100),
      heroSupportingCopy: cleanText(body.heroSupportingCopy, 320),
      aboutCopy: cleanText(body.aboutCopy, 800),
      announcement: cleanText(body.announcement, 180),
    };
    if (!content.heroHeadline || !content.heroSupportingCopy || !content.aboutCopy) {
      return Response.json({ error: "Headline, supporting copy, and about copy are required." }, { status: 400 });
    }
    const db = getSupabaseUserClient(session.accessToken)!;
    const { error } = await db.from("business_settings").upsert(siteContentRows(content), { onConflict: "key" });
    if (error) return Response.json({ error: "Site content could not be saved." }, { status: 500 });
    return Response.json({ ok: true, content });
  } catch {
    return Response.json({ error: "Site content could not be saved." }, { status: 500 });
  }
}
