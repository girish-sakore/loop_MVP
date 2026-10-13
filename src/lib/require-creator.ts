import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";

const allowed = (process.env.CREATOR_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type Result =
  | { ok: true; email: string; userId: string }
  | { ok: false; response: NextResponse };

/** Use at the top of every /api/admin/* route. Swap the check for a role later. */
export async function requireCreator(): Promise<Result> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const email = session.user.email.toLowerCase();
  if (!allowed.includes(email)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true, email, userId: session.user.id };
}