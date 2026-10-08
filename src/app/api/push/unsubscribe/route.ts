import { NextResponse } from "next/server";
import { deletePushSubscription } from "@/lib/push-db";
import { getAuthSession } from "@/lib/auth-session";

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { endpoint?: unknown }).endpoint !== "string" ||
    !(body as { endpoint: string }).endpoint
  ) {
    return NextResponse.json({ error: "A subscription endpoint is required." }, { status: 400 });
  }

  try {
    await deletePushSubscription((body as { endpoint: string }).endpoint, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not remove push subscription:", error);
    return NextResponse.json({ error: "Could not remove push subscription." }, { status: 500 });
  }
}
