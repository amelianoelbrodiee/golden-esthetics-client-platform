import { GoldenList } from "./components/GoldenList";
import { ServiceCard } from "./components/ServiceCard";
import { featuredServices } from "./data/services";
import { getPublicSiteContent } from "./lib/site-content";

export const dynamic = "force-dynamic";

function splitHeadline(headline: string) {
  const comma = headline.indexOf(",");
  if (comma === -1) return { first: headline, second: "" };
  return { first: headline.slice(0, comma + 1), second: headline.slice(comma + 1).trim() };
}
 
export default async function Home() {
  const content = await getPublicSiteContent();
  const headline = splitHeadline(content.heroHeadline);
  return <>
    {content.announcement && <div className="site-announcement"><span>✦</span>{content.announcement}</div>}
    <section className="hero shell"><div className="hero-copy"><p className="eyebrow">Golden Esthetics · Licensed Esthetician</p><h1>{headline.first}{headline.second && <><br/><em>{headline.second}</em></>}</h1><p className="lede">{content.heroSupportingCopy}</p><div className="button-row"><a className="button button-primary" href="/find-my-facial">Try Sparrow Skin Match <span>✦</span></a><a className="button button-quiet" href="/services">Explore services</a></div><div className="trust-row"><span>✦ Personalized care</span><span>✦ Thoughtful treatments</span><span>✦ A glow that feels like you</span></div></div><div className="hero-portrait"><div className="portrait-placeholder">
  <img
    src="/kinnley profile pic.jpg"
    alt="McKinnley of Golden Esthetics"
    className="portrait-image"
  />
</div>><div className="portrait-note"><strong>Care, customized.</strong><br/>Every service begins with you.</div></div></section>
    <section className="match-section"><div className="shell match-grid"><div><p className="eyebrow">Not sure where to start?</p><h2>Meet your<br/><em>Golden Match.</em></h2></div><div className="match-card"><span className="match-mark">✦</span><p className="assistant-label">Sparrow-powered · private on-device photo option</p><h3>Find My Facial</h3><p>Use the skin quiz alone or add a photo. Sparrow combines your answers with non-medical visual cues to recommend a facial from McKinnley’s actual menu.</p><div className="mini-steps"><span>01 Skin quiz</span><span>02 Photo optional</span><span>03 Your match</span></div><a className="text-link" href="/find-my-facial">Open Sparrow Skin Match →</a></div></div></section>
    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">The treatment menu</p><h2>Glow favorites</h2></div><a className="text-link" href="/services">View every service →</a></div><div className="service-grid">{featuredServices.map((service, index) => <ServiceCard key={service.id} service={service} index={index}/>)}</div></section>
    <section className="about-preview shell"><div className="about-art"><span>G</span><i>✦</i></div><div className="about-copy"><p className="eyebrow">Meet your esthetician</p><h2>Hi, I’m<br/><em>McKinnley.</em></h2><p>{content.aboutCopy}</p><a className="text-link" href="/about">More about McKinnley →</a></div></section>
    <section className="builder-band"><div className="shell builder-inner"><div><p className="eyebrow">More than one thing in mind?</p><h2>Build your perfect appointment.</h2></div><p>Mix a facial with brows, lashes, or waxing and see what fits your goals and budget.</p><a className="button button-light" href="/build-my-appointment">Build My Appointment</a></div></section>
    <section className="section shell first-time"><div className="section-heading"><div><p className="eyebrow">Your first visit</p><h2>New here? You’re in the right place.</h2></div></div><div className="steps-grid">{[["01","Find your service","Use Find My Facial or explore the treatment menu."],["02","Book with Square","Choose a time through Golden Esthetics’ secure Square page."],["03","Come as you are","McKinnley will talk through your goals before your service."]].map(step => <article key={step[0]}><span>{step[0]}</span><h3>{step[1]}</h3><p>{step[2]}</p></article>)}</div><div className="student-note"><span>Student glow ✦</span><strong>Students receive 15% off with student ID.</strong><small>Final eligibility and pricing are confirmed by Golden Esthetics.</small></div></section>
    <GoldenList/>
    <section className="booking-cta"><div className="shell"><p className="eyebrow">Your glow is waiting</p><h2>Ready when you are.</h2><p>Choose your service and book directly with Golden Esthetics.</p><a className="button button-primary" href="https://golden-esthetics-101699.square.site/" target="_blank" rel="noreferrer">Book an Appointment ↗</a></div></section>
  </>;
}
