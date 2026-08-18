"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "../lib/analytics";

type Testimonial = {
  id: string;
  client_name: string;
  service: string | null;
  rating: number;
  quote: string;
  featured?: boolean;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="testimonial-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} aria-hidden="true" className={index < rating ? "on" : ""}>
          ✦
        </i>
      ))}
    </span>
  );
}

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/testimonials")
      .then(response => response.json())
      .then(body => {
        if (active) setItems(Array.isArray(body.testimonials) ? body.testimonials : []);
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  async function submit(data: FormData) {
    setBusy(true);
    setStatus("");
    const response = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: data.get("clientName"),
        service: data.get("service"),
        rating,
        quote: data.get("quote"),
      }),
    });
    const body = await response.json();
    setStatus(body.message || body.error);
    setBusy(false);
    if (response.ok) {
      setDone(true);
      trackEvent("testimonial_submitted", { rating, demo: Boolean(body.demo) });
    }
  }

  return (
    <section className="section shell testimonials" id="reviews">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Kind words</p>
          <h2>Loved by Golden clients</h2>
        </div>
        <a className="text-link" href="#leave-a-review">Leave a review →</a>
      </div>

      {loaded && items.length > 0 && (
        <div className="testimonial-grid">
          {items.map(item => (
            <article key={item.id} className={`testimonial-card${item.featured ? " is-featured" : ""}`}>
              <Stars rating={item.rating} />
              <p className="testimonial-quote">“{item.quote}”</p>
              <footer>
                <strong>{item.client_name}</strong>
                {item.service && <small>{item.service}</small>}
              </footer>
            </article>
          ))}
        </div>
      )}

      {loaded && items.length === 0 && (
        <p className="testimonial-empty">Be the first to share your Golden Esthetics experience ✦</p>
      )}

      <div className="testimonial-form-card" id="leave-a-review">
        <div>
          <p className="eyebrow">Share your glow</p>
          <h3>Leave a review</h3>
          <p>Loved your visit? Tell McKinnley about it. Approved reviews appear right here on the site.</p>
        </div>
        {done ? (
          <p className="testimonial-thanks" role="status">{status}</p>
        ) : (
          <form action={submit} className="testimonial-form">
            <div className="testimonial-rating-input" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  type="button"
                  key={value}
                  className={value <= rating ? "on" : ""}
                  aria-pressed={value === rating}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  onClick={() => setRating(value)}
                >
                  ✦
                </button>
              ))}
            </div>
            <input name="clientName" required maxLength={80} placeholder="Your name" autoComplete="name" />
            <input name="service" maxLength={120} placeholder="Service · optional (e.g. Hydrating Facial)" />
            <textarea name="quote" required maxLength={1000} rows={4} placeholder="Tell us about your experience…" />
            <button className="button button-primary" disabled={busy}>{busy ? "Sending…" : "Submit review ✦"}</button>
            {status && !done && <small role="status">{status}</small>}
          </form>
        )}
      </div>
    </section>
  );
}
