"use client";
import { useEffect, useRef, useState } from "react";

const VIDEO_URL = "https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/nexo-hero-bg-video.webm";
const FADE_SEC = 0.5;

const clamp = (min, max, v) => Math.min(max, Math.max(min, v));
const lerp = (current, target, factor) => current + (target - current) * factor;

// The app's ambient backdrop: a full-color looping video (desktop only —
// see showVideo) with a slow Ken Burns zoom, plus two soft glow layers on
// top. Each glow has its own always-on CSS drift (voidDriftA/B, defined in
// globals.css) so
// there's visible motion on every screen even when there's nothing to
// scroll — most "rooms" here are single-viewport and never scroll, so a
// scroll-only effect would sit still. On top of that baseline drift, an
// inner wrapper nudges the same layer further based on scroll position
// (RAF + lerp, translate3d/will-change) wherever a screen *does* scroll,
// like the dashboard.
export default function VoidBackdrop() {
  const layerARef = useRef(null);
  const layerBRef = useRef(null);
  const videoRef = useRef(null);
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

  // Manual fade-in/fade-out loop instead of a native `loop` attribute: fade
  // in over the first 0.5s, fade out over the last 0.5s, then restart from
  // the top — avoids the hard visual cut a native loop leaves at the seam.
  // The ratio is run through a smoothstep ease so the fade itself feels
  // considered rather than a linear dissolve.
  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;
    let raf;
    let restarting = false;
    const ease = (p) => p * p * (3 - 2 * p);

    function tick() {
      if (!restarting && video.duration) {
        const t = video.currentTime;
        const d = video.duration;
        if (t < FADE_SEC) video.style.opacity = String(ease(t / FADE_SEC));
        else if (t > d - FADE_SEC) video.style.opacity = String(ease(Math.max(0, (d - t) / FADE_SEC)));
        else video.style.opacity = "1";
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    function onEnded() {
      restarting = true;
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
        restarting = false;
      }, 100);
    }
    video.addEventListener("ended", onEnded);
    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("ended", onEnded);
    };
  }, [showVideo]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay muted playsInline preload="auto"
          className="void-video-zoom absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0 }}
        >
          <source src={VIDEO_URL} type="video/webm" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="absolute inset-x-0 -top-1/4 h-1/2" style={{ animation: "voidDriftA 22s ease-in-out infinite" }}>
        <div
          ref={layerARef}
          className="w-full h-full will-change-transform"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(5,5,5,.12), transparent 70%)", filter: "blur(40px)" }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ animation: "voidDriftB 27s ease-in-out infinite" }}>
        <div
          ref={layerBRef}
          className="w-full h-full will-change-transform"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(5,5,5,.09), transparent 70%)", filter: "blur(50px)" }}
        />
      </div>
    </div>
  );
}
