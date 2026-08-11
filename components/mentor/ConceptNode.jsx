"use client";
import { Handle, Position } from "@xyflow/react";

// Styled to match the app's flat, monochrome surfaces — mastery reads
// through white opacity/weight instead of color, so the graph still feels
// like "your personal learning universe," not a generic node-and-edge diagram.
export default function ConceptNode({ data }) {
  const { label, subject, mastery, isHub } = data;
  const pct = Math.round((mastery ?? 0) * 100);
  const ringOpacity = 0.15 + Math.min(1, mastery ?? 0) * 0.55;

  if (isHub) {
    return (
      <div className="glass-card-elevated px-5 py-3 text-center" style={{ borderColor: "rgba(255,255,255,.4)" }}>
        <Handle type="source" position={Position.Bottom} isConnectable={false} style={{ opacity: 0 }} />
        <div className="text-heading text-white text-sm">{label}</div>
      </div>
    );
  }

  return (
    <div className="glass-card px-3.5 py-2.5 text-center min-w-[8rem]" style={{ boxShadow: `0 0 0 1.5px rgba(255,255,255,${ringOpacity}) inset` }}>
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ opacity: 0 }} />
      <div className="text-white text-xs font-semibold leading-tight">{label}</div>
      <div className="text-[10px] mt-1 font-medium text-white/55">{subject} · {pct}% mastery</div>
    </div>
  );
}
