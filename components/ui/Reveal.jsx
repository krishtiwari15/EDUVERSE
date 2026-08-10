"use client";
import { motion } from "motion/react";

// Restrained scroll/entrance reveal: small fade + translate, never a bounce.
// Content stays in the DOM (no visibility:hidden trap for crawlers/SR).
export function Reveal({ as = "div", delay = 0, y = 14, className = "", children, ...props }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
}

// Stagger a group of children (cards, list rows) as they enter.
export function RevealGroup({ className = "", stagger = 0.08, children }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ className = "", y = 14, children }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
