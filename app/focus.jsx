"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, Pause, Square, Target, Camera, Award } from "lucide-react";
import { Button, Surface, ProgressBar } from "@/components/ui";
import AIAvatar from "@/components/mentor/AIAvatar";
import CameraPermission from "@/components/mentor/CameraPermission";
import CameraIndicator from "@/components/mentor/CameraIndicator";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";
import { useFocusPresence, PRESENCE } from "@/hooks/useFocusPresence";

const DURATIONS = [15, 25, 45];
const CHECKIN_COOLDOWN_MS = 4 * 60 * 1000; // never nag more than once every 4 minutes
const AWAY_THRESHOLD_MS = 45 * 1000; // how long "away" has to persist before a gentle nudge

export default function Focus({ mentor, muted, onBack, onComplete }) {
  const [phase, setPhase] = useState("setup"); // setup | running | paused | done
  const [durationMin, setDurationMin] = useState(25);
  const [goal, setGoal] = useState("");
  const [remainingSec, setRemainingSec] = useState(25 * 60);
  const [cameraStage, setCameraStage] = useState("unset"); // unset | asking | on | off
  const [nudge, setNudge] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const awayStartRef = useRef(null);
  const lastCheckinRef = useRef(0);
  const notifiedAwayRef = useRef(false);

  const { speak } = useVoiceConversation({ muted });
  const presence = useFocusPresence({ cameraEnabled: cameraStage === "on", videoRef, inactiveAfterMs: AWAY_THRESHOLD_MS });

  useEffect(() => {
    if (phase !== "running") return;
    if (remainingSec <= 0) {
      const t = setTimeout(() => {
        setPhase("done");
        speak(`Nice work — you did it! ${durationMin} focused minutes on "${goal || "your goal"}". I'm proud of you.`);
        onComplete?.();
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRemainingSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, remainingSec, durationMin, goal, onComplete, speak]);

  // Gentle, cooldown-gated check-ins — never diagnoses sleep, never repeats.
  useEffect(() => {
    if (phase !== "running") return;
    const away = presence.presence === PRESENCE.AWAY || presence.presence === PRESENCE.INACTIVE;
    if (away) {
      if (!awayStartRef.current) awayStartRef.current = Date.now();
      const awayFor = Date.now() - awayStartRef.current;
      const cooledDown = Date.now() - lastCheckinRef.current > CHECKIN_COOLDOWN_MS;
      if (awayFor > AWAY_THRESHOLD_MS && cooledDown && !notifiedAwayRef.current) {
        notifiedAwayRef.current = true;
        lastCheckinRef.current = Date.now();
        const msg = "You've been quiet for a while — everything okay? Want to pause your focus session?";
        setNudge(msg);
        speak(msg);
      }
    } else {
      if (notifiedAwayRef.current) {
        const msg = "Welcome back! Ready to continue?";
        setNudge(msg);
        speak(msg);
        setTimeout(() => setNudge(null), 4000);
      }
      awayStartRef.current = null;
      notifiedAwayRef.current = false;
    }
  }, [presence, phase, speak]);

  async function enableCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraStage("on");
    } catch {
      setCameraStage("off");
    }
  }

  function disableCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraStage("off");
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  function start() {
    setRemainingSec(durationMin * 60);
    setPhase("running");
    speak(`Alright. We're doing ${durationMin} minutes${goal ? ` on ${goal}` : ""}. I'll stay with you — let's get this done.`);
  }

  function pause() { setPhase("paused"); }
  function resume() { setPhase("running"); }
  function stop() { setPhase("setup"); setNudge(null); }

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, "0");
  const ss = String(remainingSec % 60).padStart(2, "0");
  const pct = phase === "setup" ? 0 : 100 - (remainingSec / (durationMin * 60)) * 100;

  return (
    <div className="relative z-10 w-full max-w-md mx-auto py-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} aria-label="Back" className="focus-ring flex items-center gap-1.5 text-white/70 hover:text-white font-semibold text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        {cameraStage === "on" && <CameraIndicator onTurnOff={disableCamera} />}
      </div>

      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      <div className="flex flex-col items-center text-center">
        <AIAvatar mentor={mentor} state={phase === "done" ? "celebrating" : phase === "running" ? "encouraging" : "idle"} size={128} />
        <h1 className="text-display text-white mt-4">Focus <span className="text-shimmer">Session</span></h1>
      </div>

      <Surface tier={3} className="p-6 mt-5 text-center">
        {phase === "setup" && (
          <>
            <label className="text-eyebrow text-white/50 flex items-center justify-center gap-1.5"><Target size={12} /> What are we focusing on?</label>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Finish algebra worksheet" className="focus-ring w-full mt-2 mb-5 px-4 py-3 rounded-xl bg-white/95 text-slate-800 text-sm text-center placeholder:text-slate-400" />
            <div className="flex justify-center gap-2 mb-5">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => { setDurationMin(d); setRemainingSec(d * 60); }} aria-pressed={durationMin === d} className={`focus-ring px-4 py-2 rounded-xl text-sm font-semibold transition ${durationMin === d ? "bg-white text-[var(--pill-ink)]" : "bg-white/10 text-white/70 ring-1 ring-white/20"}`}>{d} min</button>
              ))}
            </div>

            {cameraStage === "unset" && (
              <div className="flex justify-center mb-5">
                <CameraPermission onEnable={enableCamera} onSkip={() => setCameraStage("off")} />
              </div>
            )}
            {cameraStage === "off" && (
              <button onClick={() => setCameraStage("unset")} className="focus-ring text-white/40 text-xs flex items-center gap-1 mx-auto mb-5 hover:text-white/60">
                <Camera size={12} /> Camera is off — tap to change
              </button>
            )}

            <Button variant="primary" size="lg" icon={Play} onClick={start} className="w-full">Start session</Button>
          </>
        )}

        {(phase === "running" || phase === "paused") && (
          <>
            <div className="text-hero text-white tabular-nums" style={{ fontSize: "clamp(2.5rem,10vw,3.5rem)" }}>{mm}:{ss}</div>
            {goal && <p className="text-white/60 text-sm mt-1">{goal}</p>}
            <ProgressBar value={pct} className="mt-4" />
            <div className="flex justify-center gap-2 mt-6">
              {phase === "running" ? (
                <Button variant="glass" size="md" icon={Pause} onClick={pause}>Pause</Button>
              ) : (
                <Button variant="primary" size="md" icon={Play} onClick={resume}>Resume</Button>
              )}
              <Button variant="ghost" size="md" icon={Square} onClick={stop}>End session</Button>
            </div>
          </>
        )}

        {phase === "done" && (
          <>
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Award size={26} className="text-white" strokeWidth={1.75} />
            </div>
            <p className="text-white text-lg font-semibold">Session complete!</p>
            <p className="text-white/60 text-sm mt-1">{durationMin} focused minutes{goal ? ` on ${goal}` : ""}.</p>
            <Button variant="primary" size="md" onClick={stop} className="w-full mt-5">Start another</Button>
          </>
        )}
      </Surface>

      <AnimatePresence>
        {nudge && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-card p-4 mt-4 text-center">
            <p className="text-white/80 text-sm">{nudge}</p>
            <button onClick={() => setNudge(null)} className="focus-ring text-white/40 text-xs mt-1.5 hover:text-white/60">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
