// Maps a mentor's declared role (for the three built-in mentors) or a
// light keyword read of their personality text (for custom "Create your
// own" mentors) to a speech pitch/rate and a preferred browser-voice
// shortlist. Web Speech API voice *availability* varies wildly by browser/
// OS, so pitch/rate — which always work — carry the real differentiation;
// the voice name list is a best-effort bonus on top.
export function mentorVoiceProfile(mentor) {
  const role = (mentor?.role || "").toLowerCase();

  if (role.includes("dreamer")) {
    return { pitch: 1.25, rate: 0.92, voiceNames: ["Google UK English Female", "Samantha", "Microsoft Aria"] };
  }
  if (role.includes("scientist")) {
    return { pitch: 1.05, rate: 1.08, voiceNames: ["Microsoft Jenny", "Google US English", "Microsoft Zira"] };
  }
  if (role.includes("stargazer")) {
    return { pitch: 0.85, rate: 0.88, voiceNames: ["Microsoft Guy", "Google UK English Male", "Daniel"] };
  }

  // Custom mentors: nudge a neutral baseline using whatever the student
  // wrote in the personality field, so "a calm old wizard" and "a bouncy
  // funny robot" don't sound identical.
  const text = `${mentor?.personality || ""} ${mentor?.tagline || ""}`.toLowerCase();
  let pitch = 1.1;
  let rate = 0.95;
  if (/funny|silly|joke|goofy|playful/.test(text)) { pitch += 0.15; rate += 0.08; }
  if (/calm|gentle|slow|patient|soothing|peaceful/.test(text)) { pitch -= 0.1; rate -= 0.08; }
  if (/robot|machine|android/.test(text)) { pitch -= 0.08; rate -= 0.04; }
  if (/wise|old|ancient|sage|wizard/.test(text)) { pitch -= 0.15; rate -= 0.1; }
  if (/energetic|excited|bouncy|hyper|fast/.test(text)) { pitch += 0.1; rate += 0.12; }
  pitch = Math.max(0.6, Math.min(1.6, pitch));
  rate = Math.max(0.7, Math.min(1.3, rate));
  return { pitch, rate, voiceNames: ["Google UK English Female", "Microsoft Aria", "Samantha"] };
}
