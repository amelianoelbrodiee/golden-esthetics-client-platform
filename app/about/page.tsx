import type { Metadata } from "next";
import { business } from "../data/business";

export const metadata: Metadata = {
  title: "Meet McKinnley",
  description: "Meet McKinnley Golden, the licensed esthetician behind Golden Esthetics — personalized facials, brows, lashes, and waxing in a calm, welcoming space.",
};

export default function Page() {
  return <>
    <section className="page-hero shell">
      <p className="eyebrow">Meet your esthetician</p>
      <h1>Hi, I&rsquo;m<br /><em>McKinnley.</em></h1>
      <p>Licensed esthetician, skincare lover, and your biggest hype-woman for skin that feels like you.</p>
    </section>
    <section className="legal-page shell">
      <p>I&rsquo;m McKinnley Golden, the licensed esthetician behind Golden Esthetics. I created Golden as a calm, welcoming space where skincare and beauty finally feel personal &mdash; never rushed, never one-size-fits-all, and never judgmental.</p>
      <p>Every service starts with you: your skin, your goals, and how you actually want to feel when you walk out. Whether it&rsquo;s your very first facial or your hundredth, I&rsquo;ll talk you through what I&rsquo;m doing and why, so you leave knowing your skin a little better than when you came in.</p>
      <h2>What I do</h2>
      <p>Golden Esthetics offers customized facials, brow shaping and tinting, brow lamination, lash lifts and tints, and waxing. Not sure what&rsquo;s right for you? My Sparrow Skin Match quiz can point you in the right direction &mdash; or just message me and we&rsquo;ll figure it out together.</p>
      <h2>My promise</h2>
      <p>Comfortable, honest, and tailored to you. I believe great skin is built on consistency and kindness &mdash; not pressure or a shelf full of products you don&rsquo;t need. Come as you are, and we&rsquo;ll build a glow that feels entirely your own.</p>
      <div className="button-row">
        <a className="button button-primary" href="/find-my-facial">Find your facial ✦</a>
        <a className="button button-quiet" href={business.squareBookingBaseUrl} target="_blank" rel="noreferrer">Book with McKinnley ↗</a>
      </div>
    </section>
  </>;
}
