"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const INTRO_STORAGE_KEY = "golden-esthetics-opening-v5-seen";

const sparkleChimes = [
  [784, 0], [1175, 0.14], [1568, 0.32], [2093, 0.5], [1319, 0.76],
  [1760, 1.02], [2349, 1.3], [1568, 1.62], [2637, 1.94], [2093, 2.28],
] as const;

function createSparkleWavUrl() {
  const sampleRate = 22050;
  const duration = 3.8;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeAscii = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  };

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, "data");
  view.setUint32(40, samples * 2, true);

  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    const masterEnvelope = Math.min(1, time / 0.06) * Math.min(1, Math.max(0, (duration - time) / 0.7));
    const swellEnvelope = Math.sin(Math.PI * Math.min(time / duration, 1));
    let sample = 0.14 * Math.sin(2 * Math.PI * (330 * time + 42 * time * time)) * swellEnvelope;

    for (const [frequency, start] of sparkleChimes) {
      const localTime = time - start;
      if (localTime < 0 || localTime > 0.72) continue;
      const attack = Math.min(1, localTime / 0.012);
      const decay = Math.exp(-localTime * 5.8);
      const chime = Math.sin(2 * Math.PI * frequency * localTime)
        + 0.46 * Math.sin(2 * Math.PI * frequency * 1.5 * localTime)
        + 0.22 * Math.sin(2 * Math.PI * frequency * 2.02 * localTime);
      sample += chime * attack * decay * 0.28;
    }

    const shimmer = (Math.random() * 2 - 1) * 0.025 * Math.exp(-Math.max(0, time - 0.15) * 0.7);
    const shaped = Math.tanh((sample + shimmer) * 1.45) * masterEnvelope * 0.92;
    view.setInt16(44 + index * 2, Math.round(shaped * 32767), true);
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

async function playSparkleSound(): Promise<boolean> {
  const soundUrl = createSparkleWavUrl();
  const audio = new Audio(soundUrl);
  audio.autoplay = true;
  audio.preload = "auto";
  audio.volume = 1;
  const cleanup = () => URL.revokeObjectURL(soundUrl);
  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", cleanup, { once: true });
  try {
    await audio.play();
    window.setTimeout(cleanup, 4500);
    return true;
  } catch {
    cleanup();
    return false;
  }
}

const particles = Array.from({ length: 68 }, (_, index) => {
  const angle = ((index * 137.508 + (index % 4) * 9) * Math.PI) / 180;
  const distance = 100 + (index % 12) * 29;

  return {
    id: index,
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance * 0.72),
    delay: (index % 9) * 0.06,
    size: 2 + (index % 5) * 0.8,
    duration: 1.55 + (index % 7) * 0.18,
  };
});

type ParticleStyle = CSSProperties & {
  "--particle-x": string;
  "--particle-y": string;
  "--particle-delay": string;
  "--particle-size": string;
  "--particle-duration": string;
};

export function OpeningReveal() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const soundPlayed = useRef(false);

  useEffect(() => {
    let hasSeenIntro = false;

    try {
      hasSeenIntro = sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
    } catch {
      // The intro still works when storage is unavailable.
    }

    if (window.location.pathname.startsWith("/admin") || hasSeenIntro) {
      const hideTimer = window.setTimeout(() => setIsVisible(false), 0);
      return () => window.clearTimeout(hideTimer);
    }

    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    let soundTimer = 0;
    let soundAttempting = false;
    const interactionEvents = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;
    const removeSoundFallback = () => {
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, trySound));
    };
    const trySound = () => {
      if (soundPlayed.current || soundAttempting) return;
      soundAttempting = true;
      void playSparkleSound().then((played) => {
        soundAttempting = false;
        if (!played) return;
        soundPlayed.current = true;
        removeSoundFallback();
      });
    };
    if (!shouldReduceMotion) {
      interactionEvents.forEach((eventName) => window.addEventListener(eventName, trySound, { passive: true }));
      soundTimer = window.setTimeout(trySound, 120);
    }

    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch {
      // The intro should never block the site because of a storage restriction.
    }

    const timer = window.setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = "";
    }, shouldReduceMotion ? 1500 : 5600);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(soundTimer);
      removeSoundFallback();
      document.body.style.overflow = "";
    };
  }, []);

  function dismiss() {
    setIsClosing(true);
    document.body.style.overflow = "";
    window.setTimeout(() => setIsVisible(false), 360);
  }

  if (!isVisible) return null;

  return (
    <div
      className={`opening-reveal${isClosing ? " opening-reveal--closing" : ""}`}
      role="dialog"
      aria-label="Golden Esthetics opening animation"
    >
      <div className="opening-reveal__halo" aria-hidden="true" />
      <div className="opening-reveal__glitter" aria-hidden="true">
        {particles.map((particle) => (
          <i
            key={particle.id}
            style={
              {
                "--particle-x": `${particle.x}px`,
                "--particle-y": `${particle.y}px`,
                "--particle-delay": `${particle.delay}s`,
                "--particle-size": `${particle.size}px`,
                "--particle-duration": `${particle.duration}s`,
              } as ParticleStyle
            }
          />
        ))}
      </div>
      <div className="opening-reveal__flare" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="opening-reveal__name">
        <span className="opening-reveal__star" aria-hidden="true">✦</span>
        <strong>Golden</strong>
        <small>Esthetics</small>
      </div>
      <p className="opening-reveal__signature">Your skin, but golden.</p>
      <button type="button" className="opening-reveal__skip" onClick={dismiss}>
        Skip intro
      </button>
    </div>
  );
}

