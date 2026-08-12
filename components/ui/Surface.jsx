const TIERS = {
  1: "bg-[var(--surface-1)] border border-[var(--border-glass)]",
  2: "glass-card",
  3: "glass-card-elevated",
};

export default function Surface({ tier = 2, className = "", children, ...props }) {
  return (
    <div className={`${TIERS[tier]} rounded-[var(--radius-lg)] ${className}`} {...props}>
      {children}
    </div>
  );
}
