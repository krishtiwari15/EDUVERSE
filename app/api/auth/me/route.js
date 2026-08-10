import { sql, getSessionUser, publicUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser(sql());
  return Response.json({ user: publicUser(user) });
}
