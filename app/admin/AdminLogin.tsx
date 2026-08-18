"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Full-page navigation is intentional at the auth boundary. */
import { useState } from "react";

export function AdminLogin({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<"signin" | "activate">("signin");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(data: FormData) {
    if (!configured) return;
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch(mode === "signin" ? "/api/admin/login" : "/api/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: data.get("displayName"), email: data.get("email"), password: data.get("password") }),
    });
    const body = await response.json();
    if (response.ok && mode === "signin") window.location.reload();
    else if (response.ok) {
      setMessage(body.message);
      setMode("signin");
      setBusy(false);
    } else {
      setError(body.error);
      setBusy(false);
    }
  }

  return <section className="admin-login">
    <div className="admin-login-brand"><span>GE</span><p>Golden Esthetics</p><small>Private business dashboard</small></div>
    <form action={submit}>
      <p className="eyebrow">Authorized access only</p>
      <h1>{mode === "signin" ? "Welcome back." : "Activate access."}</h1>
      <p>{mode === "signin" ? "McKinnley and Sparrow each sign in with their own private account." : "This works only for an email that the owner has already approved."}</p>
      {!configured && <div className="admin-config-note"><strong>Dashboard setup required</strong><p>Supabase must be connected before authorized accounts can sign in.</p></div>}
      {mode === "activate" && <label>Your name<input name="displayName" autoComplete="name" required disabled={!configured} /></label>}
      <label>Email<input name="email" type="email" autoComplete="username" required disabled={!configured} /></label>
      <label>Password<input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={mode === "signin" ? 8 : 10} disabled={!configured} /></label>
      <button className="button button-primary" disabled={!configured || busy}>{busy ? "Working…" : mode === "signin" ? "Sign in securely →" : "Activate approved account →"}</button>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      <button className="admin-mode-toggle" type="button" onClick={() => { setMode(mode === "signin" ? "activate" : "signin"); setError(""); }}>
        {mode === "signin" ? "First time? Activate an approved account" : "Already activated? Sign in"}
      </button>
      <div className="admin-login-help"><strong>Looking for appointments?</strong><span>Bookings, availability, rescheduling, and payments stay in McKinnley’s Square Dashboard. This login edits the Golden Esthetics website.</span></div>
      <a href="/">← Back to Golden Esthetics</a>
    </form>
  </section>;
}
