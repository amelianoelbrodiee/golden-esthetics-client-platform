"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const INTRO_STORAGE_KEY = "golden-esthetics-opening-v4-seen";

async function playSparkleSound(): Promise<boolean> {
  const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return false;
  const context = new AudioContextConstructor();
  try {
    await context.resume();
  } catch {
    await context.close().catch(() => undefined);
    return false;
  }
  if (context.state !== "running") {
    await context.close().catch(() => undefined);
    return false;
  }

  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  master.gain.setValueAtTime(0.72, context.currentTime);
  compressor.threshold.setValueAtTime(-24, context.currentTime);
  compressor.ratio.setValueAtTime(4, context.currentTime);
  master.connect(compressor);
  compressor.connect(context.destination);

  const shimmerLength = Math.floor(context.sampleRate * 3.4);
  const shimmerBuffer = context.createBuffer(1, shimmerLength, context.sampleRate);
  const shimmerData = shimmerBuffer.getChannelData(0);
  for (let index = 0; index < shimmerData.length; index += 1) {
    shimmerData[index] = (Math.random() * 2 - 1) * (1 - index / shimmerData.length);
  }
  const shimmer = context.createBufferSource();
  const shimmerFilter = context.createBiquadFilter();
  const shimmerGain = context.createGain();
  shimmer.buffer = shimmerBuffer;
  shimmerFilter.type = "highpass";
  shimmerFilter.frequency.setValueAtTime(5200, context.currentTime);
  shimmerGain.gain.setValueAtTime(0.0001, context.currentTime);
  shimmerGain.gain.exponentialRampToValueAtTime(0.025, context.currentTime + 0.12);
  shimmerGain.gain.exponentialRampToValueAtTime(0.009, context.currentTime + 1.9);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 3.35);
  shimmer.connect(shimmerFilter);
  shimmerFilter.connect(shimmerGain);
  shimmerGain.connect(master);
  shimmer.start();

  const sparkles = [
    [1760, 0.02, -0.65], [2637, 0.1, 0.45], [2093, 0.2, -0.2], [3520, 0.29, 0.7],
    [2349, 0.43, -0.5], [4186, 0.56, 0.25], [3136, 0.72, 0.58], [4699, 0.9, -0.72],
    [2794, 1.08, 0.1], [3951, 1.3, 0.62], [5274, 1.55, -0.42], [3520, 1.82, 0.28],
  ] as const;
  sparkles.forEach(([frequency, offset, pan], index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const stereo = context.createStereoPanner();
    const start = context.currentTime + offset;
    const decay = 0.34 + (index % 4) * 0.08;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.035, start + decay);
    stereo.pan.setValueAtTime(pan, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045 + (index % 3) * 0.008, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);
    oscillator.connect(gain);
    gain.connect(stereo);
    stereo.connect(master);
    oscillator.start(start);
    oscillator.stop(start + decay + 0.03);
  });
  window.setTimeout(() => void context.close(), 3900);
  return true;
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
    const interactionEvents = ["pointerdown", "touchstart", "keydown"] as const;
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
