import { getSupabasePublicClient, isSupabaseConfigured } from "./supabase/server";

export type SiteContent = {
  heroHeadline: string;
  heroSupportingCopy: string;
  aboutCopy: string;
  announcement: string;
};

export const defaultSiteContent: SiteContent = {
  heroHeadline: "Your skin, but golden.",
  heroSupportingCopy: "Personalized skincare, brows, lashes & waxing by licensed esthetician McKinnley Golden.",
  aboutCopy: "I’m here to make skincare and beauty services feel personal, comfortable, and easy to understand. We’ll focus on your goals and build an experience that feels entirely your own.",
  announcement: "",
};

const keyMap: Record<string, keyof SiteContent> = {
  "homepage.hero_headline": "heroHeadline",
  "homepage.hero_supporting_copy": "heroSupportingCopy",
  "homepage.about_copy": "aboutCopy",
  "homepage.announcement": "announcement",
};

export function siteContentFromRows(rows: { key: string; value: unknown }[] | null | undefined): SiteContent {
  const content = { ...defaultSiteContent };
  for (const row of rows ?? []) {
    const field = keyMap[row.key];
    if (field && typeof row.value === "string") content[field] = row.value;
  }
  return content;
}

export async function getPublicSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured()) return defaultSiteContent;
  const { data, error } = await getSupabasePublicClient()!
    .from("business_settings")
    .select("key,value")
    .eq("is_public", true)
    .in("key", Object.keys(keyMap));
  return error ? defaultSiteContent : siteContentFromRows(data);
}

export function siteContentRows(content: SiteContent) {
  const values: Record<keyof SiteContent, string> = content;
  return Object.entries(keyMap).map(([key, field]) => ({
    key,
    value: values[field],
    is_public: true,
    updated_at: new Date().toISOString(),
  }));
}
