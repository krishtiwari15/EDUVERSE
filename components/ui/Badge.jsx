const TONES = {
  solid: "bg-[var(--pill)] text-[var(--pill-ink)]",
  outline: "bg-[var(--surface-1)] text-[var(--ink)] ring-1 ring-[var(--border-glass-strong)]",
  neutral: "bg-[var(--surface-2)] text-[var(--muted)] ring-1 ring-[var(--border-glass)]",
};

export default function Badge({ tone = "neutral", icon: Icon, className = "", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-semibold ${TONES[tone] || TONES.neutral} ${className}`}>
      {Icon && <Icon size={13} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
