import type { Metadata } from "next";
import { getSupabasePublicClient } from "../lib/supabase/server";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about booking, first visits, prep, and policies at Golden Esthetics.",
};

// Refresh the published FAQs at most once a minute.
export const revalidate = 60;

// Fallback content — shown until the `faqs` table is created in Supabase, or if
// no published FAQs exist yet. Keeps the page identical to before the migration.
const fallback: [string, string][] = [
  ["What should I book for my first visit?", "If you’re not sure where to start, take the Sparrow Skin Match quiz — it recommends a facial based on your skin goals. The Quick Fix or a Customized Facial are both great first appointments. You can also message McKinnley and she’ll help you choose."],
  ["How do I book an appointment?", "All appointments are booked through Golden Esthetics’ Square page — just tap “Book now” anywhere on the site. You’ll choose your service, date, and time, and receive a confirmation with the details."],
  ["Where are you located?", "Golden Esthetics is based in the Upstate South Carolina area. Your exact studio address and parking details are included when you book through Square, so you’ll have everything you need before your appointment."],
  ["What is your cancellation policy?", "Life happens! McKinnley just asks for at least 24 hours’ notice to cancel or reschedule so the spot can be offered to someone else. Arriving late may mean a shortened service so the day stays on schedule for everyone."],
  ["Do students receive a discount?", "Yes — students receive 15% off with a valid student ID. Final pricing is confirmed at your appointment."],
  ["How should I prep for a facial?", "Come with clean skin if you can, and if your skin is sensitive, skip strong actives like retinol or exfoliating acids for a couple of days beforehand. Let McKinnley know about any new products, recent treatments, or medications so she can keep your service safe and comfortable."],
  ["How should I prep for waxing?", "For the best results, let hair grow to about a quarter inch — roughly two weeks of growth. Avoid retinoids and strong exfoliants on the area for a few days before and after your appointment."],
  ["Are your services medical treatments?", "No — Golden Esthetics offers cosmetic skincare and beauty services, not medical care or diagnosis. If you have a skin condition that needs medical attention, McKinnley will always recommend seeing a dermatologist."],
];

async function loadFaqs(): Promise<{ question: string; answer: string }[]> {
  try {
    const client = getSupabasePublicClient();
    if (!client) return [];
    const { data, error } = await client
      .from("faqs")
      .select("question,answer")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !Array.isArray(data)) return [];
    return data as { question: string; answer: string }[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const live = await loadFaqs();
  const list = live.length ? live : fallback.map(([question, answer]) => ({ question, answer }));
  return <section className="page-hero shell"><p className="eyebrow">Good to know</p><h1>Frequently asked<br /><em>questions.</em></h1><div className="faq-list">{list.map(item => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></section>;
}
