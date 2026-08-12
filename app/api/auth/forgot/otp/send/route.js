import { sql, generateOtp, hashOtp } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const OTP_TTL_MIN = 10;
const RESEND_COOLDOWN_SEC = 60;

// Step 1 of email-based recovery: mint a 6-digit code, store only its
// hash (same principle as passwords — never keep the real code at rest),
// and email it. Works for any account with a valid email, unlike the
// security-question flow which only helps students who set one up.
export async function POST(req) {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) return Response.json({ ok: false, error: "Enter your email." }, { status: 400 });

  const db = sql();
  const users = await db`SELECT id, name FROM users WHERE email = ${cleanEmail}`;
  const user = users[0];
  if (!user) return Response.json({ ok: false, error: "No account found with that email." }, { status: 404 });

  const recent = await db`
    SELECT created_at FROM password_reset_otps
    WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
  `;
  if (recent[0] && Date.now() - new Date(recent[0].created_at).getTime() < RESEND_COOLDOWN_SEC * 1000) {
    return Response.json({ ok: false, error: "A code was just sent — wait a minute before requesting another." }, { status: 429 });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
  await db`
    INSERT INTO password_reset_otps (user_id, code_hash, expires_at)
    VALUES (${user.id}, ${hashOtp(code)}, ${expiresAt})
  `;

  try {
    await sendEmail({
      to: cleanEmail,
      subject: "Your EduVerse password reset code",
      html: `<p>Hi ${user.name || "there"},</p><p>Your EduVerse password reset code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p><p>This code expires in ${OTP_TTL_MIN} minutes. If you didn't request this, you can ignore this email.</p>`,
      text: `Your EduVerse password reset code is ${code}. It expires in ${OTP_TTL_MIN} minutes.`,
    });
  } catch (err) {
    return Response.json({ ok: false, error: `Couldn't send the email: ${err.message}` }, { status: 502 });
  }

  return Response.json({ ok: true });
}
