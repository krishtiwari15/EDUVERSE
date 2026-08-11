"use client";
import { Camera, X } from "lucide-react";

// Always visible whenever the camera is active — an explicit, un-missable
// on-indicator plus an instant off switch, never a hidden background state.
export default function CameraIndicator({ onTurnOff }) {
  return (
    <div className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-[var(--radius-pill)] bg-red-500/20 ring-1 ring-red-400/40 text-white text-xs font-semibold w-fit">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      <Camera size={13} /> Camera ON
      <button onClick={onTurnOff} aria-label="Turn camera off" className="focus-ring w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/15 transition ml-1">
        <X size={13} />
      </button>
    </div>
  );
}
