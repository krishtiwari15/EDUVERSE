import { sql, clearSession } from "@/lib/auth";

export async function POST() {
  await clearSession(sql());
  return Response.json({ ok: true });
}
