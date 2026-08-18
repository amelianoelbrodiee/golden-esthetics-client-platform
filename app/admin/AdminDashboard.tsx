"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SiteContent } from "../lib/site-content";
import { services } from "../data/services";

type Metric = { label: string; value: string; detail: string };
type Lead = { id: string; name: string; email: string | null; phone: string | null; interest: string | null; message: string; status: string; created_at: string; consultation_summary: unknown };
type Admin = { id: string; user_id: string | null; email: string; role: string; display_name: string | null; active: boolean };
type GalleryItem = { id: string; category: string; service_performed: string | null; caption: string | null; service_date: string | null; before_image_url: string | null; after_image_url: string | null; featured: boolean; active: boolean; photo_consent_confirmed: boolean; sort_order: number; created_at: string };
type NewsletterCampaign = { subject: string; status: string; sent_count: number; failed_count: number; completed_at: string | null };
type Testimonial = { id: string; client_name: string; service: string | null; rating: number; quote: string; approved: boolean; featured: boolean; created_at: string };
type Faq = { id: string; question: string; answer: string; sort_order: number; published: boolean; created_at: string };
type SkinTest = { id: string; name: string | null; goals: string[] | null; skin_type: string | null; sensitivity: string | null; recommended_service_id: string | null; photo_used: boolean; analysis_mode: string | null; created_at: string };
export type DashboardData = { metrics: Metric[]; funnel: { label: string; value: number; percent: number }[]; leads: Lead[]; recommendations: { name: string; count: number }[]; goals: { name: string; count: number }[]; admins: Admin[]; galleryItems: GalleryItem[]; siteContent: SiteContent; insights: string[]; hasData: boolean; newsletter: { activeSubscribers: number; sendingConfigured: boolean; lastCampaign: NewsletterCampaign | null } };

