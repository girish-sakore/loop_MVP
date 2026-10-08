import { NextResponse } from "next/server";
import {
  savePushSubscription,
  type StoredPushSubscription,
} from "@/lib/push-db";
import { getAuthSession } from "@/lib/auth-session";

function isValidSubscription(value: unknown): value is StoredPushSubscription {
  if (!value || typeof value !== "object") return false;
  const subscription = value as Partial<StoredPushSubscription>;
  return (
    typeof subscription.endpoint === "string" &&
    subscription.endpoint.length > 0 &&
    !!subscription.keys &&
    typeof subscription.keys.p256dh === "string" &&
    subscription.keys.p256dh.length > 0 &&
    typeof subscription.keys.auth === "string" &&
    subscription.keys.auth.length > 0
  );
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isValidSubscription(body)) {
    return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  }

  try {
    await savePushSubscription(session.user.id, body, request.headers.get("user-agent"));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not save push subscription:", error);
    return NextResponse.json({ error: "Could not save push subscription." }, { status: 500 });
  }
}
