"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { emptyConsultation, generateRecommendation, sensitivityLevels, skinGoals, skinTypes, strongProducts, type ConsultationAnswers } from "../lib/recommendations";
import type { SkinAnalysisResult } from "../lib/ai/skin-analysis";
import { analyzePhotoOnDevice } from "../lib/ai/on-device-analysis";
import { trackEvent } from "../lib/analytics";

const labels = ["Your focus", "Your skin", "Your routine", "A final note", "Photo optional"];
function ToggleList({ options, selected, onChange, single = false }: { options: readonly string[]; selected: string[]; onChange: (v: string[]) => void; single?: boolean }) {
  return <div className="choice-grid">{options.map(x => <button type="button" aria-pressed={selected.includes(x)} className={selected.includes(x) ? "choice selected" : "choice"} key={x} onClick={() => onChange(single ? [x] : selected.includes(x) ? selected.filter(y => y !== x) : [...selected.filter(y => y !== "none"), x])}><span>{selected.includes(x) ? "✓" : "✦"}</span>{x}</button>)}</div>;
}

export default function ConsultationWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ConsultationAnswers>(emptyConsultation);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [shareInsights, setShareInsights] = useState(false);
  const [clientName, setClientName] = useState("");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const update = <K extends keyof ConsultationAnswers>(key: K, value: ConsultationAnswers[K]) => setAnswers(v => ({ ...v, [key]: value }));
  const valid = () => step === 0 ? answers.goals.length > 0 : step === 1 ? Boolean(answers.skinType && answers.sensitivity) : step === 2 ? answers.products.length > 0 : true;
  const saveAndFinish = (analysis: SkinAnalysisResult | null) => {
    const recommendation = generateRecommendation(answers, analysis?.observations.map(observation => observation.category));
    localStorage.setItem("golden-consultation", JSON.stringify({ answers, recommendation, analysis, photoUsed: Boolean(analysis), createdAt: new Date().toISOString() }));
    trackEvent("quiz_completed", { photo_used: Boolean(analysis) });
    trackEvent("recommendation_service", { service_id: recommendation.serviceId });
    if (shareInsights) void fetch("/api/consultations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goals: answers.goals, skinType: answers.skinType, sensitivity: answers.sensitivity, recommendation: recommendation.serviceId, photoUsed: Boolean(analysis), analysisMode: analysis?.mode ?? null, name: clientName.trim() || null }) }).catch(() => undefined);
    window.location.assign("/results");
  };
  const analyze = async () => {
    if (!file) { saveAndFinish(null); return; }
    if (!consent) { setError("Please review and accept the photo consent before continuing."); return; }
    setProcessing(true); setError("");
    try {
      const result = await analyzePhotoOnDevice(file);
      saveAndFinish(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't analyze your photo this time — no worries. We can still recommend a service using your answers.");
      setProcessing(false);
    }
  };
  const next = () => { if (!valid()) { setError("Choose at least one answer to continue."); return; } setError(""); if (step < 4) setStep(step + 1); else void analyze(); };
  const chooseFile = (chosen?: File) => {
    if (!chosen) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(chosen.type) || chosen.size > 8 * 1024 * 1024) { setError("Choose a JPG, PNG, or WebP image smaller than 8 MB."); return; }
    if (preview) URL.revokeObjectURL(preview); setFile(chosen); setPreview(URL.createObjectURL(chosen)); setConsent(false); setError("");
  };
  return <div className="consultation-shell"><div className="consultation-progress"><div><span>Step {step + 1} of 5</span><strong>{labels[step]}</strong></div><div className="progress-track"><i style={{ width: `${(step + 1) * 20}%` }} /></div></div><div className="consultation-card">
    {step === 0 && <><p className="eyebrow">Let’s begin</p><h2>What would you like to work on?</h2><p>Pick everything you’d like to improve or keep glowing. There are no wrong answers.</p><ToggleList options={skinGoals} selected={answers.goals} onChange={v => update("goals", v)} /></>}
    {step === 1 && <><p className="eyebrow">How your skin feels</p><h2>How would you describe your skin?</h2><ToggleList single options={skinTypes} selected={answers.skinType ? [answers.skinType] : []} onChange={v => update("skinType", v[0])} /><h3>How sensitive is your skin?</h3><ToggleList single options={sensitivityLevels} selected={answers.sensitivity ? [answers.sensitivity] : []} onChange={v => update("sensitivity", v[0])} /></>}
    {step === 2 && <><p className="eyebrow">Your current routine</p><h2>Are you using any strong skincare products?</h2><p>This helps us keep your recommendation gentle and appropriate.</p><ToggleList options={strongProducts} selected={answers.products} onChange={v => update("products", v)} /><label className="field-label">Other / tell us more<textarea value={answers.otherProducts} onChange={e => update("otherProducts", e.target.value)} placeholder="Optional" maxLength={500} /></label></>}
    {step === 3 && <><p className="eyebrow">Almost there</p><h2>Anything else you want McKinnley to know?</h2><p>Optional. Please don’t include medical records or sensitive personal information.</p><label className="field-label">Your note<textarea value={answers.notes} onChange={e => update("notes", e.target.value)} placeholder="Your goals or preferences…" maxLength={750} /></label><label className="field-label">Your first name (optional)<input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="So McKinnley can personalize your result" maxLength={80} /></label><label className="consent-box insight-consent"><input type="checkbox" checked={shareInsights} onChange={e => setShareInsights(e.target.checked)} /><span><strong>Help Golden Esthetics improve recommendations.</strong> Share a summary of my selected goals, skin type, sensitivity, recommendation, whether I used a photo, and my first name if I entered one. My note and photo are never included.</span></label><div className="privacy-note"><strong>Cosmetic guidance, not a diagnosis</strong><p>Your result helps you navigate Golden Esthetics services. It does not diagnose conditions or replace medical care.</p></div></>}
    {step === 4 && <><p className="eyebrow">Sparrow photo assistant · optional</p><h2>Add a photo—or keep it quiz-only.</h2><p>For the best recommendation, use a clear photo in natural lighting with little or no makeup.</p><label className={preview ? "photo-drop has-photo" : "photo-drop"}><input type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={e => chooseFile(e.target.files?.[0])} />{preview ? <><Image src={preview} alt="Selected face preview" width={720} height={720} unoptimized /><span>Choose a different photo</span></> : <><b>＋</b><strong>Take or upload a photo</strong><small>JPG, PNG, or WebP · maximum 8 MB</small></>}</label>{file && <label className="consent-box"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span><strong>I consent to temporary on-device cosmetic image analysis.</strong> Sparrow uses the photo only for this recommendation. It is not uploaded, saved, used for facial recognition, or used for training. This is not a medical diagnosis.</span></label>}<div className="photo-privacy"><span>✦</span><div><strong>Analyzed on your device</strong><p>The selected image stays in this browser. Sparrow reads non-medical visual cues, combines them with your quiz answers, and saves only the text result—not the photo.</p></div></div></>}
    {error && <div className="form-error" role="alert">{error}{step === 4 && file && <button type="button" onClick={() => saveAndFinish(null)}>Continue with quiz answers instead</button>}</div>}
    <div className="wizard-actions">{step > 0 && <button className="button button-quiet" type="button" disabled={processing} onClick={() => { setError(""); setStep(step - 1); }}>Back</button>}{step === 4 && <button className="button button-quiet skip-photo" type="button" disabled={processing} onClick={() => saveAndFinish(null)}>Skip photo</button>}<button className="button button-primary" type="button" disabled={processing} onClick={next}>{processing ? "Preparing your match…" : step === 4 ? file ? "Analyze & Reveal ✦" : "Reveal My Match ✦" : "Continue →"}</button></div>
  </div></div>;
}