export function AdminDashboard({ data, user }: { data: DashboardData; user: { displayName: string; email: string; role: string } }) {
  const [tab, setTab] = useState("Overview");
  const [leads, setLeads] = useState(data.leads);
  const [admins, setAdmins] = useState(data.admins);
  const [galleryItems, setGalleryItems] = useState(data.galleryItems);
  const [siteContent, setSiteContent] = useState(data.siteContent);
  const [accessStatus, setAccessStatus] = useState("");
  const [contentStatus, setContentStatus] = useState("");
  const [galleryStatus, setGalleryStatus] = useState("");
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");
  const galleryForm = useRef<HTMLFormElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoaded, setTestimonialsLoaded] = useState(false);
  const [testimonialStatus, setTestimonialStatus] = useState("");
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqsLoaded, setFaqsLoaded] = useState(false);
  const [faqStatus, setFaqStatus] = useState("");
  const [skinTests, setSkinTests] = useState<SkinTest[]>([]);
  const [skinTestsLoaded, setSkinTestsLoaded] = useState(false);
  const [skinTestStatus, setSkinTestStatus] = useState("");
  const tabs = ["Overview", "Content", "Gallery", "Testimonials", "FAQ", "Golden List", "Recommendations", "Leads", "Access"];

  useEffect(() => {
    if (tab !== "Testimonials" || testimonialsLoaded) return;
    fetch("/api/admin/testimonials")
      .then(response => response.json())
      .then(body => setTestimonials(Array.isArray(body.testimonials) ? body.testimonials : []))
      .catch(() => setTestimonialStatus("Testimonials could not be loaded."))
      .finally(() => setTestimonialsLoaded(true));
  }, [tab, testimonialsLoaded]);

  async function moderateTestimonial(id: string, updates: Partial<Pick<Testimonial, "approved" | "featured">>) {
    setTestimonialStatus("Updating…");
    const response = await fetch(`/api/admin/testimonials/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    const body = await response.json();
    if (response.ok) {
      setTestimonials(value => value.map(item => item.id === id ? body.item : item));
      setTestimonialStatus(body.item.approved ? "Live on the site." : "Hidden from the site.");
    } else setTestimonialStatus(body.error);
  }

  async function deleteTestimonial(id: string) {
    if (!window.confirm("Delete this review permanently? This cannot be undone.")) return;
    setTestimonialStatus("Deleting…");
    const response = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    const body = await response.json();
    if (response.ok) {
      setTestimonials(value => value.filter(item => item.id !== id));
      setTestimonialStatus("Review deleted.");
    } else setTestimonialStatus(body.error);
  }

  useEffect(() => {
    if (tab !== "FAQ" || faqsLoaded) return;
    fetch("/api/admin/faqs")
      .then(response => response.json())
      .then(body => setFaqs(Array.isArray(body.faqs) ? body.faqs : []))
      .catch(() => setFaqStatus("FAQs could not be loaded."))
      .finally(() => setFaqsLoaded(true));
  }, [tab, faqsLoaded]);

  const sortFaqs = (list: Faq[]) => [...list].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));

  async function createFaq(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setFaqStatus("Adding\u2026");
    const payload = { question: fd.get("question"), answer: fd.get("answer"), sort_order: Number(fd.get("sort_order")) || 0, published: fd.get("published") === "on" };
    const response = await fetch("/api/admin/faqs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json();
    if (response.ok) { setFaqs(value => sortFaqs([...value, body.item])); form.reset(); setFaqStatus("Question added and live on the site."); }
    else setFaqStatus(body.error);
  }

  async function saveFaq(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setFaqStatus("Saving\u2026");
    const payload = { question: fd.get("question"), answer: fd.get("answer"), sort_order: Number(fd.get("sort_order")) || 0 };
    const response = await fetch(`/api/admin/faqs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json();
    if (response.ok) { setFaqs(value => sortFaqs(value.map(item => item.id === id ? body.item : item))); setFaqStatus("Saved. Live on the site."); }
    else setFaqStatus(body.error);
  }

  async function toggleFaq(id: string, published: boolean) {
    setFaqStatus("Updating\u2026");
    const response = await fetch(`/api/admin/faqs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published }) });
    const body = await response.json();
    if (response.ok) { setFaqs(value => value.map(item => item.id === id ? body.item : item)); setFaqStatus(published ? "Now showing on the site." : "Hidden from the site."); }
    else setFaqStatus(body.error);
  }

  async function deleteFaq(id: string) {
    if (!window.confirm("Delete this FAQ permanently? This cannot be undone.")) return;
    setFaqStatus("Deleting\u2026");
    const response = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    const body = await response.json();
    if (response.ok) { setFaqs(value => value.filter(item => item.id !== id)); setFaqStatus("FAQ deleted."); }
    else setFaqStatus(body.error);
  }

  useEffect(() => {
    if (tab !== "Recommendations" || skinTestsLoaded) return;
    fetch("/api/admin/consultations")
      .then(response => response.json())
      .then(body => setSkinTests(Array.isArray(body.consultations) ? body.consultations : []))
      .catch(() => setSkinTestStatus("Skin test results could not be loaded."))
      .finally(() => setSkinTestsLoaded(true));
  }, [tab, skinTestsLoaded]);

  const serviceName = (id: string | null) => (id ? services.find(s => s.id === id)?.name ?? id : "No match recorded");

  useEffect(() => () => {
    if (beforePreview) URL.revokeObjectURL(beforePreview);
  }, [beforePreview]);
  useEffect(() => () => {
    if (afterPreview) URL.revokeObjectURL(afterPreview);
  }, [afterPreview]);

  function previewPhoto(file: File | undefined, side: "before" | "after") {
    const setter = side === "before" ? setBeforePreview : setAfterPreview;
    setter(file ? URL.createObjectURL(file) : "");
  }

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
    setGalleryBusy(true);
    setGalleryStatus("Uploading securely…");
    try {
      const response = await fetch("/api/admin/gallery", { method: "POST", body: formData });
      const body = await response.json();
      if (response.ok) {
        setGalleryItems(value => [body.item, ...value]);
        galleryForm.current?.reset();
        setBeforePreview("");
        setAfterPreview("");
        setGalleryStatus(body.item.active ? "Uploaded and published to the gallery." : "Uploaded as an unpublished dashboard draft.");
      } else setGalleryStatus(body.error);
    } finally {
      setGalleryBusy(false);
    }
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
      <select className="admin-tab-select" value={tab} onChange={event => setTab(event.target.value)} aria-label="Choose a section">{tabs.map(item => <option key={item} value={item}>{item}</option>)}</select>
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
          <p>Built for her phone: tap a photo box to take a picture or choose one from the camera roll. At least one photo is required.</p>
          <form ref={galleryForm} action={uploadGallery} className="gallery-upload-form">
            <label>Category<select name="category" required defaultValue="Facials"><option>Facials</option><option>Brows</option><option>Lashes</option><option>Waxing</option><option>Skincare</option></select></label>
            <label>Service performed<input name="servicePerformed" maxLength={120} placeholder="Hydrating Facial"/></label>
            <label className={`photo-picker${beforePreview ? " has-preview" : ""}`}><span>Before photo</span><input name="beforeImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => previewPhoto(event.currentTarget.files?.[0], "before")}/><span className="photo-picker-ui">{beforePreview ? <><Image unoptimized src={beforePreview} alt="Selected before photo preview" width={320} height={220}/><b>Tap to replace</b></> : <><b>＋ Add before photo</b><small>Take a photo or choose from camera roll</small></>}</span></label>
            <label className={`photo-picker${afterPreview ? " has-preview" : ""}`}><span>After photo</span><input name="afterImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => previewPhoto(event.currentTarget.files?.[0], "after")}/><span className="photo-picker-ui">{afterPreview ? <><Image unoptimized src={afterPreview} alt="Selected after photo preview" width={320} height={220}/><b>Tap to replace</b></> : <><b>＋ Add after photo</b><small>Take a photo or choose from camera roll</small></>}</span></label>
            <label>Service date<input name="serviceDate" type="date"/></label>
            <label className="form-wide">Caption<textarea name="caption" maxLength={600} placeholder="A short, client-safe description of the result"/></label>
            <label className="check-row form-wide"><input name="photoConsentConfirmed" type="checkbox" value="true" required/> I confirm the client approved these photos for public marketing use.</label>
            <div className="form-wide publish-options"><label className="check-row"><input name="active" type="checkbox" value="true" defaultChecked/> Publish immediately</label><label className="check-row"><input name="featured" type="checkbox" value="true"/> Feature first</label></div>
            <button className="button button-primary form-wide" disabled={galleryBusy}>{galleryBusy ? "Uploading photos…" : "Upload gallery item"}</button>
          </form>
          {galleryStatus && <p className="dashboard-status" role="status">{galleryStatus}</p>}
        </article>
        <div className="gallery-admin-list">{galleryItems.length ? galleryItems.map(item => {
          const preview = item.after_image_url || item.before_image_url;
          return <article key={item.id}>{preview && <Image src={preview} alt={`${item.service_performed || item.category} gallery preview`} width={360} height={260}/>}<div><p className="eyebrow">{item.category}</p><h3>{item.service_performed || "Golden Esthetics service"}</h3><small>{item.active ? "Published" : "Draft"}{item.featured ? " · Featured" : ""}</small><div className="gallery-admin-actions"><button onClick={() => updateGallery(item.id, { active: !item.active })}>{item.active ? "Unpublish" : "Publish"}</button><button onClick={() => updateGallery(item.id, { featured: !item.featured })}>{item.featured ? "Unfeature" : "Feature"}</button><button className="danger-action" onClick={() => deleteGallery(item.id)}>Delete</button></div></div></article>;
        }) : <div className="admin-panel admin-empty">No portfolio photos have been uploaded yet.</div>}</div>
      </section>}

      {tab === "Testimonials" && <section className="admin-panel leads-panel"><div className="panel-heading"><div><p className="eyebrow">Client reviews</p><h2>Approve what shows on the site</h2></div><span>{testimonials.filter(item => !item.approved).length} awaiting review</span></div>{testimonialStatus && <p className="dashboard-status" role="status">{testimonialStatus}</p>}{!testimonialsLoaded ? <p className="admin-empty">Loading reviews…</p> : testimonials.length ? <div className="lead-table">{testimonials.map(item => <article key={item.id}><div><strong>{item.client_name} · {"✦".repeat(item.rating)}</strong><small>{item.service || "No service noted"} · {new Date(item.created_at).toLocaleDateString()} · {item.approved ? "Published" : "Pending"}{item.featured ? " · Featured" : ""}</small></div><p>“{item.quote}”</p><div className="gallery-admin-actions"><button onClick={() => moderateTestimonial(item.id, { approved: !item.approved })}>{item.approved ? "Unpublish" : "Approve & publish"}</button><button onClick={() => moderateTestimonial(item.id, { featured: !item.featured })}>{item.featured ? "Unfeature" : "Feature"}</button><button className="danger-action" onClick={() => deleteTestimonial(item.id)}>Delete</button></div></article>)}</div> : <p className="admin-empty">No client reviews have been submitted yet.</p>}</section>}

      {tab === "FAQ" && <section className="admin-panel">
        <div className="panel-heading"><div><p className="eyebrow">Frequently asked questions</p><h2>Answer &amp; manage FAQs</h2></div><span>{faqs.length} question{faqs.length === 1 ? "" : "s"}</span></div>
        {faqStatus && <p className="dashboard-status" role="status">{faqStatus}</p>}
        <form className="faq-admin-form" onSubmit={createFaq}>
          <label>New question<input name="question" required placeholder="e.g. Do you offer gift cards?" /></label>
          <label>Answer<textarea name="answer" required placeholder="Write McKinnley’s answer…" /></label>
          <div className="faq-form-row">
            <label className="faq-order">Order<input name="sort_order" type="number" defaultValue={(faqs[faqs.length - 1]?.sort_order ?? faqs.length) + 1} /></label>
            <label className="check-row"><input type="checkbox" name="published" defaultChecked /> Show on site</label>
            <button className="button button-primary" type="submit">Add question</button>
          </div>
        </form>
        {!faqsLoaded ? <p className="admin-empty">Loading FAQs…</p> : faqs.length ? <div className="faq-admin-list">
          {faqs.map(item => <form key={item.id} className="faq-admin-item" onSubmit={event => saveFaq(event, item.id)}>
            <label>Question<input name="question" defaultValue={item.question} required /></label>
            <label>Answer<textarea name="answer" defaultValue={item.answer} required /></label>
            <div className="faq-item-actions">
              <label className="faq-order">Order<input name="sort_order" type="number" defaultValue={item.sort_order} /></label>
              <span className={item.published ? "setup-ready" : "setup-needed"}>{item.published ? "On site" : "Hidden"}</span>
              <button className="button button-quiet" type="submit">Save</button>
              <button type="button" onClick={() => toggleFaq(item.id, !item.published)}>{item.published ? "Hide" : "Publish"}</button>
              <button type="button" className="danger-action" onClick={() => deleteFaq(item.id)}>Delete</button>
            </div>
          </form>)}
        </div> : <p className="admin-empty">No FAQs yet. Add your first question above.</p>}
      </section>}

      {tab === "Golden List" && <section className="admin-columns newsletter-admin">
        <article className="admin-panel newsletter-schedule-card"><p className="eyebrow">Monthly newsletter</p><h2>The 15th, automatically.</h2><div className="newsletter-date"><strong>15</strong><span>Every month<br/>Morning delivery</span></div><p>A warm, seasonal skincare note is prepared for each month and the Vercel schedule runs at 14:00 UTC—morning in South Carolina.</p><span className={data.newsletter.sendingConfigured ? "setup-ready" : "setup-needed"}>{data.newsletter.sendingConfigured ? "Sending connected" : "Sending address needs connection"}</span></article>
        <article className="admin-panel"><p className="eyebrow">List health</p><h2>{data.newsletter.activeSubscribers} active subscriber{data.newsletter.activeSubscribers === 1 ? "" : "s"}</h2>{data.newsletter.lastCampaign ? <div className="campaign-summary"><strong>{data.newsletter.lastCampaign.subject}</strong><span>Status: {data.newsletter.lastCampaign.status}</span><span>{data.newsletter.lastCampaign.sent_count} sent · {data.newsletter.lastCampaign.failed_count} failed</span><small>{data.newsletter.lastCampaign.completed_at ? new Date(data.newsletter.lastCampaign.completed_at).toLocaleDateString() : "In progress"}</small></div> : <p className="admin-empty">The first campaign history will appear here after the first scheduled send.</p>}<div className="newsletter-note"><span>✦</span><p>Subscribers can unsubscribe themselves from every email. Their private email addresses stay in Supabase and never appear on the public site.</p></div></article>
      </section>}

      {tab === "Recommendations" && <section className="admin-columns">
        <article className="admin-panel"><p className="eyebrow">Facial matches</p><h2>Recommendation distribution</h2>{data.recommendations.length ? data.recommendations.map(item => <div className="rank-row" key={item.name}><span>{item.name}</span><strong>{item.count}</strong></div>) : <p className="admin-empty">No completed, opted-in consultation summaries yet.</p>}</article>
        <article className="admin-panel"><p className="eyebrow">Client interests</p><h2>Popular skin goals</h2>{data.goals.length ? data.goals.map(item => <div className="rank-row" key={item.name}><span>{item.name}</span><strong>{item.count}</strong></div>) : <p className="admin-empty">Goal trends will appear after clients opt in.</p>}</article>
      </section>}

      {tab === "Recommendations" && <section className="admin-panel skin-tests-panel">
        <div className="panel-heading"><div><p className="eyebrow">Completed results</p><h2>Skin test results</h2></div><span>{skinTests.length} completed</span></div>
        {skinTestStatus && <p className="dashboard-status" role="status">{skinTestStatus}</p>}
        {!skinTestsLoaded ? <p className="admin-empty">Loading skin test results…</p> : skinTests.length ? <div className="skin-test-list">
          {skinTests.map(item => <article key={item.id} className="skin-test-item">
            <div className="skin-test-head"><strong>{item.name ? item.name : "Anonymous"}<em>{serviceName(item.recommended_service_id)}</em></strong><small>{new Date(item.created_at).toLocaleDateString()} · {new Date(item.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small></div>
            <div className="skin-test-meta">
              {item.skin_type && <span>Skin: {item.skin_type}</span>}
              {item.sensitivity && <span>Sensitivity: {item.sensitivity}</span>}
              <span>{item.analysis_mode === "photo" || item.photo_used ? "Quiz + photo" : "Quiz only"}</span>
            </div>
            {item.goals && item.goals.length ? <div className="skin-test-goals">{item.goals.map(goal => <i key={goal}>{goal}</i>)}</div> : <p className="admin-empty">No goals selected.</p>}
          </article>)}
        </div> : <p className="admin-empty">No completed skin tests yet. Results appear here as clients finish the Sparrow Skin Match quiz.</p>}
      </section>}

      {tab === "Leads" && <section className="admin-panel leads-panel"><div className="panel-heading"><div><p className="eyebrow">Client inquiries</p><h2>Lead follow-up</h2></div><span>{leads.length} total</span></div>{leads.length ? <div className="lead-table">{leads.map(lead => <article key={lead.id}><div><strong>{lead.name}</strong><small>{lead.interest || "No interest selected"} · {new Date(lead.created_at).toLocaleDateString()}</small></div><p>{lead.message}</p><div><a href={lead.email ? `mailto:${lead.email}` : `tel:${lead.phone}`}>{lead.email || lead.phone}</a><select aria-label={`Status for ${lead.name}`} value={lead.status} onChange={event => updateLead(lead.id, event.target.value)}>{["New", "Contacted", "Booked", "Closed"].map(status => <option key={status}>{status}</option>)}</select></div></article>)}</div> : <p className="admin-empty">New contact-form inquiries will appear here.</p>}</section>}

      {tab === "Access" && <section className="admin-panel"><p className="eyebrow">Private access</p><h2>Owner & administrator</h2><div className="login-guide"><strong>First login for each of you</strong><ol><li>Open <a href="/admin"><code>golden-esthetics-client-platform.vercel.app/admin</code></a> and choose “First time? Activate an approved account.”</li><li>McKinnley uses <code>goldenesthetics12@gmail.com</code>. You use <code>amelianoelbrodiee@gmail.com</code>. Each person creates her own private password.</li><li>Open the Supabase confirmation email, then return to <code>/admin</code> and sign in.</li></ol><p>McKinnley’s Owner account has full business authority. Your Admin account manages the site without taking ownership away from her.</p></div><div className="access-list">{admins.map(admin => <article key={admin.id}><span>{(admin.display_name || admin.role).slice(0, 1)}</span><div><strong>{admin.display_name || "Authorized user"}</strong><small>{admin.email} · {admin.role === "owner" ? "Owner · full business authority" : "Admin · Sparrow site operations"}</small></div><i>{admin.user_id ? "Active" : "Needs activation"}</i></article>)}</div>{user.role === "owner" ? <form action={addAdmin} className="access-invite"><h3>Approve a Sparrow administrator</h3><p>Add the administrator’s email before they activate their account.</p><label>Name<input name="displayName" required/></label><label>Email<input name="email" type="email" required/></label><button className="button button-primary">Approve admin access</button>{accessStatus && <small role="status">{accessStatus}</small>}</form> : <p className="admin-empty">Only the owner can approve future access changes.</p>}</section>}
    </main>
  </div>;
}

