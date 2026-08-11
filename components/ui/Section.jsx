export default function Section({ eyebrow, title, description, action, className = "", children }) {
  return (
    <section className={className}>
      {(eyebrow || title) && (
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            {eyebrow && <p className="text-eyebrow mb-1.5">{eyebrow}</p>}
            {title && <h2 className="text-display text-white">{title}</h2>}
            {description && <p className="text-white/60 mt-1.5 max-w-xl">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
