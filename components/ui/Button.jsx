"use client";
import { motion } from "motion/react";

const VARIANTS = {
  primary: "text-[var(--pill-ink)] bg-[var(--pill)] hover:opacity-90",
  glass: "text-[var(--ink)] bg-[var(--surface-1)] border border-[var(--border-glass)] hover:bg-[var(--surface-2)]",
  ghost: "text-[var(--muted)] hover:text-[var(--ink)]",
};

const SIZES = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-3 text-base rounded-2xl",
  lg: "px-8 py-3.5 text-lg rounded-full",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <motion.div
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      <Tag
        disabled={disabled}
        className={`focus-ring inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
      >
        {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 16 : 18} strokeWidth={2.25} />}
        {children}
        {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 16 : 18} strokeWidth={2.25} />}
      </Tag>
    </motion.div>
  );
}
