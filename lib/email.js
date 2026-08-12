// Thin wrapper around Resend's REST API — same pattern as the callGroq()
// helper used for chat: a plain fetch, no SDK dependency. Requires
// RESEND_API_KEY in the environment; RESEND_FROM_EMAIL is optional and
// defaults to Resend's own unverified-domain test sender, which only
// delivers to the address that owns the Resend account until a real
// sending domain is verified there.
const DEFAULT_FROM = "EduVerse <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured — add it to .env.local to enable email sending.");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [to],
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json();
}
