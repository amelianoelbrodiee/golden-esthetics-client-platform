import { getMonthlyIssue, monthKey, renderGoldenListEmail } from "../../../lib/newsletter";
import { getSupabaseAdminClient } from "../../../lib/supabase/server";

export const maxDuration = 60;

type Subscriber = { id: string; email: string; first_name: string | null; unsubscribe_token: string };

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.GOLDEN_LIST_FROM_EMAIL;
  const db = getSupabaseAdminClient();
  if (!resendKey || !from || !db) {
    return Response.json({ error: "Golden List sending is not configured yet." }, { status: 503 });
  }

  const now = new Date();
  const key = monthKey(now);
  const issue = getMonthlyIssue(now);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://golden-esthetics-client-platform.vercel.app").replace(/\/$/, "");
  const { data: existing } = await db.from("newsletter_campaigns").select("id,status").eq("month_key", key).maybeSingle();
  if (existing?.status === "sent") return Response.json({ ok: true, skipped: true, reason: "already_sent", month: key });

  const { data: campaign, error: campaignError } = await db.from("newsletter_campaigns").upsert({
    month_key: key,
    subject: issue.subject,
    preview_text: issue.preview,
    status: "sending",
    started_at: now.toISOString(),
    error_message: null,
  }, { onConflict: "month_key" }).select("id").single();
  if (campaignError || !campaign) return Response.json({ error: "Could not start the campaign." }, { status: 500 });

  const [{ data, error }, { data: previouslySent }] = await Promise.all([
    db.from("newsletter_subscribers").select("id,email,first_name,unsubscribe_token").eq("active", true).order("created_at"),
    db.from("newsletter_deliveries").select("subscriber_id").eq("campaign_id", campaign.id).eq("status", "sent"),
  ]);
  if (error) return Response.json({ error: "Could not load subscribers." }, { status: 500 });
  const sentIds = new Set((previouslySent ?? []).map(item => item.subscriber_id));
  const subscribers = ((data ?? []) as Subscriber[]).filter(subscriber => !sentIds.has(subscriber.id));

  for (let offset = 0; offset < subscribers.length; offset += 100) {
    const batch = subscribers.slice(offset, offset + 100);
    const messages = batch.map(subscriber => {
      const unsubscribePage = `${siteUrl}/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
      const unsubscribePost = `${siteUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
      const email = renderGoldenListEmail(issue, { firstName: subscriber.first_name, siteUrl, unsubscribeUrl: unsubscribePage });
      return {
        from,
        to: [subscriber.email],
        reply_to: process.env.GOLDEN_LIST_REPLY_TO || "goldenesthetics12@gmail.com",
        subject: issue.subject,
        html: email.html,
        text: email.text,
        headers: { "List-Unsubscribe": `<${unsubscribePost}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        tags: [{ name: "campaign", value: key.replace("-", "_") }],
      };
    });
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "User-Agent": "golden-esthetics-newsletter/1.0",
        "Idempotency-Key": `golden-list-${key}-${Math.floor(offset / 100)}`,
      },
      body: JSON.stringify(messages),
    });
    const result = await response.json().catch(() => null) as { data?: { id: string }[]; message?: string } | null;
    if (!response.ok || !result?.data) {
      await db.from("newsletter_deliveries").upsert(batch.map(subscriber => ({ campaign_id: campaign.id, subscriber_id: subscriber.id, status: "failed", error_message: result?.message || `Resend error ${response.status}` })), { onConflict: "campaign_id,subscriber_id" });
      continue;
    }
    await db.from("newsletter_deliveries").upsert(batch.map((subscriber, index) => ({ campaign_id: campaign.id, subscriber_id: subscriber.id, status: "sent", provider_message_id: result.data?.[index]?.id ?? null, sent_at: new Date().toISOString(), error_message: null })), { onConflict: "campaign_id,subscriber_id" });
  }

  const [sentResult, failedResult] = await Promise.all([
    db.from("newsletter_deliveries").select("*", { count: "exact", head: true }).eq("campaign_id", campaign.id).eq("status", "sent"),
    db.from("newsletter_deliveries").select("*", { count: "exact", head: true }).eq("campaign_id", campaign.id).eq("status", "failed"),
  ]);
  const sentCount = sentResult.count ?? 0;
  const failedCount = failedResult.count ?? 0;
  const finalStatus = failedCount ? (sentCount ? "partial" : "failed") : "sent";
  await db.from("newsletter_campaigns").update({ status: finalStatus, sent_count: sentCount, failed_count: failedCount, completed_at: new Date().toISOString(), error_message: failedCount ? `${failedCount} delivery records failed.` : null }).eq("id", campaign.id);
  return Response.json({ ok: failedCount === 0, month: key, status: finalStatus, sent: sentCount, failed: failedCount }, { status: failedCount && !sentCount ? 502 : 200 });
}

