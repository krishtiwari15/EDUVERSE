"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// Genuine, correctly-attributed quotes only — no invented lines passed off
// as real quotes. Cycles slowly so it reads as ambient texture over the
// motion backdrop, not something competing for attention.
const QUOTES = [
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Anyone who stops learning is old, whether at twenty or eighty.", author: "Henry Ford" },
  { text: "Curiosity is the wick in the candle of learning.", author: "William Arthur Ward" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
];

export default function QuoteRotator({ className = "" }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % QUOTES.length), 7000);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[i];

  return (
    <div className={`relative min-h-[3.25rem] ${className}`} aria-live="off">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[var(--muted)] text-sm sm:text-base italic leading-snug"
          style={{ fontFamily: "var(--font-display)" }}
        >
          &ldquo;{q.text}&rdquo; <span className="not-italic text-[var(--faint)] text-xs align-middle">— {q.author}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
