"use client";
import { useEffect, useRef, useState } from "react";

// Shares the CloudFront asset family used elsewhere in onboarding — swap
// for a self-hosted video before shipping to production.
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4";

const clamp = (min, max, v) => Math.min(max, Math.max(min, v));
const lerp = (current, target, factor) => current + (target - current) * factor;

// The app's ambient backdrop: a desaturated, dimmed looping video (desktop
// only — see showVideo) with two soft monochrome glow layers on top. Each
// glow has its own always-on CSS drift (voidDriftA/B, defined in
// globals.css) so there's visible motion on every screen even when there's
// nothing to scroll — most "rooms" here are single-viewport and never
// scroll, so a scroll-only effect would sit still. On top of that
// baseline drift, an inner wrapper nudges the same layer further based on
// scroll position (RAF + lerp, translate3d/will-change) wherever a screen
// *does* scroll, like the dashboard. Recolored monochrome, no video/scroll
// dependency required to see it move; kept purely decorative.
export default function VoidBackdrop() {
  const layerARef = useRef(null);
  const layerBRef = useRef(null);
  const state = useRef({ a: 0, aTarget: 0, b: 0, bTarget: 0 });
  const [showVideo] = useState(() => typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : true);

  useEffect(() => {
    let raf;
    const tick = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = clamp(0, 1, window.scrollY / max);

      state.current.aTarget = progress * 90;
      state.current.bTarget = progress * -80;

      state.current.a = lerp(state.current.a, state.current.aTarget, 0.06);
      state.current.b = lerp(state.current.b, state.current.bTarget, 0.04);

      if (layerARef.current) layerARef.current.style.transform = `translate3d(0, ${state.current.a}px, 0)`;
      if (layerBRef.current) layerBRef.current.style.transform = `translate3d(0, ${state.current.b}px, 0)`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {showVideo && (
        <video
          autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(1) brightness(.32) contrast(1.15)" }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-black/55" />

      <div className="absolute inset-x-0 -top-1/4 h-1/2" style={{ animation: "voidDriftA 22s ease-in-out infinite" }}>
        <div
          ref={layerARef}
          className="w-full h-full will-change-transform"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.1), transparent 70%)", filter: "blur(40px)" }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ animation: "voidDriftB 27s ease-in-out infinite" }}>
        <div
          ref={layerBRef}
          className="w-full h-full will-change-transform"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.08), transparent 70%)", filter: "blur(50px)" }}
        />
      </div>
    </div>
  );
}
