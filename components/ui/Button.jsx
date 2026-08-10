"use client";
import { motion } from "motion/react";

const VARIANTS = {
  primary: "text-violet-950 bg-gradient-to-r from-violet-200 to-indigo-200 shadow-[0_8px_30px_-8px_rgba(167,139,250,0.6)]",
  aurora: "text-teal-950 bg-gradient-to-r from-teal-200 to-cyan-200 shadow-[0_8px_30px_-8px_rgba(94,234,212,0.5)]",
  glass: "text-white glass-card border border-white/20 hover:bg-white/15",
  ghost: "text-violet-200 hover:text-white",
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
        className={`focus-ring inline-flex items-center justify-center gap-2 font-semibold transition-shadow disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
      >
        {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 16 : 18} strokeWidth={2.25} />}
        {children}
        {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 16 : 18} strokeWidth={2.25} />}
      </Tag>
    </motion.div>
  );
}
