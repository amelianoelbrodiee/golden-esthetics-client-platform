"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { SiteContent } from "../lib/site-content";

type Metric = { label: string; value: string; detail: string };
type Lead = { id: string; name: string; email: string | null; phone: string | null; interest: string | null; message: string; status: string; created_at: string; consultation_summary: unknown };
type Admin = { id: string; user_id: string | null; email: string; role: string; display_name: string | null; active: boolean };
type GalleryItem = { id: string; category: string; service_performed: string | null; caption: string | null; service_date: string | null; before_image_url: string | null; after_image_url: string | null; featured: boolean; active: boolean; photo_consent_confirmed: boolean; sort_order: number; created_at: string };
export type DashboardData = { metrics: Metric[]; funnel: { label: string; value: number; percent: number }[]; leads: Lead[]; recommendations: { name: string; count: number }[]; goals: { name: string; count: number }[]; admins: Admin[]; galleryItems: GalleryItem[]; siteContent: SiteContent; insights: string[]; hasData: boolean };

export function AdminDashboard({ data, user }: { data: DashboardData; user: { displayName: string; email: string; role: string } }) {
  const [tab, setTab] = useState("Overview");
  const [leads, setLeads] = useState(data.leads);
  const [admins, setAdmins] = useState(data.admins);
  const [galleryItems, setGalleryItems] = useState(data.galleryItems);
  const [siteContent, setSiteContent] = useState(data.siteContent);
  const [accessStatus, setAccessStatus] = useState("");
  const [contentStatus, setContentStatus] = useState("");
  const [galleryStatus, setGalleryStatus] = useState("");
  const galleryForm = useRef<HTMLFormElement>(null);
  const tabs = ["Overview", "Content", "Gallery", "Recommendations", "Leads", "Access"];

  async function updateLead(id: string, status: string) {
    const response = await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (response.ok) setLeads(value => value.map(lead => lead.id === id ? { ...lead, status } : lead));
  }

  async function saveContent(formData: FormData) {
    setContentStatus("Saving live site content…");
    const response = await fetch("/api/admin/content", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const body = await response.json();
    if (response.ok) {
      setSiteContent(body.content);
      setContentStatus("Saved. The homepage now uses this content.");
    } else setContentStatus(body.error);
  }

  async function uploadGallery(formData: FormData) {
    setGalleryStatus("Uploading securely…");
    const response = await fetch("/api/admin/gallery", { method: "POST", body: formData });
    const body = await response.json();
    if (response.ok) {
      setGalleryItems(value => [body.item, ...value]);
      galleryForm.current?.reset();
      setGalleryStatus(body.item.active ? "Uploaded and published to the gallery." : "Uploaded as an unpublished dashboard draft.");
    } else setGalleryStatus(body.error);
  }

  async function updateGallery(id: string, updates: Partial<Pick<GalleryItem, "active" | "featured">>) {
    setGalleryStatus("Updating gallery…");
    const response = await fetch(`/api/admin/gallery/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    const body = await response.json();
    if (response.ok) {
      setGalleryItems(value => value.map(item => item.id === id ? body.item : item));
      setGalleryStatus("Gallery updated.");
    } else setGalleryStatus(body.error);
  }

  async function deleteGallery(id: string) {
    if (!window.confirm("Delete this gallery item and its stored photos? This cannot be undone.")) return;
    setGalleryStatus("Deleting gallery item…");
    const response = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    const body = await response.json();
    if (response.ok) {
      setGalleryItems(value => value.filter(item => item.id !== id));
      setGalleryStatus("Gallery item deleted.");
    } else setGalleryStatus(body.error);
  }

  async function addAdmin(formData: FormData) {
    setAccessStatus("Adding secure access…");
    const response = await fetch("/api/admin/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: formData.get("displayName"), email: formData.get("email") }) });
    const body = await response.json();
    if (response.ok) {
      setAdmins(value => [...value, body.admin]);
      setAccessStatus("Admin approved. They can now activate their account from this dashboard login page.");
    } else setAccessStatus(body.error);
  }

  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.reload(); }

  return <div className="admin-app">
    <aside className="admin-sidebar">
      <div className="admin-logo"><span>GE</span><div><strong>Golden Esthetics</strong><small>Business dashboard</small></div></div>
      <nav>{tabs.map(item => <button className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>{item}</button>)}</nav>
      <div className="admin-user"><span>{user.displayName.slice(0, 1)}</span><div><strong>{user.displayName}</strong><small>{user.role}</small></div><button onClick={logout}>Sign out</button></div>
    </aside>
    <main className="admin-main">
      <header><div><p className="eyebrow">Golden Esthetics</p><h1>{tab}</h1></div><span className={data.hasData ? "live-badge" : "empty-badge"}>{data.hasData ? "Live data" : "No activity yet"}</span></header>

      {tab === "Overview" && <>
        <section className="control-map">
          <article><p className="eyebrow">Appointments & payments</p><h2>Square stays in charge.</h2><p>McKinnley manages availability, appointments, rescheduling, clients, and payments with her existing Square account.</p><a className="button button-primary" href="https://squareup.com/dashboard" target="_blank" rel="noreferrer">Open Square Dashboard ↗</a></article>
          <article><p className="eyebrow">Website operations</p><h2>This dashboard edits the site.</h2><p>Use Content for homepage wording, Gallery for consent-approved photos, Leads for inquiries, and Access for the two private accounts.</p><button className="button button-quiet" onClick={() => setTab("Content")}>Edit the website →</button></article>
        </section>
        <section className="metric-grid">{data.metrics.map(item => <article key={item.label}><p>{item.label}</p><strong>{item.value}</strong><small>{item.detail}</small></article>)}</section>
        <section className="admin-columns">
          <article className="admin-panel"><p className="eyebrow">Conversion funnel</p><h2>Visitor to booking click</h2><div className="funnel-list">{data.funnel.map(item => <div key={item.label}><span>{item.label}<small>{item.value}</small></span><div><i style={{ width: `${Math.max(item.percent, 2)}%` }} /></div><strong>{item.percent}%</strong></div>)}</div></article>
          <article className="admin-panel"><p className="eyebrow">Calculated opportunities</p><h2>Worth a closer look</h2>{data.insights.length ? data.insights.map(item => <div className="insight" key={item}><span>✦</span><p>{item}</p></div>) : <p className="admin-empty">Insights will appear only when real activity supports them.</p>}</article>
        </section>
      </>}

      {tab === "Content" && <section className="admin-panel content-panel">
        <div className="panel-heading"><div><p className="eyebrow">Homepage editor</p><h2>Update the public wording</h2></div><a href="/" target="_blank" rel="noreferrer">View live homepage ↗</a></div>
        <p>These fields update the homepage without changing code. Leave the announcement blank to hide it.</p>
        <form action={saveContent} className="content-form">
          <label>Hero headline<input name="heroHeadline" defaultValue={siteContent.heroHeadline} required maxLength={100}/></label>
          <label>Hero supporting copy<textarea name="heroSupportingCopy" defaultValue={siteContent.heroSupportingCopy} required maxLength={320}/></label>
          <label>About McKinnley copy<textarea name="aboutCopy" defaultValue={siteContent.aboutCopy} required maxLength={800}/></label>
          <label>Announcement bar <small>Optional</small><input name="announcement" defaultValue={siteContent.announcement} maxLength={180} placeholder="Example: Now booking fall facials"/></label>
          <button className="button button-primary">Save homepage content</button>
          {contentStatus && <p className="dashboard-status" role="status">{contentStatus}</p>}
        </form>
      </section>}

      {tab === "Gallery" && <section className="gallery-manager">
        <article className="admin-panel">
          <p className="eyebrow">Portfolio upload</p><h2>Add client work</h2>
          <p>At least one photo is required. Only upload photos the client has explicitly approved for public marketing use.</p>
          <form ref={galleryForm} action={uploadGallery} className="gallery-upload-form">
            <label>Category<select name="category" required defaultValue="Facials"><option>Facials</option><option>Brows</option><option>Lashes</option><option>Waxing</option><option>Skincare</option></select></label>
            <label>Service performed<input name="servicePerformed" maxLength={120} placeholder="Hydrating Facial"/></label>
            <label>Before photo<input name="beforeImage" type="file" accept="image/jpeg,image/png,image/webp"/></label>
            <label>After photo<input name="afterImage" type="file" accept="image/jpeg,image/png,image/webp"/></label>
            <label>Service date<input name="serviceDate" type="date"/></label>
            <label className="form-wide">Caption<textarea name="caption" maxLength={600} placeholder="A short, client-safe description of the result"/></label>
            <label className="check-row form-wide"><input name="photoConsentConfirmed" type="checkbox" value="true" required/> I confirm the client approved these photos for public marketing use.</label>
            <div className="form-wide publish-options"><label className="check-row"><input name="active" type="checkbox" value="true"/> Publish immediately</label><label className="check-row"><input name="featured" type="checkbox" value="true"/> Feature first</label></div>
            <button className="button button-primary form-wide">Upload gallery item</button>
          </form>
          {galleryStatus && <p className="dashboard-status" role="status">{galleryStatus}</p>}
        </article>
        <div className="gallery-admin-list">{galleryItems.length ? galleryItems.map(item => {
          const preview = item.after_image_url || item.before_image_url;
          return <article key={item.id}>{preview && <Image src={preview} alt={`${item.service_performed || item.category} gallery preview`} width={360} height={260}/>}<div><p className="eyebrow">{item.category}</p><h3>{item.service_performed || "Golden Esthetics service"}</h3><small>{item.active ? "Published" : "Draft"}{item.featured ? " · Featured" : ""}</small><div className="gallery-admin-actions"><button onClick={() => updateGallery(item.id, { active: !item.active })}>{item.active ? "Unpublish" : "Publish"}</button><button onClick={() => updateGallery(item.id, { featured: !item.featured })}>{item.featured ? "Unfeature" : "Feature"}</button><button className="danger-action" onClick={() => deleteGallery(item.id)}>Delete</button></div></div></article>;
        }) : <div className="admin-panel admin-empty">No portfolio photos have been uploaded yet.</div>}</div>
      </section>}

      {tab === "Recommendations" && <section className="admin-columns">
        <article className="admin-panel"><p className="eyebrow">Facial matches</p><h2>Recommendation distribution</h2>{data.recommendations.length ? data.recommendations.map(item => <div className="rank-row" key={item.name}><span>{item.name}</span><strong>{item.count}</strong></div>) : <p className="admin-empty">No completed, opted-in consultation summaries yet.</p>}</article>
        <article className="admin-panel"><p className="eyebrow">Client interests</p><h2>Popular skin goals</h2>{data.goals.length ? data.goals.map(item => <div className="rank-row" key={item.name}><span>{item.name}</span><strong>{item.count}</strong></div>) : <p className="admin-empty">Goal trends will appear after clients opt in.</p>}</article>
      </section>}

      {tab === "Leads" && <section className="admin-panel leads-panel"><div className="panel-heading"><div><p className="eyebrow">Client inquiries</p><h2>Lead follow-up</h2></div><span>{leads.length} total</span></div>{leads.length ? <div className="lead-table">{leads.map(lead => <article key={lead.id}><div><strong>{lead.name}</strong><small>{lead.interest || "No interest selected"} · {new Date(lead.created_at).toLocaleDateString()}</small></div><p>{lead.message}</p><div><a href={lead.email ? `mailto:${lead.email}` : `tel:${lead.phone}`}>{lead.email || lead.phone}</a><select aria-label={`Status for ${lead.name}`} value={lead.status} onChange={event => updateLead(lead.id, event.target.value)}>{["New", "Contacted", "Booked", "Closed"].map(status => <option key={status}>{status}</option>)}</select></div></article>)}</div> : <p className="admin-empty">New contact-form inquiries will appear here.</p>}</section>}

      {tab === "Access" && <section className="admin-panel"><p className="eyebrow">Private access</p><h2>Owner & administrator</h2><div className="login-guide"><strong>McKinnley’s first login</strong><ol><li>Open <code>/admin</code> and choose “First time? Activate an approved account.”</li><li>Use <code>goldenesthetics12@gmail.com</code>, choose a private password, then confirm the Supabase email.</li><li>Return to <code>/admin</code> and sign in. Her owner account and your Sparrow admin account are the only pre-approved accounts.</li></ol></div><div className="access-list">{admins.map(admin => <article key={admin.id}><span>{(admin.display_name || admin.role).slice(0, 1)}</span><div><strong>{admin.display_name || "Authorized user"}</strong><small>{admin.email} · {admin.role === "owner" ? "Owner · full business authority" : "Admin · Sparrow site operations"}</small></div><i>{admin.user_id ? "Active" : "Invited"}</i></article>)}</div>{user.role === "owner" ? <form action={addAdmin} className="access-invite"><h3>Approve a Sparrow administrator</h3><p>Add the administrator’s email before they activate their account.</p><label>Name<input name="displayName" required/></label><label>Email<input name="email" type="email" required/></label><button className="button button-primary">Approve admin access</button>{accessStatus && <small role="status">{accessStatus}</small>}</form> : <p className="admin-empty">Only the owner can approve future access changes.</p>}</section>}
    </main>
  </div>;
}
