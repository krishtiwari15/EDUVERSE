import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";

// Every mentor's look is generated from its name — the same name always
// produces the same avatar, so it doesn't need to be stored anywhere.
export function mentorAvatar(seed) {
  return createAvatar(bottts, {
    seed: `oxidium-${seed}`,
    backgroundType: ["gradientLinear"],
    radius: 20,
  }).toDataUri();
}
