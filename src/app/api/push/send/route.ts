import webpush from "web-push";
import { NextResponse } from "next/server";
import { deletePushSubscription, getAllPushSubscriptions } from "@/lib/push-db";

export const dynamic = "force-dynamic";

const BATCH_SIZE = 25;
const MESSAGE = JSON.stringify({
  title: "Time for your daily quiz 🧠",
  body: "Keep your streak alive!",
  url: "/",
});

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "VAPID keys are not configured." }, { status: 500 });
  }

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:you@example.com",
      publicKey,
      privateKey,
    );

    const subscriptions = await getAllPushSubscriptions();
    let sent = 0;
    let failed = 0;
    let removed = 0;

    for (let index = 0; index < subscriptions.length; index += BATCH_SIZE) {
      const batch = subscriptions.slice(index, index + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (subscription) => {
          try {
            await webpush.sendNotification(subscription, MESSAGE);
            return "sent" as const;
          } catch (error) {
            const statusCode =
              error && typeof error === "object" && "statusCode" in error
                ? (error as { statusCode?: unknown }).statusCode
                : undefined;

            if (statusCode === 404 || statusCode === 410) {
              await deletePushSubscription(subscription.endpoint);
              return "removed" as const;
            }

            console.error("Push notification delivery failed:", error);
            return "failed" as const;
          }
        }),
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          if (result.value === "sent") sent += 1;
          else if (result.value === "removed") removed += 1;
          else failed += 1;
        } else {
          failed += 1;
          console.error("Push notification batch task failed:", result.reason);
        }
      }
    }

    return NextResponse.json({ sent, failed, removed });
  } catch (error) {
    console.error("Push notification job failed:", error);
    return NextResponse.json({ error: "Push notification job failed." }, { status: 500 });
  }
}