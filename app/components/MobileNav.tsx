"use client";
import { useState, useEffect } from "react";
import { business } from "../data/business";

const menu = [
  { label: "Home", href: "/" },
  { label: "Meet McKinnley", href: "/about" },
  { label: "Find My Skin Match", href: "/find-my-facial" },
  { label: "Services", href: "/services" },
  { label: "Build My Appointment", href: "/build-my-appointment" },
  { label: "Your First Visit", href: "/#first-visit" },
  { label: "Reviews", href: "/reviews" },
  { label: "Gallery", href: "/gallery" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const close = () => setOpen(false);
  // Tuck the floating bar away once the footer comes into view so it doesn't hover over the end of the page.
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(([entry]) => setAtFooter(entry.isIntersecting), { rootMargin: "0px 0px -12% 0px" });
    io.observe(footer);
    return () => io.disconnect();
  }, []);
  return <>
    <div className={open ? "mobile-sheet-backdrop open" : "mobile-sheet-backdrop"} onClick={close} aria-hidden="true" />
    <div className={open ? "mobile-sheet open" : "mobile-sheet"} role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden={!open}>
      <span className="mobile-sheet-handle" />
      <p className="mobile-sheet-eyebrow">Explore</p><p className="mobile-sheet-title">Golden Esthetics</p>
      <div className="mobile-sheet-links">
        {menu.map(item => <a key={item.href} href={item.href} onClick={close}>{item.label}</a>)}
      </div>
      <a className="mobile-sheet-book" href={business.squareBookingBaseUrl} target="_blank" rel="noreferrer" onClick={close}>Book now ↗</a>
    </div>
    <nav className={atFooter && !open ? "mobile-nav is-hidden" : "mobile-nav"} aria-label="Mobile navigation">
      <a href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></svg><span>Home</span></a>
      <a className="mobile-feature" href="/find-my-facial"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c.6 4 1.4 5.4 6 6-4.6.6-5.4 1.4-6 6-.6-4.6-1.4-5.4-6-6 4.6-.6 5.4-1.4 6-6Z" /></svg><span>Skin Match</span></a>
      <a href={business.squareBookingBaseUrl} target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9.5h16M9 3v4M15 3v4" /></svg><span>Book</span></a>
      <button type="button" className="mobile-more" aria-expanded={open} aria-label="Open site menu" onClick={() => setOpen(v => !v)}><svg viewBox="0 0 24 24" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6 6 18" /> : <><path d="M4 7h16M4 12h16M4 17h16" /></>}</svg><span>Menu</span></button>
    </nav>
  </>;
}
