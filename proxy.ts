import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const accessCookie = "ge-admin-access";
const refreshCookie = "ge-admin-refresh";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const access = request.cookies.get(accessCookie)?.value;
  const refresh = request.cookies.get(refreshCookie)?.value;
  let response = NextResponse.next({ request });
  if (!url || !key || !access || !refresh) return response;

  const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await auth.auth.getUser(access);
  if (!error) return response;

  const { data } = await auth.auth.refreshSession({ refresh_token: refresh });
  if (!data.session) return response;
  request.cookies.set(accessCookie, data.session.access_token);
  request.cookies.set(refreshCookie, data.session.refresh_token);
  response = NextResponse.next({ request });
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
  response.cookies.set(accessCookie, data.session.access_token, { ...options, maxAge: data.session.expires_in });
  response.cookies.set(refreshCookie, data.session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 });
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
