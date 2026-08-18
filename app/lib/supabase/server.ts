import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let publicClient: SupabaseClient | null | undefined;

function getConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function isSupabaseConfigured() {
  const { url, key } = getConfig();
  return Boolean(url && key);
}

export function getSupabasePublicClient() {
  if (publicClient !== undefined) return publicClient;
  const { url, key } = getConfig();
  if (!url || !key) return (publicClient = null);
  publicClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "golden-esthetics-web" } },
  });
  return publicClient;
}

export function getSupabaseUserClient(accessToken: string) {
  const { url, key } = getConfig();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Client-Info": "golden-esthetics-admin",
      },
    },
  });
}
