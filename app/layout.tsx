/* eslint-disable @next/next/no-html-link-for-pages -- Vinext's production Link runtime currently crashes; full-page anchors keep navigation reliable. */
import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import "./globals.css";
import { business } from "./data/business";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { OpeningReveal } from "./components/OpeningReveal";

export async function generateMetadata():Promise<Metadata>{const h=await headers();const host=h.get("x-forwarded-host")||h.get("host")||"localhost:3000";const protocol=h.get("x-forwarded-proto")||("localhost"===host.split(":")[0]?"http":"https");const image=new URL("/og.png",`${protocol}://${host}`).toString();return{title:{default:"Golden Esthetics | Facials, Brows, Lashes & Waxing",template:"%s | Golden Esthetics"},description:"Personalized skincare, facials, brows, lashes and waxing by licensed esthetician McKinnley Golden.",openGraph:{title:"Golden Esthetics",description:"Your skin, but golden.",type:"website",images:[{url:image,width:1536,height:1024,alt:"Golden Esthetics — Your skin, but golden."}]},twitter:{card:"summary_large_image",title:"Golden Esthetics",description:"Your skin, but golden.",images:[image]}}}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><OpeningReveal /><Suspense fallback={null}><AnalyticsProvider /></Suspense>
    <header className="site-header"><div className="shell header-inner"><a className="brand" href="/" aria-label="Golden Esthetics home"><span>Golden</span><small>Esthetics</small></a><nav className="desktop-nav" aria-label="Main navigation"><a className="nav-assistant" href="/find-my-facial">Sparrow Skin Match ✦</a><a href="/about">Meet McKinnley</a><a href="/services">Services</a><a href="/reviews">Reviews</a><a href="/gallery">Gallery</a><a href="/faq">FAQ</a></nav><a className="header-book" href={business.squareBookingBaseUrl} target="_blank" rel="noreferrer">Book now ↗</a></div></header>
    <main>{children}</main>
    <footer><div className="shell footer-grid"><div><a className="brand footer-brand" href="/"><span>Golden</span><small>Esthetics</small></a><p>Personalized skincare and beauty services by McKinnley Golden.</p></div><div><h3>Explore</h3><a href="/about">Meet McKinnley</a><a href="/services">Services</a><a href="/reviews">Reviews</a><a href="/find-my-facial">Sparrow Skin Match</a><a href="/gallery">Gallery</a><a href="/contact">Contact</a></div><div><h3>Connect</h3><a href={`mailto:${business.email}`}>{business.email}</a><a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}>{business.phone}</a><a href={business.instagramUrl} target="_blank" rel="noreferrer">{business.instagram} ↗</a></div><div><h3>Booking</h3><a href={business.squareBookingBaseUrl} target="_blank" rel="noreferrer">Book through Square ↗</a><p className="muted">By appointment · Upstate South Carolina. Studio address is shared when you book.</p></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} Golden Esthetics</span><a href="/privacy">Privacy</a><span>Powered by Sparrow</span></div></footer>
    <nav className="mobile-nav" aria-label="Mobile navigation"><a href="/">Home</a><a href="/services">Services</a><a className="mobile-feature" href="/find-my-facial"><span>✦</span>Skin Match</a><a href={business.squareBookingBaseUrl} target="_blank" rel="noreferrer">Book</a></nav>
  </body></html>;
}
