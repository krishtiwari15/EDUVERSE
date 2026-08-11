"use client";
import { useEffect, useRef } from "react";

const BARS = 5;

// A real amplitude waveform driven by a Web Audio AnalyserNode on the mic
// stream (not decorative random bars) — reuses the same getUserMedia/
// AudioContext primitives already used for sound effects elsewhere in the
// app. Silently falls back to a still waveform if the mic is unavailable.
export default function VoiceWaveform({ active, color = "var(--ink)", className = "" }) {
  const barRefs = useRef([]);
  const rafRef = useRef(null);
  const ctxRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!active || typeof window === "undefined" || !navigator.mediaDevices) return;
    let cancelled = false;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const step = Math.floor(data.length / BARS);
        for (let i = 0; i < BARS; i++) {
          const v = data[i * step] / 255;
          const el = barRefs.current[i];
          if (el) el.style.transform = `scaleY(${Math.max(0.15, v)})`;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    }).catch(() => {});

    const bars = barRefs.current;
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close().catch(() => {});
      bars.forEach((el) => { if (el) el.style.transform = "scaleY(0.15)"; });
    };
  }, [active]);

  return (
    <div className={`flex items-end gap-1 h-6 ${className}`} aria-hidden="true">
      {Array.from({ length: BARS }).map((_, i) => (
        <div key={i} ref={(el) => { barRefs.current[i] = el; }} className="w-1 h-full rounded-full origin-bottom transition-transform duration-75" style={{ background: color, transform: "scaleY(0.15)" }} />
      ))}
    </div>
  );
}
