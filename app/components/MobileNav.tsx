"use client";
import { useState } from "react";
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
  const close = () => setOpen(false);
  return <>
    <div className={open ? "mobile-sheet-backdrop open" : "mobile-sheet-backdrop"} onClick={close} aria-hidden="true" />
    <div className={open ? "mobile-sheet open" : "mobile-sheet"} role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden={!open}>
      <span className="mobile-sheet-handle" />
      <p className="mobile-sheet-title">Explore Golden</p>
      <div className="mobile-sheet-links">
        {menu.map(item => <a key={item.href} href={item.href} onClick={close}>{item.label}</a>)}
      </div>
      <a className="mobile-sheet-book" href={business.squareBookingBaseUrl} target="_blank" rel="noreferrer" onClick={close}>Book now ↗</a>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <a href="/">Home</a>
      <a href="/services">Services</a>
      <a className="mobile-feature" href="/find-my-facial"><span>✦</span>Skin Match</a>
      <a href={business.squareBookingBaseUrl} target="_blank" rel="noreferrer">Book</a>
      <button type="button" className="mobile-more" aria-expanded={open} aria-label="Open site menu" onClick={() => setOpen(v => !v)}><span>{open ? "✕" : "☰"}</span>Menu</button>
    </nav>
  </>;
}
