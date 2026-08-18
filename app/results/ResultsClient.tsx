"use client";
import { useEffect, useState } from "react";
import { services } from "../data/services";
import type { ConsultationAnswers, Recommendation } from "../lib/recommendations";
import type { SkinAnalysisResult } from "../lib/ai/skin-analysis";
import { generateRoutineSuggestion } from "../lib/routine";

type Stored = { answers: ConsultationAnswers; recommendation: Recommendation; analysis?: SkinAnalysisResult | null; photoUsed?: boolean; createdAt: string };

export default function ResultsClient() {
  const [data, setData] = useState<Stored | null | undefined>();
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem("golden-consultation");
        setData(raw ? JSON.parse(raw) : null);
      } catch { setData(null); }
    });
  }, []);
  if (data === undefined) return <div className="result-loading">Preparing your glow…</div>;
  if (!data) return <section className="placeholder-page shell"><p className="eyebrow">No result yet</p><h1>Let’s find your <em>Golden Match.</em></h1><p>Complete the Sparrow skin quiz to receive a service recommendation.</p><a className="button button-primary" href="/find-my-facial">Open Sparrow Skin Match</a></section>;
  const service = services.find(x => x.id === data.recommendation.serviceId)!;
  const addOns = services.filter(x => data.recommendation.addOnIds.includes(x.id));
  const goldenRoutine = generateRoutineSuggestion(data.answers);
  const snapshots = [
    { title: "Skin behavior", text: `You described your skin as ${data.answers.skinType}.` },
    { title: "Sensitivity", text: `You reported that your skin is ${data.answers.sensitivity}.` },
    { title: "Your goals", text: data.answers.goals.slice(0, 4).join(", ") },
  ];
  return <>
    <section className="results-hero"><div className="shell"><p className="eyebrow">Sparrow Skin Match · your personalized result</p><h1>Your Golden Match <span>✦</span></h1><p>Based on your quiz and optional on-device photo cues—not a medical scan or diagnosis.</p></div></section>
    <section className="shell result-section"><div className="snapshot-grid">{snapshots.map(x => <article key={x.title}><span>✦</span><h3>{x.title}</h3><p>{x.text}</p></article>)}</div>
      {data.analysis && <div className="analysis-block"><div className="analysis-heading"><div><p className="eyebrow">Sparrow photo assistant</p><h2>Your cosmetic skin snapshot</h2></div><span className="demo-badge">Analyzed on your device</span></div><div className="snapshot-grid">{data.analysis.observations.map(x => <article key={x.category}><span>✦</span><h3>{x.label}</h3><p>{x.description}</p></article>)}</div><p className="fine-print">{data.analysis.disclaimer} Your original photo never left this browser and was not added to the saved result.</p></div>}
      <div className="recommendation-panel"><div className="recommendation-copy"><p className="eyebrow">Your Golden recommendation</p><h2>{service.name}</h2><strong className="result-price">{service.priceLabel}</strong><p>{service.description}</p><p>{data.recommendation.reason}</p><div className="matched-goals">{data.recommendation.matchedGoals.map(x => <span key={x}>{x}</span>)}</div>{data.recommendation.caution && <div className="caution"><strong>A gentle note</strong><p>{data.recommendation.caution}</p></div>}<div className="button-row"><a className="button button-primary" href={service.bookingUrl} target="_blank" rel="noreferrer">Book This Facial ↗</a><a className="button button-quiet" href="mailto:goldenesthetics12@gmail.com?subject=Question about my Golden recommendation">Ask McKinnley</a></div></div><div className="recommendation-seal"><span>GE</span><small>Your Golden<br />Match</small><i>✦</i></div></div>
    </section>
    {addOns.length > 0 && <section className="addons-section"><div className="shell"><p className="eyebrow">Optional finishing touches</p><h2>Complete your glow.</h2><div className="addon-grid">{addOns.map(x => <article key={x.id}><div><h3>{x.name}</h3><p>{x.description}</p></div><strong>{x.priceLabel}</strong></article>)}</div><p className="fine-print">Add-ons are optional and subject to McKinnley’s confirmation before treatment.</p></div></section>}
    <section className="golden-routine"><div className="shell"><div className="routine-heading"><div><p className="eyebrow">Your Golden Routine</p><h2>Simple steps, thoughtful care.</h2><p>{goldenRoutine.intro}</p></div><span>Category guidance only<br/>No product prescriptions</span></div><div className="routine-columns">{goldenRoutine.routine.map(period=><article key={period.time}><h3>{period.time}</h3><ol>{period.steps.map(step=><li key={step.name}><span>{step.name}</span><p>{step.reason}</p></li>)}</ol></article>)}</div><div className="routine-bottom"><p>This educational routine does not replace advice from a dermatologist or other licensed medical professional. McKinnley-approved products can be added in a future phase.</p><a className="button button-quiet" href="/build-my-appointment">Build My Appointment →</a></div></div></section>
    <section className="result-footer shell"><a className="text-link" href="/find-my-facial">Retake consultation</a><button className="text-link" onClick={() => navigator.clipboard?.writeText(`${service.name} — My Golden Esthetics recommendation`)}>Copy my recommendation</button></section>
  </>;
}
