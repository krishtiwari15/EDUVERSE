const TONES = {
  primary: "bg-violet-400/15 text-violet-200 ring-1 ring-violet-400/30",
  aurora: "bg-teal-400/15 text-teal-200 ring-1 ring-teal-400/30",
  gold: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30",
  neutral: "bg-white/10 text-white/80 ring-1 ring-white/20",
};

export default function Badge({ tone = "neutral", icon: Icon, className = "", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-semibold ${TONES[tone]} ${className}`}>
      {Icon && <Icon size={13} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
