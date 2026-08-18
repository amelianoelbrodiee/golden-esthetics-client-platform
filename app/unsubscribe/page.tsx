import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Golden List preferences", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; status?: string }> }) {
  const { token = "", status } = await searchParams;
  return <main className="shell unsubscribe-page">
    <p className="eyebrow">The Golden List</p>
    <h1>{status === "success" ? "You’re all set." : "Inbox preferences"}</h1>
    {status === "success" ? <p>You have been unsubscribed. We’ll miss you, golden one.</p> : status === "invalid" ? <p>That unsubscribe link is no longer valid.</p> : <><p>Want to stop receiving the monthly Golden List note?</p><form action="/api/newsletter/unsubscribe" method="post"><input type="hidden" name="token" value={token}/><button className="button button-primary" disabled={!token}>Unsubscribe</button></form></>}
    <Link className="text-link" href="/">Return to Golden Esthetics</Link>
  </main>;
}

