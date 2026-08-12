import { createAvatar } from "@dicebear/core";
import * as adventurer from "@dicebear/adventurer";

// Fallback used only if avatar generation ever fails (e.g. no name yet).
export function mentorInitial(name) {
  const trimmed = (name || "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

// Every mentor's face — a deterministic, locally-generated illustration
// (DiceBear's "adventurer" set), seeded on their name so the same mentor
// always gets the same face across sessions. Nothing fetched from a
// network, nothing depicting a real person.
export function mentorAvatarUri(name) {
  const seed = (name || "mentor").trim() || "mentor";
  const avatar = createAvatar(adventurer, {
    seed,
    backgroundType: ["gradientLinear"],
    backgroundColor: ["transparent"],
  });
  return avatar.toDataUri();
}
