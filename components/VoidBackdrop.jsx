"use client";
import { useEffect, useRef, useState } from "react";

// Shares the CloudFront asset family used elsewhere in onboarding — swap
// for a self-hosted video before shipping to production.
const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4";

const clamp = (min, max, v) => Math.min(max, Math.max(min, v));
const lerp = (current, target, factor) => current + (target - current) * factor;

// The app's ambient backdrop: a desaturated, dimmed looping video with two
// soft monochrome layers that drift on scroll — lerp-smoothed each frame
// via requestAnimationFrame, moved with translate3d/will-change so it's
// GPU-composited and never touches React state. Recolored to the app's
// black/white system (no rainbow, no color) and kept purely decorative:
// pointer-events-none, fixed behind all content.
export default function VoidBackdrop() {
  const layerARef = useRef(null);
  const layerBRef = useRef(null);
  const state = useRef({ a: 0, aTarget: 0, b: 0, bTarget: 0 });
  // Skip the video decode on small/mobile screens — battery and data cost
  // for a purely decorative layer isn't worth it there. The lightweight
  // parallax glow layers below still run everywhere.
  const [showVideo] = useState(() => typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : true);

  useEffect(() => {
    let raf;
    const tick = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = clamp(0, 1, window.scrollY / max);

      state.current.aTarget = -60 + progress * 140;
      state.current.bTarget = 40 - progress * 120;

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
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
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

      <div
        ref={layerARef}
        className="absolute inset-x-0 -top-1/4 h-1/2 will-change-transform"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.07), transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        ref={layerBRef}
        className="absolute inset-x-0 bottom-0 h-1/2 will-change-transform"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.05), transparent 70%)", filter: "blur(50px)" }}
      />
    </div>
  );
}
