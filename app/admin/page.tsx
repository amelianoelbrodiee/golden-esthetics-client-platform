import type { Metadata } from "next";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard, type DashboardData } from "./AdminDashboard";
import { getAdminSession } from "../lib/auth/admin";
import { getSupabaseUserClient, isSupabaseConfigured } from "../lib/supabase/server";
import { services } from "../data/services";
import { siteContentFromRows } from "../lib/site-content";

export const metadata: Metadata = { title: "Business Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
const pct = (n: number, d: number) => d ? Math.round(n / d * 100) : 0;

async function getDashboardData(accessToken: string): Promise<DashboardData> {
  const db = getSupabaseUserClient(accessToken)!;
  const countEvent = async (name: string) => {
    const { count } = await db.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", name);
    return count ?? 0;
  };
  const [views, starts, completed, bookingClicks, contactLeads, subscribers, consultations, leads, admins, gallery, settings, campaigns] = await Promise.all([
    countEvent("page_view"), countEvent("quiz_started"), countEvent("quiz_completed"), countEvent("booking_clicked"),
    db.from("leads").select("*", { count: "exact", head: true }),
    db.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("active", true),
    db.from("consultations").select("recommended_service_id,goals"),
    db.from("leads").select("id,name,email,phone,interest,message,status,created_at,consultation_summary").order("created_at", { ascending: false }).limit(100),
    db.from("admin_users").select("id,user_id,email,role,display_name,active").order("role", { ascending: false }),
    db.from("gallery_items").select("id,category,service_performed,caption,service_date,before_image_url,after_image_url,featured,active,photo_consent_confirmed,sort_order,created_at").order("featured", { ascending: false }).order("created_at", { ascending: false }),
    db.from("business_settings").select("key,value").in("key", ["homepage.hero_headline", "homepage.hero_supporting_copy", "homepage.about_copy", "homepage.announcement"]),
    db.from("newsletter_campaigns").select("subject,status,sent_count,failed_count,completed_at").order("created_at", { ascending: false }).limit(1),
  ]);
  const recCounts = new Map<string, number>();
  const goalCounts = new Map<string, number>();
  for (const consultation of consultations.data ?? []) {
    if (consultation.recommended_service_id) recCounts.set(consultation.recommended_service_id, (recCounts.get(consultation.recommended_service_id) ?? 0) + 1);
    for (const goal of consultation.goals ?? []) goalCounts.set(goal, (goalCounts.get(goal) ?? 0) + 1);
  }
  const recommendations = [...recCounts].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ name: services.find(x => x.id === id)?.name ?? id, count }));
  const goals = [...goalCounts].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  const insights: string[] = [];
  if (goals[0]) insights.push(`${goals[0].name} is currently the most common opted-in skincare goal.`);
  if (recommendations[0] && bookingClicks < completed) insights.push(`${recommendations[0].name} leads recommendations, while booking clicks trail completed consultations. Review the result-page call to action.`);
  return {
    metrics: [
      { label: "Website visitors", value: String(views), detail: "Recorded page views" },
      { label: "Find My Facial starts", value: String(starts), detail: `${pct(completed, starts)}% completion rate` },
      { label: "Completed consultations", value: String(completed), detail: "Anonymous analytics events" },
      { label: "Booking clicks", value: String(bookingClicks), detail: `${pct(bookingClicks, Math.max(completed, 1))}% of completions` },
      { label: "Contact leads", value: String(contactLeads.count ?? 0), detail: "Client inquiries" },
      { label: "Golden List", value: String(subscribers.count ?? 0), detail: "Active subscribers" },
    ],
    funnel: [
      { label: "Visitors", value: views, percent: 100 }, { label: "Consultation start", value: starts, percent: pct(starts, views) },
      { label: "Consultation complete", value: completed, percent: pct(completed, views) }, { label: "Recommendation", value: completed, percent: pct(completed, views) },
      { label: "Booking click", value: bookingClicks, percent: pct(bookingClicks, views) },
    ],
    leads: leads.data ?? [], recommendations, goals, admins: admins.data ?? [], insights,
    galleryItems: gallery.data ?? [], siteContent: siteContentFromRows(settings.data),
    newsletter: {
      activeSubscribers: subscribers.count ?? 0,
      sendingConfigured: Boolean(process.env.CRON_SECRET && process.env.RESEND_API_KEY && process.env.GOLDEN_LIST_FROM_EMAIL && process.env.SUPABASE_SECRET_KEY),
      lastCampaign: campaigns.data?.[0] ?? null,
    },
    hasData: views + starts + completed + bookingClicks + (contactLeads.count ?? 0) > 0,
  };
}

export default async function Page() {
  const configured = isSupabaseConfigured();
  if (!configured) return <AdminLogin configured={false} />;
  const session = await getAdminSession();
  if (!session) return <AdminLogin configured />;
  return <AdminDashboard data={await getDashboardData(session.accessToken)} user={session} />;
}

