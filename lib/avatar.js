// Every mentor's visual identity is a flat monogram (first letter of their
// name) instead of an illustrated avatar — see components/mentor/AIAvatar.jsx,
// the one component that renders it everywhere in the app.
export function mentorInitial(name) {
  const trimmed = (name || "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}
