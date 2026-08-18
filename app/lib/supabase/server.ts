import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let publicClient: SupabaseClient | null | undefined;
let adminClient: SupabaseClient | null | undefined;

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

export function getSupabaseAdminClient() {
  if (adminClient !== undefined) return adminClient;
  const { url } = getConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return (adminClient = null);
  adminClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "golden-esthetics-newsletter" } },
  });
  return adminClient;
}

