"use client";
import { useEffect, useRef, useState } from "react";

// Coarse-only. Never claims to know if someone is "asleep" — just whether
// the page looks active, still, or away. See CameraPermission.jsx for the
// disclosure shown before any camera access is requested.
export const PRESENCE = { PRESENT: "PRESENT", AWAY: "AWAY", INACTIVE: "INACTIVE", UNKNOWN: "UNKNOWN" };

/**
 * With no camera: Page Visibility + input-idle timers.
 * With camera: throttled (~2fps) canvas frame-diffing on-device — a tiny
 * 48x36 sample buffer that is diffed and immediately discarded, never
 * stored or sent anywhere. This is motion-level analysis, not face/pose
 * detection, and is intentionally kept that simple and honest.
 */
export function useFocusPresence({ cameraEnabled = false, videoRef, inactiveAfterMs = 90000 } = {}) {
  const [presence, setPresence] = useState({ presence: PRESENCE.UNKNOWN, activity: "unknown", confidence: 0 });
  const lastActivityRef = useRef(null);
  const canvasRef = useRef(null);
  const prevFrameRef = useRef(null);

  useEffect(() => {
    if (lastActivityRef.current === null) lastActivityRef.current = Date.now();
    const bump = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("mousemove", bump);
    window.addEventListener("keydown", bump);
    window.addEventListener("touchstart", bump);
    return () => {
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("touchstart", bump);
    };
  }, []);

  // No-camera fallback: tab visibility + idle timer.
  useEffect(() => {
    if (cameraEnabled) return;
    const id = setInterval(() => {
      if (document.hidden) { setPresence({ presence: PRESENCE.AWAY, activity: "tab hidden", confidence: 0.7 }); return; }
      const idleMs = Date.now() - lastActivityRef.current;
      setPresence(
        idleMs > inactiveAfterMs
          ? { presence: PRESENCE.INACTIVE, activity: "idle", confidence: 0.6 }
          : { presence: PRESENCE.PRESENT, activity: "active", confidence: 0.5 }
      );
    }, 5000);
    return () => clearInterval(id);
  }, [cameraEnabled, inactiveAfterMs]);

  // Camera path: local frame-diff motion detection.
  useEffect(() => {
    if (!cameraEnabled || !videoRef?.current) return;
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    const w = 48, h = 36;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    prevFrameRef.current = null;

    const id = setInterval(() => {
      if (document.hidden) return; // pause all analysis while backgrounded
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      try {
        ctx.drawImage(video, 0, 0, w, h);
        const frame = ctx.getImageData(0, 0, w, h).data;
        if (prevFrameRef.current) {
          let diff = 0;
          for (let i = 0; i < frame.length; i += 4) diff += Math.abs(frame[i] - prevFrameRef.current[i]);
          const avgDiff = diff / (w * h);
          if (avgDiff > 0.4) {
            lastActivityRef.current = Date.now();
            setPresence({ presence: PRESENCE.PRESENT, activity: "moving", confidence: 0.7 });
          } else {
            const idleMs = Date.now() - lastActivityRef.current;
            setPresence(
              idleMs > inactiveAfterMs
                ? { presence: PRESENCE.AWAY, activity: "still", confidence: 0.5 }
                : { presence: PRESENCE.PRESENT, activity: "still", confidence: 0.55 }
            );
          }
        }
        prevFrameRef.current = frame;
      } catch {
        setPresence({ presence: PRESENCE.UNKNOWN, activity: "unknown", confidence: 0 });
      }
    }, 500);

    return () => { clearInterval(id); prevFrameRef.current = null; };
  }, [cameraEnabled, videoRef, inactiveAfterMs]);

  return presence;
}
