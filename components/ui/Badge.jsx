const TONES = {
  solid: "bg-white text-[var(--pill-ink)]",
  outline: "bg-white/5 text-white ring-1 ring-white/25",
  neutral: "bg-white/10 text-white/70 ring-1 ring-white/15",
};

export default function Badge({ tone = "neutral", icon: Icon, className = "", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-semibold ${TONES[tone] || TONES.neutral} ${className}`}>
      {Icon && <Icon size={13} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
