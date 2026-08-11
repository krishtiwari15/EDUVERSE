"use client";
import { Camera, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";

// Camera access must never happen silently. This is the only place in the
// app that can trigger a camera permission prompt, and it always shows
// this disclosure first.
export default function CameraPermission({ onEnable, onSkip }) {
  return (
    <div className="glass-card-elevated p-6 sm:p-7 max-w-sm">
      <div className="w-11 h-11 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center mb-4">
        <Camera size={20} className="text-white" strokeWidth={1.75} />
      </div>
      <h3 className="text-heading text-white">Focus Companion</h3>
      <p className="text-white/60 text-sm mt-2 leading-relaxed">
        EduVerse can optionally use your camera during a focus session to estimate whether you appear present or inactive. Video is processed locally where technically possible and is not recorded or uploaded.
      </p>
      <div className="flex items-start gap-2 mt-4 text-white/45 text-xs leading-relaxed">
        <ShieldCheck size={14} className="shrink-0 mt-0.5" />
        <span>You&apos;ll see a clear &quot;Camera ON&quot; indicator any time it&apos;s active, and can turn it off instantly.</span>
      </div>
      <div className="flex gap-2 mt-6">
        <Button variant="ghost" size="md" onClick={onSkip} className="flex-1">Not now</Button>
        <Button variant="primary" size="md" icon={Camera} onClick={onEnable} className="flex-1">Enable camera</Button>
      </div>
    </div>
  );
}
