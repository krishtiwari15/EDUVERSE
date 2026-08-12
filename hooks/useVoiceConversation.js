"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { mentorVoiceProfile } from "@/lib/voice";

// The AI Mentor's conversation state machine. One IDLE/LISTENING/THINKING/
// SPEAKING/INTERRUPTED/ERROR value drives every voice-driven screen so the
// UI (waveform, avatar, buttons) always has one source of truth to read.
export const ConvState = {
  IDLE: "IDLE",
  LISTENING: "LISTENING",
  THINKING: "THINKING",
  SPEAKING: "SPEAKING",
  INTERRUPTED: "INTERRUPTED",
  ERROR: "ERROR",
};

function pickVoice(preferredNames = []) {
  const voices = window.speechSynthesis.getVoices();
  for (const name of preferredNames) {
    const v = voices.find((vo) => vo.name.includes(name));
    if (v) return v;
  }
  const fem = voices.find((vo) => /female/i.test(vo.name) && /en/i.test(vo.lang));
  if (fem) return fem;
  return voices.find((vo) => /en/i.test(vo.lang)) || voices[0];
}

/**
 * onInterim(text) — fired continuously while listening, with the running transcript.
 * onCommit(text)  — fired when a listening turn is done and should be sent.
 */
export function useVoiceConversation({ muted = false, mentor, onInterim, onCommit } = {}) {
  const [state, setState] = useState(ConvState.IDLE);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const bargeRef = useRef(null);
  const wantListeningRef = useRef(false);
  const autoCommitRef = useRef(false);
  const finalTextRef = useRef("");
  const mutedRef = useRef(muted);
  const mentorRef = useRef(mentor);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { mentorRef.current = mentor; }, [mentor]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // A friendly error clears itself instead of sitting on screen forever.
  useEffect(() => {
    if (state !== ConvState.ERROR) return;
    const t = setTimeout(() => setState(ConvState.IDLE), 4500);
    return () => clearTimeout(t);
  }, [state]);

  const stopBargeIn = useCallback(() => {
    if (bargeRef.current) {
      try { bargeRef.current.onresult = null; bargeRef.current.onend = null; bargeRef.current.stop(); } catch {}
      bargeRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    stopBargeIn();
    setState((s) => (s === ConvState.SPEAKING ? ConvState.IDLE : s));
  }, [stopBargeIn]);

  const startListening = useCallback((auto = false) => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice input isn't supported in this browser — you can still type to your mentor.");
      setState(ConvState.ERROR);
      return;
    }
    if (typeof window.speechSynthesis !== "undefined") window.speechSynthesis.cancel();
    stopBargeIn();
    finalTextRef.current = "";
    wantListeningRef.current = true;
    autoCommitRef.current = auto;
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = true;
    rec.onstart = () => setState(ConvState.LISTENING);
    rec.onerror = (e) => {
      if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) {
        wantListeningRef.current = false;
        setError("I can't access your microphone right now. Allow it in your browser settings, or just type.");
        setState(ConvState.ERROR);
      }
    };
    rec.onend = () => {
      if (wantListeningRef.current) { try { rec.start(); } catch {} }
      else setState((s) => (s === ConvState.LISTENING ? ConvState.IDLE : s));
    };
    rec.onresult = (e) => {
      let interim = "";
      let gotFinal = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { finalTextRef.current += t + " "; gotFinal = true; } else interim += t;
      }
      const text = (finalTextRef.current + interim).trim();
      onInterim?.(text);
      // A barge-in-initiated turn auto-sends the moment the student pauses,
      // so interrupting the mentor feels like a real conversation, not a
      // press-to-talk exchange.
      if (gotFinal && autoCommitRef.current && finalTextRef.current.trim()) {
        wantListeningRef.current = false;
        try { rec.stop(); } catch {}
        setState(ConvState.IDLE);
        onCommit?.(finalTextRef.current.trim());
      }
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch {}
  }, [onInterim, onCommit, stopBargeIn]);

  const stopListening = useCallback(() => {
    wantListeningRef.current = false;
    recognitionRef.current?.stop();
    setState((s) => (s === ConvState.LISTENING ? ConvState.IDLE : s));
    const text = finalTextRef.current.trim();
    setTimeout(() => { if (text) onCommit?.(text); }, 300);
  }, [onCommit]);

  // Arms a quiet background recognizer while the mentor is speaking. Works
  // best with headphones — without them the mic can pick up the mentor's
  // own voice through the speakers, so this is best-effort and paired with
  // an always-visible manual interrupt() as the reliable fallback.
  const armBargeIn = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = "en-US"; rec.interimResults = true; rec.continuous = true;
      rec.onresult = (e) => {
        const heard = e.results[e.resultIndex]?.[0]?.transcript?.trim();
        if (heard && heard.length > 2) {
          setState(ConvState.INTERRUPTED);
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          stopBargeIn();
          startListening(true);
        }
      };
      rec.onerror = () => {};
      rec.start();
      bargeRef.current = rec;
    } catch {}
  }, [startListening, stopBargeIn]);

  const speak = useCallback((text) => {
    if (mutedRef.current || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, "");
    const u = new SpeechSynthesisUtterance(clean);
    const profile = mentorVoiceProfile(mentorRef.current);
    const v = pickVoice(profile.voiceNames); if (v) u.voice = v;
    u.rate = profile.rate; u.pitch = profile.pitch;
    u.onstart = () => { setState(ConvState.SPEAKING); armBargeIn(); };
    u.onend = () => { stopBargeIn(); setState((s) => (s === ConvState.SPEAKING ? ConvState.IDLE : s)); };
    u.onerror = () => { stopBargeIn(); setState(ConvState.IDLE); };
    window.speechSynthesis.speak(u);
  }, [armBargeIn, stopBargeIn]);

  // The always-visible manual fallback: stop the mentor and start listening,
  // regardless of whether barge-in caught it.
  const interrupt = useCallback(() => {
    stopSpeaking();
    startListening(true);
  }, [stopSpeaking, startListening]);

  const setThinking = useCallback(() => setState(ConvState.THINKING), []);
  const setIdle = useCallback(() => setState(ConvState.IDLE), []);

  useEffect(() => () => { stopBargeIn(); recognitionRef.current?.stop(); }, [stopBargeIn]);

  return {
    state, error,
    listening: state === ConvState.LISTENING,
    speaking: state === ConvState.SPEAKING,
    thinking: state === ConvState.THINKING,
    speak, stopSpeaking, startListening, stopListening, interrupt,
    setThinking, setIdle,
  };
}
