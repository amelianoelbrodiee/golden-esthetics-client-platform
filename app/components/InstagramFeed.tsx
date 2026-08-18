"use client";
import { useEffect } from "react";

// Renders a LightWidget Instagram feed. `src` is the widget iframe URL
// (e.g. "//lightwidget.com/widgets/<id>.html"). When empty, nothing renders
// and the caller falls back to a plain "Follow on Instagram" button.
export function InstagramFeed({ src }: { src: string }) {
  useEffect(() => {
    const id = "lightwidget-script";
    if (document.getElementById(id)) return;
    const sc = document.createElement("script");
    sc.id = id;
    sc.src = "https://cdn.lightwidget.com/widgets/lightwidget.js";
    sc.async = true;
    document.body.appendChild(sc);
  }, []);
  if (!src) return null;
  return (
    <iframe
      src={src}
      title="Golden Esthetics on Instagram"
      scrolling="no"
      className="lightwidget-widget"
      style={{ width: "100%", border: 0, overflow: "hidden" }}
    />
  );
}
