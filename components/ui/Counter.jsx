"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

// Animates a number counting up once it scrolls into view. Falls back to
// showing the final value instantly under prefers-reduced-motion.
export default function Counter({ value, duration = 900, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      if (reduceMotion) { setDisplay(value); return; }
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
